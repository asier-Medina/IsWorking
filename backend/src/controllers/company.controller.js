import * as companyService from '../services/company.service.js'

// GET /api/companies
export const getAllCompaniesHandler = async (req, res, next) => {
  try {
    const companies = await companyService.getAllCompanies()
    res.json({ count: companies.length, companies })
  } catch (error) {
    next(error)
  }
}

// GET /api/companies/:id
export const getCompanyByIdHandler = async (req, res, next) => {
  try {
    const company = await companyService.getCompanyById(req.params.id)
    res.json({ company })
  } catch (error) {
    next(error)
  }
}

// POST /api/companies
export const createCompanyHandler = async (req, res, next) => {
  try {
    const company = await companyService.createCompany(req.body, req.user.id)
    res.status(201).json({ message: 'Empresa creada correctamente', company })
  } catch (error) {
    next(error)
  }
}

// PATCH /api/companies/:id
export const updateCompanyHandler = async (req, res, next) => {
  try {
    const company = await companyService.updateCompany(req.params.id, req.body)
    res.json({ message: 'Empresa actualizada correctamente', company })
  } catch (error) {
    next(error)
  }
}

// PATCH /api/companies/:id/activate
export const activateCompanyHandler = async (req, res, next) => {
  try {
    const company = await companyService.activateCompany(req.params.id, req.user.id)
    res.json({ message: 'Empresa activada correctamente', company })
  } catch (error) {
    next(error)
  }
}

// PATCH /api/companies/:id/deactivate
export const deactivateCompanyHandler = async (req, res, next) => {
  try {
    const company = await companyService.deactivateCompany(req.params.id, req.user.id)
    res.json({ message: 'Empresa desactivada correctamente', company })
  } catch (error) {
    next(error)
  }
}

// DELETE /api/companies/:id
export const deleteCompanyHandler = async (req, res, next) => {
  try {
    const result = await companyService.deleteCompany(
      req.params.id,
      req.user.role,
      req.user.id
    )
    res.json(result)
  } catch (error) {
    next(error)
  }
}