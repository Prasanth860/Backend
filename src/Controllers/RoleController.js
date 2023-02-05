const { RoleDetails } = require("../utilities/dbUtilitiess.js")
const { HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_ACCEPTED } = require('http2').constants;
const catchAsync = require('../utilities/CatchAsync.js');

// Get all user details
exports.getAll = catchAsync(async (req, res) => {
    try {
        let role = await RoleDetails.findAll();
        if (role) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Role data found",
                data: role
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
        const { roleId, roleName } = req.body;
        if (roleId && roleId != '' && roleId != 0) {
            const role = await RoleDetails.findOne({ where: { roleId: roleId } });
            if (role) {
                const responseBody = { roleName }
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
            const responseBody = { roleName }
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