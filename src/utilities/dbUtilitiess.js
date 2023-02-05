const Sequelize = require("sequelize");
const Role_Model = require("../Models/RoleModel")
const Department_model = require("../Models/DepartmentModel")
const Location_model = require("../Models/LocationModel")
const Sublocation_model = require("../Models/SublocationModel")
const User_model = require("../Models/UserModel")
const Raise_Request = require("../Models/RaiseRequest")

try {
  var sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      logging: console.log,
      maxConcurrentQueries: 100,
      dialect: "mysql",
      pool: { maxConnections: 25, maxIdleTime: 30, minConnections: 0 },
      language: "en",
    }
  );

  var RoleDetails = Role_Model(sequelize);
  var DepartmentDetails = Department_model(sequelize);
  var LocationDetails = Location_model(sequelize);
  var SublocationDetails = Sublocation_model(sequelize);
  var UserDetails = User_model(sequelize);
  var RaiseRequest = Raise_Request(sequelize);

  var db = { sequelize, Sequelize }
  sequelize.sync().then(() => {
    console.log("db and tables have been created");
  });
} catch (err) {
  console.log("err", err)
}

module.exports = {
  db,
  RoleDetails,
  DepartmentDetails,
  LocationDetails,
  SublocationDetails,
  UserDetails,
  RaiseRequest
};