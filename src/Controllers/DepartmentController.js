const { DepartmentDetails } = require('../utilities/dbUtilitiess.js');
const { HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_ACCEPTED } = require('http2').constants;
const catchAsync = require('../utilities/CatchAsync.js');

// Get all user details
exports.getAll = catchAsync(async (req, res) => {
    try {
        let department = await DepartmentDetails.findAll();
        if (department) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Department data found",
                data: department
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
        const { departmentId, departmentName,colorCode,departmentCode } = req.body;
        if (departmentId && departmentId != '' && departmentId != 0) {
            const department = await DepartmentDetails.findOne({ where: { departmentId: departmentId } });
            if (department) {
                const responseBody = { departmentName,colorCode,departmentCode }
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
            const responseBody = { departmentName,colorCode,departmentCode }
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