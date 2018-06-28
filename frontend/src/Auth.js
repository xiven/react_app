import history from './history';
import {CONNECTION} from '../config';

class Auth {
  loggedIn = false;

  signup = (username, password) => {
    fetch(`${CONNECTION}/user/new`, {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username, password})
    }).then(response => response.json())
      .then(json => {
        if (json.type === 'error') {
          alert(json.msg);
        } else {
          alert(json.msg);
        }
      })
  }

  login = () => {
    // TODO
  }

  logout = () => {
    // TODO
  }
};

export default Auth;