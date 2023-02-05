const express = require('express');
const subLocationRoute = express.Router();
var sublocationController = require('../Controllers/SublocationController');
const { authMiddleware } = require("../utilities/AuthMiddleware")

subLocationRoute.post('/save', authMiddleware, sublocationController.save);
subLocationRoute.get('/getById/:sublocationId', authMiddleware, sublocationController.getById);
subLocationRoute.get('/getAll', authMiddleware, sublocationController.getAll);
module.exports = subLocationRoute;