const {DataTypes} = require('sequelize');
      
      module.exports = sequelize => {
        const attributes = {
          statusId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            comment: null,
            field: "status_Id"
          },
          reqId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "req_Id"
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "created_date"
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "updated_date"
          },
	  status: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "status"
          },
          assignedUser: {
            type: DataTypes.STRING,
            allowNull: true,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "assigned_User"
          },
	  createdBy: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "created_By"
          },
          reason: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "reason"
          }
        };
      

        const options = {
          tableName: "request_status",
          comment: "",
          indexes: []
        };
        const RequestStatus_Model = sequelize.define("RequestStatus_Model", attributes, options);
        return RequestStatus_Model;
      };
