import path from "path";
import {fromByteArray} from "base64-js";
import mime from "mime";

export default {
  async readBinaryAsync(arg) {
    if (arg instanceof Uint8Array) {
      return arg;
    } else if (typeof(arg) === "string") {
      return await this.readBinaryFromFilePathAsync(arg);
    } else if (arg instanceof File) {
      return await this.readBinaryFromFileAsync(arg);
    } else if (typeof(arg.file) === "function") {
      return await this.readBinaryFromFileEntryAsync(arg);
    } else {
      throw new TypeError("Unknown argument type");
    }
  },
  readBinaryFromFilePathAsync(filePath) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", filePath, true);
      xhr.responseType = "arraybuffer";
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(new Uint8Array(xhr.response));
        } else {
          reject(`${xhr.status} ${xhr.statusText}`);
        }
      };
      xhr.onerror = () => {
        reject(xhr.statusText);
      };
      xhr.send();
    });
  },
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
  readFileFromFileEntryAsync(fileEntry) {
    return new Promise((resolve, reject) => {
      fileEntry.file(resolve, reject);
    });
  },
  async readBinaryFromFileEntryAsync(fileEntry) {
    const file = await this.readFileFromFileEntryAsync(fileEntry);
    return await this.readBinaryFromFileAsync(file);
  },
  saveBinaryAsFile(binary, fileName, mimeType = this.getMIMEType(fileName)) {
    const blob = new Blob([binary], {type: mimeType});
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
  },
  async createFileHierarchyFromDirectoryEntryAsync(directoryEntry) {
    function readEntriesAsync(d) {
      return new Promise((resolve, reject) => {
        d.createReader().readEntries(entries => resolve(Array.from(entries)), reject);
      });
    }
    return new Map(await Promise.all(
      (await readEntriesAsync(directoryEntry)).map(async entry =>
        entry.isFile
          ? [file.name, await this.readFileFromFileEntryAsync(entry)]
          : [file.name, await this.createFileHierarchyFromDirectoryEntryAsync(entry)]
      )
    ));
  },
  toDataURLFromBinary(binary, extname = "") {
    return `data:${this.getMIMEType(extname)};base64,${fromByteArray(binary)}`;
  },
  getMIMEType(fileName) {
    const extname = fileName.startsWith(".") ? fileName : path.extname(fileName);
    let mimeType = mime.getType(extname.replace(/^\./, ""));
    if (mimeType === null) mimeType = "application/octet-stream";
    return mimeType;
  },
};
