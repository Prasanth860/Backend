const { UserDetails,AdminDetails,DepartmentDetails, LocationDetails, SublocationDetails,RoleDetails } = require('../utilities/dbUtilitiess.js');
const { sign, verify } = require('jsonwebtoken');
const { Op } = require('sequelize');

// const emailService = require('../services/EmailService');
const bcrypt = require('bcrypt');
const { HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_ACCEPTED } = require('http2').constants;
const catchAsync = require('../utilities/CatchAsync.js');
const moment = require('moment')
process.env.AWS_CONFIG_FILE = require('../config/aws');
process.env.AWS_SDK_LOAD_CONFIG = 1;
const aws = require('aws-sdk');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const fs = require('fs');
const time = Date.now();
const jwt = require('jsonwebtoken')

const createToken = (user) => {
    const expiresIn = 60 * 60 * 365
    const dataStoredInToken = {
        userId: user.userId,
        name: user.firstName + ' ' +user.lastName,
        mobile: user.mobile,
        role:user.roleId
    }
    return sign(dataStoredInToken, process.env.JWT_SECRET, { expiresIn })
}

// Register
exports.save = catchAsync(async (req, res, next) => {
    //try {
        const { userId, firstName, lastName, email, mobile, locationId, sublocationId, departmentId, roleId,code,password,image } = req.body
        if (userId && userId != '' && userId != 0) {
            const user = await UserDetails.findOne({ where: { userId: userId } });
            if (user) {
                const responseBody = { firstName, lastName, email, mobile, locationId, sublocationId, departmentId, status, roleId,image }
                await UserDetails.update(responseBody, { where: { userId: userId } })
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: true,
                    message: "User updated successfully"
                })
            } else {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "User not found to update"
                })
            }
        } else {
            const user = await UserDetails.findOne({ where: { mobile: mobile } });
            if (user) {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "User already exist"
                })
            } else {
                const hasPassword = bcrypt.hashSync(password, 10);
                const responseBody = {
                    firstName, lastName, email, mobile, locationId, sublocationId, departmentId, roleId,password: hasPassword,code
                }
                const user = await UserDetails.create(responseBody);
		 if (req.body.image) {
                    if(req.body.image.startsWith("data:image/png;base64,")){
                        var base64Data = req.body.image.replace(/^data:image\/png;base64,/, "");
                    }else if(req.body.image.startsWith("data:image/jpeg;base64,")){
                        var base64Data = req.body.image.replace(/^data:image\/jpeg;base64,/, "");
                    }else{
                        var base64Data = req.body.image.replace(/^data:image\/jpg;base64,/, "");
                    }
                    if (base64Data) {
                        require("fs").writeFile("resources/image" + user.userId, base64Data, 'base64', function (err) {
                        });
                    }
                }
                const bucketName = 'srilalithaapp';
                const key = 'resources/image' + user.userId;
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
                    let request = await UserDetails.findOne({ where: { user_Id: id } });
                    if (request) {
                        const responseBody = { image:signedUrl };
                        await UserDetails.update(responseBody, { where: {userId: id } });
                        res.status(HTTP_STATUS_ACCEPTED).json({
                            status: true,
                            message: "User created successfully"
                        })
                    }
                }
                getAndUseSignedUrl(user.userId);
                res.status(HTTP_STATUS_CREATED).json({
                    status: true,
                    message: "User created successfully"
                })
            }
        }
    //}
    /*catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }*/
})


// Get all user details
exports.getAll = catchAsync(async (req, res) => {
    try {
        let user = await UserDetails.findAll();
        if (user) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "User data found",
                data: user
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


// // Get By _id
exports.getById = catchAsync(async (req, res) => {
    try {
        let user = await UserDetails.findOne({ where: { userId: req.params.userId } });
        if (user) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "User found",
                data: user.dataValues
            })
        }
        else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "User not found",
                data: {}
            })
        }
    } catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
})



// // Login
exports.login = catchAsync(async (req, res) => {
     let user = [];
    user = await UserDetails.findOne({ where: { code: req.body.code } });
    if(!user){
         user = await AdminDetails.findOne({where: {code:req.body.code}})
    }
    //let user = await UserDetails.findOne({ where: { code: req.body.code } });
    if (user) {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const tokenData = createToken(user)
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Login success",
                token: tokenData,
                user: user.dataValues
            })
        } else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Incorrect password"
            })
        }
    } else {
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: false,
            message: "Email not found"
        })
    }
})

//Login with Mobile
exports.sentOtp = catchAsync(async (req,res) => {
    if(req.body.mobile == ''){
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: false,
            message: "Invalid Attributes"
        })
    }
    let user = await UserDetails.findOne({where:{mobile:req.body.mobile}});
    if(user){
	const min = 1000;
        const max = 9999;
        const otp = Math.floor(Math.random() * (max - min + 1) + min);
       // var otp = req.body.mobile.substr(-4,10);
        if(otp){
            const responseBody = { otp }
                await UserDetails.update(responseBody, { where: { mobile: req.body.mobile } })
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: true,
		    data:responseBody,
                    message: "OTP Sent Successfullly"
                })
        }else{
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "OTP Sent Failed"
            })
        }  
    }
    else if(!user){
        let user = await AdminDetails.findOne({where:{mobile:req.body.mobile}});
        if(user){
            const min = 1000;
            const max = 9999;
            const otp = Math.floor(Math.random() * (max - min + 1) + min);
           
            if(otp){
                const responseBody = { otp }
                    await AdminDetails.update(responseBody, { where: { mobile: req.body.mobile } })
                    res.status(HTTP_STATUS_ACCEPTED).json({
                        status: true,
                        data:responseBody,
                        message: "OTP Sent Successfullly"
                    })
            }else{
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "OTP Sent Failed"
                })
            }  
        }
    }
    else{
        res.status(HTTP_STATUS_ACCEPTED).json({
            status : false,
            message :  "Mobile Not Found"
        })
    }
})

//Validate Otp 
exports.validateOtp = catchAsync(async (req,res) => {
    if(req.body.mobile == '' || req.body.otp ==  ''){
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: false,
            message: "Invalid Attributes"
        })
    }
    let user = [];
    user = await UserDetails.findOne({where:{mobile:req.body.mobile}});
    if(!user){
        user = await AdminDetails.findOne({where:{mobile:req.body.mobile}});
    }
    //let user = await UserDetails.findOne({where:{mobile:req.body.mobile}});
    if(user){
        if(user.dataValues.otp == req.body.otp){
                const tokenData = createToken(user)
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: true,
                    message: "Login success",
                    token: tokenData,
                    user: user.dataValues
                })
        }else{
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "OTP Validation Failed"
            })
        }  
    }else{
        res.status(HTTP_STATUS_ACCEPTED).json({
            status : false,
            message :  "Mobile Not Found"
        })
    }
})


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

exports.createAdmin = catchAsync(async (req, res, next) => {
    try {
        const { userId, firstName, lastName, email, mobile, locationId, sublocationId, departmentId, roleId,code,password } = req.body
        if (userId && userId != '' && userId != 0) {
            const user = await AdminDetails.findOne({ where: { userId: userId } });
            if (user) {
                const responseBody = { firstName, lastName, email, mobile, locationId, sublocationId, departmentId, status, roleId }
                await AdminDetails.update(responseBody, { where: { userId: userId } })
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: true,
                    message: "User updated successfully"
                })
            } else {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "User not found to update"
                })
            }
        } else {
            const user = await AdminDetails.findOne({ where: { mobile: mobile } });
            if (user) {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "User already exist"
                })
            } else {
		const hasPassword = bcrypt.hashSync(password, 10);
		 const responseBody = {
                    firstName, lastName, email, mobile, locationId, sublocationId, departmentId, roleId,password: hasPassword,code
                }
                await AdminDetails.create(responseBody);

                res.status(HTTP_STATUS_CREATED).json({
                    status: true,
                    message: "User created successfully"
                })
            }
        }
    }
    catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
})

//Get All Admins Details 
exports.getAllAdmins = catchAsync(async (req, res) => {
    try {
        let user = await AdminDetails.findAll();
        if (user) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "User data found",
                data: user
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


//Get All Employees By Admin
exports.getAllEmployees = catchAsync(async (req, res) => {
   // try {
        const responseArray = [];
        let loginUser = req.user;
        req.body.userId = loginUser.userId;
        req.body.roleId = loginUser.roleId;
        if(req.body.userId && req.body.roleId == '9'){
            let user = await AdminDetails.findOne({where:{userId:req.body.userId}})
            if(user){
                let employees = await UserDetails.findAll({where:{departmentId: {[Op.in]: user.departmentId}}});
                for(const request of employees){
                    let dept = await DepartmentDetails.findOne({where:{departmentId:request.departmentId}});
                    let location = await LocationDetails.findOne({where:{locationId:request.locationId}})
                    let subLocation = await SublocationDetails.findOne({where:{sublocationId:request.sublocationId}});
		    let role = await RoleDetails.findOne({where:{roleId:request.roleId}})
                    const responseBody = {
                        name:request.firstName+''+request.lastName,
                        mobile:request.mobile,
                        department:dept.departmentName,
                        empCode : request.code,
                        location:location.locationName,
                        subLocation:subLocation.sublocationName,
			role:role.roleName,
			userId:request.userId
                    }
                    responseArray.push(responseBody);
                }
		res.status(HTTP_STATUS_ACCEPTED).json({
                    status: true,
                    message: "Data found",
                    data:responseArray
                })
            }else{
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "User Not found",
		    data:responseArray
                })
            }
        }
    /*} catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }*/
})
