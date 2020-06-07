# MasKontrol
 #### *One mask to control them  all.*

The project is divided into three parts :
- A Node.js / TypeScript server that allows to convert any type of content into *sequences*, and send them to the Python server.
- The Python server that receives its orders from the Node.js server, reads the sequences and displays them on the LED strips of the mask.
- The React front-end, that allows me to map the LED strips, and provides a user-friendly interface for creating sequences, sequence lists, handle sequences loops, manage the mask luminosity settings, and more.

---------------------------------------------
In order to make the mask fully wearable, I use a RaspberryPi 4 that emits its own WiFi newtork, runs both servers and exposes the React front-end so that the mask can be controlled from any device connected to the Pi.

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

