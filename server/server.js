import "dotenv/config";
import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import mysql from "mysql2";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.PORT;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "r0hanr0n",
  database: "serverone",
  port: 3306,
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Database connected!");
  }
});

app.post("/get", (req, res) => {
  db.query(
    "select * from secrets where token = ?",
    [req.body.token],
    (err, data) => {
      if (err) {
        console.log(err);
        return res.send({
          status: false,
          message:
            "Server didn't respond. Try reloading the page to see if it works.",
        });
      }
      if (data.length) {
        return res.send({ status: true, data: data[0] });
      } else {
        return res.send({
          status: false,
          message: "Access token compromised! Please logout and login again!",
        });
      }
    }
  );
});

app.post("/add", async (req, res) => {
  let password = req.body.password;
  let username = req.body.username;
  let userExists = false;
  db.query(
    "select * from secrets where username = ?",
    [username],
    async (err, data) => {
      if (err) {
        return res.send({
          status: false,
          message:
            "Server didn't respond. Try reloading the page to see if it works.",
        });
      }
      if (data.length) {
        userExists = true;
      }
      if (username == "" || password == "") {
        return res.send({
          status: false,
          message: "Username and password cannot be empty!",
        });
      } else {
        if (userExists) {
          return res.send({
            status: false,
            message: "Username already exists!",
          });
        } else {
          let hash = await bcrypt.hash(password, 10);
          let token = await bcrypt.hash(username, 10);
          db.query(
            "insert into secrets (username, password, token) values (?, ?, ?)",
            [username, hash, token],
            (err, row) => {
              if (err) {
                console.log(err);
                return res.send({
                  status: false,
                  message:
                    "Server didn't respond. Try reloading the page to see if it works.",
                });
              }
              console.log(row);
              return res.send({ status: true });
            }
          );
        }
      }
    }
  );
});

app.post("/pass", async (req, res) => {
  let username = req.body.username;
  let userExists = false;
  db.query(
    "select * from secrets where username = ?",
    [username],
    async (err, data) => {
      console.log(data);
      if (err) {
        console.log(err);
        return res.send({
          status: false,
          message:
            "Server didn't respond. Try reloading the page to see if it works.",
        });
      }
      if (data.length) {
        userExists = true;
      }
      if (userExists) {
        let accept = await bcrypt.compare(req.body.password, data[0].password);
        if (accept) {
          let token = await bcrypt.hash(username, 10);
          db.query(
            "update secrets set ? where username = ?",
            [{ token: token }, username],
            (err, dt) => {
              if (err) {
                console.log(err);
                return res.send({
                  status: false,
                  message:
                    "Server didn't respond. Try reloading the page to see if it works.",
                });
              }
              console.log(dt);
            }
          );
          db.query(
            "select * from secrets where username = ?",
            [username],
            (err, data) => {
              if (err) {
                console.log(err);
                return res.send({
                  status: false,
                  message:
                    "Server didn't respond. Try reloading the page to see if it works.",
                });
              }
              console.log(data);
              return res.send({ status: true, row: data });
            }
          );
        } else {
          return res.send({ status: false, message: "Incorrect password!" });
        }
      } else {
        return res.send({
          status: false,
          message: "Username doesnot exist! Sign in to create user.",
        });
      }
    }
  );
});

app.post("/secret", (req, res) => {
  let secret = req.body.secret;
  let token = req.body.token;
  db.query(
    "update secrets set ? where token = ?",
    [{ secret: secret }, token],
    (err, row) => {
      if (err) {
        console.log(err);
        return res.send({
          status: false,
          message:
            "Server didn't respond. Try reloading the page to see if it works.",
        });
      }
      if (row.affectedRows == 0) {
        return res.send({
          status: false,
          message:
            "Username doesn't exist or access token expired. Try logging out and logging in.",
        });
      }
      console.log(row);
    }
  );
  db.query("select * from secrets where token = ?", [token], (err, data) => {
    if (err) {
      console.log(err);
      return res.send({
        status: false,
        message:
          "Server didn't respond. Try reloading the page to see if it works.",
      });
    }
    if (data.length) {
      console.log(data);
      return res.send({ status: true, data: data });
    } else {
      return res.send({
        status: false,
        message:
          "Username doesn't exist or access token expired. Try logging out and logging in.",
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
