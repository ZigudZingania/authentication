import { act, useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [currentUser, setCurrentUser] = useState();
  const [secret, setSecret] = useState("");
  const [message, setMessage] = useState("");
  const [authorized, setAuthorized] = useState(false);

  function logOut() {
    setAuthorized(false);
    setMessage('');
    localStorage.removeItem("todo-auth");
    sessionStorage.removeItem("session-auth");
    localStorage.removeItem("accessToken");
  }

  async function addUser() {
    await axios
      .post(`${import.meta.env.VITE_BASE_URL}/add`, {
        username: userName,
        password: password,
      })
      .then((res) => {
        if (res.data.status) {
          setMessage("");
        } else {
          setMessage(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        setMessage(
          "Server didn't respond. Try reloading the page to see if it works."
        );
      });
    setPassword("");
    setUserName("");
  }

  async function checkPassword() {
    await axios
      .post(`${import.meta.env.VITE_BASE_URL}/pass`, {
        password: password,
        username: userName,
      })
      .then((res) => {
        if (res.data.status) {
          setMessage('');
          setCurrentUser(res.data.row[0]);
          let local_auth_value = new Date().setDate(new Date().getDate() + 7);
          setAuthorized(true);
          localStorage.setItem("accessToken", res.data.row[0].token);
          localStorage.setItem("todo-auth", local_auth_value);
          sessionStorage.setItem("session-auth", true);
        } else {
          setMessage(res.data.message);
          setAuthorized(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setMessage(
          "Server didn't respond. Try reloading the page to see if it works."
        );
      });
    setPassword("");
    setUserName("");
  }

  async function addSecret() {
    await axios
      .post(`${import.meta.env.VITE_BASE_URL}/secret`, {
        secret: secret,
        token: localStorage.getItem("accessToken"),
      })
      .then((res) => {
        if (res.data.status) {
          setMessage("");
          setCurrentUser(res.data.data[0]);
        } else {
          setMessage(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
        setMessage(
          "Server didn't respond. Try reloading the page to see if it works."
        );
      });
    setSecret("");
  }

  useEffect(() => {
    async function getUserinfo() {
      await axios
        .post(`${import.meta.env.VITE_BASE_URL}/get`, {
          token: localStorage.getItem("accessToken"),
        })
        .then((res) => {
          if (res.data.status) {
            setMessage("");
            setCurrentUser(res.data.data);
          } else {
            setMessage(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          setMessage(
            "Server didn't respond. Try reloading the page to see if it works."
          );
        });
    }
    let auth = localStorage.getItem("todo-auth");
    if (auth) {
      if (auth > new Date()) {
        setAuthorized(true);
        getUserinfo();
      } else {
        localStorage.removeItem("todo-auth");
        setAuthorized(false);
      }
    }
  }, []);

  return (
    <>
      <h2>{message ? `${message}` : null}</h2>
      {sessionStorage.getItem("session-auth") || authorized ? (
        <>
          <h1>You are logged in!</h1>
          <h3>{currentUser ? `${currentUser.username}` : null}</h3>
          <h4>{currentUser ? `Your Secret: ${currentUser.secret}` : null}</h4>
          <label>Enter your secret!</label>
          <div className="secret">
            <textarea
              type="textarea"
              cols={50}
              rows={3}
              value={secret}
              onChange={(e) => {
                setSecret(e.target.value);
              }}
            ></textarea>
            <button onClick={addSecret}>ADD</button>
          </div>
          <button onClick={logOut}>Logout</button>
        </>
      ) : (
        <>
          <div className="email-input">
            <div>
              <label htmlFor="username">Username</label>
            </div>
            <input
              id="username"
              name="email"
              onChange={(e) => {
                setUserName(e.target.value);
              }}
              value={userName}
              placeholder="Username..."
            ></input>
          </div>
          <div>
            <div>
              <label htmlFor="password">Password</label>
            </div>
            <input
              type="password"
              name="password"
              id="password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="Enter password..."
              value={password}
            ></input>
          </div>
          <button onClick={checkPassword}>Login</button>
          <button onClick={addUser}>Sign in</button>
        </>
      )}
    </>
  );
}
export default App;
