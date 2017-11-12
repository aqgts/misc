import Vector from "./vector";
import Vector2 from "./vector2";
import Vector3 from "./vector3";
import Vector4 from "./vector4";

export default class Matrix {
  constructor(...rows) {
    rows.forEach((row, i) => {
      this[i] = row;
    });
    this.length = rows.length;
  }
  clone() {
    return new this(...this.to2DArray())
  }
  rowCount() {
    return this.length;
  }
  columnCount() {
    return this[0].length;
  }
  multiply(other) {
    if (other instanceof Matrix) {
      if (this.columnCount() !== other.rowCount()) throw new Error("Cannot multiply.");
      const buffer = this.constructor.zero(this.rowCount(), other.columnCount()).to2DArray();
      for (let i = 0; i < this.rowCount(); i++) {
        for (let j = 0; j < other.rowCount(); j++) {
          for (let k = 0; k < this.columnCount(); k++) {
            buffer[i][j] += this[i][k] * other[k][j];
          }
        }
      }
      return new this.constructor(...buffer);
    } else if (other instanceof Vector) {
      const args = this.multiply(this.constructor.fromColumnVectors(other)).transpose()[0];
      switch (args.length) {
      case 2:
        return new Vector2(...args);
      case 3:
        return new Vector3(...args);
      case 4:
        return new Vector4(...args);
      default:
        return new Vector(...args);
      }
    } else if (typeof(other) === "number") {
      return new this.constructor(...Array.from(this).map(row => row.map(value => value * other)));
    } else {
      throw new Error("Unknown type.");
    }
  }
  divide(other) {
    return new this.constructor(...Array.from(this).map(row => row.map(value => value / other)));
  }
  transpose() {
    return new this.constructor(..._.range(this.columnCount()).map(columnIndex => _.range(this.rowCount()).map(rowIndex => this[rowIndex][columnIndex])));
  }
  isSquare() {
    return this.rowCount() === this.columnCount();
  }
  determinant() {
    if (!this.isSquare()) throw new Error("Not square matrix.");
    if (!("_determinant" in this)) {
      const n = this.rowCount();
      switch (n) {
      case 1:
        this._determinant = this[0][0];
        break;
      case 2:
        this._determinant = this[0][0] * this[1][1] - this[0][1] * this[1][0];
        break;
      case 3:
        this._determinant = this[0][0] * this[1][1] * this[2][2] +
          this[1][0] * this[2][1] * this[0][2] +
          this[2][0] * this[0][1] * this[1][2] -
          this[0][2] * this[1][1] * this[2][0] -
          this[1][2] * this[2][1] * this[0][0] -
          this[2][2] * this[0][1] * this[1][0];
        break;
      default:
        const a = this.to2DArray();
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            if (i < j) {
              const tmp = a[j][i] / a[i][i];
              for (let k = 0; k < n; k++) {
                a[j][k] -= a[i][k] * tmp;
              }
            }
          }
        }
        this._determinant = _.range(n).map(i => a[i][i]).reduce(_.multiply, 1);
        break;
      }
    }
    return this._determinant;
  }
  isRegular() {
    return this.determinant() !== 0;
  }
  inverse() {
    if (!this.isRegular()) throw new Error("Not regular matrix.");
    const n = this.rowCount();
    switch (n) {
    case 1:
      return new this.constructor([1 / this.determinant()]);
    case 2:
      return new this.constructor(
        [this[1][1], -this[0][1]],
        [-this[1][0], this[0][0]]
      ).divide(this.determinant());
    case 3:
      return new this.constructor(
        [this[1][1] * this[2][2] - this[1][2] * this[2][1], this[0][2] * this[2][1] - this[0][1] * this[2][2], this[0][1] * this[1][2] - this[0][2] * this[1][1]],
        [this[1][2] * this[2][0] - this[1][0] * this[2][2], this[0][0] * this[2][2] - this[0][2] * this[2][0], this[0][2] * this[1][0] - this[0][0] * this[1][2]],
        [this[1][0] * this[2][1] - this[1][1] * this[2][0], this[0][1] * this[2][0] - this[0][0] * this[2][1], this[0][0] * this[1][1] - this[0][1] * this[1][0]]
      ).divide(this.determinant());
    default:
      const a = this.to2DArray();
      const inv = this.constructor.identity(n).to2DArray();
      for (let i=0; i < n; i++) {
        const tmp1 = 1 / a[i][i];
        for (let j = 0; j < n; j++) {
          a[i][j] *= tmp1;
          inv[i][j] *= tmp1;
        }
        for (let j = 0; j < n; j++) {
          if (i != j) {
            const tmp2 = a[j][i];
            for(let k = 0; k < n; k++) {
              a[j][k] -= a[i][k] * tmp2;
              inv[j][k] -= inv[i][k] * tmp2;
            }
          }
        }
      }
      return new this.constructor(...inv);
    }
  }
  to2DArray() {
    return Array.from(this).map(row => row.slice());
  }
  static fromColumnVectors(...columnVectors) {
    return new this(...Array.prototype.map.call(columnVectors[0], (value, rowIndex) => Array.prototype.map.call(columnVectors, columnVector => columnVector[rowIndex])));
  }
  static fromRowVectors(...rowVectors) {
    return new this(...Array.prototype.map.call(rowVectors, rowVector => Array.from(rowVector)));
  }
  static identity(n) {
    return new this(..._.range(n).map(i => _.range(n).map(j => i === j ? 1 : 0)));
  }
  static zero(rowCount, columnCount) {
    return new this(..._.range(rowCount).map(i => new Array(columnCount).fill(0)));
  }
}
