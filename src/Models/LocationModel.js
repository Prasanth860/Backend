const {DataTypes} = require('sequelize');
      
      module.exports = sequelize => {
        const attributes = {
          locationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            comment: null,
            field: "location_Id"
          },
          locationCode: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "location_Code"
          },
          locationName: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "location_Name"
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
          tableName: "Location",
          comment: "",
          indexes: []
        };
        const LocationModel = sequelize.define("Location_model", attributes, options);
        return LocationModel;
      };