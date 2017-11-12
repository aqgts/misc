export default {
  readBinaryFromFileAsync(inputFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(new Uint8Array(reader.result));
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(inputFile);
    });
  },
  saveBinaryAsFile(binary, fileName, mime = "application/octet-stream") {
    const blob = new Blob([binary], {type: mime});
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, fileName);
    } else {
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.setAttribute("href", URL.createObjectURL(blob));
      a.setAttribute("download", fileName);
      a.click();
      document.body.removeChild(a);
    }
  },
  readImageFromFileAsync(inputFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
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
