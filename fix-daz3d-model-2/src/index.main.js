import "babel-polyfill";
import Core from "./core";
import TextAreaWrapper from "../lib/aqgts-lib/src/text-area-wrapper";
import BinaryUtils from "../lib/aqgts-lib/src/binary-utils";

let log = null;
let modelFile = null;
new Vue({
  el: ".container",
  data: {
    isLoading: true,
    isProcessing: false
  },
  computed: {
  },
  methods: {
    updateModelFile(event) {
      modelFile = event.target.files.length > 0 ? event.target.files[0] : null;
    },
    async createModel() {
      this.isProcessing = true;
      try {
        log.clear();
        const binary = await Core.run(await BinaryUtils.readBinaryFromFileAsync(modelFile), log);
        BinaryUtils.saveBinaryAsFile(binary, modelFile.name.replace(/\.pmx$/, "_out.pmx"));
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
    this.isLoading = false;
  }
});
