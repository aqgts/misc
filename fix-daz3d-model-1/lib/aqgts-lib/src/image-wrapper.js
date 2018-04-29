import path from "path";
import Color from "color";
import BinaryUtils from "./binary-utils";
import MyMath from "./my-math";

const _canvas = Symbol("canvas");
const _context = Symbol("context");
const _imageData = Symbol("imageData");
export default class ImageWrapper {
  constructor(arg) {
    let context;
    if (arg.tagName === "IMG") {
      this[_canvas] = document.createElement("canvas");
      this[_canvas].width = arg.width;
      this[_canvas].height = arg.height;
      this[_context] = this[_canvas].getContext("2d");
      this[_context].drawImage(arg, 0, 0);
    } else if (arg.tagName === "CANVAS") {
      this[_canvas] = arg;
      this[_context] = this[_canvas].getContext("2d");
    } else {
      throw new Error("Unknown argument type");
    }
    this[_imageData] = null;
  }
  clone() {
    const newCanvas = document.createElement("canvas");
    newCanvas.width = this[_canvas].width;
    newCanvas.height = this[_canvas].height;
    newCanvas.getContext("2d").drawImage(this[_canvas], 0, 0);
    return new this.constructor(newCanvas);
  }
  getCanvas() {
    return this[_canvas];
  }
  getWidth() {
    return this[_canvas].width;
  }
  getHeight() {
    return this[_canvas].height;
  }
  updateCanvas(callback) {
    callback.call(this, this[_canvas], this[_context]);
    this[_imageData] = null;
  }
  async updateCanvasAsync(asyncCallback) {
    await asyncCallback.call(this, this[_canvas], this[_context]);
    this[_imageData] = null;
  }
  getPixel(x, y) {
    if (this[_imageData] === null) {
      this[_imageData] = this[_context].getImageData(0, 0, this[_canvas].width, this[_canvas].height);
    }
    const offset = (y * this[_imageData].width + x) * 4;
    return Color.rgb(
      this[_imageData].data[offset],
      this[_imageData].data[offset + 1],
      this[_imageData].data[offset + 2],
    ).alpha(
      this[_imageData].data[offset + 3] / 255,
    );
  }
  setPixel(x, y, color) {
    if (color.alpha() < 1) this[_context].clearRect(x, y, 1, 1);
    this[_context].fillStyle = color.string();
    this[_context].fillRect(x, y, 1, 1);
    if (this[_imageData] !== null) {
      const offset = (y * this[_imageData].width + x) * 4;
      this[_imageData].data[offset] = color.red();
      this[_imageData].data[offset + 1] = color.green();
      this[_imageData].data[offset + 2] = color.blue();
      this[_imageData].data[offset + 3] = color.alpha() * 255;
    }
  }
  getColorByUV(u, v) {
    const x = u * this[_canvas].width - 0.5;
    const y = v * this[_canvas].height - 0.5;
    const baseX = Math.floor(x);
    const baseY = Math.floor(y);
    const fractionX = x % 1;
    const fractionY = y % 1;
    const getPixelSafely = (originalX, originalY) => {
      return this.getPixel(MyMath.mod(originalX, this[_canvas].width), MyMath.mod(originalY, this[_canvas].height));
    };
    const blendRate1 = (1 - fractionX) * (1 - fractionY);
    const pixel1 = getPixelSafely(baseX, baseY);
    const blendRate2 = fractionX * (1 - fractionY);
    const pixel2 = getPixelSafely(baseX + 1, baseY);
    const blendRate3 = (1 - fractionX) * fractionY;
    const pixel3 = getPixelSafely(baseX, baseY + 1);
    const blendRate4 = fractionX * fractionY;
    const pixel4 = getPixelSafely(baseX + 1, baseY + 1);
    return Color.rgb(
      blendRate1 * pixel1.red() + blendRate2 * pixel2.red() + blendRate3 * pixel3.red() + blendRate4 * pixel4.red(),
      blendRate1 * pixel1.green() + blendRate2 * pixel2.green() + blendRate3 * pixel3.green() + blendRate4 * pixel4.green(),
      blendRate1 * pixel1.blue() + blendRate2 * pixel2.blue() + blendRate3 * pixel3.blue() + blendRate4 * pixel4.blue(),
    ).alpha(
      blendRate1 * pixel1.alpha() + blendRate2 * pixel2.alpha() + blendRate3 * pixel3.alpha() + blendRate4 * pixel4.alpha(),
    );
  }
  applyGaussianBlur(sigma) {
    const cutoff = Math.ceil(sigma * 3);
    function G(x, y) {
      return sigma > 0 ? Math.exp(-(x ** 2 + y ** 2) / (2 * sigma ** 2)) / (2 * Math.PI * sigma ** 2) : x === 0 && y === 0 ? 1 : 0;
    }
    const baseB = new Array(cutoff * 2 + 1).fill().map((_, x) => new Array(cutoff * 2 + 1).fill().map((_, y) => G(x - cutoff, y - cutoff)));
    function B(dx, dy) {
      return baseB[dx + cutoff][dy + cutoff];
    }
    const pixels = new Array(this[_canvas].width).fill().map(() => new Array(this[_canvas].height).fill().map(() => [0, 0, 0]));
    for (let x = 0; x < this[_canvas].width; x++) {
      for (let y = 0; y < this[_canvas].height; y++) {
        for (let dx = -cutoff; dx <= cutoff; dx++) {
          for (let dy = -cutoff; dy <= cutoff; dy++) {
            const color = this.getPixel(MyMath.mod(x + dx, this[_canvas].width), MyMath.mod(y + dy, this[_canvas].height));
            const coefficient = B(dx, dy);
            pixels[x][y][0] += coefficient * color.red();
            pixels[x][y][1] += coefficient * color.green();
            pixels[x][y][2] += coefficient * color.blue();
          }
        }
      }
    }
    for (let x = 0; x < this[_canvas].width; x++) {
      for (let y = 0; y < this[_canvas].height; y++) {
        this.setPixel(x, y, Color.rgb(...pixels[x][y]));
      }
    }
    return this;
  }
  disableAlpha() {
    if (this[_imageData] === null) {
      this[_imageData] = this[_context].getImageData(0, 0, this[_canvas].width, this[_canvas].height);
    }
    for (let y = 0; y < this[_canvas].height; y++) {
      for (let x = 0; x < this[_canvas].width; x++) {
        const offset = (y * this[_imageData].width + x) * 4;
        this[_imageData].data[offset + 3] = 255;
      }
    }
    this[_context].putImageData(this[_imageData], 0, 0);
  }
  async exportToBinaryAsync(extname) {
    const mimeType = BinaryUtils.getMIMEType(extname);
    const blob = await new Promise((resolve, reject) => {
      this[_canvas].toBlob(resolve, mimeType);
    });
    return await BinaryUtils.readBinaryFromFileAsync(blob);
  }
  static async importAsync(...args) {
    switch (args.length) {
    case 1:
      if (typeof(args[0]) === "string") {
        const [arg] = args;
        if (arg.endsWith(".tga")) {
          const binary = await BinaryUtils.readBinaryFromFilePathAsync(arg);
          return await this.importAsync(binary, ".tga");
        } else {
          return new this(await new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", reject);
            image.setAttribute("src", arg);
          }));
        }
      } else if (args[0] instanceof File) {
        const [file] = args;
        const binary = await BinaryUtils.readBinaryFromFileAsync(file);
        return await this.importAsync(binary, path.extname(file.name));
      } else if (typeof(args[0].file) === "function") {
        const [fileEntry] = args;
        const file = await BinaryUtils.readFileFromFileEntryAsync(fileEntry);
        return await this.importAsync(file);
      } else {
        throw new TypeError("Unknown argument type");
      }
      break;
    case 2:
      if (args[0] instanceof Uint8Array && typeof(args[1]) === "string") {
        const [binary, extname] = args;
        if (extname === ".tga") {
          const canvas = new THREE.TGALoader().parse(binary.buffer);
          return new this(canvas);
        } else {
          return await this.importAsync(BinaryUtils.toDataURLFromBinary(binary, extname));
        }
      } else {
        throw new TypeError("Unknown argument types");
      }
      break;
    default:
      throw new TypeError("Unknown arguments length");
    }
  }
}
