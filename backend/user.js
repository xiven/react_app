const {Router} = require('express');
const pool = require('./db');
const {hash, Session} = require('./helper');

const router = new Router();

router.get('/all', (req, res, next) => {
  pool.query('SELECT * FROM users', (q_err, q_res) => {
    if (q_err) return next(q_err);

    res.json(q_res.rows);
  });
});

const set_session = (username, res) => {
  const session = new Session(username);
  const session_str = session.toString();

  return new Promise((resolve, reject) => pool.query(
    'UPDATE users SET session_id = $1 WHERE username_hash = $2',
    [session.id, hash(username)],
    (q_err, q_res) => {
      if (q_err) return reject(q_err);

      res.cookie('session_str', session_str, {
        expire: Date.now() + 3600000,
        httpOnly: true,
        //secure: true // use with https for a secure cookie
      });

      resolve();
    }
  ));
};

router.post('/new', (req, res, next) => {
  const {username, password} = req.body;
  const username_hash = hash(username);

  pool.query(
    'SELECT * FROM users WHERE username_hash = $1',
    [username_hash],
    (q0_err, q0_res) => {
      if (q0_err) return next(q0_err);

      if(q0_res.rows.length === 0) {
        // insert a new user
        pool.query(
          'INSERT INTO users(username_hash, password_hash) VALUES($1, $2)',
          [username_hash, hash(password)],
          (q1_err, q1_res) => {
            if (q1_err) return next(q1_err);

            set_session(username, res)
              .then(() => {
                res.json({msg: 'Successfully created user!'});
              })
              .catch(error => next(error));
            
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

module.exports = router;