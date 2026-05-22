import * as UserService from '../services/user.service.js'

export const getUsers = async (req, res) => {
    try {
        const { company_id } = req.user

        const users = await UserService.getAllByCompany(company_id);

        return res.status(200).json({ success: true, data: users })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}


export const createEmploye = async (req, res) => {
    try {
        const { company_id } = req.user
        const { name, email, password, role, remote_allowed } = req.body

        const newEmploye = await UserService.createByAdmin({
            name,
            email,
            password,
            company_id,
            role: role || 'employee',
            remote_allowed
        });

        return res.status(201).json({ success: true, data: newEmploye });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
}

export const updateEmploye = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id } = req.user;

        const updateEmploye = await UserService.update(id, company_id, req.body);

        return res.status(200).json({ success: true, data: updateEmploye });
    } catch (error) {
        return res.status(400).json({ success: false, message: error });
    }
}


export const toggleEmployeStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { company_id } = req.user
        const { active } = req.body

        if (typeof active !== 'boolean') {
            return res.status(400).json({ success: false, message: 'El campo activo es requerido' });
        }

        const result = await UserService.toggleStatus(id, company_id, active);

        const actionTex = active ? 'activo' : 'desactivado'
        return res.status(200).json({
            success: true,
            message: `Empleado ${actionTex} correctamente`,
            data: result
        })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message })
    }
}