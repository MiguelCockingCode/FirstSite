const express = require("express");
const moviesRouter = express.Router();

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");

moviesRouter.param("movieId", (req, res, next, movieId) =>{
    const sql = "SELECT * FROM Movies WHERE ROWID = ?";
    db.get(sql, [movieId], (error, movie) =>{
        if (error){
            next(error);
        }else if (movie){
            req.movie = movie;
            next();
        }else{
            res.sendStatus(404);
        }
    });
});

moviesRouter.get("/", (req, res, next) =>{
    db.all("SELECT ROWID, * FROM Movies", (error, movies) =>{
        if (error){
            next(error);
        }else{
            res.status(200).json({movies: movies});
        }
    });
});

moviesRouter.post("/", (req, res, next) =>{
    const{ name, status, rate } = req.body;
    if (!name || !status){
        return res.status(400).json({ error: "Missing name or status" });
    }
    
    const sql = "INSERT INTO Movies (name, status, rate) VALUES (?, ?, ?)";
    const values = [name, status, rate];
    db.run(sql, values, function (error){
        if (error){
            next(error);
        }else{
            db.get("SELECT ROWID, * FROM Movies WHERE ROWID = ?", [this.lastID], (error, newMovie) =>{
                if (error){
                    next(error);
                }else{
                    res.status(201).json({ movie: newMovie });
                }
            });
        }
    });
});

moviesRouter.put("/:movieId", (req, res, next) =>{
    // Assuming the updated data is sent in req.body.movies
    const{ name, status, rate }= req.body.movies || req.body;
    if (!name || !status || !rate){
        return res.sendStatus(400);
    }
    const sql = "UPDATE Movies SET name = ?, status = ?, rate = ? WHERE ROWID = ?";
    const values = [name, status, rate, req.params.movieId];
    db.run(sql, values, function (error){
        if (error){
            next(error);
        }else{
            db.get("SELECT ROWID, * FROM Movies WHERE ROWID = ?", [req.params.movieId], (error, updateMovie) =>{
                if (error){
                    next(error);
                }else{
                    res.status(200).json({ movie: updateMovie });
                }
            });
        }
    });
});

moviesRouter.delete("/:movieId", (req, res, next) =>{
    // Parse movieId as an integer (if needed)
    const movieId = parseInt(req.params.movieId, 10);
    if (!movieId){
        return res.status(400).json({ error: "Movie ID is required" });
    }
    const sql = "DELETE FROM Movies WHERE ROWID = ?";
    db.run(sql, [movieId], function (error){
        if(error){
            next(error);
        }else if(this.changes === 0){
            console.log("No movie found for ROWID:", movieId);
            res.status(404).json({ error: "Movie not found" });
        }else{
            res.sendStatus(204);
        }
    });
});

module.exports = moviesRouter;