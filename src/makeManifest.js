const { createHash } = require("crypto");
const { promises: fs } = require("fs");
const path = require("path");

const ignoreFiles = ['manifest.json', 'signature', 'certs']

/**
 * @param {Buffer} data
 */
const getHash = (data) => {
  const sha = createHash("sha1");
  sha.update(data);
  return sha.digest("hex");
};

/**
 * @param {string} absFile
 */
const getHashForFile = async (absFile) => {
  const content = await fs.readFile(absFile);

  return getHash(content);
};

/**
 * Creates manifest.json
 * @param {string} dir
 * @param {Record<string, string>} data
 */
const saveManifest = async (dir, data) =>
  fs.writeFile(
    path.join(dir, "manifest.json"),
    JSON.stringify(data, undefined, 3),
    { encoding: "utf-8" }
  );

/**
 * @param {string} dir
 */
const makeManifest = async (dir) => {
  const dirname = path.join(__dirname, "..", dir);
  const files = await fs.readdir(dirname);

  /**
   * @type {Record<string, string>}
   * this will be the manifest.json file contents
   */
  const manifest = {};

  await Promise.all(
    files.map(async (file) => {
      // ignore manifest.json & signature (& certs)
      if (ignoreFiles.includes(file)) {
        return;
      }
      
      // TODO: we should eventually support dirs
      const hash = await getHashForFile(path.join(dirname, file));

      console.log({ [file]: hash });

      manifest[file] = hash;
    })
  );

  await saveManifest(dirname, manifest);
};

module.exports = makeManifest;
