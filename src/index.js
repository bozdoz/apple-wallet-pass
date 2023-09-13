const path = require("path");
const makeManifest = require("./makeManifest");
const makePass = require("./makePass");
const makeSignature = require("./makeSignature");
const makeZip = require("./makeZip");

/** only supports --flag=value or --flag truthiness */
const getFlags = () =>
  process.argv
    .filter((arg) => arg.startsWith("-"))
    .reduce((obj, cur) => {
      const flag = cur.replace(/^-{1,2}/, "");
      const [key, val = true] = flag.split("=");
      obj[key] = val;

      return obj;
    }, {});

const main = async () => {
  const dir = process.env.DIR || process.argv[2];

  const flags = getFlags();

  if (dir == null) {
    throw new Error(
      "You must pass a directory name; example: npm start -- ./7bays.pass"
    );
  }

  const basename = path.basename(dir);
  const [passname] = basename.split(".");

  if (!flags.skipPass) {
    await makePass(dir);
  }

  await makeManifest(dir);
  console.log("Created manifest.json");

  await makeSignature(dir);
  console.log("Created signature");

  await makeZip(dir);
  console.log(`Created ${passname}.pkpass`);
};

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
