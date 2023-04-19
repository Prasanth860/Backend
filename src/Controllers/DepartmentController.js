const { DepartmentDetails,AdminDetails } = require('../utilities/dbUtilitiess.js');
const { HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_ACCEPTED } = require('http2').constants;
const catchAsync = require('../utilities/CatchAsync.js');
const { log } = require('util');

// Get all user details
exports.getAll = catchAsync(async (req, res) => {
    try {
        let department = await DepartmentDetails.findAll();
	const responseArray = [];
        if (department) {
	    for(const request of department){
	//	let user = await AdminDetails.findOne({where:{userId:request.createdBy}});
	//	let updatedUser = await AdminDetails.findOne({where:{userId:request.updatedBy}});
                const responseBody = {
                    departmentId:request.departmentId,
                    departmentCode:request.departmentCode,
                    departmentName:request.departmentName,
                    colorCode:request.colorCode,
                    createdAt:request.createdAt,
                    updatedAt:request.updatedAt,
		     createdBy:request.createdBy,
                    updatedBy:request.updatedBy,
                    createdAt:request.createdAt,
                    updatedAt:request.updatedAt
		  //  createdUser:user.firstName+' '+user.lastName,
		    //updatedUser:updatedUser.firstName+' '+updatedUser.lastName,
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
                message: "Department data found",
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
        let department = await DepartmentDetails.findOne({ where: { departmentId: req.params.departmentId } });
        if (department) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Department found",
                data: department.dataValues
            })
        }
        else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Department not found",
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
        const { departmentId, departmentName,colorCode,departmentCode} = req.body;
	if(req.body.departmentName == '' || req.body.colorCode == '' || req.body.departmentCode == ''){
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Invalid Attributes"
            })
        }
        let loginUser = req.user;
        if (departmentId && departmentId != '' && departmentId != 0) {
            const department = await DepartmentDetails.findOne({ where: { departmentId: departmentId } });
            if (department) {
                const responseBody = { departmentName,colorCode,departmentCode,updatedBy:loginUser.userId }
                await DepartmentDetails.update(responseBody, { where: { departmentId: departmentId } })
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: true,
                    message: "Department updated successfully"
                })
            } else {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "Department not found to update"
                })
            }
        } else {
            const responseBody = { departmentName,colorCode,departmentCode,createdBy:loginUser.userId,updatedBy:loginUser.userId }
            await DepartmentDetails.create(responseBody);
            res.status(HTTP_STATUS_CREATED).json({
                status: true,
                message: "Department created successfully"
            })
        }
    } catch {
        return res.status(500).send({ sucess: false, message: err.message })
    }
})
