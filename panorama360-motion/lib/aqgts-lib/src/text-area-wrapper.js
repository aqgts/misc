import NullTextArea from "./null-text-area";

export default class TextAreaWrapper {
  constructor(textArea = new NullTextArea()) {
    this.textArea = textArea;
  }
  clear() {
    this.textArea.value = "";
  }
  clearAsync() {
    return new Promise((resolve, reject) => {
      this.clear();
      setImmediate(resolve);
    });
  }
  append(message) {
    this.textArea.value += message + "\n";
    this.textArea.scrollTop = this.textArea.scrollHeight;
  }
  appendAsync(message) {
    return new Promise((resolve, reject) => {
      this.append(message);
      setImmediate(resolve);
    });
  }
  update(message) {
    const lines = this.textArea.value.split(/\n/).slice(0, -1);
    if (lines[lines.length - 1] === message) return false;
    this.textArea.value = lines.slice(0, -1).map(line => line + "\n").join("") + message + "\n";
    this.textArea.scrollTop = this.textArea.scrollHeight;
    return true;
  }
  updateAsync(message) {
    return new Promise((resolve, reject) => {
      if (this.update(message)) setImmediate(resolve);
      else resolve();
    });
  }
  progress(message, count) {
    if (arguments.length === 2) {
      this.registeredMessage = message;
      this.registeredCount = count;
      this.registeredIndex = 0;
      this.append(`${message}(0%)`);
      return true;
    } else if (arguments.length === 0) {
      this.registeredIndex++;
      return this.update(`${this.registeredMessage}(${Math.floor(this.registeredIndex / this.registeredCount * 1000) / 10}%)`);
    }
  }
  progressAsync(...args) {
    return new Promise((resolve, reject) => {
      if (this.progress(...args)) setImmediate(resolve);
      else resolve();
    });
  }
}
