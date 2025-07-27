import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";
const app = express();
const port = 4000;
env.config();
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("login.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM todolist_users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } 
    else {
      bcrypt.hash(password,10, async (err, hash )=> {
        if(err){
          res.send("Error hashing password");
        }else{
            await db.query("INSERT INTO todolist_users (email, password) VALUES ($1,$2)",[email,hash]);
            res.render("index.ejs");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const result = await db.query("SELECT * FROM todolist_users WHERE email = $1", [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedPassword = user.password;

      const isMatch = await bcrypt.compare(password, storedPassword);

      if (isMatch) {
        res.render("index.ejs");
      } else {
        res.send("Invalid email or password.");
      }
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
    res.send("Internal Server Error");
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
