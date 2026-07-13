import axios from './axios'

export interface AvatarConfig {
  model: string
  voice: string
  skin_color: string
}

export const configApi = {
  getAvatarConfig: () => axios.get('/config/avatar'),

  updateAvatarConfig: (config: AvatarConfig) =>
    axios.put('/config/avatar', config),
}
