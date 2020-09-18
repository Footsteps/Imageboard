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
        `SELECT url, title, id, (
  SELECT id FROM images
  ORDER BY id ASC
  LIMIT 1
  ) AS "lowestId" FROM images
  WHERE id < $1
  ORDER BY id DESC
  LIMIT 12`,
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

module.exports.lastId = () => {
    return db.query(`SELECT max(id) FROM images`);
};

//get image for modal
//subquerys for getting the next id and the previous id
module.exports.modalImage = (id) => {
    return db.query(
        `SELECT *, (
            SELECT id FROM images 
            WHERE id = ($1-1)
        ) AS "nextId", (
            SELECT id FROM images 
            WHERE id = ($1+1)
        ) AS "previousId"
        FROM images 
        where id = $1 `,
        [id]
    );
};

//get next image
//get image for modal
module.exports.nextImage = (id) => {
    return db.query(`SELECT id FROM images where  id = ($1 - 1)`, [id]);
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

module.exports.getComments = (image_id) => {
    return db.query(
        `SELECT * FROM comments
    WHERE image_id = $1
    ORDER BY id DESC`,
        [image_id]
    );
};

module.exports.getAllComments = () => {
    return db.query(`SELECT * FROM comments`);
};

//delete a picture
module.exports.deleteImage = (id) => {
    return db.query(
        `DELETE FROM images WHERE id = $1;
    `,
        [id]
    );
};

module.exports.deleteComments = (id) => {
    return db.query(
        `DELETE FROM comments WHERE image_id = $1;
    `,
        [id]
    );
};
