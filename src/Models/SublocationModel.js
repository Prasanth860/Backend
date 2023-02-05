const {DataTypes} = require('sequelize');
      
      module.exports = sequelize => {
        const attributes = {
          sublocationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            comment: null,
            field: "sublocation_Id"
          },
          locationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "location_Id"
          },
          sublocationCode: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "sublocation_Code"
          },
          sublocationName: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "sublocation_Name"
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
          }
        };
        const options = {
          tableName: "Sublocation",
          comment: "",
          indexes: []
        };
        const SublocationModel = sequelize.define("Sublocation_model", attributes, options);
        return SublocationModel;
      };