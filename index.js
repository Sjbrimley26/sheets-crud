import express from "express";
const dotenv = require("dotenv").config();
import path from "path";

const PORT = process.env.PORT;
const app = express();

app.use(express.static(path.join(__dirname, "client/build")));

app.get(["/", "/*"], (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/", "index.html"));
});

app.listen(PORT);
console.log("Now listening on port", PORT);
