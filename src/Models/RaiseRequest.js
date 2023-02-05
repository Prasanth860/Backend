const {DataTypes, EmptyResultError} = require('sequelize');
      
      module.exports = sequelize => {
        const attributes = {
          reqId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            comment: null,
            field: "reqId"
          },
          notes: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "notes"
          },
          departmentId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "department_Id"
          },
          locationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "location_Id"
          },
          sublocationId: {
            type: DataTypes.STRING,
            allowNull: true,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "sublocation_Id"
          },
          dueDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "due_date"
          },
          image: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "image"
          },
          status: {
            type: DataTypes.STRING,
            allowNull: true,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "status",
            defaultValue:"Active"
          },
          isVerified: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "isVerified"
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
          userId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "user_Id"
          },
          roleId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "role_Id"
          },
        };
        const options = {
          tableName: "raise_request",
          comment: "",
          indexes: []
        };
        const RequestModel = sequelize.define("Raise_Request", attributes, options);
        return RequestModel;
      };