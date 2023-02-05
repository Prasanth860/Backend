const express = require('express');
const departmentRoute = express.Router();
var departmentController = require('../Controllers/DepartmentController');
const { authMiddleware } = require("../utilities/AuthMiddleware")

departmentRoute.post('/save', authMiddleware, departmentController.save);
departmentRoute.get('/getById/:departmentId', authMiddleware, departmentController.getById);
departmentRoute.get('/getAll', authMiddleware, departmentController.getAll);
module.exports = departmentRoute;