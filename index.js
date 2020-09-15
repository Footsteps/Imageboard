//console.logs appear in the terminal
//add body-parser!!!
const express = require("express");
const app = express();
const s3 = require("./s3");
const { s3Url } = require("./config");

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

const db = require("./db");

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

//s3.upload gets used and is now safe at AMAZON
//I can put file in database now
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
    //const url = "https://s3.amatonaws.com/spicedling/${filename}"
    //get url from config.json
    const url = `${s3Url}${filename}`;

    /*
    db.addImage(url, req.body.title, req.body.description, req.body.username);
    ({rows} => {
        res.json({rows[0]})
        -> image has to have the same property 
        --> get the object resp.data.image --> put it in array  
    })
                //return *
    */
    if (req.file) {
        //do data base insert of file
        res.json({
            success: true,
        });
    } else {
        res.json({
            success: false,
        });
    }
});

app.listen(8080, () => console.log("listening!!!"));
