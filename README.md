# Apple Wallet Pass

Creating custom Apple Wallet Passes for various membership cards, for the low, low price of **$136 per year**.

### Image Info (From Apple Developer Portal)

The background image (`background.png`) is displayed behind the entire front of the pass. The expected dimensions are **180 x 220 points**. The image is cropped slightly on all sides and blurred. Depending on the image, you can often provide an image at a smaller size and let it be scaled up.

The footer image (`footer.png`) is displayed near the barcode. The allotted space is **286 x 15 points**.

The icon (`icon.png`) is displayed when a pass is shown on the lock screen and by apps such as Mail when showing a pass attached to an email. The icon should measure **29 x 29 points**.

The logo image (`logo.png`) is displayed in the top left corner of the pass, next to the logo text. The allotted space is **160 x 50 points**; in most cases it should be narrower.

The strip image (`strip.png`) is displayed behind the primary fields. 

**Icon and logo are required**: https://github.com/tinovyatkin/pass-js/blob/84ddb92210a0243c5947a063d4e1d0654604d5ef/src/lib/images.ts#L66

### Manifest

The manifest is a JSON object that contains a dictionary of the SHA1 hashes for each of the source files for the pass. The dictionary key is the pathname of the file relative to the top level of the pass, and the value is the SHA1 hash.

https://developer.apple.com/documentation/walletpasses/building_a_pass

### Generate Certificates

https://github.com/alexandercerutti/passkit-generator/wiki/Generating-Certificates

1. Generate a signerKey.key:

```sh
openssl genrsa -out signerKey.key 2048
```

2. Generate a Cert Signing Request:

```sh
openssl req -new -key signerKey.key -out request.certSigningRequest
```

3. Fill in Apple's information:

```console
Country Name (2-letter code) []: US
State or Province Name []: United States
Locality Name []:
Organization Name []: Apple Inc.
Organizational Unit Name []: Apple Worldwide Developer Relations
Common Name []: Apple Worldwide Developer Relations Certification Authority
Email Address []: your-email
```

4. Create a Pass Type Identifier: https://developer.apple.com/account/resources/identifiers/list/passTypeId

5. Create a new certificate, uploading the `request.certSigningRequest`

6. Download the `pass.cer`

7. Convert it to a `.pem`:

```sh
openssl x509 -inform DER -outform PEM -in pass.cer -out signerCert.pem
```

8. Download the [Worldwide Developer Relations (WWDR) certificate (G4)](https://www.apple.com/certificateauthority/) and convert that to a `.pem`:

```sh
openssl x509 -inform DER -outform PEM -in AppleWWDRCAG4.cer -out wwdr.pem
```

These files are used in the `src/makeSignature.js` script:

- `wwdr.pem`
- `signerCert.pem`
- `signerKey.key`

**Note**: `wwdr.pem` never changes; you can use it for multiple pass types. `signerKey.key` doesn't need to change; you can just re-use your `request.certSigningRequest` to create new PassTypeId's and new signer keys.  These files I've moved to a `shared-certs` directory; see `.gitignore`, and `src/makeSignature.js`

### Run the scripts

```sh
npm start -- ./yourDir.pass
```

### Zip it

Note: zip the files in the directory, and not the directory itself.

```sh
zip -j -r yourDir.pkpass yourDir.pass/*
```

### Testing

Validate your pkpass with this online validator:

https://pkpassvalidator.azurewebsites.net/

And/or try uploading the pkpass in the Simulator app (open the Console app and watch for logs)

### Resources

##### Creating a PKCS #7 detached signature

- pass-js: https://github.com/tinovyatkin/pass-js/blob/84ddb92210a0243c5947a063d4e1d0654604d5ef/src/lib/signManifest-forge.ts#L42-L78
- passkit-generator: https://github.com/alexandercerutti/passkit-generator/blob/921b955a85e68731e6d5e0bedda30c1ac9ea6edf/src/Signature.ts#L32-L94

##### JSON Schema

walletpass: https://raw.githubusercontent.com/walletpass/json-schemas/master/pass.schema.json


### Gotchas

1. You need to zip the files without the directory.

e.g.

```sh
zip -j -r yourDir.pkpass yourDir.pass/*
```

2. When hashing the files, don't read the files as utf-8

3. The Apple Developer Docs are awful.
