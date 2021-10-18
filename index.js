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

app.use(express.static("public"));
app.use(
    express.urlencoded({
        extended: false,
    })
);
app.use(express.json());

app.get("/images", (req, res) => {
    console.log("GET /images has been hit");
    let cuteImages;
    db.getImages()
        .then(({ rows }) => {
            console.log("all tables: ", rows);
            cuteImages = rows;
            //console.log("cuteImages", cuteImages);
            res.json({
                cuteImages: cuteImages,
            });
        })
        .catch((err) => {
            console.log("err in get Images: ", err);
        });
});

app.get("/modal/:imageId", (req, res) => {
    console.log("get modal was hit!!!");
    let imageId = req.params.imageId;
    //console.log(req.params);
    //console.log(imageId);

    db.modalImage(imageId)
        .then(({ rows }) => {
            console.log("rows", rows);

            res.json({
                image: rows,
            });
        })
        .catch((err) => {
            console.log("err in modal: ", err);
        });
});

app.get("/comments/:imageId", (req, res) => {
    console.log("comments route was hit");
    console.log("image id in comments", req.params.imageId);
    let comments;
    db.getComments(req.params.imageId)
        .then(({ rows }) => {
            //console.log("results", rows);
            /*
            [
            {
            id: 18,
    username: 'angela',
    comment: 'KOmmentar numer 4',
    image_id: 29,
    created_at: 2020-09-17T17:25:52.003Z
            }
    ]
    */

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
    console.log("delete was hit!!!");
    let imageId = req.params.imageId;
    console.log("image id in Delete", imageId);
    db.deleteImage(imageId)
        .then((results) => {
            //console.log("rows after delete", results);
            db.deleteComments(imageId).then((results) => {
                //console.log("results after delete comments", results);
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
    console.log("get more was hit!!!");
    const lastId = req.params.lastId;
    //console.log(req.params.lastId);
    //console.log(imageId);
    let moreImages;
    db.getMoreImages(lastId)
        .then(({ rows }) => {
            console.log("rows", rows);
            /*
            rows [ viele objekte
                {
    url: 'https://s3.amazonaws.com/spicedling/KBJCupswxVumAARf8bNTTsj10VVnPES0.jpg',
    title: 'Thailand',
    id: 6,
    lowestId: 1
  }
            ]
            */

            moreImages = rows;
            //console.log("moreImages", moreImages);
            res.json({
                moreImages: moreImages,
            });
        })
        .catch((err) => {
            console.log("err in getMoreImages: ", err);
        });
});

app.post("/comments/:imageId", (req, res) => {
    console.log("post comments was hit!!!");
    const imageId = req.params.imageId;
    //console.log(req.body.username);
    //console.log(req.body.comment);
    //console.log(imageId);

    db.insertComment(req.body.username, req.body.comment, imageId)
        .then(({ rows }) => {
            console.log("rows in insert comment!!!", rows[0]);

            res.json({
                comment: rows[0],
            });
        })
        .catch((err) => {
            console.log("err in insert comment: ", err);
        });
});

app.post("/upload", uploader.single("file"), s3.upload, (req, res) => {
    console.log("file", req.file);
    /*
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
    console.log("input", req.body);

    /*
        input [Object: null prototype] {
                title: 'a',
                description: 'a',
                username: 'a'
                }


    */
    const filename = req.file.filename;
    //console.log(filename);
    const url = `${s3Url}${filename}`;
    //console.log(url);
    console.log("req-body in post request: ", req.body);
    if (req.file) {
        console.log("file is there, giving it to addImage now");
        db.addImage(
            url,
            req.body.username,
            req.body.title,
            req.body.description
        )
            .then(({ rows }) => {
                console.log("rows in add Image: ", rows[0]);
                /*
                rows in add Image:  [
                     {
                    id: 4,
                    url: 'https://s3.amazonaws.com/spicedling/8JhpdRFOTe6SNE9HwUOy0NfH6YD6yFqa.jpg',
                    username: 'Angela',
                    title: 'Vietnam',
                    description: 'Angkor Wat  again!',
                    created_at: 2020-09-15T15:46:11.985Z
                    }
                ]
                */
                //let image = rows[0];
                //console.log(image);
                res.json({
                    image: rows[0],
                });
            })
            .catch((err) => {
                console.log("err in addImage: ", err);
            });

        //do data base insert of file
        /*res.json({
            success: true,
        });
        */
    } else {
        res.json({
            success: false,
        });
    }
});

app.listen(8080, () => console.log("listening!!!"));
