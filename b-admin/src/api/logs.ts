import axios from './axios'

export interface LogItem {
  id: number
  session_id: string
  question: string
  answer: string
  emotion: string
  created_at: string
}

export interface LogResponse {
  total: number
  data: LogItem[]
}

export const logsApi = {
  getLogs: (page: number = 1, pageSize: number = 20) =>
    axios.get('/logs', { params: { page, page_size: pageSize } }),
}
