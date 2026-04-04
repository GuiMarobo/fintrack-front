import api from './axios'

export const accountsApi = {
  create(data) {
    return api.post('/accounts', data)
  },
  list(params = {}) {
    return api.get('/accounts', { params })
  },
  getById(id) {
    return api.get(`/accounts/${id}`)
  },
  update(id, data) {
    return api.put(`/accounts/${id}`, data)
  },
  patch(id, data) {
    return api.patch(`/accounts/${id}`, data)
  },
  delete(id) {
    return api.delete(`/accounts/${id}`)
  }
}
