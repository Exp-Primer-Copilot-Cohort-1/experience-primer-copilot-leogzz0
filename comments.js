// Create web server

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool
var db;

// Connect to the database before starting the application server.
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var url = 'mongodb://localhost:27017/mean-demo';

// Connect to the database
MongoClient.connect(url, function(err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse
  db = database;
  console.log('Database connection ready');

  // Initialize the app
  var server = app.listen(3000, function() {
    var port = server.address().port;
    console.log('App now running on port', port);
  });
});

// COMMENTS API ROUTES BELOW

// Generic error handler used by all endpoints
function handleError(res, reason, message, code) {
  console.log('ERROR: ' + reason);
  res.status(code || 500).json({ error: message });
}

/*  '/comments'
 *    GET: finds all comments
 *    POST: creates a new comment
 */

app.get('/comments', function(req, res) {
  db.collection('comments').find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, 'Failed to get comments.');
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post('/comments', function(req, res) {
  var newComment = req.body;
  newComment.createDate = new Date();

  if (!req.body.name) {
    handleError(res, 'Invalid user input', 'Must provide a name.', 400);
  } else if (!req.body.comment) {
    handleError(res, 'Invalid user input', 'Must provide a comment.', 400);
  } else {
    db.collection('comments').insertOne(newComment, function(err, doc) {
      if (err) {
        handleError(res, err.message, 'Failed to create new comment.');
      } else {
        res.status(201).json(doc.ops[0]);
      }
    });
  }
});

/*  '/comments/:id'
 *    GET: find comment by id
 *    PUT: update comment by id
 *