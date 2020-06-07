################################################################################
############################### START THE SERVER ###############################
################################################################################

import random
from flask import Flask, escape, request, send_from_directory
from flask_cors import CORS
import mask
import json
from os import listdir
from os.path import isfile, join

app = Flask("MasKontrol")
CORS(app)

################################################################################
################################ INIT THE MASK #################################
################################################################################

@app.route('/init',  methods=['POST'])
def init():
	if request.is_json == False:
		return json.dumps({"success" : False, "error": "Please provide a json object in the request"})
	content = request.get_json()
	if content['GPIO'] and content['LED_COUNT'] and content['MAX_BRIGHTNESS']:
		try:
			mask.init(content['GPIO'], content['LED_COUNT'], content['MAX_BRIGHTNESS'])
			return json.dumps({ "success": True })
		except:
			return json.dumps({"success": False, "error" : "Failed while trying to execute init"})
	else:
		return json.dumps({"success": False, "error" : "Please provide a GPIO, LED_COUNT and MAX_BRIGHTNESS"})

################################################################################
################################## KEEPALIVE ###################################
################################################################################

@app.route('/ping')
def ping():
	return json.dumps({ "pong": True })


################################################################################
############################ SEQUENCES MANAGEMENT ##############################
################################################################################

@app.route('/getList',  methods=['GET'])
def getList():
	name = request.args.get('name');
	return send_from_directory('./sequences/lists', name + '.json')

@app.route('/downloadSequence',  methods=['POST'])
def downloadSequence():
	name = request.args.get('name');
	return mask.downloadSequence(request.stream, name)


@app.route('/saveList',  methods=['POST'])
def saveSequences():
	if request.is_json == False:
		return json.dumps({"success" : False, "error": "Please provide a json object in the request"})
	content = request.get_json()
	if content['sequences'] and content['name']:
		list = open("sequences/lists/" + content['name'] + ".json", "w")
		list.write(json.dumps(content))
		return json.dumps({ "success": True })
	else:
		return json.dumps({"success": False, "error" : "Please provide a sequence array and some meta"})


@app.route('/playList',  methods=['POST'])
def playList():
	if request.is_json == False:
		return json.dumps({"success" : False, "error": "Please provide a json object in the request"})
	content = request.get_json()
	if content['name']:
		with open("./sequences/lists/" + content['name'] + '.json') as json_file:
			data = json.load(json_file)
			print(data)
			return mask.playSequences(data['sequences'], data['meta'])
	else:
		return json.dumps({"success": False, "error" : "Please provide a sequence array and some meta"})

@app.route('/getLists',  methods=['GET'])
def getLists():
	lists = [f for f in listdir('./sequences/lists/') if isfile(join('./sequences/lists/', f))]
	return json.dumps({"success": True, "lists": lists})



# Set the color of one pixel
@app.route('/playSequences',  methods=['POST'])
def playSequences():
	if request.is_json == False:
		return json.dumps({"success" : False, "error": "Please provide a json object in the request"})
	content = request.get_json()
	if content['sequences']:
		mask.playSequences(content['sequences'], content['meta'])
		return json.dumps({ "success": True })
	else:
		return json.dumps({"success": False, "error" : "Please provide a sequence array and some meta"})



################################################################################
############################## PIXEL COLORATION ################################
################################################################################

# Set the color of one pixel
@app.route('/setPixelColor',  methods=['POST'])
def setPixelColor():
	if request.is_json == False:
		return json.dumps({"success" : False, "error": "Please provide a json object in the request"})
	content = request.get_json()
	if content['pixelIndex'] and content['color']:
		if 'R' in content['color'] and 'G' in content['color'] and 'B' in content['color']:
			mask.setPixelColor(content['pixelIndex'], content['color'])
			return json.dumps({ "success": True })
		else:
			return json.dumps({"success": False, "error" : "Color must be contain a value for R,G and B"})
	else:
		return json.dumps({"success": False, "error" : "Please provide a pixelIndex, and color"})

# Set the color of many pixels
@app.route('/setPixelsColor',  methods=['POST'])
def setPixelsColor():
	if request.is_json == False:
		return json.dumps({"success" : False, "error": "Please provide a json object in the request"})
	content = request.get_json()
	if content['strip']:
		for pixel in content['strip']:
			if 'index' not in pixel or 'color' not in pixel:
				return json.dumps({"success": False, "error" : "Please make sure every pixel is given with an index and a color"})
			else:
				if 'R' not in pixel['color'] or 'G' not in pixel['color'] or 'B' not in pixel['color']:
					return json.dumps({"success": False, "error" : "Color must be contain a value for R,G and B"})
		mask.setPixelsColor(content['strip'])
		return json.dumps({ "success": True })
	else:
		return json.dumps({"success": False, "error" : "strip must be an array"})

# Rendering the LED strip
@app.route('/fill',  methods=['POST'])
def fill():
	if request.is_json == False:
		return json.dumps({"success" : False, "error": "Please provide a json object in the request"})
	content = request.get_json()
	if content['color']:
		if 'R' in content['color'] and 'G' in content['color'] and 'B' in content['color']:
			mask.fill(content['color'])
			return json.dumps({ "success": True })
	else:
		return json.dumps({"success": False, "error" : "Please provide a color in the RGB format"})

# Rendering the LED strip
@app.route('/kill')
def kill():
	try:
		mask.setKill()
		return json.dumps({ "success": True })
	except:
		return json.dumps({"success": False, "error" : "Failed while trying to kill"})

# Rendering the LED strip
@app.route('/render',  methods=['POST'])
def render():
	mask.render()
	return json.dumps({ "success": True })

mask.init()

app.run(host= '0.0.0.0', port=5000)
