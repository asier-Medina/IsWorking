import Company from '../models/postgres/Company.js'
import logsService from './logs.service.js'

export const getAllCompanies = async () => {
    return await Company.findAll({
        order: [['created_at', 'DESC']]
    })
}

export const getCompanyById = async (id) => {
    const company = await Company.findByPk(id)
    if (!company) {
        const error = new Error('Empresa no encontrada')
        error.statusCode = 404
        throw error
    }
    return company
}

export const createCompany = async (data, adminId) => {
    const { name, timezone, office_latitude, office_longitude, office_radius_m, active } = data

    if (!name) {
        const error = new Error('El nombre de la empresa es obligatorio')
        error.statusCode = 400
        throw error
    }

    const newCompany = await Company.create({
        name,
        timezone,
        office_latitude,
        office_longitude,
        office_radius_m,
        active
    })

    try {
        await logsService.createAdminLog({
            admin_id:    adminId,
            action:      'create_company',
            target_type: 'company',
            target_id:   newCompany.id,
            payload:     { name }
        })
    } catch (err) {
        console.error('Error log admin:', err.message)
    }

    return newCompany
}

export const updateCompany = async (id, data) => {
    const company = await getCompanyById(id)
    const updatedCompany = await company.update(data)
    return updatedCompany
}

export const deactivateCompany = async (id, adminId) => {
    const company = await getCompanyById(id)
    await company.update({ active: false })

    try {
        await logsService.createAdminLog({
            admin_id:    adminId,
            action:      'deactivate_company',
            target_type: 'company',
            target_id:   id
        })
    } catch (err) {
        console.error('Error log admin:', err.message)
    }

    return company
}

export const activateCompany = async (id, adminId) => {
    const company = await getCompanyById(id)
    await company.update({ active: true })

    try {
        await logsService.createAdminLog({
            admin_id:    adminId,
            action:      'activate_company',
            target_type: 'company',
            target_id:   id
        })
    } catch (err) {
        console.error('Error log admin:', err.message)
    }

    return company
}

export const deleteCompany = async (id, role, adminId) => {
    if (role !== 'superadmin') {
        const error = new Error('Solo el superadmin puede eliminar empresas')
        error.statusCode = 403
        throw error
    }

    const company = await getCompanyById(id)
    await company.destroy()

    try {
        await logsService.createAdminLog({
            admin_id:    adminId,
            action:      'delete_company',
            target_type: 'company',
            target_id:   id
        })
    } catch (err) {
        console.error('Error log admin:', err.message)
    }

    return { message: 'Empresa eliminada correctamente' }
}