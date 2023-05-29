const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "Subhajitisagood$b$oy";

// ROUTE 1 : Create a user using POST request: /api/auth/createuser. No login required
router.post(
  "/createuser",
  // validating name, email and password for basic checks using express-validator
  [
    body("name", "name must be at least 3 characters").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    // if there are errors, return bad request and the errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    try {
      // check whether a user with this email already exists
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "The entered email already exists" });
      }

      // hashing and salting password for extra security
      const salt = await bcrypt.genSalt(10);
      const securePassword = await bcrypt.hash(req.body.password, salt);

      // creating a new user and saving it to database
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePassword,
      });

      // this 'data' will be used for jwt auth token creation
      const data = {
        user: {
          id: user.id,
        },
      };

      // the jwt authToken generated from the data so that multiple times login not required with your creds
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });

    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server error");
    }
  }
);

// ROUTE 2 : Authenticate a user using POST request: /api/auth/login. No login required
router.post(
  "/login",
  // validating name, email and password for basic checks using express-validator
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password should not be empty").notEmpty(),
  ],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    // if there are errors, return bad request and the errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // taking email and password from req.body sent by user
    const { email, password } = req.body;
    try {
      // check whether this email is present in db
      let user = await User.findOne({ email });
      // this will run if email not present in db, it means user not signed up
      if (!user) {
        return res
          .status(400)
          .json({ success, error: "Please enter valid credentials" });
      }

      // if we are here, means some user is there with the email,
      //and now we will compare the password in db and entered by user
      const passwordCorrect = await bcrypt.compare(password, user.password);
      // if password doesn't match , then will go inside if block
      if (!passwordCorrect) {
        return res
          .status(400)
          .json({ success, error: "Please enter valid credentials" });
      }

      // if we are here , it means email and password both are correct, will create the authtoken now
      // this 'data' will be used for jwt auth token creation
      const data = {
        user: {
          id: user.id,
        },
      };

      // the jwt authToken generated from the data so that multiple times login not required with your creds
      const authToken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server error");
    }
  }
);

// ROUTE 3 : Get loggedin user details using POST request: /api/auth/getuser. Login required
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    // got the userId from req.user.id as we have updated the req inside 'fetchuser' method
    let userId = req.user.id;
    // .select("-password") will return all fields of User except 'password'
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server error");
  }
});

module.exports = router;
