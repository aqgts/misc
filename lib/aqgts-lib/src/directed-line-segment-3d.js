import Vector3 from "./vector3";
import Line3D from "./line-3d";

export default class DirectedLineSegment3D {
  constructor(p1, p2) {
    if (p1.equals(p2)) throw new Error("Zero length line segment.");
    this.p1 = p1;
    this.p2 = p2;
  }
  clone() {
    return new this.constructor(this.p1.clone(), this.p2.clone());
  }
  reverse() {
    return new this.constructor(this.p2, this.p1);
  }
  equals(other) {
    return this === other || (this.p1.equals(other.p1) && this.p2.equals(other.p2));
  }
  toVector() {
    return this.p2.subtract(this.p1);
  }
  length() {
    return this.toVector().norm();
  }
  contains(p) {
    if (p.equals(this.p1) || p.equals(this.p2)) return true;
    const l = Line3D.through(this.p1, this.p2);
    if (!l.contains(p)) return false;
    const d = p.subtract(this.p1).innerProduct(this.toVector());
    return 0 <= d && d <= this.toVector().squaredNorm();
  }
}
