import ShiftTemplate from '../models/postgres/ShiftTemplate.js'

export const getShiftTemplatesService = async () => {
  return ShiftTemplate.findAll({
    order: [['id', 'ASC']]
  })
}

export const createShiftTemplateService = async (data) => {
  return ShiftTemplate.create(data)
}