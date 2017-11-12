export default class Cuboid {
  constructor(x, y, z, width, height, length) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.length = length;
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.width, this.height, this.length);
  }
  intersects(other) {
    return Math.max(this.x, other.x) <= Math.min(this.x + this.width, other.x + other.width) &&
      Math.max(this.y, other.y) <= Math.min(this.y + this.height, other.y + other.height) &&
      Math.max(this.z, other.z) <= Math.min(this.z + this.length, other.z + other.length);
  }
}
