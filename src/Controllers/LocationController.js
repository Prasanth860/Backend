const { LocationDetails,AdminDetails } = require('../utilities/dbUtilitiess.js');
const { HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_ACCEPTED } = require('http2').constants;
const catchAsync = require('../utilities/CatchAsync.js');

// Get all user details
exports.getAll = catchAsync(async (req, res) => {
    try {
        let location = await LocationDetails.findAll();
	const responseArray = [];
        if (location) {
	    for(const request of location){
                responseBody = {
                    locationId:request.locationId,
                    locationCode:request.locationCode,
                    locationName:request.locationName,
                    createdAt:request.createdAt,
                    updatedAt:request.updatedAt,
		            createdBy:request.createdBy,
                    updatedBy:request.updatedBy,
                    createdAt:request.createdAt,
                    updatedAt:request.updatedAt
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
                message: "Location data found",
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
        let loginUser = req.user;
        const {createdBy , updatedBy} = loginUser.userId;
        if (locationId && locationId != '' && locationId != 0) {
            const location = await LocationDetails.findOne({ where: { locationId: locationId } });
            if (location) {
                const responseBody = { locationName,locationCode,updatedBy}
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
            const responseBody = { locationName,locationCode,createdBy,updatedBy }
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
