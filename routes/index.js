// Import necessary modules and models
var express = require("express");
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require("passport");
const localStrategy = require("passport-local");
const upload = require("./multer");

// Define Passport local strategy using userModel.authenticate()
passport.use(new localStrategy(userModel.authenticate()));

router.get("/", function (req, res) {
  res.render("index", { footer: false });
});

router.get("/login", function (req, res) {
  res.render("login", { footer: false });
});

router.get("/feed", isLoggedIn, async function (req, res) {
  const posts = await postModel.find().populate("user");
  res.render("feed", { footer: true, posts });
});

router.get("/profile", isLoggedIn, async function (req, res) {
  try {
    // Ensure req.session.passport.user is defined before accessing its properties
    if (req.session.passport && req.session.passport.user) {
      const user = await userModel
        .findOne({
          username: req.session.passport.user,
        })
        .populate("posts");
      if (user) {
        res.render("profile", { footer: true, user });
      } else {
        // Handle case where user is not found in the database
        res.status(404).send("User not found");
      }
    } else {
      // Handle case where req.session.passport.user is undefined
      res.status(401).send("User authentication failed");
    }
  } catch (err) {
    // Handle other errors that might occur during user retrieval
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/search", isLoggedIn, function (req, res) {
  res.render("search", { footer: true });
});

router.get("/edit", isLoggedIn, async function (req, res) {
  try {
    // Ensure req.session.passport.user is defined before accessing its properties
    if (req.session.passport && req.session.passport.user) {
      const user = await userModel.findOne({
        username: req.session.passport.user,
      });
      if (user) {
        res.render("edit", { footer: true, user });
      } else {
        // Handle case where user is not found in the database
        res.status(404).send("User not found");
      }
    } else {
      // Handle case where req.session.passport.user is undefined
      res.status(401).send("User authentication failed");
    }
  } catch (err) {
    // Handle other errors that might occur during user retrieval
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
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

router.post("/update", upload.single("image"), async function (req, res) {
  try {
    // Ensure user is authenticated before accessing session information
    if (
      req.isAuthenticated() &&
      req.session.passport &&
      req.session.passport.user
    ) {
      const updatedUserData = {
        username: req.body.username,
        name: req.body.name,
        bio: req.body.bio,
      };

      const user = await userModel.findOneAndUpdate(
        { username: req.session.passport.user },
        updatedUserData,
        { new: true }
      );

      // Check if the user exists and then update profile image if a file was uploaded
      if (user) {
        if (req.file) {
          user.profileImage = req.file.filename;
          await user.save();
        }
        return res.redirect("/profile");
      } else {
        return res.status(404).send("User not found");
      }
    } else {
      return res.status(401).send("User authentication failed");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/upload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res) {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const post = await postModel.create({
      picture: req.file.filename,
      user: user._id,
      caption: req.body.caption,
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/feed");
  }
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // If the user is not authenticated, redirect them to the login page
  res.redirect("/login");
}

router.use(function (req, res, next) {
  res.status(404).send("Not Found");
});
module.exports = router;
