const express = require("express");
const apiRoute = express.Router();
const moviesRouter = require("./movies.js");
const seriesRouter = require("./series.js");

apiRoute.use("/movies", moviesRouter);
apiRoute.use("/series", seriesRouter);

module.exports = apiRoute;