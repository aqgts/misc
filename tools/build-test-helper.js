const util = require("util");
const fs = require("fs");
const path = require("path");

(async () => {
  const srcDir = "src";
  const readdir = util.promisify(fs.readdir);
  const writeFile = util.promisify(fs.writeFile);
  const filePaths = (await readdir(srcDir)).filter(fileName => path.extname(fileName) === ".js").map(fileName => path.join("..", "..", srcDir, path.basename(fileName, ".js")));
  const output = ["babel-polyfill"].concat(filePaths).map(filePath => `import "${filePath}";\n`).join("");
  const outputFilePath = path.join("spec", "helpers", "global.js");
  await writeFile(outputFilePath, output, "utf8");
})();
