const { SublocationDetails,AdminDetails,LocationDetails } = require('../utilities/dbUtilitiess.js');
const { HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_ACCEPTED } = require('http2').constants;
const catchAsync = require('../utilities/CatchAsync.js');

// Get all user details
exports.getAll = catchAsync(async (req, res) => {
    try {
        let subLocation = await SublocationDetails.findAll();
	 const responseArray = [];
        if (subLocation) {
	   for(const request of subLocation){
                let user = await AdminDetails.findOne({where:{userId:request.createdBy}});
                let updatedUser = await AdminDetails.findOne({where:{userId:request.updatedBy}});
                let location = await LocationDetails.findOne({where:{locationId:request.locationId}});
                const responseBody = {
                    sublocationId: request.sublocationId,
                    sublocationCode:request.sublocationCode,
                    sublocationName:request.sublocationName,
                    locationId:request.locationId,
                    locationName:location.locationName,
                    createdAt : request.createdAt,
                    updatedAt: request.updatedAt,
                    createdBy:request.createdBy,
                    updatedBy:request.updatedBy,
                    createdUser:user.firstName+' '+user.lastName,
                    updatedUser:updatedUser.firstName+' '+updatedUser.lastName
                }
                responseArray.push(responseBody);
            }
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Sub location data found",
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
        let subLocation = await SublocationDetails.findOne({ where: { sublocationId: req.params.sublocationId } });
        if (subLocation) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Sub location found",
                data: subLocation.dataValues
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
        const { sublocationId, locationId,sublocationName,sublocationCode,createdBy,updatedBy } = req.body;
        if (sublocationId && sublocationId != '' && sublocationId != 0) {
            const subLocation = await SublocationDetails.findOne({ where: { sublocationId: sublocationId } });
            if (subLocation) {
                const responseBody = {locationId, sublocationName,sublocationCode,createdBy,updatedBy }
                await SublocationDetails.update(responseBody, { where: { sublocationId: sublocationId } })
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: true,
                    message: "Sub location updated successfully"
                })
            } else {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "Sub location not found to update"
                })
            }
        } else {
            const responseBody = { locationId,sublocationName,sublocationCode,createdBy,updatedBy }
            await SublocationDetails.create(responseBody);
            res.status(HTTP_STATUS_CREATED).json({
                status: true,
                message: "Sub location created successfully"
            })
        }
    } catch {
        return res.status(500).send({ sucess: false, message: err.message })
    }
})
