"use strict";

function receiveMessage(event) {
  var message = event.data;
  switch (((channelId = event.data.channelId), message.type)) {
    case "sdpInfo":
      (sdpInfo = message.data), (framerate = 0), setVideoRtpSession(sdpInfo);
      break;
    case "rtpDataArray":
      for (let num = 0; num < message.data.length; num++) {
        receiveMessage({
          type: "rtpData",
          data: message.data[num],
        });
      }
      break;
    case "rtpData":
      if (isStepPlay === !0) {
        buffering(message);
        break;
      }
      (videoCHID = message.data.rtspInterleave[1]),
        "undefined" != typeof videoRtpSessionsArray[videoCHID] &&
          videoRtpSessionsArray[videoCHID].parseRTPData(
            message.data.header,
            message.data.payload
          );
      break;
    case "initStartTime":
      videoRtpSessionsArray[videoCHID].initStartTime();
  }
}

function setVideoRtpSession(options) {
  videoRtpSessionsArray = [];
  isStepPlay = false;
  var tabControl = 0;
  for (; tabControl < options.sdpInfo.length; tabControl++) {
    rtpSession = null;
    decodeMode = options.decodeMode;
    if ("undefined" !== typeof options.sdpInfo[tabControl].Framerate) {
      framerate = options.sdpInfo[tabControl].Framerate;
    } else {
      framerate = 25;
    }

    if ("H264" === options.sdpInfo[tabControl].codecName) {
      if (null === h264Session) {
        h264Session = H264Session();
      }
      rtpSession = h264Session;
      rtpSession.init(options.decodeMode);
      rtpSession.setFramerate(framerate);
      rtpSession.setGovLength(options.govLength);
      rtpSession.setCheckDelay(options.checkDelay);
    }

    if (null !== rtpSession) {
      rtpSession.setBufferfullCallback(BufferFullCallback);
      rtpSession.rtpSessionCallback = RtpReturnCallback;
      videoCHID = options.sdpInfo[tabControl].RtpInterlevedID;
      videoRtpSessionsArray[videoCHID] = rtpSession;
    }
  }
}
function buffering(a) {
  (videoCHID = a.data.rtspInterleave[1]),
    "undefined" != typeof videoRtpSessionsArray[videoCHID] &&
      videoRtpSessionsArray[videoCHID].bufferingRtpData(
        a.data.rtspInterleave,
        a.data.header,
        a.data.payload
      );
}

function BufferFullCallback() {
  videoRtpSessionsArray[videoCHID].findCurrent(),
    sendMessage("stepPlay", "BufferFull");
}

function RtpReturnCallback(dataInfo) {
  if (dataInfo == null || dataInfo == undefined) {
    return;
  }
  let mediaData = dataInfo;

  if (
    mediaData.initSegmentData !== null &&
    mediaData.initSegmentData !== undefined
  ) {
    sendMessage("codecInfo", mediaData.codecInfo);
    sendMessage("initSegment", mediaData.initSegmentData);

    //sendMessage("videoInit", mediaData);
    //sendMessage("firstvideoTimeStamp", mediaData.timeStamp);
  } else if (mediaData.SEIInfo !== null && mediaData.SEIInfo !== undefined) {
    //SEI信息
    sendMessage("SEI", mediaData.SEIInfo);
  }

  if (mediaData.frameData && mediaData.frameData.length > 0) {
    let payload = {
      codecType: mediaData.frameData.codecType,
    };
    if ("undefined" != typeof mediaData.frameData.width) {
      payload.width = mediaData.frameData.width;
      payload.height = mediaData.frameData.height;
    }
    sendMessage("videoInfo", payload);

    sendMessage("videoTimeStamp", mediaData.timeStamp);
    sendMessage("mediaSample", mediaData.mediaSample);
    sendMessage("videoRender", mediaData.frameData);
  }
  mediaData = null;
}

// function RtpReturnCallback(a) {
//   var b = null,
//     c = null;
//   if (null === a || "undefined" == typeof a) return (b = null), void (c = null);
//   if (
//     ("undefined" != typeof a.error
//       ? (sendMessage("error", a.error), (b = a.decodedData))
//       : ((b = a.decodedData),
//         null !== a.decodeMode &&
//           "undefined" != typeof a.decodeMode &&
//           ((decodeMode = a.decodeMode),
//           sendMessage("setVideoTagMode", a.decodeMode))),
//     null !== b && "undefined" != typeof b)
//   )
//     if (null !== b.frameData && "canvas" === decodeMode) {
//       b.frameData.firstFrame === !0 &&
//         sendMessage("firstFrame", b.frameData.firstFrame);
//       var d = {
//         bufferIdx: b.frameData.bufferIdx,
//         width: b.frameData.width,
//         height: b.frameData.height,
//         codecType: b.frameData.codecType,
//         frameType: b.frameData.frameType,
//         timeStamp: null,
//       };
//       null !== b.timeStamp &&
//         "undefined" != typeof b.timeStamp &&
//         (d.timeStamp = b.timeStamp),
//         sendMessage("videoInfo", d),
//         "undefined" != typeof b.frameData.data &&
//           null !== b.frameData.data &&
//           sendMessage("canvasRender", b.frameData.data);
//     } else if (null !== b.frameData && "video" === decodeMode) {
//       null !== b.initSegmentData &&
//         (sendMessage("codecInfo", b.codecInfo),
//         sendMessage("initSegment", b.initSegmentData));
//       var d = {
//         codecType: b.frameData.codecType,
//       };
//       "undefined" != typeof b.frameData.width &&
//         ((d.width = b.frameData.width), (d.height = b.frameData.height)),
//         sendMessage("videoInfo", d),
//         sendMessage("videoTimeStamp", b.timeStamp),
//         b.frameData.length > 0 &&
//           (sendMessage("mediaSample", b.mediaSample),
//           sendMessage("videoRender", b.frameData));
//     } else sendMessage("drop", a.decodedData);
//   null != a.resolution && sendMessage("MSEResolutionChanged", a.resolution),
//     null != a.decodeStart && sendMessage("DecodeStart", a.decodeStart),
//     null != a.ivsDraw && sendMessage("ivsDraw", a.ivsDraw);
// }

function sendMessage(a, b) {
  var c = {
    type: a,
    data: b,
    channelId: channelId,
  };
  "canvasRender" === a ? postMessage(c, [b.buffer]) : postMessage(c);
}

function VideoBufferList() {
  function a() {
    (b = 360),
      (c = 240),
      (d = null),
      (this._length = 0),
      (this.head = null),
      (this.tail = null),
      (this.curIdx = 0);
  }
  var b = 0,
    c = 0,
    d = null;
  return (
    (a.prototype = {
      push: function (a, b, e, f, g, h) {
        var i = new VideoBufferNode(a, b, e, f, g, h);
        return (
          this._length > 0
            ? ((this.tail.next = i), (i.previous = this.tail), (this.tail = i))
            : ((this.head = i), (this.tail = i)),
          (this._length += 1),
          null !== d && this._length >= c ? d() : 0,
          i
        );
      },
      pop: function () {
        var a = null;
        return (
          this._length > 1 &&
            ((a = this.head),
            (this.head = this.head.next),
            null !== this.head
              ? (this.head.previous = null)
              : (this.tail = null),
            (this._length -= 1)),
          a
        );
      },
      setMaxLength: function (a) {
        (b = a), b > 360 ? (b = 360) : 30 > b && (b = 30);
      },
      setBUFFERING: function (a) {
        (c = a), c > 240 ? (c = 240) : 6 > c && (c = 6);
      },
      setBufferFullCallback: function (a) {
        d = a;
      },
      searchTimestamp: function (a) {
        var b = this.head,
          c = this._length,
          d = 1,
          e = {
            failure: "Failure: non-existent node in this list.",
          };
        if (0 === c || 0 >= a || null === b) throw new Error(e.failure);
        for (
          ;
          null !== b &&
          (b.timeStamp.timestamp !== a.timestamp ||
            b.timeStamp.timestamp_usec !== a.timestamp_usec);

        )
          (b = b.next), d++;
        return d > c ? (b = null) : (this.curIdx = d), b;
      },
      findIFrame: function (a) {
        var b = this.head,
          c = this._length,
          d = 1,
          e = {
            failure: "Failure: non-existent node in this list.",
          };
        if (0 === c) throw new Error(e.failure);
        for (; d < this.curIdx; ) (b = b.next), d++;
        if (a === !0) for (; "I" !== b.frameType; ) (b = b.next), d++;
        else for (; "I" !== b.frameType; ) (b = b.previous), d--;
        return d > c ? (b = null) : (this.curIdx = d), b;
      },
    }),
    new a()
  );
}
importScripts(
  "public.js",
  "mp4remux.js",
  "hashMap.js",
  "h264Parser.js",
  "h264Session.js"
);
sendMessage("WorkerReady");
addEventListener("message", receiveMessage, false);
var videoRtpSessionsArray = [],
  sdpInfo = null,
  rtpSession = null,
  decodeMode = "canvas",
  isBackupCommand = !1,
  isStepPlay = !1,
  isForward = !0,
  framerate = 0,
  backupFrameInfo = null,
  videoCHID = -1,
  h264Session = null,
  h265Session = null,
  mjpegSession = null,
  ivsSession = null,
  channelId = null,
  dropout = 1;
