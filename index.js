const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();
// utilize morgan
app.use(morgan('common'));
app.use(bodyParser.json());

let users = [
    { 
        id: 1,
        name: "Foxy",
        favoriteMovie: ["Howls Moving Castle"]
    },
    {
        id: 2,
        name: "Comitis",
        favoriteMovie: [],
    }
]
//Create user
app.post("/users", (req, res) => {
    const newUser = req.body;

    if (newUser.name) { 
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    }else {
        res.status(400).send("User name required")
    }
});

//Update user information
app.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    let user = users.find( user => user.id ==id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    }else {
        res.status(400).send("User not found")
    }
});
//delete user
app.delete("/users/:id", (req, res) => {
    const { id } = req.params;
   

    let user = users.find( user => user.id ==id);

    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(`User ${id} data has been removed`);
    }else {
        res.status(400).send("User not found")
    }
});

let topMovies = [
    {
        title: "Howl's Moving Castle",
        production: "Studio Ghibli",
        director: "Hayao Miyazaki",
        genre: "Animation"
       
    },
    {
        title: "Spirited Away",
        production: "Studio Ghibli",
        director: "Hayao Miyazaki",
        genre: "Animation"  
    },
    {
        title: "Kiki's Delivery Service",
        production: "Studio Ghibli",
        director: "Hayao Miyazaki",
        genre: "Animation"
    },
    {
        title: "My Neighbor Totoro",
        production: "Studio Ghibli",
        director: "Hayao Miyazaki",
        genre: "Animation"
    },
    {
        title: "Ponyo",
        production: "Studio Ghibli",
        director: "Hayao Miyazaki",
        genre: "Animation"
    }
];

app.get("/", (req, res) => {
    res.send("Please enjoy Studio Ghibli");
});
//return all movies
app.get("/movies", (req, res) => {
    res.json(topMovies);
});
// return title
app.get("/movies/:title", (req, res) => {
    const { title } = req.params;
    const movie = topMovies.find( movie => movie.title === req.params.title );
    
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send("Movie does not exist");    
    }
});
//return genre
app.get("/movies/genre/:genreName", (req, res) => {
    const { genreName } = req.params;
    const genre = topMovies.find( movie => movie.genre === genreName ) .genre;
    
    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send("Genre does not exist");    
    }
});
//return director
app.get("/movies/director/:directorName", (req, res) => {
    const { directorName } = req.params;
    const director = topMovies.find( movie => movie.director === directorName ) .director;
    
    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send("Director does not exist");    
    }
});
//add favorite movie
app.post("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;
   

    let user = users.find( user => user.id ==id);

    if (user) {
        user.favoriteMovie.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    }else {
        res.status(400).send("User not found")
    }
});

//remove favorite movie
app.delete("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;
   

    let user = users.find( user => user.id ==id);

    if (user) {
        user.favoriteMovie = user.favoriteMovie.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`);
    }else {
        res.status(400).send("User not found")
    }
});



app.use(express.static("public"));

app.use((err, req, res, next) => {
    console,error(err.stack);
    res.status(500).send("Oops, something is not working right!");
});

app.listen(8080, () => {
    console.log("Your app is listening on port 8080.")
});