import { VideoMediaSource } from "./videoMediaSource.js";
import { BrowserDetect } from "./browserDetect.js";
import mp4Remux from "./mp4remux.js";

var WorkerManager = function () {
  function a() {
    (N = !0), (o = this);
  }
  function b() {
    return W;
  }
  function c() {
    null !== z && z(!1);
  }
  function onVideoMessage(b) {
    var c = b.data;
    switch (c.type) {
      case "WorkerReady":
        xb && xb();
        break;
      case "canvasRender":
        k(0, "currentTime"),
          i(c.data),
          tb++,
          0 === sb && (sb = performance.now());
        break;
      case "initSegment":
        (W = c.data), j();
        break;
      case "mediaSample":
        null === Y.samples && (Y.samples = new Array(ib)),
          null === c.data.frame_time_stamp &&
            (c.data.frameDuration = Math.round(ob / K)),
          1 !== hb && (c.data.frameDuration = ob / Math.abs(hb)),
          (Y.samples[Z++] = c.data),
          (mb += c.data.frameDuration),
          (nb += c.data.frameDuration),
          (ib =
            Y.samples[0].frameDuration > 500 &&
            Y.samples[0].frameDuration <= 3e3
              ? 1
              : 1 === hb
              ? gb
              : Math.abs(hb)),
          jb !== ib && h(1 !== hb),
          (jb = ib);
        break;
      case "videoRender":
        var d = new Uint8Array(c.data.length + $);
        if (
          (0 !== $ && d.set(_),
          d.set(c.data, $),
          (_ = d),
          ($ = _.length),
          Z % ib === 0 && 0 !== Z)
        ) {
          if (
            (null !== Y.samples[0].frameDuration
              ? ((Y.baseMediaDecodeTime = 1 === ab ? 0 : lb), (lb = mb))
              : (Y.baseMediaDecodeTime = Math.round(ob / K) * ib * (ab - 1)),
            "chrome" == H && 1 === hb)
          )
            for (var e = Y.samples.length, f = nb / ib, g = 0; e > g; g++)
              Y.samples[g].frameDuration = f;
          (nb = 0),
            (X = mp4Remux.mediaSegment(ab, Y, _, Y.baseMediaDecodeTime)),
            ab++,
            (Z = 0),
            (_ = null),
            ($ = 0),
            null !== V ? V.setMediaSegment(X) : kb === !1 && j(),
            null !== streamDrawer && streamDrawer.stopRendering();
        }
        break;
      case "mediasegmentData":
        V.setMediaSegment(c.data);
        kb === !1 && j();
        break;
      case "videoInfo":
        I = c.data;
        break;
      case "time":
        break;
      case "videoTimeStamp":
        (db = c.data), null !== V && null !== db && V.setvideoTimeStamp(db);
        var m = new Gb(videoElement),
          n = (navigator.userAgent.indexOf("Chrome") > -1 && 8) || 2;
        m.bindTimeUpdate(videoElement),
          m.getTime() >= n &&
            (m.clearTimer(),
            null !== A &&
              A({
                errorCode: 101,
              }));
        break;
      case "firstFrame":
        streamDrawer.startRendering(),
          "undefined" != typeof streamDrawer.setFPS && streamDrawer.setFPS(K);
        break;
      case "drop":
        break;
      case "codecInfo":
        (bb = c.data), null !== V && V.setCodecInfo(bb);
        break;
      case "stepPlay":
        switch (c.data) {
          case "needBuffering":
            (Q = !0), w("request", S);
            break;
          case "BufferFull":
            if (((Q = !1), w("complete"), Ab)) {
              var o = {
                type: "stepPlay",
                data: "findIFrame",
              };
              videoWorker.postMessage(o),
                streamDrawer.startRendering(),
                (Ab = !1);
            }
        }
        break;
      case "setVideoTagMode":
        a.prototype.setLiveMode(c.data);
        break;
      case "playbackFlag":
        (zb.type = c.data === !0 ? "playback" : "live"),
          null !== V && V.setPlaybackFlag(c.data);
        break;
      case "error":
        null !== A && A(c.data);
        break;
      case "MSEResolutionChanged":
        E(c.data);
        break;
      case "DecodeStart":
        B(c.data);
        break;
      case "ivsDraw":
        G(c.data);
        break;
      default:
        console.log("workerManager::videoWorker unknown data = " + c.data);
    }
  }
  function e(a) {
    var b = a.data;
    switch (b.type) {
      case "render":
        if (U === !0) break;
        pb !== b.codec &&
          (null !== q &&
            ((qb = q.getVolume()),
            (rb = q.getInitVideoTimeStamp()),
            q.terminate()),
          "AAC" === b.codec
            ? "edge" === H || "firefox" === H
              ? ((q = null),
                null !== A &&
                  A({
                    errorCode: 201,
                  }))
              : (q = new AudioPlayerAAC())
            : ((q = new AudioPlayerGxx()), q.setSamplingRate(b.samplingRate)),
          null !== q &&
            (q.setInitVideoTimeStamp(rb), q.audioInit(qb) || (q = null)),
          (pb = b.codec)),
          null !== q &&
            (null === I || "undefined" == typeof I
              ? q.bufferAudio(b.data, b.rtpTimeStamp, null)
              : q.bufferAudio(b.data, b.rtpTimeStamp, I.codecType));
    }
  }
  function f(a) {
    var b = a.data;
    switch (b.type) {
      case "rtpData":
        v(b.data);
    }
  }
  function g(a) {
    var b = {
      type: "getRtpData",
      data: a,
    };
    n.postMessage(b);
  }
  function h(a) {
    null !== V && (V.close(), (V = null)),
      (ib = a === !1 ? gb : Math.abs(hb)),
      (Y.samples = new Array(ib)),
      (kb = !1),
      (ab = 1),
      (X = null),
      (Z = 0),
      (_ = null),
      ($ = 0);
  }
  function i(a) {
    null !== a &&
      null !== streamDrawer &&
      ("mjpeg" === I.codecType
        ? streamDrawer.drawMJPEG(
            a,
            I.width,
            I.height,
            I.codecType,
            I.frameType,
            I.timeStamp
          )
        : streamDrawer.draw(
            a,
            I.width,
            I.height,
            I.codecType,
            I.frameType,
            I.timeStamp
          ));
  }
  function j() {
    (kb = !0),
      null === V
        ? ((V = VideoMediaSource(o)),
          V.setCodecInfo(bb),
          V.setInitSegmentFunc(b),
          V.setVideoSizeCallback(c),
          V.setBeginDrawCallback(t),
          V.init(videoElement),
          V.setSpeedPlay(hb))
        : (V.getVideoElement(), V.setInitSegment()),
      V.setAudioStartCallback(k);
  }
  function k(a, b) {
    null !== q && q.setBufferingFlag(a, b);
  }
  var videoWorker = null,
    audioWorker = null,
    n = null,
    o = null,
    streamDrawer = null,
    q = null,
    r = null,
    s = null,
    t = null,
    u = null,
    v = null,
    w = null,
    x = null,
    y = null,
    z = null,
    A = null,
    B = null,
    C = null,
    D = null,
    E = null,
    F = null,
    G = null,
    H = BrowserDetect(),
    I = null,
    SDPInfo = null,
    K = 0,
    L = null,
    M = !1,
    N = !0,
    decodeMode = "canvas",
    P = !0,
    Q = !1,
    canvasElement = null,
    S = null,
    T = null,
    U = !1,
    V = null,
    W = null,
    X = null,
    Y = {
      id: 1,
      samples: null,
      baseMediaDecodeTime: 0,
    },
    Z = 0,
    $ = 0,
    _ = null,
    ab = 1,
    bb = "",
    videoElement = null,
    db = null,
    eb = 4,
    fb = 4,
    gb = "chrome" !== H ? fb : eb,
    hb = 1,
    ib = gb,
    jb = ib,
    kb = !1,
    lb = 0,
    mb = 0,
    nb = 0,
    ob = 1e3,
    pb = null,
    qb = 0,
    rb = 0,
    sb = 0,
    tb = 0,
    ub = 1e3,
    vb = null,
    wb = null,
    xb = null,
    yb = 0,
    zb = {
      type: "live",
      codec: "",
      width: 0,
      height: 0,
      isLimitSpeed: null,
    },
    Ab = !1,
    Bb = null,
    Cb = null,
    Db = null,
    Eb = {
      5: "MJPEG",
      8: "H264",
      12: "H265",
    },
    messageArray = [],
    rtpStackCount = 0,
    rtpStackCheckNum = 10,
    Fb = {
      1: 4e3,
      2: 8e3,
      3: 11025,
      4: 16e3,
      5: 2e4,
      6: 22050,
      7: 32e3,
      8: 44100,
      9: 48e3,
      10: 96e3,
      11: 128e3,
      12: 192e3,
      13: 64e3,
    },
    Gb = (function () {
      function a() {
        void (function () {
          d = setInterval(function () {
            c++;
          }, 1e3);
        })(),
          (this.getTime = function () {
            return c;
          }),
          (this.clearTimer = function () {
            (c = 0), clearInterval(d);
          }),
          (this.getState = function () {
            return state;
          }),
          (this.bindTimeUpdate = function (a) {
            var b = this;
            if (!e && a) {
              a.addEventListener(
                "timeupdate",
                () => {
                  a.removeEventListener("timeupdate", () => {}, true);
                  b.clearTimer();
                },
                true
              );
              /*  jQuery(a).on("timeupdate", function() {
                                 jQuery(a).off("timeupdate");
                                 b.clearTimer()
                             }) */
            }
            e = !0;
          });
      }
      var b = null,
        c = 0,
        d = null,
        e = !1;
      return function () {
        return b ? b : (b = new a());
      };
    })();
  a.prototype = {
    init: function (b) {
      (yb = 0),
        //canvasElement = a,
        (videoElement = b);
      videoWorker = new Worker("module/videoWorker.js");
      //audioWorker = new Worker("module/audioWorker.js"),
      videoWorker.onmessage = onVideoMessage;
      //audioWorker.onmessage = e,
      //streamDrawer = new StreamDrawer(yb,this,canvasElement),
      //streamDrawer.setResizeCallback(s),
    },
    sendSdpInfo: function (a, b, c) {
      var d = {
        type: "sdpInfo",
        data: {
          sdpInfo: a,
          aacCodecInfo: b,
          decodeMode: decodeMode,
          govLength: L,
          checkDelay: P,
        },
      };
      videoWorker.postMessage(d);

      (pb = null), (kb = !1), (SDPInfo = a);
    },
    parseRTPData: function (rtspinterleave, rtpheader, rtpPacketArray) {
      let mediaType = rtspinterleave[1];
      let idx = parseInt(mediaType / 2, 10);
      let markerBitHex = 128;

      let message = {
        type: "rtpData",
        data: {
          rtspInterleave: rtspinterleave,
          header: rtpheader,
          payload: rtpPacketArray,
        },
      };

      if (idx !== 0) {
        console.log("idx: ", rtspinterleave);
        return;
      }

      switch (SDPInfo[idx].codecName) {
        case "H264":
          messageArray.push(message);
          if (
            rtpStackCount >= rtpStackCheckNum ||
            (rtpheader[1] & markerBitHex) === markerBitHex
          ) {
            if ((rtpheader[1] & markerBitHex) === markerBitHex) {
              console.log("遇到终止位: " + rtpheader[1]);
            }
            let sendMessage = { type: "rtpDataArray", data: messageArray };
            if (videoWorker) {
              videoWorker.postMessage(sendMessage);
            }
            sendMessage = null;
            messageArray = [];
            rtpStackCount = 0;
            //console.log('1111111111')
          } else {
            rtpStackCount++;
          }
      }
    },
    setCallback: function (a, b) {
      switch (a) {
        case "timeStamp":
          u = b;
          break;
        case "ResolutionChanged":
          (s = b), null !== streamDrawer && streamDrawer.setResizeCallback(s);
          break;
        case "audioTalk":
          v = b;
          break;
        case "stepRequest":
          w = b;
          break;
        case "metaEvent":
          x = b;
          break;
        case "videoMode":
          y = b;
          break;
        case "loadingBar":
          z = b;
          break;
        case "Error":
          A = b;
          break;
        case "PlayStart":
          (t = b),
            null !== streamDrawer && streamDrawer.setBeginDrawCallback(t);
          break;
        case "DecodeStart":
          B = b;
          break;
        case "UpdateCanvas":
          (C = b),
            null !== streamDrawer && streamDrawer.setupdateCanvasCallback(C);
          break;
        case "FrameTypeChange":
          D = b;
          break;
        case "MSEResolutionChanged":
          E = b;
          break;
        case "audioChange":
          F = b;
          break;
        case "ivs":
          G = b;
          break;
        case "WorkerReady":
          xb = b;
          break;
        default:
          console.log(a),
            console.log("workerManager::setCallback() : type is unknown");
      }
    },
    capture: function (a) {
      "canvas" === decodeMode ? streamDrawer.capture(a) : V.capture(a);
    },
    setDeviceInfo: function (a) {
      T = a.mode;
    },
    setFPS: function (a) {
      var b = 30;
      (K = 0 === a ? b : a), h(1 !== hb);
    },
    setGovLength: function (a) {
      L = a;
    },
    setLiveMode: function (a) {
      null !== y && y(a),
        (decodeMode = null === a ? "canvas" : a),
        "video" === decodeMode
          ? null !== streamDrawer && streamDrawer.renewCanvas()
          : "canvas" === decodeMode && h(!1);
    },
    controlAudio: function (a, b) {
      switch ((console.log(a + " " + b), a)) {
        case "audioPlay":
          "start" === b
            ? null !== q && q.play()
            : ((qb = 0), null !== q && q.stop());
          break;
        case "volumn":
          (qb = b), null !== q && q.controlVolumn(b);
          break;
        case "audioSamplingRate":
          null !== q && q.setSamplingRate(b);
      }
    },
    controlAudioTalk: function (a, b) {
      if (null !== r)
        switch (a) {
          case "onOff":
            "on" === b || r.stopAudioOut();
            break;
          case "volumn":
            r.controlVolumnOut(b);
        }
    },
    reassignCanvas: function () {
      null !== streamDrawer && streamDrawer.reassignCanvas();
    },
    digitalZoom: function (a) {
      null !== streamDrawer && streamDrawer.digitalZoom(a);
    },
    playbackSpeed: function (a) {
      (hb = a), streamDrawer.setFrameInterval(hb);
    },
    timeStamp: function () {},
    initVideo: function (a) {
      h(a);
    },
    setFpsFrame: function (a) {
      (ub = a), (tb = 0), (sb = 0);
    },
    setCheckDelay: function (a) {
      P = a;
    },
    initStartTime: function () {
      var a = {
        type: "initStartTime",
      };
      videoWorker.postMessage(a),
        streamDrawer.stopRendering(),
        streamDrawer.startRendering();
    },
    terminate: function () {
      "backup" !== T &&
        (videoWorker && (videoWorker.terminate(), (videoWorker = null)),
        audioWorker && (audioWorker.terminate(), (audioWorker = null))),
        n && n.terminate(),
        r && (r.terminate(), (r = null)),
        streamDrawer && streamDrawer.terminate(),
        q && q.terminate(),
        V && V.terminate(),
        xb && (xb = null),
        (streamDrawer = null),
        (N = !0);
    },
  };
  return new a();
};

export default WorkerManager;
