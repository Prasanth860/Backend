const express = require('express');
const userRouter = express.Router();
var userController = require('../Controllers/UserController');
const { authMiddleware } = require("../utilities/AuthMiddleware.js")

userRouter.post('/save',  userController.save);
userRouter.post('/login', userController.login);
userRouter.get('/getById/:userId', authMiddleware, userController.getById);
userRouter.get('/getAll', authMiddleware, userController.getAll);
userRouter.post('/sentOtp',userController.sentOtp);
userRouter.post('/validateOtp',userController.validateOtp);
userRouter.post('/save-admin',  userController.createAdmin);
userRouter.get('/get-all-admin',  userController.getAllAdmins);
userRouter.get('/get-all-employees', userController.getAllEmployees);

module.exports = userRouter;
