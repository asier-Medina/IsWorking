import Company from '../models/postgres/Company.js';

//Obtener todas las empresas
export const getAllCompanies = async () => {
    const companies = await Company.findAll({
        order: [['created_at', 'DESC']]
    });
    return companies;
}

//Obtener una empresa por su ID
export const getCompanyById = async (id) => {
    const company = await Company.findByPk(id);
    if (!company) {
        throw new Error('Company not found');
    }
    return company;
}

//Crear una nueva empresa
export const createCompany = async (data) => {
    const{
    name,
    timezone,
    office_latitude,
    office_longitude,
    office_radius_m,
    active
    } = data
    if (!name) {
        throw new Error('El nombre de la empresa es obligatorio')
    }
    const newCompany = await Company.create({
        name,
        timezone,
        office_latitude,
        office_longitude,
        office_radius_m,
        active
    });
    return newCompany;
}
//Actualizar una empresa existente
export const updateCompany = async (id, data) => {
    const company = await getCompanyById(id)
    const updatedCompany = await company.update(data)
    return updatedCompany;
}

// Desactivar una empresa (soft delete)
export const deactivateCompany = async (id) => {
    const company = await getCompanyById(id)
    await company.update({ active: false })
    return company;
}

//Activar una empresa
export const activateCompany = async (id) => {
    const company = await getCompanyById(id)
    await company.update({ active: true })
    return company;
}
//Eliminar una empresa (hard delete)
export const deleteCompany = async (id) => {
    const company = await getCompanyById(id)
    await company.destroy()
    return { message: 'Empresa eliminada correctamente' };
}
