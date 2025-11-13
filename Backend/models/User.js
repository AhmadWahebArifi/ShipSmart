const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      // Remove unique constraint to avoid key limit issue
      // unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      // Remove unique constraint to avoid key limit issue
      // unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
      set(value) {
        // Normalize email to lowercase
        this.setDataValue("email", value ? value.trim().toLowerCase() : value);
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255],
      },
    },
    role: {
      type: DataTypes.ENUM("admin", "superadmin", "user", "driver", "client"),
      defaultValue: "user",
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    profile_pic: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      defaultValue: null,
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
    branch: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    // Disable automatic index creation to avoid key limit
    indexes: [
      // We'll manage indexes manually to stay within MySQL's 64-key limit
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          user.password = hashedPassword;
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          user.password = hashedPassword;
        }
      },
    },
  }
);

// Instance method to check password
User.prototype.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Instance method to return safe user data (without password)
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
