const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db');
const app = express();

app.use(bodyParser.json());

app.get('/user/all', (req, res, next) => {
  pool.query('SELECT * FROM users', (q_err, q_res) => {
    if (q_err) return next(q_err);

    res.json(q_res.rows);
  });
});

app.post('/user/new', (req, res, next) => {
  const {username, password} = req.body;

  pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username],
    (q0_err, q0_res) => {
      if (q0_err) return next(q0_err);

      if(q0_res.rows.length === 0) {
        // insert a new user
        pool.query(
          'INSERT INTO users(username, password) VALUES($1, $2)',
          [username, password],
          (q1_err, q1_res) => {
            if (q1_err) return next(q1_err);
            res.json({msg: 'Successfully created user!'});
          }
        )
      } else {
        res.status(409).json({
          type: 'error',
          msg: 'This username has been taken'
        });
      }
    }
  )
});

app.use((err, req, res, next) => {
  if (!err.statusCode) err.statusCode = 500;

  res.status(err.statusCode).json({ 
    type: 'error', msg: err.message
  });
})

module.exports = app;