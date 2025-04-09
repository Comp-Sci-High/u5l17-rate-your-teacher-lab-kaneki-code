const mongoose = require("mongoose");
const express = require("express");

const app = express();

app.use(express.static(__dirname + "/public"));

app.use(express.json());

app.set("view engine", "ejs");

app.use((req, res, next) => {
  console.log(`${req.method}: ${req.path}`);
  next();
});

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

const Teacher = mongoose.model("Teacher", teacherSchema, "Teachers");

const ratingSchema = new mongoose.Schema(
  {
    username: { type: String },
    teacher: { type: String },
    comment: { type: String },
    rating: { type: Number },
  },
  { timestamps: true }
);

const Rating = mongoose.model("Rating", ratingSchema, "Rating");

app.get("/", async (req, res) => {
  const teachers = await Teacher.find({}).sort({ createdAt: -1 });
  res.render("teachers.ejs", { teachers });
});

app.get("/ratings", async (req, res) => {
  const ratings = await Rating.find({}).sort({ createdAt: -1 });
  res.render("ratings.ejs", { ratings });
});

app.post("/add/rating", async (req, res) => {
  const newRating = await new Rating({
    username: req.body.username,
    teacher: req.body.teacher,
    comment: req.body.comment,
    rating: req.body.rating,
  }).save();
  res.json(newRating);
});

app.post("/add/teacher", async (req, res) => {
  const newTeacher = await new Teacher({
    name: req.body.name,
    department: req.body.department,
    image: req.body.image,
  }).save();

  res.json(newTeacher);
});

// Add your SRV string, make sure that the database is called CSHteachers
async function startServer() {
  await mongoose.connect("mongodb+srv://SE12:CSH2025@cluster0.pqx7f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

  app.listen(3000, () => {
    console.log(`Server running.`);
  });
}

startServer();
