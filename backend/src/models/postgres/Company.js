import { DataTypes } from "sequelize";
import sequelize from "../../config/postgres.js";

const Company = sequelize.define('Company', {
    id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:        { type: DataTypes.STRING(100), allowNull: false },
    timezone:    { type: DataTypes.STRING(50), defaultValue: 'Europe/Madrid' },
    office_latitude:  { type: DataTypes.DECIMAL(9,6) },
    office_longitude: { type: DataTypes.DECIMAL(9,6) },
    office_radius_m:  { type: DataTypes.INTEGER, defaultValue: 200 },
    active:       { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at:   { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'companies',
    timestamps: false
});

export default Company;
