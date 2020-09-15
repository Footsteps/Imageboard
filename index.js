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
/*
in the client, the promise axios.post returns will be resolved with an object representing the response
that object will have a property named data
that data will be whatever you pass to res.json on the server
image has to have the same property 
--> get the object resp.data.image --> put it in array  
    

            */

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
