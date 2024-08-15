const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function (req, res, next) {
  if (!req.cookies.token) {
    res.send("not loggedin");
  }

  try {
    let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
    let user = await User.findOne({ email: decoded.email }).select("-password");
    req.user = user;
    if (user) {
      res.locals.loggedin = true;
    } else {
      res.locals.loggedin = false;
    }
    next();
  } catch (err) {
    res.send("sth went wrong ");
  }
};
