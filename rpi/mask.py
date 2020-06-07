# MASK V.1.0
import time
import math
import _rpi_ws281x as ws
import atexit
import json
import datetime

################################################################################
############################# ENVIRONMENT INIT #################################
################################################################################

LED_CHANNEL		= 0
LED_COUNT		= 0		 # How many LEDs to light.
LED_FREQ_HZ 	= 800000	# Frequency of the LED signal.  Should be 800khz or 400khz.
LED_DMA_NUM		= 10		# DMA channel to use, can be 0-14.
LED_GPIO		= [18, 13]		# GPIO connected to the LED signal line.  Must support PWM!
LED_BRIGHTNESS	= 10		# Set to 0 for darkest and 255 for brightest
LED_INVERT		= 0		# Set to 1 to invert the LED signal, good if using NPN transistor as a 3.3V->5V level converter.  Keep at 0 for a normal/non-inverted signal.
LED_STRIP		= ws.SK6812W_STRIP
LEDS            = False
CHANNEL         = False
KILL            = False
RENDERING       = 0

################################################################################
############################# COLORING METHODS #################################
################################################################################

def rgb2hex(red, green, blue):
	return int('0x00%02x%02x%02x' % (red, green, blue), 16)

################################################################################
############################## PIXEL CONTROL ###################################
################################################################################

def setPixelColor(pixelIndex, color, brightness = 100):
	global CHANNEL
	color['R'] = math.floor(color['R'] * brightness/100)
	color['G'] = math.floor(color['G'] * brightness/100)
	color['B'] = math.floor(color['B'] * brightness/100)
	chan = CHANNEL[0] if pixelIndex < 420 else CHANNEL[1]
	pix = pixelIndex if pixelIndex < 420 else pixelIndex - 420
	col = rgb2hex(color['R'], color['G'], color['B'])
	ws.ws2811_led_set(chan, pix, col)

def setPixelsColor(strip):
	for pixel in strip:
		setPixelColor(pixel['index'], pixel['color'])

def fill(color):
	for i in range(LED_COUNT):
		setPixelColor(i, color)

def renderFrame(mapping, brightness, width, height, frame):
	for y in range(height):
		for x in range(width):
			pixelIndex = width * y + x
			colorIndex = pixelIndex * 3;
			if pixelIndex in mapping:
				setPixelColor(mapping.index(pixelIndex), {"R": frame[colorIndex], "G" :frame[colorIndex + 1] , "B" : frame[colorIndex + 2]}, brightness)
	render()

def spentDuration(start):
	return (float(datetime.datetime.now().strftime("%Y%m%d%H%M%S")) - start)

def downloadSequence(stream, name):
	sequence = open("sequences/" + name, 'wb')

	while True:
		a = stream.read(100)
		if not a: break
		sequence.write(a)
	stream.close()
	return json.dumps({"success": True})

def readFromStream(stream, meta):
	global KILL
	frames = int.from_bytes(bytearray(stream.read(8)), byteorder='big', signed=False)
	width = int.from_bytes(stream.read(1), "big")
	height = int.from_bytes(stream.read(1), "big")
	brightness = int.from_bytes(stream.read(1), "big")
	speed = int.from_bytes(stream.read(1), "big")
	mapSize = int.from_bytes(bytearray(stream.read(8)), byteorder='big', signed=False)
	mapping = []
	fullFrames = []
	clockStart = float(datetime.datetime.now().strftime("%Y%m%d%H%M%S"))
	way = 0
	brightness = meta["brightness"] if "brightness" in meta else brightness
	speed = meta["speed"] if "speed" in meta else speed
	alive = True;


	for i in range(frames):
		fullFrames.append(False)

	for i in range(mapSize):
		mapping.append(int.from_bytes(bytearray(stream.read(8)), byteorder='big', signed=False))
	if not frames or not width or not height or not brightness or not speed:
		return {"success": False, "error" : "The sequence is corrupted"}
	while (alive and (meta["loop_count"] if "loop_count" in meta else (spentDuration(clockStart) < float(meta["loop_until"]) if "loop_until" in meta else way == 0))):
		print(way)
		for f in range(frames):
			if (KILL == True):
				print('kill was called')
				return { "success": True, "killed" : True }
			fIndex = (frames - f - 1) if ("loop_mode" in meta and meta['loop_mode'] == 'reversed' and way % 2) else f
			frame = stream.read(width * height * 3) if fullFrames[fIndex] == False else fullFrames[fIndex]
			if (fullFrames[fIndex] == False):
				fullFrames[f] = frame
			renderFrame(mapping, brightness, width, height, frame)
			time.sleep(1/speed)
			if ("loop_count" not in meta and "loop_until" in meta and spentDuration(clockStart) >= meta["loop_until"]):
				way = 0
				alive = False
				break
		if "loop_count" in meta:
			meta["loop_count"] = meta["loop_count"] - 1
		way += 1
	return { "success": True }

def playSequenceList(name):
	with open(name + '.json') as json_file:
		data = json.load(json_file)

def playSequences(sequences, meta):
	global KILL
	global RENDERING

	if (RENDERING > 0):
		print("Must kill")
		setKill()
		time.sleep(0.1)
		print("Killed")
		unsetKill()
		print("Let space for other")
	RENDERING += 1
	sequenceMeta = []
	for i in range(len(sequences)):
		sequence = sequences[i]
		sequenceMeta = meta[i]
		with open("./sequences/" + sequence + ".seq", "rb") as stream:
			result = readFromStream(stream, sequenceMeta)
			if ("killed" in result):
				RENDERING -= 1
				print("Killing in playSequences")
				return json.dumps(result) if RENDERING > 0 else unsetKill()
			if (result["success"] == False):
				RENDERING -= 1
				unsetKill()
				return json.dumps(result)
	RENDERING -= 1
	fill({"R" : 0, "G" : 0, "B": 0})
	render()
	return json.dumps({ "success": True })

def render():
	global LEDS
	resp = ws.ws2811_render(LEDS)
	if resp != ws.WS2811_SUCCESS:
		message = ws.ws2811_get_return_t_str(resp)
		raise RuntimeError('ws2811_render failed with code {0} ({1})'.format(resp, message))


################################################################################
################################## MASK BOOTUP #################################
################################################################################

def init(maxBrightness = 10):
	global LED_COUNT
	global LED_BRIGHTNESS
	global LED_GPIO
	global CHANNEL
	global LEDS


	if (LEDS == False):
		LEDS = ws.new_ws2811_t()
	else:
		# Ensure ws2811_fini is called before the program quits.
		ws.ws2811_fini(LEDS)
		# Example of calling delete function to clean up structure memory.  Isn't
		# strictly necessary at the end of the program execution here, but is good practice.
		ws.delete_ws2811_t(LEDS)
		LEDS = ws.new_ws2811_t()

	SPLIT_LED_COUNT = [420, 402]
	LED_COUNT = 420 + 402
	LED_BRIGHTNESS = maxBrightness
	LED_GPIO = [18, 13]
	CHANNEL = []
	LED_CHANNEL = [0, 1]
	# Create a ws2811_t structure from the LED configuration.
	# Note that this structure will be created on the heap so you need to be careful
	# that you delete its memory by calling delete_ws2811_t when it's not needed.


	# Initialize all channels to off
	for channum in range(2):
		channel = ws.ws2811_channel_get(LEDS, channum)
		ws.ws2811_channel_t_count_set(channel, 0)
		ws.ws2811_channel_t_gpionum_set(channel, 0)
		ws.ws2811_channel_t_invert_set(channel, 0)
		ws.ws2811_channel_t_brightness_set(channel, 0)

		CHANNEL.append(ws.ws2811_channel_get(LEDS, channum))

		ws.ws2811_channel_t_count_set(CHANNEL[channum], SPLIT_LED_COUNT[channum])
		ws.ws2811_channel_t_gpionum_set(CHANNEL[channum], LED_GPIO[channum])
		ws.ws2811_channel_t_invert_set(CHANNEL[channum], LED_INVERT)
		ws.ws2811_channel_t_brightness_set(CHANNEL[channum], LED_BRIGHTNESS)
		ws.ws2811_channel_t_strip_type_set(CHANNEL[channum], LED_STRIP)

	ws.ws2811_t_freq_set(LEDS, LED_FREQ_HZ)
	ws.ws2811_t_dmanum_set(LEDS, LED_DMA_NUM)

	# Initialize library with LED configuration.
	resp = ws.ws2811_init(LEDS)
	if resp != ws.WS2811_SUCCESS:
		message = ws.ws2811_get_return_t_str(resp)
		raise RuntimeError('ws2811_init failed with code {0} ({1})'.format(resp, message))

	fill({"R" : 0, "G" : 0, "B": 0})
	render()
	print('Initialized ✓')


def setKill():
	global KILL
	global RENDERING
	if (RENDERING > 0):
		KILL = True
		fill({"R": 0, "G": 0, "B": 0})
		render()
	return json.dumps({ "success": True })

def unsetKill():
	global KILL
	KILL = False
	fill({"R": 0, "G": 0, "B": 0})
	render()
	return json.dumps({ "success": True })
