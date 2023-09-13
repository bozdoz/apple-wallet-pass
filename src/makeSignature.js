const { promises: fs } = require("fs");
const path = require("path");
const forge = require("node-forge");

/**
 * @param {string} absFile
 */
const getFile = async (absFile) => fs.readFile(absFile, { encoding: "utf-8" });

/**
 * @param {string} dir
 */
const makeSignature = async (dir) => {
  const dirname = path.join(__dirname, "..", dir);
  const certs = path.join(dir, "certs");
  const sharedCerts = path.join(__dirname, "..", "shared-certs");

  const p7 = forge.pkcs7.createSignedData();

  const [manifest, cert, key, wwdr] = await Promise.all([
    getFile(path.join(dirname, "manifest.json")),
    // signerCert is related to a unique pass type id
    getFile(path.join(certs, "signerCert.pem")),
    // signerKey could be shared
    getFile(path.join(sharedCerts, "signerKey.key")),
    // wwdr never changes, until it expires
    getFile(path.join(sharedCerts, "wwdr.pem")),
  ]);

  p7.content = manifest;
  p7.addCertificate(cert);
  p7.addCertificate(wwdr);

  p7.addSigner({
    key,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha1,
    authenticatedAttributes: [
      {
        type: forge.pki.oids.contentType,
        value: forge.pki.oids.data,
      },
      {
        type: forge.pki.oids.messageDigest,
      },
      {
        type: forge.pki.oids.signingTime,
      },
    ],
  });

  p7.sign({ detached: true });

  const buf = Buffer.from(forge.asn1.toDer(p7.toAsn1()).getBytes(), "binary");

  await fs.writeFile(path.join(dirname, "signature"), buf, {
    encoding: "utf-8",
  });
};

module.exports = makeSignature;
