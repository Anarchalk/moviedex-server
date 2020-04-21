require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require('cors')
const helmet = require('helmet')
const MOVIEDEX = require("./moviedex.json");

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))

app.use(cors())
app.use(helmet());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  next();
});

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

app.get("/movie", function handleMovies(req, res) {
  let results = MOVIEDEX;
  let { genre, country, avg_vote } = req.query;
   

  if (genre) {
    results = results.filter(film =>
      film.genre.toLowerCase().includes(genre.toLowerCase())
    );
  }

  if (country) {
    results = results.filter(film =>
      film.country.toLowerCase().includes(country.toLowerCase())
    );
  }

  if (avg_vote) {
      results = results.filter(film => Number(film.avg_vote)>= Number(avg_vote))
  }

  res.json(results);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is listening at http://localhost:${PORT}`);
});
