const {DataTypes} = require('sequelize');
      
      module.exports = sequelize => {
        const attributes = {
          userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            comment: null,
            field: "user_Id"
          },
          firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "firstName"
          },
          lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "lastname"
          },
          email: {
            type: DataTypes.STRING,
            allowNull: true,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "email"
          },
          mobile: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "mobile"
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
          departmentId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "department_Id"
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
          roleId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "role_Id"
          },
          password: {
            type: DataTypes.STRING,
            allowNull: true,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "password"
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
          otp:{
            type: DataTypes.STRING,
            allowNull: true,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "otp"
          },
          code:{
            type: DataTypes.STRING,
            allowNull: true,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "code"
          }
        };
        const options = {
          tableName: "User",
          comment: "",
          indexes: []
        };
        const UserModel = sequelize.define("User_model", attributes, options);
        return UserModel;
      };