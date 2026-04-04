import api from './axios'

export const transactionsApi = {
  create(data) {
    return api.post('/transactions', data)
  },
  list(params = {}) {
    return api.get('/transactions', { params })
  },
  getById(id) {
    return api.get(`/transactions/${id}`)
  },
  update(id, data) {
    return api.put(`/transactions/${id}`, data)
  },
  patch(id, data) {
    return api.patch(`/transactions/${id}`, data)
  },
  delete(id) {
    return api.delete(`/transactions/${id}`)
  },
  report(params = {}) {
    return api.get('/transactions/report', { params })
  }
}
