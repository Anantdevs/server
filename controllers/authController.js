const User = require("../models/User");
const { generateToken } = require("../utils/generateTokens");
const bcrypt = require("bcrypt");

module.exports.registerUser = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let user = await User.findOne({ email: email });
    if (user) {
      res.send("error,user already exists");
    } else {
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
          if (err) return res.send(err.message);
          else {
            let user = await User.create({
              email,
              password: hash,
              username,
            });
            let token = generateToken(user);
            res.cookie("token", token);
            res.send("user created sucessfully");
          }
        });
      });
    }
  } catch (err) {
    console.log(err.message);
  }
};

module.exports.loginUser = async function (req, res) {
  let { email, password } = req.body;
  let user = await User.findOne({ email: email });
  if (!user) return res.send("Email or Password incorrect");
  bcrypt.compare(password, user.password, function (err, result) {
    if (result) {
      let token = generateToken(user);
      res.cookie("token", token);
      res.send("user Logged in sucessfully" + res.cookie);
    } else {
      return res.send("Email or Password incorrect");
    }
  });
};

module.exports.logout = async function (req, res) {
  res.cookie("token", "");
  res.send("user Logged Out sucessfully");
};
