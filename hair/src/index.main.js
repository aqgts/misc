import "babel-polyfill";
import Core from "./core";
import TextAreaWrapper from "../lib/aqgts-lib/src/text-area-wrapper";
import BinaryUtils from "../lib/aqgts-lib/src/binary-utils";

let log = null;
new Vue({
  el: ".container",
  data: {
    n: 5,
    m: 10,
    maxDeg: 3,
    width: 250,
    height: 30,
    red: 0.21176470588,
    green: 0.55294117647,
    blue: 0.76078431372,
    isLoaded: false,
    isProcessing: false
  },
  computed: {
  },
  methods: {
    async createModel() {
      this.isProcessing = true;
      try {
        log.clear();
        const binary = await Core.run(Number(this.n), Number(this.m), Number(this.maxDeg), Number(this.width), Number(this.height), Number(this.red), Number(this.green), Number(this.blue), log);
        BinaryUtils.saveBinaryAsFile(binary, "hair.pmx");
        await log.appendAsync("モデルの作成に成功しました");
      } catch (error) {
        await log.appendAsync(`[Error]${error}`);
        throw error;
      } finally {
        this.isProcessing = false;
      }
    }
  },
  watch: {
  },
  mounted() {
    log = new TextAreaWrapper(document.getElementById("log"));
    this.isLoaded = true;
  }
});
