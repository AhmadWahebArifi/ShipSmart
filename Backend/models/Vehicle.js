const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Vehicle = sequelize.define(
  "Vehicle",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vehicle_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    driver_name: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    capacity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    status: {
      type: DataTypes.ENUM("available", "not_available"),
      defaultValue: "available",
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "vehicles",
    timestamps: true,
    underscored: true,
  }
);

// Define associations
Vehicle.associate = (models) => {
  Vehicle.belongsTo(models.User, {
    foreignKey: "created_by",
    as: "creator",
  });
  Vehicle.hasMany(models.Shipment, {
    foreignKey: "vehicle_id",
    as: "shipments",
  });
};

module.exports = Vehicle;
