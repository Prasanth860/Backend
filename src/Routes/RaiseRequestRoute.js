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
raiserequestRoute.post('/add-image', authMiddleware, requestController.addImage);
raiserequestRoute.post('/get-status-By-reqId', authMiddleware, requestController.getStatusByReqId);
raiserequestRoute.post('/get-chat-By-reqId', authMiddleware, requestController.getChatByReqId);
raiserequestRoute.post('/add-chat',authMiddleware,requestController.saveChat);
raiserequestRoute.post('/service-list',authMiddleware,requestController.assignService);
raiserequestRoute.post('/tasks-merge',authMiddleware,requestController.mergeTask);
raiserequestRoute.post('/employee-add-remove-from-task',authMiddleware,requestController.employeeAddOrRemove);
module.exports = raiserequestRoute;
