import * as companyService from '../services/company.service.js';

//GET /api/companies
export const getAllCompaniesHandler = async (req, res) => {
  try {
    const companies = await companyService.getAllCompanies();
    res.json({
        count: companies.length,
        companies
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
    }

//GET /api/companies/:id
export const getCompanyByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await companyService.getCompanyById(id);

   res.json({ company })
}catch (error) {
    res.status(404).json({ error: 'Company not found' });
  }
}
//POST /api/companies
export const createCompanyHandler = async (req, res) => {
  try {
    const company= await companyService.createCompany(req.body);

    res.status(201).json({ 
        message: 'Company created successfully',
        company
    })
  } catch (error) {
    res.status(400).json({ error: 'Failed to create company' });
  }
}

//PATCH /api/companies/:id
export const updateCompanyHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCompany = await companyService.updateCompany(id, req.body);

    res.json({
        message: 'Company updated successfully',
        company: updatedCompany
    })
  } catch (error) {
    res.status(404).json({ error: 'Failed to update company' });
  }}
//PATCH /api/companies/:id/activate
export const activateCompanyHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const activatedCompany = await companyService.activateCompany(id);

    res.json({
        message: 'Company activated successfully',
        company: activatedCompany
    })
  } catch (error) {
    res.status(404).json({ error: 'Failed to activate company' });
  }
}

//PATCH /api/companies/:id/deactivate
export const deactivateCompanyHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deactivatedCompany = await companyService.deactivateCompany(id);

    res.json({
        message: 'Company deactivated successfully',
        company: deactivatedCompany
    })
  } catch (error) {
    res.status(404).json({ error: 'Failed to deactivate company' });
  }
}

//DELETE /api/companies/:id
export const deleteCompanyHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await companyService.deleteCompany(id)

    res.json(result)
    } catch (error) {
    res.status(404).json({ error: 'Failed to delete company' });
  }
}