import WorkerManager from "./WorkManager.js";
import md5 from "js-md5";
var MediaStreamRecorder = require("msr");
var Buffer = require("buffer").Buffer;

import { RtpPacket } from "./rtpPacket.js";

var WebsocketServer = function (a, b) {
  function c() {}
  function createHeader(method, trackId, c, npt) {
    var response = "";
    authorize(storedRealm);
    switch (method) {
      case "OPTIONS":
      case "TEARDOWN":
      case "GET_PARAMETER":
      case "SET_PARAMETERS":
        response =
          method +
          " " +
          M +
          " RTSP/1.0\r\nCSeq: " +
          B +
          (Q ? "\r\nExtraError: support\r\n" : "\r\n") +
          "Require: www.onvif.org/ver20/backchannel\r\n" +
          authHeader +
          "\r\n";
        break;
      case "DESCRIBE":
        response =
          method +
          " " +
          M +
          " RTSP/1.0\r\nCSeq: " +
          B +
          (Q ? "\r\nExtraError: support\r\n" : "\r\n") +
          "Require: www.onvif.org/ver20/backchannel\r\n" +
          authHeader +
          "\r\n";
        break;
      case "SETUP":
        console.log("trackID: " + trackId),
          (response =
            method +
            " " +
            M +
            "/trackID=" +
            trackId +
            " RTSP/1.0\r\nCSeq: " +
            B +
            (Q ? "\r\nExtraError: support\r\n" : "\r\n") +
            "Require: www.onvif.org/ver20/backchannel\r\n" +
            authHeader +
            "Transport: RTP/AVP/TCP;unicast;interleaved=" +
            2 * trackId +
            "-" +
            (2 * trackId + 1) +
            "\r\n"),
          (response += 0 != G ? "Session: " + G + "\r\n\r\n" : "\r\n");
        break;
      case "PLAY":
        (response =
          method +
          " " +
          M +
          " RTSP/1.0\r\nCSeq: " +
          B +
          (Q ? "\r\nExtraError: support\r\n" : "\r\n") +
          "Session: " +
          G +
          "\r\n"),
          void 0 != npt && 0 != npt
            ? ((response += "Range: npt=" + npt + "-\r\n"),
              (response += authHeader + "\r\n"))
            : (response += authHeader + "\r\n");
        break;
      case "PAUSE":
        response =
          method +
          " " +
          M +
          " RTSP/1.0\r\nCSeq: " +
          B +
          (Q ? "\r\nExtraError: support\r\n" : "\r\n") +
          "Session: " +
          G +
          "\r\n\r\n";
        break;
      case "SCALE":
        (response =
          "PLAY " +
          M +
          " RTSP/1.0\r\nCSeq: " +
          B +
          (Q ? "\r\nExtraError: support\r\n" : "\r\n") +
          "Session: " +
          G +
          "\r\n"),
          (response += "Scale: " + npt + "\r\n"),
          (response += authHeader + "\r\n");
    }
    return response;
  }
  var storedRealm = {};

  function hasUserMedia() {
    //check if the browser supports the WebRTC
    return !!(
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia
    );
  }

  function e(a) {
    var b = {},
      e = a.search("CSeq: ") + 5;
    if (
      ((B = parseInt(a.slice(e, e + 10)) + 1),
      (b = m(a)),
      b.ResponseCode === x.UNAUTHORIZED && "" === authHeader)
    ) {
      authorize(b);
      storedRealm = b;

      sendDataToWs(createHeader("OPTIONS", null, null));
    } else if (b.ResponseCode === x.OK) {
      if ("Options" === E)
        return (E = "Describe"), createHeader("DESCRIBE", null, null);
      if ("Describe" === E) {
        (I = !1),
          (D = n(a)),
          "undefined" != typeof b.ContentBase &&
            (D.ContentBase = b.ContentBase);
        var g = 0;
        for (g = 0; g < D.Sessions.length; g += 1) {
          var i = {};
          "JPEG" === D.Sessions[g].CodecMime ||
          "H264" === D.Sessions[g].CodecMime ||
          "H265" === D.Sessions[g].CodecMime ||
          "H264-SVC" == D.Sessions[g].CodecMime
            ? ((i.codecName = D.Sessions[g].CodecMime),
              "H264-SVC" == D.Sessions[g].CodecMime && (i.codecName = "H264"),
              "H265" == D.Sessions[g].CodecMime &&
                c.prototype.setLiveMode("video"),
              (i.trackID = D.Sessions[g].ControlURL),
              (i.ClockFreq = D.Sessions[g].ClockFreq),
              (i.Port = parseInt(D.Sessions[g].Port)),
              "undefined" != typeof D.Sessions[g].Framerate &&
                ((i.Framerate = parseInt(D.Sessions[g].Framerate)),
                w.setFPS(i.Framerate),
                N(i.Framerate)),
              A.push(i))
            : "PCMU" === D.Sessions[g].CodecMime ||
              -1 !== D.Sessions[g].CodecMime.search("G726-16") ||
              -1 !== D.Sessions[g].CodecMime.search("G726-24") ||
              -1 !== D.Sessions[g].CodecMime.search("G726-32") ||
              -1 !== D.Sessions[g].CodecMime.search("G726-40") ||
              "PCMA" === D.Sessions[g].CodecMime
            ? ("PCMU" === D.Sessions[g].CodecMime
                ? (i.codecName = "G.711Mu")
                : "G726-16" === D.Sessions[g].CodecMime
                ? (i.codecName = "G.726-16")
                : "G726-24" === D.Sessions[g].CodecMime
                ? (i.codecName = "G.726-24")
                : "G726-32" === D.Sessions[g].CodecMime
                ? (i.codecName = "G.726-32")
                : "G726-40" === D.Sessions[g].CodecMime
                ? (i.codecName = "G.726-40")
                : "PCMA" === D.Sessions[g].CodecMime &&
                  (i.codecName = "G.711A"),
              (i.trackID = D.Sessions[g].ControlURL),
              (i.ClockFreq = D.Sessions[g].ClockFreq),
              (i.Port = parseInt(D.Sessions[g].Port)),
              (i.Bitrate = parseInt(D.Sessions[g].Bitrate)),
              A.push(i))
            : "mpeg4-generic" === D.Sessions[g].CodecMime ||
              "MPEG4-GENERIC" === D.Sessions[g].CodecMime
            ? ((i.codecName = "mpeg4-generic"),
              (i.trackID = D.Sessions[g].ControlURL),
              (i.ClockFreq = D.Sessions[g].ClockFreq),
              (i.Port = parseInt(D.Sessions[g].Port)),
              (i.Bitrate = parseInt(D.Sessions[g].Bitrate)),
              A.push(i))
            : "vnd.onvif.metadata" === D.Sessions[g].CodecMime
            ? ((i.codecName = "MetaData"),
              (i.trackID = D.Sessions[g].ControlURL),
              (i.ClockFreq = D.Sessions[g].ClockFreq),
              (i.Port = parseInt(D.Sessions[g].Port)),
              A.push(i))
            : "stream-assist-frame" === D.Sessions[g].CodecMime
            ? ((i.codecName = "stream-assist-frame"),
              (i.trackID = D.Sessions[g].ControlURL),
              (i.ClockFreq = D.Sessions[g].ClockFreq),
              (i.Port = parseInt(D.Sessions[g].Port)),
              A.push(i))
            : console.log(
                "Unknown codec type:",
                D.Sessions[g].CodecMime,
                D.Sessions[g].ControlURL
              );
        }
        return (F = 0), (E = "Setup"), createHeader("SETUP", F);
      }
      if ("Setup" === E) {
        if (((G = b.SessionID), F < A.length))
          return (
            (A[F].RtpInterlevedID = b.RtpInterlevedID),
            (A[F].RtcpInterlevedID = b.RtcpInterlevedID),
            (F += 1),
            F !== A.length
              ? createHeader("SETUP", A[F].trackID.split("=")[1] - 0)
              : (w.sendSdpInfo(A, L, I),
                (E = "Play"),
                createHeader("PLAY", null))
          );
        console.log("Unknown setup SDP index");
      } else if ("Play" === E) {
        (G = b.SessionID),
          clearInterval(J),
          (J = setInterval(function () {
            return sendDataToWs(createHeader("GET_PARAMETER", null, null));
          }, y));
        E = "Playing";
      } else "Playing" === E || console.log("unknown rtsp state:" + E);
    } else if (b.ResponseCode === x.NOTSERVICE) {
      if ("Setup" === E && -1 !== A[F].trackID.search("trackID=t"))
        return (
          (A[F].RtpInterlevedID = -1),
          (A[F].RtcpInterlevedID = -1),
          (F += 1),
          (I = !1),
          C({
            errorCode: "504",
            description: "Talk Service Unavilable",
            place: "RtspClient.js",
          }),
          F < A.length
            ? createHeader("SETUP", A[F].trackID)
            : ((E = "Play"), createHeader("PLAY", null))
        );
      C({
        errorCode: "503",
        description: "Service Unavilable",
      });
    } else if (b.ResponseCode === x.NOTFOUND) {
      if ("Describe" === E || "Options" === E)
        return void C({
          errorCode: 404,
          description: "rtsp not found",
        });
    } else if (b.ResponseCode === x.INVALID_RANGE)
      return (
        ("backup" === H || "playback" === H) &&
          C({
            errorCode: "457",
            description: "Invalid range",
          }),
        void console.log("RTP disconnection detect!!!")
      );
  }

  let rtp = null;
  if (hasUserMedia()) {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    //enabling video and audio channels
    navigator.getUserMedia(
      { video: false, audio: true },
      function (mediaStream) {
        // get audio from media stream
        const audio = mediaStream.getAudioTracks()[0];

        var mediaRecorder = new MediaStreamRecorder(mediaStream);
        mediaRecorder.mimeType = "audio/wav"; // audio/webm or audio/ogg or audio/wav
        mediaRecorder.ondataavailable = async function (blob) {
          // console.log(blob);
          // if (!rtp) {
          //   rtp = new RtpPacket(blob);
          // } else {
          //   rtp.payload = blob;
          // }
          // rtp.time += blob.length;
          // rtp.seq++;
          // var rtp = new RtpPacket(buffer);

          var buffer = await blob.arrayBuffer();

          const buff = Buffer.from(buffer, "binary");
          var rtp = new RtpPacket(buff);
          rtp.payload = buff;
          rtp.time += buff.length;
          rtp.seq++;

          console.log(rtp);
          sendDataToWs(rtp);
        };
        mediaRecorder.start(200); // Time limit of 200 milliseconds
      },
      function (err) {}
    );
  } else {
    alert("WebRTC is not supported");
  }

  function authorize(a) {
    var b = O.username,
      c = O.passWord,
      e = {
        Method: null,
        Realm: null,
        Nonce: null,
        Uri: null,
      },
      f = null;
    (e = {
      Method: E.toUpperCase(),
      Realm: a.Realm,
      Nonce: a.Nonce,
      Uri: M,
    }),
      (f = g(b, c, e.Uri, e.Realm, e.Nonce, e.Method)),
      (authHeader =
        'Authorization: Digest username="' + b + '", realm="' + e.Realm + '",'),
      (authHeader +=
        ' nonce="' + e.Nonce + '", uri="' + e.Uri + '", response="' + f + '"'),
      (authHeader += "\r\n");
  }
  function g(a, b, c, d, e, f) {
    var g = null,
      h = null,
      i = null;
    return (
      (g = md5(a + ":" + d + ":" + b).toLowerCase()),
      (h = md5(f + ":" + c).toLowerCase()),
      (i = md5(g + ":" + e + ":" + h).toLowerCase())
    );
  }
  function sendDataToWs(a) {
    if (void 0 != a && null != a && "" != a)
      if (null !== websocket && websocket.readyState === WebSocket.OPEN) {
        if (v === !1) {
          var b = a.search("DESCRIBE");
          -1 !== b && ((u = !0), (v = !0));
        }
        void 0 != a && websocket.send(i(a));
      } else console.log("ws未连接");
  }
  function i(a) {
    for (
      var b = a.length, c = new Uint8Array(new ArrayBuffer(b)), d = 0;
      b > d;
      d++
    )
      c[d] = a.charCodeAt(d);
    return c;
  }
  function processRtpData(a) {
    var b = new Uint8Array(),
      c = new Uint8Array(a.data);
    for (b = new Uint8Array(c.length), b.set(c, 0), s = b.length; s > 0; )
      if (36 !== b[0]) {
        var d = String.fromCharCode.apply(null, b),
          f = null;
        -1 !== d.indexOf("OffLine:File Over"),
          -1 !== d.indexOf("OffLine:KmsUnavailable") &&
            C({
              errorCode: 203,
            }),
          u === !0
            ? ((f = d.lastIndexOf("\r\n")), (u = !1))
            : (f = d.search("\r\n\r\n"));
        var g = d.search("RTSP");
        if (-1 === g) return void (b = new Uint8Array());
        if (-1 === f) return void (s = b.length);
        (q = b.subarray(g, f + RTSP_INTERLEAVE_LENGTH)),
          (b = b.subarray(f + RTSP_INTERLEAVE_LENGTH));
        var i = String.fromCharCode.apply(null, q);
        sendDataToWs(e(i)), (s = b.length);
      } else {
        interleave = b.subarray(0, RTSP_INTERLEAVE_LENGTH);
        t = (interleave[2] << 8) + interleave[3];
        if (!(t + RTSP_INTERLEAVE_LENGTH <= b.length))
          return void (s = b.length);

        let rtpheader = b.subarray(RTSP_INTERLEAVE_LENGTH, 16);
        var rtpPacket = b.subarray(16, t + RTSP_INTERLEAVE_LENGTH);
        l(interleave, rtpheader, rtpPacket);
        b = b.subarray(t + RTSP_INTERLEAVE_LENGTH);
        s = b.length;
      }
  }
  function k(a) {
    K = a;
  }
  function l(a, b, c) {
    w.parseRTPData(a, b, c), k(!0);
  }
  function m(a) {
    var b = {},
      c = 0,
      d = 0,
      e = null,
      f = null,
      g = null;
    if (-1 !== a.search("Content-Type: application/sdp")) {
      var h = a.split("\r\n\r\n");
      g = h[0];
    } else g = a;
    var i = g.split("\r\n"),
      j = i[0].split(" ");
    if (
      (j.length > 2 &&
        ((b.ResponseCode = parseInt(j[1])), (b.ResponseMessage = j[2])),
      b.ResponseCode === x.OK)
    ) {
      for (c = 1; c < i.length; c++)
        if (((f = i[c].split(":")), "Public" === f[0]))
          b.MethodsSupported = f[1].split(",");
        else if ("CSeq" === f[0]) b.CSeq = parseInt(f[1]);
        else if ("Content-Type" === f[0])
          (b.ContentType = f[1]),
            -1 !== b.ContentType.search("application/sdp") &&
              (b.SDPData = n(a));
        else if ("Content-Length" === f[0]) b.ContentLength = parseInt(f[1]);
        else if ("Content-Base" === f[0]) {
          var k = i[c].search("Content-Base:");
          -1 !== k && (b.ContentBase = i[c].substr(k + 13));
        } else if ("Session" === f[0]) {
          var l = f[1].split(";");
          b.SessionID = parseInt(l[0]);
        } else if ("Transport" === f[0]) {
          var m = f[1].split(";");
          for (d = 0; d < m.length; d++) {
            var o = m[d].search("interleaved=");
            if (-1 !== o) {
              var p = m[d].substr(o + 12),
                q = p.split("-");
              q.length > 1 &&
                ((b.RtpInterlevedID = parseInt(q[0])),
                (b.RtcpInterlevedID = parseInt(q[1])));
            }
          }
        } else if ("RTP-Info" === f[0]) {
          f[1] = i[c].substr(9);
          var r = f[1].split(",");
          for (b.RTPInfoList = [], d = 0; d < r.length; d++) {
            var s = r[d].split(";"),
              t = {},
              u = 0;
            for (u = 0; u < s.length; u++) {
              var v = s[u].search("url=");
              -1 !== v && (t.URL = s[u].substr(v + 4)),
                (v = s[u].search("seq=")),
                -1 !== v && (t.Seq = parseInt(s[u].substr(v + 4)));
            }
            b.RTPInfoList.push(t);
          }
        }
    } else if (b.ResponseCode === x.UNAUTHORIZED)
      for (c = 1; c < i.length; c++)
        if (((f = i[c].split(":")), "CSeq" === f[0])) b.CSeq = parseInt(f[1]);
        else if ("WWW-Authenticate" === f[0]) {
          var w = f[1].split(",");
          for (d = 0; d < w.length; d++) {
            var y = w[d].search("Digest realm=");
            if (-1 !== y) {
              e = w[d].substr(y + 13);
              var z = e.split('"');
              b.Realm = z[1];
            }
            if (((y = w[d].search("nonce=")), -1 !== y)) {
              e = w[d].substr(y + 6);
              var A = e.split('"');
              b.Nonce = A[1];
            }
          }
        }
    return b;
  }
  function n(a) {
    var b = {},
      c = [];
    b.Sessions = c;
    var d = null;
    if (-1 !== a.search("Content-Type: application/sdp")) {
      var e = a.split("\r\n\r\n");
      d = e[1];
    } else d = a;
    var f = d.split("\r\n"),
      g = 0,
      h = !1;
    for (g = 0; g < f.length; g++) {
      var i = f[g].split("=");
      if (i.length > 0)
        switch (i[0]) {
          case "a":
            var j = i[1].split(":");
            if (j.length > 1)
              if ("control" === j[0]) {
                var k = f[g].search("control:");
                h === !0
                  ? -1 !== k &&
                    (b.Sessions[b.Sessions.length - 1].ControlURL = f[g].substr(
                      k + 8
                    ))
                  : -1 !== k && (b.BaseURL = f[g].substr(k + 8));
              } else if ("rtpmap" === j[0]) {
                var l = j[1].split(" ");
                b.Sessions[b.Sessions.length - 1].PayloadType = l[0];
                var m = l[1].split("/");
                (b.Sessions[b.Sessions.length - 1].CodecMime = m[0]),
                  m.length > 1 &&
                    (b.Sessions[b.Sessions.length - 1].ClockFreq = m[1]);
              } else if ("framesize" === j[0]) {
                var n = j[1].split(" ");
                if (n.length > 1) {
                  var o = n[1].split("-");
                  (b.Sessions[b.Sessions.length - 1].Width = o[0]),
                    (b.Sessions[b.Sessions.length - 1].Height = o[1]);
                }
              } else if ("framerate" === j[0])
                b.Sessions[b.Sessions.length - 1].Framerate = j[1];
              else if ("fmtp" === j[0]) {
                var p = f[g].split(" ");
                if (p.length < 2) continue;
                for (var q = 1; q < p.length; q++) {
                  var r = p[q].split(";"),
                    s = 0;
                  for (s = 0; s < r.length; s++) {
                    var t = r[s].search("mode=");
                    if (
                      (-1 !== t &&
                        (b.Sessions[b.Sessions.length - 1].mode = r[s].substr(
                          t + 5
                        )),
                      (t = r[s].search("config=")),
                      -1 !== t &&
                        ((b.Sessions[b.Sessions.length - 1].config = r[
                          s
                        ].substr(t + 7)),
                        (L.config = b.Sessions[b.Sessions.length - 1].config),
                        (L.clockFreq =
                          b.Sessions[b.Sessions.length - 1].ClockFreq),
                        (L.bitrate =
                          b.Sessions[b.Sessions.length - 1].Bitrate)),
                      (t = r[s].search("sprop-vps=")),
                      -1 !== t &&
                        (b.Sessions[b.Sessions.length - 1].VPS = r[s].substr(
                          t + 10
                        )),
                      (t = r[s].search("sprop-sps=")),
                      -1 !== t &&
                        (b.Sessions[b.Sessions.length - 1].SPS = r[s].substr(
                          t + 10
                        )),
                      (t = r[s].search("sprop-pps=")),
                      -1 !== t &&
                        (b.Sessions[b.Sessions.length - 1].PPS = r[s].substr(
                          t + 10
                        )),
                      (t = r[s].search("sprop-parameter-sets=")),
                      -1 !== t)
                    ) {
                      var u = r[s].substr(t + 21),
                        v = u.split(",");
                      v.length > 1 &&
                        ((b.Sessions[b.Sessions.length - 1].SPS = v[0]),
                        (b.Sessions[b.Sessions.length - 1].PPS = v[1]));
                    }
                  }
                }
              }
            break;
          case "m":
            var w = i[1].split(" "),
              x = {};
            (x.Type = w[0]),
              (x.Port = w[1]),
              (x.Payload = w[3]),
              b.Sessions.push(x),
              (h = !0);
            break;
          case "b":
            if (h === !0) {
              var y = i[1].split(":");
              b.Sessions[b.Sessions.length - 1].Bitrate = y[1];
            }
        }
    }
    return b;
  }
  var a = a,
    websocket = null,
    RTSP_INTERLEAVE_LENGTH = 4,
    q = null,
    interleave = null,
    s = 0,
    t = 0,
    u = !1,
    v = !1,
    w = new WorkerManager(),
    x = {
      OK: 200,
      UNAUTHORIZED: 401,
      NOTFOUND: 404,
      INVALID_RANGE: 457,
      NOTSERVICE: 503,
      DISCONNECT: 999,
    },
    y = 4e4,
    authHeader = "",
    A = [],
    B = 1,
    C = null,
    D = {},
    E = "Options",
    F = null,
    G = null,
    H = "",
    I = !1,
    J = null,
    K = !1,
    L = {},
    M = b,
    N = null,
    O = {},
    P = "",
    Q = !1;
  return (
    (c.prototype = {
      init: function (b) {
        w.init(b);
      },
      setStoreEncrypt: function (a) {
        Q = a;
      },
      connect: function () {
        websocket ||
          ((websocket = new WebSocket(a)),
          (websocket.binaryType = "arraybuffer"),
          websocket.addEventListener("message", processRtpData, !1),
          (websocket.onopen = function () {
            var a =
                "OPTIONS " +
                M +
                " RTSP/1.0\r\nCSeq: " +
                B +
                (Q ? "\r\nExtraError: support" : "") +
                "\r\n\r\n",
              b = i(a);
            websocket.send(b);
          }),
          (websocket.onerror = function () {
            C({
              errorCode: 202,
              description: "Open WebSocket Error",
            });
          }));
      },
      disconnect: function () {
        sendDataToWs(createHeader("TEARDOWN", null, null)),
          clearInterval(J),
          (J = null),
          null !== websocket &&
            websocket.readyState === WebSocket.OPEN &&
            (websocket.close(), (websocket = null), (G = null)),
          null !== websocket && (websocket.onerror = null),
          w.terminate();
      },
      controlPlayer: function (a) {
        var b = "";
        switch (((P = a.command), a.command)) {
          case "PLAY":
            if (((E = "Play"), null != a.range)) {
              b = createHeader("PLAY", null, null, a.range);
              break;
            }
            (b = createHeader("PLAY", null, null)), P && w.initStartTime();
            break;
          case "PAUSE":
            if ("PAUSE" === E) break;
            (E = "PAUSE"), (b = createHeader("PAUSE", null, null));
            break;
          case "SCALE":
            (b = createHeader("SCALE", null, null, a.data)),
              w.playbackSpeed(a.data);
            break;
          case "TEARDOWN":
            b = createHeader("TEARDOWN", null, null);
            break;
          case "audioPlay":
          case "volumn":
          case "audioSamplingRate":
            w.controlAudio(a.command, a.data);
            break;
          default:
            console.log("未知指令: " + a.command);
        }
        "" != b && sendDataToWs(b);
      },
      setLiveMode: function (a) {
        w.setLiveMode("video");
      },
      setRTSPURL: function (a) {
        M = a;
      },
      setCallback: function (a, b) {
        "GetFrameRate" === a ? (N = b) : w.setCallback(a, b),
          "Error" == a && (C = b);
      },
      setUserInfo: function (a, b) {
        (O.username = a), (O.passWord = b);
      },
      capture: function (a) {
        w.capture(a);
      },
    }),
    new c()
  );
};

export default WebsocketServer;
