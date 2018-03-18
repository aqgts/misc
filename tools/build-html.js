const util = require("util");
const fs = require("fs");
const path = require("path");
const Mustache = require("mustache");
const view = {cdn: require(path.resolve("tools", "cdn"))};

(async () => {
  const templateDir = "templates";
  const readdir = util.promisify(fs.readdir);
  const readFile = util.promisify(fs.readFile);
  const writeFile = util.promisify(fs.writeFile);
  const filePaths = (await readdir(templateDir)).filter(fileName => path.extname(fileName) === ".mustache").map(fileName => path.join(templateDir, fileName));
  for (const filePath of filePaths) {
    const template = await readFile(filePath, "utf8");
    const output = Mustache.render(template, view);
    const outputFileName = `${path.basename(filePath, ".mustache")}.html`;
    await writeFile(outputFileName, output, "utf8");
  }
})();
