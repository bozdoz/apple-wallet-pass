const makeManifest = require("./makeManifest");
const makeSignature = require("./makeSignature");

const main = async () => {
  const dir = process.argv[2];

  if (dir == null) {
    throw new Error(
      "You must pass a directory name; example: npm start -- ./7bays.pass"
    );
  }

  await makeManifest(dir);
  console.log("Created manifest.json");

  await makeSignature(dir);
  console.log("Created signature");
};

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
