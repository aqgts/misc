import path from "path";
import BinaryUtils from "./binary-utils";

export default class ImageWrapper {
  constructor(arg) {
    let context;
    if (arg.tagName === "IMG") {
      this.canvas = document.createElement("canvas");
      this.canvas.width = arg.width;
      this.canvas.height = arg.height;
      context = this.canvas.getContext("2d");
      context.drawImage(arg, 0, 0);
    } else if (arg.tagName === "CANVAS") {
      this.canvas = arg;
      context = this.canvas.getContext("2d");
    } else {
      throw new Error("Unknown argument type");
    }
    this.imageData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
  getPixel(x, y) {
    const offset = (y * this.imageData.width + x) * 4;
    return {
      red: this.imageData.data[offset],
      green: this.imageData.data[offset + 1],
      blue: this.imageData.data[offset + 2],
      alpha: this.imageData.data[offset + 3]
    };
  }
  getColorByUV(u, v) {
    const x = (u % 1) * this.canvas.width - 0.5;
    const y = (v % 1) * this.canvas.height - 0.5;
    const baseX = Math.floor(x);
    const baseY = Math.floor(y);
    const fractionX = x % 1;
    const fractionY = y % 1;
    const getPixelSafely = (originalX, originalY) => {
      return this.getPixel(_.clamp(originalX, 0, this.canvas.width - 1), _.clamp(originalY, 0, this.canvas.height - 1));
    };
    const blendRate1 = (1 - fractionX) * (1 - fractionY);
    const pixel1 = getPixelSafely(baseX, baseY);
    const blendRate2 = fractionX * (1 - fractionY);
    const pixel2 = getPixelSafely(baseX + 1, baseY);
    const blendRate3 = (1 - fractionX) * fractionY;
    const pixel3 = getPixelSafely(baseX, baseY + 1);
    const blendRate4 = fractionX * fractionY;
    const pixel4 = getPixelSafely(baseX + 1, baseY + 1);
    function calc(propertyName) {
      return (blendRate1 * pixel1[propertyName] + blendRate2 * pixel2[propertyName] + blendRate3 * pixel3[propertyName] + blendRate4 * pixel4[propertyName]) / 255;
    }
    return {
      red: calc("red"),
      green: calc("green"),
      blue: calc("blue"),
      alpha: calc("alpha")
    };
  }
  async exportToBinaryAsync(extname) {
    const mimeType = BinaryUtils.getMIMEType(extname);
    const blob = await new Promise((resolve, reject) => {
      this.canvas.toBlob(resolve, mimeType)
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
          const canvas = THREE.TGALoader().parse(binary.buffer);
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
