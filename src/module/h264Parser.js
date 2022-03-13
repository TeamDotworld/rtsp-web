"use strict";
function H264SPSParser() {
  function a() {
    (x = 0), (y = new Map());
  }
  function b(a, b) {
    var c = b,
      d = (x + c) >> l;
    return (c = (x + b) & i), (a[d] >> (j - (c & j))) & 1;
  }
  function c(a) {
    var b = x >> l,
      c = 8 * (b + 1),
      d = c - x;
    if (8 > d)
      for (var e = 0; 3 > e; e++) {
        var f = a[b + e];
        (f =
          0 == e
            ? (f >> d) << d
            : 2 == e
            ? (f & (255 >> (8 - d))) | (1 << d)
            : 0),
          a.set([f], b + e);
      }
    else a.set([0], b), a.set([1], b + 1);
  }
  function d(a, c) {
    var d = 0,
      e = 0,
      f = 0;
    if (1 === c) e = b(a, d);
    else for (var g = 0; c > g; g++) (f = b(a, g)), (e = (e << 1) + f);
    return (x += c), e;
  }
  function e(a, c) {
    for (
      var d = 0, e = 0, f = 0, g = c;
      x + g < 8 * a.length && !(e = b(a, g++));

    )
      d++;
    if (0 === d) return (x += 1), 0;
    f = 1 << d;
    for (var h = d - 1; h >= 0; h--, g++) (e = b(a, g)), (f |= e << h);
    var i = d * k + 1;
    return (x += i), f - 1;
  }
  function f(a, b) {
    var c = e(a, b);
    return 1 & c ? (c + 1) / k : -c / k;
  }
  function g(a) {
    y.put("cpb_cnt_minus1", e(a, 0)),
      y.put("bit_rate_scale", d(a, m)),
      y.put("cpb_size_scale", d(a, m));
    for (
      var b = y.get("cpb_cnt_minus1"),
        c = new Array(b),
        f = new Array(b),
        g = new Array(b),
        h = 0;
      b >= h;
      h++
    )
      (c[h] = e(a, 0)), (f[h] = e(a, 0)), (g[h] = d(a, 1));
    y.put("bit_rate_value_minus1", c),
      y.put("cpb_size_value_minus1", f),
      y.put("cbr_flag", g),
      y.put("initial_cpb_removal_delay_length_minus1", d(a, n)),
      y.put("cpb_removal_delay_length_minus1", d(a, n)),
      y.put("dpb_output_delay_length_minus1", d(a, n)),
      y.put("time_offset_length", d(a, n));
  }
  function h(a) {
    y.put("aspect_ratio_info_present_flag", d(a, 1)),
      y.get("aspect_ratio_info_present_flag") &&
        (y.put("aspect_ratio_idc", d(a, p)),
        y.get("aspect_ratio_idc") === v &&
          (c(a, s),
          y.put("sar_width", d(a, s)),
          c(a, s),
          y.put("sar_height", d(a, s)))),
      y.put("overscan_info_present_flag", d(a, 1)),
      y.get("overscan_info_present_flag") &&
        y.put("overscan_appropriate_flag", d(a, 1)),
      y.put("video_signal_type_present_flag", d(a, 1)),
      y.get("video_signal_type_present_flag") &&
        (y.put("video_format", d(a, l)),
        y.put("video_full_range_flag", d(a, 1)),
        y.put("colour_description_present_flag", d(a, 1)),
        y.get("colour_description_present_flag") &&
          (y.put("colour_primaries", d(a, p)),
          y.put("transfer_characteristics", d(a, p)),
          y.put("matrix_coefficients", d(a, p)))),
      y.put("chroma_loc_info_present_flag", d(a, 1)),
      y.get("chroma_loc_info_present_flag") &&
        (y.put("chroma_sample_loc_type_top_field", e(a, 0)),
        y.put("chroma_sample_loc_type_bottom_field", e(a, 0))),
      y.put("timing_info_present_flag", d(a, 1)),
      y.get("timing_info_present_flag") &&
        (y.put("num_units_in_tick", d(a, t)),
        y.put("time_scale", d(a, t)),
        y.put("fixed_frame_rate_flag", d(a, 1))),
      y.put("nal_hrd_parameters_present_flag", d(a, 1)),
      y.get("nal_hrd_parameters_present_flag") && g(a),
      y.put("vcl_hrd_parameters_present_flag", d(a, 1)),
      y.get("vcl_hrd_parameters_present_flag") && g(a),
      (y.get("nal_hrd_parameters_present_flag") ||
        y.get("vcl_hrd_parameters_present_flag")) &&
        y.put("low_delay_hrd_flag", d(a, 1)),
      y.put("pic_struct_present_flag", d(a, 1)),
      y.put("bitstream_restriction_flag", d(a, 1)),
      y.get("bitstream_restriction_flag") &&
        (y.put("motion_vectors_over_pic_boundaries_flag", d(a, 1)),
        y.put("max_bytes_per_pic_denom", e(a, 0)),
        y.put("max_bits_per_mb_denom", e(a, 0)));
  }
  var i = 7,
    j = 7,
    k = 2,
    l = 3,
    m = 4,
    n = 5,
    o = 6,
    p = 8,
    q = 12,
    r = 15,
    s = 16,
    t = 32,
    u = 64,
    v = 255,
    w = 256,
    x = 0,
    y = null;
  return (
    (a.prototype = {
      parse: function (a) {
        (x = 0),
          y.clear(),
          y.put("forbidden_zero_bit", d(a, 1)),
          y.put("nal_ref_idc", d(a, k)),
          y.put("nal_unit_type", d(a, n)),
          y.put("profile_idc", d(a, p)),
          y.put("profile_compatibility", d(a, p)),
          y.put("level_idc", d(a, p)),
          y.put("seq_parameter_set_id", e(a, 0));
        var b = y.get("profile_idc"),
          c = 100,
          g = 110,
          i = 122,
          j = 244,
          m = 44,
          r = 83,
          t = 86,
          v = 118,
          z = 128,
          A = 138,
          B = 139,
          C = 134;
        if (
          (b === c ||
            b === g ||
            b === i ||
            b === j ||
            b === m ||
            b === r ||
            b === t ||
            b === v ||
            b === z ||
            b === A ||
            b === B ||
            b === C) &&
          (y.put("chroma_format_idc", e(a, 0)),
          y.get("chroma_format_idc") === l &&
            y.put("separate_colour_plane_flag", d(a, 1)),
          y.put("bit_depth_luma_minus8", e(a, 0)),
          y.put("bit_depth_chroma_minus8", e(a, 0)),
          y.put("qpprime_y_zero_transform_bypass_flag", d(a, 1)),
          y.put("seq_scaling_matrix_present_flag", d(a, 1)),
          y.get("seq_scaling_matrix_present_flag"))
        ) {
          for (
            var D = y.get("chroma_format_idc") !== l ? p : q,
              E = new Array(D),
              F = 0;
            D > F;
            F++
          )
            if (((E[F] = d(a, 1)), E[F]))
              for (
                var G = o > F ? s : u, H = 8, I = 8, J = 0, K = 0;
                G > K;
                K++
              )
                I && ((J = f(a, 0)), (I = (H + J + w) % w)),
                  (H = 0 === I ? H : I);
          y.put("seq_scaling_list_present_flag", E);
        }
        if (
          (y.put("log2_max_frame_num_minus4", e(a, 0)),
          y.put("pic_order_cnt_type", e(a, 0)),
          0 === y.get("pic_order_cnt_type"))
        )
          y.put("log2_max_pic_order_cnt_lsb_minus4", e(a, 0));
        else if (1 === y.get("pic_order_cnt_type")) {
          y.put("delta_pic_order_always_zero_flag", d(a, 1)),
            y.put("offset_for_non_ref_pic", f(a, 0)),
            y.put("offset_for_top_to_bottom_field", f(a, 0)),
            y.put("num_ref_frames_in_pic_order_cnt_cycle", e(a, 0));
          for (
            var L = 0;
            L < y.get("num_ref_frames_in_pic_order_cnt_cycle");
            L++
          )
            y.put("num_ref_frames_in_pic_order_cnt_cycle", f(a, 0));
        }
        return (
          y.put("num_ref_frames", e(a, 0)),
          y.put("gaps_in_frame_num_value_allowed_flag", d(a, 1)),
          y.put("pic_width_in_mbs_minus1", e(a, 0)),
          y.put("pic_height_in_map_units_minus1", e(a, 0)),
          y.put("frame_mbs_only_flag", d(a, 1)),
          0 === y.get("frame_mbs_only_flag") &&
            y.put("mb_adaptive_frame_field_flag", d(a, 1)),
          y.put("direct_8x8_interence_flag", d(a, 1)),
          y.put("frame_cropping_flag", d(a, 1)),
          1 === y.get("frame_cropping_flag") &&
            (y.put("frame_cropping_rect_left_offset", e(a, 0)),
            y.put("frame_cropping_rect_right_offset", e(a, 0)),
            y.put("frame_cropping_rect_top_offset", e(a, 0)),
            y.put("frame_cropping_rect_bottom_offset", e(a, 0))),
          y.put("vui_parameters_present_flag", d(a, 1)),
          y.get("vui_parameters_present_flag") && h(a),
          !0
        );
      },
      getSizeInfo: function () {
        var a = 0,
          b = 0;
        0 === y.get("chroma_format_idc")
          ? (a = b = 0)
          : 1 === y.get("chroma_format_idc")
          ? (a = b = k)
          : y.get("chroma_format_idc") === k
          ? ((a = k), (b = 1))
          : y.get("chroma_format_idc") === l &&
            (0 === y.get("separate_colour_plane_flag")
              ? (a = b = 1)
              : 1 === y.get("separate_colour_plane_flag") && (a = b = 0));
        var c = y.get("pic_width_in_mbs_minus1") + 1,
          d = y.get("pic_height_in_map_units_minus1") + 1,
          e = (k - y.get("frame_mbs_only_flag")) * d,
          f = 0,
          g = 0,
          h = 0,
          i = 0;
        1 === y.get("frame_cropping_flag") &&
          ((f = y.get("frame_cropping_rect_left_offset")),
          (g = y.get("frame_cropping_rect_right_offset")),
          (h = y.get("frame_cropping_rect_top_offset")),
          (i = y.get("frame_cropping_rect_bottom_offset")));
        var j = c * s * e * s,
          m = c * s - a * (f + g),
          n = e * s - b * (k - y.get("frame_mbs_only_flag")) * (h + i),
          o = {
            width: m,
            height: n,
            decodeSize: j,
          };
        return o;
      },
      getSpsValue: function (a) {
        return y.get(a);
      },
      getCodecInfo: function () {
        var a = y.get("profile_idc").toString(s),
          b =
            y.get("profile_compatibility") < r
              ? "0" + y.get("profile_compatibility").toString(s)
              : y.get("profile_compatibility").toString(s),
          c = y.get("level_idc").toString(s);
        return a + b + c;
      },
    }),
    new a()
  );
}
