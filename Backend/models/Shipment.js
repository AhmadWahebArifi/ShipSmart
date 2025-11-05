const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Shipment = sequelize.define('Shipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tracking_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  from_province: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  to_province: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'delivered'),
    defaultValue: 'pending',
    allowNull: false
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  shipped_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'shipments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Generate unique tracking number
Shipment.beforeCreate(async (shipment) => {
  if (!shipment.tracking_number) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    shipment.tracking_number = `SS${timestamp}${random}`;
  }
});

module.exports = Shipment;


