import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Spin } from 'antd'
import ReactECharts from 'echarts-for-react'
import {
  UserOutlined,
  MessageOutlined,
  SmileOutlined,
  AreaChartOutlined,
} from '@ant-design/icons'
import { analyticsApi, type DashboardSummary } from '@/api/analytics'

const mockDailyData = [
  { date: '7/3', positive: 32, neutral: 68, negative: 5 },
  { date: '7/4', positive: 38, neutral: 72, negative: 4 },
  { date: '7/5', positive: 42, neutral: 78, negative: 6 },
  { date: '7/6', positive: 35, neutral: 65, negative: 3 },
  { date: '7/7', positive: 45, neutral: 82, negative: 7 },
  { date: '7/8', positive: 28, neutral: 75, negative: 8 },
  { date: '7/9', positive: 25, neutral: 72, negative: 5 },
]

function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [dailyData, setDailyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [dashRes, dailyRes] = await Promise.all([
        analyticsApi.getDashboardSummary(),
        analyticsApi.getDailySentiment(7)
      ])
      setData(dashRes.data)
      setDailyData(dailyRes.data.data || [])
    } catch (error) {
      console.error('加载大屏数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const summary = data || {
    today_visitors: 0,
    total_visitors: 0,
    top_questions: [],
    sentiment_7days: { positive: 0, neutral: 0, negative: 0 },
  }

  const total =
    summary.sentiment_7days.positive +
    summary.sentiment_7days.neutral +
    summary.sentiment_7days.negative

  const positivePercent = total > 0
    ? ((summary.sentiment_7days.positive / total) * 100).toFixed(1)
    : '0'

  const barChartOption = {
    title: {
      text: '热门问答统计',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: summary.top_questions.map((q) => q.question),
      axisLabel: {
        rotate: 45,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      name: '咨询次数',
    },
    series: [
      {
        name: '咨询次数',
        type: 'bar',
        data: summary.top_questions.map((q) => q.count),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#1890ff' },
              { offset: 1, color: '#722ed1' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#40a9ff' },
                { offset: 1, color: '#9254de' },
              ],
            },
          },
        },
      },
    ],
  }

    const chartData = dailyData.length > 0 ? dailyData : [{day:'暂无数据',positive:0,neutral:0,negative:0}]

  const lineChartOption = {
    title: {
      text: '近7天情感趋势',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
      },
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['正面', '中性', '负面'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: chartData.map((d) => d.day?.slice(5) || d.date),
    },
    yAxis: {
      type: 'value',
      name: '数量',
    },
    series: [
      {
        name: '正面',
        type: 'line',
        smooth: true,
        data: chartData.map((d) => d.positive),
        lineStyle: {
          color: '#52c41a',
          width: 3,
        },
        itemStyle: {
          color: '#52c41a',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
            ],
          },
        },
      },
      {
        name: '中性',
        type: 'line',
        smooth: true,
        data: chartData.map((d) => d.neutral),
        lineStyle: {
          color: '#faad14',
          width: 3,
        },
        itemStyle: {
          color: '#faad14',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(250, 173, 20, 0.3)' },
              { offset: 1, color: 'rgba(250, 173, 20, 0.05)' },
            ],
          },
        },
      },
      {
        name: '负面',
        type: 'line',
        smooth: true,
        data: chartData.map((d) => d.negative),
        lineStyle: {
          color: '#f5222d',
          width: 3,
        },
        itemStyle: {
          color: '#f5222d',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 34, 45, 0.3)' },
              { offset: 1, color: 'rgba(245, 34, 45, 0.05)' },
            ],
          },
        },
      },
    ],
  }

  return (
    <Spin spinning={loading}>
      <div>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日服务人次"
                value={summary.today_visitors}
                prefix={<UserOutlined />}
                suffix="人"
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="累计服务人次"
                value={summary.total_visitors}
                prefix={<AreaChartOutlined />}
                suffix="人"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日对话数"
                value={summary.top_questions.reduce((sum, q) => sum + q.count, 0)}
                prefix={<MessageOutlined />}
                suffix="次"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="正面反馈率"
                value={positivePercent}
                prefix={<SmileOutlined />}
                suffix="%"
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card title="热门问答统计" style={{ height: '100%' }}>
              <ReactECharts option={barChartOption} style={{ height: 350 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="近7天情感趋势" style={{ height: '100%' }}>
              <ReactECharts option={lineChartOption} style={{ height: 350 }} />
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  )
}

export default DashboardPage
