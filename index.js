import PlayerControl from "./src/index.js";

var options = {
  wsURL: "ws://localhost:15555",
  rtspURL:
    "rtsp://192.168.1.108/cam/realmonitor?channel=1&subtype=0;proto=Onvif",
  username: "admin",
  password: "vision0864",
};

let player = new PlayerControl(options);
player.on("Error", (j) => {
  if (j) console.log(j.errorCode);
});
player.init(document.querySelector("#videoplayer"));
player.connect();
