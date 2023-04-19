const {DataTypes, EmptyResultError} = require('sequelize');
    
      module.exports = sequelize => {
        const attributes = {
          chatId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            comment: null,
            field: "chat_Id"
          },
          reqId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "req_Id"
          },
          userId: {
            type: DataTypes.JSON,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "user_Id"
          },
          messages: {
            type: DataTypes.JSON,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "messages"
          },
          createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            primaryKey: false,
            autoIncrement: false,
            comment: null,
            field: "created_At"
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
        };
        const options = {
          tableName: "chat",
          comment: "",
          indexes: []
        };
        const ChatModel = sequelize.define("Chat_Model", attributes, options);
        return ChatModel;
      };
