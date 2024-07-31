// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   firstName: {
//     type: String,
//     required: true,
//   },
//   lastName: {
//     type: String,
//     required: false,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: false, // Make password optional
//   },
//   username: {
//     type: String,
//     required: false, // Make username optional
//   },
//   // Add other fields if necessary
// });

// const User = mongoose.model("User", userSchema);

// module.exports = User;


// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false, // Make password optional
  },
  username: {
    type: String,
    required: false, // Make username optional
  },
  role: {
    type: String,
    required: true, // Add role field, required
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
