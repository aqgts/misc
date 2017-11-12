(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  readBinaryFromFileAsync: function readBinaryFromFileAsync(inputFile) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(new Uint8Array(reader.result));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(inputFile);
    });
  },
  saveBinaryAsFile: function saveBinaryAsFile(binary, fileName) {
    var mime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "application/octet-stream";

    var blob = new Blob([binary], { type: mime });
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.setAttribute("href", URL.createObjectURL(blob));
      a.setAttribute("download", fileName);
      a.click();
      document.body.removeChild(a);
    }
  },
  readImageFromFileAsync: function readImageFromFileAsync(inputFile) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var image = new Image();
        image.onload = function () {
          resolve(image);
        };
        image.onerror = reject;
        image.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(inputFile);
    });
  }
};

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cuboid = function () {
  function Cuboid(x, y, z, width, height, length) {
    _classCallCheck(this, Cuboid);

    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.length = length;
  }

  _createClass(Cuboid, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.x, this.y, this.z, this.width, this.height, this.length);
    }
  }, {
    key: "intersects",
    value: function intersects(other) {
      return Math.max(this.x, other.x) <= Math.min(this.x + this.width, other.x + other.width) && Math.max(this.y, other.y) <= Math.min(this.y + this.height, other.y + other.height) && Math.max(this.z, other.z) <= Math.min(this.z + this.length, other.z + other.length);
    }
  }]);

  return Cuboid;
}();

exports.default = Cuboid;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vector = require("./vector2");

var _vector2 = _interopRequireDefault(_vector);

var _line2d = require("./line-2d");

var _line2d2 = _interopRequireDefault(_line2d);

var _polygon = require("./polygon");

var _polygon2 = _interopRequireDefault(_polygon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DirectedLineSegment2D = function () {
  function DirectedLineSegment2D(p1, p2) {
    _classCallCheck(this, DirectedLineSegment2D);

    if (p1.equals(p2)) throw new Error("Zero length line segment.");
    this.p1 = p1;
    this.p2 = p2;
  }

  _createClass(DirectedLineSegment2D, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.p1.clone(), this.p2.clone());
    }
  }, {
    key: "reverse",
    value: function reverse() {
      return new this.constructor(this.p2, this.p1);
    }
  }, {
    key: "equals",
    value: function equals(other) {
      return this === other || this.p1.equals(other.p1) && this.p2.equals(other.p2);
    }
  }, {
    key: "toVector",
    value: function toVector() {
      return this.p2.subtract(this.p1);
    }
  }, {
    key: "length",
    value: function length() {
      return this.toVector().norm();
    }
  }, {
    key: "squaredLength",
    value: function squaredLength() {
      return this.toVector().squaredNorm();
    }
  }, {
    key: "midpoint",
    value: function midpoint() {
      return this.p1.add(this.p2).divide(2);
    }
  }, {
    key: "contains",
    value: function contains(p) {
      if (p.equals(this.p1) || p.equals(this.p2)) return true;
      var l = _line2d2.default.through(this.p1, this.p2);
      if (!l.contains(p)) return false;
      var d = p.subtract(this.p1).innerProduct(this.toVector());
      return 0 <= d && d <= this.toVector().squaredNorm();
    }
  }, {
    key: "crosses",
    value: function crosses(other) {
      // 唯一の交点を持つ
      return this.crossPoint(other) !== null;
    }
  }, {
    key: "crossPoint",
    value: function crossPoint(other) {
      // 唯一の交点
      var intersections = this.intersection(other);
      return intersections.length > 0 && intersections[0] instanceof _vector2.default ? intersections[0] : null;
    }
  }, {
    key: "intersects",
    value: function intersects(other) {
      // 共通部分を持つ
      return this.intersection(other).length > 0;
    }
  }, {
    key: "intersection",
    value: function intersection(other) {
      // 共通部分
      if (other instanceof DirectedLineSegment2D) {
        var l1 = _line2d2.default.through(this.p1, this.p2);
        var l2 = _line2d2.default.through(other.p1, other.p2);
        if (l1.equals(l2)) {
          var base = this.toVector();
          var fixedOther = base.innerProduct(other.toVector()) > 0 ? other : other.reverse();
          var d1 = 0;
          var d2 = base.innerProduct(base);
          var d3 = base.innerProduct(fixedOther.p1.subtract(this.p1));
          var d4 = base.innerProduct(fixedOther.p2.subtract(this.p1));
          if (d1 === d4) return [this.p1];
          if (d2 === d3) return [this.p2];
          if (d3 <= d1 && d2 <= d4) return [this];
          if (d1 <= d3 && d4 <= d2) return [fixedOther];
          if (d3 <= d1 && d1 <= d4 && d4 <= d2) return [new this.constructor(this.p1, fixedOther.p2)];
          if (d1 <= d3 && d3 <= d2 && d2 <= d4) return [new this.constructor(fixedOther.p1, this.p2)];
          return [];
        }
        if (l1.isParallelTo(l2)) return [];
        if (this.p1.equals(other.p1) || this.p1.equals(other.p2)) return [this.p1];
        if (this.p2.equals(other.p1) || this.p2.equals(other.p2)) return [this.p2];
        if (((other.p1.y - this.p1.y) * (this.p2.x - this.p1.x) - (this.p2.y - this.p1.y) * (other.p1.x - this.p1.x)) * ((other.p2.y - this.p1.y) * (this.p2.x - this.p1.x) - (this.p2.y - this.p1.y) * (other.p2.x - this.p1.x)) > 0 || ((this.p1.y - other.p1.y) * (other.p2.x - other.p1.x) - (other.p2.y - other.p1.y) * (this.p1.x - other.p1.x)) * ((this.p2.y - other.p1.y) * (other.p2.x - other.p1.x) - (other.p2.y - other.p1.y) * (this.p2.x - other.p1.x)) > 0) return [];
        return [l1.crossPoint(l2)];
      } else if (other instanceof _line2d2.default) {
        var thisLine = _line2d2.default.through(this.p1, this.p2);
        if (thisLine.equals(other)) return [this];
        if (other.contains(this.p1)) return [this.p1];
        if (other.contains(this.p2)) return [this.p2];
        if ((other.a * this.p1.x + other.b * this.p1.y + other.c) * (other.a * this.p2.x + other.b * this.p2.y + other.c) > 0) return [];
        return [thisLine.crossPoint(other)];
      } else {
        throw new Error("Unknown type");
      }
    }
  }, {
    key: "subtract",
    value: function subtract(other) {
      var _this = this;

      if (other instanceof this.constructor) {
        var intersections = this.intersection(other);
        if (intersections.length === 0 || intersections[0] instanceof _vector2.default) return [this];
        var lineSegment = intersections[0];
        if (this.equals(lineSegment)) return [];
        if (this.p1.equals(lineSegment.p1)) return [new this.constructor(lineSegment.p2, this.p2)];
        if (this.p2.equals(lineSegment.p2)) return [new this.constructor(this.p1, lineSegment.p1)];
        return [new this.constructor(this.p1, lineSegment.p1), new this.constructor(lineSegment.p2, this.p2)];
      } else if (other instanceof _polygon2.default) {
        var keys = _([this.p1].concat(other.lineSegments().map(function (lineSegment) {
          return _this.intersection(lineSegment);
        }).filter(function (intersections) {
          return intersections.length > 0;
        }).map(function (intersections) {
          return intersections[0];
        }), [this.p2])).sortBy(function (key) {
          return (key instanceof _vector2.default ? key : key.midpoint()).subtract(_this.p1).innerProduct(_this.toVector());
        }).value();
        return _(keys.slice(0, -1)).zip(keys.slice(1)).flatMap(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              key1 = _ref2[0],
              key2 = _ref2[1];

          var p1 = key1 instanceof _vector2.default ? key1 : key1.p2;
          var p2 = key2 instanceof _vector2.default ? key2 : key2.p1;
          return p1.equals(p2) ? [] : [new _this.constructor(p1, p2)];
        }).value().filter(function (difference) {
          return !other.contains(difference.midpoint());
        });
      }
    }
  }]);

  return DirectedLineSegment2D;
}();

exports.default = DirectedLineSegment2D;

},{"./line-2d":5,"./polygon":14,"./vector2":22}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vector = require("./vector3");

var _vector2 = _interopRequireDefault(_vector);

var _line3d = require("./line-3d");

var _line3d2 = _interopRequireDefault(_line3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DirectedLineSegment3D = function () {
  function DirectedLineSegment3D(p1, p2) {
    _classCallCheck(this, DirectedLineSegment3D);

    if (p1.equals(p2)) throw new Error("Zero length line segment.");
    this.p1 = p1;
    this.p2 = p2;
  }

  _createClass(DirectedLineSegment3D, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.p1.clone(), this.p2.clone());
    }
  }, {
    key: "reverse",
    value: function reverse() {
      return new this.constructor(this.p2, this.p1);
    }
  }, {
    key: "equals",
    value: function equals(other) {
      return this === other || this.p1.equals(other.p1) && this.p2.equals(other.p2);
    }
  }, {
    key: "toVector",
    value: function toVector() {
      return this.p2.subtract(this.p1);
    }
  }, {
    key: "length",
    value: function length() {
      return this.toVector().norm();
    }
  }, {
    key: "contains",
    value: function contains(p) {
      if (p.equals(this.p1) || p.equals(this.p2)) return true;
      var l = _line3d2.default.through(this.p1, this.p2);
      if (!l.contains(p)) return false;
      var d = p.subtract(this.p1).innerProduct(this.toVector());
      return 0 <= d && d <= this.toVector().squaredNorm();
    }
  }]);

  return DirectedLineSegment3D;
}();

exports.default = DirectedLineSegment3D;

},{"./line-3d":6,"./vector3":23}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vector = require("./vector2");

var _vector2 = _interopRequireDefault(_vector);

var _directedLineSegment2d = require("./directed-line-segment-2d");

var _directedLineSegment2d2 = _interopRequireDefault(_directedLineSegment2d);

var _triangle2d = require("./triangle-2d");

var _triangle2d2 = _interopRequireDefault(_triangle2d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Line2D = function () {
  function Line2D(a, b, c) {
    _classCallCheck(this, Line2D);

    this.a = a;
    this.b = b;
    this.c = c;
  }

  _createClass(Line2D, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.a, this.b, this.c);
    }
  }, {
    key: "contains",
    value: function contains(p) {
      return this.a * p.x + this.b * p.y + this.c === 0;
    }
  }, {
    key: "isParallelTo",
    value: function isParallelTo(other) {
      // 同一直線である場合は含まない
      return this.a * other.b === this.b * other.a && (this.b * other.c !== this.c * other.b || this.c * other.a !== this.a * other.c);
    }
  }, {
    key: "crosses",
    value: function crosses(other) {
      // 唯一の交点を持つ
      return this.a * other.b - other.a * this.b !== 0;
    }
  }, {
    key: "crossPoint",
    value: function crossPoint(other) {
      // 唯一の交点
      if (!this.crosses(other)) return null;
      return new _vector2.default((this.b * other.c - other.b * this.c) / (this.a * other.b - other.a * this.b), (other.a * this.c - this.a * other.c) / (this.a * other.b - other.a * this.b));
    }
  }, {
    key: "intersects",
    value: function intersects(other) {
      // 共通部分を持つ
      return this.equals(other) || this.crosses(other);
    }
  }, {
    key: "intersection",
    value: function intersection(other) {
      // 共通部分
      if (other instanceof Line2D) {
        if (this.equals(other)) return [this];
        if (this.crosses(other)) return [this.crossPoint(other)];
        return [];
      } else if (other instanceof _directedLineSegment2d2.default) {
        return other.intersection(this);
      } else if (other instanceof _triangle2d2.default) {
        return other.intersection(this);
      } else {
        throw new Error("Unknown type");
      }
    }
  }, {
    key: "subtract",
    value: function subtract(other) {
      return this.equals(other) ? [] : [this];
    }
  }, {
    key: "equals",
    value: function equals(other) {
      return this === other || this.b * other.c === this.c * other.b && this.c * other.a === this.a * other.c && this.a * other.b === this.b * other.a;
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.a + "x" + (this.b < 0 ? "-" : "+") + Math.abs(this.b) + "y" + (this.c < 0 ? "-" : "+") + Math.abs(this.c) + "=0";
    }
  }], [{
    key: "through",
    value: function through(p1, p2) {
      if (p1.equals(p2)) throw new Error("p1 is identical to p2");
      return new this(p1.y - p2.y, p2.x - p1.x, (p2.y - p1.y) * p1.x - (p2.x - p1.x) * p1.y);
    }
  }]);

  return Line2D;
}();

exports.default = Line2D;

},{"./directed-line-segment-2d":3,"./triangle-2d":19,"./vector2":22}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Line3D = function () {
  function Line3D(a, d) {
    _classCallCheck(this, Line3D);

    this.a = a;
    this.d = d;
  }

  _createClass(Line3D, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.a.clone(), this.d.clone());
    }
  }, {
    key: "contains",
    value: function contains(p) {
      return this.d.y * p.x + this.d.x * this.a.y === this.d.x * p.y + this.d.y * this.a.x && this.d.z * p.x + this.d.x * this.a.z === this.d.x * p.z + this.d.z * this.a.x && this.d.z * p.y + this.d.y * this.a.z === this.d.y * p.z + this.d.z * this.a.y;
    }
  }, {
    key: "equals",
    value: function equals(other) {
      return this === other || this.contains(other.a) && this.contains(other.a.add(other.d));
    }
  }], [{
    key: "through",
    value: function through(p1, p2) {
      if (p1.equals(p2)) throw new Error("p1 is identical to p2");
      return new this(p1, p2.subtract(p1));
    }
  }]);

  return Line3D;
}();

exports.default = Line3D;

},{}],7:[function(require,module,exports){
"use strict";

_.mixin({
  rangeClosed: function rangeClosed(arg1, arg2, arg3) {
    switch (arguments.length) {
      case 1:
        return _.range(arg1 + 1);
      case 2:
        return _.range(arg1, arg2 + 1);
      case 3:
        return _.range(arg1, arg2 + 1, arg3);
    }
  }
}, { chain: false });

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vector = require("./vector");

var _vector2 = _interopRequireDefault(_vector);

var _vector3 = require("./vector2");

var _vector4 = _interopRequireDefault(_vector3);

var _vector5 = require("./vector3");

var _vector6 = _interopRequireDefault(_vector5);

var _vector7 = require("./vector4");

var _vector8 = _interopRequireDefault(_vector7);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Matrix = function () {
  function Matrix() {
    var _this = this;

    _classCallCheck(this, Matrix);

    for (var _len = arguments.length, rows = Array(_len), _key = 0; _key < _len; _key++) {
      rows[_key] = arguments[_key];
    }

    rows.forEach(function (row, i) {
      _this[i] = row;
    });
    this.length = rows.length;
  }

  _createClass(Matrix, [{
    key: "clone",
    value: function clone() {
      return new (Function.prototype.bind.apply(this, [null].concat(_toConsumableArray(this.to2DArray()))))();
    }
  }, {
    key: "rowCount",
    value: function rowCount() {
      return this.length;
    }
  }, {
    key: "columnCount",
    value: function columnCount() {
      return this[0].length;
    }
  }, {
    key: "multiply",
    value: function multiply(other) {
      if (other instanceof Matrix) {
        if (this.columnCount() !== other.rowCount()) throw new Error("Cannot multiply.");
        var buffer = this.constructor.zero(this.rowCount(), other.columnCount()).to2DArray();
        for (var i = 0; i < this.rowCount(); i++) {
          for (var j = 0; j < other.rowCount(); j++) {
            for (var k = 0; k < this.columnCount(); k++) {
              buffer[i][j] += this[i][k] * other[k][j];
            }
          }
        }
        return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(buffer))))();
      } else if (other instanceof _vector2.default) {
        var args = this.multiply(this.constructor.fromColumnVectors(other)).transpose()[0];
        switch (args.length) {
          case 2:
            return new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(args))))();
          case 3:
            return new (Function.prototype.bind.apply(_vector6.default, [null].concat(_toConsumableArray(args))))();
          case 4:
            return new (Function.prototype.bind.apply(_vector8.default, [null].concat(_toConsumableArray(args))))();
          default:
            return new (Function.prototype.bind.apply(_vector2.default, [null].concat(_toConsumableArray(args))))();
        }
      } else if (typeof other === "number") {
        return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(Array.from(this).map(function (row) {
          return row.map(function (value) {
            return value * other;
          });
        })))))();
      } else {
        throw new Error("Unknown type.");
      }
    }
  }, {
    key: "divide",
    value: function divide(other) {
      return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(Array.from(this).map(function (row) {
        return row.map(function (value) {
          return value / other;
        });
      })))))();
    }
  }, {
    key: "transpose",
    value: function transpose() {
      var _this2 = this;

      return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(_.range(this.columnCount()).map(function (columnIndex) {
        return _.range(_this2.rowCount()).map(function (rowIndex) {
          return _this2[rowIndex][columnIndex];
        });
      })))))();
    }
  }, {
    key: "isSquare",
    value: function isSquare() {
      return this.rowCount() === this.columnCount();
    }
  }, {
    key: "determinant",
    value: function determinant() {
      if (!this.isSquare()) throw new Error("Not square matrix.");
      if (!("_determinant" in this)) {
        var n = this.rowCount();
        switch (n) {
          case 1:
            this._determinant = this[0][0];
            break;
          case 2:
            this._determinant = this[0][0] * this[1][1] - this[0][1] * this[1][0];
            break;
          case 3:
            this._determinant = this[0][0] * this[1][1] * this[2][2] + this[1][0] * this[2][1] * this[0][2] + this[2][0] * this[0][1] * this[1][2] - this[0][2] * this[1][1] * this[2][0] - this[1][2] * this[2][1] * this[0][0] - this[2][2] * this[0][1] * this[1][0];
            break;
          default:
            var a = this.to2DArray();
            for (var i = 0; i < n; i++) {
              for (var j = 0; j < n; j++) {
                if (i < j) {
                  var tmp = a[j][i] / a[i][i];
                  for (var k = 0; k < n; k++) {
                    a[j][k] -= a[i][k] * tmp;
                  }
                }
              }
            }
            this._determinant = _.range(n).map(function (i) {
              return a[i][i];
            }).reduce(_.multiply, 1);
            break;
        }
      }
      return this._determinant;
    }
  }, {
    key: "isRegular",
    value: function isRegular() {
      return this.determinant() !== 0;
    }
  }, {
    key: "inverse",
    value: function inverse() {
      if (!this.isRegular()) throw new Error("Not regular matrix.");
      var n = this.rowCount();
      switch (n) {
        case 1:
          return new this.constructor([1 / this.determinant()]);
        case 2:
          return new this.constructor([this[1][1], -this[0][1]], [-this[1][0], this[0][0]]).divide(this.determinant());
        case 3:
          return new this.constructor([this[1][1] * this[2][2] - this[1][2] * this[2][1], this[0][2] * this[2][1] - this[0][1] * this[2][2], this[0][1] * this[1][2] - this[0][2] * this[1][1]], [this[1][2] * this[2][0] - this[1][0] * this[2][2], this[0][0] * this[2][2] - this[0][2] * this[2][0], this[0][2] * this[1][0] - this[0][0] * this[1][2]], [this[1][0] * this[2][1] - this[1][1] * this[2][0], this[0][1] * this[2][0] - this[0][0] * this[2][1], this[0][0] * this[1][1] - this[0][1] * this[1][0]]).divide(this.determinant());
        default:
          var a = this.to2DArray();
          var inv = this.constructor.identity(n).to2DArray();
          for (var i = 0; i < n; i++) {
            var tmp1 = 1 / a[i][i];
            for (var j = 0; j < n; j++) {
              a[i][j] *= tmp1;
              inv[i][j] *= tmp1;
            }
            for (var _j = 0; _j < n; _j++) {
              if (i != _j) {
                var tmp2 = a[_j][i];
                for (var k = 0; k < n; k++) {
                  a[_j][k] -= a[i][k] * tmp2;
                  inv[_j][k] -= inv[i][k] * tmp2;
                }
              }
            }
          }
          return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(inv))))();
      }
    }
  }, {
    key: "to2DArray",
    value: function to2DArray() {
      return Array.from(this).map(function (row) {
        return row.slice();
      });
    }
  }], [{
    key: "fromColumnVectors",
    value: function fromColumnVectors() {
      for (var _len2 = arguments.length, columnVectors = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        columnVectors[_key2] = arguments[_key2];
      }

      return new (Function.prototype.bind.apply(this, [null].concat(_toConsumableArray(Array.prototype.map.call(columnVectors[0], function (value, rowIndex) {
        return Array.prototype.map.call(columnVectors, function (columnVector) {
          return columnVector[rowIndex];
        });
      })))))();
    }
  }, {
    key: "fromRowVectors",
    value: function fromRowVectors() {
      for (var _len3 = arguments.length, rowVectors = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        rowVectors[_key3] = arguments[_key3];
      }

      return new (Function.prototype.bind.apply(this, [null].concat(_toConsumableArray(Array.prototype.map.call(rowVectors, function (rowVector) {
        return Array.from(rowVector);
      })))))();
    }
  }, {
    key: "identity",
    value: function identity(n) {
      return new (Function.prototype.bind.apply(this, [null].concat(_toConsumableArray(_.range(n).map(function (i) {
        return _.range(n).map(function (j) {
          return i === j ? 1 : 0;
        });
      })))))();
    }
  }, {
    key: "zero",
    value: function zero(rowCount, columnCount) {
      return new (Function.prototype.bind.apply(this, [null].concat(_toConsumableArray(_.range(rowCount).map(function (i) {
        return new Array(columnCount).fill(0);
      })))))();
    }
  }]);

  return Matrix;
}();

exports.default = Matrix;

},{"./vector":21,"./vector2":22,"./vector3":23,"./vector4":24}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

require("./lodash-extension");

exports.default = {
  binom: function binom(n, k) {
    if (2 * k > n) k = n - k;
    if (k === 0) return 1;
    return _.rangeClosed(n - k + 1, n).reduce(function (prod, x) {
      return prod * x;
    }, 1) / _.rangeClosed(1, k).reduce(function (prod, x) {
      return prod * x;
    }, 1);
  },
  clamp: function clamp(x, min, max) {
    return [min, x, max].sort(function (x, y) {
      return x - y;
    })[1];
  },
  lerp: function lerp(x, y, t) {
    return x + (y - x) * t;
  },
  cartesianProduct: function cartesianProduct() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (typeof args[args.length - 1] === "function") {
      var callback = args.pop();
      var callbackArgs = [];
      (function loop() {
        if (args.length === 0) {
          callback.apply(undefined, callbackArgs);
        } else {
          var values = args.pop();
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = values[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var value = _step.value;

              callbackArgs.unshift(value);
              loop();
              callbackArgs.shift(value);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          args.push(values);
        }
      })();
    } else {
      return args.reduce(function (matrix, values) {
        return values.reduce(function (array, value) {
          return array.concat(matrix.map(function (row) {
            return row.concat([value]);
          }));
        }, []);
      }, [[]]);
    }
  },
  inverse: function inverse(f, minDomain, maxDomain) {
    // fは狭義単調増加
    return function (y) {
      if (y < f(minDomain) || f(maxDomain) < y) throw new Error("Range error: " + y + " is not in [" + minDomain + ", " + maxDomain + "]");
      var minX = minDomain;
      var maxX = maxDomain;
      var previousAvrX = null;
      var avrX = null;
      while (true) {
        var _ref = [avrX, (minX + maxX) / 2];
        previousAvrX = _ref[0];
        avrX = _ref[1];

        if (previousAvrX === avrX) return avrX;
        var avrY = f(avrX);
        if (avrY === y) {
          return avrX;
        } else if (avrY < y) {
          minX = avrX;
        } else {
          maxX = avrX;
        }
      }
    };
  },
  nextPow2: function nextPow2(value) {
    if (!Number.isInteger(value) || value < 1) throw new RangeError("value (" + value + ") must be positive.");
    var result = 1;
    for (var i = value; i >= 1; i /= 2, result *= 2) {}
    if (2 * value === result) result = value;
    return result;
  }
};

},{"./lodash-extension":7}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NullTextArea = function NullTextArea() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

  _classCallCheck(this, NullTextArea);

  this.value = value;
  this.scrollTop = 0;
  this.scrollHeight = 0;
};

exports.default = NullTextArea;

},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vector = require("./vector3");

var _vector2 = _interopRequireDefault(_vector);

var _line3d = require("./line-3d");

var _line3d2 = _interopRequireDefault(_line3d);

var _triangle3d = require("./triangle-3d");

var _triangle3d2 = _interopRequireDefault(_triangle3d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Plane = function () {
  function Plane(a, b, c, d) {
    _classCallCheck(this, Plane);

    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  _createClass(Plane, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.a, this.b, this.c, this.d);
    }
  }, {
    key: "contains",
    value: function contains(p) {
      return this.a * p.x + this.b * p.y + this.c * p.z + this.d === 0;
    }
  }, {
    key: "normal",
    value: function normal() {
      return new _vector2.default(this.a, this.b, this.c).normalize();
    }
  }, {
    key: "isParallelTo",
    value: function isParallelTo(other) {
      // 同一平面である場合は含まない
      return this.a * other.b === this.b * other.a && this.a * other.c === this.c * other.a && this.b * other.c === this.c * other.b && this.a * other.d !== this.d * other.a && this.b * other.d !== this.d * other.b && this.c * other.d !== this.d * other.c;
    }
  }, {
    key: "equals",
    value: function equals(other) {
      return this === other || this.a * other.b === this.b * other.a && this.a * other.c === this.c * other.a && this.a * other.d === this.d * other.a && this.b * other.c === this.c * other.b && this.b * other.d === this.d * other.b && this.c * other.d === this.d * other.c;
    }
  }, {
    key: "intersection",
    value: function intersection(other) {
      if (other instanceof Plane) {
        if (this.equals(other)) return [this];
        if (this.isParallelTo(other)) return [];
        if (this.b * other.c !== this.c * other.b) {
          return [new _line3d2.default(new _vector2.default(0, (this.c * other.d - other.c * this.d) / (this.b * other.c - this.c * other.b), (other.b * this.d - this.b * other.d) / (this.b * other.c - this.c * other.b)), new _vector2.default(this.a, this.b, this.c).crossProduct(new _vector2.default(other.a, other.b, other.c)))];
        } else if (this.a * other.b !== this.b * other.a) {
          return [new _line3d2.default(new _vector2.default((this.b * other.d - other.b * this.d) / (this.a * other.b - this.b * other.a), (other.a * this.d - this.a * other.d) / (this.a * other.b - this.b * other.a), 0), new _vector2.default(this.a, this.b, this.c).crossProduct(new _vector2.default(other.a, other.b, other.c)))];
        } else {
          throw new Error("Invalid plane");
        }
      } else if (other instanceof _triangle3d2.default) {
        return other.intersection(this);
      } else {
        throw new Error("Unknown type");
      }
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.a + "x" + (this.b < 0 ? "-" : "+") + Math.abs(this.b) + "y" + (this.c < 0 ? "-" : "+") + Math.abs(this.c) + "z" + (this.d < 0 ? "-" : "+") + Math.abs(this.d) + "=0";
    }
  }], [{
    key: "through",
    value: function through(p1, p2, p3) {
      if (p1.equals(p2)) throw new Error("p1 is identical to p2");
      if (p2.equals(p3)) throw new Error("p2 is identical to p3");
      if (p3.equals(p1)) throw new Error("p3 is identical to p1");
      var normal = p2.subtract(p1).crossProduct(p3.subtract(p1));
      return new this(normal.x, normal.y, normal.z, normal.x * p1.x + normal.y * p1.y + normal.z * p1.z);
    }
  }]);

  return Plane;
}();

exports.default = Plane;

},{"./line-3d":6,"./triangle-3d":20,"./vector3":23}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _vector = require("./vector2");

var _vector2 = _interopRequireDefault(_vector);

var _vector3 = require("./vector3");

var _vector4 = _interopRequireDefault(_vector3);

var _vector5 = require("./vector4");

var _vector6 = _interopRequireDefault(_vector5);

var _directedLineSegment2d = require("./directed-line-segment-2d");

var _directedLineSegment2d2 = _interopRequireDefault(_directedLineSegment2d);

var _line3d = require("./line-3d");

var _line3d2 = _interopRequireDefault(_line3d);

var _polygon = require("./polygon");

var _polygon2 = _interopRequireDefault(_polygon);

var _plane = require("./plane");

var _plane2 = _interopRequireDefault(_plane);

var _myMath = require("./my-math");

var _myMath2 = _interopRequireDefault(_myMath);

var _pmx = require("./pmx");

var _pmx2 = _interopRequireDefault(_pmx);

var _textAreaWrapper = require("./text-area-wrapper");

var _textAreaWrapper2 = _interopRequireDefault(_textAreaWrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var PMXUtils = {
  createEmptyModel: function createEmptyModel() {
    return _pmx2.default.read(new Uint8Array([0x50, 0x4D, 0x58, 0x20, 0x00, 0x00, 0x00, 0x40, 0x08, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0xBB, 0x30, 0xF3, 0x30, 0xBF, 0x30, 0xFC, 0x30, 0x0C, 0x00, 0x00, 0x00, 0x63, 0x00, 0x65, 0x00, 0x6E, 0x00, 0x74, 0x00, 0x65, 0x00, 0x72, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x1E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x52, 0x00, 0x6F, 0x00, 0x6F, 0x00, 0x74, 0x00, 0x08, 0x00, 0x00, 0x00, 0x52, 0x00, 0x6F, 0x00, 0x6F, 0x00, 0x74, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x68, 0x88, 0xC5, 0x60, 0x06, 0x00, 0x00, 0x00, 0x45, 0x00, 0x78, 0x00, 0x70, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
  },

  // Y=thresholdYをrotationA回転してdisplacementA移動した平面と、modelをrotationB回転してdisplacementB移動した多面体が作る断面
  crossSection: function crossSection(thresholdY, rotationA, displacementA, model, rotationB, displacementB) {
    var protoCurvePartMap = _.flatMap(model.faces, function (face) {
      var points = face.vertexIndices.map(function (i) {
        return rotationA.inverse().rotate(rotationB.rotate(model.vertices[i].position).add(displacementB).subtract(displacementA));
      });
      var overPoints = points.filter(function (point) {
        return point.y >= thresholdY;
      });
      var underPoints = points.filter(function (point) {
        return point.y < thresholdY;
      });
      if (overPoints.length === 3 || underPoints.length === 3) return [];
      var centerPoint = overPoints.length === 1 ? overPoints[0] : underPoints[0];
      while (points[0] !== centerPoint) {
        points.unshift(points.pop());
      }
      var newPoints = [points[1], points[2]].map(function (point) {
        var t = (thresholdY - centerPoint.y) / (point.y - centerPoint.y);
        return _vector4.default.lerp(centerPoint, point, t);
      });
      if (newPoints[0].equals(newPoints[1])) return [];
      return [overPoints.length === 1 ? new _directedLineSegment2d2.default(new _vector2.default(newPoints[1].x, newPoints[1].z), new _vector2.default(newPoints[0].x, newPoints[0].z)) : new _directedLineSegment2d2.default(new _vector2.default(newPoints[0].x, newPoints[0].z), new _vector2.default(newPoints[1].x, newPoints[1].z))];
    }).map(function (lineSegment) {
      return [Array.from(lineSegment.p1).map(function (v) {
        return Math.fround(v);
      }).toString(), [lineSegment]];
    });
    var curvePartMap = new Map(protoCurvePartMap);
    if (curvePartMap.size < protoCurvePartMap.length) throw new Error("Duplicate vertices were found.");

    var polygons = [];
    var curves = [];
    Array.from(curvePartMap.keys()).forEach(function (startKey) {
      if (!curvePartMap.has(startKey)) return;
      var nextKey = void 0;
      while (curvePartMap.has(nextKey = Array.from(_(curvePartMap.get(startKey)).last().p2).map(function (v) {
        return Math.fround(v);
      }).toString()) && nextKey !== startKey) {
        curvePartMap.set(startKey, curvePartMap.get(startKey).concat(curvePartMap.get(nextKey)));
        curvePartMap.delete(nextKey);
      }
      if (nextKey === startKey && curvePartMap.get(startKey).length >= 3) {
        polygons.push(new (Function.prototype.bind.apply(_polygon2.default, [null].concat(_toConsumableArray(curvePartMap.get(startKey).map(function (lineSegment) {
          return lineSegment.p1;
        })))))());
      } else {
        curves.push(curvePartMap.get(startKey));
      }
      curvePartMap.delete(startKey);
    });

    return { polygons: polygons, curves: curves };
  },
  subtract: function subtract(model, face, subtrahendPolygon) {
    function makeVertexObject(toStringArray, toVertexArray) {
      switch (toVertexArray.length) {
        case 1:
          {
            var _toVertexArray = _slicedToArray(toVertexArray, 1),
                i = _toVertexArray[0];

            var vertex = model.vertices[i];
            return {
              vertexIndices: [i],
              toString: function toString() {
                return toStringArray.join(",");
              },
              toVertex: function toVertex() {
                return vertex;
              }
            };
          }
        case 3:
          {
            var _toVertexArray2 = _slicedToArray(toVertexArray, 3),
                i1 = _toVertexArray2[0],
                i2 = _toVertexArray2[1],
                t = _toVertexArray2[2];

            var vertices = [model.vertices[i1], model.vertices[i2]];
            return {
              vertexIndices: [i1, i2],
              t: t,
              toString: function toString() {
                return toStringArray.join(",");
              },
              toVertex: function toVertex() {
                if (vertices.some(function (vertex) {
                  return vertex.weight instanceof _pmx2.default.Vertex.Weight.SDEF;
                })) {
                  throw new Error("Combining vertices (" + i1 + " and " + i2 + ") failed: SDEF not supported.");
                }
                var vertexIndexSet = new Set(_(vertices).flatMap(function (vertex) {
                  return vertex.weight.bones;
                }).value().map(function (bone) {
                  return bone.index;
                }));
                if (!new Set([1, 2, 4]).has(vertexIndexSet.size)) {
                  throw new Error("Combining vertices (" + i1 + " and " + i2 + ") failed: combining needs BDEF" + vertexIndexSet.size + ".");
                }
                var weightMap = new Map(Array.from(vertexIndexSet).map(function (i) {
                  return [i, 0];
                }));
                weightMap = vertices[0].weight.bones.reduce(function (map, bone) {
                  return map.set(bone.index, map.get(bone.index) + bone.weight * (1 - t));
                }, weightMap);
                weightMap = vertices[1].weight.bones.reduce(function (map, bone) {
                  return map.set(bone.index, map.get(bone.index) + bone.weight * t);
                }, weightMap);
                var weight = new _pmx2.default.Vertex.Weight["BDEF" + vertexIndexSet.size](Array.from(weightMap).map(function (_ref) {
                  var _ref2 = _slicedToArray(_ref, 2),
                      index = _ref2[0],
                      weight = _ref2[1];

                  return { index: index, weight: weight };
                }));
                return new _pmx2.default.Vertex(_vector4.default.lerp(vertices[0].position, vertices[1].position, t), _vector4.default.lerp(vertices[0].normal, vertices[1].normal, t).normalize(), _vector2.default.lerp(vertices[0].uv, vertices[1].uv, t), _.zip(vertices[0].extraUVs, vertices[1].extraUVs).map(function (_ref3) {
                  var _ref4 = _slicedToArray(_ref3, 2),
                      uv0 = _ref4[0],
                      uv1 = _ref4[1];

                  return _vector2.default.lerp(uv0, uv1, t);
                }), weight, _myMath2.default.lerp(vertices[0].edgeSizeRate, vertices[1].edgeSizeRate, t));
              }
            };
          }
        case 5:
          {
            var _toVertexArray3 = _slicedToArray(toVertexArray, 5),
                _i = _toVertexArray3[0],
                _i2 = _toVertexArray3[1],
                i3 = _toVertexArray3[2],
                t1 = _toVertexArray3[3],
                t2 = _toVertexArray3[4];

            var _vertices = [model.vertices[_i], model.vertices[_i2], model.vertices[i3]];
            return {
              vertexIndices: [_i, _i2, i3],
              t1: t1,
              t2: t2,
              toString: function toString() {
                return toStringArray.join(",");
              },
              toVertex: function toVertex() {
                if (_vertices.some(function (vertex) {
                  return vertex.weight instanceof _pmx2.default.Vertex.Weight.SDEF;
                })) {
                  throw new Error("Combining vertices (" + _i + ", " + _i2 + " and " + i3 + ") failed: SDEF not supported.");
                }
                var vertexIndexSet = new Set(_(_vertices).flatMap(function (vertex) {
                  return vertex.weight.bones;
                }).value().map(function (bone) {
                  return bone.index;
                }));
                if (!new Set([1, 2, 4]).has(vertexIndexSet.size)) {
                  throw new Error("Combining vertices (" + _i + ", " + _i2 + " and " + i3 + ") failed: combining needs BDEF" + vertexIndexSet.size + ".");
                }
                var weightMap = new Map(Array.from(vertexIndexSet).map(function (i) {
                  return [i, 0];
                }));
                weightMap = _vertices[0].weight.bones.reduce(function (map, bone) {
                  return map.set(bone.index, map.get(bone.index) + bone.weight * (1 - t1 - t2));
                }, weightMap);
                weightMap = _vertices[1].weight.bones.reduce(function (map, bone) {
                  return map.set(bone.index, map.get(bone.index) + bone.weight * t1);
                }, weightMap);
                weightMap = _vertices[2].weight.bones.reduce(function (map, bone) {
                  return map.set(bone.index, map.get(bone.index) + bone.weight * t2);
                }, weightMap);
                var weight = new _pmx2.default.Vertex.Weight["BDEF" + vertexIndexSet.size](Array.from(weightMap).map(function (_ref5) {
                  var _ref6 = _slicedToArray(_ref5, 2),
                      index = _ref6[0],
                      weight = _ref6[1];

                  return { index: index, weight: weight };
                }));
                function slerp(s1, s2, s3, t1, t2) {
                  return s1 + (s2 - s1) * t1 + (s3 - s1) * t2;
                }
                function vlerp(v1, v2, v3, t1, t2) {
                  return v1.add(v2.subtract(v1).multiply(t1)).add(v3.subtract(v1).multiply(t2));
                }
                return new _pmx2.default.Vertex(vlerp(_vertices[0].position, _vertices[1].position, _vertices[2].position, t1, t2), vlerp(_vertices[0].normal, _vertices[1].normal, _vertices[2].normal, t1, t2).normalize(), vlerp(_vertices[0].uv, _vertices[1].uv, _vertices[2].uv, t1, t2), _.zip(_vertices[0].extraUVs, _vertices[1].extraUVs, _vertices[2].extraUVs).map(function (_ref7) {
                  var _ref8 = _slicedToArray(_ref7, 3),
                      uv0 = _ref8[0],
                      uv1 = _ref8[1],
                      uv2 = _ref8[2];

                  return vlerp(uv0, uv1, uv2, t1, t2);
                }), weight, slerp(_vertices[0].edgeSizeRate, _vertices[1].edgeSizeRate, _vertices[2].edgeSizeRate, t1, t2));
              }
            };
          }
      }
    }
    function helper1(vertexIndices, points, p) {
      // vertexIndicesはソート済み、pointsもvertexIndicesでソート済み、pointsは3点全て異なる点
      var _ref9 = p.equals(points[0]) ? [0, 0] : p.equals(points[1]) ? [1, 0] : p.equals(points[2]) ? [0, 1] : [((p.x - points[0].x) * (points[0].y - points[2].y) - (points[0].x - points[2].x) * (p.y - points[0].y)) / ((points[0].x - points[2].x) * (points[0].y - points[1].y) - (points[0].x - points[1].x) * (points[0].y - points[2].y)), (points[0].x * p.y - points[0].x * points[1].y - points[1].x * p.y - p.x * points[0].y + points[1].x * points[0].y + p.x * points[1].y) / (points[1].x * points[0].y - points[2].x * points[0].y - points[0].x * points[1].y + points[2].x * points[1].y + points[0].x * points[2].y - points[1].x * points[2].y)],
          _ref10 = _slicedToArray(_ref9, 2),
          t1 = _ref10[0],
          t2 = _ref10[1];

      var _map = [t1, t2].map(function (t) {
        return Math.fround(t);
      }),
          _map2 = _slicedToArray(_map, 2),
          t1Float32 = _map2[0],
          t2Float32 = _map2[1];

      if (t1Float32 === 0 && t2Float32 === 0) {
        return makeVertexObject([vertexIndices[0]], [vertexIndices[0]]);
      }
      if (t1Float32 === 1 && t2Float32 === 0) {
        return makeVertexObject([vertexIndices[1]], [vertexIndices[1]]);
      }
      if (t1Float32 === 0 && t2Float32 === 1) {
        return makeVertexObject([vertexIndices[2]], [vertexIndices[2]]);
      }
      if (t2Float32 === 0) {
        return makeVertexObject([vertexIndices[0], vertexIndices[1], t1Float32], [vertexIndices[0], vertexIndices[1], t1]);
      }
      if (t1Float32 === 0) {
        return makeVertexObject([vertexIndices[0], vertexIndices[2], t2Float32], [vertexIndices[0], vertexIndices[2], t2]);
      }
      if (Math.fround(t1 + t2) === 1) {
        return makeVertexObject([vertexIndices[1], vertexIndices[2], t2Float32], [vertexIndices[1], vertexIndices[2], t2]);
      }
      return makeVertexObject([vertexIndices[0], vertexIndices[1], vertexIndices[2], t1Float32, t2Float32], [vertexIndices[0], vertexIndices[1], vertexIndices[2], t1, t2]);
    }
    function helper2(vertexIndices, reverseOffset, d) {
      var dFloat32 = Math.fround(d);
      var rd = 1 - d;
      var rdFloat32 = Math.fround(1 - d);
      var i0 = vertexIndices[(0 + reverseOffset) % 3];
      var i1 = vertexIndices[(1 + reverseOffset) % 3];
      var i2 = vertexIndices[(2 + reverseOffset) % 3];
      if (dFloat32 === 0) {
        return [makeVertexObject([i0], [i0])];
      } else if (dFloat32 === 1) {
        return [makeVertexObject([i1], [i1]), makeVertexObject([i2], [i2])];
      } else {
        return [i0 < i1 ? makeVertexObject([i0, i1, dFloat32], [i0, i1, d]) : makeVertexObject([i1, i0, rdFloat32], [i1, i0, rd]), i0 < i2 ? makeVertexObject([i0, i2, dFloat32], [i0, i2, d]) : makeVertexObject([i2, i0, rdFloat32], [i2, i0, rd])];
      }
    }
    function algorithm1(projectedPoints) {
      var sortedVertexIndices = Array.from(face.vertexIndices).sort(function (x, y) {
        return x - y;
      });
      var sortedPoints = sortedVertexIndices.map(function (i) {
        return new _vector2.default(model.vertices[i].position.x, model.vertices[i].position.z);
      });
      var originalProjection = new (Function.prototype.bind.apply(_polygon2.default, [null].concat(_toConsumableArray(projectedPoints))))();
      var projection = originalProjection.isClockwise() ? originalProjection : originalProjection.reverse();
      var differenceTriangles = _(projection.subtract(subtrahendPolygon)).flatMap(function (differencePolygon) {
        return differencePolygon.triangulate();
      }).value().map(function (triangle) {
        return originalProjection.isClockwise() ? triangle : triangle.reverse();
      });
      return differenceTriangles.map(function (triangle) {
        return triangle.points.map(function (point) {
          return helper1(sortedVertexIndices, sortedPoints, point);
        });
      });
    }
    function algorithm2(projectedPoints) {
      var sortedVertexIndices = Array.from(face.vertexIndices).sort(function (x, y) {
        return x - y;
      });
      var sortedPoints = _(face.vertexIndices).zip([0, 1, 2]).sortBy(function (_ref11) {
        var _ref12 = _slicedToArray(_ref11, 2),
            vertexIndex = _ref12[0],
            i = _ref12[1];

        return vertexIndex;
      }).value().map(function (_ref13) {
        var _ref14 = _slicedToArray(_ref13, 2),
            vertexIndex = _ref14[0],
            i = _ref14[1];

        return [new _vector2.default(0, 0), new _vector2.default(1, 0), new _vector2.default(0, 1)][i];
      });
      return _(new (Function.prototype.bind.apply(_directedLineSegment2d2.default, [null].concat(_toConsumableArray(_(projectedPoints).zip(projectedPoints.slice(1).concat([projectedPoints[0]])).maxBy(function (_ref15) {
        var _ref16 = _slicedToArray(_ref15, 2),
            p1 = _ref16[0],
            p2 = _ref16[1];

        return p2.subtract(p1).squaredNorm();
      })))))().subtract(subtrahendPolygon)).flatMap(function (lineSegment) {
        var tuples = _([lineSegment.p1, lineSegment.p2]).flatMap(function (p, j) {
          return [0, 1, 2].filter(function (i) {
            return p.equals(projectedPoints[i]);
          }).map(function (i) {
            return [[0, 0, 0, j], [1, 0, 1, j], [0, 1, 2, j]][i];
          }).concat(_.zip([0, 1, 2], [1, 2, 0]).filter(function (_ref17) {
            var _ref18 = _slicedToArray(_ref17, 2),
                i1 = _ref18[0],
                i2 = _ref18[1];

            return !p.equals(projectedPoints[i1]) && !p.equals(projectedPoints[i2]);
          }).map(function (_ref19) {
            var _ref20 = _slicedToArray(_ref19, 2),
                i1 = _ref20[0],
                i2 = _ref20[1];

            return [i1, i2, projectedPoints[i2].subtract(projectedPoints[i1])];
          }).filter(function (_ref21) {
            var _ref22 = _slicedToArray(_ref21, 3),
                i1 = _ref22[0],
                i2 = _ref22[1],
                v = _ref22[2];

            return v.squaredNorm() > 0;
          }).map(function (_ref23) {
            var _ref24 = _slicedToArray(_ref23, 3),
                i1 = _ref24[0],
                i2 = _ref24[1],
                v = _ref24[2];

            return [i1, i2, p.subtract(projectedPoints[i1]).innerProduct(v) / v.squaredNorm()];
          }).filter(function (_ref25) {
            var _ref26 = _slicedToArray(_ref25, 3),
                i1 = _ref26[0],
                i2 = _ref26[1],
                t = _ref26[2];

            return 0 < t && t < 1;
          }).map(function (_ref27) {
            var _ref28 = _slicedToArray(_ref27, 3),
                i1 = _ref28[0],
                i2 = _ref28[1],
                t = _ref28[2];

            return [[t, 0, t, j], [1 - t, t, 1 + t, j], [0, 1 - t, 2 + t, j]][i1];
          }));
        }).sortBy(function (_ref29) {
          var _ref30 = _slicedToArray(_ref29, 3),
              s = _ref30[2];

          return s;
        }).value();
        var tuplePair = _.zip(tuples, tuples.slice(1).concat([tuples[0]])).filter(function (_ref31) {
          var _ref32 = _slicedToArray(_ref31, 2),
              _ref32$ = _slicedToArray(_ref32[0], 4),
              j1 = _ref32$[3],
              _ref32$2 = _slicedToArray(_ref32[1], 4),
              j2 = _ref32$2[3];

          return j1 !== j2;
        }).find(function (_ref33) {
          var _ref34 = _slicedToArray(_ref33, 2),
              _ref34$ = _slicedToArray(_ref34[0], 3),
              s1 = _ref34$[2],
              _ref34$2 = _slicedToArray(_ref34[1], 3),
              s2 = _ref34$2[2];

          return ((Number.isInteger(s1) ? s1 + 1 : Math.ceil(s1)) - (Number.isInteger(s2) ? s2 - 1 : Math.floor(s2))) % 3 === 0;
        });
        if (typeof tuplePair !== "undefined") {
          var _tuplePair = _slicedToArray(tuplePair, 2),
              _tuplePair$ = _slicedToArray(_tuplePair[0], 3),
              s1 = _tuplePair$[2],
              _tuplePair$2 = _slicedToArray(_tuplePair[1], 3);

          tuples.push([[0, 0, 0, null], [1, 0, 1, null], [0, 1, 2, null]][(Number.isInteger(s1) ? s1 + 1 : Math.ceil(s1)) % 3]);
          tuples.sort(function (_ref35, _ref36) {
            var _ref38 = _slicedToArray(_ref35, 3),
                s1 = _ref38[2];

            var _ref37 = _slicedToArray(_ref36, 3),
                s2 = _ref37[2];

            return s1 - s2;
          });
        }
        return new (Function.prototype.bind.apply(_polygon2.default, [null].concat(_toConsumableArray(tuples.map(function (_ref39) {
          var _ref40 = _slicedToArray(_ref39, 4),
              t1 = _ref40[0],
              t2 = _ref40[1],
              s = _ref40[2],
              j = _ref40[3];

          return new _vector2.default(t1, t2);
        })))))().triangulate();
      }).value().map(function (triangle) {
        return triangle.points.map(function (point) {
          return helper1(sortedVertexIndices, sortedPoints, point);
        });
      });
    }
    function algorithm3(projectedPoints, reverseOffset) {
      var projection = new _directedLineSegment2d2.default(projectedPoints[0], projectedPoints[1]);
      return _(projection.subtract(subtrahendPolygon)).flatMap(function (lineSegment) {
        var d1 = lineSegment.p1.subtract(projection.p1).innerProduct(projection.toVector()) / projection.toVector().squaredNorm();
        var d2 = lineSegment.p2.subtract(projection.p1).innerProduct(projection.toVector()) / projection.toVector().squaredNorm();
        var vertexObjects1 = helper2(face.vertexIndices, reverseOffset, d1);
        var vertexObjects2 = helper2(face.vertexIndices, reverseOffset, d2);
        if (vertexObjects1.length === 1) {
          return [[vertexObjects1[0], vertexObjects2[0], vertexObjects2[1]]];
        } else {
          return [[vertexObjects1[1], vertexObjects1[0], vertexObjects2[0]], [vertexObjects1[1], vertexObjects2[0], vertexObjects2[1]]];
        }
      }).value();
    }
    function algorithm4(projectedPoint) {
      return subtrahendPolygon.contains(projectedPoint) ? [] : [face.vertexIndices.map(function (i) {
        return makeVertexObject([i], [i]);
      })];
    }
    switch (new Set(face.vertexIndices.map(function (i) {
      return model.vertices[i].position.toString();
    })).size) {
      case 3:
        {
          var projectedPoints = face.vertexIndices.map(function (i) {
            return new _vector2.default(model.vertices[i].position.x, model.vertices[i].position.z);
          });
          if (!_line3d2.default.through(model.vertices[face.vertexIndices[0]].position, model.vertices[face.vertexIndices[1]].position).contains(model.vertices[face.vertexIndices[2]].position)) {
            if (model.vertices[face.vertexIndices[1]].position.subtract(model.vertices[face.vertexIndices[0]].position).crossProduct(model.vertices[face.vertexIndices[2]].position.subtract(model.vertices[face.vertexIndices[0]].position)).y !== 0) {
              return algorithm1(projectedPoints);
            } else {
              return algorithm2(projectedPoints);
            }
          } else {
            if (new Set(projectedPoints.map(function (p) {
              return p.toString();
            })).size > 1) {
              return algorithm2(projectedPoints);
            } else {
              return algorithm4(projectedPoints[0]);
            }
          }
        }
      case 2:
        {
          var points = face.vertexIndices.map(function (i) {
            return model.vertices[i].position;
          });
          var reverseOffset = 3;
          while (!points[1].equals(points[2])) {
            points.push(points.shift());
            --reverseOffset;
          }
          var _projectedPoints = points.slice(0, 2).map(function (p) {
            return new _vector2.default(p.x, p.z);
          });
          if (!_projectedPoints[0].equals(_projectedPoints[1])) {
            return algorithm3(_projectedPoints, reverseOffset);
          } else {
            return algorithm4(_projectedPoints[0]);
          }
        }
      case 1:
        {
          var point = model.vertices[face.vertexIndices[0]].position;
          var projectedPoint = new _vector2.default(point.x, point.z);
          return algorithm4(projectedPoint);
        }
    }
  },
  calcMetaMaterials: function calcMetaMaterials(model) {
    return model.materials.reduce(function (array, material, i) {
      var firstFaceIndex = array.length === 0 ? 0 : _(_(array).last().faceIndices).last() + 1;
      var faceIndices = _.range(firstFaceIndex, firstFaceIndex + material.faceCount);
      array.push({
        material: material,
        materialIndex: i,
        faceIndices: faceIndices,
        faces: faceIndices.map(function (i) {
          return model.faces[i];
        })
      });
      return array;
    }, []);
  },

  VirtualVertex: function () {
    function VirtualVertex(model, metaVertexIndices) {
      _classCallCheck(this, VirtualVertex);

      this.model = model;
      this.metaVertexIndices = _.sortBy(metaVertexIndices, function (_ref41) {
        var vertexIndex = _ref41.vertexIndex;
        return vertexIndex;
      });
      this._isMaterialized = false;
    }

    _createClass(VirtualVertex, [{
      key: "toString",
      value: function toString() {
        return this.metaVertexIndices.map(function (_ref42) {
          var vertexIndex = _ref42.vertexIndex,
              blendRate = _ref42.blendRate;
          return vertexIndex + ":" + Math.fround(blendRate);
        }).join(",");
      }
    }, {
      key: "toVertex",
      value: function toVertex() {
        return PMXUtils.createCombinedVertex(this.metaVertexIndices.map(function (_ref43) {
          var vertexIndex = _ref43.vertexIndex,
              blendRate = _ref43.blendRate;
          return { vertex: model.vertices[vertexIndex], blendRate: blendRate };
        }));
      }
    }, {
      key: "materialize",
      value: function materialize() {
        if (this._isMaterialized) throw new Error("Already materialized.");

        this._materializedVertexIndex = this.model.vertices.length;
        this.model.vertices.push(this.toVertex());

        var targetMorphTypeSet = new Set(["vertex", "uv", "extraUV1", "extraUV2", "extraUV3", "extraUV4"]);
        var vertexIndexToBlendRate = new Map(this.metaVertexIndices.map(function (_ref44) {
          var vertexIndex = _ref44.vertexIndex,
              blendRate = _ref44.blendRate;
          return [vertexIndex, blendRate];
        }));
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.model.morphs.filter(function (morph) {
            return targetMorphTypeSet.has(morph.type);
          })[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var morph = _step.value;

            var offsets = morph.offsets.filter(function (offset) {
              return vertexIndexToBlendRate.has(offset.vertexIndex);
            });
            if (offsets.length === 0) continue;
            var newDisplacement = offsets.map(function (_ref45) {
              var vertexIndex = _ref45.vertexIndex,
                  displacement = _ref45.displacement;
              return displacement.multiply(vertexIndexToBlendRate.get(vertexIndex));
            }).reduce(function (sum, v) {
              return sum.add(v);
            }, (morph.type === "vertex" ? _vector4.default : _vector6.default).zero);
            morph.offsets.push(new (morph.type === "vertex" ? _pmx2.default.Morph.Offset.Vertex : _pmx2.default.Morph.Offset.UV)(this._materializedVertexIndex, newDisplacement));
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this._isMaterialized = true;
      }
    }, {
      key: "isMaterialized",
      value: function isMaterialized() {
        return this._isMaterialized;
      }
    }, {
      key: "getMaterializedVertexIndex",
      value: function getMaterializedVertexIndex() {
        return this._isMaterialized ? this._materializedVertexIndex : null;
      }
    }, {
      key: "getMaterializedVertex",
      value: function getMaterializedVertex() {
        return this._isMaterialized ? this.model.vertices[this._materializedVertexIndex] : null;
      }
    }]);

    return VirtualVertex;
  }(),
  createCombinedVertex: function createCombinedVertex(metaVertices) {
    var _ref63;

    var vertices = metaVertices.map(function (_ref46) {
      var vertex = _ref46.vertex;
      return vertex;
    });
    if (vertices.some(function (vertex) {
      return vertex.weight instanceof _pmx2.default.Vertex.Weight.SDEF;
    })) {
      throw new Error("Combining vertices failed: SDEF not supported.");
    }
    var boneIndexSet = new Set(_(vertices).flatMap(function (vertex) {
      return vertex.weight.bones;
    }).filter(function (bone) {
      return bone.weight > 0;
    }).map(function (bone) {
      return bone.index;
    }).value());
    var weightMap = new Map(Array.from(boneIndexSet).map(function (i) {
      return [i, 0];
    }));

    var _loop = function _loop(vertex, blendRate) {
      weightMap = vertex.weight.bones.filter(function (bone) {
        return bone.weight > 0;
      }).reduce(function (map, bone) {
        return map.set(bone.index, map.get(bone.index) + bone.weight * blendRate);
      }, weightMap);
    };

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = metaVertices[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _ref47 = _step2.value;
        var vertex = _ref47.vertex;
        var blendRate = _ref47.blendRate;

        _loop(vertex, blendRate);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    if (boneIndexSet.size > 4) {
      var rawWeightMap = _.sortBy(Array.from(weightMap), function (_ref48) {
        var _ref49 = _slicedToArray(_ref48, 2),
            index = _ref49[0],
            weight = _ref49[1];

        return weight;
      }).reverse().slice(0, 4);
      var sum = rawWeightMap.map(function (_ref50) {
        var _ref51 = _slicedToArray(_ref50, 2),
            index = _ref51[0],
            weight = _ref51[1];

        return weight;
      }).reduce(_.add, 0);
      weightMap = new Map(rawWeightMap.map(function (_ref52) {
        var _ref53 = _slicedToArray(_ref52, 2),
            index = _ref53[0],
            weight = _ref53[1];

        return [index, weight / sum];
      }));
    }
    var weight = void 0;
    switch (weightMap.size) {
      case 1:
      case 2:
      case 4:
        weight = new _pmx2.default.Vertex.Weight["BDEF" + weightMap.size](Array.from(weightMap).map(function (_ref54) {
          var _ref55 = _slicedToArray(_ref54, 2),
              index = _ref55[0],
              weight = _ref55[1];

          return { index: index, weight: weight };
        }));
        break;
      case 3:
        var dummyBoneIndex = void 0;
        if (!weightMap.has(0)) {
          dummyBoneIndex = 0;
        } else if (!weightMap.has(1)) {
          dummyBoneIndex = 1;
        } else if (!weightMap.has(2)) {
          dummyBoneIndex = 2;
        } else {
          dummyBoneIndex = 3;
        }
        weight = new _pmx2.default.Vertex.Weight.BDEF4(Array.from(weightMap).map(function (_ref56) {
          var _ref57 = _slicedToArray(_ref56, 2),
              index = _ref57[0],
              weight = _ref57[1];

          return { index: index, weight: weight };
        }).concat([{ index: dummyBoneIndex, weight: 0 }]));
        break;
    }
    function slerp(scalars, blendRates) {
      return _.zip(scalars, blendRates).map(function (_ref58) {
        var _ref59 = _slicedToArray(_ref58, 2),
            scalar = _ref59[0],
            blendRate = _ref59[1];

        return scalar * blendRate;
      }).reduce(_.add);
    }
    function vlerp(vectors, blendRates) {
      return _.zip(vectors, blendRates).map(function (_ref60) {
        var _ref61 = _slicedToArray(_ref60, 2),
            vector = _ref61[0],
            blendRate = _ref61[1];

        return vector.multiply(blendRate);
      }).reduce(function (sum, v) {
        return sum.add(v);
      });
    }
    var blendRates = metaVertices.map(function (_ref62) {
      var blendRate = _ref62.blendRate;
      return blendRate;
    });
    return new _pmx2.default.Vertex(vlerp(vertices.map(function (vertex) {
      return vertex.position;
    }), blendRates), vlerp(vertices.map(function (vertex) {
      return vertex.normal;
    }), blendRates).normalize(), vlerp(vertices.map(function (vertex) {
      return vertex.uv;
    }), blendRates), (_ref63 = _).zip.apply(_ref63, _toConsumableArray(vertices.map(function (vertex) {
      return vertex.extraUVs;
    }))).map(function (uvs) {
      return vlerp(uvs, blendRates);
    }), weight, slerp(vertices.map(function (vertex) {
      return vertex.edgeSizeRate;
    }), blendRates));
  },
  mergeVertices: function mergeVertices(model, metaBaseVertexIndex, metaVertexIndices) {
    metaBaseVertexIndex = Object.assign({}, metaBaseVertexIndex);
    metaVertexIndices = metaVertexIndices.map(function (metaVertexIndex) {
      return Object.assign({}, metaVertexIndex);
    });

    model.vertices[metaBaseVertexIndex.vertexIndex] = this.createCombinedVertex([metaBaseVertexIndex].concat(metaVertexIndices).map(function (_ref64) {
      var vertexIndex = _ref64.vertexIndex,
          blendRate = _ref64.blendRate;
      return { vertex: model.vertices[vertexIndex], blendRate: blendRate };
    }));

    var targetMorphTypes = new Set(["vertex", "uv", "extraUV1", "extraUV2", "extraUV3", "extraUV4"]);
    var vertexInFaceMap = new Map(new Array(model.vertices.length).fill().map(function (_, i) {
      return [i, []];
    }));
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = model.faces[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var face = _step3.value;

        for (var _i3 = 0; _i3 < face.vertexIndices.length; _i3++) {
          vertexInFaceMap.get(face.vertexIndices[_i3]).push({ face: face, order: _i3 });
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    var offsetMap = new Map(new Array(model.vertices.length).fill().map(function (_, i) {
      return [i, []];
    }));
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = model.morphs.filter(function (morph) {
        return targetMorphTypes.has(morph.type);
      })[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var morph = _step4.value;
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = morph.offsets[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var offset = _step7.value;

            offsetMap.get(offset.vertexIndex).push(offset);
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    function overwriteVertexIndex(from, to) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = vertexInFaceMap.get(from)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _ref65 = _step5.value;
          var _face = _ref65.face;
          var order = _ref65.order;

          _face.vertexIndices[order] = to;
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = offsetMap.get(from)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var offset = _step6.value;

          offset.vertexIndex = to;
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }

    for (var i = 0; i < metaVertexIndices.length; i++) {
      overwriteVertexIndex(metaVertexIndices[i].vertexIndex, metaBaseVertexIndex.vertexIndex);
      for (var j = metaVertexIndices[i].vertexIndex; j < model.vertices.length - 1; j++) {
        overwriteVertexIndex(j + 1, j);
      }
      if (metaBaseVertexIndex.vertexIndex > metaVertexIndices[i].vertexIndex) {
        metaBaseVertexIndex.vertexIndex--;
      }
      for (var _j = i + 1; _j < metaVertexIndices.length; _j++) {
        if (metaVertexIndices[_j].vertexIndex > metaVertexIndices[i].vertexIndex) {
          metaVertexIndices[_j].vertexIndex--;
        }
      }
      model.vertices.splice(metaVertexIndices[i].vertexIndex, 1);
    }
  },

  // originalModelは3つ以上の面が共有する辺を持たない
  // loopCount > 0
  // 法線未考慮
  subdivideSurfaceAsync: function () {
    var _ref66 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(originalModel, loopCount, targetMaterialIndices) {
      var _this = this;

      var logger = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : new _textAreaWrapper2.default(document.createElement("textarea"));

      var core, model, allFaces, i, _ref77, _ref78, _iteratorNormalCompletion19, _didIteratorError19, _iteratorError19, _iterator19, _step19, materialIndex;

      return regeneratorRuntime.wrap(function _callee3$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              core = function () {
                var _ref67 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(model, allFaces) {
                  var newModel, newAllFaces, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, materialIndex, targetVertexIndexSet, vertexIndexToVertexKey, vertexIndexToVertexIndicesSharingVertexKey, edgeToEdgesSharingVertexKeyPair, vertexIndexToFaces, vertexIndexToEdges, edgeToFaces, faceToFacePointIndex, edgeToEdgePointIndex, _loop2, _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, face, _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, _ref71, _ref72, vertexIndex, edgeJSONSet, vertexIndexToFacesSharingVertexKey, vertexIndexToEdgesSharingVertexKey, edgeToFacesSharingVertexKeyPair, _iteratorNormalCompletion12, _didIteratorError12, _iteratorError12, _iterator12, _step12, edgeJSON, edge, faces, edgePoint, _iteratorNormalCompletion13, _didIteratorError13, _iteratorError13, _iterator13, _step13, _materialIndex, _iteratorNormalCompletion18, _didIteratorError18, _iteratorError18, _iterator18, _step18, _face2, centerPointIndex, edgePointIndices, i, avg, _iteratorNormalCompletion14, _didIteratorError14, _iteratorError14, _iterator14, _step14, originalVertexIndex, originalVertex, pairs, F, R, P, n;

                  return regeneratorRuntime.wrap(function _callee2$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          avg = function avg(vectors) {
                            return vectors.reduce(function (sum, v) {
                              return sum.add(v);
                            }, new _vector4.default(0, 0, 0)).divide(vectors.length);
                          };

                          edgeToFacesSharingVertexKeyPair = function edgeToFacesSharingVertexKeyPair(edge) {
                            return _(edgeToEdgesSharingVertexKeyPair(edge)).flatMap(function (edgeSharingVertexKeyPair) {
                              return edgeToFaces.get(JSON.stringify(edgeSharingVertexKeyPair));
                            }).value();
                          };

                          vertexIndexToEdgesSharingVertexKey = function vertexIndexToEdgesSharingVertexKey(vertexIndex) {
                            return _(vertexIndexToVertexIndicesSharingVertexKey(vertexIndex)).flatMap(function (vertexIndexSharingVertexKey) {
                              return vertexIndexToEdges.get(vertexIndexSharingVertexKey);
                            }).value();
                          };

                          vertexIndexToFacesSharingVertexKey = function vertexIndexToFacesSharingVertexKey(vertexIndex) {
                            return _(vertexIndexToVertexIndicesSharingVertexKey(vertexIndex)).flatMap(function (vertexIndexSharingVertexKey) {
                              return vertexIndexToFaces.get(vertexIndexSharingVertexKey);
                            }).value();
                          };

                          edgeToEdgesSharingVertexKeyPair = function edgeToEdgesSharingVertexKeyPair(edge) {
                            return _(vertexIndexToVertexIndicesSharingVertexKey(edge[0])).flatMap(function (vertexIndex) {
                              return vertexIndexToEdges.get(vertexIndex);
                            }).filter(function (_ref69) {
                              var _ref70 = _slicedToArray(_ref69, 2),
                                  vertexIndex1 = _ref70[0],
                                  vertexIndex2 = _ref70[1];

                              return vertexIndexToVertexKey(vertexIndex1) === vertexIndexToVertexKey(edge[0]) && vertexIndexToVertexKey(vertexIndex2) === vertexIndexToVertexKey(edge[1]) || vertexIndexToVertexKey(vertexIndex2) === vertexIndexToVertexKey(edge[0]) && vertexIndexToVertexKey(vertexIndex1) === vertexIndexToVertexKey(edge[1]);
                            }).value();
                          };

                          vertexIndexToVertexKey = function vertexIndexToVertexKey(vertexIndex) {
                            var vertex = model.vertices[vertexIndex];
                            return JSON.stringify(Array.from(vertex.position).concat(Array.from(vertex.normal)).map(Math.fround));
                          };

                          _context3.next = 8;
                          return logger.appendAsync("結果格納領域作成中...");

                        case 8:
                          newModel = _pmx2.default.read(model.write());
                          newAllFaces = allFaces.map(function (faces) {
                            return faces.slice();
                          });
                          _iteratorNormalCompletion8 = true;
                          _didIteratorError8 = false;
                          _iteratorError8 = undefined;
                          _context3.prev = 13;

                          for (_iterator8 = targetMaterialIndices[Symbol.iterator](); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            materialIndex = _step8.value;

                            newAllFaces[materialIndex] = [];
                          }

                          _context3.next = 21;
                          break;

                        case 17:
                          _context3.prev = 17;
                          _context3.t0 = _context3["catch"](13);
                          _didIteratorError8 = true;
                          _iteratorError8 = _context3.t0;

                        case 21:
                          _context3.prev = 21;
                          _context3.prev = 22;

                          if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                          }

                        case 24:
                          _context3.prev = 24;

                          if (!_didIteratorError8) {
                            _context3.next = 27;
                            break;
                          }

                          throw _iteratorError8;

                        case 27:
                          return _context3.finish(24);

                        case 28:
                          return _context3.finish(21);

                        case 29:
                          _context3.next = 31;
                          return logger.appendAsync("ハイポリ化対象頂点算出中...");

                        case 31:
                          targetVertexIndexSet = new Set(_(targetMaterialIndices).flatMap(function (targetMaterialIndex) {
                            return allFaces[targetMaterialIndex];
                          }).flatten().value());
                          _context3.next = 34;
                          return logger.progressAsync("重複頂点算出中...", model.vertices.length);

                        case 34:
                          _context3.next = 36;
                          return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                            var vertexKeyToVertexIndices, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, vertexIndex, vertexKey;

                            return regeneratorRuntime.wrap(function _callee$(_context) {
                              while (1) {
                                switch (_context.prev = _context.next) {
                                  case 0:
                                    vertexKeyToVertexIndices = new Map();
                                    _iteratorNormalCompletion9 = true;
                                    _didIteratorError9 = false;
                                    _iteratorError9 = undefined;
                                    _context.prev = 4;
                                    _iterator9 = _.range(model.vertices.length)[Symbol.iterator]();

                                  case 6:
                                    if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                                      _context.next = 14;
                                      break;
                                    }

                                    vertexIndex = _step9.value;

                                    if (targetVertexIndexSet.has(vertexIndex)) {
                                      vertexKey = vertexIndexToVertexKey(vertexIndex);

                                      if (!vertexKeyToVertexIndices.has(vertexKey)) vertexKeyToVertexIndices.set(vertexKey, []);
                                      vertexKeyToVertexIndices.get(vertexKey).push(vertexIndex);
                                    }
                                    _context.next = 11;
                                    return logger.progressAsync();

                                  case 11:
                                    _iteratorNormalCompletion9 = true;
                                    _context.next = 6;
                                    break;

                                  case 14:
                                    _context.next = 20;
                                    break;

                                  case 16:
                                    _context.prev = 16;
                                    _context.t0 = _context["catch"](4);
                                    _didIteratorError9 = true;
                                    _iteratorError9 = _context.t0;

                                  case 20:
                                    _context.prev = 20;
                                    _context.prev = 21;

                                    if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                      _iterator9.return();
                                    }

                                  case 23:
                                    _context.prev = 23;

                                    if (!_didIteratorError9) {
                                      _context.next = 26;
                                      break;
                                    }

                                    throw _iteratorError9;

                                  case 26:
                                    return _context.finish(23);

                                  case 27:
                                    return _context.finish(20);

                                  case 28:
                                    return _context.abrupt("return", function (vertexIndex) {
                                      return vertexKeyToVertexIndices.get(vertexIndexToVertexKey(vertexIndex));
                                    });

                                  case 29:
                                  case "end":
                                    return _context.stop();
                                }
                              }
                            }, _callee, _this, [[4, 16, 20, 28], [21,, 23, 27]]);
                          }))();

                        case 36:
                          vertexIndexToVertexIndicesSharingVertexKey = _context3.sent;
                          _context3.next = 39;
                          return logger.progressAsync("face point作成中...", targetMaterialIndices.map(function (targetMaterialIndex) {
                            return allFaces[targetMaterialIndex].length;
                          }).reduce(_.add, 0));

                        case 39:
                          vertexIndexToFaces = new Map(Array.from(targetVertexIndexSet).map(function (vertexIndex) {
                            return [vertexIndex, []];
                          }));
                          vertexIndexToEdges = new Map(Array.from(targetVertexIndexSet).map(function (vertexIndex) {
                            return [vertexIndex, new Set()];
                          }));
                          edgeToFaces = new Map();
                          faceToFacePointIndex = new Map();
                          edgeToEdgePointIndex = new Map();
                          _loop2 = /*#__PURE__*/regeneratorRuntime.mark(function _loop2(face) {
                            var _iteratorNormalCompletion15, _didIteratorError15, _iteratorError15, _iterator15, _step15, _vertexIndex, _iteratorNormalCompletion16, _didIteratorError16, _iteratorError16, _iterator16, _step16, edge, _edgeJSON, _iteratorNormalCompletion17, _didIteratorError17, _iteratorError17, _iterator17, _step17, _vertexIndex2;

                            return regeneratorRuntime.wrap(function _loop2$(_context2) {
                              while (1) {
                                switch (_context2.prev = _context2.next) {
                                  case 0:
                                    _iteratorNormalCompletion15 = true;
                                    _didIteratorError15 = false;
                                    _iteratorError15 = undefined;
                                    _context2.prev = 3;

                                    for (_iterator15 = face[Symbol.iterator](); !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                                      _vertexIndex = _step15.value;

                                      vertexIndexToFaces.get(_vertexIndex).push(face);
                                    }
                                    _context2.next = 11;
                                    break;

                                  case 7:
                                    _context2.prev = 7;
                                    _context2.t0 = _context2["catch"](3);
                                    _didIteratorError15 = true;
                                    _iteratorError15 = _context2.t0;

                                  case 11:
                                    _context2.prev = 11;
                                    _context2.prev = 12;

                                    if (!_iteratorNormalCompletion15 && _iterator15.return) {
                                      _iterator15.return();
                                    }

                                  case 14:
                                    _context2.prev = 14;

                                    if (!_didIteratorError15) {
                                      _context2.next = 17;
                                      break;
                                    }

                                    throw _iteratorError15;

                                  case 17:
                                    return _context2.finish(14);

                                  case 18:
                                    return _context2.finish(11);

                                  case 19:
                                    _iteratorNormalCompletion16 = true;
                                    _didIteratorError16 = false;
                                    _iteratorError16 = undefined;
                                    _context2.prev = 22;
                                    _iterator16 = _.zip(face, face.slice(1).concat(face.slice(0, 1))).map(function (pair) {
                                      return _.sortBy(pair, _.identity);
                                    })[Symbol.iterator]();

                                  case 24:
                                    if (_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done) {
                                      _context2.next = 51;
                                      break;
                                    }

                                    edge = _step16.value;
                                    _edgeJSON = JSON.stringify(edge);
                                    _iteratorNormalCompletion17 = true;
                                    _didIteratorError17 = false;
                                    _iteratorError17 = undefined;
                                    _context2.prev = 30;

                                    for (_iterator17 = edge[Symbol.iterator](); !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                                      _vertexIndex2 = _step17.value;

                                      vertexIndexToEdges.get(_vertexIndex2).add(_edgeJSON);
                                    }
                                    _context2.next = 38;
                                    break;

                                  case 34:
                                    _context2.prev = 34;
                                    _context2.t1 = _context2["catch"](30);
                                    _didIteratorError17 = true;
                                    _iteratorError17 = _context2.t1;

                                  case 38:
                                    _context2.prev = 38;
                                    _context2.prev = 39;

                                    if (!_iteratorNormalCompletion17 && _iterator17.return) {
                                      _iterator17.return();
                                    }

                                  case 41:
                                    _context2.prev = 41;

                                    if (!_didIteratorError17) {
                                      _context2.next = 44;
                                      break;
                                    }

                                    throw _iteratorError17;

                                  case 44:
                                    return _context2.finish(41);

                                  case 45:
                                    return _context2.finish(38);

                                  case 46:
                                    if (!edgeToFaces.has(_edgeJSON)) edgeToFaces.set(_edgeJSON, []);
                                    edgeToFaces.get(_edgeJSON).push(face);

                                  case 48:
                                    _iteratorNormalCompletion16 = true;
                                    _context2.next = 24;
                                    break;

                                  case 51:
                                    _context2.next = 57;
                                    break;

                                  case 53:
                                    _context2.prev = 53;
                                    _context2.t2 = _context2["catch"](22);
                                    _didIteratorError16 = true;
                                    _iteratorError16 = _context2.t2;

                                  case 57:
                                    _context2.prev = 57;
                                    _context2.prev = 58;

                                    if (!_iteratorNormalCompletion16 && _iterator16.return) {
                                      _iterator16.return();
                                    }

                                  case 60:
                                    _context2.prev = 60;

                                    if (!_didIteratorError16) {
                                      _context2.next = 63;
                                      break;
                                    }

                                    throw _iteratorError16;

                                  case 63:
                                    return _context2.finish(60);

                                  case 64:
                                    return _context2.finish(57);

                                  case 65:
                                    newModel.vertices.push(_this.createCombinedVertex(face.map(function (vertexIndex) {
                                      return { vertex: model.vertices[vertexIndex], blendRate: 1 / face.length };
                                    })));
                                    faceToFacePointIndex.set(face, newModel.vertices.length - 1);
                                    _context2.next = 69;
                                    return logger.progressAsync();

                                  case 69:
                                  case "end":
                                    return _context2.stop();
                                }
                              }
                            }, _loop2, _this, [[3, 7, 11, 19], [12,, 14, 18], [22, 53, 57, 65], [30, 34, 38, 46], [39,, 41, 45], [58,, 60, 64]]);
                          });
                          _iteratorNormalCompletion10 = true;
                          _didIteratorError10 = false;
                          _iteratorError10 = undefined;
                          _context3.prev = 48;
                          _iterator10 = _.flatMap(targetMaterialIndices, function (targetMaterialIndex) {
                            return allFaces[targetMaterialIndex];
                          })[Symbol.iterator]();

                        case 50:
                          if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
                            _context3.next = 56;
                            break;
                          }

                          face = _step10.value;
                          return _context3.delegateYield(_loop2(face), "t1", 53);

                        case 53:
                          _iteratorNormalCompletion10 = true;
                          _context3.next = 50;
                          break;

                        case 56:
                          _context3.next = 62;
                          break;

                        case 58:
                          _context3.prev = 58;
                          _context3.t2 = _context3["catch"](48);
                          _didIteratorError10 = true;
                          _iteratorError10 = _context3.t2;

                        case 62:
                          _context3.prev = 62;
                          _context3.prev = 63;

                          if (!_iteratorNormalCompletion10 && _iterator10.return) {
                            _iterator10.return();
                          }

                        case 65:
                          _context3.prev = 65;

                          if (!_didIteratorError10) {
                            _context3.next = 68;
                            break;
                          }

                          throw _iteratorError10;

                        case 68:
                          return _context3.finish(65);

                        case 69:
                          return _context3.finish(62);

                        case 70:
                          _context3.next = 72;
                          return logger.progressAsync("頂点->エッジインデックス作成中...", vertexIndexToEdges.size);

                        case 72:
                          _iteratorNormalCompletion11 = true;
                          _didIteratorError11 = false;
                          _iteratorError11 = undefined;
                          _context3.prev = 75;
                          _iterator11 = vertexIndexToEdges[Symbol.iterator]();

                        case 77:
                          if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
                            _context3.next = 88;
                            break;
                          }

                          _ref71 = _step11.value;
                          _ref72 = _slicedToArray(_ref71, 2);
                          vertexIndex = _ref72[0];
                          edgeJSONSet = _ref72[1];

                          vertexIndexToEdges.set(vertexIndex, Array.from(edgeJSONSet).map(JSON.parse));
                          _context3.next = 85;
                          return logger.progressAsync();

                        case 85:
                          _iteratorNormalCompletion11 = true;
                          _context3.next = 77;
                          break;

                        case 88:
                          _context3.next = 94;
                          break;

                        case 90:
                          _context3.prev = 90;
                          _context3.t3 = _context3["catch"](75);
                          _didIteratorError11 = true;
                          _iteratorError11 = _context3.t3;

                        case 94:
                          _context3.prev = 94;
                          _context3.prev = 95;

                          if (!_iteratorNormalCompletion11 && _iterator11.return) {
                            _iterator11.return();
                          }

                        case 97:
                          _context3.prev = 97;

                          if (!_didIteratorError11) {
                            _context3.next = 100;
                            break;
                          }

                          throw _iteratorError11;

                        case 100:
                          return _context3.finish(97);

                        case 101:
                          return _context3.finish(94);

                        case 102:
                          _context3.next = 104;
                          return logger.progressAsync("edge point作成中...", edgeToFaces.size);

                        case 104:
                          _iteratorNormalCompletion12 = true;
                          _didIteratorError12 = false;
                          _iteratorError12 = undefined;
                          _context3.prev = 107;
                          _iterator12 = edgeToFaces.keys()[Symbol.iterator]();

                        case 109:
                          if (_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done) {
                            _context3.next = 129;
                            break;
                          }

                          edgeJSON = _step12.value;
                          edge = JSON.parse(edgeJSON);
                          faces = edgeToFacesSharingVertexKeyPair(edge);
                          _context3.t4 = faces.length;
                          _context3.next = _context3.t4 === 1 ? 116 : _context3.t4 === 2 ? 118 : 122;
                          break;

                        case 116:
                          newModel.vertices.push(_this.createCombinedVertex(edge.map(function (vertexIndex) {
                            return { vertex: newModel.vertices[vertexIndex], blendRate: 1 / 2 };
                          })));
                          return _context3.abrupt("break", 123);

                        case 118:
                          edgePoint = _this.createCombinedVertex(faces.map(function (face) {
                            return faceToFacePointIndex.get(face);
                          }).concat(edge).map(function (vertexIndex) {
                            return { vertex: newModel.vertices[vertexIndex], blendRate: 1 / 4 };
                          }));

                          edgePoint.uv = model.vertices[edge[0]].uv.add(model.vertices[edge[1]].uv).divide(2);
                          newModel.vertices.push(edgePoint);
                          return _context3.abrupt("break", 123);

                        case 122:
                          throw new Error("An edge shared by more than two faces has been found: " + edgeJSON + " is shared by " + faces.length + " faces");

                        case 123:
                          edgeToEdgePointIndex.set(edgeJSON, newModel.vertices.length - 1);
                          _context3.next = 126;
                          return logger.progressAsync();

                        case 126:
                          _iteratorNormalCompletion12 = true;
                          _context3.next = 109;
                          break;

                        case 129:
                          _context3.next = 135;
                          break;

                        case 131:
                          _context3.prev = 131;
                          _context3.t5 = _context3["catch"](107);
                          _didIteratorError12 = true;
                          _iteratorError12 = _context3.t5;

                        case 135:
                          _context3.prev = 135;
                          _context3.prev = 136;

                          if (!_iteratorNormalCompletion12 && _iterator12.return) {
                            _iterator12.return();
                          }

                        case 138:
                          _context3.prev = 138;

                          if (!_didIteratorError12) {
                            _context3.next = 141;
                            break;
                          }

                          throw _iteratorError12;

                        case 141:
                          return _context3.finish(138);

                        case 142:
                          return _context3.finish(135);

                        case 143:
                          _context3.next = 145;
                          return logger.progressAsync("新規面作成中...", targetMaterialIndices.map(function (targetMaterialIndex) {
                            return allFaces[targetMaterialIndex].length;
                          }).reduce(_.add, 0));

                        case 145:
                          _iteratorNormalCompletion13 = true;
                          _didIteratorError13 = false;
                          _iteratorError13 = undefined;
                          _context3.prev = 148;
                          _iterator13 = targetMaterialIndices[Symbol.iterator]();

                        case 150:
                          if (_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done) {
                            _context3.next = 184;
                            break;
                          }

                          _materialIndex = _step13.value;
                          _iteratorNormalCompletion18 = true;
                          _didIteratorError18 = false;
                          _iteratorError18 = undefined;
                          _context3.prev = 155;
                          _iterator18 = allFaces[_materialIndex][Symbol.iterator]();

                        case 157:
                          if (_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done) {
                            _context3.next = 167;
                            break;
                          }

                          _face2 = _step18.value;
                          centerPointIndex = faceToFacePointIndex.get(_face2);
                          edgePointIndices = _.zip(_face2, _face2.slice(1).concat(_face2.slice(0, 1))).map(function (pair) {
                            return edgeToEdgePointIndex.get(JSON.stringify(_.sortBy(pair, _.identity)));
                          });

                          for (i = 0; i < _face2.length; i++) {
                            newAllFaces[_materialIndex].push([_face2[i], edgePointIndices[i], centerPointIndex, edgePointIndices[(i - 1 + edgePointIndices.length) % edgePointIndices.length]]);
                          }
                          _context3.next = 164;
                          return logger.progressAsync();

                        case 164:
                          _iteratorNormalCompletion18 = true;
                          _context3.next = 157;
                          break;

                        case 167:
                          _context3.next = 173;
                          break;

                        case 169:
                          _context3.prev = 169;
                          _context3.t6 = _context3["catch"](155);
                          _didIteratorError18 = true;
                          _iteratorError18 = _context3.t6;

                        case 173:
                          _context3.prev = 173;
                          _context3.prev = 174;

                          if (!_iteratorNormalCompletion18 && _iterator18.return) {
                            _iterator18.return();
                          }

                        case 176:
                          _context3.prev = 176;

                          if (!_didIteratorError18) {
                            _context3.next = 179;
                            break;
                          }

                          throw _iteratorError18;

                        case 179:
                          return _context3.finish(176);

                        case 180:
                          return _context3.finish(173);

                        case 181:
                          _iteratorNormalCompletion13 = true;
                          _context3.next = 150;
                          break;

                        case 184:
                          _context3.next = 190;
                          break;

                        case 186:
                          _context3.prev = 186;
                          _context3.t7 = _context3["catch"](148);
                          _didIteratorError13 = true;
                          _iteratorError13 = _context3.t7;

                        case 190:
                          _context3.prev = 190;
                          _context3.prev = 191;

                          if (!_iteratorNormalCompletion13 && _iterator13.return) {
                            _iterator13.return();
                          }

                        case 193:
                          _context3.prev = 193;

                          if (!_didIteratorError13) {
                            _context3.next = 196;
                            break;
                          }

                          throw _iteratorError13;

                        case 196:
                          return _context3.finish(193);

                        case 197:
                          return _context3.finish(190);

                        case 198:
                          _context3.next = 200;
                          return logger.progressAsync("original point移動中...", targetVertexIndexSet.size);

                        case 200:
                          _iteratorNormalCompletion14 = true;
                          _didIteratorError14 = false;
                          _iteratorError14 = undefined;
                          _context3.prev = 203;
                          _iterator14 = targetVertexIndexSet[Symbol.iterator]();

                        case 205:
                          if (_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done) {
                            _context3.next = 215;
                            break;
                          }

                          originalVertexIndex = _step14.value;
                          originalVertex = model.vertices[originalVertexIndex];
                          pairs = vertexIndexToEdgesSharingVertexKey(originalVertexIndex).map(function (edge) {
                            return { edge: edge, faces: edgeToFacesSharingVertexKeyPair(edge) };
                          });

                          if (pairs.some(function (_ref73) {
                            var edge = _ref73.edge,
                                faces = _ref73.faces;
                            return faces.length === 1;
                          })) {
                            newModel.vertices[originalVertexIndex].position = avg(_(pairs).filter(function (_ref74) {
                              var edge = _ref74.edge,
                                  faces = _ref74.faces;
                              return faces.length === 1;
                            }).flatMap(function (_ref75) {
                              var edge = _ref75.edge,
                                  faces = _ref75.faces;
                              return edge;
                            }).map(function (vertexIndex) {
                              return newModel.vertices[vertexIndex].position;
                            }).concat(new Array(2).fill(originalVertex.position)).value());
                          } else {
                            F = avg(vertexIndexToFacesSharingVertexKey(originalVertexIndex).map(function (face) {
                              return newModel.vertices[faceToFacePointIndex.get(face)].position;
                            }));
                            R = avg(_(pairs).groupBy(function (_ref76) {
                              var edge = _ref76.edge,
                                  faces = _ref76.faces;
                              return JSON.stringify(_.sortBy(faces, function (face) {
                                return JSON.stringify(face);
                              }));
                            }).flatMap(function (pairsSharingFaces) {
                              return pairsSharingFaces[0].edge;
                            }).map(function (vertexIndex) {
                              return model.vertices[vertexIndex].position;
                            }).value());
                            P = originalVertex.position;
                            n = vertexIndexToFacesSharingVertexKey(originalVertexIndex).length;

                            newModel.vertices[originalVertexIndex].position = F.add(R.multiply(2)).add(P.multiply(n - 3)).divide(n);
                          }
                          _context3.next = 212;
                          return logger.progressAsync();

                        case 212:
                          _iteratorNormalCompletion14 = true;
                          _context3.next = 205;
                          break;

                        case 215:
                          _context3.next = 221;
                          break;

                        case 217:
                          _context3.prev = 217;
                          _context3.t8 = _context3["catch"](203);
                          _didIteratorError14 = true;
                          _iteratorError14 = _context3.t8;

                        case 221:
                          _context3.prev = 221;
                          _context3.prev = 222;

                          if (!_iteratorNormalCompletion14 && _iterator14.return) {
                            _iterator14.return();
                          }

                        case 224:
                          _context3.prev = 224;

                          if (!_didIteratorError14) {
                            _context3.next = 227;
                            break;
                          }

                          throw _iteratorError14;

                        case 227:
                          return _context3.finish(224);

                        case 228:
                          return _context3.finish(221);

                        case 229:
                          return _context3.abrupt("return", [newModel, newAllFaces]);

                        case 230:
                        case "end":
                          return _context3.stop();
                      }
                    }
                  }, _callee2, _this, [[13, 17, 21, 29], [22,, 24, 28], [48, 58, 62, 70], [63,, 65, 69], [75, 90, 94, 102], [95,, 97, 101], [107, 131, 135, 143], [136,, 138, 142], [148, 186, 190, 198], [155, 169, 173, 181], [174,, 176, 180], [191,, 193, 197], [203, 217, 221, 229], [222,, 224, 228]]);
                }));

                return function core(_x5, _x6) {
                  return _ref67.apply(this, arguments);
                };
              }();

              model = _pmx2.default.read(originalModel.write());
              allFaces = this.calcMetaMaterials(model).map(function (metaMaterial) {
                return metaMaterial.faces.map(function (face) {
                  return face.vertexIndices;
                });
              });

              model.faces = [];
              i = 0;

            case 5:
              if (!(i < loopCount)) {
                _context4.next = 17;
                break;
              }

              _context4.next = 8;
              return logger.appendAsync(i + 1 + "/" + loopCount + "\u30EB\u30FC\u30D7\u76EE:");

            case 8:
              _context4.next = 10;
              return core(model, allFaces);

            case 10:
              _ref77 = _context4.sent;
              _ref78 = _slicedToArray(_ref77, 2);
              model = _ref78[0];
              allFaces = _ref78[1];

            case 14:
              i++;
              _context4.next = 5;
              break;

            case 17:

              originalModel.vertices = model.vertices;
              originalModel.faces = _.flatMap(allFaces, function (faces, materialIndex) {
                if (targetMaterialIndices.includes(materialIndex)) {
                  return _(faces).flatMap(function (_ref79) {
                    var _ref80 = _slicedToArray(_ref79, 4),
                        a = _ref80[0],
                        b = _ref80[1],
                        c = _ref80[2],
                        d = _ref80[3];

                    return [[a, b, d], [b, c, d]];
                  }).map(function (vertexIndices) {
                    return new _pmx2.default.Face(vertexIndices);
                  }).value();
                } else {
                  return faces.map(function (vertexIndices) {
                    return new _pmx2.default.Face(vertexIndices);
                  });
                }
              });
              _iteratorNormalCompletion19 = true;
              _didIteratorError19 = false;
              _iteratorError19 = undefined;
              _context4.prev = 22;
              for (_iterator19 = targetMaterialIndices[Symbol.iterator](); !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
                materialIndex = _step19.value;

                originalModel.materials[materialIndex].faceCount = allFaces[materialIndex].length * 2;
              }
              _context4.next = 30;
              break;

            case 26:
              _context4.prev = 26;
              _context4.t0 = _context4["catch"](22);
              _didIteratorError19 = true;
              _iteratorError19 = _context4.t0;

            case 30:
              _context4.prev = 30;
              _context4.prev = 31;

              if (!_iteratorNormalCompletion19 && _iterator19.return) {
                _iterator19.return();
              }

            case 33:
              _context4.prev = 33;

              if (!_didIteratorError19) {
                _context4.next = 36;
                break;
              }

              throw _iteratorError19;

            case 36:
              return _context4.finish(33);

            case 37:
              return _context4.finish(30);

            case 38:
              _context4.next = 40;
              return logger.appendAsync("Catmull-Clark subdivision完了");

            case 40:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee3, this, [[22, 26, 30, 38], [31,, 33, 37]]);
    }));

    function subdivideSurfaceAsync(_x2, _x3, _x4) {
      return _ref66.apply(this, arguments);
    }

    return subdivideSurfaceAsync;
  }(),

  MeshInfo: function () {
    function MeshInfo(model) {
      _classCallCheck(this, MeshInfo);

      this._model = _pmx2.default.read(model.write());
      this._vertexKeyToVertexIndices = new Map();
      this._vertexIndexToFaceIndices = new Map(this._model.vertices.map(function (vertex, vertexIndex) {
        return [vertexIndex, []];
      }));
      this._vertexIndexToEdges = new Map(this._model.vertices.map(function (vertex, vertexIndex) {
        return [vertexIndex, new Set()];
      }));
      this._edgeToFaceIndices = new Map();

      var _iteratorNormalCompletion20 = true;
      var _didIteratorError20 = false;
      var _iteratorError20 = undefined;

      try {
        for (var _iterator20 = _.range(this._model.vertices.length)[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
          var vertexIndex = _step20.value;

          var vertexKey = this.getVertexKeyFrom(vertexIndex);
          if (!this._vertexKeyToVertexIndices.has(vertexKey)) this._vertexKeyToVertexIndices.set(vertexKey, []);
          this._vertexKeyToVertexIndices.get(vertexKey).push(vertexIndex);
        }
      } catch (err) {
        _didIteratorError20 = true;
        _iteratorError20 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion20 && _iterator20.return) {
            _iterator20.return();
          }
        } finally {
          if (_didIteratorError20) {
            throw _iteratorError20;
          }
        }
      }

      var _iteratorNormalCompletion21 = true;
      var _didIteratorError21 = false;
      var _iteratorError21 = undefined;

      try {
        for (var _iterator21 = _.range(this._model.faces.length)[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
          var faceIndex = _step21.value;

          var face = this._model.faces[faceIndex];
          var _iteratorNormalCompletion22 = true;
          var _didIteratorError22 = false;
          var _iteratorError22 = undefined;

          try {
            for (var _iterator22 = face.vertexIndices[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
              var _vertexIndex3 = _step22.value;

              this._vertexIndexToFaceIndices.get(_vertexIndex3).push(faceIndex);
            }
          } catch (err) {
            _didIteratorError22 = true;
            _iteratorError22 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion22 && _iterator22.return) {
                _iterator22.return();
              }
            } finally {
              if (_didIteratorError22) {
                throw _iteratorError22;
              }
            }
          }

          var _iteratorNormalCompletion23 = true;
          var _didIteratorError23 = false;
          var _iteratorError23 = undefined;

          try {
            for (var _iterator23 = _.zip(face.vertexIndices, face.vertexIndices.slice(1).concat(face.vertexIndices.slice(0, 1))).map(function (pair) {
              return _.sortBy(pair, _.identity);
            })[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
              var edge = _step23.value;

              var edgeJSON = JSON.stringify(edge);
              var _iteratorNormalCompletion24 = true;
              var _didIteratorError24 = false;
              var _iteratorError24 = undefined;

              try {
                for (var _iterator24 = edge[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
                  var _vertexIndex4 = _step24.value;

                  this._vertexIndexToEdges.get(_vertexIndex4).add(edgeJSON);
                }
              } catch (err) {
                _didIteratorError24 = true;
                _iteratorError24 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion24 && _iterator24.return) {
                    _iterator24.return();
                  }
                } finally {
                  if (_didIteratorError24) {
                    throw _iteratorError24;
                  }
                }
              }

              if (!this._edgeToFaceIndices.has(edgeJSON)) this._edgeToFaceIndices.set(edgeJSON, []);
              this._edgeToFaceIndices.get(edgeJSON).push(faceIndex);
            }
          } catch (err) {
            _didIteratorError23 = true;
            _iteratorError23 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion23 && _iterator23.return) {
                _iterator23.return();
              }
            } finally {
              if (_didIteratorError23) {
                throw _iteratorError23;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError21 = true;
        _iteratorError21 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion21 && _iterator21.return) {
            _iterator21.return();
          }
        } finally {
          if (_didIteratorError21) {
            throw _iteratorError21;
          }
        }
      }

      this._vertexIndexToEdges = new Map(Array.from(this._vertexIndexToEdges).map(function (_ref81) {
        var _ref82 = _slicedToArray(_ref81, 2),
            vertexIndex = _ref82[0],
            edgeJSONSet = _ref82[1];

        return [vertexIndex, Array.from(edgeJSONSet).map(JSON.parse)];
      }));
    }

    _createClass(MeshInfo, [{
      key: "getVertexKeyFrom",
      value: function getVertexKeyFrom(arg) {
        if (typeof arg === "number") arg = this._model.vertices[arg];
        return JSON.stringify(Array.from(arg.position).concat(Array.from(arg.normal)).map(Math.fround));
      }
    }, {
      key: "getVertexIndicesFrom",
      value: function getVertexIndicesFrom(arg, sharesVertexKey) {
        if (sharesVertexKey) {
          return this._vertexKeyToVertexIndices.get(this.getVertexKeyFrom(arg));
        } else {
          throw new Error("Unknown context");
        }
      }
    }, {
      key: "getVerticesFrom",
      value: function getVerticesFrom(arg, sharesVertexKey) {
        var _this2 = this;

        return this.getVertexIndicesFrom(arg, sharesVertexKey).map(function (vertexIndex) {
          return _this2._model.vertices[vertexIndex];
        });
      }
    }, {
      key: "getEdgesFrom",
      value: function getEdgesFrom(arg, sharesVertexKey) {
        var _this3 = this;

        if (typeof arg === "number") {
          if (sharesVertexKey) {
            return _(this.getVertexIndicesFrom(arg, true)).flatMap(function (vertexIndex) {
              return _this3.getEdgesFrom(vertexIndex, false);
            }).value();
          } else {
            return this._vertexIndexToEdges.get(arg);
          }
        } else if (arg instanceof Array) {
          if (sharesVertexKey) {
            return _(this.getVertexIndicesFrom(arg[0], true)).flatMap(function (vertexIndex) {
              return _this3.getEdgesFrom(vertexIndex, false);
            }).filter(function (_ref83) {
              var _ref84 = _slicedToArray(_ref83, 2),
                  vertexIndex1 = _ref84[0],
                  vertexIndex2 = _ref84[1];

              return _this3.getVertexKeyFrom(vertexIndex1) === _this3.getVertexKeyFrom(arg[0]) && _this3.getVertexKeyFrom(vertexIndex2) === _this3.getVertexKeyFrom(arg[1]) || _this3.getVertexKeyFrom(vertexIndex2) === _this3.getVertexKeyFrom(arg[0]) && _this3.getVertexKeyFrom(vertexIndex1) === _this3.getVertexKeyFrom(arg[1]);
            }).value();
          } else {
            throw new Error("Unknown context");
          }
        } else {
          throw new Error("Unknown context");
        }
      }
    }, {
      key: "getFaceIndicesFrom",
      value: function getFaceIndicesFrom(arg, sharesVertexKey) {
        var _this4 = this;

        if (typeof arg === "number") {
          if (sharesVertexKey) {
            return _(this.getVertexIndicesFrom(arg, true)).flatMap(function (vertexIndex) {
              return _this4.getFaceIndicesFrom(vertexIndex, false);
            }).value();
          } else {
            return this._vertexIndexToFaceIndices.get(arg);
          }
        } else if (arg instanceof Array) {
          if (sharesVertexKey) {
            return _(this.getEdgesFrom(arg, true)).flatMap(function (edge) {
              return _this4.getFaceIndicesFrom(edge, false);
            }).value();
          } else {
            return this._edgeToFaceIndices.get(JSON.stringify(arg));
          }
        } else {
          throw new Error("Unknown context");
        }
      }
    }, {
      key: "getFacesFrom",
      value: function getFacesFrom(arg, sharesVertexKey) {
        var _this5 = this;

        return this.getFaceIndicesFrom(arg, sharesVertexKey).map(function (faceIndex) {
          return _this5._model.faces[faceIndex];
        });
      }
    }]);

    return MeshInfo;
  }(),
  addHair: function addHair(model, positionOrigin, r0, l, n, quaternions, weight, isSharp) {
    var _model$vertices, _model$faces;

    var m = quaternions.length - 1;
    var centers = new Array(m).fill().reduce(function (arr, v, i) {
      arr.push(arr[arr.length - 1].add(quaternions[i + 1].rotate(new _vector4.default(0, l / m, 0))));
      return arr;
    }, [positionOrigin]);
    var positions = new Array(n * (m + 1)).fill().map(function (_, i) {
      var i1 = Math.floor(i / n);
      var i2 = i % n;
      var y = i1 * (l / m);
      var r = !isSharp || y <= l * 2 / 3 ? r0 : _myMath2.default.lerp(r0, 0, (y / l - 2 / 3) * 3);
      var theta = 2 * Math.PI / n * (i2 + 0.5 * (i1 % 2));
      return centers[i1].add(quaternions[i1].rotate(new _vector4.default(Math.cos(theta) * r, 0, Math.sin(theta) * r)));
    });
    var normals = new Array(n * (m + 1)).fill().map(function (_, i) {
      var i1 = Math.floor(i / n);
      var i2 = i % n;
      var iA = (i1 - 1) * n + [(i2 + n - 1) % n, i2][i1 % 2];
      var iB = (i1 - 1) * n + [i2, (i2 + 1) % n][i1 % 2];
      var iC = i1 * n + (i2 + n - 1) % n;
      var iD = i1 * n + (i2 + 1) % n;
      var iE = (i1 + 1) * n + [(i2 + n - 1) % n, i2][i1 % 2];
      var iF = (i1 + 1) * n + [i2, (i2 + 1) % n][i1 % 2];
      if (i1 === 0) {
        return _plane2.default.through(positions[i], positions[iC], positions[iE]).normal().add(_plane2.default.through(positions[i], positions[iE], positions[iF]).normal()).add(_plane2.default.through(positions[iD], positions[i], positions[iF]).normal()).normalize();
      } else if (i1 === m - 1) {
        return _plane2.default.through(positions[iA], positions[iC], positions[i]).normal().add(_plane2.default.through(positions[iB], positions[iA], positions[i]).normal()).add(_plane2.default.through(positions[iB], positions[i], positions[iD]).normal()).add(_plane2.default.through(positions[i], positions[iC], positions[iE]).normal()).add(_plane2.default.through(positions[iD], positions[i], positions[iF]).normal()).normalize();
      } else if (i1 === m) {
        if (isSharp) {
          return _plane2.default.through(positions[iB], positions[iA], positions[i]).normal();
        } else {
          return _plane2.default.through(positions[iA], positions[iC], positions[i]).normal().add(_plane2.default.through(positions[iB], positions[iA], positions[i]).normal()).add(_plane2.default.through(positions[iB], positions[i], positions[iD]).normal()).normalize();
        }
      } else {
        return _plane2.default.through(positions[iA], positions[iC], positions[i]).normal().add(_plane2.default.through(positions[iB], positions[iA], positions[i]).normal()).add(_plane2.default.through(positions[iB], positions[i], positions[iD]).normal()).add(_plane2.default.through(positions[i], positions[iC], positions[iE]).normal()).add(_plane2.default.through(positions[i], positions[iE], positions[iF]).normal()).add(_plane2.default.through(positions[iD], positions[i], positions[iF]).normal()).normalize();
      }
    });
    var vertexIndexOrigin = model.vertices.length;
    (_model$vertices = model.vertices).push.apply(_model$vertices, _toConsumableArray(new Array(n * (m + 1)).fill().map(function (_, i) {
      return new _pmx2.default.Vertex(positions[i], normals[i], new _vector2.default(0, 0), [], weight, 0);
    })));
    (_model$faces = model.faces).push.apply(_model$faces, _toConsumableArray(new Array(isSharp ? 2 * n * (m - 1) + n : 2 * n * m).fill().map(function (_, i) {
      var i1 = Math.floor(i / (2 * n));
      var i2 = Math.floor(i % (2 * n) / n);
      var i3 = i % n;
      if (isSharp ? i1 < m && i2 === 0 || i1 === m : i2 === 0) {
        return new _pmx2.default.Face([i1 * n + (i3 + 1) % n, i1 * n + i3, (i1 + 1) * n + [i3, (i3 + 1) % n][i1 % 2]].map(function (j) {
          return vertexIndexOrigin + j;
        }));
      } else {
        return new _pmx2.default.Face([i1 * n + i3, (i1 + 1) * n + [(i3 + n - 1) % n, i3][i1 % 2], (i1 + 1) * n + [i3, (i3 + 1) % n][i1 % 2]].map(function (j) {
          return vertexIndexOrigin + j;
        }));
      }
    })));
  }
};
exports.default = PMXUtils;

},{"./directed-line-segment-2d":3,"./line-3d":6,"./my-math":9,"./plane":11,"./pmx":13,"./polygon":14,"./text-area-wrapper":18,"./vector2":22,"./vector3":23,"./vector4":24}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require("./lodash-extension");

var _vector = require("./vector2");

var _vector2 = _interopRequireDefault(_vector);

var _vector3 = require("./vector3");

var _vector4 = _interopRequireDefault(_vector3);

var _vector5 = require("./vector4");

var _vector6 = _interopRequireDefault(_vector5);

var _quaternion = require("./quaternion");

var _quaternion2 = _interopRequireDefault(_quaternion);

var _sequentialAccessBinary = require("./sequential-access-binary");

var _sequentialAccessBinary2 = _interopRequireDefault(_sequentialAccessBinary);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PMX = function () {
  function PMX(header, model, vertices, faces, textures, materials, bones, morphs, displayElementGroups, rigidBodies, joints) {
    _classCallCheck(this, PMX);

    this.header = header;
    this.model = model;
    this.vertices = vertices;
    this.faces = faces;
    this.textures = textures;
    this.materials = materials;
    this.bones = bones;
    this.morphs = morphs;
    this.displayElementGroups = displayElementGroups;
    this.rigidBodies = rigidBodies;
    this.joints = joints;
  }

  _createClass(PMX, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.header.clone(), this.model.clone(), this.vertices.map(function (vertex) {
        return vertex.clone();
      }), this.faces.map(function (face) {
        return face.clone();
      }), this.textures.map(function (texture) {
        return texture.clone();
      }), this.materials.map(function (material) {
        return material.clone();
      }), this.bones.map(function (bone) {
        return bone.clone();
      }), this.morphs.map(function (morph) {
        return morph.clone();
      }), this.displayElementGroups.map(function (displayElementGroup) {
        return displayElementGroup.clone();
      }), this.rigidBodies.map(function (rigidBody) {
        return rigidBody.clone();
      }), this.joints.map(function (joint) {
        return joint.clone();
      }));
    }
  }, {
    key: "establishConsistency",
    value: function establishConsistency() {
      // 重いのでスキップ
      /*
      const extraUVCount = this.vertices.map(vertex => vertex.extraUVs.length).reduce(Math.max, 0)
      this.vertices.forEach(vertex => {
        _.range(vertex.extraUVs.length, extraUVCount).forEach(() => {
          vertex.extraUVs.push(new Vector4(0, 0, 0, 0));
        });
      });
      this.header.extraUVCount = extraUVCount;
      */
      this.header.vertexIndexSize = this.vertices.length <= 255 ? 1 : this.vertices.length <= 65535 ? 2 : 4;
      this.header.textureIndexSize = this.textures.length <= 127 ? 1 : this.textures.length <= 32767 ? 2 : 4;
      this.header.materialIndexSize = this.materials.length <= 127 ? 1 : this.materials.length <= 32767 ? 2 : 4;
      this.header.boneIndexSize = this.bones.length <= 127 ? 1 : this.bones.length <= 32767 ? 2 : 4;
      this.header.morphIndexSize = this.morphs.length <= 127 ? 1 : this.morphs.length <= 32767 ? 2 : 4;
      this.header.rigidBodyIndexSize = this.rigidBodies.length <= 127 ? 1 : this.rigidBodies.length <= 32767 ? 2 : 4;
    }
  }, {
    key: "write",
    value: function write() {
      this.establishConsistency();
      var io = new PMX.SequentialAccessBinary(new _sequentialAccessBinary2.default(), this.header);
      io.writeString("PMX ", "utf-8");
      io.writeFloat32(2.0);
      this.header.write(io);
      this.model.write(io);
      io.writeInt32(this.vertices.length);
      this.vertices.forEach(function (vertex) {
        vertex.write(io);
      });
      io.writeInt32(this.faces.length * 3);
      this.faces.forEach(function (face) {
        face.write(io);
      });
      io.writeInt32(this.textures.length);
      this.textures.forEach(function (texture) {
        texture.write(io);
      });
      io.writeInt32(this.materials.length);
      this.materials.forEach(function (material) {
        material.write(io);
      });
      io.writeInt32(this.bones.length);
      this.bones.forEach(function (bone) {
        bone.write(io);
      });
      io.writeInt32(this.morphs.length);
      this.morphs.forEach(function (morph) {
        morph.write(io);
      });
      io.writeInt32(this.displayElementGroups.length);
      this.displayElementGroups.forEach(function (displayElementGroup) {
        displayElementGroup.write(io);
      });
      io.writeInt32(this.rigidBodies.length);
      this.rigidBodies.forEach(function (rigidBody) {
        rigidBody.write(io);
      });
      io.writeInt32(this.joints.length);
      this.joints.forEach(function (joint) {
        joint.write(io);
      });
      return io.toUint8Array();
    }
  }], [{
    key: "read",
    value: function read(binary) {
      var _this = this;

      var io = new _sequentialAccessBinary2.default(binary);
      if (io.readString(4, "utf-8") != "PMX ") throw new Error("Not PMX.");
      if (io.readFloat32() != 2.0) throw new Error("Incompatible version.");
      var header = this.Header.read(io);
      io = new this.SequentialAccessBinary(io, header);
      var model = this.Model.read(io);
      var vertices = new Array(io.readInt32()).fill().map(function () {
        return _this.Vertex.read(io);
      });
      var faces = new Array(io.readInt32() / 3).fill().map(function () {
        return _this.Face.read(io);
      });
      var textures = new Array(io.readInt32()).fill().map(function () {
        return _this.Texture.read(io);
      });
      var materials = new Array(io.readInt32()).fill().map(function () {
        return _this.Material.read(io);
      });
      var bones = new Array(io.readInt32()).fill().map(function () {
        return _this.Bone.read(io);
      });
      var morphs = new Array(io.readInt32()).fill().map(function () {
        return _this.Morph.read(io);
      });
      var displayElementGroups = new Array(io.readInt32()).fill().map(function () {
        return _this.DisplayElementGroup.read(io);
      });
      var rigidBodies = new Array(io.readInt32()).fill().map(function () {
        return _this.RigidBody.read(io);
      });
      var joints = new Array(io.readInt32()).fill().map(function () {
        return _this.Joint.read(io);
      });
      return new this(header, model, vertices, faces, textures, materials, bones, morphs, displayElementGroups, rigidBodies, joints);
    }
  }]);

  return PMX;
}();

exports.default = PMX;

PMX.Header = function () {
  function Header(encoding, extraUVCount, vertexIndexSize, textureIndexSize, materialIndexSize, boneIndexSize, morphIndexSize, rigidBodyIndexSize) {
    _classCallCheck(this, Header);

    this.encoding = encoding;
    this.extraUVCount = extraUVCount;
    this.vertexIndexSize = vertexIndexSize;
    this.textureIndexSize = textureIndexSize;
    this.materialIndexSize = materialIndexSize;
    this.boneIndexSize = boneIndexSize;
    this.morphIndexSize = morphIndexSize;
    this.rigidBodyIndexSize = rigidBodyIndexSize;
  }

  _createClass(Header, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.encoding, this.extraUVCount, this.vertexIndexSize, this.textureIndexSize, this.materialIndexSize, this.boneIndexSize, this.morphIndexSize, this.rigidBodyIndexSize);
    }
  }, {
    key: "write",
    value: function write(io) {
      io.writeUint8(8);
      io.writeUint8({ "utf-16le": 0, "utf-8": 1 }[this.encoding]);
      io.writeUint8(this.extraUVCount);
      io.writeUint8(this.vertexIndexSize);
      io.writeUint8(this.textureIndexSize);
      io.writeUint8(this.materialIndexSize);
      io.writeUint8(this.boneIndexSize);
      io.writeUint8(this.morphIndexSize);
      io.writeUint8(this.rigidBodyIndexSize);
    }
  }], [{
    key: "read",
    value: function read(io) {
      if (io.readUint8() != 8) throw new Error("Invalid header size.");
      var encoding = ["utf-16le", "utf-8"][io.readUint8()];
      var extraUVCount = io.readUint8();
      var vertexIndexSize = io.readUint8();
      var textureIndexSize = io.readUint8();
      var materialIndexSize = io.readUint8();
      var boneIndexSize = io.readUint8();
      var morphIndexSize = io.readUint8();
      var rigidBodyIndexSize = io.readUint8();
      return new this(encoding, extraUVCount, vertexIndexSize, textureIndexSize, materialIndexSize, boneIndexSize, morphIndexSize, rigidBodyIndexSize);
    }
  }]);

  return Header;
}();
PMX.SequentialAccessBinary = function (_SequentialAccessBina) {
  _inherits(SequentialAccessBinary, _SequentialAccessBina);

  function SequentialAccessBinary(sequentialAccessBinary, header) {
    _classCallCheck(this, SequentialAccessBinary);

    var _this2 = _possibleConstructorReturn(this, (SequentialAccessBinary.__proto__ || Object.getPrototypeOf(SequentialAccessBinary)).call(this));

    _this2.view = sequentialAccessBinary.view;
    _this2.offset = sequentialAccessBinary.offset;
    _this2.header = header;
    return _this2;
  }

  _createClass(SequentialAccessBinary, [{
    key: "readTextBuffer",
    value: function readTextBuffer() {
      var byteLength = this.readInt32();
      return this.readString(byteLength, this.header.encoding);
    }
  }, {
    key: "writeTextBuffer",
    value: function writeTextBuffer(value) {
      var byteLength = new TextEncoder(this.header.encoding, { NONSTANDARD_allowLegacyEncoding: true }).encode(value).length;
      this.writeInt32(byteLength);
      this.writeString(value, this.header.encoding);
    }
  }, {
    key: "readExtraUVs",
    value: function readExtraUVs() {
      var _this3 = this;

      return new Array(this.header.extraUVCount).fill().map(function () {
        return new (Function.prototype.bind.apply(_vector6.default, [null].concat(_toConsumableArray(_this3.readFloat32Array(4)))))();
      });
    }
  }, {
    key: "writeExtraUVs",
    value: function writeExtraUVs(values) {
      var _this4 = this;

      values.forEach(function (value) {
        _this4.writeFloat32Array(Array.from(value));
      });
    }
  }, {
    key: "readVertexIndex",
    value: function readVertexIndex() {
      return this[{ 1: "readUint8", 2: "readUint16", 4: "readInt32" }[this.header.vertexIndexSize]]();
    }
  }, {
    key: "writeVertexIndex",
    value: function writeVertexIndex(value) {
      this[{ 1: "writeUint8", 2: "writeUint16", 4: "writeInt32" }[this.header.vertexIndexSize]](value);
    }
  }, {
    key: "readTextureIndex",
    value: function readTextureIndex() {
      return this["readInt" + 8 * this.header.textureIndexSize]();
    }
  }, {
    key: "writeTextureIndex",
    value: function writeTextureIndex(value) {
      return this["writeInt" + 8 * this.header.textureIndexSize](value);
    }
  }, {
    key: "readMaterialIndex",
    value: function readMaterialIndex() {
      return this["readInt" + 8 * this.header.materialIndexSize]();
    }
  }, {
    key: "writeMaterialIndex",
    value: function writeMaterialIndex(value) {
      return this["writeInt" + 8 * this.header.materialIndexSize](value);
    }
  }, {
    key: "readBoneIndex",
    value: function readBoneIndex() {
      return this["readInt" + 8 * this.header.boneIndexSize]();
    }
  }, {
    key: "writeBoneIndex",
    value: function writeBoneIndex(value) {
      return this["writeInt" + 8 * this.header.boneIndexSize](value);
    }
  }, {
    key: "readMorphIndex",
    value: function readMorphIndex() {
      return this["readInt" + 8 * this.header.morphIndexSize]();
    }
  }, {
    key: "writeMorphIndex",
    value: function writeMorphIndex(value) {
      return this["writeInt" + 8 * this.header.morphIndexSize](value);
    }
  }, {
    key: "readRigidBodyIndex",
    value: function readRigidBodyIndex() {
      return this["readInt" + 8 * this.header.rigidBodyIndexSize]();
    }
  }, {
    key: "writeRigidBodyIndex",
    value: function writeRigidBodyIndex(value) {
      return this["writeInt" + 8 * this.header.rigidBodyIndexSize](value);
    }
  }]);

  return SequentialAccessBinary;
}(_sequentialAccessBinary2.default);
PMX.Model = function () {
  function Model(japaneseName, englishName, japaneseComment, englishComment) {
    _classCallCheck(this, Model);

    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.japaneseComment = japaneseComment;
    this.englishComment = englishComment;
  }

  _createClass(Model, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.japaneseName, this.englishName, this.japaneseComment, this.englishComment);
    }
  }, {
    key: "write",
    value: function write(io) {
      io.writeTextBuffer(this.japaneseName);
      io.writeTextBuffer(this.englishName);
      io.writeTextBuffer(this.japaneseComment);
      io.writeTextBuffer(this.englishComment);
    }
  }], [{
    key: "read",
    value: function read(io) {
      var japaneseName = io.readTextBuffer();
      var englishName = io.readTextBuffer();
      var japaneseComment = io.readTextBuffer();
      var englishComment = io.readTextBuffer();
      return new this(japaneseName, englishName, japaneseComment, englishComment);
    }
  }]);

  return Model;
}();
PMX.Vertex = function () {
  function Vertex(position, normal, uv, extraUVs, weight, edgeSizeRate) {
    _classCallCheck(this, Vertex);

    this.position = position;
    this.normal = normal;
    this.uv = uv;
    this.extraUVs = extraUVs;
    this.weight = weight;
    this.edgeSizeRate = edgeSizeRate;
  }

  _createClass(Vertex, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.position.clone(), this.normal.clone(), this.uv.clone(), this.extraUVs.map(function (extraUV) {
        return extraUV.clone();
      }), this.weight.clone(), this.edgeSizeRate);
    }
  }, {
    key: "write",
    value: function write(io) {
      io.writeFloat32Array(Array.from(this.position));
      io.writeFloat32Array(Array.from(this.normal));
      io.writeFloat32Array(Array.from(this.uv));
      io.writeExtraUVs(this.extraUVs);
      io.writeUint8(new Map([[this.constructor.Weight.BDEF1, 0], [this.constructor.Weight.BDEF2, 1], [this.constructor.Weight.BDEF4, 2], [this.constructor.Weight.SDEF, 3]]).get(this.weight.constructor));
      this.weight.write(io);
      io.writeFloat32(this.edgeSizeRate);
    }
  }], [{
    key: "read",
    value: function read(io) {
      var position = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();
      var normal = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();
      var uv = new (Function.prototype.bind.apply(_vector2.default, [null].concat(_toConsumableArray(io.readFloat32Array(2)))))();
      var extraUVs = io.readExtraUVs();
      var weight = [this.Weight.BDEF1, this.Weight.BDEF2, this.Weight.BDEF4, this.Weight.SDEF][io.readUint8()].read(io);
      var edgeSizeRate = io.readFloat32();
      return new this(position, normal, uv, extraUVs, weight, edgeSizeRate);
    }
  }]);

  return Vertex;
}();
PMX.Vertex.Weight = {
  BDEF1: function () {
    function BDEF1(bones) {
      _classCallCheck(this, BDEF1);

      this.bones = bones;
    }

    _createClass(BDEF1, [{
      key: "clone",
      value: function clone() {
        return new this.constructor(this.bones.map(function (_ref) {
          var index = _ref.index,
              weight = _ref.weight;
          return { index: index, weight: weight };
        }));
      }
    }, {
      key: "write",
      value: function write(io) {
        io.writeBoneIndex(this.bones[0].index);
      }
    }], [{
      key: "read",
      value: function read(io) {
        var index = io.readBoneIndex();
        return new this([{ index: index, weight: 1 }]);
      }
    }]);

    return BDEF1;
  }(),
  BDEF2: function () {
    function BDEF2(bones) {
      _classCallCheck(this, BDEF2);

      this.bones = bones;
    }

    _createClass(BDEF2, [{
      key: "clone",
      value: function clone() {
        return new this.constructor(this.bones.map(function (_ref2) {
          var index = _ref2.index,
              weight = _ref2.weight;
          return { index: index, weight: weight };
        }));
      }
    }, {
      key: "write",
      value: function write(io) {
        this.bones.forEach(function (bone) {
          io.writeBoneIndex(bone.index);
        });
        io.writeFloat32(this.bones[0].weight);
      }
    }], [{
      key: "read",
      value: function read(io) {
        var indices = new Array(2).fill().map(function () {
          return io.readBoneIndex();
        });
        var weight = io.readFloat32();
        return new this([{ index: indices[0], weight: weight }, { index: indices[1], weight: 1 - weight }]);
      }
    }]);

    return BDEF2;
  }(),
  BDEF4: function () {
    function BDEF4(bones) {
      _classCallCheck(this, BDEF4);

      this.bones = bones;
    }

    _createClass(BDEF4, [{
      key: "clone",
      value: function clone() {
        return new this.constructor(this.bones.map(function (_ref3) {
          var index = _ref3.index,
              weight = _ref3.weight;
          return { index: index, weight: weight };
        }));
      }
    }, {
      key: "write",
      value: function write(io) {
        this.bones.forEach(function (bone) {
          io.writeBoneIndex(bone.index);
        });
        this.bones.forEach(function (bone) {
          io.writeFloat32(bone.weight);
        });
      }
    }], [{
      key: "read",
      value: function read(io) {
        var indices = new Array(4).fill().map(function () {
          return io.readBoneIndex();
        });
        var weights = new Array(4).fill().map(function () {
          return io.readFloat32();
        });
        return new this(_.range(4).map(function (i) {
          return { index: indices[i], weight: weights[i] };
        }));
      }
    }]);

    return BDEF4;
  }(),
  SDEF: function () {
    function SDEF(bones, c, r0, r1) {
      _classCallCheck(this, SDEF);

      this.bones = bones;
      this.c = c;
      this.r0 = r0;
      this.r1 = r1;
    }

    _createClass(SDEF, [{
      key: "clone",
      value: function clone() {
        return new this.constructor(this.bones.map(function (_ref4) {
          var index = _ref4.index,
              weight = _ref4.weight;
          return { index: index, weight: weight };
        }), this.c.clone(), this.r0.clone(), this.r1.clone());
      }
    }, {
      key: "write",
      value: function write(io) {
        this.bones.forEach(function (bone) {
          io.writeBoneIndex(bone.index);
        });
        io.writeFloat32(this.bones[0].weight);
        io.writeFloat32Array(Array.from(this.c));
        io.writeFloat32Array(Array.from(this.r0));
        io.writeFloat32Array(Array.from(this.r1));
      }
    }], [{
      key: "read",
      value: function read(io) {
        var indices = new Array(2).fill().map(function () {
          return io.readBoneIndex();
        });
        var weight = io.readFloat32();
        var c = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();
        var r0 = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();
        var r1 = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();
        return new this([{ index: indices[0], weight: weight }, { index: indices[1], weight: 1 - weight }], c, r0, r1);
      }
    }]);

    return SDEF;
  }()
};
PMX.Face = function () {
  function Face(vertexIndices) {
    _classCallCheck(this, Face);

    this.vertexIndices = vertexIndices;
  }

  _createClass(Face, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.vertexIndices.slice());
    }
  }, {
    key: "write",
    value: function write(io) {
      this.vertexIndices.forEach(function (vertexIndex) {
        io.writeVertexIndex(vertexIndex);
      });
    }
  }], [{
    key: "read",
    value: function read(io) {
      var vertexIndices = new Array(3).fill().map(function () {
        return io.readVertexIndex();
      });
      return new this(vertexIndices);
    }
  }]);

  return Face;
}();
PMX.Texture = function () {
  function Texture(filePath) {
    _classCallCheck(this, Texture);

    this.filePath = filePath;
  }

  _createClass(Texture, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.filePath);
    }
  }, {
    key: "write",
    value: function write(io) {
      io.writeTextBuffer(this.filePath);
    }
  }], [{
    key: "read",
    value: function read(io) {
      var filePath = io.readTextBuffer();
      return new this(filePath);
    }
  }]);

  return Texture;
}();
PMX.Material = function () {
  function Material(japaneseName, englishName, diffuse, specular, ambient, isDoubleSided, rendersGroundShadow, makesSelfShadow, rendersSelfShadow, rendersEdge, edge, textureIndex, sphereTexture, toonTexture, memo, faceCount) {
    _classCallCheck(this, Material);

    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.diffuse = diffuse;
    this.specular = specular;
    this.ambient = ambient;
    this.isDoubleSided = isDoubleSided;
    this.rendersGroundShadow = rendersGroundShadow;
    this.makesSelfShadow = makesSelfShadow;
    this.rendersSelfShadow = rendersSelfShadow;
    this.rendersEdge = rendersEdge;
    this.edge = edge;
    this.textureIndex = textureIndex;
    this.sphereTexture = sphereTexture;
    this.toonTexture = toonTexture;
    this.memo = memo;
    this.faceCount = faceCount;
  }

  _createClass(Material, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.japaneseName, this.englishName, { red: this.diffuse.red, green: this.diffuse.green, blue: this.diffuse.blue, alpha: this.diffuse.alpha }, { red: this.specular.red, green: this.specular.green, blue: this.specular.blue, coefficient: this.specular.coefficient }, { red: this.ambient.red, green: this.ambient.green, blue: this.ambient.blue }, this.isDoubleSided, this.rendersGroundShadow, this.makesSelfShadow, this.rendersSelfShadow, this.rendersEdge, { red: this.edge.red, green: this.edge.green, blue: this.edge.blue, alpha: this.edge.alpha, size: this.edge.size }, this.textureIndex, { index: this.sphereTexture.index, mode: this.sphereTexture.mode }, { isShared: this.toonTexture.isShared, index: this.toonTexture.index }, this.memo, this.faceCount);
    }
  }, {
    key: "write",
    value: function write(io) {
      io.writeTextBuffer(this.japaneseName);
      io.writeTextBuffer(this.englishName);
      io.writeFloat32Array([this.diffuse.red, this.diffuse.green, this.diffuse.blue, this.diffuse.alpha]);
      io.writeFloat32Array([this.specular.red, this.specular.green, this.specular.blue, this.specular.coefficient]);
      io.writeFloat32Array([this.ambient.red, this.ambient.green, this.ambient.blue]);
      io.writeUint8((this.isDoubleSided ? 0x01 : 0x00) | (this.rendersGroundShadow ? 0x02 : 0x00) | (this.makesSelfShadow ? 0x04 : 0x00) | (this.rendersSelfShadow ? 0x08 : 0x00) | (this.rendersEdge ? 0x10 : 0x00));
      io.writeFloat32Array([this.edge.red, this.edge.green, this.edge.blue, this.edge.alpha, this.edge.size]);
      io.writeTextureIndex(this.textureIndex);
      io.writeTextureIndex(this.sphereTexture.index);
      io.writeUint8({ disabled: 0, multiply: 1, add: 2, subTexture: 3 }[this.sphereTexture.mode]);
      io.writeUint8(this.toonTexture.isShared ? 1 : 0);
      if (this.toonTexture.isShared) {
        io.writeUint8(this.toonTexture.index);
      } else {
        io.writeTextureIndex(this.toonTexture.index);
      }
      io.writeTextBuffer(this.memo);
      io.writeInt32(this.faceCount * 3);
    }
  }], [{
    key: "read",
    value: function read(io) {
      var japaneseName = io.readTextBuffer();
      var englishName = io.readTextBuffer();
      var diffuse = {
        red: io.readFloat32(),
        green: io.readFloat32(),
        blue: io.readFloat32(),
        alpha: io.readFloat32()
      };
      var specular = {
        red: io.readFloat32(),
        green: io.readFloat32(),
        blue: io.readFloat32(),
        coefficient: io.readFloat32()
      };
      var ambient = {
        red: io.readFloat32(),
        green: io.readFloat32(),
        blue: io.readFloat32()
      };
      var bitFlag = io.readUint8();
      var isDoubleSided = (bitFlag & 0x01) == 0x01;
      var rendersGroundShadow = (bitFlag & 0x02) == 0x02;
      var makesSelfShadow = (bitFlag & 0x04) == 0x04;
      var rendersSelfShadow = (bitFlag & 0x08) == 0x08;
      var rendersEdge = (bitFlag & 0x10) == 0x10;
      var edge = {
        red: io.readFloat32(),
        green: io.readFloat32(),
        blue: io.readFloat32(),
        alpha: io.readFloat32(),
        size: io.readFloat32()
      };
      var textureIndex = io.readTextureIndex();
      var sphereTexture = {
        index: io.readTextureIndex(),
        mode: ["disabled", "multiply", "add", "subTexture"][io.readUint8()]
      };
      var toonTextureShared = io.readUint8() === 1;
      var toonTexture = {
        isShared: toonTextureShared,
        index: toonTextureShared ? io.readUint8() : io.readTextureIndex()
      };
      var memo = io.readTextBuffer();
      var faceCount = io.readInt32() / 3;
      return new this(japaneseName, englishName, diffuse, specular, ambient, isDoubleSided, rendersGroundShadow, makesSelfShadow, rendersSelfShadow, rendersEdge, edge, textureIndex, sphereTexture, toonTexture, memo, faceCount);
    }
  }]);

  return Material;
}();
PMX.Bone = function () {
  function Bone(japaneseName, englishName, position, parentIndex, deformationOrder, connection, isRotatable, isMovable, isVisible, isControllable, ikInfo, localAdditionMode, additionalRotation, additionalDisplacement, fixedAxis, localAxis, deformsAfterPhysics, keyValue) {
    _classCallCheck(this, Bone);

    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.position = position;
    this.parentIndex = parentIndex;
    this.deformationOrder = deformationOrder;
    this.connection = connection;
    this.isRotatable = isRotatable;
    this.isMovable = isMovable;
    this.isVisible = isVisible;
    this.isControllable = isControllable;
    this.ikInfo = ikInfo;
    this.localAdditionMode = localAdditionMode;
    this.additionalRotation = additionalRotation;
    this.additionalDisplacement = additionalDisplacement;
    this.fixedAxis = fixedAxis;
    this.localAxis = localAxis;
    this.deformsAfterPhysics = deformsAfterPhysics;
    this.keyValue = keyValue;
  }

  _createClass(Bone, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.japaneseName, this.englishName, this.position.clone(), this.parentIndex, this.deformationOrder, this.connection instanceof _vector4.default ? this.connection.clone() : this.connection, this.isRotatable, this.isMovable, this.isVisible, this.isControllable, this.isIK() ? this.ikInfo.clone() : null, this.localAdditionMode, this.addsRotation() ? { parentIndex: this.additionalRotation.parentIndex, rate: this.additionalRotation.rate } : null, this.addsDisplacement() ? { parentIndex: this.additionalDisplacement.parentIndex, rate: this.additionalDisplacement.rate } : null, this.fixesAxis() ? this.fixedAxis.clone() : null, this.hasLocalAxis() ? { x: this.localAxis.x.clone(), z: this.localAxis.z.clone() } : null, this.deformsAfterPhysics, this.deformsUsingExternalParent() ? this.keyValue : null);
    }
  }, {
    key: "isIK",
    value: function isIK() {
      return this.ikInfo !== null;
    }
  }, {
    key: "addsRotation",
    value: function addsRotation() {
      return this.additionalRotation !== null;
    }
  }, {
    key: "addsDisplacement",
    value: function addsDisplacement() {
      return this.additionalDisplacement !== null;
    }
  }, {
    key: "fixesAxis",
    value: function fixesAxis() {
      return this.fixedAxis !== null;
    }
  }, {
    key: "hasLocalAxis",
    value: function hasLocalAxis() {
      return this.localAxis !== null;
    }
  }, {
    key: "deformsUsingExternalParent",
    value: function deformsUsingExternalParent() {
      return this.keyValue !== null;
    }
  }, {
    key: "write",
    value: function write(io) {
      io.writeTextBuffer(this.japaneseName);
      io.writeTextBuffer(this.englishName);
      io.writeFloat32Array(Array.from(this.position));
      io.writeBoneIndex(this.parentIndex);
      io.writeInt32(this.deformationOrder);
      io.writeUint8((this.connection instanceof _vector4.default ? 0x00 : 0x01) | (this.isRotatable ? 0x02 : 0x00) | (this.isMovable ? 0x04 : 0x00) | (this.isVisible ? 0x08 : 0x00) | (this.isControllable ? 0x10 : 0x00) | (this.isIK() ? 0x20 : 0x00) | this.localAdditionMode * 0x80);
      io.writeUint8((this.addsRotation() ? 0x01 : 0x00) | (this.addsDisplacement() ? 0x02 : 0x00) | (this.fixesAxis() ? 0x04 : 0x00) | (this.hasLocalAxis() ? 0x08 : 0x00) | (this.deformsAfterPhysics ? 0x10 : 0x00) | (this.deformsUsingExternalParent() ? 0x20 : 0x00));
      if (this.connection instanceof _vector4.default) {
        io.writeFloat32Array(Array.from(this.connection));
      } else {
        io.writeBoneIndex(this.connection);
      }
      if (this.addsRotation()) {
        io.writeBoneIndex(this.additionalRotation.parentIndex);
        io.writeFloat32(this.additionalRotation.rate);
      }
      if (!this.addsRotation() && this.addsDisplacement()) {
        io.writeBoneIndex(this.additionalDisplacement.parentIndex);
        io.writeFloat32(this.additionalDisplacement.rate);
      }
      if (this.fixesAxis()) {
        io.writeFloat32Array(Array.from(this.fixedAxis));
      }
      if (this.hasLocalAxis()) {
        io.writeFloat32Array(Array.from(this.localAxis.x));
        io.writeFloat32Array(Array.from(this.localAxis.z));
      }
      if (this.deformsUsingExternalParent()) {
        io.writeInt32(this.keyValue);
      }
      if (this.isIK()) {
        this.ikInfo.write(io);
      }
    }
  }], [{
    key: "read",
    value: function read(io) {
      var japaneseName = io.readTextBuffer();
      var englishName = io.readTextBuffer();
      var position = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();
      var parentIndex = io.readBoneIndex();
      var deformationOrder = io.readInt32();
      var bitFlags = io.readUint8Array(2);
      var connection = (bitFlags[0] & 0x01) == 0x00 ? new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))() : io.readBoneIndex();
      var isRotatable = (bitFlags[0] & 0x02) == 0x02;
      var isMovable = (bitFlags[0] & 0x04) == 0x04;
      var isVisible = (bitFlags[0] & 0x08) == 0x08;
      var isControllable = (bitFlags[0] & 0x10) == 0x10;
      var isIK = (bitFlags[0] & 0x20) == 0x20;
      var localAdditionMode = (bitFlags[0] & 0x80) / 0x80;
      var addsRotation = (bitFlags[1] & 0x01) == 0x01;
      var addsDisplacement = (bitFlags[1] & 0x02) == 0x02;
      var fixesAxis = (bitFlags[1] & 0x04) == 0x04;
      var hasLocalAxis = (bitFlags[1] & 0x08) == 0x08;
      var deformsAfterPhysics = (bitFlags[1] & 0x10) == 0x10;
      var deformsUsingExternalParent = (bitFlags[1] & 0x20) == 0x20;
      var addition = addsRotation || addsDisplacement ? {
        parentIndex: io.readBoneIndex(),
        rate: io.readFloat32()
      } : null;
      var additionalRotation = addsRotation ? addition : null;
      var additionalDisplacement = addsDisplacement ? addition : null;
      var fixedAxis = fixesAxis ? new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))() : null;
      var localAxis = hasLocalAxis ? {
        x: new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))(),
        z: new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))()
      } : null;
      var keyValue = deformsUsingExternalParent ? io.readInt32() : null;
      var ikInfo = isIK ? this.IKInfo.read(io) : null;
      return new this(japaneseName, englishName, position, parentIndex, deformationOrder, connection, isRotatable, isMovable, isVisible, isControllable, ikInfo, localAdditionMode, additionalRotation, additionalDisplacement, fixedAxis, localAxis, deformsAfterPhysics, keyValue);
    }
  }]);

  return Bone;
}();
PMX.Bone.IKInfo = function () {
  function IKInfo(targetIndex, loopCount, angleLimit, links) {
    _classCallCheck(this, IKInfo);

    this.targetIndex = targetIndex;
    this.loopCount = loopCount;
    this.angleLimit = angleLimit;
    this.links = links;
  }

  _createClass(IKInfo, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.targetIndex, this.loopCount, this.angleLimit, this.links.map(function (link) {
        return link.clone();
      }));
    }
  }, {
    key: "write",
    value: function write(io) {
      io.writeBoneIndex(this.targetIndex);
      io.writeInt32(this.loopCount);
      io.writeFloat32(this.angleLimit);
      io.writeInt32(this.links.length);
      this.links.forEach(function (link) {
        link.write(io);
      });
    }
  }], [{
    key: "read",
    value: function read(io) {
      var _this5 = this;

      var targetIndex = io.readBoneIndex();
      var loopCount = io.readInt32();
      var angleLimit = io.readFloat32();
      var links = new Array(io.readInt32()).fill().map(function () {
        return _this5.Link.read(io);
      });
      return new this(targetIndex, loopCount, angleLimit, links);
    }
  }]);

  return IKInfo;
}();
PMX.Bone.IKInfo.Link = function () {
  function Link(boneIndex, lowerLimit, upperLimit) {
    _classCallCheck(this, Link);

    this.boneIndex = boneIndex;
    this.lowerLimit = lowerLimit;
    this.upperLimit = upperLimit;
  }

  _createClass(Link, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.boneIndex, this.hasLimit() ? this.lowerLimit.clone() : null, this.hasLimit() ? this.upperLimit.clone() : null);
    }
  }, {
    key: "hasLimit",
    value: function hasLimit() {
      return this.lowerLimit !== null && this.upperLimit !== null;
    }
  }, {
    key: "write",
    value: function write(io) {
      io.writeBoneIndex(this.boneIndex);
      io.writeUint8(this.hasLimit() ? 1 : 0);
      if (this.hasLimit()) {
        io.writeFloat32Array(Array.from(this.lowerLimit));
        io.writeFloat32Array(Array.from(this.upperLimit));
      }
    }
  }], [{
    key: "read",
    value: function read(io) {
      var boneIndex = io.readBoneIndex();
      var hasLimit = io.readUint8() === 1;
      var lowerLimit = hasLimit ? new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))() : null;
      var upperLimit = hasLimit ? new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))() : null;
      return new this(boneIndex, lowerLimit, upperLimit);
    }
  }]);

  return Link;
}();
PMX.Morph = function () {
  function Morph(japaneseName, englishName, panel, type, offsets) {
    _classCallCheck(this, Morph);

    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.panel = panel;
    this.type = type;
    this.offsets = offsets;
  }

  _createClass(Morph, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.japaneseName, this.englishName, this.panel, this.type, this.offsets.map(function (offset) {
        return offset.clone();
      }));
    }
  }, {
    key: "write",
    value: function write(io) {
      io.writeTextBuffer(this.japaneseName);
      io.writeTextBuffer(this.englishName);
      io.writeUint8({ reserved: 0, eyebrows: 1, eyes: 2, mouth: 3, others: 4 }[this.panel]);
      io.writeUint8({ group: 0, vertex: 1, bone: 2, uv: 3, extraUV1: 4, extraUV2: 5, extraUV3: 6, extraUV4: 7, material: 8 }[this.type]);
      io.writeInt32(this.offsets.length);
      this.offsets.forEach(function (offset) {
        offset.write(io);
      });
    }
  }], [{
    key: "read",
    value: function read(io) {
      var _this6 = this;

      var japaneseName = io.readTextBuffer();
      var englishName = io.readTextBuffer();
      var panel = ["reserved", "eyebrows", "eyes", "mouth", "others"][io.readUint8()];
      var rawType = io.readUint8();
      var type = ["group", "vertex", "bone", "uv", "extraUV1", "extraUV2", "extraUV3", "extraUV4", "material"][rawType];
      var offsets = new Array(io.readInt32()).fill().map(function () {
        return [_this6.Offset.Group, _this6.Offset.Vertex, _this6.Offset.Bone, _this6.Offset.UV, _this6.Offset.UV, _this6.Offset.UV, _this6.Offset.UV, _this6.Offset.UV, _this6.Offset.Material][rawType].read(io);
      });
      return new this(japaneseName, englishName, panel, type, offsets);
    }
  }]);

  return Morph;
}();
PMX.Morph.Offset = {
  Group: function () {
    function Group(morphIndex, rate) {
      _classCallCheck(this, Group);

      this.morphIndex = morphIndex;
      this.rate = rate;
    }

    _createClass(Group, [{
      key: "clone",
      value: function clone() {
        return new this.constructor(this.morphIndex, this.rate);
      }
    }, {
      key: "write",
      value: function write(io) {
        io.writeMorphIndex(this.morphIndex);
        io.writeFloat32(this.rate);
      }
    }], [{
      key: "read",
      value: function read(io) {
        var morphIndex = io.readMorphIndex();
        var rate = io.readFloat32();
        return new this(morphIndex, rate);
      }
    }]);

    return Group;
  }(),
  Vertex: function () {
    function Vertex(vertexIndex, displacement) {
      _classCallCheck(this, Vertex);

      this.vertexIndex = vertexIndex;
      this.displacement = displacement;
    }

    _createClass(Vertex, [{
      key: "clone",
      value: function clone() {
        return new this.constructor(this.vertexIndex, this.displacement.clone());
      }
    }, {
      key: "write",
      value: function write(io) {
        io.writeVertexIndex(this.vertexIndex);
        io.writeFloat32Array(Array.from(this.displacement));
      }
    }], [{
      key: "read",
      value: function read(io) {
        var vertexIndex = io.readVertexIndex();
        var displacement = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();
        return new this(vertexIndex, displacement);
      }
    }]);

    return Vertex;
  }(),
  Bone: function () {
    function Bone(boneIndex, displacement, rotation) {
      _classCallCheck(this, Bone);

      this.boneIndex = boneIndex;
      this.displacement = displacement;
      this.rotation = rotation;
    }

    _createClass(Bone, [{
      key: "clone",
      value: function clone() {
        return new this.constructor(this.boneIndex, this.displacement.clone(), this.rotation.clone());
      }
    }, {
      key: "write",
      value: function write(io) {
        io.writeBoneIndex(this.boneIndex);
        io.writeFloat32Array(Array.from(this.displacement));
        io.writeFloat32Array(Array.from(this.rotation.toVector()));
      }
    }], [{
      key: "read",
      value: function read(io) {
        var boneIndex = io.readBoneIndex();
        var displacement = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();
        var rotation = new (Function.prototype.bind.apply(_vector6.default, [null].concat(_toConsumableArray(io.readFloat32Array(4)))))().toQuaternion();
        return new this(boneIndex, displacement, rotation);
      }
    }]);

    return Bone;
  }(),
  UV: function () {
    function Vertex(vertexIndex, displacement) {
      _classCallCheck(this, Vertex);

      this.vertexIndex = vertexIndex;
      this.displacement = displacement;
    }

    _createClass(Vertex, [{
      key: "clone",
      value: function clone() {
        return new this.constructor(this.vertexIndex, this.displacement.clone());
      }
    }, {
      key: "write",
      value: function write(io) {
        io.writeVertexIndex(this.vertexIndex);
        io.writeFloat32Array(Array.from(this.displacement));
      }
    }], [{
      key: "read",
      value: function read(io) {
        var vertexIndex = io.readVertexIndex();
        var displacement = new (Function.prototype.bind.apply(_vector6.default, [null].concat(_toConsumableArray(io.readFloat32Array(4)))))();
        return new this(vertexIndex, displacement);
      }
    }]);

    return Vertex;
  }(),
  Material: function () {
    function Material(materialIndex, mode, diffuse, specular, ambient, edge, textureCoefficient, sphereTextureCoefficient, toonTextureCoefficient) {
      _classCallCheck(this, Material);

      this.materialIndex = materialIndex;
      this.mode = mode;
      this.diffuse = diffuse;
      this.specular = specular;
      this.ambient = ambient;
      this.edge = edge;
      this.textureCoefficient = textureCoefficient;
      this.sphereTextureCoefficient = sphereTextureCoefficient;
      this.toonTextureCoefficient = toonTextureCoefficient;
    }

    _createClass(Material, [{
      key: "clone",
      value: function clone() {
        return new this.constructor(this.materialIndex, this.mode, { red: this.diffuse.red, green: this.diffuse.green, blue: this.diffuse.blue, alpha: this.diffuse.alpha }, { red: this.specular.red, green: this.specular.green, blue: this.specular.blue, coefficient: this.specular.coefficient }, { red: this.ambient.red, green: this.ambient.green, blue: this.ambient.blue }, { red: this.edge.red, green: this.edge.green, blue: this.edge.blue, alpha: this.edge.alpha, size: this.edge.size }, { red: this.textureCoefficient.red, green: this.textureCoefficient.green, blue: this.textureCoefficient.blue, alpha: this.textureCoefficient.alpha }, { red: this.sphereTextureCoefficient.red, green: this.sphereTextureCoefficient.green, blue: this.sphereTextureCoefficient.blue, alpha: this.sphereTextureCoefficient.alpha }, { red: this.toonTextureCoefficient.red, green: this.toonTextureCoefficient.green, blue: this.toonTextureCoefficient.blue, alpha: this.toonTextureCoefficient.alpha });
      }
    }, {
      key: "write",
      value: function write(io) {
        io.writeMaterialIndex(this.materialIndex);
        io.writeUint8({ multiply: 0, add: 1 }[this.mode]);
        io.writeFloat32Array([this.diffuse.red, this.diffuse.green, this.diffuse.blue, this.diffuse.alpha]);
        io.writeFloat32Array([this.specular.red, this.specular.green, this.specular.blue, this.specular.coefficient]);
        io.writeFloat32Array([this.ambient.red, this.ambient.green, this.ambient.blue]);
        io.writeFloat32Array([this.edge.red, this.edge.green, this.edge.blue, this.edge.alpha, this.edge.size]);
        io.writeFloat32Array([this.textureCoefficient.red, this.textureCoefficient.green, this.textureCoefficient.blue, this.textureCoefficient.alpha]);
        io.writeFloat32Array([this.sphereTextureCoefficient.red, this.sphereTextureCoefficient.green, this.sphereTextureCoefficient.blue, this.sphereTextureCoefficient.alpha]);
        io.writeFloat32Array([this.toonTextureCoefficient.red, this.toonTextureCoefficient.green, this.toonTextureCoefficient.blue, this.toonTextureCoefficient.alpha]);
      }
    }], [{
      key: "read",
      value: function read(io) {
        var materialIndex = io.readMaterialIndex();
        var mode = ["multiply", "add"][io.readUint8()];
        var diffuse = {
          red: io.readFloat32(),
          green: io.readFloat32(),
          blue: io.readFloat32(),
          alpha: io.readFloat32()
        };
        var specular = {
          red: io.readFloat32(),
          green: io.readFloat32(),
          blue: io.readFloat32(),
          coefficient: io.readFloat32()
        };
        var ambient = {
          red: io.readFloat32(),
          green: io.readFloat32(),
          blue: io.readFloat32()
        };
        var edge = {
          red: io.readFloat32(),
          green: io.readFloat32(),
          blue: io.readFloat32(),
          alpha: io.readFloat32(),
          size: io.readFloat32()
        };
        var textureCoefficient = {
          red: io.readFloat32(),
          green: io.readFloat32(),
          blue: io.readFloat32(),
          alpha: io.readFloat32()
        };
        var sphereTextureCoefficient = {
          red: io.readFloat32(),
          green: io.readFloat32(),
          blue: io.readFloat32(),
          alpha: io.readFloat32()
        };
        var toonTextureCoefficient = {
          red: io.readFloat32(),
          green: io.readFloat32(),
          blue: io.readFloat32(),
          alpha: io.readFloat32()
        };
        return new this(materialIndex, mode, diffuse, specular, ambient, edge, textureCoefficient, sphereTextureCoefficient, toonTextureCoefficient);
      }
    }]);

    return Material;
  }()
};
PMX.DisplayElementGroup = function () {
  function DisplayElementGroup(japaneseName, englishName, isSpecial, elements) {
    _classCallCheck(this, DisplayElementGroup);

    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.isSpecial = isSpecial;
    this.elements = elements;
  }

  _createClass(DisplayElementGroup, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.japaneseName, this.englishName, this.isSpecial, this.elements.map(function (element) {
        return element.clone();
      }));
    }
  }, {
    key: "write",
    value: function write(io) {
      io.writeTextBuffer(this.japaneseName);
      io.writeTextBuffer(this.englishName);
      io.writeUint8(this.isSpecial ? 1 : 0);
      io.writeInt32(this.elements.length);
      this.elements.forEach(function (element) {
        element.write(io);
      });
    }
  }], [{
    key: "read",
    value: function read(io) {
      var _this7 = this;

      var japaneseName = io.readTextBuffer();
      var englishName = io.readTextBuffer();
      var isSpecial = io.readUint8() === 1;
      var elements = new Array(io.readInt32()).fill().map(function () {
        return _this7.DisplayElement.read(io);
      });
      return new this(japaneseName, englishName, isSpecial, elements);
    }
  }]);

  return DisplayElementGroup;
}();
PMX.DisplayElementGroup.DisplayElement = function () {
  function DisplayElement(type, index) {
    _classCallCheck(this, DisplayElement);

    this.type = type;
    this.index = index;
  }

  _createClass(DisplayElement, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.type, this.index);
    }
  }, {
    key: "write",
    value: function write(io) {
      io.writeUint8({ bone: 0, morph: 1 }[this.type]);
      io[{ bone: "writeBoneIndex", morph: "writeMorphIndex" }[this.type]](this.index);
    }
  }], [{
    key: "read",
    value: function read(io) {
      var type = ["bone", "morph"][io.readUint8()];
      var index = io[{ bone: "readBoneIndex", morph: "readMorphIndex" }[type]]();
      return new this(type, index);
    }
  }]);

  return DisplayElement;
}();
PMX.RigidBody = function () {
  function RigidBody(japaneseName, englishName, parentBoneIndex, group, nonCollisionGroupFlag, shape, size, position, rotation, mass, dampingParameterInMoving, dampingParameterInRotating, resilience, friction, physicsMode) {
    _classCallCheck(this, RigidBody);

    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.parentBoneIndex = parentBoneIndex;
    this.group = group;
    this.nonCollisionGroupFlag = nonCollisionGroupFlag;
    this.shape = shape;
    this.size = size;
    this.position = position;
    this.rotation = rotation;
    this.mass = mass;
    this.dampingParameterInMoving = dampingParameterInMoving;
    this.dampingParameterInRotating = dampingParameterInRotating;
    this.resilience = resilience;
    this.friction = friction;
    this.physicsMode = physicsMode;
  }

  _createClass(RigidBody, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.japaneseName, this.englishName, this.parentBoneIndex, this.group, this.nonCollisionGroupFlag, this.shape, this.size.clone(), this.position.clone(), this.rotation.clone(), this.mass, this.dampingParameterInMoving, this.dampingParameterInRotating, this.resilience, this.friction, this.physicsMode);
    }
  }, {
    key: "write",
    value: function write(io) {
      io.writeTextBuffer(this.japaneseName);
      io.writeTextBuffer(this.englishName);
      io.writeBoneIndex(this.parentBoneIndex);
      io.writeUint8(this.group);
      io.writeUint16(this.nonCollisionGroupFlag);
      io.writeUint8({ sphere: 0, cuboid: 1, capsule: 2 }[this.shape]);
      io.writeFloat32Array(this.size.toArray());
      io.writeFloat32Array(this.position.toArray());

      var _rotation$yxzEulerAng = this.rotation.yxzEulerAngles(),
          _rotation$yxzEulerAng2 = _slicedToArray(_rotation$yxzEulerAng, 3),
          yaw = _rotation$yxzEulerAng2[0],
          pitch = _rotation$yxzEulerAng2[1],
          roll = _rotation$yxzEulerAng2[2];

      io.writeFloat32Array([-pitch, yaw, roll]);
      io.writeFloat32(this.mass);
      io.writeFloat32(this.dampingParameterInMoving);
      io.writeFloat32(this.dampingParameterInRotating);
      io.writeFloat32(this.resilience);
      io.writeFloat32(this.friction);
      io.writeUint8({ static: 0, dynamic: 1, dynamicWithBone: 2 }[this.physicsMode]);
    }
  }], [{
    key: "read",
    value: function read(io) {
      var japaneseName = io.readTextBuffer();
      var englishName = io.readTextBuffer();
      var parentBoneIndex = io.readBoneIndex();
      var group = io.readUint8();
      var nonCollisionGroupFlag = io.readUint16();
      var shape = ["sphere", "cuboid", "capsule"][io.readUint8()];
      var size = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();
      var position = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();

      var _io$readFloat32Array = io.readFloat32Array(3),
          _io$readFloat32Array2 = _slicedToArray(_io$readFloat32Array, 3),
          pitch = _io$readFloat32Array2[0],
          yaw = _io$readFloat32Array2[1],
          roll = _io$readFloat32Array2[2];

      var rotation = _quaternion2.default.yxzEuler(yaw, -pitch, roll);
      var mass = io.readFloat32();
      var dampingParameterInMoving = io.readFloat32();
      var dampingParameterInRotating = io.readFloat32();
      var resilience = io.readFloat32();
      var friction = io.readFloat32();
      var physicsMode = ["static", "dynamic", "dynamicWithBone"][io.readUint8()];
      return new this(japaneseName, englishName, parentBoneIndex, group, nonCollisionGroupFlag, shape, size, position, rotation, mass, dampingParameterInMoving, dampingParameterInRotating, resilience, friction, physicsMode);
    }
  }]);

  return RigidBody;
}();
PMX.Joint = function () {
  function Joint(japaneseName, englishName, concreteJoint) {
    _classCallCheck(this, Joint);

    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.concreteJoint = concreteJoint;
  }

  _createClass(Joint, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.japaneseName, this.englishName, this.concreteJoint.clone());
    }
  }, {
    key: "write",
    value: function write(io) {
      io.writeTextBuffer(this.japaneseName);
      io.writeTextBuffer(this.englishName);
      io.writeUint8(new Map([[this.constructor.ConcreteJoint.Spring6DOF, 0]]).get(this.concreteJoint.constructor));
      this.concreteJoint.write(io);
    }
  }], [{
    key: "read",
    value: function read(io) {
      var japaneseName = io.readTextBuffer();
      var englishName = io.readTextBuffer();
      var concreteJoint = [this.ConcreteJoint.Spring6DOF][io.readUint8()].read(io);
      return new this(japaneseName, englishName, concreteJoint);
    }
  }]);

  return Joint;
}();
PMX.Joint.ConcreteJoint = {
  Spring6DOF: function () {
    function Spring6DOF(parentRigidBodyAIndex, parentRigidBodyBIndex, position, rotation, lowerLimitInMoving, upperLimitInMoving, lowerLimitInRotating, upperLimitInRotating, springConstantInMoving, springConstantInRotating) {
      _classCallCheck(this, Spring6DOF);

      this.parentRigidBodyAIndex = parentRigidBodyAIndex;
      this.parentRigidBodyBIndex = parentRigidBodyBIndex;
      this.position = position;
      this.rotation = rotation;
      this.lowerLimitInMoving = lowerLimitInMoving;
      this.upperLimitInMoving = upperLimitInMoving;
      this.lowerLimitInRotating = lowerLimitInRotating;
      this.upperLimitInRotating = upperLimitInRotating;
      this.springConstantInMoving = springConstantInMoving;
      this.springConstantInRotating = springConstantInRotating;
    }

    _createClass(Spring6DOF, [{
      key: "clone",
      value: function clone() {
        return new this.constructor(this.parentRigidBodyAIndex, this.parentRigidBodyBIndex, this.position.clone(), this.rotation.clone(), this.lowerLimitInMoving.clone(), this.upperLimitInMoving.clone(), this.lowerLimitInRotating.clone(), this.upperLimitInRotating.clone(), this.springConstantInMoving.clone(), this.springConstantInRotating.clone());
      }
    }, {
      key: "write",
      value: function write(io) {
        function writeQuaternion(quaternion) {
          var _quaternion$yxzEulerA = quaternion.yxzEulerAngles(),
              _quaternion$yxzEulerA2 = _slicedToArray(_quaternion$yxzEulerA, 3),
              yaw = _quaternion$yxzEulerA2[0],
              pitch = _quaternion$yxzEulerA2[1],
              roll = _quaternion$yxzEulerA2[2];

          io.writeFloat32Array([-pitch, yaw, roll]);
        }
        io.writeRigidBodyIndex(this.parentRigidBodyAIndex);
        io.writeRigidBodyIndex(this.parentRigidBodyBIndex);
        io.writeFloat32Array(this.position.toArray());
        writeQuaternion(this.rotation);
        io.writeFloat32Array(this.lowerLimitInMoving.toArray());
        io.writeFloat32Array(this.upperLimitInMoving.toArray());
        writeQuaternion(this.lowerLimitInRotating);
        writeQuaternion(this.upperLimitInRotating);
        io.writeFloat32Array(this.springConstantInMoving.toArray());
        writeQuaternion(this.springConstantInRotating);
      }
    }], [{
      key: "read",
      value: function read(io) {
        function readQuaternion() {
          var _io$readFloat32Array3 = io.readFloat32Array(3),
              _io$readFloat32Array4 = _slicedToArray(_io$readFloat32Array3, 3),
              pitch = _io$readFloat32Array4[0],
              yaw = _io$readFloat32Array4[1],
              roll = _io$readFloat32Array4[2];

          return _quaternion2.default.yxzEuler(yaw, -pitch, roll);
        }
        var parentRigidBodyAIndex = io.readRigidBodyIndex();
        var parentRigidBodyBIndex = io.readRigidBodyIndex();
        var position = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();
        var rotation = readQuaternion();
        var lowerLimitInMoving = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();
        var upperLimitInMoving = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();
        var lowerLimitInRotating = readQuaternion();
        var upperLimitInRotating = readQuaternion();
        var springConstantInMoving = new (Function.prototype.bind.apply(_vector4.default, [null].concat(_toConsumableArray(io.readFloat32Array(3)))))();
        var springConstantInRotating = readQuaternion();
        return new this(parentRigidBodyAIndex, parentRigidBodyBIndex, position, rotation, lowerLimitInMoving, upperLimitInMoving, lowerLimitInRotating, upperLimitInRotating, springConstantInMoving, springConstantInRotating);
      }
    }]);

    return Spring6DOF;
  }()
};

},{"./lodash-extension":7,"./quaternion":15,"./sequential-access-binary":17,"./vector2":22,"./vector3":23,"./vector4":24}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Triangle2D = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vector = require("./vector2");

var _vector2 = _interopRequireDefault(_vector);

var _directedLineSegment2d = require("./directed-line-segment-2d");

var _directedLineSegment2d2 = _interopRequireDefault(_directedLineSegment2d);

var _line2d = require("./line-2d");

var _line2d2 = _interopRequireDefault(_line2d);

var _rectangle = require("./rectangle");

var _rectangle2 = _interopRequireDefault(_rectangle);

var _myMath = require("./my-math");

var _myMath2 = _interopRequireDefault(_myMath);

var _matrix = require("./matrix");

var _matrix2 = _interopRequireDefault(_matrix);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Polygon = function () {
  function Polygon() {
    _classCallCheck(this, Polygon);

    for (var _len = arguments.length, points = Array(_len), _key = 0; _key < _len; _key++) {
      points[_key] = arguments[_key];
    }

    // 起点と終点は同一要素にしなくてよい
    if (points.length < 3) throw new Error("Polygon must have three or more vertices.");
    if (!points.every(function (point) {
      return point instanceof _vector2.default;
    })) throw new Error("points must be Vector2 array.");
    this.points = points;
    var left = points.reduce(function (min, point) {
      return Math.min(min, point.x);
    }, Number.POSITIVE_INFINITY);
    var right = points.reduce(function (max, point) {
      return Math.max(max, point.x);
    }, Number.NEGATIVE_INFINITY);
    var top = points.reduce(function (max, point) {
      return Math.max(max, point.y);
    }, Number.NEGATIVE_INFINITY);
    var bottom = points.reduce(function (min, point) {
      return Math.min(min, point.y);
    }, Number.POSITIVE_INFINITY);
    this._outline = new _rectangle2.default(left, top, right - left, top - bottom);
  }

  _createClass(Polygon, [{
    key: "clone",
    value: function clone() {
      return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(this.points.map(function (point) {
        return point.clone();
      })))))();
    }
  }, {
    key: "reverse",
    value: function reverse() {
      return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(this.points.slice().reverse()))))();
    }
  }, {
    key: "lineSegments",
    value: function lineSegments() {
      var _this = this;

      return new Array(this.points.length).fill().map(function (_, i) {
        return new _directedLineSegment2d2.default(_this.points[i], _this.points[(i + 1) % _this.points.length]);
      });
    }
  }, {
    key: "isClockwise",
    value: function isClockwise() {
      return this.lineSegments().reduce(function (sum, lineSegment) {
        return sum + (lineSegment.p2.x - lineSegment.p1.x) * (lineSegment.p2.y + lineSegment.p1.y);
      }, 0) > 0;
    }
  }, {
    key: "centerOfGravity",
    value: function centerOfGravity() {
      var triangles = this.triangulate();
      var areas = triangles.map(function (triangle) {
        return triangle.area();
      });
      var centersOfGravity = triangles.map(function (triangle) {
        return triangle.centerOfGravity();
      });
      return new Array(triangles.length).fill().map(function (_, i) {
        return centersOfGravity[i].multiply(areas[i]);
      }).reduce(function (sum, v) {
        return sum.add(v);
      }, _vector2.default.zero).divide(areas.reduce(_.add, 0));
    }
  }, {
    key: "area",
    value: function area() {
      return this.triangulate().map(function (triangle) {
        return triangle.area();
      }).reduce(_.add, 0);
    }
  }, {
    key: "_contains",
    value: function _contains(p) {
      var cn = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.lineSegments()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var lineSegment = _step.value;

          if (lineSegment.p1.y <= p.y && p.y < lineSegment.p2.y || lineSegment.p2.y <= p.y && p.y < lineSegment.p1.y) {
            var t = (p.y - lineSegment.p1.y) / (lineSegment.p2.y - lineSegment.p1.y);
            if (p.x < _myMath2.default.lerp(lineSegment.p1.x, lineSegment.p2.x, t)) {
              ++cn;
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return cn % 2 === 1;
    }
  }, {
    key: "containsProperly",
    value: function containsProperly(p) {
      return this._outline.containsProperly(p) && this._contains(p) && !this.lineSegments().some(function (lineSegment) {
        return lineSegment.contains(p);
      });
    }
  }, {
    key: "contains",
    value: function contains(p) {
      return this._outline.contains(p) && (this._contains(p) || this.lineSegments().some(function (lineSegment) {
        return lineSegment.contains(p);
      }));
    }
  }, {
    key: "equals",
    value: function equals(other) {
      var _this2 = this;

      if (this === other) return true;
      var otherPoints = other.points.slice();
      if (this.points.length !== otherPoints.length) return false;
      {
        var i = void 0;
        for (i = 0; i < otherPoints.length && !otherPoints[0].equals(this.points[0]); ++i) {
          otherPoints.unshift(otherPoints.pop());
        }
        if (i === otherPoints.length) return false;
      }
      return new Array(otherPoints.length).fill().every(function (_, i) {
        return _this2.points[i].equals(otherPoints[i]);
      });
    }
  }, {
    key: "_createSkeleton",
    value: function _createSkeleton(other) {
      var _this3 = this;

      var thisVertices = this.points.map(function (point) {
        return {
          point: point,
          isOutside: !other.contains(point),
          cross: null,
          isInserted: false,
          isProcessed: false
        };
      });
      if (thisVertices.every(function (point) {
        return !point.isOutside;
      })) return [];
      var otherVertices = other.points.map(function (point) {
        return {
          point: point,
          isOutside: !_this3.contains(point),
          cross: null,
          isInserted: false,
          isProcessed: false
        };
      });
      for (var i = 0; i < thisVertices.length; ++i) {
        for (var j = 0; j < otherVertices.length; ++j) {
          var thisLineSegment = new _directedLineSegment2d2.default(thisVertices[i].point, thisVertices[(i + 1) % thisVertices.length].point);
          var otherLineSegment = new _directedLineSegment2d2.default(otherVertices[j].point, otherVertices[(j + 1) % otherVertices.length].point);
          var intersections = thisLineSegment.intersection(otherLineSegment);
          if (intersections.length === 0) continue;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = (intersections[0] instanceof _directedLineSegment2d2.default ? [intersections[0].p1, intersections[0].p2] : [intersections[0]])[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var crossPoint = _step2.value;

              var thisVertex = {
                point: crossPoint,
                isOutside: false,
                isInserted: false,
                isProcessed: false
              };
              var otherVertex = {
                point: crossPoint,
                isOutside: false,
                isInserted: false,
                isProcessed: false
              };
              thisVertex.cross = otherVertex;
              otherVertex.cross = thisVertex;
              if (crossPoint.equals(thisLineSegment.p1)) {
                if (thisVertices[i].cross === null) thisVertices.splice(i, 1, thisVertex);
              } else if (crossPoint.equals(thisLineSegment.p2)) {
                if (thisVertices[(i + 1) % thisVertices.length].cross === null) thisVertices.splice((i + 1) % thisVertices.length, 1, thisVertex);
              } else {
                thisVertices.splice(i + 1, 0, thisVertex);
              }
              if (crossPoint.equals(otherLineSegment.p1)) {
                if (otherVertices[j].cross === null) otherVertices.splice(j, 1, otherVertex);
              } else if (crossPoint.equals(otherLineSegment.p2)) {
                if (otherVertices[(j + 1) % otherVertices.length].cross === null) otherVertices.splice((j + 1) % otherVertices.length, 1, otherVertex);
              } else {
                otherVertices.splice(j + 1, 0, otherVertex);
                ++j;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }
      for (var _i = 0; _i < thisVertices.length; ++_i) {
        if (thisVertices[_i].cross === null || thisVertices[(_i + 1) % thisVertices.length].cross === null) continue;
        var insertedPoint = thisVertices[_i].point.add(thisVertices[(_i + 1) % thisVertices.length].point).divide(2);
        if (other.contains(insertedPoint)) continue;
        thisVertices.splice(_i + 1, 0, {
          point: insertedPoint,
          isOutside: true,
          cross: null,
          isInserted: true,
          isProcessed: false
        });
        ++_i;
      }
      for (var _i2 = 0; _i2 < otherVertices.length; ++_i2) {
        if (otherVertices[_i2].cross === null || otherVertices[(_i2 + 1) % otherVertices.length].cross === null) continue;
        var _insertedPoint = otherVertices[_i2].point.add(otherVertices[(_i2 + 1) % otherVertices.length].point).divide(2);
        if (this.contains(_insertedPoint)) continue;
        otherVertices.splice(_i2 + 1, 0, {
          point: _insertedPoint,
          isOutside: true,
          cross: null,
          isInserted: true,
          isProcessed: false
        });
        ++_i2;
      }
      for (var _i3 = 0; _i3 < thisVertices.length; ++_i3) {
        thisVertices[_i3].index = _i3;
      }for (var _i4 = 0; _i4 < otherVertices.length; ++_i4) {
        otherVertices[_i4].index = _i4;
      }function opposite(currentVertices) {
        return currentVertices === thisVertices ? otherVertices : thisVertices;
      }
      function next(currentVertices, currentVertex) {
        return currentVertices[(currentVertex.index + 1) % currentVertices.length];
      }

      return { thisVertices: thisVertices, otherVertices: otherVertices, opposite: opposite, next: next };
    }
  }, {
    key: "union",
    value: function union(other) {
      // 時計回りでない場合、時計回りに矯正される
      if (!this.isClockwise()) {
        return this.reverse().union(other);
      }
      if (!other.isClockwise()) {
        return this.union(other.reverse());
      }

      if (!this._outline.intersects(other._outline)) {
        return [this, other];
      }
      if (this.equals(other)) {
        return [this];
      }

      var _createSkeleton2 = this._createSkeleton(other),
          thisVertices = _createSkeleton2.thisVertices,
          otherVertices = _createSkeleton2.otherVertices,
          opposite = _createSkeleton2.opposite,
          next = _createSkeleton2.next;

      if (thisVertices.every(function (thisVertex) {
        return thisVertex.cross === null;
      })) {
        if (!thisVertices[0].isOutside) return [other];
        if (!otherVertices[0].isOutside) return [this];
        return [this, other];
      }

      var start = _(thisVertices.map(function (thisVertex) {
        return { vertices: thisVertices, vertex: thisVertex };
      }).concat(otherVertices.map(function (otherVertex) {
        return { vertices: otherVertices, vertex: otherVertex };
      })).filter(function (_ref) {
        var vertices = _ref.vertices,
            vertex = _ref.vertex;
        return vertex.isOutside;
      })).minBy(function (_ref2) {
        var vertices = _ref2.vertices,
            vertex = _ref2.vertex;
        return vertex.index;
      });
      var outputVertices = [start.vertex];
      var currentVertex = start.vertex;
      var currentVertices = start.vertices;
      while (true) {
        currentVertex = next(currentVertices, currentVertex);
        currentVertex.isProcessed = true;
        if (currentVertex === start.vertex) break;
        outputVertices.push(currentVertex);
        if (currentVertex.cross !== null && next(opposite(currentVertices), currentVertex.cross).isOutside) {
          currentVertex = currentVertex.cross;
          currentVertices = opposite(currentVertices);
        }
      }
      return [new (Function.prototype.bind.apply(Polygon, [null].concat(_toConsumableArray(outputVertices.filter(function (vertex) {
        return !vertex.isInserted;
      }).map(function (vertex) {
        return vertex.point;
      })))))()];
    }
  }, {
    key: "intersection",
    value: function intersection(other) {
      // 時計回りでない場合、時計回りに矯正される
      if (other instanceof Polygon) {
        if (!this.isClockwise()) {
          return this.reverse().intersection(other);
        }
        if (!other.isClockwise()) {
          return this.intersection(other.reverse());
        }

        // TODO: Polygon同士が接する場合、共通部分が算出されない
        return this.subtract(other).reduce(function (results, polygon) {
          return _(results).flatMap(function (result) {
            return result.subtract(polygon);
          }).value();
        }, [this]);
      } else {
        throw new Error("Unknown type");
      }
    }
  }, {
    key: "subtract",
    value: function subtract(other) {
      var _this4 = this;

      // 時計回りでない場合、時計回りに矯正される
      if (!this.isClockwise()) {
        return this.reverse().subtract(other);
      }
      if (!other.isClockwise()) {
        return this.subtract(other.reverse());
      }

      {
        var intersections = this._outline.intersection(other._outline);
        if (intersections.length === 0 || !(intersections[0] instanceof _rectangle2.default)) return [this];
      }

      var _createSkeleton3 = this._createSkeleton(other.reverse()),
          thisVertices = _createSkeleton3.thisVertices,
          otherVertices = _createSkeleton3.otherVertices,
          opposite = _createSkeleton3.opposite,
          next = _createSkeleton3.next;

      if (thisVertices.every(function (thisVertex) {
        return thisVertex.cross === null;
      })) {
        if (!thisVertices[0].isOutside) return [];
        if (!otherVertices[0].isOutside) {
          // otherがthisの内側に完全に入っている場合（接している場合は含まない）
          var _$map$sortBy$find = _(_myMath2.default.cartesianProduct(_.range(0, this.points.length), _.range(0, other.points.length))).map(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
                i = _ref4[0],
                j = _ref4[1];

            return [i, j, new _directedLineSegment2d2.default(_this4.points[i], other.points[j])];
          }).sortBy(function (_ref5) {
            var _ref6 = _slicedToArray(_ref5, 3),
                i = _ref6[0],
                j = _ref6[1],
                lineSegment = _ref6[2];

            return lineSegment.squaredLength();
          }).find(function (_ref7) {
            var _ref8 = _slicedToArray(_ref7, 3),
                i = _ref8[0],
                j = _ref8[1],
                lineSegment = _ref8[2];

            return _this4.lineSegments().concat(other.lineSegments()).every(function (frame) {
              var crossPoint = frame.crossPoint(lineSegment);
              return crossPoint === null || crossPoint.equals(lineSegment.p1) || crossPoint.equals(lineSegment.p2);
            });
          }),
              _$map$sortBy$find2 = _slicedToArray(_$map$sortBy$find, 3),
              bridgeI = _$map$sortBy$find2[0],
              bridgeJ = _$map$sortBy$find2[1],
              bridge = _$map$sortBy$find2[2];

          var thisPoints = this.points.slice();
          var otherPoints = other.points.slice();
          while (otherPoints[0] !== bridge.p2) {
            otherPoints.unshift(otherPoints.pop());
          }
          thisPoints.splice.apply(thisPoints, [bridgeI + 1, 0].concat(_toConsumableArray(otherPoints.concat([otherPoints[0]]).reverse()), [thisPoints[bridgeI]]));
          return [new (Function.prototype.bind.apply(Polygon, [null].concat(_toConsumableArray(thisPoints))))()];
        }
        return [this];
      }

      var polygons = [];
      while (true) {
        var startVertex = _(thisVertices.filter(function (vertex) {
          return !vertex.isProcessed && vertex.isOutside;
        })).minBy(function (vertex) {
          return vertex.index;
        });
        if (typeof startVertex === "undefined") break;
        var outputVertices = [startVertex];
        startVertex.isProcessed = true;
        var currentVertex = startVertex;
        var currentVertices = thisVertices;
        while (true) {
          currentVertex = next(currentVertices, currentVertex);
          currentVertex.isProcessed = true;
          if (currentVertex === startVertex) break;
          outputVertices.push(currentVertex);
          if (currentVertex.cross !== null && (currentVertices === thisVertices && !next(opposite(currentVertices), currentVertex.cross).isOutside || currentVertices === otherVertices && next(opposite(currentVertices), currentVertex.cross).isOutside) && next(opposite(currentVertices), currentVertex.cross).cross !== next(currentVertices, currentVertex)) {
            currentVertex = currentVertex.cross;
            currentVertex.isProcessed = true;
            currentVertices = opposite(currentVertices);
          }
        }
        polygons.push(new (Function.prototype.bind.apply(Polygon, [null].concat(_toConsumableArray(outputVertices.filter(function (vertex) {
          return !vertex.isInserted;
        }).map(function (vertex) {
          return vertex.point;
        })))))());
      }

      return polygons;
    }
  }, {
    key: "triangulate",
    value: function triangulate() {
      function outer(p1, p2) {
        return p1.x * p2.y - p1.y * p2.x;
      }
      var triangles = [];
      var points = Array.from(this.points);

      var _loop = function _loop() {
        var targetID = _(points.map(function (point, i) {
          return [point, i];
        })).maxBy(function (_ref9) {
          var _ref10 = _slicedToArray(_ref9, 2),
              point = _ref10[0],
              i = _ref10[1];

          return point.squaredNorm();
        })[1];
        var previousID = targetID - 1 < 0 ? points.length - 1 : targetID - 1;
        var nextID = (targetID + 1) % points.length;
        var outerProduct2 = outer(points[targetID].subtract(points[previousID]), points[nextID].subtract(points[targetID]));

        var _loop2 = function _loop2() {
          var outerProduct = outer(points[targetID].subtract(points[previousID]), points[nextID].subtract(points[targetID]));
          if (points.every(function (point, i) {
            return i === previousID || i === targetID || i === nextID || outer(points[targetID].subtract(points[previousID]), point.subtract(points[previousID])) * outerProduct <= 0 || outer(points[nextID].subtract(points[targetID]), point.subtract(points[targetID])) * outerProduct <= 0 || outer(points[previousID].subtract(points[nextID]), point.subtract(points[nextID])) * outerProduct <= 0;
          })) {
            triangles.push(new Triangle2D(points[previousID], points[targetID], points[nextID]));
            points.splice(targetID, 1);
            return "break";
          } else {
            do {
              previousID = targetID;
              targetID = nextID;
              nextID = (nextID + 1) % points.length;
            } while (outer(points[targetID].subtract(points[previousID]), points[nextID].subtract(points[targetID])) * outerProduct2 < 0);
          }
        };

        while (true) {
          var _ret2 = _loop2();

          if (_ret2 === "break") break;
        }
      };

      while (points.length > 3) {
        _loop();
      }
      triangles.push(new Triangle2D(points[0], points[1], points[2]));
      return triangles;
    }
  }]);

  return Polygon;
}();

exports.default = Polygon;

var Triangle2D = exports.Triangle2D = function (_Polygon) {
  _inherits(Triangle2D, _Polygon);

  function Triangle2D() {
    var _ref11;

    _classCallCheck(this, Triangle2D);

    for (var _len2 = arguments.length, points = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      points[_key2] = arguments[_key2];
    }

    if (points.length !== 3 || points[0].equals(points[1]) || points[1].equals(points[2]) || points[2].equals(points[0])) throw new Error("Triangle must have three different vertices.");
    return _possibleConstructorReturn(this, (_ref11 = Triangle2D.__proto__ || Object.getPrototypeOf(Triangle2D)).call.apply(_ref11, [this].concat(points)));
  }

  _createClass(Triangle2D, [{
    key: "blendRates",
    value: function blendRates(p) {
      var uv = _matrix2.default.fromColumnVectors(this.points[1].subtract(this.points[0]), this.points[2].subtract(this.points[0])).inverse().multiply(p.subtract(this.points[0]));
      return [1 - uv.x - uv.y, uv.x, uv.y];
    }
  }, {
    key: "centerOfGravity",
    value: function centerOfGravity() {
      return this.points[0].add(this.points[1]).add(this.points[2]).divide(3);
    }
  }, {
    key: "area",
    value: function area() {
      var a = this.points[1].subtract(this.points[0]).norm();
      var b = this.points[2].subtract(this.points[1]).norm();
      var c = this.points[0].subtract(this.points[2]).norm();
      var s = (a + b + c) / 2;
      return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    }
  }, {
    key: "intersection",
    value: function intersection(other) {
      var _this6 = this;

      if (other instanceof _directedLineSegment2d2.default) {
        var contains = function contains(p) {
          var ab = _this6.points[1].subtract(_this6.points[0]);
          var ap = p.subtract(_this6.points[0]);
          var bc = _this6.points[2].subtract(_this6.points[1]);
          var bp = p.subtract(_this6.points[1]);
          var ca = _this6.points[0].subtract(_this6.points[2]);
          var cp = p.subtract(_this6.points[2]);
          var crossProduct1 = ab.x * ap.y - ab.y * ap.x;
          var crossProduct2 = bc.x * bp.y - bc.y * bp.x;
          var crossProduct3 = ca.x * cp.y - ca.y * cp.x;
          if (crossProduct1 > 0 || crossProduct2 > 0 || crossProduct3 > 0) return "not contain";
          if (crossProduct1 < 0 && crossProduct2 < 0 && crossProduct3 < 0) return "contain";
          return "on boundary";
        };
        var p1State = contains(other.p1);
        var p2State = contains(other.p2);
        switch (p1State + ", " + p2State) {
          case "contain, contain":
          case "contain, on boundary":
          case "on boundary, contain":
          case "on boundary, on boundary":
            return [other];
          case "on boundary, not contain":
            return [other.p1];
          case "not contain, on boundary":
            return [other.p2];
          case "contain, not contain":
            return [new _directedLineSegment2d2.default(other.p1, this.lineSegments().map(function (lineSegment) {
              return lineSegment.crossPoint(other);
            }).find(function (crossPoint) {
              return crossPoint !== null;
            }))];
          case "not contain, contain":
            return [new _directedLineSegment2d2.default(this.lineSegments().map(function (lineSegment) {
              return lineSegment.crossPoint(other);
            }).find(function (crossPoint) {
              return crossPoint !== null;
            }), other.p2)];
          case "not contain, not contain":
            var crossPoints = Array.from(new Set(this.lineSegments().map(function (lineSegment) {
              return lineSegment.crossPoint(other);
            }).filter(function (crossPoint) {
              return crossPoint !== null;
            }).map(function (crossPoint) {
              return Array.from(crossPoint).join(",");
            }))).map(function (string) {
              return string.split(",");
            }).map(function (_ref12) {
              var _ref13 = _slicedToArray(_ref12, 2),
                  x = _ref13[0],
                  y = _ref13[1];

              return new _vector2.default(Number(x), Number(y));
            });
            switch (crossPoints.length) {
              case 2:
                if (other.toVector().innerProduct(crossPoints[1].subtract(crossPoints[0])) > 0) {
                  return [new _directedLineSegment2d2.default(crossPoints[0], crossPoints[1])];
                } else {
                  return [new _directedLineSegment2d2.default(crossPoints[1], crossPoints[0])];
                }
              case 1:
                return [crossPoints[0]];
              case 0:
                return [];
            }
        }
      } else if (other instanceof _line2d2.default) {
        var intersections = this.lineSegments().map(function (lineSegment) {
          return lineSegment.intersection(other);
        }).map(function (intersection) {
          return intersection.length === 0 ? null : intersection[0];
        });
        var lineSegmentIntersection = intersections.find(function (intersection) {
          return intersection instanceof _directedLineSegment2d2.default;
        });
        if (typeof lineSegmentIntersection !== "undefined") return [lineSegmentIntersection];
        var pointIntersections = intersections.filter(function (intersection) {
          return intersection instanceof _vector2.default;
        });
        switch (pointIntersections.length) {
          case 3:
            if (pointIntersections[0].equals(pointIntersections[1])) return [new _directedLineSegment2d2.default(pointIntersections[0], pointIntersections[2])];
            if (pointIntersections[1].equals(pointIntersections[2])) return [new _directedLineSegment2d2.default(pointIntersections[1], pointIntersections[0])];
            if (pointIntersections[2].equals(pointIntersections[0])) return [new _directedLineSegment2d2.default(pointIntersections[2], pointIntersections[1])];
            throw new Error("Invalid condition");
          case 2:
            if (pointIntersections[0].equals(pointIntersections[1])) return [pointIntersections[0]];else return [new _directedLineSegment2d2.default(pointIntersections[0], pointIntersections[1])];
          case 1:
            throw new Error("Invalid condition");
          case 0:
            return [];
        }
      } else {
        _get(Triangle2D.prototype.__proto__ || Object.getPrototypeOf(Triangle2D.prototype), "intersection", this).call(this, other);
      }
    }
  }]);

  return Triangle2D;
}(Polygon);

},{"./directed-line-segment-2d":3,"./line-2d":5,"./matrix":8,"./my-math":9,"./rectangle":16,"./vector2":22}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vector = require("./vector3");

var _vector2 = _interopRequireDefault(_vector);

var _vector3 = require("./vector4");

var _vector4 = _interopRequireDefault(_vector3);

var _myMath = require("./my-math");

var _myMath2 = _interopRequireDefault(_myMath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Quaternion = function () {
  function Quaternion(w, x, y, z) {
    _classCallCheck(this, Quaternion);

    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  _createClass(Quaternion, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.w, this.x, this.y, this.z);
    }
  }, {
    key: "multiply",
    value: function multiply(other) {
      return new (Function.prototype.bind.apply(this.constructor, [null].concat([this.real() * other.real() - this.imaginary().innerProduct(other.imaginary())], _toConsumableArray(other.imaginary().multiply(this.real()).add(this.imaginary().multiply(other.real())).add(this.imaginary().crossProduct(other.imaginary()))))))();
    }
  }, {
    key: "rotate",
    value: function rotate(other) {
      return this.multiply(new (Function.prototype.bind.apply(this.constructor, [null].concat([0], _toConsumableArray(other))))()).multiply(this.conjugate()).imaginary();
    }
  }, {
    key: "power",
    value: function power(t) {
      return new (Function.prototype.bind.apply(this.constructor, [null].concat([Math.cos(t * this.angle() / 2)], _toConsumableArray(this.axis().multiply(Math.sin(t * this.angle() / 2))))))();
    }
  }, {
    key: "add",
    value: function add(other) {
      return new (Function.prototype.bind.apply(this.constructor, [null].concat([this.real() + other.real()], _toConsumableArray(this.imaginary().add(other.imaginary())))))();
    }
  }, {
    key: "subtract",
    value: function subtract(other) {
      return new (Function.prototype.bind.apply(this.constructor, [null].concat([this.real() - other.real()], _toConsumableArray(this.imaginary().subtract(other.imaginary())))))();
    }
  }, {
    key: "negate",
    value: function negate() {
      return new (Function.prototype.bind.apply(this.constructor, [null].concat([-this.real()], _toConsumableArray(this.imaginary().negate()))))();
    }
  }, {
    key: "divide",
    value: function divide(other) {
      return this.multiply(other.inverse());
    }
  }, {
    key: "equals",
    value: function equals(other) {
      return this === other || this.real() === other.real() && this.imaginary().equals(other.imaginary());
    }
  }, {
    key: "abs",
    value: function abs() {
      return this.toVector().norm();
    }
  }, {
    key: "abs2",
    value: function abs2() {
      return this.toVector().squaredNorm();
    }
  }, {
    key: "angle",
    value: function angle() {
      return Math.acos(_myMath2.default.clamp(this.real(), -1, 1)) * 2;
    }
  }, {
    key: "axis",
    value: function axis() {
      return Math.abs(this.real()) >= 1 ? new _vector2.default(1, 0, 0) : this.imaginary().normalize();
    }
  }, {
    key: "conjugate",
    value: function conjugate() {
      return new (Function.prototype.bind.apply(this.constructor, [null].concat([this.real()], _toConsumableArray(this.imaginary().negate()))))();
    }
  }, {
    key: "imaginary",
    value: function imaginary() {
      return new _vector2.default(this.x, this.y, this.z);
    }
  }, {
    key: "inverse",
    value: function inverse() {
      var conj = this.conjugate();
      var abs2 = this.abs2();
      return new this.constructor(conj.w / abs2, conj.x / abs2, conj.y / abs2, conj.z / abs2);
    }
  }, {
    key: "real",
    value: function real() {
      return this.w;
    }
  }, {
    key: "toString",
    value: function toString() {
      return "" + this.w + (this.x < 0 ? "-" : "+") + Math.abs(this.x) + "i" + (this.y < 0 ? "-" : "+") + Math.abs(this.y) + "j" + (this.z < 0 ? "-" : "+") + Math.abs(this.z) + "k";
    }
  }, {
    key: "toVector",
    value: function toVector() {
      return new _vector4.default(this.x, this.y, this.z, this.w);
    }
  }, {
    key: "yxzEulerAngles",
    value: function yxzEulerAngles() {
      var cosPitchSinYaw = 2 * (this.w * this.y + this.x * this.z);
      var cosPitchCosYaw = 1 - 2 * (this.x * this.x + this.y * this.y);
      var sinPitch = 2 * (this.w * this.x - this.y * this.z);
      var cosPitchSinRoll = 2 * (this.w * this.z + this.x * this.y);
      var cosPitchCosRoll = 1 - 2 * (this.x * this.x + this.z * this.z);
      if (sinPitch > 0.9999) {
        return [2 * Math.atan2(this.y, this.w), Math.PI / 2, 0];
      } else if (sinPitch < -0.9999) {
        return [2 * Math.atan2(this.y, this.w), -Math.PI / 2, 0];
      } else {
        return [Math.atan2(cosPitchSinYaw, cosPitchCosYaw), Math.asin(_myMath2.default.clamp(sinPitch, -1, 1)), Math.atan2(cosPitchSinRoll, cosPitchCosRoll)];
      }
    }
  }], [{
    key: "angleAxis",
    value: function angleAxis(angle, axis) {
      return new (Function.prototype.bind.apply(this, [null].concat([Math.cos(angle / 2)], _toConsumableArray(axis.normalize().multiply(Math.sin(angle / 2))))))();
    }
  }, {
    key: "fromToRotation",
    value: function fromToRotation(fromDirection, toDirection) {
      fromDirection = fromDirection.normalize();
      toDirection = toDirection.normalize();
      if (fromDirection.innerProduct(toDirection) < -0.9999) {
        // 正反対
        return this.angleAxis(Math.PI, fromDirection.x !== 0 || fromDirection.y !== 0 ? new _vector2.default(-fromDirection.y, fromDirection.x, 0) : new _vector2.default(-fromDirection.z, 0, 0));
      }
      var bisect = fromDirection.add(toDirection).normalize();
      return new (Function.prototype.bind.apply(this, [null].concat([fromDirection.innerProduct(bisect)], _toConsumableArray(fromDirection.crossProduct(bisect)))))();
    }
  }, {
    key: "lookRotation",
    value: function lookRotation(forward) {
      var upwards = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new _vector2.default(0, 1, 0);

      forward = forward.normalize();
      upwards = upwards.normalize();
      var q1 = this.fromToRotation(new _vector2.default(0, 0, 1), forward);
      var side = upwards.crossProduct(forward);
      var q2 = this.fromToRotation(q1.rotate(new _vector2.default(0, 1, 0)), side.norm() < 0.0001 ? new _vector2.default(0, 0, -1) : forward.crossProduct(side.normalize()));
      return q2.multiply(q1);
    }
  }, {
    key: "random",
    value: function random() {
      var u1 = Math.random();
      var u2 = Math.random();
      var u3 = Math.random();
      return new this(Math.sqrt(1 - u1) * Math.sin(2 * Math.PI * u2), Math.sqrt(1 - u1) * Math.cos(2 * Math.PI * u2), Math.sqrt(u1) * Math.sin(2 * Math.PI * u3), Math.sqrt(u1) * Math.cos(2 * Math.PI * u3));
    }
  }, {
    key: "slerp",
    value: function slerp(q0, q1, t) {
      return q0.multiply(q0.power(-1).multiply(q1).power(t));
    }
  }, {
    key: "yxzEuler",
    value: function yxzEuler(yaw, pitch, roll) {
      return this.angleAxis(yaw, new _vector2.default(0, 1, 0)).multiply(this.angleAxis(pitch, new _vector2.default(1, 0, 0))).multiply(this.angleAxis(roll, new _vector2.default(0, 0, 1)));
    }
  }]);

  return Quaternion;
}();

exports.default = Quaternion;

Quaternion.identity = new Quaternion(1, 0, 0, 0);
Quaternion.I = new Quaternion(0, 1, 0, 0);
Quaternion.J = new Quaternion(0, 0, 1, 0);
Quaternion.K = new Quaternion(0, 0, 0, 1);

},{"./my-math":9,"./vector3":23,"./vector4":24}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vector = require("./vector2");

var _vector2 = _interopRequireDefault(_vector);

var _directedLineSegment2d = require("./directed-line-segment-2d");

var _directedLineSegment2d2 = _interopRequireDefault(_directedLineSegment2d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rectangle = function () {
  function Rectangle(x, y, width, height) {
    _classCallCheck(this, Rectangle);

    // x, y は左上の点の座標
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  _createClass(Rectangle, [{
    key: "clone",
    value: function clone() {
      return new this.constructor(this.x, this.y, this.width, this.height);
    }
  }, {
    key: "left",
    value: function left() {
      return this.x;
    }
  }, {
    key: "right",
    value: function right() {
      return this.x + this.width;
    }
  }, {
    key: "top",
    value: function top() {
      return this.y;
    }
  }, {
    key: "bottom",
    value: function bottom() {
      return this.y - this.height;
    }
  }, {
    key: "containsProperly",
    value: function containsProperly(p) {
      return this.left() < p.x && p.x < this.right() && this.bottom() < p.y && p.y < this.top();
    }
  }, {
    key: "contains",
    value: function contains(p) {
      return this.left() <= p.x && p.x <= this.right() && this.bottom() <= p.y && p.y <= this.top();
    }
  }, {
    key: "intersects",
    value: function intersects(other) {
      return this.intersection(other).length > 0;
    }
  }, {
    key: "intersection",
    value: function intersection(other) {
      var left = Math.max(this.left(), other.left());
      var right = Math.min(this.right(), other.right());
      var top = Math.min(this.top(), other.top());
      var bottom = Math.max(this.bottom(), other.bottom());
      if (right < left || top < bottom) return [];
      if (left === right && bottom === top) return [new _vector2.default(left, top)];
      if (left < right && bottom === top) return [new _directedLineSegment2d2.default(new _vector2.default(left, top), new _vector2.default(right, top))];
      if (left === right && bottom < top) return [new _directedLineSegment2d2.default(new _vector2.default(left, top), new _vector2.default(left, bottom))];
      return [new this.constructor(left, top, right - left, top - bottom)];
    }
  }, {
    key: "equals",
    value: function equals(other) {
      return this === other || this.x === other.x && this.y === other.y && this.width === other.width && this.height === other.height;
    }
  }]);

  return Rectangle;
}();

exports.default = Rectangle;

},{"./directed-line-segment-2d":3,"./vector2":22}],17:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _myMath = require("./my-math");

var _myMath2 = _interopRequireDefault(_myMath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SequentialAccessBinary = function () {
  function SequentialAccessBinary() {
    var uint8Array = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : void 0;

    _classCallCheck(this, SequentialAccessBinary);

    if (typeof uint8Array === "undefined") {
      this.view = new DataView(new ArrayBuffer(4096));
      this.offset = 0;
    } else {
      this.view = new DataView(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength);
      this.offset = 0;
    }
  }

  _createClass(SequentialAccessBinary, [{
    key: "_extend",
    value: function _extend() {
      var newBuffer = new ArrayBuffer(this.view.byteLength * 2);
      new Uint8Array(newBuffer).set(new Uint8Array(this.view.buffer, this.view.byteOffset, this.view.byteLength));
      this.view = new DataView(newBuffer);
    }
  }, {
    key: "_readValue",
    value: function _readValue(byteLength, methodName) {
      var value = this.view[methodName](this.offset, true);
      this.offset += byteLength;
      return value;
    }
  }, {
    key: "_writeValue",
    value: function _writeValue(value, byteLength, methodName) {
      while (this.offset + byteLength > this.view.byteLength) {
        this._extend();
      }this.view[methodName](this.offset, value, true);
      this.offset += byteLength;
    }
  }, {
    key: "readUint8",
    value: function readUint8() {
      return this._readValue(1, "getUint8");
    }
  }, {
    key: "writeUint8",
    value: function writeUint8(value) {
      this._writeValue(value, 1, "setUint8");
    }
  }, {
    key: "readUint8Array",
    value: function readUint8Array(arrayLength) {
      var _this = this;

      return new Array(arrayLength).fill().map(function () {
        return _this.readUint8();
      });
    }
  }, {
    key: "writeUint8Array",
    value: function writeUint8Array(values) {
      var _this2 = this;

      values.forEach(function (value) {
        _this2.writeUint8(value);
      });
    }
  }, {
    key: "readInt8",
    value: function readInt8() {
      return this._readValue(1, "getInt8");
    }
  }, {
    key: "writeInt8",
    value: function writeInt8(value) {
      this._writeValue(value, 1, "setInt8");
    }
  }, {
    key: "readInt8Array",
    value: function readInt8Array(arrayLength) {
      var _this3 = this;

      return new Array(arrayLength).fill().map(function () {
        return _this3.readInt8();
      });
    }
  }, {
    key: "writeInt8Array",
    value: function writeInt8Array(values) {
      var _this4 = this;

      values.forEach(function (value) {
        _this4.writeInt8(value);
      });
    }
  }, {
    key: "readUint16",
    value: function readUint16() {
      return this._readValue(2, "getUint16");
    }
  }, {
    key: "writeUint16",
    value: function writeUint16(value) {
      this._writeValue(value, 2, "setUint16");
    }
  }, {
    key: "readUint16Array",
    value: function readUint16Array(arrayLength) {
      var _this5 = this;

      return new Array(arrayLength).fill().map(function () {
        return _this5.readUint16();
      });
    }
  }, {
    key: "writeUint16Array",
    value: function writeUint16Array(values) {
      var _this6 = this;

      values.forEach(function (value) {
        _this6.writeUint16(value);
      });
    }
  }, {
    key: "readInt16",
    value: function readInt16() {
      return this._readValue(2, "getInt16");
    }
  }, {
    key: "writeInt16",
    value: function writeInt16(value) {
      this._writeValue(value, 2, "setInt16");
    }
  }, {
    key: "readInt16Array",
    value: function readInt16Array(arrayLength) {
      var _this7 = this;

      return new Array(arrayLength).fill().map(function () {
        return _this7.readInt16();
      });
    }
  }, {
    key: "writeInt16Array",
    value: function writeInt16Array(values) {
      var _this8 = this;

      values.forEach(function (value) {
        _this8.writeInt16(value);
      });
    }
  }, {
    key: "readUint32",
    value: function readUint32() {
      return this._readValue(4, "getUint32");
    }
  }, {
    key: "writeUint32",
    value: function writeUint32(value) {
      this._writeValue(value, 4, "setUint32");
    }
  }, {
    key: "readUint32Array",
    value: function readUint32Array(arrayLength) {
      var _this9 = this;

      return new Array(arrayLength).fill().map(function () {
        return _this9.readUint32();
      });
    }
  }, {
    key: "writeUint32Array",
    value: function writeUint32Array(values) {
      var _this10 = this;

      values.forEach(function (value) {
        _this10.writeUint32(value);
      });
    }
  }, {
    key: "readInt32",
    value: function readInt32() {
      return this._readValue(4, "getInt32");
    }
  }, {
    key: "writeInt32",
    value: function writeInt32(value) {
      this._writeValue(value, 4, "setInt32");
    }
  }, {
    key: "readInt32Array",
    value: function readInt32Array(arrayLength) {
      var _this11 = this;

      return new Array(arrayLength).fill().map(function () {
        return _this11.readInt32();
      });
    }
  }, {
    key: "writeInt32Array",
    value: function writeInt32Array(values) {
      var _this12 = this;

      values.forEach(function (value) {
        _this12.writeInt32(value);
      });
    }
  }, {
    key: "readFloat32",
    value: function readFloat32() {
      return this._readValue(4, "getFloat32");
    }
  }, {
    key: "writeFloat32",
    value: function writeFloat32(value) {
      this._writeValue(value, 4, "setFloat32");
    }
  }, {
    key: "readFloat32Array",
    value: function readFloat32Array(arrayLength) {
      var _this13 = this;

      return new Array(arrayLength).fill().map(function () {
        return _this13.readFloat32();
      });
    }
  }, {
    key: "writeFloat32Array",
    value: function writeFloat32Array(values) {
      var _this14 = this;

      values.forEach(function (value) {
        _this14.writeFloat32(value);
      });
    }
  }, {
    key: "readString",
    value: function readString(byteLength, encoding) {
      return new TextDecoder(encoding).decode(new Uint8Array(this.readUint8Array(byteLength)));
    }
  }, {
    key: "writeString",
    value: function writeString(value, encoding) {
      this.writeUint8Array(new TextEncoder(encoding, { NONSTANDARD_allowLegacyEncoding: true }).encode(value));
    }
  }, {
    key: "readNullTerminatedString",
    value: function readNullTerminatedString(byteLength, encoding) {
      return new TextDecoder(encoding).decode(new Uint8Array(_.takeWhile(this.readUint8Array(byteLength), function (x) {
        return x > 0;
      })));
    }
  }, {
    key: "writeNullTerminatedString",
    value: function writeNullTerminatedString(value, byteLength, encoding) {
      var _this15 = this;

      var previousOffset = this.offset;
      this.writeString(value, encoding);
      _.range(this.offset - previousOffset, byteLength).forEach(function () {
        _this15.writeUint8(0);
      });
    }
  }, {
    key: "toUint8Array",
    value: function toUint8Array() {
      return new Uint8Array(this.view.buffer, this.view.byteOffset, this.offset);
    }
  }]);

  return SequentialAccessBinary;
}();

exports.default = SequentialAccessBinary;

},{"./my-math":9}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nullTextArea = require("./null-text-area");

var _nullTextArea2 = _interopRequireDefault(_nullTextArea);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TextAreaWrapper = function () {
  function TextAreaWrapper() {
    var textArea = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new _nullTextArea2.default();

    _classCallCheck(this, TextAreaWrapper);

    this.textArea = textArea;
    this._lastModified = new Date().getTime();
  }

  _createClass(TextAreaWrapper, [{
    key: "_wait",
    value: function _wait(resolve) {
      var previous = this._lastModified;
      var now = new Date().getTime();
      if (now - previous <= 100) {
        resolve();
      } else {
        this._lastModified = now;
        setTimeout(resolve, 0);
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this.textArea.value = "";
    }
  }, {
    key: "clearAsync",
    value: function clearAsync() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.clear();
        _this._wait(resolve);
      });
    }
  }, {
    key: "append",
    value: function append(message) {
      this.textArea.value += message + "\n";
      this.textArea.scrollTop = this.textArea.scrollHeight;
    }
  }, {
    key: "appendAsync",
    value: function appendAsync(message) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.append(message);
        _this2._wait(resolve);
      });
    }
  }, {
    key: "update",
    value: function update(message) {
      var lines = this.textArea.value.split(/\n/).slice(0, -1);
      if (lines[lines.length - 1] === message) return false;
      this.textArea.value = lines.slice(0, -1).map(function (line) {
        return line + "\n";
      }).join("") + message + "\n";
      this.textArea.scrollTop = this.textArea.scrollHeight;
      return true;
    }
  }, {
    key: "updateAsync",
    value: function updateAsync(message) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        if (_this3.update(message)) _this3._wait(resolve);else resolve();
      });
    }
  }, {
    key: "progress",
    value: function progress(message, count) {
      if (arguments.length === 2) {
        this.registeredMessage = message;
        this.registeredCount = count;
        this.registeredIndex = 0;
        this.append(message + "(0%)");
        return true;
      } else if (arguments.length === 0) {
        this.registeredIndex++;
        return this.update(this.registeredMessage + "(" + Math.floor(this.registeredIndex / this.registeredCount * 1000) / 10 + "%)");
      }
    }
  }, {
    key: "progressAsync",
    value: function progressAsync() {
      var _this4 = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return new Promise(function (resolve, reject) {
        if (_this4.progress.apply(_this4, args)) _this4._wait(resolve);else resolve();
      });
    }
  }]);

  return TextAreaWrapper;
}();

exports.default = TextAreaWrapper;

},{"./null-text-area":10}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _polygon = require("./polygon");

exports.default = _polygon.Triangle2D;

},{"./polygon":14}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cuboid = require("./cuboid");

var _cuboid2 = _interopRequireDefault(_cuboid);

var _directedLineSegment2d = require("./directed-line-segment-2d");

var _directedLineSegment2d2 = _interopRequireDefault(_directedLineSegment2d);

var _directedLineSegment3d = require("./directed-line-segment-3d");

var _directedLineSegment3d2 = _interopRequireDefault(_directedLineSegment3d);

var _line2d = require("./line-2d");

var _line2d2 = _interopRequireDefault(_line2d);

var _matrix2 = require("./matrix");

var _matrix3 = _interopRequireDefault(_matrix2);

var _plane = require("./plane");

var _plane2 = _interopRequireDefault(_plane);

var _triangle2d = require("./triangle-2d");

var _triangle2d2 = _interopRequireDefault(_triangle2d);

var _vector = require("./vector2");

var _vector2 = _interopRequireDefault(_vector);

var _vector3 = require("./vector3");

var _vector4 = _interopRequireDefault(_vector3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Triangle3D = function () {
  function Triangle3D() {
    _classCallCheck(this, Triangle3D);

    for (var _len = arguments.length, points = Array(_len), _key = 0; _key < _len; _key++) {
      points[_key] = arguments[_key];
    }

    if (points.length !== 3 || !points.every(function (point) {
      return point instanceof _vector4.default;
    })) throw new Error("points must be an array of three Vector3 elements.");
    this.points = points;
    var minX = Math.min.apply(Math, _toConsumableArray(points.map(function (point) {
      return point.x;
    })));
    var maxX = Math.max.apply(Math, _toConsumableArray(points.map(function (point) {
      return point.x;
    })));
    var minY = Math.min.apply(Math, _toConsumableArray(points.map(function (point) {
      return point.y;
    })));
    var maxY = Math.max.apply(Math, _toConsumableArray(points.map(function (point) {
      return point.y;
    })));
    var minZ = Math.min.apply(Math, _toConsumableArray(points.map(function (point) {
      return point.z;
    })));
    var maxZ = Math.max.apply(Math, _toConsumableArray(points.map(function (point) {
      return point.z;
    })));
    this._outline = new _cuboid2.default(minX, minY, minZ, maxX - minX, maxY - minY, maxZ - minZ);
  }

  _createClass(Triangle3D, [{
    key: "clone",
    value: function clone() {
      return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(this.points.map(function (point) {
        return point.clone();
      })))))();
    }
  }, {
    key: "centerOfGravity",
    value: function centerOfGravity() {
      return this.points[0].add(this.points[1]).add(this.points[2]).divide(3);
    }
  }, {
    key: "area",
    value: function area() {
      var a = this.points[1].subtract(this.points[0]).norm();
      var b = this.points[2].subtract(this.points[1]).norm();
      var c = this.points[0].subtract(this.points[2]).norm();
      var s = (a + b + c) / 2;
      return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    }
  }, {
    key: "intersection",
    value: function intersection(other) {
      var _this = this;

      if (other instanceof Triangle3D) {
        if (!this._outline.intersects(other._outline)) return [];
        var matrix = _matrix3.default.fromColumnVectors(this.points[1].subtract(this.points[0]), this.points[2].subtract(this.points[0]), this.points[1].subtract(this.points[0]).crossProduct(this.points[2].subtract(this.points[0])));
        var invMatrix = matrix.inverse();
        var xyzToUvw = function xyzToUvw(xyz) {
          return invMatrix.multiply(xyz.subtract(_this.points[0]));
        };
        var uvwToXyz = function uvwToXyz(uvw) {
          return matrix.multiply(uvw).add(_this.points[0]);
        };
        var points = other.points.map(xyzToUvw);
        var thisUvw = new _triangle2d2.default(new _vector2.default(0, 0), new _vector2.default(0, 1), new _vector2.default(1, 0));
        if (points.every(function (point) {
          return point.z === 0;
        })) {
          var otherUvw = new (Function.prototype.bind.apply(_triangle2d2.default, [null].concat(_toConsumableArray(points.map(function (point) {
            return new _vector2.default(point.x, point.y);
          })))))();
          // thisUvw.intersection(otherUvw) を uvwToXyz にかける
          throw new Error("Currently not implemented");
        }
        var overPoints = points.filter(function (point) {
          return point.z >= 0;
        });
        var underPoints = points.filter(function (point) {
          return point.z < 0;
        });
        if (overPoints.length === 3 || underPoints.length === 3) return [];
        var centerPoint = overPoints.length === 1 ? overPoints[0] : underPoints[0];
        while (points[0] !== centerPoint) {
          points.unshift(points.pop());
        }
        var newPoints = [points[1], points[2]].map(function (point) {
          var t = (0 - centerPoint.z) / (point.z - centerPoint.z);
          return _vector4.default.lerp(centerPoint, point, t);
        });
        if (newPoints[0].equals(newPoints[1])) return thisUvw.contains(new _vector2.default(newPoints[0].x, newPoints[0].y)) ? [uvwToXyz(newPoints[0])] : [];
        var intersectionsUvw = thisUvw.intersection(overPoints.length === 1 ? new _directedLineSegment2d2.default(new _vector2.default(newPoints[1].x, newPoints[1].y), new _vector2.default(newPoints[0].x, newPoints[0].y)) : new _directedLineSegment2d2.default(new _vector2.default(newPoints[0].x, newPoints[0].y), new _vector2.default(newPoints[1].x, newPoints[1].y)));
        if (intersectionsUvw.length === 0) {
          return [];
        } else if (intersectionsUvw[0] instanceof _vector2.default) {
          return [uvwToXyz(new _vector4.default(intersectionsUvw[0].x, intersectionsUvw[0].y, 0))];
        } else if (intersectionsUvw[0] instanceof _directedLineSegment2d2.default) {
          return [new _directedLineSegment3d2.default(uvwToXyz(new _vector4.default(intersectionsUvw[0].p1.x, intersectionsUvw[0].p1.y, 0)), uvwToXyz(new _vector4.default(intersectionsUvw[0].p2.x, intersectionsUvw[0].p2.y, 0)))];
        }
      } else if (other instanceof _plane2.default) {
        var a = new _vector4.default(other.a, other.b, other.c).innerProduct(this.points[1].subtract(this.points[0]));
        var b = new _vector4.default(other.a, other.b, other.c).innerProduct(this.points[2].subtract(this.points[0]));
        if (a === 0 && b === 0) return this;
        var intersections = new _triangle2d2.default(new _vector2.default(0, 0), new _vector2.default(0, 1), new _vector2.default(1, 0)).intersection(new _line2d2.default(a, b, other.d));
        if (intersections.length === 0) return [];
        var _matrix = _matrix3.default.fromColumnVectors(this.points[1].subtract(this.points[0]), this.points[2].subtract(this.points[0]));
        var uvToXyz = function uvToXyz(uv) {
          return _matrix.multiply(uv).add(_this.points[0]);
        };
        if (intersections[0] instanceof _vector2.default) return [uvToXyz(intersections[0])];
        return [new _directedLineSegment3d2.default(uvToXyz(intersections[0].p1), uvToXyz(intersections[0].p2))];
      } else {
        throw new Error("Unknown type");
      }
    }
  }, {
    key: "blendRates",
    value: function blendRates(p) {
      // pがthisと同一平面上にあることが前提
      var uvw = _matrix3.default.fromColumnVectors(this.points[1].subtract(this.points[0]), this.points[2].subtract(this.points[0]), this.points[1].subtract(this.points[0]).crossProduct(this.points[2].subtract(this.points[0]))).inverse().multiply(p.subtract(this.points[0]));
      return [1 - uvw.x - uvw.y, uvw.x, uvw.y];
    }
  }]);

  return Triangle3D;
}();

exports.default = Triangle3D;

},{"./cuboid":2,"./directed-line-segment-2d":3,"./directed-line-segment-3d":4,"./line-2d":5,"./matrix":8,"./plane":11,"./triangle-2d":19,"./vector2":22,"./vector3":23}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Vector = function () {
  function Vector() {
    var _this = this;

    _classCallCheck(this, Vector);

    for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
      values[_key] = arguments[_key];
    }

    values.forEach(function (value, i) {
      _this[i] = value;
    });
    this.length = values.length;
  }

  _createClass(Vector, [{
    key: "clone",
    value: function clone() {
      return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(this.toArray()))))();
    }
  }, {
    key: "negate",
    value: function negate() {
      var _this2 = this;

      return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(new Array(this.length).fill().map(function (_, i) {
        return -_this2[i];
      })))))();
    }
  }, {
    key: "add",
    value: function add(other) {
      var _this3 = this;

      return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(new Array(this.length).fill().map(function (_, i) {
        return _this3[i] + other[i];
      })))))();
    }
  }, {
    key: "subtract",
    value: function subtract(other) {
      var _this4 = this;

      return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(new Array(this.length).fill().map(function (_, i) {
        return _this4[i] - other[i];
      })))))();
    }
  }, {
    key: "multiply",
    value: function multiply(scale) {
      var _this5 = this;

      return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(new Array(this.length).fill().map(function (_, i) {
        return _this5[i] * scale;
      })))))();
    }
  }, {
    key: "divide",
    value: function divide(scale) {
      var _this6 = this;

      return new (Function.prototype.bind.apply(this.constructor, [null].concat(_toConsumableArray(new Array(this.length).fill().map(function (_, i) {
        return _this6[i] / scale;
      })))))();
    }
  }, {
    key: "norm",
    value: function norm() {
      return Math.sqrt(this.squaredNorm());
    }
  }, {
    key: "squaredNorm",
    value: function squaredNorm() {
      return this.innerProduct(this);
    }
  }, {
    key: "innerProduct",
    value: function innerProduct(other) {
      var _this7 = this;

      return new Array(this.length).fill().reduce(function (sum, _, i) {
        return sum + _this7[i] * other[i];
      }, 0);
    }
  }, {
    key: "normalize",
    value: function normalize() {
      return this.divide(this.norm());
    }
  }, {
    key: "equals",
    value: function equals(other) {
      var _this8 = this;

      return this === other || this.length === other.length && new Array(this.length).fill().every(function (_, i) {
        return _this8[i] === other[i];
      });
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.toArray().join(",");
    }
  }, {
    key: "toArray",
    value: function toArray() {
      return Array.from(this);
    }
  }], [{
    key: "lerp",
    value: function lerp(v1, v2, t) {
      return v1.add(v2.subtract(v1).multiply(t));
    }
  }, {
    key: "zero",
    value: function zero(n) {
      return new (Function.prototype.bind.apply(this, [null].concat(_toConsumableArray(new Array(n).fill(0)))))();
    }
  }]);

  return Vector;
}();

exports.default = Vector;

},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vector = require("./vector");

var _vector2 = _interopRequireDefault(_vector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Vector2 = function (_Vector) {
  _inherits(Vector2, _Vector);

  function Vector2(x, y) {
    _classCallCheck(this, Vector2);

    return _possibleConstructorReturn(this, (Vector2.__proto__ || Object.getPrototypeOf(Vector2)).call(this, x, y));
  }

  _createClass(Vector2, [{
    key: "x",
    get: function get() {
      return this[0];
    }
  }, {
    key: "y",
    get: function get() {
      return this[1];
    }
  }]);

  return Vector2;
}(_vector2.default);

exports.default = Vector2;

Vector2.zero = new Vector2(0, 0);

},{"./vector":21}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vector = require("./vector");

var _vector2 = _interopRequireDefault(_vector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Vector3 = function (_Vector) {
  _inherits(Vector3, _Vector);

  function Vector3(x, y, z) {
    _classCallCheck(this, Vector3);

    return _possibleConstructorReturn(this, (Vector3.__proto__ || Object.getPrototypeOf(Vector3)).call(this, x, y, z));
  }

  _createClass(Vector3, [{
    key: "crossProduct",
    value: function crossProduct(other) {
      return new this.constructor(this.y * other.z - this.z * other.y, this.z * other.x - this.x * other.z, this.x * other.y - this.y * other.x);
    }
  }, {
    key: "x",
    get: function get() {
      return this[0];
    }
  }, {
    key: "y",
    get: function get() {
      return this[1];
    }
  }, {
    key: "z",
    get: function get() {
      return this[2];
    }
  }]);

  return Vector3;
}(_vector2.default);

exports.default = Vector3;

Vector3.zero = new Vector3(0, 0, 0);

},{"./vector":21}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _vector = require("./vector");

var _vector2 = _interopRequireDefault(_vector);

var _quaternion = require("./quaternion");

var _quaternion2 = _interopRequireDefault(_quaternion);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Vector4 = function (_Vector) {
  _inherits(Vector4, _Vector);

  function Vector4(x, y, z, w) {
    _classCallCheck(this, Vector4);

    return _possibleConstructorReturn(this, (Vector4.__proto__ || Object.getPrototypeOf(Vector4)).call(this, x, y, z, w));
  }

  _createClass(Vector4, [{
    key: "toQuaternion",
    value: function toQuaternion() {
      return new _quaternion2.default(this.w, this.x, this.y, this.z);
    }
  }, {
    key: "x",
    get: function get() {
      return this[0];
    }
  }, {
    key: "y",
    get: function get() {
      return this[1];
    }
  }, {
    key: "z",
    get: function get() {
      return this[2];
    }
  }, {
    key: "w",
    get: function get() {
      return this[3];
    }
  }]);

  return Vector4;
}(_vector2.default);

exports.default = Vector4;

Vector4.zero = new Vector4(0, 0, 0, 0);

},{"./quaternion":15,"./vector":21}],25:[function(require,module,exports){
module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

},{}],26:[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('./_wks')('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

},{"./_hide":57,"./_wks":128}],27:[function(require,module,exports){
module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

},{}],28:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

},{"./_is-object":66}],29:[function(require,module,exports){
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
'use strict';
var toObject = require('./_to-object');
var toAbsoluteIndex = require('./_to-absolute-index');
var toLength = require('./_to-length');

module.exports = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
  var O = toObject(this);
  var len = toLength(O.length);
  var to = toAbsoluteIndex(target, len);
  var from = toAbsoluteIndex(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = Math.min((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
  var inc = 1;
  if (from < to && to < from + count) {
    inc = -1;
    from += count - 1;
    to += count - 1;
  }
  while (count-- > 0) {
    if (from in O) O[to] = O[from];
    else delete O[to];
    to += inc;
    from += inc;
  } return O;
};

},{"./_to-absolute-index":114,"./_to-length":118,"./_to-object":119}],30:[function(require,module,exports){
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
'use strict';
var toObject = require('./_to-object');
var toAbsoluteIndex = require('./_to-absolute-index');
var toLength = require('./_to-length');
module.exports = function fill(value /* , start = 0, end = @length */) {
  var O = toObject(this);
  var length = toLength(O.length);
  var aLen = arguments.length;
  var index = toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
  var end = aLen > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

},{"./_to-absolute-index":114,"./_to-length":118,"./_to-object":119}],31:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');
var toAbsoluteIndex = require('./_to-absolute-index');
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

},{"./_to-absolute-index":114,"./_to-iobject":117,"./_to-length":118}],32:[function(require,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx = require('./_ctx');
var IObject = require('./_iobject');
var toObject = require('./_to-object');
var toLength = require('./_to-length');
var asc = require('./_array-species-create');
module.exports = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || asc;
  return function ($this, callbackfn, that) {
    var O = toObject($this);
    var self = IObject(O);
    var f = ctx(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

},{"./_array-species-create":34,"./_ctx":43,"./_iobject":62,"./_to-length":118,"./_to-object":119}],33:[function(require,module,exports){
var isObject = require('./_is-object');
var isArray = require('./_is-array');
var SPECIES = require('./_wks')('species');

module.exports = function (original) {
  var C;
  if (isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

},{"./_is-array":64,"./_is-object":66,"./_wks":128}],34:[function(require,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = require('./_array-species-constructor');

module.exports = function (original, length) {
  return new (speciesConstructor(original))(length);
};

},{"./_array-species-constructor":33}],35:[function(require,module,exports){
'use strict';
var aFunction = require('./_a-function');
var isObject = require('./_is-object');
var invoke = require('./_invoke');
var arraySlice = [].slice;
var factories = {};

var construct = function (F, len, args) {
  if (!(len in factories)) {
    for (var n = [], i = 0; i < len; i++) n[i] = 'a[' + i + ']';
    // eslint-disable-next-line no-new-func
    factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
  } return factories[len](F, args);
};

module.exports = Function.bind || function bind(that /* , ...args */) {
  var fn = aFunction(this);
  var partArgs = arraySlice.call(arguments, 1);
  var bound = function (/* args... */) {
    var args = partArgs.concat(arraySlice.call(arguments));
    return this instanceof bound ? construct(fn, args.length, args) : invoke(fn, args, that);
  };
  if (isObject(fn.prototype)) bound.prototype = fn.prototype;
  return bound;
};

},{"./_a-function":25,"./_invoke":61,"./_is-object":66}],36:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof');
var TAG = require('./_wks')('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

},{"./_cof":37,"./_wks":128}],37:[function(require,module,exports){
var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};

},{}],38:[function(require,module,exports){
'use strict';
var dP = require('./_object-dp').f;
var create = require('./_object-create');
var redefineAll = require('./_redefine-all');
var ctx = require('./_ctx');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var $iterDefine = require('./_iter-define');
var step = require('./_iter-step');
var setSpecies = require('./_set-species');
var DESCRIPTORS = require('./_descriptors');
var fastKey = require('./_meta').fastKey;
var validate = require('./_validate-collection');
var SIZE = DESCRIPTORS ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = validate(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = validate(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        validate(this, NAME);
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(validate(this, NAME), key);
      }
    });
    if (DESCRIPTORS) dP(C.prototype, 'size', {
      get: function () {
        return validate(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function (iterated, kind) {
      this._t = validate(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if (kind == 'keys') return step(0, entry.k);
      if (kind == 'values') return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};

},{"./_an-instance":27,"./_ctx":43,"./_descriptors":45,"./_for-of":54,"./_iter-define":70,"./_iter-step":72,"./_meta":79,"./_object-create":83,"./_object-dp":84,"./_redefine-all":100,"./_set-species":104,"./_validate-collection":125}],39:[function(require,module,exports){
'use strict';
var redefineAll = require('./_redefine-all');
var getWeak = require('./_meta').getWeak;
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var createArrayMethod = require('./_array-methods');
var $has = require('./_has');
var validate = require('./_validate-collection');
var arrayFind = createArrayMethod(5);
var arrayFindIndex = createArrayMethod(6);
var id = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function (that) {
  return that._l || (that._l = new UncaughtFrozenStore());
};
var UncaughtFrozenStore = function () {
  this.a = [];
};
var findUncaughtFrozen = function (store, key) {
  return arrayFind(store.a, function (it) {
    return it[0] === key;
  });
};
UncaughtFrozenStore.prototype = {
  get: function (key) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) return entry[1];
  },
  has: function (key) {
    return !!findUncaughtFrozen(this, key);
  },
  set: function (key, value) {
    var entry = findUncaughtFrozen(this, key);
    if (entry) entry[1] = value;
    else this.a.push([key, value]);
  },
  'delete': function (key) {
    var index = arrayFindIndex(this.a, function (it) {
      return it[0] === key;
    });
    if (~index) this.a.splice(index, 1);
    return !!~index;
  }
};

module.exports = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, NAME, '_i');
      that._t = NAME;      // collection type
      that._i = id++;      // collection id
      that._l = undefined; // leak store for uncaught frozen objects
      if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function (key) {
        if (!isObject(key)) return false;
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(validate(this, NAME))['delete'](key);
        return data && $has(data, this._i) && delete data[this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key) {
        if (!isObject(key)) return false;
        var data = getWeak(key);
        if (data === true) return uncaughtFrozenStore(validate(this, NAME)).has(key);
        return data && $has(data, this._i);
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var data = getWeak(anObject(key), true);
    if (data === true) uncaughtFrozenStore(that).set(key, value);
    else data[that._i] = value;
    return that;
  },
  ufstore: uncaughtFrozenStore
};

},{"./_an-instance":27,"./_an-object":28,"./_array-methods":32,"./_for-of":54,"./_has":56,"./_is-object":66,"./_meta":79,"./_redefine-all":100,"./_validate-collection":125}],40:[function(require,module,exports){
'use strict';
var global = require('./_global');
var $export = require('./_export');
var redefine = require('./_redefine');
var redefineAll = require('./_redefine-all');
var meta = require('./_meta');
var forOf = require('./_for-of');
var anInstance = require('./_an-instance');
var isObject = require('./_is-object');
var fails = require('./_fails');
var $iterDetect = require('./_iter-detect');
var setToStringTag = require('./_set-to-string-tag');
var inheritIfRequired = require('./_inherit-if-required');

module.exports = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  var fixMethod = function (KEY) {
    var fn = proto[KEY];
    redefine(proto, KEY,
      KEY == 'delete' ? function (a) {
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a) {
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a) {
        return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a) { fn.call(this, a === 0 ? 0 : a); return this; }
        : function set(a, b) { fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  };
  if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    var instance = new C();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    var ACCEPT_ITERABLES = $iterDetect(function (iter) { new C(iter); }); // eslint-disable-line no-new
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new C();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });
    if (!ACCEPT_ITERABLES) {
      C = wrapper(function (target, iterable) {
        anInstance(target, C, NAME);
        var that = inheritIfRequired(new Base(), target, C);
        if (iterable != undefined) forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
    // weak collections should not contains .clear method
    if (IS_WEAK && proto.clear) delete proto.clear;
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F * (C != Base), O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};

},{"./_an-instance":27,"./_export":49,"./_fails":51,"./_for-of":54,"./_global":55,"./_inherit-if-required":60,"./_is-object":66,"./_iter-detect":71,"./_meta":79,"./_redefine":101,"./_redefine-all":100,"./_set-to-string-tag":105}],41:[function(require,module,exports){
var core = module.exports = { version: '2.5.1' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef

},{}],42:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp');
var createDesc = require('./_property-desc');

module.exports = function (object, index, value) {
  if (index in object) $defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};

},{"./_object-dp":84,"./_property-desc":99}],43:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

},{"./_a-function":25}],44:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

},{}],45:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_fails":51}],46:[function(require,module,exports){
var isObject = require('./_is-object');
var document = require('./_global').document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};

},{"./_global":55,"./_is-object":66}],47:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

},{}],48:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
module.exports = function (it) {
  var result = getKeys(it);
  var getSymbols = gOPS.f;
  if (getSymbols) {
    var symbols = getSymbols(it);
    var isEnum = pIE.f;
    var i = 0;
    var key;
    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
  } return result;
};

},{"./_object-gops":89,"./_object-keys":92,"./_object-pie":93}],49:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var hide = require('./_hide');
var redefine = require('./_redefine');
var ctx = require('./_ctx');
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;

},{"./_core":41,"./_ctx":43,"./_global":55,"./_hide":57,"./_redefine":101}],50:[function(require,module,exports){
var MATCH = require('./_wks')('match');
module.exports = function (KEY) {
  var re = /./;
  try {
    '/./'[KEY](re);
  } catch (e) {
    try {
      re[MATCH] = false;
      return !'/./'[KEY](re);
    } catch (f) { /* empty */ }
  } return true;
};

},{"./_wks":128}],51:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

},{}],52:[function(require,module,exports){
'use strict';
var hide = require('./_hide');
var redefine = require('./_redefine');
var fails = require('./_fails');
var defined = require('./_defined');
var wks = require('./_wks');

module.exports = function (KEY, length, exec) {
  var SYMBOL = wks(KEY);
  var fns = exec(defined, SYMBOL, ''[KEY]);
  var strfn = fns[0];
  var rxfn = fns[1];
  if (fails(function () {
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  })) {
    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};

},{"./_defined":44,"./_fails":51,"./_hide":57,"./_redefine":101,"./_wks":128}],53:[function(require,module,exports){
'use strict';
// 21.2.5.3 get RegExp.prototype.flags
var anObject = require('./_an-object');
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

},{"./_an-object":28}],54:[function(require,module,exports){
var ctx = require('./_ctx');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var anObject = require('./_an-object');
var toLength = require('./_to-length');
var getIterFn = require('./core.get-iterator-method');
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;

},{"./_an-object":28,"./_ctx":43,"./_is-array-iter":63,"./_iter-call":68,"./_to-length":118,"./core.get-iterator-method":129}],55:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef

},{}],56:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};

},{}],57:[function(require,module,exports){
var dP = require('./_object-dp');
var createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

},{"./_descriptors":45,"./_object-dp":84,"./_property-desc":99}],58:[function(require,module,exports){
var document = require('./_global').document;
module.exports = document && document.documentElement;

},{"./_global":55}],59:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function () {
  return Object.defineProperty(require('./_dom-create')('div'), 'a', { get: function () { return 7; } }).a != 7;
});

},{"./_descriptors":45,"./_dom-create":46,"./_fails":51}],60:[function(require,module,exports){
var isObject = require('./_is-object');
var setPrototypeOf = require('./_set-proto').set;
module.exports = function (that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  } return that;
};

},{"./_is-object":66,"./_set-proto":103}],61:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

},{}],62:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};

},{"./_cof":37}],63:[function(require,module,exports){
// check on default Array iterator
var Iterators = require('./_iterators');
var ITERATOR = require('./_wks')('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};

},{"./_iterators":73,"./_wks":128}],64:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg) {
  return cof(arg) == 'Array';
};

},{"./_cof":37}],65:[function(require,module,exports){
// 20.1.2.3 Number.isInteger(number)
var isObject = require('./_is-object');
var floor = Math.floor;
module.exports = function isInteger(it) {
  return !isObject(it) && isFinite(it) && floor(it) === it;
};

},{"./_is-object":66}],66:[function(require,module,exports){
module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

},{}],67:[function(require,module,exports){
// 7.2.8 IsRegExp(argument)
var isObject = require('./_is-object');
var cof = require('./_cof');
var MATCH = require('./_wks')('match');
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};

},{"./_cof":37,"./_is-object":66,"./_wks":128}],68:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};

},{"./_an-object":28}],69:[function(require,module,exports){
'use strict';
var create = require('./_object-create');
var descriptor = require('./_property-desc');
var setToStringTag = require('./_set-to-string-tag');
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};

},{"./_hide":57,"./_object-create":83,"./_property-desc":99,"./_set-to-string-tag":105,"./_wks":128}],70:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var $export = require('./_export');
var redefine = require('./_redefine');
var hide = require('./_hide');
var has = require('./_has');
var Iterators = require('./_iterators');
var $iterCreate = require('./_iter-create');
var setToStringTag = require('./_set-to-string-tag');
var getPrototypeOf = require('./_object-gpo');
var ITERATOR = require('./_wks')('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

},{"./_export":49,"./_has":56,"./_hide":57,"./_iter-create":69,"./_iterators":73,"./_library":74,"./_object-gpo":90,"./_redefine":101,"./_set-to-string-tag":105,"./_wks":128}],71:[function(require,module,exports){
var ITERATOR = require('./_wks')('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

},{"./_wks":128}],72:[function(require,module,exports){
module.exports = function (done, value) {
  return { value: value, done: !!done };
};

},{}],73:[function(require,module,exports){
module.exports = {};

},{}],74:[function(require,module,exports){
module.exports = false;

},{}],75:[function(require,module,exports){
// 20.2.2.14 Math.expm1(x)
var $expm1 = Math.expm1;
module.exports = (!$expm1
  // Old FF bug
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || $expm1(-2e-17) != -2e-17
) ? function expm1(x) {
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
} : $expm1;

},{}],76:[function(require,module,exports){
// 20.2.2.16 Math.fround(x)
var sign = require('./_math-sign');
var pow = Math.pow;
var EPSILON = pow(2, -52);
var EPSILON32 = pow(2, -23);
var MAX32 = pow(2, 127) * (2 - EPSILON32);
var MIN32 = pow(2, -126);

var roundTiesToEven = function (n) {
  return n + 1 / EPSILON - 1 / EPSILON;
};

module.exports = Math.fround || function fround(x) {
  var $abs = Math.abs(x);
  var $sign = sign(x);
  var a, result;
  if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
  a = (1 + EPSILON32 / EPSILON) * $abs;
  result = a - (a - $abs);
  // eslint-disable-next-line no-self-compare
  if (result > MAX32 || result != result) return $sign * Infinity;
  return $sign * result;
};

},{"./_math-sign":78}],77:[function(require,module,exports){
// 20.2.2.20 Math.log1p(x)
module.exports = Math.log1p || function log1p(x) {
  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
};

},{}],78:[function(require,module,exports){
// 20.2.2.28 Math.sign(x)
module.exports = Math.sign || function sign(x) {
  // eslint-disable-next-line no-self-compare
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
};

},{}],79:[function(require,module,exports){
var META = require('./_uid')('meta');
var isObject = require('./_is-object');
var has = require('./_has');
var setDesc = require('./_object-dp').f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !require('./_fails')(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};

},{"./_fails":51,"./_has":56,"./_is-object":66,"./_object-dp":84,"./_uid":124}],80:[function(require,module,exports){
var global = require('./_global');
var macrotask = require('./_task').set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = require('./_cof')(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver
  } else if (Observer) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    var promise = Promise.resolve();
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};

},{"./_cof":37,"./_global":55,"./_task":113}],81:[function(require,module,exports){
'use strict';
// 25.4.1.5 NewPromiseCapability(C)
var aFunction = require('./_a-function');

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};

},{"./_a-function":25}],82:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys = require('./_object-keys');
var gOPS = require('./_object-gops');
var pIE = require('./_object-pie');
var toObject = require('./_to-object');
var IObject = require('./_iobject');
var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = gOPS.f;
  var isEnum = pIE.f;
  while (aLen > index) {
    var S = IObject(arguments[index++]);
    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
  } return T;
} : $assign;

},{"./_fails":51,"./_iobject":62,"./_object-gops":89,"./_object-keys":92,"./_object-pie":93,"./_to-object":119}],83:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = require('./_an-object');
var dPs = require('./_object-dps');
var enumBugKeys = require('./_enum-bug-keys');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"./_an-object":28,"./_dom-create":46,"./_enum-bug-keys":47,"./_html":58,"./_object-dps":85,"./_shared-key":106}],84:[function(require,module,exports){
var anObject = require('./_an-object');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var toPrimitive = require('./_to-primitive');
var dP = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

},{"./_an-object":28,"./_descriptors":45,"./_ie8-dom-define":59,"./_to-primitive":120}],85:[function(require,module,exports){
var dP = require('./_object-dp');
var anObject = require('./_an-object');
var getKeys = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};

},{"./_an-object":28,"./_descriptors":45,"./_object-dp":84,"./_object-keys":92}],86:[function(require,module,exports){
var pIE = require('./_object-pie');
var createDesc = require('./_property-desc');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var has = require('./_has');
var IE8_DOM_DEFINE = require('./_ie8-dom-define');
var gOPD = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = toIObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
};

},{"./_descriptors":45,"./_has":56,"./_ie8-dom-define":59,"./_object-pie":93,"./_property-desc":99,"./_to-iobject":117,"./_to-primitive":120}],87:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject');
var gOPN = require('./_object-gopn').f;
var toString = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return gOPN(it);
  } catch (e) {
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it) {
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":88,"./_to-iobject":117}],88:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys = require('./_object-keys-internal');
var hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return $keys(O, hiddenKeys);
};

},{"./_enum-bug-keys":47,"./_object-keys-internal":91}],89:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;

},{}],90:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('./_has');
var toObject = require('./_to-object');
var IE_PROTO = require('./_shared-key')('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

},{"./_has":56,"./_shared-key":106,"./_to-object":119}],91:[function(require,module,exports){
var has = require('./_has');
var toIObject = require('./_to-iobject');
var arrayIndexOf = require('./_array-includes')(false);
var IE_PROTO = require('./_shared-key')('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

},{"./_array-includes":31,"./_has":56,"./_shared-key":106,"./_to-iobject":117}],92:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = require('./_object-keys-internal');
var enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};

},{"./_enum-bug-keys":47,"./_object-keys-internal":91}],93:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;

},{}],94:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export');
var core = require('./_core');
var fails = require('./_fails');
module.exports = function (KEY, exec) {
  var fn = (core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function () { fn(1); }), 'Object', exp);
};

},{"./_core":41,"./_export":49,"./_fails":51}],95:[function(require,module,exports){
var getKeys = require('./_object-keys');
var toIObject = require('./_to-iobject');
var isEnum = require('./_object-pie').f;
module.exports = function (isEntries) {
  return function (it) {
    var O = toIObject(it);
    var keys = getKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) if (isEnum.call(O, key = keys[i++])) {
      result.push(isEntries ? [key, O[key]] : O[key]);
    } return result;
  };
};

},{"./_object-keys":92,"./_object-pie":93,"./_to-iobject":117}],96:[function(require,module,exports){
// all object keys, includes non-enumerable and symbols
var gOPN = require('./_object-gopn');
var gOPS = require('./_object-gops');
var anObject = require('./_an-object');
var Reflect = require('./_global').Reflect;
module.exports = Reflect && Reflect.ownKeys || function ownKeys(it) {
  var keys = gOPN.f(anObject(it));
  var getSymbols = gOPS.f;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};

},{"./_an-object":28,"./_global":55,"./_object-gopn":88,"./_object-gops":89}],97:[function(require,module,exports){
module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};

},{}],98:[function(require,module,exports){
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var newPromiseCapability = require('./_new-promise-capability');

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

},{"./_an-object":28,"./_is-object":66,"./_new-promise-capability":81}],99:[function(require,module,exports){
module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

},{}],100:[function(require,module,exports){
var redefine = require('./_redefine');
module.exports = function (target, src, safe) {
  for (var key in src) redefine(target, key, src[key], safe);
  return target;
};

},{"./_redefine":101}],101:[function(require,module,exports){
var global = require('./_global');
var hide = require('./_hide');
var has = require('./_has');
var SRC = require('./_uid')('src');
var TO_STRING = 'toString';
var $toString = Function[TO_STRING];
var TPL = ('' + $toString).split(TO_STRING);

require('./_core').inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});

},{"./_core":41,"./_global":55,"./_has":56,"./_hide":57,"./_uid":124}],102:[function(require,module,exports){
// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y) {
  // eslint-disable-next-line no-self-compare
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};

},{}],103:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object');
var anObject = require('./_an-object');
var check = function (O, proto) {
  anObject(O);
  if (!isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

},{"./_an-object":28,"./_ctx":43,"./_is-object":66,"./_object-gopd":86}],104:[function(require,module,exports){
'use strict';
var global = require('./_global');
var dP = require('./_object-dp');
var DESCRIPTORS = require('./_descriptors');
var SPECIES = require('./_wks')('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};

},{"./_descriptors":45,"./_global":55,"./_object-dp":84,"./_wks":128}],105:[function(require,module,exports){
var def = require('./_object-dp').f;
var has = require('./_has');
var TAG = require('./_wks')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

},{"./_has":56,"./_object-dp":84,"./_wks":128}],106:[function(require,module,exports){
var shared = require('./_shared')('keys');
var uid = require('./_uid');
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};

},{"./_shared":107,"./_uid":124}],107:[function(require,module,exports){
var global = require('./_global');
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});
module.exports = function (key) {
  return store[key] || (store[key] = {});
};

},{"./_global":55}],108:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = require('./_an-object');
var aFunction = require('./_a-function');
var SPECIES = require('./_wks')('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};

},{"./_a-function":25,"./_an-object":28,"./_wks":128}],109:[function(require,module,exports){
var toInteger = require('./_to-integer');
var defined = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

},{"./_defined":44,"./_to-integer":116}],110:[function(require,module,exports){
// helper for String#{startsWith, endsWith, includes}
var isRegExp = require('./_is-regexp');
var defined = require('./_defined');

module.exports = function (that, searchString, NAME) {
  if (isRegExp(searchString)) throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(defined(that));
};

},{"./_defined":44,"./_is-regexp":67}],111:[function(require,module,exports){
// https://github.com/tc39/proposal-string-pad-start-end
var toLength = require('./_to-length');
var repeat = require('./_string-repeat');
var defined = require('./_defined');

module.exports = function (that, maxLength, fillString, left) {
  var S = String(defined(that));
  var stringLength = S.length;
  var fillStr = fillString === undefined ? ' ' : String(fillString);
  var intMaxLength = toLength(maxLength);
  if (intMaxLength <= stringLength || fillStr == '') return S;
  var fillLen = intMaxLength - stringLength;
  var stringFiller = repeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
  if (stringFiller.length > fillLen) stringFiller = stringFiller.slice(0, fillLen);
  return left ? stringFiller + S : S + stringFiller;
};

},{"./_defined":44,"./_string-repeat":112,"./_to-length":118}],112:[function(require,module,exports){
'use strict';
var toInteger = require('./_to-integer');
var defined = require('./_defined');

module.exports = function repeat(count) {
  var str = String(defined(this));
  var res = '';
  var n = toInteger(count);
  if (n < 0 || n == Infinity) throw RangeError("Count can't be negative");
  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) res += str;
  return res;
};

},{"./_defined":44,"./_to-integer":116}],113:[function(require,module,exports){
var ctx = require('./_ctx');
var invoke = require('./_invoke');
var html = require('./_html');
var cel = require('./_dom-create');
var global = require('./_global');
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (require('./_cof')(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};

},{"./_cof":37,"./_ctx":43,"./_dom-create":46,"./_global":55,"./_html":58,"./_invoke":61}],114:[function(require,module,exports){
var toInteger = require('./_to-integer');
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};

},{"./_to-integer":116}],115:[function(require,module,exports){
// https://tc39.github.io/ecma262/#sec-toindex
var toInteger = require('./_to-integer');
var toLength = require('./_to-length');
module.exports = function (it) {
  if (it === undefined) return 0;
  var number = toInteger(it);
  var length = toLength(number);
  if (number !== length) throw RangeError('Wrong length!');
  return length;
};

},{"./_to-integer":116,"./_to-length":118}],116:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

},{}],117:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject');
var defined = require('./_defined');
module.exports = function (it) {
  return IObject(defined(it));
};

},{"./_defined":44,"./_iobject":62}],118:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer');
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

},{"./_to-integer":116}],119:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function (it) {
  return Object(defined(it));
};

},{"./_defined":44}],120:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

},{"./_is-object":66}],121:[function(require,module,exports){
'use strict';
if (require('./_descriptors')) {
  var LIBRARY = require('./_library');
  var global = require('./_global');
  var fails = require('./_fails');
  var $export = require('./_export');
  var $typed = require('./_typed');
  var $buffer = require('./_typed-buffer');
  var ctx = require('./_ctx');
  var anInstance = require('./_an-instance');
  var propertyDesc = require('./_property-desc');
  var hide = require('./_hide');
  var redefineAll = require('./_redefine-all');
  var toInteger = require('./_to-integer');
  var toLength = require('./_to-length');
  var toIndex = require('./_to-index');
  var toAbsoluteIndex = require('./_to-absolute-index');
  var toPrimitive = require('./_to-primitive');
  var has = require('./_has');
  var classof = require('./_classof');
  var isObject = require('./_is-object');
  var toObject = require('./_to-object');
  var isArrayIter = require('./_is-array-iter');
  var create = require('./_object-create');
  var getPrototypeOf = require('./_object-gpo');
  var gOPN = require('./_object-gopn').f;
  var getIterFn = require('./core.get-iterator-method');
  var uid = require('./_uid');
  var wks = require('./_wks');
  var createArrayMethod = require('./_array-methods');
  var createArrayIncludes = require('./_array-includes');
  var speciesConstructor = require('./_species-constructor');
  var ArrayIterators = require('./es6.array.iterator');
  var Iterators = require('./_iterators');
  var $iterDetect = require('./_iter-detect');
  var setSpecies = require('./_set-species');
  var arrayFill = require('./_array-fill');
  var arrayCopyWithin = require('./_array-copy-within');
  var $DP = require('./_object-dp');
  var $GOPD = require('./_object-gopd');
  var dP = $DP.f;
  var gOPD = $GOPD.f;
  var RangeError = global.RangeError;
  var TypeError = global.TypeError;
  var Uint8Array = global.Uint8Array;
  var ARRAY_BUFFER = 'ArrayBuffer';
  var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
  var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
  var PROTOTYPE = 'prototype';
  var ArrayProto = Array[PROTOTYPE];
  var $ArrayBuffer = $buffer.ArrayBuffer;
  var $DataView = $buffer.DataView;
  var arrayForEach = createArrayMethod(0);
  var arrayFilter = createArrayMethod(2);
  var arraySome = createArrayMethod(3);
  var arrayEvery = createArrayMethod(4);
  var arrayFind = createArrayMethod(5);
  var arrayFindIndex = createArrayMethod(6);
  var arrayIncludes = createArrayIncludes(true);
  var arrayIndexOf = createArrayIncludes(false);
  var arrayValues = ArrayIterators.values;
  var arrayKeys = ArrayIterators.keys;
  var arrayEntries = ArrayIterators.entries;
  var arrayLastIndexOf = ArrayProto.lastIndexOf;
  var arrayReduce = ArrayProto.reduce;
  var arrayReduceRight = ArrayProto.reduceRight;
  var arrayJoin = ArrayProto.join;
  var arraySort = ArrayProto.sort;
  var arraySlice = ArrayProto.slice;
  var arrayToString = ArrayProto.toString;
  var arrayToLocaleString = ArrayProto.toLocaleString;
  var ITERATOR = wks('iterator');
  var TAG = wks('toStringTag');
  var TYPED_CONSTRUCTOR = uid('typed_constructor');
  var DEF_CONSTRUCTOR = uid('def_constructor');
  var ALL_CONSTRUCTORS = $typed.CONSTR;
  var TYPED_ARRAY = $typed.TYPED;
  var VIEW = $typed.VIEW;
  var WRONG_LENGTH = 'Wrong length!';

  var $map = createArrayMethod(1, function (O, length) {
    return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
  });

  var LITTLE_ENDIAN = fails(function () {
    // eslint-disable-next-line no-undef
    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
  });

  var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
    new Uint8Array(1).set({});
  });

  var toOffset = function (it, BYTES) {
    var offset = toInteger(it);
    if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
    return offset;
  };

  var validate = function (it) {
    if (isObject(it) && TYPED_ARRAY in it) return it;
    throw TypeError(it + ' is not a typed array!');
  };

  var allocate = function (C, length) {
    if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
      throw TypeError('It is not a typed array constructor!');
    } return new C(length);
  };

  var speciesFromList = function (O, list) {
    return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
  };

  var fromList = function (C, list) {
    var index = 0;
    var length = list.length;
    var result = allocate(C, length);
    while (length > index) result[index] = list[index++];
    return result;
  };

  var addGetter = function (it, key, internal) {
    dP(it, key, { get: function () { return this._d[internal]; } });
  };

  var $from = function from(source /* , mapfn, thisArg */) {
    var O = toObject(source);
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var iterFn = getIterFn(O);
    var i, length, values, result, step, iterator;
    if (iterFn != undefined && !isArrayIter(iterFn)) {
      for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
        values.push(step.value);
      } O = values;
    }
    if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);
    for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
      result[i] = mapping ? mapfn(O[i], i) : O[i];
    }
    return result;
  };

  var $of = function of(/* ...items */) {
    var index = 0;
    var length = arguments.length;
    var result = allocate(this, length);
    while (length > index) result[index] = arguments[index++];
    return result;
  };

  // iOS Safari 6.x fails here
  var TO_LOCALE_BUG = !!Uint8Array && fails(function () { arrayToLocaleString.call(new Uint8Array(1)); });

  var $toLocaleString = function toLocaleString() {
    return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
  };

  var proto = {
    copyWithin: function copyWithin(target, start /* , end */) {
      return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
    },
    every: function every(callbackfn /* , thisArg */) {
      return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    fill: function fill(value /* , start, end */) { // eslint-disable-line no-unused-vars
      return arrayFill.apply(validate(this), arguments);
    },
    filter: function filter(callbackfn /* , thisArg */) {
      return speciesFromList(this, arrayFilter(validate(this), callbackfn,
        arguments.length > 1 ? arguments[1] : undefined));
    },
    find: function find(predicate /* , thisArg */) {
      return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    findIndex: function findIndex(predicate /* , thisArg */) {
      return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    forEach: function forEach(callbackfn /* , thisArg */) {
      arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    indexOf: function indexOf(searchElement /* , fromIndex */) {
      return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    includes: function includes(searchElement /* , fromIndex */) {
      return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    join: function join(separator) { // eslint-disable-line no-unused-vars
      return arrayJoin.apply(validate(this), arguments);
    },
    lastIndexOf: function lastIndexOf(searchElement /* , fromIndex */) { // eslint-disable-line no-unused-vars
      return arrayLastIndexOf.apply(validate(this), arguments);
    },
    map: function map(mapfn /* , thisArg */) {
      return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    reduce: function reduce(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
      return arrayReduce.apply(validate(this), arguments);
    },
    reduceRight: function reduceRight(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
      return arrayReduceRight.apply(validate(this), arguments);
    },
    reverse: function reverse() {
      var that = this;
      var length = validate(that).length;
      var middle = Math.floor(length / 2);
      var index = 0;
      var value;
      while (index < middle) {
        value = that[index];
        that[index++] = that[--length];
        that[length] = value;
      } return that;
    },
    some: function some(callbackfn /* , thisArg */) {
      return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    sort: function sort(comparefn) {
      return arraySort.call(validate(this), comparefn);
    },
    subarray: function subarray(begin, end) {
      var O = validate(this);
      var length = O.length;
      var $begin = toAbsoluteIndex(begin, length);
      return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
        O.buffer,
        O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
        toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin)
      );
    }
  };

  var $slice = function slice(start, end) {
    return speciesFromList(this, arraySlice.call(validate(this), start, end));
  };

  var $set = function set(arrayLike /* , offset */) {
    validate(this);
    var offset = toOffset(arguments[1], 1);
    var length = this.length;
    var src = toObject(arrayLike);
    var len = toLength(src.length);
    var index = 0;
    if (len + offset > length) throw RangeError(WRONG_LENGTH);
    while (index < len) this[offset + index] = src[index++];
  };

  var $iterators = {
    entries: function entries() {
      return arrayEntries.call(validate(this));
    },
    keys: function keys() {
      return arrayKeys.call(validate(this));
    },
    values: function values() {
      return arrayValues.call(validate(this));
    }
  };

  var isTAIndex = function (target, key) {
    return isObject(target)
      && target[TYPED_ARRAY]
      && typeof key != 'symbol'
      && key in target
      && String(+key) == String(key);
  };
  var $getDesc = function getOwnPropertyDescriptor(target, key) {
    return isTAIndex(target, key = toPrimitive(key, true))
      ? propertyDesc(2, target[key])
      : gOPD(target, key);
  };
  var $setDesc = function defineProperty(target, key, desc) {
    if (isTAIndex(target, key = toPrimitive(key, true))
      && isObject(desc)
      && has(desc, 'value')
      && !has(desc, 'get')
      && !has(desc, 'set')
      // TODO: add validation descriptor w/o calling accessors
      && !desc.configurable
      && (!has(desc, 'writable') || desc.writable)
      && (!has(desc, 'enumerable') || desc.enumerable)
    ) {
      target[key] = desc.value;
      return target;
    } return dP(target, key, desc);
  };

  if (!ALL_CONSTRUCTORS) {
    $GOPD.f = $getDesc;
    $DP.f = $setDesc;
  }

  $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
    getOwnPropertyDescriptor: $getDesc,
    defineProperty: $setDesc
  });

  if (fails(function () { arrayToString.call({}); })) {
    arrayToString = arrayToLocaleString = function toString() {
      return arrayJoin.call(this);
    };
  }

  var $TypedArrayPrototype$ = redefineAll({}, proto);
  redefineAll($TypedArrayPrototype$, $iterators);
  hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
  redefineAll($TypedArrayPrototype$, {
    slice: $slice,
    set: $set,
    constructor: function () { /* noop */ },
    toString: arrayToString,
    toLocaleString: $toLocaleString
  });
  addGetter($TypedArrayPrototype$, 'buffer', 'b');
  addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
  addGetter($TypedArrayPrototype$, 'byteLength', 'l');
  addGetter($TypedArrayPrototype$, 'length', 'e');
  dP($TypedArrayPrototype$, TAG, {
    get: function () { return this[TYPED_ARRAY]; }
  });

  // eslint-disable-next-line max-statements
  module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
    CLAMPED = !!CLAMPED;
    var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
    var GETTER = 'get' + KEY;
    var SETTER = 'set' + KEY;
    var TypedArray = global[NAME];
    var Base = TypedArray || {};
    var TAC = TypedArray && getPrototypeOf(TypedArray);
    var FORCED = !TypedArray || !$typed.ABV;
    var O = {};
    var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
    var getter = function (that, index) {
      var data = that._d;
      return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
    };
    var setter = function (that, index, value) {
      var data = that._d;
      if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
      data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
    };
    var addElement = function (that, index) {
      dP(that, index, {
        get: function () {
          return getter(this, index);
        },
        set: function (value) {
          return setter(this, index, value);
        },
        enumerable: true
      });
    };
    if (FORCED) {
      TypedArray = wrapper(function (that, data, $offset, $length) {
        anInstance(that, TypedArray, NAME, '_d');
        var index = 0;
        var offset = 0;
        var buffer, byteLength, length, klass;
        if (!isObject(data)) {
          length = toIndex(data);
          byteLength = length * BYTES;
          buffer = new $ArrayBuffer(byteLength);
        } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
          buffer = data;
          offset = toOffset($offset, BYTES);
          var $len = data.byteLength;
          if ($length === undefined) {
            if ($len % BYTES) throw RangeError(WRONG_LENGTH);
            byteLength = $len - offset;
            if (byteLength < 0) throw RangeError(WRONG_LENGTH);
          } else {
            byteLength = toLength($length) * BYTES;
            if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if (TYPED_ARRAY in data) {
          return fromList(TypedArray, data);
        } else {
          return $from.call(TypedArray, data);
        }
        hide(that, '_d', {
          b: buffer,
          o: offset,
          l: byteLength,
          e: length,
          v: new $DataView(buffer)
        });
        while (index < length) addElement(that, index++);
      });
      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
      hide(TypedArrayPrototype, 'constructor', TypedArray);
    } else if (!fails(function () {
      TypedArray(1);
    }) || !fails(function () {
      new TypedArray(-1); // eslint-disable-line no-new
    }) || !$iterDetect(function (iter) {
      new TypedArray(); // eslint-disable-line no-new
      new TypedArray(null); // eslint-disable-line no-new
      new TypedArray(1.5); // eslint-disable-line no-new
      new TypedArray(iter); // eslint-disable-line no-new
    }, true)) {
      TypedArray = wrapper(function (that, data, $offset, $length) {
        anInstance(that, TypedArray, NAME);
        var klass;
        // `ws` module bug, temporarily remove validation length for Uint8Array
        // https://github.com/websockets/ws/pull/645
        if (!isObject(data)) return new Base(toIndex(data));
        if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
          return $length !== undefined
            ? new Base(data, toOffset($offset, BYTES), $length)
            : $offset !== undefined
              ? new Base(data, toOffset($offset, BYTES))
              : new Base(data);
        }
        if (TYPED_ARRAY in data) return fromList(TypedArray, data);
        return $from.call(TypedArray, data);
      });
      arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
        if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
      });
      TypedArray[PROTOTYPE] = TypedArrayPrototype;
      if (!LIBRARY) TypedArrayPrototype.constructor = TypedArray;
    }
    var $nativeIterator = TypedArrayPrototype[ITERATOR];
    var CORRECT_ITER_NAME = !!$nativeIterator
      && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
    var $iterator = $iterators.values;
    hide(TypedArray, TYPED_CONSTRUCTOR, true);
    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
    hide(TypedArrayPrototype, VIEW, true);
    hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

    if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
      dP(TypedArrayPrototype, TAG, {
        get: function () { return NAME; }
      });
    }

    O[NAME] = TypedArray;

    $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

    $export($export.S, NAME, {
      BYTES_PER_ELEMENT: BYTES
    });

    $export($export.S + $export.F * fails(function () { Base.of.call(TypedArray, 1); }), NAME, {
      from: $from,
      of: $of
    });

    if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

    $export($export.P, NAME, proto);

    setSpecies(NAME);

    $export($export.P + $export.F * FORCED_SET, NAME, { set: $set });

    $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

    if (!LIBRARY && TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;

    $export($export.P + $export.F * fails(function () {
      new TypedArray(1).slice();
    }), NAME, { slice: $slice });

    $export($export.P + $export.F * (fails(function () {
      return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
    }) || !fails(function () {
      TypedArrayPrototype.toLocaleString.call([1, 2]);
    })), NAME, { toLocaleString: $toLocaleString });

    Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
    if (!LIBRARY && !CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
  };
} else module.exports = function () { /* empty */ };

},{"./_an-instance":27,"./_array-copy-within":29,"./_array-fill":30,"./_array-includes":31,"./_array-methods":32,"./_classof":36,"./_ctx":43,"./_descriptors":45,"./_export":49,"./_fails":51,"./_global":55,"./_has":56,"./_hide":57,"./_is-array-iter":63,"./_is-object":66,"./_iter-detect":71,"./_iterators":73,"./_library":74,"./_object-create":83,"./_object-dp":84,"./_object-gopd":86,"./_object-gopn":88,"./_object-gpo":90,"./_property-desc":99,"./_redefine-all":100,"./_set-species":104,"./_species-constructor":108,"./_to-absolute-index":114,"./_to-index":115,"./_to-integer":116,"./_to-length":118,"./_to-object":119,"./_to-primitive":120,"./_typed":123,"./_typed-buffer":122,"./_uid":124,"./_wks":128,"./core.get-iterator-method":129,"./es6.array.iterator":135}],122:[function(require,module,exports){
'use strict';
var global = require('./_global');
var DESCRIPTORS = require('./_descriptors');
var LIBRARY = require('./_library');
var $typed = require('./_typed');
var hide = require('./_hide');
var redefineAll = require('./_redefine-all');
var fails = require('./_fails');
var anInstance = require('./_an-instance');
var toInteger = require('./_to-integer');
var toLength = require('./_to-length');
var toIndex = require('./_to-index');
var gOPN = require('./_object-gopn').f;
var dP = require('./_object-dp').f;
var arrayFill = require('./_array-fill');
var setToStringTag = require('./_set-to-string-tag');
var ARRAY_BUFFER = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE = 'prototype';
var WRONG_LENGTH = 'Wrong length!';
var WRONG_INDEX = 'Wrong index!';
var $ArrayBuffer = global[ARRAY_BUFFER];
var $DataView = global[DATA_VIEW];
var Math = global.Math;
var RangeError = global.RangeError;
// eslint-disable-next-line no-shadow-restricted-names
var Infinity = global.Infinity;
var BaseBuffer = $ArrayBuffer;
var abs = Math.abs;
var pow = Math.pow;
var floor = Math.floor;
var log = Math.log;
var LN2 = Math.LN2;
var BUFFER = 'buffer';
var BYTE_LENGTH = 'byteLength';
var BYTE_OFFSET = 'byteOffset';
var $BUFFER = DESCRIPTORS ? '_b' : BUFFER;
var $LENGTH = DESCRIPTORS ? '_l' : BYTE_LENGTH;
var $OFFSET = DESCRIPTORS ? '_o' : BYTE_OFFSET;

// IEEE754 conversions based on https://github.com/feross/ieee754
function packIEEE754(value, mLen, nBytes) {
  var buffer = Array(nBytes);
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
  var i = 0;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  var e, m, c;
  value = abs(value);
  // eslint-disable-next-line no-self-compare
  if (value != value || value === Infinity) {
    // eslint-disable-next-line no-self-compare
    m = value != value ? 1 : 0;
    e = eMax;
  } else {
    e = floor(log(value) / LN2);
    if (value * (c = pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }
    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * pow(2, eBias - 1) * pow(2, mLen);
      e = 0;
    }
  }
  for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
  buffer[--i] |= s * 128;
  return buffer;
}
function unpackIEEE754(buffer, mLen, nBytes) {
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = eLen - 7;
  var i = nBytes - 1;
  var s = buffer[i--];
  var e = s & 127;
  var m;
  s >>= 7;
  for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : s ? -Infinity : Infinity;
  } else {
    m = m + pow(2, mLen);
    e = e - eBias;
  } return (s ? -1 : 1) * m * pow(2, e - mLen);
}

function unpackI32(bytes) {
  return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
}
function packI8(it) {
  return [it & 0xff];
}
function packI16(it) {
  return [it & 0xff, it >> 8 & 0xff];
}
function packI32(it) {
  return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
}
function packF64(it) {
  return packIEEE754(it, 52, 8);
}
function packF32(it) {
  return packIEEE754(it, 23, 4);
}

function addGetter(C, key, internal) {
  dP(C[PROTOTYPE], key, { get: function () { return this[internal]; } });
}

function get(view, bytes, index, isLittleEndian) {
  var numIndex = +index;
  var intIndex = toIndex(numIndex);
  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b;
  var start = intIndex + view[$OFFSET];
  var pack = store.slice(start, start + bytes);
  return isLittleEndian ? pack : pack.reverse();
}
function set(view, bytes, index, conversion, value, isLittleEndian) {
  var numIndex = +index;
  var intIndex = toIndex(numIndex);
  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b;
  var start = intIndex + view[$OFFSET];
  var pack = conversion(+value);
  for (var i = 0; i < bytes; i++) store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
}

if (!$typed.ABV) {
  $ArrayBuffer = function ArrayBuffer(length) {
    anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
    var byteLength = toIndex(length);
    this._b = arrayFill.call(Array(byteLength), 0);
    this[$LENGTH] = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength) {
    anInstance(this, $DataView, DATA_VIEW);
    anInstance(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = buffer[$LENGTH];
    var offset = toInteger(byteOffset);
    if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
    if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
    this[$BUFFER] = buffer;
    this[$OFFSET] = offset;
    this[$LENGTH] = byteLength;
  };

  if (DESCRIPTORS) {
    addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
    addGetter($DataView, BUFFER, '_b');
    addGetter($DataView, BYTE_LENGTH, '_l');
    addGetter($DataView, BYTE_OFFSET, '_o');
  }

  redefineAll($DataView[PROTOTYPE], {
    getInt8: function getInt8(byteOffset) {
      return get(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset) {
      return get(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /* , littleEndian */) {
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /* , littleEndian */) {
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /* , littleEndian */) {
      return unpackI32(get(this, 4, byteOffset, arguments[1]));
    },
    getUint32: function getUint32(byteOffset /* , littleEndian */) {
      return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
    },
    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
    },
    setInt8: function setInt8(byteOffset, value) {
      set(this, 1, byteOffset, packI8, value);
    },
    setUint8: function setUint8(byteOffset, value) {
      set(this, 1, byteOffset, packI8, value);
    },
    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packF32, value, arguments[2]);
    },
    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
      set(this, 8, byteOffset, packF64, value, arguments[2]);
    }
  });
} else {
  if (!fails(function () {
    $ArrayBuffer(1);
  }) || !fails(function () {
    new $ArrayBuffer(-1); // eslint-disable-line no-new
  }) || fails(function () {
    new $ArrayBuffer(); // eslint-disable-line no-new
    new $ArrayBuffer(1.5); // eslint-disable-line no-new
    new $ArrayBuffer(NaN); // eslint-disable-line no-new
    return $ArrayBuffer.name != ARRAY_BUFFER;
  })) {
    $ArrayBuffer = function ArrayBuffer(length) {
      anInstance(this, $ArrayBuffer);
      return new BaseBuffer(toIndex(length));
    };
    var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
    for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
      if (!((key = keys[j++]) in $ArrayBuffer)) hide($ArrayBuffer, key, BaseBuffer[key]);
    }
    if (!LIBRARY) ArrayBufferProto.constructor = $ArrayBuffer;
  }
  // iOS Safari 7.x bug
  var view = new $DataView(new $ArrayBuffer(2));
  var $setInt8 = $DataView[PROTOTYPE].setInt8;
  view.setInt8(0, 2147483648);
  view.setInt8(1, 2147483649);
  if (view.getInt8(0) || !view.getInt8(1)) redefineAll($DataView[PROTOTYPE], {
    setInt8: function setInt8(byteOffset, value) {
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value) {
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    }
  }, true);
}
setToStringTag($ArrayBuffer, ARRAY_BUFFER);
setToStringTag($DataView, DATA_VIEW);
hide($DataView[PROTOTYPE], $typed.VIEW, true);
exports[ARRAY_BUFFER] = $ArrayBuffer;
exports[DATA_VIEW] = $DataView;

},{"./_an-instance":27,"./_array-fill":30,"./_descriptors":45,"./_fails":51,"./_global":55,"./_hide":57,"./_library":74,"./_object-dp":84,"./_object-gopn":88,"./_redefine-all":100,"./_set-to-string-tag":105,"./_to-index":115,"./_to-integer":116,"./_to-length":118,"./_typed":123}],123:[function(require,module,exports){
var global = require('./_global');
var hide = require('./_hide');
var uid = require('./_uid');
var TYPED = uid('typed_array');
var VIEW = uid('view');
var ABV = !!(global.ArrayBuffer && global.DataView);
var CONSTR = ABV;
var i = 0;
var l = 9;
var Typed;

var TypedArrayConstructors = (
  'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
).split(',');

while (i < l) {
  if (Typed = global[TypedArrayConstructors[i++]]) {
    hide(Typed.prototype, TYPED, true);
    hide(Typed.prototype, VIEW, true);
  } else CONSTR = false;
}

module.exports = {
  ABV: ABV,
  CONSTR: CONSTR,
  TYPED: TYPED,
  VIEW: VIEW
};

},{"./_global":55,"./_hide":57,"./_uid":124}],124:[function(require,module,exports){
var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

},{}],125:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function (it, TYPE) {
  if (!isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

},{"./_is-object":66}],126:[function(require,module,exports){
var global = require('./_global');
var core = require('./_core');
var LIBRARY = require('./_library');
var wksExt = require('./_wks-ext');
var defineProperty = require('./_object-dp').f;
module.exports = function (name) {
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
};

},{"./_core":41,"./_global":55,"./_library":74,"./_object-dp":84,"./_wks-ext":127}],127:[function(require,module,exports){
exports.f = require('./_wks');

},{"./_wks":128}],128:[function(require,module,exports){
var store = require('./_shared')('wks');
var uid = require('./_uid');
var Symbol = require('./_global').Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;

},{"./_global":55,"./_shared":107,"./_uid":124}],129:[function(require,module,exports){
var classof = require('./_classof');
var ITERATOR = require('./_wks')('iterator');
var Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};

},{"./_classof":36,"./_core":41,"./_iterators":73,"./_wks":128}],130:[function(require,module,exports){
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
var $export = require('./_export');

$export($export.P, 'Array', { copyWithin: require('./_array-copy-within') });

require('./_add-to-unscopables')('copyWithin');

},{"./_add-to-unscopables":26,"./_array-copy-within":29,"./_export":49}],131:[function(require,module,exports){
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
var $export = require('./_export');

$export($export.P, 'Array', { fill: require('./_array-fill') });

require('./_add-to-unscopables')('fill');

},{"./_add-to-unscopables":26,"./_array-fill":30,"./_export":49}],132:[function(require,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var $export = require('./_export');
var $find = require('./_array-methods')(6);
var KEY = 'findIndex';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./_add-to-unscopables')(KEY);

},{"./_add-to-unscopables":26,"./_array-methods":32,"./_export":49}],133:[function(require,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = require('./_export');
var $find = require('./_array-methods')(5);
var KEY = 'find';
var forced = true;
// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
require('./_add-to-unscopables')(KEY);

},{"./_add-to-unscopables":26,"./_array-methods":32,"./_export":49}],134:[function(require,module,exports){
'use strict';
var ctx = require('./_ctx');
var $export = require('./_export');
var toObject = require('./_to-object');
var call = require('./_iter-call');
var isArrayIter = require('./_is-array-iter');
var toLength = require('./_to-length');
var createProperty = require('./_create-property');
var getIterFn = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = getIterFn(O);
    var length, result, step, iterator;
    if (mapping) mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for (result = new C(length); length > index; index++) {
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":42,"./_ctx":43,"./_export":49,"./_is-array-iter":63,"./_iter-call":68,"./_iter-detect":71,"./_to-length":118,"./_to-object":119,"./core.get-iterator-method":129}],135:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables');
var step = require('./_iter-step');
var Iterators = require('./_iterators');
var toIObject = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');

},{"./_add-to-unscopables":26,"./_iter-define":70,"./_iter-step":72,"./_iterators":73,"./_to-iobject":117}],136:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var createProperty = require('./_create-property');

// WebKit Array.of isn't generic
$export($export.S + $export.F * require('./_fails')(function () {
  function F() { /* empty */ }
  return !(Array.of.call(F) instanceof F);
}), 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of(/* ...args */) {
    var index = 0;
    var aLen = arguments.length;
    var result = new (typeof this == 'function' ? this : Array)(aLen);
    while (aLen > index) createProperty(result, index, arguments[index++]);
    result.length = aLen;
    return result;
  }
});

},{"./_create-property":42,"./_export":49,"./_fails":51}],137:[function(require,module,exports){
var dP = require('./_object-dp').f;
var FProto = Function.prototype;
var nameRE = /^\s*function ([^ (]*)/;
var NAME = 'name';

// 19.2.4.2 name
NAME in FProto || require('./_descriptors') && dP(FProto, NAME, {
  configurable: true,
  get: function () {
    try {
      return ('' + this).match(nameRE)[1];
    } catch (e) {
      return '';
    }
  }
});

},{"./_descriptors":45,"./_object-dp":84}],138:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');
var validate = require('./_validate-collection');
var MAP = 'Map';

// 23.1 Map Objects
module.exports = require('./_collection')(MAP, function (get) {
  return function Map() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key) {
    var entry = strong.getEntry(validate(this, MAP), key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value) {
    return strong.def(validate(this, MAP), key === 0 ? 0 : key, value);
  }
}, strong, true);

},{"./_collection":40,"./_collection-strong":38,"./_validate-collection":125}],139:[function(require,module,exports){
// 20.2.2.3 Math.acosh(x)
var $export = require('./_export');
var log1p = require('./_math-log1p');
var sqrt = Math.sqrt;
var $acosh = Math.acosh;

$export($export.S + $export.F * !($acosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  && Math.floor($acosh(Number.MAX_VALUE)) == 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN
  && $acosh(Infinity) == Infinity
), 'Math', {
  acosh: function acosh(x) {
    return (x = +x) < 1 ? NaN : x > 94906265.62425156
      ? Math.log(x) + Math.LN2
      : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
  }
});

},{"./_export":49,"./_math-log1p":77}],140:[function(require,module,exports){
// 20.2.2.5 Math.asinh(x)
var $export = require('./_export');
var $asinh = Math.asinh;

function asinh(x) {
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
}

// Tor Browser bug: Math.asinh(0) -> -0
$export($export.S + $export.F * !($asinh && 1 / $asinh(0) > 0), 'Math', { asinh: asinh });

},{"./_export":49}],141:[function(require,module,exports){
// 20.2.2.7 Math.atanh(x)
var $export = require('./_export');
var $atanh = Math.atanh;

// Tor Browser bug: Math.atanh(-0) -> 0
$export($export.S + $export.F * !($atanh && 1 / $atanh(-0) < 0), 'Math', {
  atanh: function atanh(x) {
    return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
  }
});

},{"./_export":49}],142:[function(require,module,exports){
// 20.2.2.9 Math.cbrt(x)
var $export = require('./_export');
var sign = require('./_math-sign');

$export($export.S, 'Math', {
  cbrt: function cbrt(x) {
    return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
  }
});

},{"./_export":49,"./_math-sign":78}],143:[function(require,module,exports){
// 20.2.2.11 Math.clz32(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  clz32: function clz32(x) {
    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
  }
});

},{"./_export":49}],144:[function(require,module,exports){
// 20.2.2.12 Math.cosh(x)
var $export = require('./_export');
var exp = Math.exp;

$export($export.S, 'Math', {
  cosh: function cosh(x) {
    return (exp(x = +x) + exp(-x)) / 2;
  }
});

},{"./_export":49}],145:[function(require,module,exports){
// 20.2.2.14 Math.expm1(x)
var $export = require('./_export');
var $expm1 = require('./_math-expm1');

$export($export.S + $export.F * ($expm1 != Math.expm1), 'Math', { expm1: $expm1 });

},{"./_export":49,"./_math-expm1":75}],146:[function(require,module,exports){
// 20.2.2.16 Math.fround(x)
var $export = require('./_export');

$export($export.S, 'Math', { fround: require('./_math-fround') });

},{"./_export":49,"./_math-fround":76}],147:[function(require,module,exports){
// 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
var $export = require('./_export');
var abs = Math.abs;

$export($export.S, 'Math', {
  hypot: function hypot(value1, value2) { // eslint-disable-line no-unused-vars
    var sum = 0;
    var i = 0;
    var aLen = arguments.length;
    var larg = 0;
    var arg, div;
    while (i < aLen) {
      arg = abs(arguments[i++]);
      if (larg < arg) {
        div = larg / arg;
        sum = sum * div * div + 1;
        larg = arg;
      } else if (arg > 0) {
        div = arg / larg;
        sum += div * div;
      } else sum += arg;
    }
    return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
  }
});

},{"./_export":49}],148:[function(require,module,exports){
// 20.2.2.18 Math.imul(x, y)
var $export = require('./_export');
var $imul = Math.imul;

// some WebKit versions fails with big numbers, some has wrong arity
$export($export.S + $export.F * require('./_fails')(function () {
  return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
}), 'Math', {
  imul: function imul(x, y) {
    var UINT16 = 0xffff;
    var xn = +x;
    var yn = +y;
    var xl = UINT16 & xn;
    var yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});

},{"./_export":49,"./_fails":51}],149:[function(require,module,exports){
// 20.2.2.21 Math.log10(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  log10: function log10(x) {
    return Math.log(x) * Math.LOG10E;
  }
});

},{"./_export":49}],150:[function(require,module,exports){
// 20.2.2.20 Math.log1p(x)
var $export = require('./_export');

$export($export.S, 'Math', { log1p: require('./_math-log1p') });

},{"./_export":49,"./_math-log1p":77}],151:[function(require,module,exports){
// 20.2.2.22 Math.log2(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  log2: function log2(x) {
    return Math.log(x) / Math.LN2;
  }
});

},{"./_export":49}],152:[function(require,module,exports){
// 20.2.2.28 Math.sign(x)
var $export = require('./_export');

$export($export.S, 'Math', { sign: require('./_math-sign') });

},{"./_export":49,"./_math-sign":78}],153:[function(require,module,exports){
// 20.2.2.30 Math.sinh(x)
var $export = require('./_export');
var expm1 = require('./_math-expm1');
var exp = Math.exp;

// V8 near Chromium 38 has a problem with very small numbers
$export($export.S + $export.F * require('./_fails')(function () {
  return !Math.sinh(-2e-17) != -2e-17;
}), 'Math', {
  sinh: function sinh(x) {
    return Math.abs(x = +x) < 1
      ? (expm1(x) - expm1(-x)) / 2
      : (exp(x - 1) - exp(-x - 1)) * (Math.E / 2);
  }
});

},{"./_export":49,"./_fails":51,"./_math-expm1":75}],154:[function(require,module,exports){
// 20.2.2.33 Math.tanh(x)
var $export = require('./_export');
var expm1 = require('./_math-expm1');
var exp = Math.exp;

$export($export.S, 'Math', {
  tanh: function tanh(x) {
    var a = expm1(x = +x);
    var b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  }
});

},{"./_export":49,"./_math-expm1":75}],155:[function(require,module,exports){
// 20.2.2.34 Math.trunc(x)
var $export = require('./_export');

$export($export.S, 'Math', {
  trunc: function trunc(it) {
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});

},{"./_export":49}],156:[function(require,module,exports){
// 20.1.2.1 Number.EPSILON
var $export = require('./_export');

$export($export.S, 'Number', { EPSILON: Math.pow(2, -52) });

},{"./_export":49}],157:[function(require,module,exports){
// 20.1.2.2 Number.isFinite(number)
var $export = require('./_export');
var _isFinite = require('./_global').isFinite;

$export($export.S, 'Number', {
  isFinite: function isFinite(it) {
    return typeof it == 'number' && _isFinite(it);
  }
});

},{"./_export":49,"./_global":55}],158:[function(require,module,exports){
// 20.1.2.3 Number.isInteger(number)
var $export = require('./_export');

$export($export.S, 'Number', { isInteger: require('./_is-integer') });

},{"./_export":49,"./_is-integer":65}],159:[function(require,module,exports){
// 20.1.2.4 Number.isNaN(number)
var $export = require('./_export');

$export($export.S, 'Number', {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare
    return number != number;
  }
});

},{"./_export":49}],160:[function(require,module,exports){
// 20.1.2.5 Number.isSafeInteger(number)
var $export = require('./_export');
var isInteger = require('./_is-integer');
var abs = Math.abs;

$export($export.S, 'Number', {
  isSafeInteger: function isSafeInteger(number) {
    return isInteger(number) && abs(number) <= 0x1fffffffffffff;
  }
});

},{"./_export":49,"./_is-integer":65}],161:[function(require,module,exports){
// 20.1.2.6 Number.MAX_SAFE_INTEGER
var $export = require('./_export');

$export($export.S, 'Number', { MAX_SAFE_INTEGER: 0x1fffffffffffff });

},{"./_export":49}],162:[function(require,module,exports){
// 20.1.2.10 Number.MIN_SAFE_INTEGER
var $export = require('./_export');

$export($export.S, 'Number', { MIN_SAFE_INTEGER: -0x1fffffffffffff });

},{"./_export":49}],163:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', { assign: require('./_object-assign') });

},{"./_export":49,"./_object-assign":82}],164:[function(require,module,exports){
// 19.1.2.5 Object.freeze(O)
var isObject = require('./_is-object');
var meta = require('./_meta').onFreeze;

require('./_object-sap')('freeze', function ($freeze) {
  return function freeze(it) {
    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
  };
});

},{"./_is-object":66,"./_meta":79,"./_object-sap":94}],165:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = require('./_to-iobject');
var $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function () {
  return function getOwnPropertyDescriptor(it, key) {
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});

},{"./_object-gopd":86,"./_object-sap":94,"./_to-iobject":117}],166:[function(require,module,exports){
// 19.1.2.7 Object.getOwnPropertyNames(O)
require('./_object-sap')('getOwnPropertyNames', function () {
  return require('./_object-gopn-ext').f;
});

},{"./_object-gopn-ext":87,"./_object-sap":94}],167:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('./_to-object');
var $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function () {
  return function getPrototypeOf(it) {
    return $getPrototypeOf(toObject(it));
  };
});

},{"./_object-gpo":90,"./_object-sap":94,"./_to-object":119}],168:[function(require,module,exports){
// 19.1.2.11 Object.isExtensible(O)
var isObject = require('./_is-object');

require('./_object-sap')('isExtensible', function ($isExtensible) {
  return function isExtensible(it) {
    return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
  };
});

},{"./_is-object":66,"./_object-sap":94}],169:[function(require,module,exports){
// 19.1.2.12 Object.isFrozen(O)
var isObject = require('./_is-object');

require('./_object-sap')('isFrozen', function ($isFrozen) {
  return function isFrozen(it) {
    return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
  };
});

},{"./_is-object":66,"./_object-sap":94}],170:[function(require,module,exports){
// 19.1.2.13 Object.isSealed(O)
var isObject = require('./_is-object');

require('./_object-sap')('isSealed', function ($isSealed) {
  return function isSealed(it) {
    return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
  };
});

},{"./_is-object":66,"./_object-sap":94}],171:[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $export = require('./_export');
$export($export.S, 'Object', { is: require('./_same-value') });

},{"./_export":49,"./_same-value":102}],172:[function(require,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = require('./_to-object');
var $keys = require('./_object-keys');

require('./_object-sap')('keys', function () {
  return function keys(it) {
    return $keys(toObject(it));
  };
});

},{"./_object-keys":92,"./_object-sap":94,"./_to-object":119}],173:[function(require,module,exports){
// 19.1.2.15 Object.preventExtensions(O)
var isObject = require('./_is-object');
var meta = require('./_meta').onFreeze;

require('./_object-sap')('preventExtensions', function ($preventExtensions) {
  return function preventExtensions(it) {
    return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
  };
});

},{"./_is-object":66,"./_meta":79,"./_object-sap":94}],174:[function(require,module,exports){
// 19.1.2.17 Object.seal(O)
var isObject = require('./_is-object');
var meta = require('./_meta').onFreeze;

require('./_object-sap')('seal', function ($seal) {
  return function seal(it) {
    return $seal && isObject(it) ? $seal(meta(it)) : it;
  };
});

},{"./_is-object":66,"./_meta":79,"./_object-sap":94}],175:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', { setPrototypeOf: require('./_set-proto').set });

},{"./_export":49,"./_set-proto":103}],176:[function(require,module,exports){
'use strict';
var LIBRARY = require('./_library');
var global = require('./_global');
var ctx = require('./_ctx');
var classof = require('./_classof');
var $export = require('./_export');
var isObject = require('./_is-object');
var aFunction = require('./_a-function');
var anInstance = require('./_an-instance');
var forOf = require('./_for-of');
var speciesConstructor = require('./_species-constructor');
var task = require('./_task').set;
var microtask = require('./_microtask')();
var newPromiseCapabilityModule = require('./_new-promise-capability');
var perform = require('./_perform');
var promiseResolve = require('./_promise-resolve');
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value);
            if (domain) domain.exit();
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  if (promise._h == 1) return false;
  var chain = promise._a || promise._c;
  var i = 0;
  var reaction;
  while (chain.length > i) {
    reaction = chain[i++];
    if (reaction.fail || !isUnhandled(reaction.promise)) return false;
  } return true;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

},{"./_a-function":25,"./_an-instance":27,"./_classof":36,"./_core":41,"./_ctx":43,"./_export":49,"./_for-of":54,"./_global":55,"./_is-object":66,"./_iter-detect":71,"./_library":74,"./_microtask":80,"./_new-promise-capability":81,"./_perform":97,"./_promise-resolve":98,"./_redefine-all":100,"./_set-species":104,"./_set-to-string-tag":105,"./_species-constructor":108,"./_task":113,"./_wks":128}],177:[function(require,module,exports){
// 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
var $export = require('./_export');
var aFunction = require('./_a-function');
var anObject = require('./_an-object');
var rApply = (require('./_global').Reflect || {}).apply;
var fApply = Function.apply;
// MS Edge argumentsList argument is optional
$export($export.S + $export.F * !require('./_fails')(function () {
  rApply(function () { /* empty */ });
}), 'Reflect', {
  apply: function apply(target, thisArgument, argumentsList) {
    var T = aFunction(target);
    var L = anObject(argumentsList);
    return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
  }
});

},{"./_a-function":25,"./_an-object":28,"./_export":49,"./_fails":51,"./_global":55}],178:[function(require,module,exports){
// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
var $export = require('./_export');
var create = require('./_object-create');
var aFunction = require('./_a-function');
var anObject = require('./_an-object');
var isObject = require('./_is-object');
var fails = require('./_fails');
var bind = require('./_bind');
var rConstruct = (require('./_global').Reflect || {}).construct;

// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails(function () {
  function F() { /* empty */ }
  return !(rConstruct(function () { /* empty */ }, [], F) instanceof F);
});
var ARGS_BUG = !fails(function () {
  rConstruct(function () { /* empty */ });
});

$export($export.S + $export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
  construct: function construct(Target, args /* , newTarget */) {
    aFunction(Target);
    anObject(args);
    var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
    if (ARGS_BUG && !NEW_TARGET_BUG) return rConstruct(Target, args, newTarget);
    if (Target == newTarget) {
      // w/o altered newTarget, optimization for 0-4 arguments
      switch (args.length) {
        case 0: return new Target();
        case 1: return new Target(args[0]);
        case 2: return new Target(args[0], args[1]);
        case 3: return new Target(args[0], args[1], args[2]);
        case 4: return new Target(args[0], args[1], args[2], args[3]);
      }
      // w/o altered newTarget, lot of arguments case
      var $args = [null];
      $args.push.apply($args, args);
      return new (bind.apply(Target, $args))();
    }
    // with altered newTarget, not support built-in constructors
    var proto = newTarget.prototype;
    var instance = create(isObject(proto) ? proto : Object.prototype);
    var result = Function.apply.call(Target, instance, args);
    return isObject(result) ? result : instance;
  }
});

},{"./_a-function":25,"./_an-object":28,"./_bind":35,"./_export":49,"./_fails":51,"./_global":55,"./_is-object":66,"./_object-create":83}],179:[function(require,module,exports){
// 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
var dP = require('./_object-dp');
var $export = require('./_export');
var anObject = require('./_an-object');
var toPrimitive = require('./_to-primitive');

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
$export($export.S + $export.F * require('./_fails')(function () {
  // eslint-disable-next-line no-undef
  Reflect.defineProperty(dP.f({}, 1, { value: 1 }), 1, { value: 2 });
}), 'Reflect', {
  defineProperty: function defineProperty(target, propertyKey, attributes) {
    anObject(target);
    propertyKey = toPrimitive(propertyKey, true);
    anObject(attributes);
    try {
      dP.f(target, propertyKey, attributes);
      return true;
    } catch (e) {
      return false;
    }
  }
});

},{"./_an-object":28,"./_export":49,"./_fails":51,"./_object-dp":84,"./_to-primitive":120}],180:[function(require,module,exports){
// 26.1.4 Reflect.deleteProperty(target, propertyKey)
var $export = require('./_export');
var gOPD = require('./_object-gopd').f;
var anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  deleteProperty: function deleteProperty(target, propertyKey) {
    var desc = gOPD(anObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  }
});

},{"./_an-object":28,"./_export":49,"./_object-gopd":86}],181:[function(require,module,exports){
// 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
var gOPD = require('./_object-gopd');
var $export = require('./_export');
var anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey) {
    return gOPD.f(anObject(target), propertyKey);
  }
});

},{"./_an-object":28,"./_export":49,"./_object-gopd":86}],182:[function(require,module,exports){
// 26.1.8 Reflect.getPrototypeOf(target)
var $export = require('./_export');
var getProto = require('./_object-gpo');
var anObject = require('./_an-object');

$export($export.S, 'Reflect', {
  getPrototypeOf: function getPrototypeOf(target) {
    return getProto(anObject(target));
  }
});

},{"./_an-object":28,"./_export":49,"./_object-gpo":90}],183:[function(require,module,exports){
// 26.1.6 Reflect.get(target, propertyKey [, receiver])
var gOPD = require('./_object-gopd');
var getPrototypeOf = require('./_object-gpo');
var has = require('./_has');
var $export = require('./_export');
var isObject = require('./_is-object');
var anObject = require('./_an-object');

function get(target, propertyKey /* , receiver */) {
  var receiver = arguments.length < 3 ? target : arguments[2];
  var desc, proto;
  if (anObject(target) === receiver) return target[propertyKey];
  if (desc = gOPD.f(target, propertyKey)) return has(desc, 'value')
    ? desc.value
    : desc.get !== undefined
      ? desc.get.call(receiver)
      : undefined;
  if (isObject(proto = getPrototypeOf(target))) return get(proto, propertyKey, receiver);
}

$export($export.S, 'Reflect', { get: get });

},{"./_an-object":28,"./_export":49,"./_has":56,"./_is-object":66,"./_object-gopd":86,"./_object-gpo":90}],184:[function(require,module,exports){
// 26.1.9 Reflect.has(target, propertyKey)
var $export = require('./_export');

$export($export.S, 'Reflect', {
  has: function has(target, propertyKey) {
    return propertyKey in target;
  }
});

},{"./_export":49}],185:[function(require,module,exports){
// 26.1.10 Reflect.isExtensible(target)
var $export = require('./_export');
var anObject = require('./_an-object');
var $isExtensible = Object.isExtensible;

$export($export.S, 'Reflect', {
  isExtensible: function isExtensible(target) {
    anObject(target);
    return $isExtensible ? $isExtensible(target) : true;
  }
});

},{"./_an-object":28,"./_export":49}],186:[function(require,module,exports){
// 26.1.11 Reflect.ownKeys(target)
var $export = require('./_export');

$export($export.S, 'Reflect', { ownKeys: require('./_own-keys') });

},{"./_export":49,"./_own-keys":96}],187:[function(require,module,exports){
// 26.1.12 Reflect.preventExtensions(target)
var $export = require('./_export');
var anObject = require('./_an-object');
var $preventExtensions = Object.preventExtensions;

$export($export.S, 'Reflect', {
  preventExtensions: function preventExtensions(target) {
    anObject(target);
    try {
      if ($preventExtensions) $preventExtensions(target);
      return true;
    } catch (e) {
      return false;
    }
  }
});

},{"./_an-object":28,"./_export":49}],188:[function(require,module,exports){
// 26.1.14 Reflect.setPrototypeOf(target, proto)
var $export = require('./_export');
var setProto = require('./_set-proto');

if (setProto) $export($export.S, 'Reflect', {
  setPrototypeOf: function setPrototypeOf(target, proto) {
    setProto.check(target, proto);
    try {
      setProto.set(target, proto);
      return true;
    } catch (e) {
      return false;
    }
  }
});

},{"./_export":49,"./_set-proto":103}],189:[function(require,module,exports){
// 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
var dP = require('./_object-dp');
var gOPD = require('./_object-gopd');
var getPrototypeOf = require('./_object-gpo');
var has = require('./_has');
var $export = require('./_export');
var createDesc = require('./_property-desc');
var anObject = require('./_an-object');
var isObject = require('./_is-object');

function set(target, propertyKey, V /* , receiver */) {
  var receiver = arguments.length < 4 ? target : arguments[3];
  var ownDesc = gOPD.f(anObject(target), propertyKey);
  var existingDescriptor, proto;
  if (!ownDesc) {
    if (isObject(proto = getPrototypeOf(target))) {
      return set(proto, propertyKey, V, receiver);
    }
    ownDesc = createDesc(0);
  }
  if (has(ownDesc, 'value')) {
    if (ownDesc.writable === false || !isObject(receiver)) return false;
    existingDescriptor = gOPD.f(receiver, propertyKey) || createDesc(0);
    existingDescriptor.value = V;
    dP.f(receiver, propertyKey, existingDescriptor);
    return true;
  }
  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
}

$export($export.S, 'Reflect', { set: set });

},{"./_an-object":28,"./_export":49,"./_has":56,"./_is-object":66,"./_object-dp":84,"./_object-gopd":86,"./_object-gpo":90,"./_property-desc":99}],190:[function(require,module,exports){
// 21.2.5.3 get RegExp.prototype.flags()
if (require('./_descriptors') && /./g.flags != 'g') require('./_object-dp').f(RegExp.prototype, 'flags', {
  configurable: true,
  get: require('./_flags')
});

},{"./_descriptors":45,"./_flags":53,"./_object-dp":84}],191:[function(require,module,exports){
// @@match logic
require('./_fix-re-wks')('match', 1, function (defined, MATCH, $match) {
  // 21.1.3.11 String.prototype.match(regexp)
  return [function match(regexp) {
    'use strict';
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, $match];
});

},{"./_fix-re-wks":52}],192:[function(require,module,exports){
// @@replace logic
require('./_fix-re-wks')('replace', 2, function (defined, REPLACE, $replace) {
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  return [function replace(searchValue, replaceValue) {
    'use strict';
    var O = defined(this);
    var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined
      ? fn.call(searchValue, O, replaceValue)
      : $replace.call(String(O), searchValue, replaceValue);
  }, $replace];
});

},{"./_fix-re-wks":52}],193:[function(require,module,exports){
// @@search logic
require('./_fix-re-wks')('search', 1, function (defined, SEARCH, $search) {
  // 21.1.3.15 String.prototype.search(regexp)
  return [function search(regexp) {
    'use strict';
    var O = defined(this);
    var fn = regexp == undefined ? undefined : regexp[SEARCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
  }, $search];
});

},{"./_fix-re-wks":52}],194:[function(require,module,exports){
// @@split logic
require('./_fix-re-wks')('split', 2, function (defined, SPLIT, $split) {
  'use strict';
  var isRegExp = require('./_is-regexp');
  var _split = $split;
  var $push = [].push;
  var $SPLIT = 'split';
  var LENGTH = 'length';
  var LAST_INDEX = 'lastIndex';
  if (
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ) {
    var NPCG = /()??/.exec('')[1] === undefined; // nonparticipating capturing group
    // based on es5-shim implementation, need to rework it
    $split = function (separator, limit) {
      var string = String(this);
      if (separator === undefined && limit === 0) return [];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) return _split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var separator2, match, lastIndex, lastLength, i;
      // Doesn't need flags gy, but they don't hurt
      if (!NPCG) separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
      while (match = separatorCopy.exec(string)) {
        // `separatorCopy.lastIndex` is not reliable cross-browser
        lastIndex = match.index + match[0][LENGTH];
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          // Fix browsers whose `exec` methods don't consistently return `undefined` for NPCG
          // eslint-disable-next-line no-loop-func
          if (!NPCG && match[LENGTH] > 1) match[0].replace(separator2, function () {
            for (i = 1; i < arguments[LENGTH] - 2; i++) if (arguments[i] === undefined) match[i] = undefined;
          });
          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if (output[LENGTH] >= splitLimit) break;
        }
        if (separatorCopy[LAST_INDEX] === match.index) separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }
      if (lastLastIndex === string[LENGTH]) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
    $split = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : _split.call(this, separator, limit);
    };
  }
  // 21.1.3.17 String.prototype.split(separator, limit)
  return [function split(separator, limit) {
    var O = defined(this);
    var fn = separator == undefined ? undefined : separator[SPLIT];
    return fn !== undefined ? fn.call(separator, O, limit) : $split.call(String(O), separator, limit);
  }, $split];
});

},{"./_fix-re-wks":52,"./_is-regexp":67}],195:[function(require,module,exports){
'use strict';
var strong = require('./_collection-strong');
var validate = require('./_validate-collection');
var SET = 'Set';

// 23.2 Set Objects
module.exports = require('./_collection')(SET, function (get) {
  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return strong.def(validate(this, SET), value = value === 0 ? 0 : value, value);
  }
}, strong);

},{"./_collection":40,"./_collection-strong":38,"./_validate-collection":125}],196:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $at = require('./_string-at')(false);
$export($export.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos) {
    return $at(this, pos);
  }
});

},{"./_export":49,"./_string-at":109}],197:[function(require,module,exports){
// 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
'use strict';
var $export = require('./_export');
var toLength = require('./_to-length');
var context = require('./_string-context');
var ENDS_WITH = 'endsWith';
var $endsWith = ''[ENDS_WITH];

$export($export.P + $export.F * require('./_fails-is-regexp')(ENDS_WITH), 'String', {
  endsWith: function endsWith(searchString /* , endPosition = @length */) {
    var that = context(this, searchString, ENDS_WITH);
    var endPosition = arguments.length > 1 ? arguments[1] : undefined;
    var len = toLength(that.length);
    var end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    var search = String(searchString);
    return $endsWith
      ? $endsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});

},{"./_export":49,"./_fails-is-regexp":50,"./_string-context":110,"./_to-length":118}],198:[function(require,module,exports){
var $export = require('./_export');
var toAbsoluteIndex = require('./_to-absolute-index');
var fromCharCode = String.fromCharCode;
var $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$export($export.S + $export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x) { // eslint-disable-line no-unused-vars
    var res = [];
    var aLen = arguments.length;
    var i = 0;
    var code;
    while (aLen > i) {
      code = +arguments[i++];
      if (toAbsoluteIndex(code, 0x10ffff) !== code) throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});

},{"./_export":49,"./_to-absolute-index":114}],199:[function(require,module,exports){
// 21.1.3.7 String.prototype.includes(searchString, position = 0)
'use strict';
var $export = require('./_export');
var context = require('./_string-context');
var INCLUDES = 'includes';

$export($export.P + $export.F * require('./_fails-is-regexp')(INCLUDES), 'String', {
  includes: function includes(searchString /* , position = 0 */) {
    return !!~context(this, searchString, INCLUDES)
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});

},{"./_export":49,"./_fails-is-regexp":50,"./_string-context":110}],200:[function(require,module,exports){
var $export = require('./_export');
var toIObject = require('./_to-iobject');
var toLength = require('./_to-length');

$export($export.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite) {
    var tpl = toIObject(callSite.raw);
    var len = toLength(tpl.length);
    var aLen = arguments.length;
    var res = [];
    var i = 0;
    while (len > i) {
      res.push(String(tpl[i++]));
      if (i < aLen) res.push(String(arguments[i]));
    } return res.join('');
  }
});

},{"./_export":49,"./_to-iobject":117,"./_to-length":118}],201:[function(require,module,exports){
var $export = require('./_export');

$export($export.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: require('./_string-repeat')
});

},{"./_export":49,"./_string-repeat":112}],202:[function(require,module,exports){
// 21.1.3.18 String.prototype.startsWith(searchString [, position ])
'use strict';
var $export = require('./_export');
var toLength = require('./_to-length');
var context = require('./_string-context');
var STARTS_WITH = 'startsWith';
var $startsWith = ''[STARTS_WITH];

$export($export.P + $export.F * require('./_fails-is-regexp')(STARTS_WITH), 'String', {
  startsWith: function startsWith(searchString /* , position = 0 */) {
    var that = context(this, searchString, STARTS_WITH);
    var index = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length));
    var search = String(searchString);
    return $startsWith
      ? $startsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});

},{"./_export":49,"./_fails-is-regexp":50,"./_string-context":110,"./_to-length":118}],203:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global = require('./_global');
var has = require('./_has');
var DESCRIPTORS = require('./_descriptors');
var $export = require('./_export');
var redefine = require('./_redefine');
var META = require('./_meta').KEY;
var $fails = require('./_fails');
var shared = require('./_shared');
var setToStringTag = require('./_set-to-string-tag');
var uid = require('./_uid');
var wks = require('./_wks');
var wksExt = require('./_wks-ext');
var wksDefine = require('./_wks-define');
var enumKeys = require('./_enum-keys');
var isArray = require('./_is-array');
var anObject = require('./_an-object');
var toIObject = require('./_to-iobject');
var toPrimitive = require('./_to-primitive');
var createDesc = require('./_property-desc');
var _create = require('./_object-create');
var gOPNExt = require('./_object-gopn-ext');
var $GOPD = require('./_object-gopd');
var $DP = require('./_object-dp');
var $keys = require('./_object-keys');
var gOPD = $GOPD.f;
var dP = $DP.f;
var gOPN = gOPNExt.f;
var $Symbol = global.Symbol;
var $JSON = global.JSON;
var _stringify = $JSON && $JSON.stringify;
var PROTOTYPE = 'prototype';
var HIDDEN = wks('_hidden');
var TO_PRIMITIVE = wks('toPrimitive');
var isEnum = {}.propertyIsEnumerable;
var SymbolRegistry = shared('symbol-registry');
var AllSymbols = shared('symbols');
var OPSymbols = shared('op-symbols');
var ObjectProto = Object[PROTOTYPE];
var USE_NATIVE = typeof $Symbol == 'function';
var QObject = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function () {
  return _create(dP({}, 'a', {
    get: function () { return dP(this, 'a', { value: 7 }).a; }
  })).a != 7;
}) ? function (it, key, D) {
  var protoDesc = gOPD(ObjectProto, key);
  if (protoDesc) delete ObjectProto[key];
  dP(it, key, D);
  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function (tag) {
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D) {
  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if (has(AllSymbols, key)) {
    if (!D.enumerable) {
      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
      D = _create(D, { enumerable: createDesc(0, false) });
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P) {
  anObject(it);
  var keys = enumKeys(P = toIObject(P));
  var i = 0;
  var l = keys.length;
  var key;
  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P) {
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key) {
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
  it = toIObject(it);
  key = toPrimitive(key, true);
  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
  var D = gOPD(it, key);
  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it) {
  var names = gOPN(toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
  var IS_OP = it === ObjectProto;
  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
  var result = [];
  var i = 0;
  var key;
  while (names.length > i) {
    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if (!USE_NATIVE) {
  $Symbol = function Symbol() {
    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function (value) {
      if (this === ObjectProto) $set.call(OPSymbols, value);
      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f = $propertyIsEnumerable;
  require('./_object-gops').f = $getOwnPropertySymbols;

  if (DESCRIPTORS && !require('./_library')) {
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function (name) {
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

for (var es6Symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function (key) {
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(sym) {
    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
  },
  useSetter: function () { setter = true; },
  useSimple: function () { setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it) {
    if (it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
    var args = [it];
    var i = 1;
    var replacer, $replacer;
    while (arguments.length > i) args.push(arguments[i++]);
    replacer = args[1];
    if (typeof replacer == 'function') $replacer = replacer;
    if ($replacer || !isArray(replacer)) replacer = function (key, value) {
      if ($replacer) value = $replacer.call(this, key, value);
      if (!isSymbol(value)) return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);

},{"./_an-object":28,"./_descriptors":45,"./_enum-keys":48,"./_export":49,"./_fails":51,"./_global":55,"./_has":56,"./_hide":57,"./_is-array":64,"./_library":74,"./_meta":79,"./_object-create":83,"./_object-dp":84,"./_object-gopd":86,"./_object-gopn":88,"./_object-gopn-ext":87,"./_object-gops":89,"./_object-keys":92,"./_object-pie":93,"./_property-desc":99,"./_redefine":101,"./_set-to-string-tag":105,"./_shared":107,"./_to-iobject":117,"./_to-primitive":120,"./_uid":124,"./_wks":128,"./_wks-define":126,"./_wks-ext":127}],204:[function(require,module,exports){
'use strict';
var $export = require('./_export');
var $typed = require('./_typed');
var buffer = require('./_typed-buffer');
var anObject = require('./_an-object');
var toAbsoluteIndex = require('./_to-absolute-index');
var toLength = require('./_to-length');
var isObject = require('./_is-object');
var ArrayBuffer = require('./_global').ArrayBuffer;
var speciesConstructor = require('./_species-constructor');
var $ArrayBuffer = buffer.ArrayBuffer;
var $DataView = buffer.DataView;
var $isView = $typed.ABV && ArrayBuffer.isView;
var $slice = $ArrayBuffer.prototype.slice;
var VIEW = $typed.VIEW;
var ARRAY_BUFFER = 'ArrayBuffer';

$export($export.G + $export.W + $export.F * (ArrayBuffer !== $ArrayBuffer), { ArrayBuffer: $ArrayBuffer });

$export($export.S + $export.F * !$typed.CONSTR, ARRAY_BUFFER, {
  // 24.1.3.1 ArrayBuffer.isView(arg)
  isView: function isView(it) {
    return $isView && $isView(it) || isObject(it) && VIEW in it;
  }
});

$export($export.P + $export.U + $export.F * require('./_fails')(function () {
  return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
}), ARRAY_BUFFER, {
  // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
  slice: function slice(start, end) {
    if ($slice !== undefined && end === undefined) return $slice.call(anObject(this), start); // FF fix
    var len = anObject(this).byteLength;
    var first = toAbsoluteIndex(start, len);
    var final = toAbsoluteIndex(end === undefined ? len : end, len);
    var result = new (speciesConstructor(this, $ArrayBuffer))(toLength(final - first));
    var viewS = new $DataView(this);
    var viewT = new $DataView(result);
    var index = 0;
    while (first < final) {
      viewT.setUint8(index++, viewS.getUint8(first++));
    } return result;
  }
});

require('./_set-species')(ARRAY_BUFFER);

},{"./_an-object":28,"./_export":49,"./_fails":51,"./_global":55,"./_is-object":66,"./_set-species":104,"./_species-constructor":108,"./_to-absolute-index":114,"./_to-length":118,"./_typed":123,"./_typed-buffer":122}],205:[function(require,module,exports){
var $export = require('./_export');
$export($export.G + $export.W + $export.F * !require('./_typed').ABV, {
  DataView: require('./_typed-buffer').DataView
});

},{"./_export":49,"./_typed":123,"./_typed-buffer":122}],206:[function(require,module,exports){
require('./_typed-array')('Float32', 4, function (init) {
  return function Float32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":121}],207:[function(require,module,exports){
require('./_typed-array')('Float64', 8, function (init) {
  return function Float64Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":121}],208:[function(require,module,exports){
require('./_typed-array')('Int16', 2, function (init) {
  return function Int16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":121}],209:[function(require,module,exports){
require('./_typed-array')('Int32', 4, function (init) {
  return function Int32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":121}],210:[function(require,module,exports){
require('./_typed-array')('Int8', 1, function (init) {
  return function Int8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":121}],211:[function(require,module,exports){
require('./_typed-array')('Uint16', 2, function (init) {
  return function Uint16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":121}],212:[function(require,module,exports){
require('./_typed-array')('Uint32', 4, function (init) {
  return function Uint32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":121}],213:[function(require,module,exports){
require('./_typed-array')('Uint8', 1, function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

},{"./_typed-array":121}],214:[function(require,module,exports){
require('./_typed-array')('Uint8', 1, function (init) {
  return function Uint8ClampedArray(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
}, true);

},{"./_typed-array":121}],215:[function(require,module,exports){
'use strict';
var each = require('./_array-methods')(0);
var redefine = require('./_redefine');
var meta = require('./_meta');
var assign = require('./_object-assign');
var weak = require('./_collection-weak');
var isObject = require('./_is-object');
var fails = require('./_fails');
var validate = require('./_validate-collection');
var WEAK_MAP = 'WeakMap';
var getWeak = meta.getWeak;
var isExtensible = Object.isExtensible;
var uncaughtFrozenStore = weak.ufstore;
var tmp = {};
var InternalMap;

var wrapper = function (get) {
  return function WeakMap() {
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

var methods = {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key) {
    if (isObject(key)) {
      var data = getWeak(key);
      if (data === true) return uncaughtFrozenStore(validate(this, WEAK_MAP)).get(key);
      return data ? data[this._i] : undefined;
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value) {
    return weak.def(validate(this, WEAK_MAP), key, value);
  }
};

// 23.3 WeakMap Objects
var $WeakMap = module.exports = require('./_collection')(WEAK_MAP, wrapper, methods, weak, true, true);

// IE11 WeakMap frozen keys fix
if (fails(function () { return new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7; })) {
  InternalMap = weak.getConstructor(wrapper, WEAK_MAP);
  assign(InternalMap.prototype, methods);
  meta.NEED = true;
  each(['delete', 'has', 'get', 'set'], function (key) {
    var proto = $WeakMap.prototype;
    var method = proto[key];
    redefine(proto, key, function (a, b) {
      // store frozen objects on internal weakmap shim
      if (isObject(a) && !isExtensible(a)) {
        if (!this._f) this._f = new InternalMap();
        var result = this._f[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}

},{"./_array-methods":32,"./_collection":40,"./_collection-weak":39,"./_fails":51,"./_is-object":66,"./_meta":79,"./_object-assign":82,"./_redefine":101,"./_validate-collection":125}],216:[function(require,module,exports){
'use strict';
var weak = require('./_collection-weak');
var validate = require('./_validate-collection');
var WEAK_SET = 'WeakSet';

// 23.4 WeakSet Objects
require('./_collection')(WEAK_SET, function (get) {
  return function WeakSet() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value) {
    return weak.def(validate(this, WEAK_SET), value, true);
  }
}, weak, false, true);

},{"./_collection":40,"./_collection-weak":39,"./_validate-collection":125}],217:[function(require,module,exports){
'use strict';
// https://github.com/tc39/Array.prototype.includes
var $export = require('./_export');
var $includes = require('./_array-includes')(true);

$export($export.P, 'Array', {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

require('./_add-to-unscopables')('includes');

},{"./_add-to-unscopables":26,"./_array-includes":31,"./_export":49}],218:[function(require,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export = require('./_export');
var $entries = require('./_object-to-array')(true);

$export($export.S, 'Object', {
  entries: function entries(it) {
    return $entries(it);
  }
});

},{"./_export":49,"./_object-to-array":95}],219:[function(require,module,exports){
// https://github.com/tc39/proposal-object-getownpropertydescriptors
var $export = require('./_export');
var ownKeys = require('./_own-keys');
var toIObject = require('./_to-iobject');
var gOPD = require('./_object-gopd');
var createProperty = require('./_create-property');

$export($export.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
    var O = toIObject(object);
    var getDesc = gOPD.f;
    var keys = ownKeys(O);
    var result = {};
    var i = 0;
    var key, desc;
    while (keys.length > i) {
      desc = getDesc(O, key = keys[i++]);
      if (desc !== undefined) createProperty(result, key, desc);
    }
    return result;
  }
});

},{"./_create-property":42,"./_export":49,"./_object-gopd":86,"./_own-keys":96,"./_to-iobject":117}],220:[function(require,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export = require('./_export');
var $values = require('./_object-to-array')(false);

$export($export.S, 'Object', {
  values: function values(it) {
    return $values(it);
  }
});

},{"./_export":49,"./_object-to-array":95}],221:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-string-pad-start-end
var $export = require('./_export');
var $pad = require('./_string-pad');

$export($export.P, 'String', {
  padEnd: function padEnd(maxLength /* , fillString = ' ' */) {
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
  }
});

},{"./_export":49,"./_string-pad":111}],222:[function(require,module,exports){
'use strict';
// https://github.com/tc39/proposal-string-pad-start-end
var $export = require('./_export');
var $pad = require('./_string-pad');

$export($export.P, 'String', {
  padStart: function padStart(maxLength /* , fillString = ' ' */) {
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
  }
});

},{"./_export":49,"./_string-pad":111}],223:[function(require,module,exports){
var $iterators = require('./es6.array.iterator');
var getKeys = require('./_object-keys');
var redefine = require('./_redefine');
var global = require('./_global');
var hide = require('./_hide');
var Iterators = require('./_iterators');
var wks = require('./_wks');
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}

},{"./_global":55,"./_hide":57,"./_iterators":73,"./_object-keys":92,"./_redefine":101,"./_wks":128,"./es6.array.iterator":135}],224:[function(require,module,exports){
var $export = require('./_export');
var $task = require('./_task');
$export($export.G + $export.B, {
  setImmediate: $task.set,
  clearImmediate: $task.clear
});

},{"./_export":49,"./_task":113}],225:[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var global = require('./_global');
var $export = require('./_export');
var navigator = global.navigator;
var slice = [].slice;
var MSIE = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
var wrap = function (set) {
  return function (fn, time /* , ...args */) {
    var boundArgs = arguments.length > 2;
    var args = boundArgs ? slice.call(arguments, 2) : false;
    return set(boundArgs ? function () {
      // eslint-disable-next-line no-new-func
      (typeof fn == 'function' ? fn : Function(fn)).apply(this, args);
    } : fn, time);
  };
};
$export($export.G + $export.B + $export.F * MSIE, {
  setTimeout: wrap(global.setTimeout),
  setInterval: wrap(global.setInterval)
});

},{"./_export":49,"./_global":55}],226:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  runtime.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  runtime.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        if (delegate.iterator.return) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };
})(
  // In sloppy mode, unbound `this` refers to the global object, fallback to
  // Function constructor if we're in global strict mode. That is sadly a form
  // of indirect eval which violates Content Security Policy.
  (function() { return this })() || Function("return this")()
);

},{}],227:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pmx = require("../lib/aqgts-lib/src/pmx");

var _pmx2 = _interopRequireDefault(_pmx);

var _pmxUtils = require("../lib/aqgts-lib/src/pmx-utils");

var _pmxUtils2 = _interopRequireDefault(_pmxUtils);

var _vector = require("../lib/aqgts-lib/src/vector3");

var _vector2 = _interopRequireDefault(_vector);

var _quaternion = require("../lib/aqgts-lib/src/quaternion");

var _quaternion2 = _interopRequireDefault(_quaternion);

var _textAreaWrapper = require("../lib/aqgts-lib/src/text-area-wrapper");

var _textAreaWrapper2 = _interopRequireDefault(_textAreaWrapper);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = {
  run: function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(n, m, maxDeg, width, height, red, green, blue) {
      var log = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : new _textAreaWrapper2.default();
      var model, x, z;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              model = _pmxUtils2.default.createEmptyModel();

              model.model.japaneseName = "毛";
              model.model.englishName = "hair";
              model.model.japaneseComment = "ライセンス: CC0";
              model.model.englishComment = "License: CC0";

              _context.next = 7;
              return log.progressAsync("毛モデル作成中...", width * height);

            case 7:
              x = 0;

            case 8:
              if (!(x < width)) {
                _context.next = 20;
                break;
              }

              z = 0;

            case 10:
              if (!(z < height)) {
                _context.next = 17;
                break;
              }

              _pmxUtils2.default.addHair(model, new _vector2.default((-3.65 * (width - 1) / 2 + 3.65 * x) * 0.08 / 1000, 0, (-3.65 * (height - 1) / 2 + 3.65 * z) * 0.08 / 1000), 0.00004 / 0.08, 0.10 / 0.08, n, new Array(m).fill().map(function () {
                var theta = (0.35 + Math.random() * 0.3) * Math.PI * 2;
                return _quaternion2.default.angleAxis((0.85 + Math.random() * 0.3) * maxDeg * Math.PI / 180, new _vector2.default(Math.cos(theta), 0, Math.sin(theta)));
              }).reduce(function (arr, q) {
                arr.push(arr[arr.length - 1].multiply(q));
                return arr;
              }, [_quaternion2.default.identity]), new _pmx2.default.Vertex.Weight.BDEF1([{ index: 0, weight: 1 }]), false);
              _context.next = 14;
              return log.progressAsync();

            case 14:
              ++z;
              _context.next = 10;
              break;

            case 17:
              ++x;
              _context.next = 8;
              break;

            case 20:

              model.materials = [new _pmx2.default.Material("材質1", "", { red: red * 0.6, green: green * 0.6, blue: blue * 0.6, alpha: 1 }, { red: 1, green: 1, blue: 1, coefficient: 5 }, { red: red * 0.4, green: green * 0.4, blue: blue * 0.4 }, false, true, true, true, false, { red: 0, green: 0, blue: 0, alpha: 1, size: 0 }, -1, { index: -1, mode: "disabled" }, { isShared: false, index: -1 }, "", model.faces.length)];

              return _context.abrupt("return", model.write());

            case 22:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function run(_x2, _x3, _x4, _x5, _x6, _x7, _x8, _x9) {
      return _ref.apply(this, arguments);
    }

    return run;
  }()
};

},{"../lib/aqgts-lib/src/pmx":13,"../lib/aqgts-lib/src/pmx-utils":12,"../lib/aqgts-lib/src/quaternion":15,"../lib/aqgts-lib/src/text-area-wrapper":18,"../lib/aqgts-lib/src/vector3":23}],228:[function(require,module,exports){
"use strict";

require("core-js/modules/es6.typed.array-buffer");

require("core-js/modules/es6.typed.data-view");

require("core-js/modules/es6.typed.int8-array");

require("core-js/modules/es6.typed.uint8-array");

require("core-js/modules/es6.typed.uint8-clamped-array");

require("core-js/modules/es6.typed.int16-array");

require("core-js/modules/es6.typed.uint16-array");

require("core-js/modules/es6.typed.int32-array");

require("core-js/modules/es6.typed.uint32-array");

require("core-js/modules/es6.typed.float32-array");

require("core-js/modules/es6.typed.float64-array");

require("core-js/modules/es6.map");

require("core-js/modules/es6.set");

require("core-js/modules/es6.weak-map");

require("core-js/modules/es6.weak-set");

require("core-js/modules/es6.reflect.apply");

require("core-js/modules/es6.reflect.construct");

require("core-js/modules/es6.reflect.define-property");

require("core-js/modules/es6.reflect.delete-property");

require("core-js/modules/es6.reflect.get");

require("core-js/modules/es6.reflect.get-own-property-descriptor");

require("core-js/modules/es6.reflect.get-prototype-of");

require("core-js/modules/es6.reflect.has");

require("core-js/modules/es6.reflect.is-extensible");

require("core-js/modules/es6.reflect.own-keys");

require("core-js/modules/es6.reflect.prevent-extensions");

require("core-js/modules/es6.reflect.set");

require("core-js/modules/es6.reflect.set-prototype-of");

require("core-js/modules/es6.promise");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.freeze");

require("core-js/modules/es6.object.seal");

require("core-js/modules/es6.object.prevent-extensions");

require("core-js/modules/es6.object.is-frozen");

require("core-js/modules/es6.object.is-sealed");

require("core-js/modules/es6.object.is-extensible");

require("core-js/modules/es6.object.get-own-property-descriptor");

require("core-js/modules/es6.object.get-prototype-of");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.object.get-own-property-names");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.object.is");

require("core-js/modules/es6.object.set-prototype-of");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.string.raw");

require("core-js/modules/es6.string.from-code-point");

require("core-js/modules/es6.string.code-point-at");

require("core-js/modules/es6.string.repeat");

require("core-js/modules/es6.string.starts-with");

require("core-js/modules/es6.string.ends-with");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.regexp.flags");

require("core-js/modules/es6.regexp.match");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.search");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.array.of");

require("core-js/modules/es6.array.copy-within");

require("core-js/modules/es6.array.find");

require("core-js/modules/es6.array.find-index");

require("core-js/modules/es6.array.fill");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.number.is-finite");

require("core-js/modules/es6.number.is-integer");

require("core-js/modules/es6.number.is-safe-integer");

require("core-js/modules/es6.number.is-nan");

require("core-js/modules/es6.number.epsilon");

require("core-js/modules/es6.number.min-safe-integer");

require("core-js/modules/es6.number.max-safe-integer");

require("core-js/modules/es6.math.acosh");

require("core-js/modules/es6.math.asinh");

require("core-js/modules/es6.math.atanh");

require("core-js/modules/es6.math.cbrt");

require("core-js/modules/es6.math.clz32");

require("core-js/modules/es6.math.cosh");

require("core-js/modules/es6.math.expm1");

require("core-js/modules/es6.math.fround");

require("core-js/modules/es6.math.hypot");

require("core-js/modules/es6.math.imul");

require("core-js/modules/es6.math.log1p");

require("core-js/modules/es6.math.log10");

require("core-js/modules/es6.math.log2");

require("core-js/modules/es6.math.sign");

require("core-js/modules/es6.math.sinh");

require("core-js/modules/es6.math.tanh");

require("core-js/modules/es6.math.trunc");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es7.object.values");

require("core-js/modules/es7.object.entries");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es7.string.pad-start");

require("core-js/modules/es7.string.pad-end");

require("core-js/modules/web.timers");

require("core-js/modules/web.immediate");

require("core-js/modules/web.dom.iterable");

require("regenerator-runtime/runtime");

var _core = require("./core");

var _core2 = _interopRequireDefault(_core);

var _textAreaWrapper = require("../lib/aqgts-lib/src/text-area-wrapper");

var _textAreaWrapper2 = _interopRequireDefault(_textAreaWrapper);

var _binaryUtils = require("../lib/aqgts-lib/src/binary-utils");

var _binaryUtils2 = _interopRequireDefault(_binaryUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var log = null;
new Vue({
  el: ".container",
  data: {
    n: 5,
    m: 10,
    maxDeg: 3,
    width: 250,
    height: 30,
    red: 0.21176470588,
    green: 0.55294117647,
    blue: 0.76078431372,
    isLoaded: false,
    isProcessing: false
  },
  computed: {},
  methods: {
    createModel: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var binary;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.isProcessing = true;
                _context.prev = 1;

                log.clear();
                _context.next = 5;
                return _core2.default.run(Number(this.n), Number(this.m), Number(this.maxDeg), Number(this.width), Number(this.height), Number(this.red), Number(this.green), Number(this.blue), log);

              case 5:
                binary = _context.sent;

                _binaryUtils2.default.saveBinaryAsFile(binary, "hair.pmx");
                _context.next = 9;
                return log.appendAsync("モデルの作成に成功しました");

              case 9:
                _context.next = 16;
                break;

              case 11:
                _context.prev = 11;
                _context.t0 = _context["catch"](1);
                _context.next = 15;
                return log.appendAsync("[Error]" + _context.t0);

              case 15:
                throw _context.t0;

              case 16:
                _context.prev = 16;

                this.isProcessing = false;
                return _context.finish(16);

              case 19:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[1, 11, 16, 19]]);
      }));

      function createModel() {
        return _ref.apply(this, arguments);
      }

      return createModel;
    }()
  },
  watch: {},
  mounted: function mounted() {
    log = new _textAreaWrapper2.default(document.getElementById("log"));
    this.isLoaded = true;
  }
});

},{"../lib/aqgts-lib/src/binary-utils":1,"../lib/aqgts-lib/src/text-area-wrapper":18,"./core":227,"core-js/modules/es6.array.copy-within":130,"core-js/modules/es6.array.fill":131,"core-js/modules/es6.array.find":133,"core-js/modules/es6.array.find-index":132,"core-js/modules/es6.array.from":134,"core-js/modules/es6.array.iterator":135,"core-js/modules/es6.array.of":136,"core-js/modules/es6.function.name":137,"core-js/modules/es6.map":138,"core-js/modules/es6.math.acosh":139,"core-js/modules/es6.math.asinh":140,"core-js/modules/es6.math.atanh":141,"core-js/modules/es6.math.cbrt":142,"core-js/modules/es6.math.clz32":143,"core-js/modules/es6.math.cosh":144,"core-js/modules/es6.math.expm1":145,"core-js/modules/es6.math.fround":146,"core-js/modules/es6.math.hypot":147,"core-js/modules/es6.math.imul":148,"core-js/modules/es6.math.log10":149,"core-js/modules/es6.math.log1p":150,"core-js/modules/es6.math.log2":151,"core-js/modules/es6.math.sign":152,"core-js/modules/es6.math.sinh":153,"core-js/modules/es6.math.tanh":154,"core-js/modules/es6.math.trunc":155,"core-js/modules/es6.number.epsilon":156,"core-js/modules/es6.number.is-finite":157,"core-js/modules/es6.number.is-integer":158,"core-js/modules/es6.number.is-nan":159,"core-js/modules/es6.number.is-safe-integer":160,"core-js/modules/es6.number.max-safe-integer":161,"core-js/modules/es6.number.min-safe-integer":162,"core-js/modules/es6.object.assign":163,"core-js/modules/es6.object.freeze":164,"core-js/modules/es6.object.get-own-property-descriptor":165,"core-js/modules/es6.object.get-own-property-names":166,"core-js/modules/es6.object.get-prototype-of":167,"core-js/modules/es6.object.is":171,"core-js/modules/es6.object.is-extensible":168,"core-js/modules/es6.object.is-frozen":169,"core-js/modules/es6.object.is-sealed":170,"core-js/modules/es6.object.keys":172,"core-js/modules/es6.object.prevent-extensions":173,"core-js/modules/es6.object.seal":174,"core-js/modules/es6.object.set-prototype-of":175,"core-js/modules/es6.promise":176,"core-js/modules/es6.reflect.apply":177,"core-js/modules/es6.reflect.construct":178,"core-js/modules/es6.reflect.define-property":179,"core-js/modules/es6.reflect.delete-property":180,"core-js/modules/es6.reflect.get":183,"core-js/modules/es6.reflect.get-own-property-descriptor":181,"core-js/modules/es6.reflect.get-prototype-of":182,"core-js/modules/es6.reflect.has":184,"core-js/modules/es6.reflect.is-extensible":185,"core-js/modules/es6.reflect.own-keys":186,"core-js/modules/es6.reflect.prevent-extensions":187,"core-js/modules/es6.reflect.set":189,"core-js/modules/es6.reflect.set-prototype-of":188,"core-js/modules/es6.regexp.flags":190,"core-js/modules/es6.regexp.match":191,"core-js/modules/es6.regexp.replace":192,"core-js/modules/es6.regexp.search":193,"core-js/modules/es6.regexp.split":194,"core-js/modules/es6.set":195,"core-js/modules/es6.string.code-point-at":196,"core-js/modules/es6.string.ends-with":197,"core-js/modules/es6.string.from-code-point":198,"core-js/modules/es6.string.includes":199,"core-js/modules/es6.string.raw":200,"core-js/modules/es6.string.repeat":201,"core-js/modules/es6.string.starts-with":202,"core-js/modules/es6.symbol":203,"core-js/modules/es6.typed.array-buffer":204,"core-js/modules/es6.typed.data-view":205,"core-js/modules/es6.typed.float32-array":206,"core-js/modules/es6.typed.float64-array":207,"core-js/modules/es6.typed.int16-array":208,"core-js/modules/es6.typed.int32-array":209,"core-js/modules/es6.typed.int8-array":210,"core-js/modules/es6.typed.uint16-array":211,"core-js/modules/es6.typed.uint32-array":212,"core-js/modules/es6.typed.uint8-array":213,"core-js/modules/es6.typed.uint8-clamped-array":214,"core-js/modules/es6.weak-map":215,"core-js/modules/es6.weak-set":216,"core-js/modules/es7.array.includes":217,"core-js/modules/es7.object.entries":218,"core-js/modules/es7.object.get-own-property-descriptors":219,"core-js/modules/es7.object.values":220,"core-js/modules/es7.string.pad-end":221,"core-js/modules/es7.string.pad-start":222,"core-js/modules/web.dom.iterable":223,"core-js/modules/web.immediate":224,"core-js/modules/web.timers":225,"regenerator-runtime/runtime":226}]},{},[228])
//# sourceMappingURL=index.main.js.map
