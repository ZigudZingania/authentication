import "dotenv/config";
import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = process.env.PORT;

let data = [];

app.get("/", (req, res) => {
  res.send(data);
});

app.post("/add", async (req, res) => {
  let password = req.body.password;
  let username = req.body.username;
  let userExists = false;
  data.forEach((user) => {
    if (req.body.username == user.username) {
      userExists = true;
    }
  });
  if (username == "") {
    res.send(false);
  } else {
    if (userExists) {
      res.send(false);
    } else {
      let hash = await bcrypt.hash(password, 10);
      data.push({ username: username, password: hash });
      res.send(true);
    }
  }
});

app.post("/pass", async (req, res) => {
  let userExists = false;
  let index;
  data.forEach((user, i) => {
    if (req.body.username == user.username) {
      userExists = true;
      index = i;
    }
  });
  if (userExists) {
    let accept = await bcrypt.compare(req.body.password, data[index].password);
    if (accept) {
      return res.send(true);
    } else {
      return res.send(false);
    }
  } else {
    res.send(false);
  }
});

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
