const { spawn } = require("child_process");
const path = require("path");

/**
 * TODO: Maybe use JS zipping library to stream instead of spawning
 * @param {string} dir
 */
const makeZip = async (dir) =>
  new Promise((resolve, reject) => {
    const basename = path.basename(dir);
    const [name] = basename.split(".");
    const cmd = "zip"
    const args = ["-r", `../${name}.pkpass`, ".",  "-x", "certs/*"]

    console.log("from", `${dir}:`)
    console.log(" ", cmd, ...args)

    const zip = spawn(cmd, args, {
      cwd: dir,
    });

    zip.stdout.pipe(process.stdout);
    zip.stderr.pipe(process.stderr);

    zip.on('error', (err) => {
      reject(`failed to start zip: ${err.message}`)
    });

    zip.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('Failed to zip'));
      } else {
        resolve();
      }
    })
  });

module.exports = makeZip;
