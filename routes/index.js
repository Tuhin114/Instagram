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

router.get("/feed", isLoggedIn, function (req, res) {
  res.render("feed", { footer: true });
});

router.get("/profile", isLoggedIn, function (req, res) {
  res.render("profile", { footer: true });
});

router.get("/search", isLoggedIn, function (req, res) {
  res.render("search", { footer: true });
});

router.get("/edit", isLoggedIn, function (req, res) {
  res.render("edit", { footer: true });
});

router.get("/upload", isLoggedIn, function (req, res) {
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

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
      res.redirect("/");
    }
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // If the user is not authenticated, redirect them to the login page
  res.redirect("/login");
}

// This line, res.redirect("/login"), seems to be misplaced in the previous code.
// It should be placed inside a middleware or route handler, not outside of them.
// If this is intended as a fallback route, you might want to move it inside an error handler or an undefined route handler.

// For instance, you can add a catch-all route handler for undefined routes at the end:
router.use(function (req, res, next) {
  res.status(404).send("Not Found");
});
module.exports = router;
