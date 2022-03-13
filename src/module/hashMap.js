var Map = function () {
  this.map = {};
};
Map.prototype = {
  put: function (a, b) {
    this.map[a] = b;
  },
  get: function (a) {
    return this.map[a];
  },
  containsKey: function (a) {
    return a in this.map;
  },
  containsValue: function (a) {
    for (var b in this.map) if (this.map[b] === a) return !0;
    return !1;
  },
  isEmpty: function () {
    return 0 === this.size();
  },
  clear: function () {
    for (var a in this.map) delete this.map[a];
  },
  remove: function (a) {
    delete this.map[a];
  },
  keys: function () {
    var a = new Array();
    for (var b in this.map) a.push(b);
    return a;
  },
  values: function () {
    var a = new Array();
    for (var b in this.map) a.push(this.map[b]);
    return a;
  },
  size: function () {
    var a = 0;
    for (var b in this.map) a++;
    return a;
  },
};
