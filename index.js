require("dotenv").config()
const multer = require("multer")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const File = require("./models/file.js")

const express = require("express")
const app = express()
app.use(express.urlencoded({ extended: true }))

app.use(express.static('public'));

app.use('/favicon.ico', express.static('public'));

const upload = multer({ dest: "uploads" })

mongoose.connect(process.env.MONGO_URI)

app.set("view engine", "ejs")

app.get("/", async (req, res) => {
    const files = await File.find().sort({ uploadDate: "desc" });
    res.render("index", { files });  
})

app.get("/add", (req, res) => {
    res.render("add")
})

app.post("/upload", upload.single("file"), async (req, res) => {
    const fileData = {
      path: req.file.path,
      originalName: req.file.originalname,
    };
  
    if (req.file.mimetype.startsWith("image/")) {
      fileData.type = "image";
    } else if (req.file.mimetype.startsWith("text/")) {
      fileData.type = "text";
    } else if (req.file.mimetype.startsWith("video/")) {
      fileData.type = "video";
    } else {
      fileData.type = "file";
    }
  
    if (req.body.password != null && req.body.password !== "") {
      fileData.password = await bcrypt.hash(req.body.password, 10);
    }

    if (req.body.name != null && req.body.name !== "") {
      fileData.name = req.body.name
    }
  
    const file = await File.create(fileData);
  
    res.redirect("/");
  });
  


app.route("/file/:id").get(handleDownload).post(handleDownload)

async function handleDownload(req, res) {
  const file = await File.findById(req.params.id)

  if (file.password != null) {
    if (req.body.password == null) {
      res.render("password")
      return
    }

    if (!(await bcrypt.compare(req.body.password, file.password))) {
      res.render("password", { error: true })
      return
    }
  }
  

  await file.save()

  res.download(file.path, file.originalName)
}

const fs = require("fs");

app.delete("/deleteAllData", async (req, res) => {
  const password = req.body.password || req.headers.password;
  if (password !== process.env.PASSWORD) {
    return res.status(401).json({ message: "Incorrect password." });
  }

  try {
    const files = fs.readdirSync("uploads");
    for (const file of files) {
      fs.unlinkSync(`uploads/${file}`);
    }

    await File.deleteMany({});
    await mongoose.connection.dropDatabase();

    res.status(200).json({ message: "All files and database cleared successfully." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while clearing all data." });
  }
  
});

  


app.listen(process.env.PORT)