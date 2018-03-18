import Vector2 from "./vector2";
import DirectedLineSegment2D from "./directed-line-segment-2d";
import Line2D from "./line-2d";
import Rectangle from "./rectangle";
import MyMath from "./my-math";
import Matrix from "./matrix";

export default class Polygon {
  constructor(...points) { // 起点と終点は同一要素にしなくてよい
    if (points.length < 3) throw new Error("Polygon must have three or more vertices.");
    if (!points.every(point => point instanceof Vector2)) throw new Error("points must be Vector2 array.");
    this.points = points;
    const left = points.reduce((min, point) => Math.min(min, point.x), Number.POSITIVE_INFINITY);
    const right = points.reduce((max, point) => Math.max(max, point.x), Number.NEGATIVE_INFINITY);
    const top = points.reduce((max, point) => Math.max(max, point.y), Number.NEGATIVE_INFINITY);
    const bottom = points.reduce((min, point) => Math.min(min, point.y), Number.POSITIVE_INFINITY);
    this._outline = new Rectangle(left, top, right - left, top - bottom);
  }
  clone() {
    return new this.constructor(...this.points.map(point => point.clone()));
  }
  reverse() {
    return new this.constructor(...this.points.slice().reverse());
  }
  lineSegments() {
    return new Array(this.points.length).fill().map((_, i) => new DirectedLineSegment2D(this.points[i], this.points[(i + 1) % this.points.length]));
  }
  isClockwise() {
    return this.lineSegments().reduce((sum, lineSegment) => sum + (lineSegment.p2.x - lineSegment.p1.x) * (lineSegment.p2.y + lineSegment.p1.y), 0) > 0;
  }
  centerOfGravity() {
    const triangles = this.triangulate();
    const areas = triangles.map(triangle => triangle.area());
    const centersOfGravity = triangles.map(triangle => triangle.centerOfGravity());
    return new Array(triangles.length).fill().map((_, i) => centersOfGravity[i].multiply(areas[i])).reduce((sum, v) => sum.add(v), Vector2.zero).divide(areas.reduce(_.add, 0));
  }
  area() {
    return this.triangulate().map(triangle => triangle.area()).reduce(_.add, 0)
  }
  _contains(p) {
    let cn = 0;
    for (const lineSegment of this.lineSegments()) {
      if ((lineSegment.p1.y <= p.y && p.y < lineSegment.p2.y) || (lineSegment.p2.y <= p.y && p.y < lineSegment.p1.y)) {
        const t = (p.y - lineSegment.p1.y) / (lineSegment.p2.y - lineSegment.p1.y);
        if (p.x < MyMath.lerp(lineSegment.p1.x, lineSegment.p2.x, t)) {
          ++cn;
        }
      }
    }
    return cn % 2 === 1;
  }
  containsProperly(p) {
    return this._outline.containsProperly(p) && (this._contains(p) && !this.lineSegments().some(lineSegment => lineSegment.contains(p)));
  }
  contains(p) {
    return this._outline.contains(p) && (this._contains(p) || this.lineSegments().some(lineSegment => lineSegment.contains(p)));
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
  _createSkeleton(other) {
    const thisVertices = this.points.map(point => ({
      point: point,
      isOutside: !other.contains(point),
      cross: null,
      isInserted: false,
      isProcessed: false
    }));
    if (thisVertices.every(point => !point.isOutside)) return [];
    const otherVertices = other.points.map(point => ({
      point: point,
      isOutside: !this.contains(point),
      cross: null,
      isInserted: false,
      isProcessed: false
    }));
    for (let i = 0; i < thisVertices.length; ++i) {
      for (let j = 0; j < otherVertices.length; ++j) {
        const thisLineSegment = new DirectedLineSegment2D(thisVertices[i].point, thisVertices[(i + 1) % thisVertices.length].point);
        const otherLineSegment = new DirectedLineSegment2D(otherVertices[j].point, otherVertices[(j + 1) % otherVertices.length].point);
        const intersections = thisLineSegment.intersection(otherLineSegment);
        if (intersections.length === 0) continue;
        for (const crossPoint of intersections[0] instanceof DirectedLineSegment2D ? [intersections[0].p1, intersections[0].p2] : [intersections[0]]) {
          const thisVertex = {
            point: crossPoint,
            isOutside: false,
            isInserted: false,
            isProcessed: false
          };
          const otherVertex = {
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
      }
    }
    for (let i = 0; i < thisVertices.length; ++i) {
      if (thisVertices[i].cross === null || thisVertices[(i + 1) % thisVertices.length].cross === null) continue;
      const insertedPoint = thisVertices[i].point.add(thisVertices[(i + 1) % thisVertices.length].point).divide(2);
      if (other.contains(insertedPoint)) continue;
      thisVertices.splice(i + 1, 0, {
        point: insertedPoint,
        isOutside: true,
        cross: null,
        isInserted: true,
        isProcessed: false
      });
      ++i;
    }
    for (let i = 0; i < otherVertices.length; ++i) {
      if (otherVertices[i].cross === null || otherVertices[(i + 1) % otherVertices.length].cross === null) continue;
      const insertedPoint = otherVertices[i].point.add(otherVertices[(i + 1) % otherVertices.length].point).divide(2);
      if (this.contains(insertedPoint)) continue;
      otherVertices.splice(i + 1, 0, {
        point: insertedPoint,
        isOutside: true,
        cross: null,
        isInserted: true,
        isProcessed: false
      });
      ++i;
    }
    for (let i = 0; i < thisVertices.length; ++i) thisVertices[i].index = i;
    for (let i = 0; i < otherVertices.length; ++i) otherVertices[i].index = i;

    function opposite(currentVertices) {
      return currentVertices === thisVertices ? otherVertices : thisVertices;
    }
    function next(currentVertices, currentVertex) {
      return currentVertices[(currentVertex.index + 1) % currentVertices.length];
    }

    return {thisVertices, otherVertices, opposite, next};
  }
  union(other) { // 時計回りでない場合、時計回りに矯正される
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

    const {thisVertices, otherVertices, opposite, next} = this._createSkeleton(other);
    if (thisVertices.every(thisVertex => thisVertex.cross === null)) {
      if (!thisVertices[0].isOutside) return [other];
      if (!otherVertices[0].isOutside) return [this];
      return [this, other];
    }

    const start = _(
      thisVertices.map(thisVertex => ({vertices: thisVertices, vertex: thisVertex}))
        .concat(otherVertices.map(otherVertex => ({vertices: otherVertices, vertex: otherVertex})))
        .filter(({vertices, vertex}) => vertex.isOutside)
    ).minBy(({vertices, vertex}) => vertex.index);
    const outputVertices = [start.vertex];
    let currentVertex = start.vertex;
    let currentVertices = start.vertices;
    while (true) {
      currentVertex = next(currentVertices, currentVertex);
      currentVertex.isProcessed = true;
      if (currentVertex === start.vertex) break;
      outputVertices.push(currentVertex);
      if (
        currentVertex.cross !== null &&
        next(opposite(currentVertices), currentVertex.cross).isOutside
      ) {
        currentVertex = currentVertex.cross;
        currentVertices = opposite(currentVertices);
      }
    }
    return [new Polygon(...outputVertices.filter(vertex => !vertex.isInserted).map(vertex => vertex.point))];
  }
  intersection(other) { // 時計回りでない場合、時計回りに矯正される
    if (other instanceof Polygon) {
      if (!this.isClockwise()) {
        return this.reverse().intersection(other);
      }
      if (!other.isClockwise()) {
        return this.intersection(other.reverse());
      }

      // TODO: Polygon同士が接する場合、共通部分が算出されない
      return this.subtract(other).reduce((results, polygon) => _(results).flatMap(result => result.subtract(polygon)).value(), [this]);
    } else {
      throw new Error("Unknown type");
    }
  }
  subtract(other) { // 時計回りでない場合、時計回りに矯正される
    if (!this.isClockwise()) {
      return this.reverse().subtract(other);
    }
    if (!other.isClockwise()) {
      return this.subtract(other.reverse());
    }

    {
      const intersections = this._outline.intersection(other._outline);
      if (intersections.length === 0 || !(intersections[0] instanceof Rectangle)) return [this];
    }

    const {thisVertices, otherVertices, opposite, next} = this._createSkeleton(other.reverse());
    if (thisVertices.every(thisVertex => thisVertex.cross === null)) {
      if (!thisVertices[0].isOutside) return [];
      if (!otherVertices[0].isOutside) { // otherがthisの内側に完全に入っている場合（接している場合は含まない）
        const [bridgeI, bridgeJ, bridge] = _(MyMath.cartesianProduct(_.range(0, this.points.length), _.range(0, other.points.length)))
          .map(([i, j]) => [i, j, new DirectedLineSegment2D(this.points[i], other.points[j])])
          .sortBy(([i, j, lineSegment]) => lineSegment.squaredLength())
          .find(([i, j, lineSegment]) => this.lineSegments().concat(other.lineSegments()).every(frame => {
            const crossPoint = frame.crossPoint(lineSegment);
            return crossPoint === null || crossPoint.equals(lineSegment.p1) || crossPoint.equals(lineSegment.p2);
          }));
        const thisPoints = this.points.slice();
        const otherPoints = other.points.slice();
        while (otherPoints[0] !== bridge.p2) {
          otherPoints.unshift(otherPoints.pop());
        }
        thisPoints.splice(bridgeI + 1, 0, ...otherPoints.concat([otherPoints[0]]).reverse(), thisPoints[bridgeI]);
        return [new Polygon(...thisPoints)];
      }
      return [this];
    }

    const polygons = [];
    while (true) {
      const startVertex = _(thisVertices.filter(vertex => !vertex.isProcessed && vertex.isOutside)).minBy(vertex => vertex.index);
      if (typeof(startVertex) === "undefined") break;
      const outputVertices = [startVertex];
      startVertex.isProcessed = true;
      let currentVertex = startVertex;
      let currentVertices = thisVertices;
      while (true) {
        currentVertex = next(currentVertices, currentVertex);
        currentVertex.isProcessed = true;
        if (currentVertex === startVertex) break;
        outputVertices.push(currentVertex);
        if (
          currentVertex.cross !== null &&
          (
            (currentVertices === thisVertices && !next(opposite(currentVertices), currentVertex.cross).isOutside) ||
            (currentVertices === otherVertices && next(opposite(currentVertices), currentVertex.cross).isOutside)
          ) &&
          next(opposite(currentVertices), currentVertex.cross).cross !== next(currentVertices, currentVertex)
        ) {
          currentVertex = currentVertex.cross;
          currentVertex.isProcessed = true;
          currentVertices = opposite(currentVertices);
        }
      }
      polygons.push(new Polygon(...outputVertices.filter(vertex => !vertex.isInserted).map(vertex => vertex.point)));
    }

    return polygons;
  }
  triangulate() {
    function outer(p1, p2) {
      return p1.x * p2.y - p1.y * p2.x;
    }
    const triangles = [];
    const points = Array.from(this.points);
    while (points.length > 3) {
      let targetID = _(points.map((point, i) => [point, i])).maxBy(([point, i]) => point.squaredNorm())[1];
      let previousID = targetID - 1 < 0 ? points.length - 1 : targetID - 1;
      let nextID = (targetID + 1) % points.length;
      const outerProduct2 = outer(points[targetID].subtract(points[previousID]), points[nextID].subtract(points[targetID]));
      while (true) {
        const outerProduct = outer(points[targetID].subtract(points[previousID]), points[nextID].subtract(points[targetID]));
        if (points.every((point, i) =>
          i === previousID ||
          i === targetID ||
          i === nextID ||
          outer(points[targetID].subtract(points[previousID]), point.subtract(points[previousID])) * outerProduct <= 0 ||
          outer(points[nextID].subtract(points[targetID]), point.subtract(points[targetID])) * outerProduct <= 0 ||
          outer(points[previousID].subtract(points[nextID]), point.subtract(points[nextID])) * outerProduct <= 0
        )) {
          triangles.push(new Triangle2D(points[previousID], points[targetID], points[nextID]));
          points.splice(targetID, 1);
          break;
        } else {
          do {
            previousID = targetID;
            targetID = nextID;
            nextID = (nextID + 1) % points.length;
          } while (outer(points[targetID].subtract(points[previousID]), points[nextID].subtract(points[targetID])) * outerProduct2 < 0);
        }
      }
    }
    triangles.push(new Triangle2D(points[0], points[1], points[2]));
    return triangles;
  }
}
export class Triangle2D extends Polygon {
  constructor(...points) {
    if (points.length !== 3 || points[0].equals(points[1]) || points[1].equals(points[2]) || points[2].equals(points[0])) throw new Error("Triangle must have three different vertices.");
    super(...points);
  }
  blendRates(p) {
    const uv = Matrix.fromColumnVectors(this.points[1].subtract(this.points[0]), this.points[2].subtract(this.points[0])).inverse().multiply(p.subtract(this.points[0]));
    return [1 - uv.x - uv.y, uv.x, uv.y];
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
    if (other instanceof DirectedLineSegment2D) {
      const contains = p => {
        const ab = this.points[1].subtract(this.points[0]);
        const ap = p.subtract(this.points[0]);
        const bc = this.points[2].subtract(this.points[1]);
        const bp = p.subtract(this.points[1]);
        const ca = this.points[0].subtract(this.points[2]);
        const cp = p.subtract(this.points[2]);
        const crossProduct1 = ab.x * ap.y - ab.y * ap.x;
        const crossProduct2 = bc.x * bp.y - bc.y * bp.x;
        const crossProduct3 = ca.x * cp.y - ca.y * cp.x;
        if (crossProduct1 > 0 || crossProduct2 > 0 || crossProduct3 > 0) return "not contain";
        if (crossProduct1 < 0 && crossProduct2 < 0 && crossProduct3 < 0) return "contain";
        return "on boundary";
      }
      const p1State = contains(other.p1);
      const p2State = contains(other.p2);
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
        return [new DirectedLineSegment2D(other.p1, this.lineSegments().map(lineSegment => lineSegment.crossPoint(other)).find(crossPoint => crossPoint !== null))];
      case "not contain, contain":
        return [new DirectedLineSegment2D(this.lineSegments().map(lineSegment => lineSegment.crossPoint(other)).find(crossPoint => crossPoint !== null), other.p2)];
      case "not contain, not contain":
        const crossPoints = Array.from(new Set(this.lineSegments().map(lineSegment => lineSegment.crossPoint(other)).filter(crossPoint => crossPoint !== null).map(crossPoint => Array.from(crossPoint).join(","))))
          .map(string => string.split(","))
          .map(([x, y]) => new Vector2(Number(x), Number(y)));
        switch (crossPoints.length) {
        case 2:
          if (other.toVector().innerProduct(crossPoints[1].subtract(crossPoints[0])) > 0) {
            return [new DirectedLineSegment2D(crossPoints[0], crossPoints[1])];
          } else {
            return [new DirectedLineSegment2D(crossPoints[1], crossPoints[0])];
          }
        case 1:
          return [crossPoints[0]];
        case 0:
          return [];
        }
      }
    } else if (other instanceof Line2D) {
      const intersections = this.lineSegments().map(lineSegment => lineSegment.intersection(other)).map(intersection => intersection.length === 0 ? null : intersection[0]);
      const lineSegmentIntersection = intersections.find(intersection => intersection instanceof DirectedLineSegment2D);
      if (typeof(lineSegmentIntersection) !== "undefined") return [lineSegmentIntersection];
      const pointIntersections = intersections.filter(intersection => intersection instanceof Vector2);
      switch (pointIntersections.length) {
      case 3:
        if (pointIntersections[0].equals(pointIntersections[1])) return [new DirectedLineSegment2D(pointIntersections[0], pointIntersections[2])];
        if (pointIntersections[1].equals(pointIntersections[2])) return [new DirectedLineSegment2D(pointIntersections[1], pointIntersections[0])];
        if (pointIntersections[2].equals(pointIntersections[0])) return [new DirectedLineSegment2D(pointIntersections[2], pointIntersections[1])];
        throw new Error("Invalid condition");
      case 2:
        if (pointIntersections[0].equals(pointIntersections[1])) return [pointIntersections[0]];
        else return [new DirectedLineSegment2D(pointIntersections[0], pointIntersections[1])];
      case 1:
        throw new Error("Invalid condition");
      case 0:
        return [];
      }
    } else {
      super.intersection(other);
    }
  }
}
