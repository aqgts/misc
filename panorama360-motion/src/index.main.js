import "babel-polyfill";
import Core from "./core";
import TextAreaWrapper from "../lib/aqgts-lib/src/text-area-wrapper";
import BinaryUtils from "../lib/aqgts-lib/src/binary-utils";

let log = null;
new Vue({
  el: ".container",
  data: {
    x: "0",
    y: "0",
    z: "0",
    unitDegree: "30",
    isLoading: true,
    isProcessing: false
  },
  computed: {
  },
  methods: {
    async createMotion() {
      this.isProcessing = true;
      try {
        log.clear();
        const binary = Core.run(Number(this.x), Number(this.y), Number(this.z), Number(this.unitDegree));
        BinaryUtils.saveBinaryAsFile(binary, "camera.vmd");
        await log.appendAsync("モーションの作成に成功しました");
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
