const express = require('express');
const raiserequestRoute = express.Router();
var requestController = require('../Controllers/RaiseRequestFlowController');
const { authMiddleware } = require("../utilities/AuthMiddleware.js")
raiserequestRoute.post('/raiseRequest',authMiddleware,  requestController.save);
raiserequestRoute.post('/getAll', authMiddleware, requestController.getAll);
raiserequestRoute.get('/getById/:reqId', authMiddleware, requestController.getById);
raiserequestRoute.post('/assign-request', authMiddleware, requestController.update);
raiserequestRoute.post('/search', authMiddleware, requestController.search);
raiserequestRoute.post('/user-accept-reject', authMiddleware, requestController.updateRequest);

module.exports = raiserequestRoute;
