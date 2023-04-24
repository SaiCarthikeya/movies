const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "moviesData.db");

app.use(express.json());

const convertMovie = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertMovies = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

const convertDirector = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

const initializeServerAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("server Connected");
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeServerAndDb();

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT movie_name FROM movie;`;
  const dbResponse = await db.all(getMoviesQuery);
  response.send(dbResponse.map(convertMovies));
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const postMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor) VALUES ('${directorId}', '${movieName}', '${leadActor}');`;
  const dbResponse = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const movieId = request.params.movieId;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const dbResponse = await db.get(getMovieQuery);
  response.send(convertMovie(dbResponse));
});

app.put("/movies/:movieId/", async (request, response) => {
  const movieId = request.params.movieId;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateQuery = `UPDATE movie 
    SET director_id = '${directorId}', movie_name = '${movieName}', lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  const dbResponse = await db.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const movieId = request.params.movieId;
  const deleteQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  const dbResponse = await db.run(deleteQuery);
  response.send("Movie Removed");
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const directorId = request.params.directorId;
  const getMoviesQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`;
  const dbResponse = await db.all(getMoviesQuery);
  response.send(dbResponse.map(convertMovies));
});

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director;`;
  const dbResponse = await db.all(getDirectorQuery);
  response.send(dbResponse.map(convertDirector));
});

module.exports = app;
