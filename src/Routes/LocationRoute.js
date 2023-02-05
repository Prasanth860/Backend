const express = require('express');
const locationRoute = express.Router();
var locationController = require('../Controllers/LocationController');
const { authMiddleware } = require("../utilities/AuthMiddleware")

locationRoute.post('/save', authMiddleware, locationController.save);
locationRoute.get('/getById/:locationId', authMiddleware, locationController.getById);
locationRoute.get('/getAll', authMiddleware, locationController.getAll);
module.exports = locationRoute;