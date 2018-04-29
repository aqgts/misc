import "babel-polyfill";
import Color from "color";
import Core from "../core";
import TextAreaWrapper from "../../lib/aqgts-lib/src/text-area-wrapper";
import ImageWrapper from "../../lib/aqgts-lib/src/image-wrapper";
import ExtendedPMX from "../../lib/aqgts-lib/src/extended-pmx";
import UnifiedPMX from "../../lib/aqgts-lib/src/unified-pmx";
import BinaryUtils from "../../lib/aqgts-lib/src/binary-utils";

let log = null;
new Vue({
  el: ".container",
  data: {
    isLoading: true,
    isProcessing: false,
  },
  computed: {
  },
  methods: {
    async transform() {
      this.isProcessing = true;
      try {
        log.clear();

        await log.appendAsync("モデル読み込み中...");
        const unifiedModel = await UnifiedPMX.importAsync("resources/model.pmx");
        const {footHeightmap} = await Core.transformAsync(unifiedModel, log);

        await log.progressAsync("モデル保存中...", 3);
        const zip = new JSZip();
        zip.file("model.zip", await unifiedModel.exportToBinaryAsync("output.pmx"));
        await log.progressAsync();
        zip.file("footHeightmap.png", await footHeightmap.exportToBinaryAsync(".png"));
        await log.progressAsync();
        BinaryUtils.saveBinaryAsFile(await zip.generateAsync({type: "uint8array"}), "output.zip");
        await log.progressAsync();
        // await log.appendAsync("モデル描画中...");
        // await Core.renderAsync(document.querySelector("#preview"), unifiedModel);

        await log.appendAsync("処理が完了しました");
      } catch (error) {
        await log.appendAsync(`[Error]${error}`);
        throw error;
      } finally {
        this.isProcessing = false;
      }
    },
    async transformSimply(event) {
      const modelFile = event.target.files.length > 0 ? event.target.files[0] : null;
      if (modelFile === null) return;

      this.isProcessing = true;
      try {
        log.clear();

        await log.appendAsync("モデル読み込み中...");
        const model = await ExtendedPMX.importAsync(modelFile);

        await Core.transformSimplyAsync(model, log);

        await log.appendAsync("モデル保存中...");
        BinaryUtils.saveBinaryAsFile(await model.write(), "output.pmx");

        await log.appendAsync("処理が完了しました");
      } catch (error) {
        await log.appendAsync(`[Error]${error}`);
        throw error;
      } finally {
        this.isProcessing = false;
      }
    },
    async firmUp(event) {
      const modelFile = event.target.files.length > 0 ? event.target.files[0] : null;
      if (modelFile === null) return;

      this.isProcessing = true;
      try {
        log.clear();

        await log.appendAsync("モデル読み込み中...");
        const model = await ExtendedPMX.importAsync(modelFile);

        await Core.firmUpAsync(model, log);

        await log.appendAsync("モデル保存中...");
        BinaryUtils.saveBinaryAsFile(await model.write(), "output.pmx");

        await log.appendAsync("処理が完了しました");
      } catch (error) {
        await log.appendAsync(`[Error]${error}`);
        throw error;
      } finally {
        this.isProcessing = false;
      }
    },
    async scatter(event) {
      const modelFile = event.target.files.length > 0 ? event.target.files[0] : null;
      if (modelFile === null) return;

      this.isProcessing = true;
      try {
        log.clear();

        await log.appendAsync("モデル読み込み中...");
        const model = await ExtendedPMX.importAsync(modelFile);

        await Core.scatterAsync(model, 100, 1000, [0.01, 1], log);

        await log.appendAsync("モデル保存中...");
        BinaryUtils.saveBinaryAsFile(await model.write(), "output.pmx");

        await log.appendAsync("処理が完了しました");
      } catch (error) {
        await log.appendAsync(`[Error]${error}`);
        throw error;
      } finally {
        this.isProcessing = false;
      }
    },
    async createHairs() {
      this.isProcessing = true;
      try {
        log.clear();

        const hairs = await Core.createHairsAsync(Color.rgb(54, 141, 194), 250, 30, log);

        await log.appendAsync("モデル保存中...");
        BinaryUtils.saveBinaryAsFile(await hairs.exportToBinaryAsync("output.pmx"), "output.zip");

        await log.appendAsync("処理が完了しました");
      } catch (error) {
        await log.appendAsync(`[Error]${error}`);
        throw error;
      } finally {
        this.isProcessing = false;
      }
    },
    async createHair() {
      this.isProcessing = true;
      try {
        log.clear();

        const hair = await Core.createHairAsync(Color.rgb(54, 141, 194), log);

        await log.appendAsync("モデル保存中...");
        BinaryUtils.saveBinaryAsFile(await hair.exportToBinaryAsync("output.pmx"), "output.zip");

        await log.appendAsync("処理が完了しました");
      } catch (error) {
        await log.appendAsync(`[Error]${error}`);
        throw error;
      } finally {
        this.isProcessing = false;
      }
    },
    async brushUpFingerprint(event) {
      const imageFile = event.target.files.length > 0 ? event.target.files[0] : null;
      if (imageFile === null) return;

      this.isProcessing = true;
      try {
        log.clear();

        await log.appendAsync("画像読み込み中...");
        const image = await ImageWrapper.importAsync(imageFile);

        await Core.brushUpFingerprintAsync(image, 8, log);

        await log.appendAsync("画像保存中...");
        BinaryUtils.saveBinaryAsFile(await image.exportToBinaryAsync(".png"), "output.png");

        await log.appendAsync("処理が完了しました");
      } catch (error) {
        await log.appendAsync(`[Error]${error}`);
        throw error;
      } finally {
        this.isProcessing = false;
      }
    },
    async tmp() {
      this.isProcessing = true;
      try {
        log.clear();

        await log.appendAsync("モデル読み込み中...");
        const model = await ExtendedPMX.importAsync("resources/fingerprint_1000x.pmx");
        const image = await ImageWrapper.importAsync("resources/heightmap.png");

        await Core.tmpAsync(model, image, log);

        await log.appendAsync("モデル保存中...");
        BinaryUtils.saveBinaryAsFile(await model.write(), "output.pmx");

        await log.appendAsync("処理が完了しました");
      } catch (error) {
        await log.appendAsync(`[Error]${error}`);
        throw error;
      } finally {
        this.isProcessing = false;
      }
    },
  },
  watch: {
  },
  mounted() {
    log = new TextAreaWrapper(document.getElementById("log"));
    this.isLoading = false;
  }
});
