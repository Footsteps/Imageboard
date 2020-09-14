const express = require("express");
const app = express();

app.use(express.static("public"));

const db = require("./db");

/*
let cuteAnimals = [
    { name: "giraffe", cutenessScore: 7 },
    { name: "capybara", cutenessScore: 10 },
    { name: "quokka", cutenessScore: 8 },
    { name: "penguin", cutenessScore: 12 },
];
*/

app.get("/pictures", (req, res) => {
    console.log("GET /pictures has been hit");
    let cuteAnimals;
    db.getImages()
        .then(({ rows }) => {
            //console.log("all tables: ", rows);
            cuteAnimals = rows;
            //console.log("cuteAnimals", cuteAnimals);
            res.json({
                cuteAnimals: cuteAnimals,
            });
        })
        .catch((err) => {
            console.log("err in get Pictures: ", err);
        });
});

app.listen(8080, () => console.log("listening!!!"));
