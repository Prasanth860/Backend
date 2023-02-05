const { LocationDetails } = require('../utilities/dbUtilitiess.js');
const { HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_ACCEPTED } = require('http2').constants;
const catchAsync = require('../utilities/CatchAsync.js');

// Get all user details
exports.getAll = catchAsync(async (req, res) => {
    try {
        let location = await LocationDetails.findAll();
        if (location) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Location data found",
                data: location
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
        let location = await LocationDetails.findOne({ where: { locationId: req.params.locationId } });
        if (location) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Location found",
                data: location.dataValues
            })
        }
        else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Location not found",
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
        const { locationId, locationName,locationCode } = req.body;
        if (locationId && locationId != '' && locationId != 0) {
            const location = await LocationDetails.findOne({ where: { locationId: locationId } });
            if (location) {
                const responseBody = { locationName,locationCode }
                await LocationDetails.update(responseBody, { where: { locationId: locationId } })
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: true,
                    message: "Location updated successfully"
                })
            } else {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "Location not found to update"
                })
            }
        } else {
            const responseBody = { locationName,locationCode }
            await LocationDetails.create(responseBody);
            res.status(HTTP_STATUS_CREATED).json({
                status: true,
                message: "Location created successfully"
            })
        }
    } catch {
        return res.status(500).send({ sucess: false, message: err.message })
    }
})