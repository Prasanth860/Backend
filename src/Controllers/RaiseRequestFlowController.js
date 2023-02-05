const { RaiseRequest } = require('../utilities/dbUtilitiess.js');
const { HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_ACCEPTED } = require('http2').constants;
const catchAsync = require('../utilities/CatchAsync.js');

//Raise Request Api
exports.save = catchAsync(async (req, res, next) => {
    try{
    const { reqId, notes,locationId, sublocationId, departmentId,image,dueDate,userId,roleId} = req.body
    if (reqId && reqId != '' && reqId != 0) {
        const request = await RaiseRequest.findOne({ where: { reqId: reqId } });
        if(request){
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Request has been already created",
                data:request.dataValues
            })
        }
    }else{
        //image = json_encode(image)
        const responseBody = {
             notes,locationId, sublocationId, departmentId, image,dueDate,roleId,userId
        }
        await RaiseRequest.create(responseBody);
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: true,
            message: "Request created successfully"
        })
    }
    }catch(err){
        return res.status(500).send({ sucess: false, message: err.message })   
    }
});

//get all requests
exports.getAll = catchAsync(async (req, res) => {
    try {
        let requestRequests = await RaiseRequest.findAll();
        if (requestRequests) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Request data found",
                data: requestRequests
            })
        } else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "No data found",
                data: []
            })
        }
    } catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
})

//update Status
exports.update = catchAsync(async (req,res) => {
    try{
        const status = req.body.status;
        if(req.body.reqId == '' || req.body.status == ''){
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Invalid Attributes",
            })
        }
        let request =  await RaiseRequest.findOne({where:{reqId : req.body.reqId}});
        if(request){
            const responseBody = {status};
            await RaiseRequest.update(responseBody, { where: { reqId: req.body.reqId } });
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Request Status Updated Successfully",
            })
        }else{
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Request Not Found",
            })
        }
    }
    catch(err){
        return res.status(500).send({ sucess: false, message: err.message })
    }
});

// // Get By _id
exports.getById = catchAsync(async (req, res) => {
    try {
        let request = await RaiseRequest.findOne({ where: { reqId: req.params.reqId } });
        if (request) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Request found",
                data: request.dataValues
            })
        }
        else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Request not found",
                data: {}
            })
        }
    } catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
})

//search API
exports.search = catchAsync(async (req, res) => {
    try {
        if(req.body.note){
        var where = {
            'note' : {'LIKE' : req.body.q}
        };
        }
        if(req.body.departmentId){
            var where = {
                'departmentId' : req.body.departmentId
            }
        }
        if(req.body.locationId){
            var where = {
                'locationId' : req.body.locationId
            }
        }
        if(req.body.sublocationId){
            var where = {
                'sublocationId' : req.body.sublocationId
            }
        }
        if(req.body.reqId){
            var where = {
                'reqId' : req.body.reqId
            }
        }
        if(req.body.fromDate && req.body.toDate){
            var where = {
                'dueDate' : {'$gte' : req.body.fromDate,'$lte' : req.body.$toDate}
            }
        }
        let request = await RaiseRequest.findAll({ where: where });
        if (request) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Request data found",
                data: request
            })
        }
        else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Request not found",
                data: {}
            })
        }
    } catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
})

//Dashboard Api
exports.dashboard = catchAsync(async (req, res) => {
    try {
        if(req.body.date){
            const where = {
                'dueDate' : {'$lt' : req.body.date}
            }
        }
        const where = {
            status :['1','2','3']
        }
        var deptReqs = {};
        let request = await RaiseRequest.findAll({where:{status: ['1','2','3']}});
        if (request) {
            for(let i = 0 ; i < request.length ; i++){
                 deptReqs.i.departmentId = i;
            }
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Request found",
                data: deptReqs
            })
        }
        else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Request not found",
                data: {}
            })
        }
    } catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
});




