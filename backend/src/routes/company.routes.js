import { Router } from 'express'
import {
  getAllCompaniesHandler,
  getCompanyByIdHandler,
  createCompanyHandler,
  updateCompanyHandler,
  deactivateCompanyHandler,
  activateCompanyHandler,
  deleteCompanyHandler
} from '../controllers/company.controller.js'

import { protect, isAdmin } from '../middlewares/auth.js'

const router = Router()

// Todas estas rutas requieren usuario autenticado
router.use(protect)

// Ver empresas
router.get('/', isAdmin, getAllCompaniesHandler)
router.get('/:id', isAdmin, getCompanyByIdHandler)

// Crear, editar, activar, desactivar y eliminar empresas
router.post('/', isAdmin, createCompanyHandler)
router.patch('/:id', isAdmin, updateCompanyHandler)
router.patch('/:id/deactivate', isAdmin, deactivateCompanyHandler)
router.patch('/:id/activate', isAdmin, activateCompanyHandler)
router.delete('/:id', isAdmin, deleteCompanyHandler)

export default router