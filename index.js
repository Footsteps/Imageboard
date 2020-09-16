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

app.get("/pictures", (req, res) => {
    console.log("GET /pictures has been hit");
    let cutePictures;
    db.getImages()
        .then(({ rows }) => {
            //console.log("all tables: ", rows);
            cutePictures = rows;
            //console.log("cutePictures", cutePictures);
            res.json({
                cutePictures: cutePictures,
            });
        })
        .catch((err) => {
            console.log("err in get Pictures: ", err);
        });
});

app.get("/modal/:pictureId", (req, res) => {
    console.log("get modal was hit!!!");
    const pictureId = req.params.pictureId;
    //console.log(req.params);
    //console.log(pictureId);

    db.modalImage(pictureId)
        .then(({ rows }) => {
            console.log("rows", rows);
            /*rows [
  {
    id: 2,
    url: 'https://s3.amazonaws.com/spicedling/wg8d94G_HrWdq7bU_2wT6Y6F3zrX-kej.jpg',
    username: 'discoduck',
    title: 'Elvis',
    description: "We can't go on together with suspicious minds.",
    created_at: 2020-09-14T15:39:24.455Z
  }
]
*/

            res.json({
                image: rows,
            });
        })
        .catch((err) => {
            console.log("err in modal: ", err);
        });
});

app.post("/comments/:pictureId", (req, res) => {
    console.log("post comments was hit!!!");
    const pictureId = req.params.pictureId;
    //console.log(req.body.username);
    //console.log(req.body.comment);
    //console.log(pictureId);

    db.insertComment(req.body.username, req.body.comment, pictureId)
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
