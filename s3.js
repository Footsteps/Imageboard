const aws = require("aws-sdk");
const fs = require("fs");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

exports.upload = (req, res, next) => {
    //use s3 here
    //check if multer did work
    if (!req.file) {
        console.log(
            "req.file is not here for some reason and we cannot continue"
        );
        return res.sendStatus(500);
    }

    const { filename, mimetype, size, path } = req.file;
    const promise = s3
        .putObject({
            Bucket: "spicedling",
            ACL: "public-read",
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size,
        })
        .promise()
        .then(() => {
            // it worked!!! --> we get back to index.js
            console.log("it worked!!!");
            next();
        })
        .catch((err) => {
            // uh oh
            console.log("error in s3 upload", err);
            res.sendStatus(500);
        });
};
