const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");

// User model
const User = require("../models/User");

// Exercise model
const Task = require("../models/Task");

// Show tasks
router.get("/tasks", ensureAuthenticated, (req, res) => {
  const user = req.user;
  // Find all tasks associated with the logged-in user
  Task.find({ userId: user._id }, (err, tasks) => {
    res.render("tasks", {
      name: req.user.firstName,
      taskList: tasks,
    });
  });
});

router.get("/Completed", ensureAuthenticated, (req, res) => {
  const user = req.user;
  // Find completed tasks associated with the logged-in user
  Task.find({ userId: user._id }, (err, tasks) => {
    res.render("completed", {
      name: req.user.firstName,
      taskList: tasks,
    });
  });
});

router.get("/Incompleted", ensureAuthenticated, (req, res) => {
  const user = req.user;
  // Find incomplete tasks associated with the logged-in user
  Task.find({ userId: user._id }, (err, tasks) => {
    res.render("incompleted", {
      name: req.user.firstName,
      taskList: tasks,
    });
  });
});

// Add Task Page
router
  .route("/addTask")
  .get(ensureAuthenticated, async (req, res) => {
    // Render the "addTask" view for adding a new task
    res.render("addTask");
  })
  .post(ensureAuthenticated, async (req, res) => {
    const { name, description, dueDate } = req.body;
    const user = req.user;
    let errors = [];

    // Check required fields
    if (!name || !description || !dueDate) {
      errors.push({ msg: "Please fill in all fields" });
    }
    if (new Date(dueDate) - new Date() < 0) {
      errors.push({ msg: "Please choose a future date" });
    }
    if (errors.length > 0) {
      // Render the "addTask" view with error messages and the user's input
      res.render("addTask", {
        errors,
        name,
        description,
        dueDate,
      });
    } else {
      Task.findOne({ name: name, userId: user._id })
        .then((tasks) => {
          if (tasks) {
            errors.push({ msg: "The task exists" });
            // Render the "addTask" view with error messages and the user's input
            res.render("addTask", {
              errors,
              name,
              description,
              dueDate,
            });
          } else {
            // Create a new task
            const task = new Task({
              name: name,
              description: description,
              dueDate: dueDate,
              userId: user._id,
            });

            task
              .save()
              .then(() => {
                // Redirect to the dashboard after successfully saving the task
                res.redirect("/dashboard");
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => console.log(err));
    }
  });

// Mark a task as complete
router.get("/Complete/:id/:sendTo", ensureAuthenticated, (req, res) => {
  const { id, sendTo } = req.params;
  // Update the task's state to true (completed)
  Task.findByIdAndUpdate(
    { _id: id },
    { state: true },
    {
      useFindAndModify: true,
    }
  )
    .then(() => {
      // Redirect to the appropriate route based on the "sendTo" parameter
      if (sendTo === "dashboard") res.redirect("/dashboard");
      else res.redirect(`/tasks/${sendTo}`);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Mark a task as incomplete
router.get("/incomplete/:id/:sendTo", ensureAuthenticated, (req, res) => {
  const { id, sendTo } = req.params;
  // Update the task's state to false (incomplete)
  Task.findByIdAndUpdate(
    { _id: id },
    { state: false },
    {
      useFindAndModify: true,
    }
  )
    .then(() => {
      // Redirect to the appropriate route based on the "sendTo" parameter
      if (sendTo === "dashboard") res.redirect("/dashboard");
      else res.redirect(`/tasks/${sendTo}`);
    })
    .catch((err) => {
      console.log(err);
    });
});

// Delete a task
router.get("/deleteTask/:id/:sendTo", ensureAuthenticated, (req, res) => {
  const { id, sendTo } = req.params;
  // Find the task by ID and delete it
  Task.findByIdAndDelete(id)
    .then(() => {
      // Redirect to the appropriate route based on the "sendTo" parameter
      if (sendTo === "dashboard") res.redirect("/dashboard");
      else res.redirect(`/tasks/${sendTo}`);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
