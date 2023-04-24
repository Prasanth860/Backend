const { RaiseRequest, DepartmentDetails, SublocationDetails, LocationDetails, AdminDetails, UserDetails, RequestStatusModel, ChatModel } = require('../utilities/dbUtilitiess.js');
const { HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_ACCEPTED } = require('http2').constants;
const catchAsync = require('../utilities/CatchAsync.js');
process.env.AWS_CONFIG_FILE = require('../config/aws');
process.env.AWS_SDK_LOAD_CONFIG = 1;
const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const fs = require('fs');
const { DATE } = require('sequelize');
const { login } = require('./UserController.js');
const time = Date.now();
const STATUS = {
    1: 'PENDING',
    2: 'ASSIGN_TO_USER',
    3: 'MERGED_WITH_PREVIOUS_TASK',
    4: 'USER_DECLINED',
    5: 'INPROGRESS',
    6: 'WAITING_FOR_MATERIAL',
    7: 'COMPLETED',
    8: 'CLOSED',
    9: 'REOPEN'
}
//Raise Request Api
exports.save = catchAsync(async (req, res, next) => {
    try {
        const { reqId, notes, locationId, sublocationId, departmentId, image, dueDate, userId, roleId } = req.body
        let loginUser = req.user;
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
                notes, locationId, sublocationId, departmentId, dueDate, roleId: loginUser.role, userId: loginUser.userId, createdBy: loginUser.userId, updatedBy: loginUser.userId
            }

            const record = await RaiseRequest.create(responseBody);
            console.log(record);
            const statusBody = {
                reqId: record.dataValues.reqId,
                status: record.dataValues.status,
                createdBy: loginUser.userId,
                reason: "TASK_CREATED"
            };
            await RequestStatusModel.create(statusBody);
            if (req.body.image) {
                if (req.body.image.startsWith("data:image/png;base64,")) {
                    var base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
                } else if (req.body.image.startsWith("data:image/jpeg;base64,")) {
                    var base64Data = req.body.image.replace(/^data:image\/jpeg;base64,/, "");
                } else {
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
                Body: fs.createReadStream('/var/www/html/Backend/' + key),
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
                    const responseBody = { image: signedUrl };
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
        let requestRequests = [];
        let loginUser = req.user;
        req.body.userId = loginUser.userId;
        req.body.roleId = loginUser.role;
        if (req.body.roleId == '9' && req.body.userId) {
            let user = await AdminDetails.findOne({ where: { userId: req.body.userId } })
            if (!user) {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "user not found"
                })
            }
            if (user.departmentId) {
                requestRequests = await RaiseRequest.findAll({ where: { departmentId: user.departmentId } });
            }
        } else {
            requestRequests = await RaiseRequest.findAll({ where: { userId: req.body.userId } });
        }
        const responseArray = [];

        if (requestRequests) {
            for (const request of requestRequests) {
                let sublocation;
                const location = await LocationDetails.findOne({ where: { locationId: request.locationId } });
                if (request.sublocationId) {
                    sublocation = await SublocationDetails.findOne({ where: { sublocationId: request.sublocationId } });
                }
                //const sublocation = await SublocationDetails.findOne({where:{sublocationId:request.sublocationId}});
                const dept = await DepartmentDetails.findOne({ where: { departmentId: request.departmentId } });
                const responseBody = {
                    reqId: request.reqId,
                    notes: request.notes,
                    departmentId: request.departmentId,
                    deptName: dept.departmentName,
                    locationId: request.locationId,
                    locationName: location.locationName,
                    sublocationId: request.sublocationId,
                    sublocationName: (sublocation && sublocation.sublocationName) ? sublocation.sublocationName : "null",
                    dueDate: request.dueDate,
                    image: request.image,
                    createdBy: request.createdBy,
                    updatedBy: request.updatedBy,
                    status: STATUS[request.status],
                    createdAt: request.createdAt,
                    updatedAt: request.updatedAt
                }
                if (request.status == '2') {
                    if (request.assignedUser) {
                        const assignedUser = await UserDetails.findOne({ where: { userId: request.assignedUser } });
                        responseBody.assignedUserName = assignedUser.firstName + ' ' + assignedUser.lastName;
                        responseBody.assignedUser = request.assignedUser;
                    }
                    if (request.assignedBy) {
                        const assignedBy = await AdminDetails.findOne({ where: { userId: request.assignedBy } });
                        responseBody.assignedByName = assignedBy.firstName + ' ' + assignedBy.lastName;
                        responseBody.assignedBy = request.assignedBy;
                    }
                }
                if (request.createdBy) {
                    let user = await UserDetails.findOne({ where: { userId: request.createdBy } });
                    responseBody.createdUser = user.firstName + ' ' + user.lastName;
                }
                if (request.updatedBy) {
                    let updatedUser = await AdminDetails.findOne({ where: { userId: request.updatedBy } });
                    responseBody.updatedUser = updatedUser.firstName + ' ' + updatedUser.lastName;
                }
                responseArray.push(responseBody);
            }

            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Request data found",
                data: responseArray
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

//update Status assign api 
exports.update = catchAsync(async (req, res) => {
    try {
        const status = req.body.status;
        const assignedUser = req.body.assignedUser;
        let loginUser = req.user;
        const assignedBy = loginUser.userId;
        if (req.body.reqId == '' || req.body.status == '') {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Invalid Attributes",
            })
        }
        let statusBody = [];
        let request = await RaiseRequest.findOne({ where: { reqId: req.body.reqId } });
        if (request) {
            if (request.status == '1' || request.status == '4') {
                const responseBody = { status, assignedBy, assignedUser, updatedBy: loginUser.userId };
                if (request.status == '1') {
                    statusBody = {
                        reqId: req.body.reqId,
                        status: status,
                        createdBy: assignedBy,
                        assignedUser: assignedUser,
                        reason: 'TASK_ASSIGNED'
                    }
                } else {
                    statusBody = {
                        reqId: req.body.reqId,
                        status: status,
                        createdBy: assignedBy,
                        assignedUser: assignedUser,
                        reason: 'TASK_REASSIGNED'
                    }
                }
                await RequestStatusModel.create(statusBody);
                await RaiseRequest.update(responseBody, { where: { reqId: req.body.reqId } });
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: true,
                    message: "Request Status Updated Successfully",
                })
            } else {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "Request Not In Pending or Declined",
                })
            }
        } else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Request Not Found",
            })
        }
    }
    catch (err) {
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
        if (req.body.note) {
            let where = {
                'note': { 'LIKE': req.body.q }
            }
        }
        if (req.body.departmentId) {
            let where = {
                'department_Id': req.body.departmentId
            }
        }
        if (req.body.locationId) {
            var where = {
                'locationId': req.body.locationId
            }
        }
        if (req.body.sublocationId) {
            var where = {
                'sublocationId': req.body.sublocationId
            }
        }
        if (req.body.reqId) {
            var where = {
                'reqId': req.body.reqId
            }
        }
        if (req.body.fromDate && req.body.toDate) {
            var where = {
                'dueDate': { '$gte': req.body.fromDate, '$lte': req.body.$toDate }
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
        if (req.body.date) {
            const where = {
                'dueDate': { '$lt': req.body.date }
            }
        }
        const where = {
            status: ['1', '2', '3']
        }
        var deptReqs = {};
        let request = await RaiseRequest.findAll({ where: { status: ['1', '2', '3'] } });
        if (request) {
            for (let i = 0; i < request.length; i++) {
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

//update status for request Id
exports.updateRequest = catchAsync(async (req, res) => {
    try {
        const status = req.body.status;
        let loginUser = req.user;
        if (req.body.reqId == '' || req.body.status == '') {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Invalid Attributes",
            })
        }
        let request = await RaiseRequest.findOne({ where: { reqId: req.body.reqId } });
        if (request) {
            const responseBody = { status, updatedBy: loginUser.userId };
            if (status == '8') {
                const statusBody = {
                    reqId: req.body.reqId,
                    status: status,
                    createdBy: request.assignedUser,
                    reason: 'TASK_REOPEN'
                }
            } else if (status == '6') {
                const statusBody = {
                    reqId: req.body.reqId,
                    status: status,
                    createdBy: request.assignedUser,
                    reason: 'WAITING_FOR_MATERIAL'
                }
            } else if (status == '7') {
                const statusBody = {
                    reqId: req.body.reqId,
                    status: status,
                    createdBy: request.assignedUser,
                    reason: 'COMPLETED'
                }
            }
            else if (status == '5') {
                statusBody = {
                    reqId: req.body.reqId,
                    status: status,
                    createdBy: request.assignedUser,
                    reason: 'TASK_ACCEPTED'
                }
            } else if (status == '4') {
                statusBody = {
                    reqId: req.body.reqId,
                    status: status,
                    createdBy: request.assignedUser,
                    reason: 'TASK_DECLINED'
                }
            }
            await RequestStatusModel.create(statusBody);
            await RaiseRequest.update(responseBody, { where: { reqId: req.body.reqId } });
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Request Status Updated Successfully",
            })
        } else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Request Not Found",
            })
        }
    }
    catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
});


//Add Image in request 
exports.addImage = catchAsync(async (req, res, next) => {
    try {

        const { reqId, image } = req.body
        let loginUser = req.user;

        if (reqId && reqId != '' && reqId != 0) {
            const request = await RaiseRequest.findOne({ where: { reqId: reqId } });
            if (request) {
                if (req.body.image) {
                    if (req.body.image.startsWith("data:image/png;base64,")) {
                        var base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
                    } else if (req.body.image.startsWith("data:image/jpeg;base64,")) {
                        var base64Data = req.body.image.replace(/^data:image\/jpeg;base64,/, "");
                    } else {
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
                    Body: fs.createReadStream('/var/www/html/Backend/' + key),
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
                        const images = request.image || []; // get existing images or create an empty array
                        const responseBody = { image: [...images, signedUrl], updatedBy: loginUser.userId };
                        await RaiseRequest.update(responseBody, { where: { reqId: id } });
                        res.status(HTTP_STATUS_ACCEPTED).json({
                            status: true,
                            message: "Image Uploaded successfully"
                        })
                    }
                }
                getAndUseSignedUrl(record.reqId);
            } else {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "Record Not Found",
                })
            }
        }
    } catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
});

//GET STATUS BY REQ ID
exports.getStatusByReqId = catchAsync(async (req, res) => {
    try {
        if (req.body.reqId == '') {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Invalid Attributes",
            })
        }

        let requestBystatus = await RequestStatusModel.findAll({ where: { reqId: req.body.reqId } });
        if (requestBystatus) {
            let responseArray = [];
            for (const request of requestBystatus) {
                if (request.status == '1') {
                    const createdBy = await UserDetails.findOne({ where: { userId: request.createdBy } });
                    responseBody = {
                        createdBy: request.createBy,
                        createdUser: createdBy.firstName + ' ' + createdBy.lastName,
                        createdAt: request.createdAt,
                        reason: request.reason
                    }
                }
                if (request.status == '2') {
                    const assignedBy = await AdminDetails.findOne({ where: { userId: request.createdBy } });
                    const assignedTo = await UserDetails.findOne({ wher: { userId: request.assignedUser } });
                    responseBody = {
                        assignedTo: request.assignedUser,
                        assignedUserName: assignedTo.firstName + ' ' + assignedTo.lastName,
                        createdAt: request.createdAt,
                        assignedBy: request.createdBy,
                        assignedByName: assignedBy.firstName + ' ' + assignedBy.lastName,
                        reason: request.reason
                    }
                }
                if (request.status == '4') {
                    const declinedBy = await UserDetails.findOne({ wher: { userId: request.assignedUser } });

                    responseBody = {
                        declineBy: request.createBy,
                        declinedByName: declinedBy.firstName + ' ' + declinedBy.lastName,
                        createdAt: request.createdAt,
                        reason: request.reason
                    }
                }
                if (request.status == '5') {
                    const assignedTo = await UserDetails.findOne({ wher: { userId: request.assignedUser } });
                    responseBody = {
                        acceptedBy: request.assignedTo,
                        acceptedByName: assignedTo.firstName + ' ' + assignedTo.lastName,
                        createdAt: request.createdAt,
                        reason: request.reason
                    }
                }

                if (request.status == '3' || request.status == '6' || request.status == '7' || request.status == '8') {
                    const UserDetails = await UserDetails.findOne({ wher: { userId: request.createdBy } });
                    responseBody = {
                        acceptedByName: UserDetails.firstName + ' ' + UserDetails.lastName,
                        createdAt: request.createdAt,
                        reason: request.reason
                    }
                }
                responseArray.push(responseBody);
            }
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Data Found",
                data: responseArray
            })
        } else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Request Not Found",
            })
        }
    }
    catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
});

//get chat
exports.getChatByReqId = catchAsync(async (req, res) => {
    if (req.body.reqId == '') {
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: false,
            message: "Invalid Attributes",
        })
    }
    let chat = await ChatModel.findOne({ where: { reqId: req.body.reqId } });
    if (chat) {
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: true,
            message: "Chat Found",
            data: chat.dataValues
        })
    } else {
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: false,
            message: "No Chat Found",
        })
    }
});

//save chat
exports.saveChat = catchAsync(async (req, res) => {
    if (req.body.reqId == '') {
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: false,
            message: "Invalid Attributes",
        })
    }
    let chat = await ChatModel.findOne({ where: { reqId: req.body.reqId } });
    if (chat) {
        let messages = chat ? chat.dataValues.messages : [];
        if (req.body.userId && req.body.message) {
            let Newmessages = [{ message: req.body.message, createdUser: req.body.userId, createdAt: Date.now(), userName: req.body.userName }];
            messages.push(Newmessages);
            responseBody = { messages };
            await ChatModel.update(responseBody, { where: { reqId: req.body.reqId } })
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Save Successfully",
                data: messages
            })
        }
        if (req.body.userId && req.body.image) {
            let imageName = "image" + chat.reqId + Date.now();
            if (req.body.image) {
                if (req.body.image.startsWith("data:image/png;base64,")) {
                    var base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
                } else if (req.body.image.startsWith("data:image/jpeg;base64,")) {
                    var base64Data = req.body.image.replace(/^data:image\/jpeg;base64,/, "");
                } else {
                    var base64Data = req.body.image.replace(/^data:image\/jpg;base64,/, "");
                }
                if (base64Data) {
                    require("fs").writeFile("resources/" + imageName, base64Data, 'base64', function (err) {
                    });
                }
            }
            const bucketName = 'srilalithaapp';
            const key = 'resources/' + imageName;
            const uploadparams = {
                Bucket: bucketName,
                Key: key,
                Body: fs.createReadStream("/var/www/html/Backend/" + key),
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
            async function getAndUseSignedUrl() {
                let awsUrl = getSignedUrl(params);
                let signedUrl = await awsUrl;
                let newMessages = [{ message: signedUrl, createdUser: req.body.userId, createdAt: Date.now(), userName: req.body.userName }];
                messages.push(newMessages);
                responseBody = { messages }
                await ChatModel.update(responseBody, { where: { reqId: req.body.reqId } })
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: true,
                    message: "Save Successfully",
                    data: messages
                })
            }
            getAndUseSignedUrl();
        }
    } else {
        let request = await RaiseRequest.findOne({ where: { reqId: req.body.reqId } });
        let reqId = req.body.reqId;
        let user = await UserDetails.findOne({ where: { userId: request.dataValues.userId } });
        let assigned_User = await UserDetails.findOne({ where: { userId: request.dataValues.assignedUser } });
        let assigned_By = await UserDetails.findOne({ where: { userId: request.dataValues.assignedBy } });
        let userId = [
            {
                role: 'employee',
                userId: request.dataValues.userId,
                userName: user.dataValues.firstName + ' ' + user.dataValues.lastName,
                createdBy: request.dataValues.userId,
                pic:user.dataValues.image
            },
            {
                role: 'employee',
                userId: request.dataValues.assignedUser,
                userName: assigned_User.dataValues.firstName + ' ' + assigned_User.dataValues.lastName,
                assignedTo: request.dataValues.assignedUser,
                pic:user.dataValues.image
            },
            {
                role: 'HOD',
                userId: request.dataValues.assignedBy,
                userName: assigned_By.dataValues.firstName + ' ' + assigned_By.dataValues.lastName,
                assignedBy: request.dataValues.assignedUser,
                pic:userInfo.dataValues.image
            },
        ];
        //let userId = [[role : 'User',userId:request.dataValues.userId)],{request.dataValues.assignedBy,request.dataValues.assignedUser];
        let messages = [];
        responseBody = { reqId, userId, messages }
        await ChatModel.create(responseBody);
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: true,
            message: "Saved Successfully",
            data: userId
        })
    }
});

//assign service to request  
exports.assignService = catchAsync(async (req, res) => {
    if (req.body.reqId == '') {
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: false,
            message: "Invalid Attributes",
        })
    }

    let responseArray = [];
    let request = await RaiseRequest.findOne({ where: { reqId: req.body.reqId } });
    let requests = await RaiseRequest.findAll({ where: { departmentId: request.dataValues.departmentId, status: ['1', '5'] } });
    for (const request of requests) {
        let sublocation;
        const location = await LocationDetails.findOne({ where: { locationId: request.locationId } });
        if (request.sublocationId) {
            sublocation = await SublocationDetails.findOne({ where: { sublocationId: request.sublocationId } });
        }
        const createdBy = await UserDetails.findOne({ where: { userId: request.userId } });
        const dept = await DepartmentDetails.findOne({ where: { departmentId: request.departmentId } });
        const responseBody = {
            reqId: request.reqId,
            notes: request.notes,
            departmentId: request.dataValues.departmentId,
            deptName: dept.dataValues.departmentName,
            locationId: request.locationId,
            locationName: location.locationName,
            sublocationId: request.sublocationId,
            sublocationName: (sublocation && sublocation.sublocationName) ? sublocation.sublocationName : "null",
            dueDate: request.dueDate,
            image: request.image,
            createdBy: request.userId,
            createdUser: createdBy.dataValues.firstName + ' ' + createdBy.dataValues.lastName,
            status: STATUS[request.status],
            createdAt: request.createdAt,
            updatedAt: request.updatedAt
        }
        responseArray.push(responseBody);
    }
    res.status(HTTP_STATUS_ACCEPTED).json({
        status: true,
        message: "Request data found",
        data: responseArray
    })

});
//merge the task
exports.mergeTask = catchAsync(async (req, res) => {
    if (req.body.assignedId == '' || req.body.mergeId == '') {
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: false,
            message: "Invalid Attributes",
        })
    }
    let loginUser = req.user;
    let mergeRequestDetails = await RaiseRequest.findOne({ where: { reqId: req.body.mergeId } });
    let assignedRequestDetails = await RaiseRequest.findOne({ where: { reqId: req.body.assignedId } });

    if (mergeRequestDetails) {
        responseBody = { status: '3', updatedBy: loginUser.userId }
        await RaiseRequest.update(responseBody, { where: { reqId: req.body.mergeId } });
        const statusBody = {
            reqId: req.body.mergeId,
            createBy: mergeRequestDetails.createBy,
            status: '3',
            reason: 'TASK_MERGED'
        };
        await RequestStatusModel.create(statusBody);
    }
    if (assignedRequestDetails) {
        let chat = await ChatModel.findOne({ reqId: req.body.assignedId });
        let userId = chat.dataValues.userId;
        let user = await UserDetails.findOne({ where: { userId: mergeRequestDetails.dataValues.userId } });
        let newUser = {
            role: 'employee',
            userId: mergeRequestDetails.dataValues.userId,
            userName: user.dataValues.firstName + ' ' + user.dataValues.lastName,
            pic:user.dataValues.image
        }
        userId.push(newUser);
        const responseBody = { userId };
        await ChatModel.update(responseBody, { where: { reqId: req.body.assignedId } });

        const status = {
            reqId: req.body.assignedId,
            createBy: mergeRequestDetails.createBy,
            status: '5',
            reason: 'USER_ADDED_BY_TASK_MERGED'
        };
        await RequestStatusModel.create(status);
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: true,
            message: "Updated successfully",
        })
    }
});

//employee add or remove in task
exports.employeeAddOrRemove = catchAsync(async (req, res) => {
    if (req.body.reqId == '' && req.body.userId == '' && req.body.type == '') {
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: false,
            message: "Invalid Attributes",
        })
    }
    if (req.body.type == '1') {
        let chat = await ChatModel.findOne({ where: { reqId: req.body.reqId } });
        let user = await UserDetails.findOne({ where: { userId: req.body.userId } });
        let userId = chat.dataValues.userId;
        let newUser = {
            role: 'employee',
            userId: req.body.userId,
            userName: user.dataValues.firstName + ' ' + user.dataValues.lastName,
            pic:user.dataValues.image
        }
        userId.push(newUser);
        const responseBody = { userId };
        await ChatModel.update(responseBody, { where: { reqId: req.body.reqId } });

        const status = {
            reqId: req.body.reqId,
            createdBy: req.body.userId,
            reason: 'USER_ADDED',
            status: '5'
        }
        await RequestStatusModel.create(status);
        await RaiseRequest.update({ assigning: "Team" }, { where: { reqId: req.body.reqId } });
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: true,
            message: "User Added successfully",
        })
    } else {
        let chat = await ChatModel.findOne({ where: { reqId: req.body.reqId } });
        let userId = chat.dataValues.userId;
        const indexToRemove = userId.findIndex((u) => u.userId === req.body.userId  && u.role === "employee");
        if (indexToRemove === -1) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "User not found in chat",
            });
            return;
        }
        userId.splice(indexToRemove, 1);
        const responseBody = { userId };
        await ChatModel.update(responseBody, { where: { reqId:req.body.reqId } });

        const status = {
            reason: "REMOVED_USER",
            status: "5",
            createdBy: req.body.userId,
            reqId:req.body.reqId
        };
        await RequestStatusModel.create(status);

        res.status(HTTP_STATUS_ACCEPTED).json({
            status: true,
            message: "User removed successfully",
        });
    }
    
});







