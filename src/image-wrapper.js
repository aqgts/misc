export default class ImageWrapper {
  constructor(image) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    const context = this.canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    this.imageData = context.getImageData(0, 0, image.width, image.height);
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
}
