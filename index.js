const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const Models = require('./models');

const Movies = Models.Movie;
const Users = Models.User;

const { check, validationResult } = require('express-validator');

//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const app = express();

//Middleware
app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//using CORS
const cors = require('cors');

 let allowedOrigins = [
'http://localhost:8080', 
'http://localhost:1234',
'http://testsite.com',
'https://mystudioghibliapplication.netlify.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
       let message = 'The CORS policy for this application does not allow found on the list of allowed origin' + origin;
       return callback(new Error(message), false);
  }
  return callback(null, true);
}
}));

//use auth endpoints
let auth = require('./auth')(app);

//use passport after auth
const passport = require('passport');
require('./passport')

app.get("/", (req, res) => {
    res.send("Please enjoy Studio Ghibli");
});
//return all movies
app.get("/movies", passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
    .then((movie)=>{
      res.status(201).json(movie);
    })
    .catch((err)=>{
      console.error(err);
    res.status(500).send('Error' + err)
    });
});
// return title
app.get("/movies/:Title", passport.authenticate('jwt', { session: false }), (req, res) => {

  Movies.findOne({Title: req.params.Title})
      .then ((movie) =>{
        res.json(movie);
    }) .catch ((err) =>{
        res.status(400).send('Error: ' + err);    
    });
  });
//return genre
app.get("/genre/:genre", passport.authenticate('jwt', { session: false }), (req, res) => {
  
  Movies.findOne({'Genre.Name': req.params.genre})
    .then((movie) => {
        res.json(movie.Genre);
    }) .catch ((err) => {
        res.status(400).send('Error: ' + err)    
    })
  });

//return director
app.get("/directors/:directorName", passport.authenticate('jwt', { session: false }), (req, res) => {

  Movies.findOne({'Director.Name': req.params.directorName})
    .then((movie) =>{
      res.json(movie.Director)
    })
    .catch((err) =>{
      res.status(400).send('Error: ' + err);
    });
  });

  //Create user
app.post('/users',
[
  check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
],
 (req, res) => {
   let errors = validationResult(req);
   if (!errors.isEmpty()){
     return res.status(422).json({ errors: errors.array() });
   }

   let hashedPassword = Users.hashPassword(req.body.Password)
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users.create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{
              res.status(201).json(user)
             })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

  // Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });
  // Get a user by username
app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

//Update user information
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), 
[
  check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
],
(req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });
//delete user
app.delete("/users/:Username", passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username})
    .then((user) =>{
    if (!user) {
        res.status(400).send(req.params.Username + 'data was to found');
    } else {
        res.status(200).send(req.params.Username + 'data has been removed')
      }
    })
    .catch((err)=>{
      console.error(err);res.status(500).send('Error' + err);
    });
});
//add favorite movie
app.post("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), (req, res) => {

  Users.findOneAndUpdate({Username: req.params.Username},
     {$push: {FavoriteMovies: req.params.MovieID}},
     {new: true},
     (err, updatedUser) =>{
    if (err) {
      res.status(400).send('User information could not be updated'+ err)
        
    } else {
      res.json(updatedUser);
      res.status(200).send(req.params.Title + ' has been added to user '+ req.params.Username + 's Favorite Movies');
    }
  });
});

//remove favorite movie
app.delete("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), (req, res) => {
   
  Users.findOneAndUpdate({Username: req.params.Username}, 
    {$pull: {FavoriteMovies: req.params.MovieID}},
    { new: true},
    (err, updatedUser) =>{

    if (err) {
      res.status(400).send("User not found");  
    } else {
      res.json(updatedUser); 
    }
  });
});

app.use((err, req, res, next) => {
    console,error(err.stack);
    res.status(500).send("Oops, something is not working right!");
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Our app is running on port ${ PORT }`);
});

