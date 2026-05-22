import User from '../models/postgres/User.js';
import bcrypt from 'bcrypt';

const cleanUser = (user) => {
    if (!user) return null
    const userJson = user.toJSON ? user.toJSON() : { ...user }
    delete userJson.password_hash
    return userJson
}

export const getAllByCompany = async (companyId, filters = {}) => {
    const users = await User.findAll({
        where: {
            company_id: companyId,
            ...filters
        },
        order: [['created_at', 'DESC']]
    })
    return users.map(user => cleanUser(user))
}


export const getById = async (id, companyId) => {
    const user = await User.findOne({
        where: { id, company_id: companyId }
    });

    if (!user) throw new Error('Usuario no encontrado en esta empresa');
    return cleanUser(user);
}

export const createByAdmin = async ({ name, email, password, company_id, role, remote_allowed }) => {
    const exists = await User.findOne({ where: { email } });
    if (exists) throw new Error('El email ya esta registrado');

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password_hash,
        company_id,
        role,
        remote_allowed,
        active: true
    });
    return cleanUser(user);
}

export const update = async (id, companyId, updateData) => {
    const user = await User.findOne({
        where: { id, company_id: companyId }
    });

    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    if (updateData.password) {
        updateData.password_hash = await bcrypt.hash(updateData.password, 10);
        delete updateData.password
    }

    await user.update(updateData);

    return cleanUser(user)

}

export const toggleStatus = async (id, companyId, activeStatus) => {
    const user = await User.findOne({
        where: { id, company_id: companyId }
    });

    if (!user) {
        throw new Error('Usuario no encontrado');
    }

    await user.update({ active: activeStatus });
    return { id: user.id, name: user.name, active: user.active }
}