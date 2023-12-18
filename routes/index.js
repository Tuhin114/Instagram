// Import necessary modules and models
var express = require("express");
var router = express.Router();
const userModel = require("./users");
const passport = require("passport");
const localStrategy = require("passport-local");

// Define Passport local strategy using userModel.authenticate()
passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/feed", function (req, res) {
  res.render("feed", { footer: true });
});

router.get("/profile", function (req, res) {
  res.render("profile", { footer: true });
});

router.get("/search", function (req, res) {
  res.render("search", { footer: true });
});

router.get("/edit", function (req, res) {
  res.render("edit", { footer: true });
});

router.get("/upload", function (req, res) {
  res.render("upload", { footer: true });
});

// Handle user registration
router.post("/register", function (req, res, next) {
  // Create a new user based on the posted data
  const userData = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  });

  // Register the new user using userModel.register()
  userModel.register(userData, req.body.password, function (err, user) {
    if (err) {
      console.error(err);
      // Handle registration error, such as redirecting back to registration page with a message
      return res.redirect("/register"); // Adjust this route based on your setup
    }

    // Authenticate the registered user
    passport.authenticate("local")(req, res, function () {
      // Redirect to the profile page upon successful registration and authentication
      res.redirect("/profile");
    });
  });
});

module.exports = router;
