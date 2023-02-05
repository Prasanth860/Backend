const express = require('express');
const raiserequestRoute = express.Router();
var requestController = require('../Controllers/RaiseRequestFlowController');
const { authMiddleware } = require("../utilities/AuthMiddleware.js")
raiserequestRoute.post('/raiseRequest',authMiddleware,  requestController.save);
raiserequestRoute.get('/getAll', authMiddleware, requestController.getAll);
module.exports = raiserequestRoute;