const path = require("path");
const { promises: fs } = require("fs");

const templateDir = path.resolve(__dirname, "templates");

/**
 * Replace {{VARS}} with env vars of the same name
 * in pass.json
 * @param {string} dir
 */
const makePass = async (dir) => {
  const basename = path.basename(dir);
  const [name] = basename.split(".");

  // check for template
  try {
    const template = await fs.readFile(
      path.join(templateDir, `${name}-pass.json`),
      { encoding: "utf-8" }
    );

    // great! we have a template!

    // fill in any env vars
    const pass = template.replace(/{{(.*?)}}/gi, (_match, placeholder) => {
      // use the found variable or empty it completely
      return process.env[placeholder] || "";
    });

    // write to pass
    await fs.writeFile(path.join(dir, "pass.json"), pass, {
      encoding: "utf-8",
    });
    console.log("Used template", `${name}-pass.json`);
  } catch (e) {
    console.log("no template found");
    throw e;
  }
};

module.exports = makePass;
