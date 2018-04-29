import Vector2 from "./vector2";
import DirectedLineSegment2D from "./directed-line-segment-2d";
import Triangle2D from "./triangle-2d";

export default class Line2D {
  constructor(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
  clone() {
    return new this.constructor(this.a, this.b, this.c);
  }
  contains(p) {
    return this.a * p.x + this.b * p.y + this.c === 0;
  }
  isParallelTo(other) { // 同一直線である場合は含まない
    return this.a * other.b === this.b * other.a && (this.b * other.c !== this.c * other.b || this.c * other.a !== this.a * other.c);
  }
  crosses(other) { // 唯一の交点を持つ
    return this.a * other.b - other.a * this.b !== 0;
  }
  crossPoint(other) { // 唯一の交点
    if (!this.crosses(other)) return null;
    return new Vector2(
      (this.b * other.c - other.b * this.c) / (this.a * other.b - other.a * this.b),
      (other.a * this.c - this.a * other.c) / (this.a * other.b - other.a * this.b)
    );
  }
  intersects(other) { // 共通部分を持つ
    return this.equals(other) || this.crosses(other);
  }
  intersection(other) { // 共通部分
    if (other instanceof Line2D) {
      if (this.equals(other)) return [this];
      if (this.crosses(other)) return [this.crossPoint(other)];
      return [];
    } else if (other instanceof DirectedLineSegment2D) {
      return other.intersection(this);
    } else if (other instanceof Triangle2D) {
      return other.intersection(this);
    } else {
      throw new Error("Unknown type");
    }
  }
  subtract(other) {
    return this.equals(other) ? [] : [this];
  }
  projection(other) {
    if (other instanceof Vector2) {
      const n = new Vector2(this.a, this.b);
      return other.subtract(n.multiply((other.innerProduct(n) + this.c) / n.squaredNorm()));
    } else {
      throw new Error("Unknown type");
    }
  }
  equals(other) {
    return this === other || (this.b * other.c === this.c * other.b && this.c * other.a === this.a * other.c && this.a * other.b === this.b * other.a);
  }
  toString() {
    return `${this.a}x${this.b < 0 ? "-" : "+"}${Math.abs(this.b)}y${this.c < 0 ? "-" : "+"}${Math.abs(this.c)}=0`;
  }
  static through(p1, p2) {
    if (p1.equals(p2)) throw new Error("p1 is identical to p2");
    return new this(p1.y - p2.y, p2.x - p1.x, (p2.y - p1.y) * p1.x - (p2.x - p1.x) * p1.y);
  }
}
