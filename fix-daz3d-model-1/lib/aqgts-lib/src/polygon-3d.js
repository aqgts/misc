import Cuboid from "./cuboid";
import DirectedLineSegment2D from "./directed-line-segment-2d";
import DirectedLineSegment3D from "./directed-line-segment-3d";
import Line2D from "./line-2d";
import Matrix from "./matrix";
import Plane from "./plane";
import Triangle2D from "./triangle-2d";
import Vector2 from "./vector2";
import Vector3 from "./vector3";
import Polygon from "./polygon";
import HalfUniverse2D from "./half-universe-2d";
import HalfUniverse3D from "./half-universe-3d";

export default class Polygon3D {
  constructor(...points) { // 起点と終点は同一要素ではない
    if (points.length < 3) throw new Error("Polygon3D must have three or more vertices.");
    if (!points.every(point => point instanceof Vector3)) throw new Error("points must be Vector3 array.");
    this.points = points;
  }
  equals(other) {
    if (this === other) return true;
    const otherPoints = other.points.slice();
    if (this.points.length !== otherPoints.length) return false;
    {
      let i;
      for (i = 0; i < otherPoints.length && !otherPoints[0].equals(this.points[0]); ++i) {
        otherPoints.unshift(otherPoints.pop());
      }
      if (i === otherPoints.length) return false;
    }
    return new Array(otherPoints.length).fill().every((_, i) => this.points[i].equals(otherPoints[i]));
  }
  toString() {
    return `${this.constructor.name} { ${this.points.map(point => point.toString()).join(", ")} }`;
  }
  reverse() {
    return new this.constructor(...this.points.slice().reverse());
  }
  normal() {
    return this.points[1].subtract(this.points[0]).crossProduct(this.points[this.points.length - 1].subtract(this.points[0])).normalize();
  }
  plane() {
    return Plane.through(this.points[0], this.points[1], this.points[this.points.length - 1]);
  }
  intersection(other) {
    throw new Error("Unknown type");
  }
  subtract(other) {
    throw new Error("Unknown type");
  }
  triangulate() {
    const matrix = Matrix.fromColumnVectors(
      this.points[1].subtract(this.points[0]),
      this.points[this.points.length - 1].subtract(this.points[0]),
      this.points[1].subtract(this.points[0]).crossProduct(this.points[this.points.length - 1].subtract(this.points[0]))
    );
    const invMatrix = matrix.inverse();
    const xyzToUvw = xyz => invMatrix.multiply(xyz.subtract(this.points[0]));
    const uvwToXyz = uvw => matrix.multiply(uvw).add(this.points[0]);
    const thisUv = new Polygon(...this.points.map(xyzToUvw).map(uvw => new Vector2(uvw.x, uvw.y)));
    return thisUv.triangulate().map(triangle => new Triangle3D(...triangle.points.map(uv => new Vector3(uv.x, uv.y, 0)).map(uvwToXyz)));
  }
}
export class Triangle3D extends Polygon3D {
  constructor(...points) {
    if (points.length !== 3 || points[0].equals(points[1]) || points[1].equals(points[2]) || points[2].equals(points[0])) throw new Error("Triangle3D must have three different vertices.");
    super(...points);
    const minX = Math.min(...points.map(point => point.x));
    const maxX = Math.max(...points.map(point => point.x));
    const minY = Math.min(...points.map(point => point.y));
    const maxY = Math.max(...points.map(point => point.y));
    const minZ = Math.min(...points.map(point => point.z));
    const maxZ = Math.max(...points.map(point => point.z));
    this._outline = new Cuboid(minX, minY, minZ, maxX - minX, maxY - minY, maxZ - minZ);
  }
  clone() {
    return new this.constructor(...this.points.map(point => point.clone()));
  }
  centerOfGravity() {
    return this.points[0].add(this.points[1]).add(this.points[2]).divide(3);
  }
  area() {
    const a = this.points[1].subtract(this.points[0]).norm();
    const b = this.points[2].subtract(this.points[1]).norm();
    const c = this.points[0].subtract(this.points[2]).norm();
    const s = (a + b + c) / 2;
    return Math.sqrt(s * (s - a) * (s - b) * (s - c));
  }
  intersection(other) {
    if (other instanceof Triangle3D) {
      if (!this._outline.intersects(other._outline)) return [];
      const matrix = Matrix.fromColumnVectors(
        this.points[1].subtract(this.points[0]),
        this.points[2].subtract(this.points[0]),
        this.points[1].subtract(this.points[0]).crossProduct(this.points[2].subtract(this.points[0]))
      );
      const invMatrix = matrix.inverse();
      const xyzToUvw = xyz => invMatrix.multiply(xyz.subtract(this.points[0]));
      const uvwToXyz = uvw => matrix.multiply(uvw).add(this.points[0]);
      const points = other.points.map(xyzToUvw);
      const thisUvw = new Triangle2D(new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 0));
      if (points.every(point => point.z === 0)) {
        const otherUvw = new Triangle2D(...points.map(point => new Vector2(point.x, point.y)));
        // thisUvw.intersection(otherUvw) を uvwToXyz にかける
        throw new Error("Currently not implemented");
      }
      const overPoints = points.filter(point => point.z >= 0);
      const underPoints = points.filter(point => point.z < 0);
      if (overPoints.length === 3 || underPoints.length === 3) return [];
      const centerPoint = overPoints.length === 1 ? overPoints[0] : underPoints[0];
      while (points[0] !== centerPoint) {
        points.unshift(points.pop());
      }
      const newPoints = [points[1], points[2]].map(point => {
        const t = (0 - centerPoint.z) / (point.z - centerPoint.z);
        return Vector3.lerp(centerPoint, point, t);
      });
      if (newPoints[0].equals(newPoints[1])) return thisUvw.contains(new Vector2(newPoints[0].x, newPoints[0].y)) ? [uvwToXyz(newPoints[0])] : [];
      const intersectionsUvw = thisUvw.intersection(
        overPoints.length === 1
          ? new DirectedLineSegment2D(new Vector2(newPoints[1].x, newPoints[1].y), new Vector2(newPoints[0].x, newPoints[0].y))
          : new DirectedLineSegment2D(new Vector2(newPoints[0].x, newPoints[0].y), new Vector2(newPoints[1].x, newPoints[1].y))
      );
      if (intersectionsUvw.length === 0) {
        return [];
      } else if (intersectionsUvw[0] instanceof Vector2) {
        return [uvwToXyz(new Vector3(intersectionsUvw[0].x, intersectionsUvw[0].y, 0))];
      } else if (intersectionsUvw[0] instanceof DirectedLineSegment2D) {
        return [new DirectedLineSegment3D(uvwToXyz(new Vector3(intersectionsUvw[0].p1.x, intersectionsUvw[0].p1.y, 0)), uvwToXyz(new Vector3(intersectionsUvw[0].p2.x, intersectionsUvw[0].p2.y, 0)))];
      }
    } else if (other instanceof Plane) {
      const a = new Vector3(other.a, other.b, other.c).innerProduct(this.points[1].subtract(this.points[0]));
      const b = new Vector3(other.a, other.b, other.c).innerProduct(this.points[2].subtract(this.points[0]));
      if (a === 0 && b === 0) return this;
      const intersections = new Triangle2D(new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 0)).intersection(new Line2D(a, b, other.d));
      if (intersections.length === 0) return [];
      const matrix = Matrix.fromColumnVectors(
        this.points[1].subtract(this.points[0]),
        this.points[2].subtract(this.points[0])
      );
      const uvToXyz = uv => matrix.multiply(uv).add(this.points[0]);
      if (intersections[0] instanceof Vector2) return [uvToXyz(intersections[0])];
      return [new DirectedLineSegment3D(uvToXyz(intersections[0].p1), uvToXyz(intersections[0].p2))];
    } else {
      return super.intersection(other);
    }
  }
  subtract(other) {
    if (other instanceof HalfUniverse3D) {
      if (this.plane().equals(other.plane)) return [];
      if (this.plane().isParallelTo(other.plane)) {
        if (this.points[0].subtract(other.plane.projection(this.points[0])).innerProduct(other.normal) > 0) {
          return [this];
        } else {
          return [];
        }
      }
      const matrix = Matrix.fromColumnVectors(
        this.points[1].subtract(this.points[0]),
        this.points[2].subtract(this.points[0]),
        this.points[1].subtract(this.points[0]).crossProduct(this.points[2].subtract(this.points[0]))
      );
      const invMatrix = matrix.inverse();
      const xyzToUvw = xyz => invMatrix.multiply(xyz.subtract(this.points[0]));
      const uvwToXyz = uvw => matrix.multiply(uvw).add(this.points[0]);
      const xyzToUv = xyz => {
        const uvw = xyzToUvw(xyz);
        return new Vector2(uvw.x, uvw.y);
      };
      const uvToXyz = uv => {
        const uvw = new Vector3(uv.x, uv.y, 0);
        return uvwToXyz(uvw);
      };
      const thisUv = new Triangle2D(...this.points.map(xyzToUv));
      const lineXyz = this.plane().intersection(other.plane)[0];
      const lineUv = Line2D.through(xyzToUv(lineXyz.a), xyzToUv(lineXyz.a.add(lineXyz.d)));
      const normalUv = xyzToUv(lineXyz.a.add(other.normal)).subtract(xyzToUv(lineXyz.a)).innerProduct(new Vector2(lineUv.a, lineUv.b)) > 0
        ? new Vector2(lineUv.a, lineUv.b)
        : new Vector2(-lineUv.a, -lineUv.b);
      const halfUniverseUv = new HalfUniverse2D(lineUv, normalUv);
      const diffUv = thisUv.subtract(halfUniverseUv);
      if (diffUv.length === 0) return [];
      return [new Polygon3D(...diffUv[0].points.map(uvToXyz))];
    } else {
      return super.subtract(other);
    }
  }
  blendRates(p) { // pがthisと同一平面上にあることが前提
    const uvw = Matrix.fromColumnVectors(
      this.points[1].subtract(this.points[0]),
      this.points[2].subtract(this.points[0]),
      this.points[1].subtract(this.points[0]).crossProduct(this.points[2].subtract(this.points[0]))
    ).inverse().multiply(p.subtract(this.points[0]));
    return [1 - uvw.x - uvw.y, uvw.x, uvw.y];
  }
}
