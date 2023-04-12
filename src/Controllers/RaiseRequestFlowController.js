const { RaiseRequest,DepartmentDetails, SublocationDetails,LocationDetails,AdminDetails,UserDetails } = require('../utilities/dbUtilitiess.js');
const { HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_ACCEPTED } = require('http2').constants;
const catchAsync = require('../utilities/CatchAsync.js');
process.env.AWS_CONFIG_FILE = require('../config/aws');
process.env.AWS_SDK_LOAD_CONFIG = 1;
const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const fs = require('fs');
const time = Date.now();
const STATUS = {
    1:'PENDING',
    2:'ASSIGN_TO_USER',
    3:'MERGED_WITH_PREVIOUS_TASK',
    4:'USER_DECLINED',
    5:'INPROGRESS',
    6:'WAITING_FOR_MATERIAL',
    7:'COMPLETED',
    8:'CLOSED',
    9:'REOPEN'
  }
//Raise Request Api
exports.save = catchAsync(async (req, res, next) => {
    try {
        const { reqId, notes, locationId, sublocationId, departmentId, image, dueDate, userId, roleId } = req.body
        if (reqId && reqId != '' && reqId != 0) {
            const request = await RaiseRequest.findOne({ where: { reqId: reqId } });
            if (request) {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "Request has been already created",
                    data: request.dataValues
                })
            }
        } else {
            const responseBody = {
                notes, locationId, sublocationId, departmentId, dueDate, roleId, userId
            }
            const record = await RaiseRequest.create(responseBody);
            if (req.body.image) {
                if(req.body.image.startsWith("data:image/png;base64,")){
                    var base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
                }else if(req.body.image.startsWith("data:image/jpeg;base64,")){
                    var base64Data = req.body.image.replace(/^data:image\/jpeg;base64,/, "");
                }else{
                    var base64Data = req.body.image.replace(/^data:image\/jpg;base64,/, "");
                }
                if (base64Data) {
                    require("fs").writeFile("resources/image" + record.reqId, base64Data, 'base64', function (err) {
                    });
                }
            }
            const bucketName = 'srilalithaapp';
            const key = 'resources/image' + record.reqId;
            const uploadparams = {
                Bucket: bucketName,
                Key: key,
                Body: fs.createReadStream('/var/www/html/Backend/'+key),
                ACL: 'public-read',
            };
            s3.upload(uploadparams, (err, data) => {
                if (err) {
                    console.error(err);
                }
            });
            const params = {
                Bucket: bucketName,
                Key: key,
            };
            async function getAndUseSignedUrl(id) {
                let awsUrl = getSignedUrl(params);
                let signedUrl = await awsUrl;
                let request = await RaiseRequest.findOne({ where: { reqId: id } });
                if (request) {
	            console.log(signedUrl);
                    const responseBody = { image:signedUrl };
                    await RaiseRequest.update(responseBody, { where: { reqId: id } });
                    res.status(HTTP_STATUS_ACCEPTED).json({
                        status: true,
                        message: "Request created successfully"
                    })
                }
            }
            getAndUseSignedUrl(record.reqId);
        }
    } catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
});

//get all requests
exports.getAll = catchAsync(async (req, res) => {
    try {
        //let requestRequests = await RaiseRequest.findAll({ where: { userId: req.body.userId } });
	let requestRequests = [];
        if(req.body.roleId == '9' && req.body.userId){
            let user = await AdminDetails.findOne({where:{userId:req.body.userId}})
            if(!user){
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "user not found"
                })
            }
            if(user.departmentId){
                 requestRequests = await RaiseRequest.findAll({ where:{departmentId:user.departmentId} });
            }
        }else{
            requestRequests = await RaiseRequest.findAll({ where: { userId: req.body.userId } });
        }
	const responseArray = [];

        if (requestRequests) {
	    for (const request of requestRequests) {
		let sublocation; 
                 const location = await LocationDetails.findOne({ where: { locationId: request.locationId } });
		if(request.sublocationId){
			 sublocation = await SublocationDetails.findOne({where:{sublocationId:request.sublocationId}});
		}
		const createdBy = await UserDetails.findOne({where:{userId:request.userId}});
                //const sublocation = await SublocationDetails.findOne({where:{sublocationId:request.sublocationId}});
                const dept = await DepartmentDetails.findOne({where:{departmentId:request.departmentId}});
                const responseBody = {
                    reqId:request.reqId,
                    notes:request.notes,
                    departmentId:request.departmentId,
                    deptName:dept.departmentName,
                    locationId:request.locationId,
                    locationName : location.locationName,
                    sublocationId:request.sublocationId,
                    sublocationName: (sublocation && sublocation.sublocationName) ? sublocation.sublocationName : "null",
                    dueDate:request.dueDate,
                    image:request.image,
                    createdBy:request.userId,
		    createdUser:createdBy.firstName+' '+createdBy.lastName,
                    status:STATUS[request.status]
                }
		if(request.status == '2'){
		   if(request.assignedUser){
			const assignedUser = await UserDetails.findOne({where:{userId:request.assignedUser}});
		   	responseBody.assignedUserName = assignedUser.firstName+' '+assignedUser.lastName;
                        responseBody.assignedUser = request.assignedUser;
		    }
		   //const assignedUser = await UserDetails.findOne({where:{userId:request.assignedUser}});
		   if(request.assignedBy){
		   const assignedBy = await AdminDetails.findOne({where:{userId:request.assignedBy}});
		  // responseBody.assignedUserName = assignedUser.firstName+' '+assignedUser.lastName;
		   //responseBody.assignedUser = request.assignedUser;
		   responseBody.assignedByName = assignedBy.firstName+' '+assignedBy.lastName; 
                   responseBody.assignedBy = request.assignedBy;
		   }
		}

                responseArray.push(responseBody);            
            }
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Request data found",
                data:responseArray
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
	 const assignedUser = req.body.assignedUser;
        const assignedBy = req.body.assignedBy;
	const updatedBy = req.body.assignedBy;

        if(req.body.reqId == '' || req.body.status == ''){
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Invalid Attributes",
            })
        }
        let request =  await RaiseRequest.findOne({where:{reqId : req.body.reqId}});
        if(request){
	    if(request.status == '1' || request.status == '4'){
            const responseBody = {status,assignedBy,assignedUser,updatedBy};
            await RaiseRequest.update(responseBody, { where: { reqId: req.body.reqId } });
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Request Status Updated Successfully",
            })
	   }else{
		res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Request Not In Pending or Declined",
            })
	    }
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
    try{
        if(req.body.note){
        let where = {
            'note' : {'LIKE' : req.body.q}
        }
        }
        if(req.body.departmentId){
            let where = {
                'department_Id' : req.body.departmentId
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
	console.log(where);
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


function getSignedUrl(params) {
    return new Promise((resolve, reject) => {

        s3.getSignedUrl('getObject', params, (err, url) => {
            if (err) {
                reject(err);
            } else {
                const imageUrl = url.split('?');
                var picUrl = imageUrl[0];
                resolve(picUrl);
            }
        });
    });
}


exports.updateRequest = catchAsync(async (req,res) => {
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
