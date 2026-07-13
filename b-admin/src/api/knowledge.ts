import axios from './axios'

export interface Document {
  id: number
  name: string
  file_type: string
  file_size: number
  content: string
  created_at: string
}

export const knowledgeApi = {
  uploadDoc: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return axios.post('/knowledge/upload', formData)
  },

  listDocs: () => axios.get('/knowledge/list'),

  deleteDoc: (docId: number) => axios.delete(`/knowledge/${docId}`),

  editDoc: (docId: number, content: string) =>
    axios.put(`/knowledge/${docId}`, { content }),
}
