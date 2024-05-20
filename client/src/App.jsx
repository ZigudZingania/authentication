import { act, useEffect, useState } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [authorized, setAuthorized] = useState(false);

  function logOut() {
    setAuthorized(false);
    localStorage.removeItem("todo-auth");
    sessionStorage.removeItem("session-auth");
  }

  async function addUser() {
    await axios
      .post("https://authentication-one-pi.vercel.app/add", {
        username: userName,
        password: password,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    setPassword("");
    setUserName("");
  }

  async function checkPassword() {
    await axios
      .post("https://authentication-one-pi.vercel.app/pass", {
        password: password,
        username: userName,
      })
      .then((res) => {
        if (res.data) {
          let local_auth_value = new Date().setDate(new Date().getDate() + 7);
          setAuthorized(true);
          localStorage.setItem("todo-auth", local_auth_value);
          sessionStorage.setItem("session-auth", true);
        } else {
          setAuthorized(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    setPassword("");
    setUserName("");
  }

  useEffect(() => {
    console.log("inside");
    let auth = localStorage.getItem("todo-auth");
    if (auth) {
      if (auth > new Date()) {
        setAuthorized(true);
      } else {
        localStorage.removeItem("todo-auth");
        setAuthorized(false);
      }
    }
  }, []);

  return (
    <>
      {sessionStorage.getItem("session-auth") || authorized ? (
        <>
          <h1>You are logged in!</h1>
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
