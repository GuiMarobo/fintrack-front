import api from './axios'

export const usersApi = {
  getMe() {
    return api.get('/users/me')
  },
  updateMe(data) {
    return api.put('/users/me', data)
  },
  patchMe(data) {
    return api.patch('/users/me', data)
  },
  deleteMe() {
    return api.delete('/users/me')
  }
}
