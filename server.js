const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Post} = require('./model');

const app = express();
app.use(bodyParser.json());

app.get('/posts', (req, res) => {
  Post
    .find()
    .exec()
    .then(posts => {
      res.json({
        posts: posts.map(
          (post) => post.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'})
      });
});

app.get('/posts/:id', (req, res) => {
  Post
    .findById(req.params.id)
    .exec()
    .then(posts => res.json(posts.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'})
    });
});

app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  requiredFields.forEach(field => {
    if(!(field in req.body)) {
      const message = `Missing \`${field}\` in request body.`
      console.error(message);
      return res.status(400).send(message);
    }
  })

  Post
    .create({
      title: req.body.title,
      author: {
        firstName: req.body.author.firstName,
        lastName: req.body.author.lastName
      },
      content: req.body.content})
    .then(
      posts => res.status(201).json(posts.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.put('/posts/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ['title', 'author', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  })

  Post
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .exec()
    .then(posts => res.status(201).json(posts.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
});

app.delete('/posts/:id', (req, res) => {

  Post
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(restaurant => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});


let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }

      app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
	return new Promise((resolve, reject) => {
		console.log('Closing server');
		server.close(err => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		})
	})
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};
