const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const app = express();
// utilize morgan
app.use(morgan('common'));
app.use(bodyParser.json());

let topMovies = [
    {
        title: "Howl's Moving Castle",
        production: "Studio Ghibli",
        director: "Hayao Miyazaki",
        genre: "Animation",
        actors: " Christian Bale,",
    }
]
app.get("/movies", (req, res) => {
    res.json(topMovies);
});

app.get("/", (req, res) => {
    res.send("Please enjoy Studio Ghibli");
});
app.use(express.static("public"));

app.use((err, req, res, next) => {
    console,error(err.stack);
    res.status(500).send("Oops, something is not working right!");
});
app.listen(8080, () => {
    console.log("Your app is listening on port 8080.")
});