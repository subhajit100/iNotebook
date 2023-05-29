const jwt = require("jsonwebtoken");
const JWT_SECRET = "Subhajitisagood$b$oy";

// get the user id by decoding the JWT and make a request with that user id
const fetchuser = (req, res, next) => {

  // get the jwt token passed in req header
    const token = req.header("auth-token");
  // throw error if no token retrieved from request header  
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }

  try {
    // verify the sent token authenticity, and will return the data containing the userId
    const data = jwt.verify(token, JWT_SECRET);
    // ammend the user to the request from the data received
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchuser;
