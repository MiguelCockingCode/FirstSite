const express = require("express");
const seriesRouter = express.Router();

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

seriesRouter.param("serieId", (req, res, next, serieId) => {
    const sql = "SELECT * FROM Series WHERE ROWID = ?;";
    db.get(sql, [serieId], (error, serie) => {
        if(error){
            next(error);
        }else if(serie){
            req.serie = serie;
            next();
        }else{
            res.sendStatus(404);
        }
    });
});

seriesRouter.get("/", (req, res, next) => {
    db.all("SELECT ROWID, * FROM Series;", (error, series) => {
        if(error){
            next(error);
        }else{
            res.status(200).json({series: series});
        }
    });
});

seriesRouter.post("/", (req, res, next) => {
    const { name, status, season, episode, rate } = req.body;

    // Validate required fields
    if (!name || !status) {
        return res.status(400).json({ error: "Name and status are required" });
    }

    // Convert empty strings to null for season, episode and rate
    const seasonValue = season ? Number(season) : null;
    const episodeValue = episode ? Number(episode) : null;
    const rateValue = rate ? Number(rate) : null;

    const sql = "INSERT INTO Series (name, status, season, episode, rate) VALUES (?, ?, ?, ?, ?);";
    const values = [name, status, seasonValue, episodeValue, rateValue];

    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else {
            db.get("SELECT ROWID, * FROM Series WHERE ROWID = ?", [this.lastID], (error, newSerie) => {
                if (error) {
                    next(error);
                } else {
                    res.status(201).json({ serie: newSerie });
                }
            });
        }
    });
});

seriesRouter.put("/:serieId", (req, res, next) => {
    const {name, status, season, episode, rate} = req.body.series || req.body;
    if(!name || !status || !season || !episode || !rate){
        return res.sendStatus(400);
    }

    const sql = "UPDATE Series SET name = ?, status = ?, season = ?, episode = ?, rate = ? WHERE ROWID = ?;";
    const values = [name, status, season, episode, rate, req.params.serieId];
    db.run(sql, values, (error) => {
        if(error){
            next(error);
        }else{
            db.get("SELECT ROWID, * FROM Series WHERE ROWID = ?;", [req.params.serieId], (error, updateSerie) => {
                if (error){
                    next(error);
                }else{
                    res.status(200).json({ serie: updateSerie });
                }
            });
        }
    });
});

seriesRouter.delete("/:serieId", (req, res, next) =>{
    const serieId = parseInt(req.params.serieId, 10);
    if (!serieId){
        return res.status(400).json({ error: "Serie ID is required" });
    }
    const sql = "DELETE FROM Series WHERE ROWID = ?";
    db.run(sql, [serieId], function (error){
        if(error){
            next(error);
        }else if(this.changes === 0){
            console.log("No serie found for ROWID:", serieId);
            res.status(404).json({ error: "Serie not found" });
        }else{
            res.sendStatus(204);
        }
    });
});

module.exports = seriesRouter;