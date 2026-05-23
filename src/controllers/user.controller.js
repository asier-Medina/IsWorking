import * as UserService from '../services/user.service.js'

// GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const { company_id } = req.user
    const users = await UserService.getAllByCompany(company_id)
    res.json({ success: true, data: users })
  } catch (error) {
    next(error)
  }
}

// GET /api/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const { company_id } = req.user
    const user = await UserService.getById(req.params.id, company_id)
    res.json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

// POST /api/users
export const createEmployee = async (req, res, next) => {
  try {
    const { company_id, id: adminId } = req.user
    const { name, email, password, role, remote_allowed } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'name, email y password son obligatorios'
      })
    }

    const user = await UserService.createByAdmin(
      { name, email, password, company_id, role: role || 'employee', remote_allowed },
      adminId
    )
    res.status(201).json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

// PATCH /api/users/:id
export const updateEmployee = async (req, res, next) => {
  try {
    const { company_id } = req.user
    const user = await UserService.update(req.params.id, company_id, req.body)
    res.json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
}

// PATCH /api/users/:id/status
export const toggleEmployeeStatus = async (req, res, next) => {
  try {
    const { company_id, id: adminId } = req.user
    const { active } = req.body

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo active debe ser true o false'
      })
    }

    const result = await UserService.toggleStatus(
      req.params.id, company_id, active, adminId
    )
    res.json({
      success: true,
      message: `Empleado ${active ? 'activado' : 'desactivado'} correctamente`,
      data: result
    })
  } catch (error) {
    next(error)
  }
}