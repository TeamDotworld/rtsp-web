function H264Session() {
  let rtpTimeStamp = 0;
  let size1M = 1048576; //1024 * 1024
  let inputBuffer = new Uint8Array(size1M);
  let spsSegment = null;
  let ppsSegment = null;

  let spsParser = null;

  let width = 0;
  let height = 0;
  let inputLength = 0;

  let initalSegmentFlag = true; //用于确定是否是initSegment
  let initalMediaFrameFlag = true;

  let frameRate = null; //根据SDP或者SPS设置
  let preSample = null; //上一个Sample

  let inputSegBufferSub = null;

  //MSE使用的数据以及相关配置，顺序codecInfo -> initSegmentData -> mediaSample -> frameData
  //时间戳用于绘制人脸框
  let data = {
    frameData: null, //视频数据
    timeStamp: null, //时间戳
    initSegmentData: null, //MP4配置,用于initsegment
    mediaSample: null, //使用duration控制每一帧的播放时间
    codecInfo: "", //MSE init时传入，用于创建mediasource
  };

  let decodeMode = "video";
  let outputSize = 0;
  let curSize = 0;

  const PREFIX = new Uint8Array(["0x00", "0x00", "0x00", "0x01"]);

  let firstIframe = false;

  let anotherOutHeapSize = 0;
  let outputHeapSize = 0;

  let SEIInfo = {
    ivs: null,
    timestamp: null,
  };

  let preWidth = null,
    preHeight = null;
  let resetTimeCount = 0;
  let lastTimeStamp = 0;
  //const RESETTIME = 162000000;
  const RESETTIME = 4320000;

  let lastTime = 0;
  function constructor() {}

  constructor.prototype = {
    setGovLength() {},
    setCheckDelay() {},
    setBufferfullCallback() {},
    setReturnCallback() {},
    init() {
      initalSegmentFlag;
      spsParser = new H264SPSParser();
      this.resolutionChangedCallback = () => {};
    },

    parseRTPData(rtpHeader, rtpPayload) {
      let PaddingSize = 0;
      let extensionHeaderLen = 0;
      let PAYLOAD = null;

      let RtpHeader = {
        V: rtpHeader[0] >>> 6,
        P: rtpHeader[0] & 0x20,
        ext: rtpHeader[0] & 0x10,
        CC: rtpHeader[0] & 0x0f,
        M: (rtpHeader[1] & 0x80) >> 7,
        PT: rtpHeader[1] & 127,
        SN: (rtpHeader[2] << 8) + rtpHeader[3],
        timeStamp:
          (rtpHeader[4] << 24) +
          (rtpHeader[5] << 16) +
          (rtpHeader[6] << 8) +
          rtpHeader[7],
        SSRC:
          (rtpHeader[8] << 24) +
          (rtpHeader[9] << 16) +
          (rtpHeader[10] << 8) +
          rtpHeader[11],
      };
      if (RtpHeader.P) {
        PaddingSize = rtpPayload[rtpPayload.length - 1];
      }

      if (RtpHeader.ext) {
        extensionHeaderLen = ((rtpPayload[2] << 8) | rtpPayload[3]) * 4 + 4;
      }

      PAYLOAD = rtpPayload.subarray(
        extensionHeaderLen,
        rtpPayload.length - PaddingSize
      );

      rtpTimeStamp = RtpHeader.timeStamp;

      let nalType = PAYLOAD[0] & 0x1f;
      let end = false;
      switch (nalType) {
        case 6: //SEI
          //console.log(PAYLOAD, String.fromCharCode.apply(null, PAYLOAD))
          break;
          //console.log('SEI time: ', rtpTimeStamp)
          //console.log(rtpTimeStamp)
          break;
        case 7: //SPS
          //console.log('SPS');
          spsParser.parse(removeH264or5EmulationBytes(PAYLOAD));
          let sizeInfo = spsParser.getSizeInfo();
          width = sizeInfo.width;
          height = sizeInfo.height;

          anotherOutHeapSize = spsParser.getSizeInfo().decodeSize;

          if (outputHeapSize !== anotherOutHeapSize) {
            console.log("outputSize: " + outputHeapSize);
            outputHeapSize = anotherOutHeapSize;
          }

          if (preWidth !== width || preHeight !== height) {
            console.log("resolution changed!");
            preWidth = width;
            preHeight = height;
          }

          inputBuffer = setBuffer(inputBuffer, PREFIX);
          inputBuffer = setBuffer(inputBuffer, PAYLOAD);
          spsSegment = PAYLOAD;
          //console.log('width： ',width, 'height: ', height)
          curSize = sizeInfo.decodeSize;
          firstIframe = true;
          //console.log(spsSegment)
          if (frameRate === null) {
            frameRate = spsParser.getFPS();
          }
          break;
        case 8: //PPS
          //console.log('PPS')
          inputBuffer = setBuffer(inputBuffer, PREFIX);
          inputBuffer = setBuffer(inputBuffer, PAYLOAD);
          ppsSegment = PAYLOAD;
          //console.log(ppsSegment)
          break;
        case 28: //FU
          //console.log('FU');
          let startBit = (PAYLOAD[1] & 0x80) === 0x80,
            endBit = (PAYLOAD[1] & 0x40) === 0x40,
            fuType = PAYLOAD[1] & 0x1f,
            payloadStartIndex = 2;
          //console.log('startBit: ' + startBit + ' endBit: ' + endBit)
          //console.log('fuType: ' + fuType)
          if (startBit === true && endBit === false) {
            let newNalHeader = new Uint8Array(1);
            newNalHeader[0] = (PAYLOAD[0] & 0xe0) | fuType;

            inputBuffer = setBuffer(inputBuffer, PREFIX);
            inputBuffer = setBuffer(inputBuffer, newNalHeader);
            inputBuffer = setBuffer(
              inputBuffer,
              PAYLOAD.subarray(payloadStartIndex, PAYLOAD.length)
            );
          } else {
            //console.log(startBit, endBit, 'endBit')
            inputBuffer = setBuffer(
              inputBuffer,
              PAYLOAD.subarray(payloadStartIndex, PAYLOAD.length)
            );
            end = true;
          }
          //console.log(startBit,endBit)
          // if(endBit === true) {
          //     end = true;
          // }
          break;
        case 1:
          inputBuffer = setBuffer(inputBuffer, PREFIX);
          inputBuffer = setBuffer(inputBuffer, PAYLOAD);
          break;
        default:
          break;
      }

      let frameType = "";

      if (RtpHeader.M) {
        if (!firstIframe) {
          inputLength = 0;
          return;
        }

        if (
          rtpTimeStamp < lastTimeStamp &&
          lastTimeStamp - rtpTimeStamp > RESETTIME / 2
        ) {
          resetTimeCount++;
        }
        rtpTimeStamp = rtpTimeStamp + RESETTIME * resetTimeCount;

        if (SEIInfo.timestamp === RtpHeader.timeStamp) {
          SEIInfo.timestamp = rtpTimeStamp;
          data.SEIInfo = SEIInfo;

          lastTime = rtpTimeStamp;
        }

        let inputBufferSub = inputBuffer.subarray(0, inputLength);

        if ((inputBufferSub[4] & 0x1f) === 7) {
          frameType = "I";
        } else {
          frameType = "P";
        }

        if (!initalSegmentFlag) {
          data.initSegmentData = null;
          data.codecInfo = null;
        } else {
          initalSegmentFlag = false;
          const info = {
            id: 1,
            width: width,
            height: height,
            type: "video",
            profileIdc: spsParser.getSpsValue("profile_idc"),
            profileCompatibility: 0,
            levelIdc: spsParser.getSpsValue("level_idc"),
            sps: [spsSegment],
            pps: [ppsSegment],
            timescale: 1e3,
            fps: frameRate,
          };
          data.initSegmentData = mp4Remux.initSegment(info);
          data.codecInfo = spsParser.getCodecInfo();
        }

        if (frameType === "I") {
          let h264parameterLength = spsSegment.length + ppsSegment.length + 8;
          inputSegBufferSub = inputBufferSub.subarray(
            h264parameterLength,
            inputBufferSub.length
          );
        } else {
          inputSegBufferSub = inputBufferSub.subarray(0, inputBufferSub.length);
        }

        let segSize = inputSegBufferSub.length - 4;

        inputSegBufferSub[0] = (4278190080 & segSize) >>> 24;
        inputSegBufferSub[1] = (16711680 & segSize) >>> 16;
        inputSegBufferSub[2] = (65280 & segSize) >>> 8;
        inputSegBufferSub[3] = 255 & segSize;

        data.frameData = new Uint8Array(inputSegBufferSub);

        let sample = {
          duration: Math.round((1 / frameRate) * 1000),
          size: inputSegBufferSub.length,
          frame_time_stamp: null,
          frameDuration: null,
        };
        sample.frame_time_stamp = rtpTimeStamp;
        if (initalMediaFrameFlag) {
          sample.frameDuration = 0;
          initalMediaFrameFlag = false;
        } else {
          if (frameRate) {
            sample.frameDuration = Math.round(1000 / frameRate);
          } else {
            sample.frameDuration =
              (sample.frame_time_stamp - preSample.frame_time_stamp) / 90; // 时钟频率90000，timescale=1000
          }
        }
        preSample = sample;

        data.mediaSample = sample;
        data.timeStamp = rtpTimeStamp;

        this.handleDecodedData(data);
        inputLength = 0;
        data.SEIInfo = null;
        inputSegBufferSub = null;
        lastTimeStamp = RtpHeader.timeStamp;
      }
    },

    set rtpSessionCallback(func) {
      this.handleDecodedData = func;
    },

    setFramerate(fps) {
      frameRate = fps;
      //console.log('frameRate: ', frameRate)
    },

    setResolutionChangedCallback(callback) {
      this.resolutionChangedCallback = callback;
    },
  };

  return new constructor();

  function setBuffer(buffer1, buffer2) {
    let bufferTemp = buffer1;
    if (inputLength + buffer2.length > buffer1.length) {
      bufferTemp = new Uint8Array(buffer1.length + size1M);
    }

    bufferTemp.set(buffer2, inputLength);
    inputLength += buffer2.length;
    return bufferTemp;
  }
}

/**
 * 去除SPS中的Emulation字节
 * @param data SPS源数据
 * @returns {Array} 去除后Emulation字节后的SPS
 */
function removeH264or5EmulationBytes(data) {
  let toSize = 0;
  let i = 0;
  let to = [];
  let dataLength = data.length;
  while (i < dataLength) {
    if (
      i + 2 < dataLength &&
      data[i] === 0 &&
      data[i + 1] === 0 &&
      data[i + 2] === 3
    ) {
      to[toSize] = to[toSize + 1] = 0;
      toSize += 2;
      i += 3;
    } else {
      to[toSize] = data[i];
      toSize += 1;
      i += 1;
    }
  }
  return to;
}
