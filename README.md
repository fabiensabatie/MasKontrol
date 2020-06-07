# MasKontrol
 #### *One mask to control them  all.*

The project is divided into three parts :
- **A Node.js / TypeScript server** that allows to convert any type of content into *sequences*, and send them to the Python server.
- **The Python server** that receives its orders from the Node.js server, reads the sequences and displays them on the LED strips of the mask.
- **The React front-end**, that allows me to map the LED strips, and provides a user-friendly interface for creating sequences, sequence lists, handle sequences loops, manage the mask luminosity settings, and more.

---------------------------------------------
In order to make the mask fully wearable, I use a RaspberryPi 4 that emits its own WiFi newtork, runs both servers and exposes the React front-end so that the mask can be controlled from any device connected to the Pi.

### The hardware

![image](https://i.giphy.com/j654Uetox6m3o1kGhG.gif)

The mask is built with SK6812 leds strips, for a total of 864 leds, and is powered by height 18660 batteries.

### Special thanks

I must thank [@wow_elec_tron](https://www.instagram.com/wow_elec_tron/) for his special help. You can also find all his work [here](https://github.com/leonyuhanov) (Github), and on his [website](https://wow.elec-tron.org/). Thanks again mate !

## The custom sequence format

In order for the Pi to display the correct RGB value on the LED strips, I use my own custom binary format (.seq), structured as such :

- 8 header bytes for the number of frames
- 1 header byte for the frames width
- 1 header byte for the frames height
- 1 header byte for the brightness ratio
- 1 header byte for the playback speed
- 8 header byte for map size
- The LED map : an array of the index of each mapped pixel converted to an 8 bytes int.
- The body (the actual frames) : each pixel of every frame is converted to a 3 bytes RGB value.

The format is very basic and could be much more lightweight. I could store differences between each frame instead of storing each frame. But as all the content is converted to a series 46x23 images, each sequence is actually already very light. A simple GIF weight less than a mega-octet. A 5 minutes videos is a converted to a 10mo sequence, which is good enough atm.

The current stack allows me to convert any content direclty taken from Giphy / Youtube from their url, or any content already on my hard drive. 

## The Node.JS - TypeScript webserver

The server exposes the following routes :

| Method | Route | Description | Parameters |
|--|--|--|--|
| GET | /sequences | Lists all available sequences (all .seq files within the __SEQUENCES_FOLDER folder)
| GET | /sequences/:name | Fetches a specific sequence by filename | **name** (*string*)
| PUT | /sequences/:name | Updates the sequences metadata | **brightness** *(number - 0-255)*,  **speed** *(number - 0-100)*
| POST | /sequences/download/:name | Downloads a sequence to the Raspberry Pi (in cases I converted in on another PC) | **name** (*string*)
| POST | /videoConverter | Converts a file sent through the HTML form of the React front-end into the sequence format | The HTML files fields.
| POST | /onlineConverter | Converts a file downloaded through an URL into the sequence format. | **url** (*string*), **name** (*string, optionnal*)
| GET | /settings | Fetches the project settings (the LED map, Mask default brightness, playback speed, etc). | **url** (*string*), **name** (*string, optionnal*)
| POST | /settings | Updates the settings | **server_url** (*string*), **pi_url** (*string*), **led_count** (*number*), **gpio** (*number, deprecated*), **maxBrightness** (*string*), **width** (*number*), **height** (*number*), **map** (*Array\<number>*), **guiBrightness** (*number*),  **guiContrast**  (*number*), **guiSaturation** (*number*)
| GET | /thumbnails | Serves the sequences thumbnails for the front-end to display | **url** (*string*), **name** (*string, optionnal*)


To run the server :

```
npm run dev # For development mode
npm run prod # For production mode
```

## The Python server

The server plays two roles, handle sequences and sequence lists, and display them on the Mask using the [rpi_ws281x](https://github.com/jgarff/rpi_ws281x) library.

The server exposes the following routes using Flask :

| Method | Route | Description | Parameters |
|--|--|--|--|
| POST | /init | Initializes the Mask (with the correct GPIO, LED count, etc.) | **GPIO** (*number, deprecated*), **LED_COUNT** (*number*), **MAX_BRIGHTNESS** (*number : 0-255*)
| GET | /ping | Pings the Mask to know if it's alive |
| POST | /downloadSequence | Downloads a sequence on the Pi | **stream** (stream - the actual file), **name** (string) 
| POST | /saveList | Saves a list of sequences with their meta into a file | **sequences** (Array\<string> - an list of sequence names), **meta** (*Array\<object> - a list of meta-data*) 
| POST | /playList | Plays a sequence list | **name** (*string - the list name*)
| GET | /getLists | Fetches a list of the available sequence lists |
| GET | /getList | Fetches a specific list | **name** (*string - the list name*)
| POST | /playSequences | Plays a sequence | **sequence** (*string - the sequence name*), **meta** (*object - the metadata*) 

To run the server :

```
sudo python3 server.py
```

#### The meta-data object :
Allows me to over-ride some of the parameters within the sequence file, and provide information about the way I want to play it. It is a simple JSON object with the following fields :

| Field | Description | Type
|--|--|--|
| brightness | The brightness to use | *Optionnal - number - 0/255*
| speed | The playback speed to use | *Optionnal - number - 0/255*
| loop_count | The number of times the sequence will run | *Optionnal - number - default is 1 and overrides loop_until*
| loop_until | The amount of time the sequence will run for in seconds | *Optionnal - number*

## The React front-end

A friendly user-friendly interface that interacts with the two previously described servers. It allows me to map the LEDs using a simple THREE.js application. They are automatically mapped from left to right, top to bottom, as I won't need to make any change to my soldering anytime soon.

The front-end also allows me to convert any content easily without having to send requests to the servers, play my sequences directly from my phone, build and save sequence lists, define the meta-data for each sequence within the list.


To run the front-end :

```
cd web_interface && npm run dev # For development mode
cd web_interface && npm run prod # For production mode
```

## Next steps

Ideally, the front-end should be better looking than it is right now, and the Python webserver should be refactored in C for better performance. I also need to implement a shader / animation system, and FFT for sound reaction.
