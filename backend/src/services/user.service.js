import User from '../models/postgres/User.js'
import bcrypt from 'bcrypt'
import logsService from './logs.service.js'

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
    })
    if (!user) {
        const error = new Error('Usuario no encontrado en esta empresa')
        error.statusCode = 404
        throw error
    }
    return cleanUser(user)
}

export const createByAdmin = async ({ name, email, password, company_id, role, remote_allowed }, adminId) => {
    const exists = await User.findOne({ where: { email } })
    if (exists) {
        const error = new Error('El email ya está registrado')
        error.statusCode = 409
        throw error
    }

    const password_hash = await bcrypt.hash(password, 10)

    const user = await User.create({
        name,
        email,
        password_hash,
        company_id,
        role,
        remote_allowed,
        active: true
    })

    try {
        await logsService.createAdminLog({
            admin_id:    adminId,
            company_id:  company_id,
            action:      'create_user',
            target_type: 'user',
            target_id:   user.id,
            payload:     { name, email, role }
        })
    } catch (err) {
        console.error('Error log admin:', err.message)
    }

    return cleanUser(user)
}

export const update = async (id, companyId, updateData) => {
    const user = await User.findOne({
        where: { id, company_id: companyId }
    })
    if (!user) {
        const error = new Error('Usuario no encontrado')
        error.statusCode = 404
        throw error
    }

    // Campos que no se pueden cambiar desde este endpoint
    const { company_id, role, active, ...safeData } = updateData

    if (safeData.password) {
        safeData.password_hash = await bcrypt.hash(safeData.password, 10)
        delete safeData.password
    }

    await user.update(safeData)
    return cleanUser(user)
}

export const toggleStatus = async (id, companyId, activeStatus, adminId) => {
    const user = await User.findOne({
        where: { id, company_id: companyId }
    })
    if (!user) {
        const error = new Error('Usuario no encontrado')
        error.statusCode = 404
        throw error
    }

    await user.update({ active: activeStatus })

    try {
        await logsService.createAdminLog({
            admin_id:    adminId,
            company_id:  companyId,
            action:      activeStatus ? 'activate_user' : 'deactivate_user',
            target_type: 'user',
            target_id:   id
        })
    } catch (err) {
        console.error('Error log admin:', err.message)
    }

    return { id: user.id, name: user.name, active: activeStatus }
}