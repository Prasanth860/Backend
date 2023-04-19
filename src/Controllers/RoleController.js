const { RoleDetails,AdminDetails } = require("../utilities/dbUtilitiess.js")
const { HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_ACCEPTED } = require('http2').constants;
const catchAsync = require('../utilities/CatchAsync.js');

// Get all user details
exports.getAll = catchAsync(async (req, res) => {
    try {
        let role = await RoleDetails.findAll();
	           const responseArray = [];

        if (role) {
	    for(const request of role){
		/*if(request.createdBy){
                	let user = await AdminDetails.findOne({where:{userId:request.createdBy}});
			responseBody.createdUser = user.firstName+' '+user.lastName;
		}
		if(request.updatedBy){
                	let updatedUser = await AdminDetails.findOne({where:{userId:request.updatedBy}});
			responseBody.updatedUser = updatedUser.firstName+' '+updatedUser.lastName;
		}*/
                responseBody = {
                    roleId:request.roleId,
                    roleName:request.roleName,
                    createdAt:request.createdAt,
                    updatedAt:request.updatedAt,
                    createdBy:request.createdBy,
                    updatedBy:request.updatedBy,
                   // createdUser:user.firstName+' '+user.lastName,
                   // updatedUser:updatedUser.firstName+' '+updatedUser.lastName
                }
		if(request.createdBy){ 
                        let user = await AdminDetails.findOne({where:{userId:request.createdBy}});
                        responseBody.createdUser = user.firstName+' '+user.lastName;
                }
                if(request.updatedBy){ 
                        let updatedUser = await AdminDetails.findOne({where:{userId:request.updatedBy}});
                        responseBody.updatedUser = updatedUser.firstName+' '+updatedUser.lastName;
                }
                responseArray.push(responseBody);
            }
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Role data found",
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


// // Get By _id
exports.getById = catchAsync(async (req, res) => {
    try {
        let role = await RoleDetails.findOne({ where: { roleId: req.params.roleId } });
        if (role) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Role found",
                data: role.dataValues
            })
        }
        else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Role not found",
                data: {}
            })
        }
    } catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
})

//save
exports.save = catchAsync(async (req, res) => {
    try {
        let loginUser = req.user;
        const { roleId, roleName } = req.body;
        const {createdBy , updatedBy} = loginUser.userId;
	if(req.body.roleName == ''){
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Invalid Attributes"
            })
        }
        const roleDetails = await RoleDetails.findOne({ where: { role_Name : roleName } });
	if(roleDetails){
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "Role Name is Already existed"
                })
        }
        if (roleId && roleId != '' && roleId != 0) {
            const role = await RoleDetails.findOne({ where: { roleId: roleId } });
            if (role) {
                const responseBody = { roleName,updatedBy }
                await RoleDetails.update(responseBody, { where: { roleId: roleId } })
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: true,
                    message: "Role updated successfully"
                })
            } else {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "Role not found to update"
                })
            }
        } else {
            const responseBody = { roleName,createdBy,updatedBy }
            await RoleDetails.create(responseBody);
            res.status(HTTP_STATUS_CREATED).json({
                status: true,
                message: "Role created successfully"
            })
        }
    } catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
})
