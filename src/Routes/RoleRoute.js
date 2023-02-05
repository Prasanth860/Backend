const express = require('express');
const roleRoute = express.Router();
var roleController = require('../Controllers/RoleController');
const { authMiddleware } = require("../utilities/AuthMiddleware")

roleRoute.post('/save', authMiddleware, roleController.save);
roleRoute.get('/getById/:roleId', authMiddleware, roleController.getById);
roleRoute.get('/getAll', authMiddleware, roleController.getAll);
module.exports = roleRoute;