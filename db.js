const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:angela:twilight@localhost:5432/imageboard"
);

//get images from database
module.exports.getImages = () => {
    return db.query(`SELECT * FROM images
    ORDER BY id DESC
    LIMIT 12`);
};

//get more images from database
exports.getMoreImages = (lastId) => {
    return db.query(
        `SELECT * FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 10`,
        [lastId]
    );
};

//add image to database
module.exports.addImage = (url, username, title, description) => {
    return db.query(
        `
    INSERT INTO images (url, username, title, description)
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
        [url, username, title, description]
    );
};

//get image for modal
module.exports.modalImage = (id) => {
    return db.query(`SELECT * FROM images where  id = $1`, [id]);
};

//get comments for modal
//insertComment;
module.exports.insertComment = (username, comment, image_id) => {
    return db.query(
        `
    INSERT INTO comments (username, comment, image_id)
    VALUES ($1, $2, $3)
    RETURNING *`,
        [username, comment, image_id]
    );
};
