const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
// Exercise model
const Task = require("../models/Task");

// Time
let date = 0;

// Welcome page
router.get("/", (req, res) => {
  if (new Date().getDate() != date) {
    date = new Date().getDate();
    //Find incompleted tasks
    Task.find({ state: false }, (err, tasks) => {
    });
    res.render("welcome");
  } else {
    console.log(date);
    res.render("welcome");
  }
});

// Dashboard page
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  const user = req.user;
  Task.find({ userId: user._id }, (err, tasks) => {
    res.render("dashboard", {
      name: req.user.firstName,
      taskList: tasks,
    });
  });
});

router.get('/PageNotFound', (req, res)=>{
  res.render('ErrorPage');
});


module.exports = router;
