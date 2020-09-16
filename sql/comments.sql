--psql -d imageboard -f comments.sql

DROP TABLE IF EXISTS comments;

CREATE TABLE comments(
        id SERIAL PRIMARY KEY,
        username VARCHAR NOT NULL,
        comment VARCHAR NOT NULL,
        image_id INT NOT NULL REFERENCES images(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );