const {DataTypes} = require('sequelize');
      
      module.exports = sequelize => {
        const attributes = {
          departmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            comment: null,
            field: "department_Id"
          },
          departmentCode: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "department_Code"
          },
          departmentName: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "department_Name"
          },
          colorCode: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "color_Code"
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
          tableName: "Department",
          comment: "",
          indexes: []
        };
        const DepartmentModel = sequelize.define("Department_model", attributes, options);
        return DepartmentModel;
      };