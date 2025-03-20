const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("./database.sqlite");

db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS Movies (
                name TEXT NOT NULL
                status TEXT NOT NULL
                rate INTEGER);`);

        db.run(`CREATE TABLE IF NOT EXISTS Series (
                name TEXT NOT NULL
                status TEXT NOT NULL
                season INTEGER
                episode INTEGER
                rate INTEGER);`);
})