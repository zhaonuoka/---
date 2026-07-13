import axios from './axios'

export interface SentimentData {
  positive: number
  neutral: number
  negative: number
}

export interface TopQuestion {
  question: string
  count: number
}

export interface DashboardSummary {
  today_visitors: number
  total_visitors: number
  top_questions: TopQuestion[]
  sentiment_7days: SentimentData
}

export interface ReportData {
  total: number
  emotions: SentimentData
  top_questions: TopQuestion[]
  suggestion: string
}

export const analyticsApi = {
  getSentiment: (start?: string, end?: string) => {
    const params: Record<string, string> = {}
    if (start) params.start = start
    if (end) params.end = end
    return axios.get('/analytics/sentiment', { params })
  },

  generateReport: (start?: string, end?: string) =>
    axios.post('/analytics/report', { start, end }),

  getDashboardSummary: () => axios.get('/dashboard/summary'),

  getRatings: () => axios.get('/analytics/ratings'),

  getDailySentiment: (days: number = 7) =>
    axios.get('/analytics/daily-sentiment', { params: { days } }),

  getHotWords: (top_k: number = 20) =>
    axios.get('/analytics/hot-words', { params: { top_k } }),
}
