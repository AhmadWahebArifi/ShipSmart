// models/Product.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0,
      },
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    shipment_tracking_number: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "shipments",
        key: "tracking_number",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    // Add sender and receiver fields
    sender: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    sender_phone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    sender_email: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    sender_address: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    // Add detailed receiver fields
    receiver_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    receiver_phone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    receiver_email: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
      // Removed email validation to make it optional
    },
    receiver_address: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    // Add discount and remaining amount fields
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
      validate: {
        min: 0,
      },
    },
    remaining: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "products",
    timestamps: true,
    underscored: true,
  }
);

// Define associations
Product.associate = (models) => {
  Product.belongsTo(models.Shipment, {
    foreignKey: "shipment_tracking_number",
    targetKey: "tracking_number",
    as: "shipment",
  });

  Product.belongsTo(models.User, {
    foreignKey: "created_by",
    as: "creator",
  });
};

module.exports = Product;
