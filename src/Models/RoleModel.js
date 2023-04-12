const {DataTypes} = require('sequelize');
      
      module.exports = sequelize => {
        const attributes = {
          roleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            comment: null,
            field: "role_Id"
          },
          roleName: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "role_Name"
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
	  createdBy: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "created_by"
          },
	  updatedBy: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "updated_by"
          }
        };
        const options = {
          tableName: "Role",
          comment: "",
          indexes: []
        };
        const RoleModel = sequelize.define("Role_model", attributes, options);
        return RoleModel;
      };
