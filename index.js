//console.logs appear in the terminal
//add body-parser!!!
const express = require("express");
const app = express();
const s3 = require("./s3");
const { s3Url } = require("./config");
const db = require("./db");

const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

module.exports.app;
app.use(express.static("public"));
app.use(
    express.urlencoded({
        extended: false,
    })
);
app.use(express.json());

app.get("/images", (req, res) => {
    let cuteImages;

    db.getImages()
        .then(({ rows }) => {
            cuteImages = rows;
            res.json({
                cuteImages: cuteImages,
            });
        })
        .catch((err) => {
            console.log("err in get Images: ", err);
        });
});

app.get("/modal/:imageId", (req, res) => {
    let imageId = req.params.imageId;

    db.modalImage(imageId)
        .then(({ rows }) => {
            res.json({
                image: rows,
            });
        })
        .catch((err) => {
            console.log("err in modal: ", err);
        });
});

app.get("/comments/:imageId", (req, res) => {
    let comments;

    db.getComments(req.params.imageId)
        .then(({ rows }) => {
            /*
            rows:
            [{
            id: 18,
            username: 'angela',
            comment: 'KOmmentar numer 4',
            image_id: 29,
            created_at: 2020-09-17T17:25:52.003Z
            }]*/

            comments = rows;
            res.json({
                comments: comments,
            });
        })
        .catch((err) => {
            console.log("err in comments", err);
        });
});

app.get("/delete/:imageId", (req, res) => {
    let imageId = req.params.imageId;

    db.deleteComments(imageId)
        .then((results) => {
            db.deleteImage(imageId).then((results) => {
                res.json({
                    results,
                });
            });
        })
        .catch((err) => {
            console.log("err in delete: ", err);
        });
});

app.get("/more/:lastId", (req, res) => {
    const lastId = req.params.lastId;
    let moreImages;
    db.getMoreImages(lastId)
        .then(({ rows }) => {
            /*
            rows 
            [{
             url: 'https://s3.amazonaws.com/spicedling/KBJCupswxVumAARf8bNTTsj10VVnPES0.jpg',
            title: 'Thailand',
            id: 6,
            lowestId: 1
            }]*/

            moreImages = rows;

            res.json({
                moreImages: moreImages,
            });
        })
        .catch((err) => {
            console.log("err in getMoreImages: ", err);
        });
});

app.post("/comments/:imageId", (req, res) => {
    const imageId = req.params.imageId;

    db.insertComment(req.body.username, req.body.comment, imageId)
        .then(({ rows }) => {
            res.json({
                comment: rows[0],
            });
        })
        .catch((err) => {
            console.log("err in insert comment: ", err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    /*
    req: file, body interessant
            file {
                fieldname: 'file',
                originalname: 'IMG_0238.JPG',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                destination: '/home/angela/Schreibtisch/spicedfiles/cumin-imageboarding/cumin-imageboard/uploads',
                filename: '0omIUVpa0h7S26bFgqZro4KBw3zq2gJ3.JPG',
                path: '/home/angela/Schreibtisch/spicedfiles/cumin-imageboarding/cumin-imageboard/uploads/0omIUVpa0h7S26bFgqZro4KBw3zq2gJ3.JPG',
                size: 1038594
            }

    */
    const filename = req.file.filename;

    const url = `${s3Url}${filename}`;

    if (req.file) {
        db.addImage(
            url,
            req.body.username,
            req.body.title,
            req.body.description
        )
            .then(({ rows }) => {
                res.json({
                    image: rows[0],
                });
            })
            .catch((err) => {
                console.log("err in addImage: ", err);
            });

        /*do data base insert of file
        res.json({
            success: true,
        });
        */
    } else {
        res.json({
            success: false,
        });
    }
});

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () => console.log("listening!!!"));
}
//app.listen(8080, () => console.log("listening!!!"));
