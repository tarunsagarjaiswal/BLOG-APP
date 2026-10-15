const express = require("express");
const User = require("../models/userSchema");
const {createUser, getAllUsers, getUserById, updateUser, deleteUser, login} = require("../controllers/userController");
const route = express.Router();

// console.log("user")

route.post("/signup", createUser);

route.post("/signin", login)

route.get("/users" , getAllUsers);

route.get("/users/:id" , getUserById)

route.patch("/users/:id", updateUser);

route.delete("/users/:id", deleteUser);

module.exports = route;