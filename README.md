# RTSP Player with WebSocket

### RTSP over WS
Stream RTSP over websocket and use RTSP direclty in web browser. 

First start the websocket using [websocketify](https://github.com/novnc/websockify-js).

```sh
cd websockify
node .\websockify.js 15555 <rtsp_host>:<rtsp_port_554>
```

Then in the code

```html
<video width=400 height=400 id="videoplayer"></video>
```

```js
import PlayerControl from './src/index.js';

var options = {
    wsURL: "ws://localhost:15555/",
    rtspURL: "rtsp://<rtsp_url>:<rtsp_port>/cam/realmonitor?channel=1&subtype=0",
    username: "",
    password: ""
}

let player = new PlayerControl(options)
player.on("Error", (j) => { if (j) console.log(j.errorCode) })
player.init(document.querySelector("#videoplayer"))
player.connect()
```

NOTE: Audio is currently not supported and video stream is laggy. This is a working PoC for video stream. Audio Streaming is also possible.

### Tested on some ...
- Dahua Cameras
- HikVision Camera

### Notice
This project is made possible by using RTSP over WebSocket functionality implemented by Dahua for their IP Cameras. Code available in this project is extracted from an Dahua IP Camera and made to work standalone. We have no intent to commercialize this project.

### Credits
 - [H5player_RTSP_over_websocket](https://github.com/LiHaifeng1995/H5player_RTSP_over_websocket)
 - Dahua