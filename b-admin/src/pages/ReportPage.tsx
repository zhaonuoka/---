import { useState } from 'react'
import { Card, DatePicker, Button, Table, Row, Col, message, Spin } from 'antd'
import ReactECharts from 'echarts-for-react'
import 'echarts-wordcloud'
import { DownloadOutlined } from '@ant-design/icons'
import { analyticsApi, type ReportData } from '@/api/analytics'

const mockHotWords = [
  { name: '灵山大佛', value: 85 },
  { name: '门票', value: 72 },
  { name: '开放时间', value: 65 },
  { name: '路线', value: 58 },
  { name: '九龙灌浴', value: 52 },
  { name: '停车', value: 45 },
  { name: '餐饮', value: 38 },
  { name: '五明桥', value: 32 },
  { name: '儿童票', value: 28 },
  { name: '周边', value: 25 },
  { name: '梵宫', value: 22 },
  { name: '祈福', value: 18 },
  { name: '讲解', value: 15 },
  { name: '游览', value: 12 },
  { name: '拍照', value: 10 },
  { name: '纪念品', value: 8 },
  { name: '交通', value: 15 },
  { name: '导游', value: 12 },
  { name: '住宿', value: 10 },
  { name: '优惠', value: 8 },
]

const mockTrendData = [
  { date: '7/3', positive: 32, neutral: 68, negative: 5 },
  { date: '7/4', positive: 38, neutral: 72, negative: 4 },
  { date: '7/5', positive: 42, neutral: 78, negative: 6 },
  { date: '7/6', positive: 35, neutral: 65, negative: 3 },
  { date: '7/7', positive: 45, neutral: 82, negative: 7 },
  { date: '7/8', positive: 28, neutral: 75, negative: 8 },
  { date: '7/9', positive: 25, neutral: 72, negative: 5 },
]

function ReportPage() {
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = () => {
    if (!startDate || !endDate) {
      message.warning('请选择日期范围')
      return
    }
    setLoading(true)
    analyticsApi
      .generateReport(startDate, endDate)
      .then((response) => {
        setReportData(response.data)
        message.success('报告生成成功')
      })
      .catch(() => {
        message.error('生成报告失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleDownload = () => {
    if (!reportData) {
      message.warning('请先生成报告')
      return
    }

    const reportHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>游客感受度报告</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 40px; }
    .container { max-width: 1000px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #1890ff; }
    .header h1 { font-size: 28px; color: #1890ff; margin-bottom: 10px; }
    .header .date { color: #666; font-size: 14px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 20px; padding-left: 10px; border-left: 4px solid #1890ff; }
    .emotion-grid { display: flex; gap: 20px; }
    .emotion-item { flex: 1; text-align: center; padding: 20px; border-radius: 8px; }
    .emotion-item.positive { background: #f6ffed; border: 1px solid #b7eb8f; }
    .emotion-item.neutral { background: #fffbe6; border: 1px solid #ffe58f; }
    .emotion-item.negative { background: #fff2f0; border: 1px solid #ffccc7; }
    .emotion-count { font-size: 48px; font-weight: bold; }
    .emotion-item.positive .emotion-count { color: #52c41a; }
    .emotion-item.neutral .emotion-count { color: #faad14; }
    .emotion-item.negative .emotion-count { color: #f5222d; }
    .emotion-label { margin-top: 8px; font-size: 14px; }
    .emotion-item.positive .emotion-label { color: #52c41a; }
    .emotion-item.neutral .emotion-label { color: #faad14; }
    .emotion-item.negative .emotion-label { color: #f5222d; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e8e8e8; }
    th { background: #fafafa; font-weight: bold; color: #333; }
    tr:hover { background: #f5f5f5; }
    .suggestion { background: #e6f7ff; padding: 20px; border-radius: 8px; border-left: 4px solid #1890ff; color: #1890ff; font-size: 14px; line-height: 1.8; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e8e8e8; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>游客感受度报告</h1>
      <div class="date">日期范围：${startDate || '未选择'} ~ ${endDate || '未选择'}</div>
    </div>

    <div class="section">
      <div class="section-title">情感分析</div>
      <div class="emotion-grid">
        <div class="emotion-item positive">
          <div class="emotion-count">${reportData.emotions?.positive || 0}</div>
          <div class="emotion-label">正面反馈 (${positivePercent}%)</div>
        </div>
        <div class="emotion-item neutral">
          <div class="emotion-count">${reportData.emotions?.neutral || 0}</div>
          <div class="emotion-label">中性反馈 (${neutralPercent}%)</div>
        </div>
        <div class="emotion-item negative">
          <div class="emotion-count">${reportData.emotions?.negative || 0}</div>
          <div class="emotion-label">负面反馈 (${negativePercent}%)</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">高频问题统计（共${reportData.total || 0}条记录）</div>
      <table>
        <thead>
          <tr><th>问题</th><th>咨询次数</th><th>占比</th></tr>
        </thead>
        <tbody>
          ${reportData.top_questions?.length ? reportData.top_questions.map((q: { question: string; count: number }) => {
            const ratio = reportData.total > 0 ? ((q.count / reportData.total) * 100).toFixed(1) : '0'
            return `<tr><td>${q.question}</td><td>${q.count}</td><td>${ratio}%</td></tr>`
          }).join('') : '<tr><td colspan="3" style="text-align:center;color:#999;">暂无数据</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">服务建议</div>
      <div class="suggestion">${reportData.suggestion || '暂无数据'}</div>
    </div>

    <div class="footer">
      报告生成时间：${new Date().toLocaleString('zh-CN')}
    </div>
  </div>
</body>
</html>
    `

    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const fileName = `游客感受度报告_${startDate || ''}_${endDate || ''}_${new Date().getTime()}.html`.replace(/[^\w\u4e00-\u9fa5]/g, '_')
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    message.success('报告导出成功')
  }

  const data = reportData ? {
    total: reportData.total || 0,
    emotions: reportData.emotions || { positive: 0, neutral: 0, negative: 0 },
    top_questions: reportData.top_questions || [],
    suggestion: reportData.suggestion || '暂无数据',
  } : {
    total: 0,
    emotions: { positive: 0, neutral: 0, negative: 0 },
    top_questions: [],
    suggestion: '暂无数据',
  }

  const topQuestionsColumns = [
    {
      title: '问题',
      dataIndex: 'question',
      key: 'question',
    },
    {
      title: '咨询次数',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '占比',
      key: 'ratio',
      render: (_: unknown, record: { count: number }) => {
        const ratio = data.total > 0 ? ((record.count / data.total) * 100).toFixed(1) : '0'
        return `${ratio}%`
      },
    },
  ]

  const positivePercent = data.total > 0
    ? ((data.emotions.positive / data.total) * 100).toFixed(1)
    : '0'
  const neutralPercent = data.total > 0
    ? ((data.emotions.neutral / data.total) * 100).toFixed(1)
    : '0'
  const negativePercent = data.total > 0
    ? ((data.emotions.negative / data.total) * 100).toFixed(1)
    : '0'

  const wordCloudOption = {
    title: {
      text: '游客关注点词云',
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
      },
    },
    tooltip: {
      show: true,
    },
    series: [
      {
        name: '游客关注点',
        type: 'wordCloud',
        shape: 'circle',
        gridSize: 8,
        sizeRange: [12, 56],
        rotationRange: [-45, 90],
        rotationStep: 45,
        drawOutOfBound: false,
        textStyle: {
          color: () => {
            const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2']
            return colors[Math.floor(Math.random() * colors.length)]
          },
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: mockHotWords,
      },
    ],
  }

  const trendChartOption = {
    title: {
      text: '情感趋势分析',
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
      data: mockTrendData.map((d) => d.date),
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
        data: mockTrendData.map((d) => d.positive),
        lineStyle: { color: '#52c41a', width: 3 },
        itemStyle: { color: '#52c41a' },
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
        data: mockTrendData.map((d) => d.neutral),
        lineStyle: { color: '#faad14', width: 3 },
        itemStyle: { color: '#faad14' },
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
        data: mockTrendData.map((d) => d.negative),
        lineStyle: { color: '#f5222d', width: 3 },
        itemStyle: { color: '#f5222d' },
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
    <div>
      <Card
        title="游客感受度报告"
        extra={
          <div style={{ display: 'flex', gap: 12 }}>
            <DatePicker
              placeholder="开始日期"
              onChange={(date) => {
                if (date) setStartDate(date.format('YYYY-MM-DD'))
              }}
            />
            <DatePicker
              placeholder="结束日期"
              onChange={(date) => {
                if (date) setEndDate(date.format('YYYY-MM-DD'))
              }}
            />
            <Button type="primary" onClick={handleGenerate} loading={loading}>
              生成报告
            </Button>
            <Button onClick={handleDownload}>
              <DownloadOutlined />
              导出
            </Button>
          </div>
        }
      >
        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div style={{ padding: 20, background: '#fafafa', borderRadius: 8 }}>
                <h4 style={{ marginBottom: 16, textAlign: 'center' }}>情感分析</h4>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 16,
                      background: '#f6ffed',
                      borderRadius: 8,
                      border: '1px solid #b7eb8f',
                    }}
                  >
                    <div style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a' }}>
                      {data.emotions.positive}
                    </div>
                    <div style={{ color: '#52c41a', marginTop: 8 }}>正面反馈 ({positivePercent}%)</div>
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 16,
                      background: '#fffbe6',
                      borderRadius: 8,
                      border: '1px solid #ffe58f',
                    }}
                  >
                    <div style={{ fontSize: 32, fontWeight: 'bold', color: '#faad14' }}>
                      {data.emotions.neutral}
                    </div>
                    <div style={{ color: '#faad14', marginTop: 8 }}>中性反馈 ({neutralPercent}%)</div>
                  </div>
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 16,
                      background: '#fff2f0',
                      borderRadius: 8,
                      border: '1px solid #ffccc7',
                    }}
                  >
                    <div style={{ fontSize: 32, fontWeight: 'bold', color: '#f5222d' }}>
                      {data.emotions.negative}
                    </div>
                    <div style={{ color: '#f5222d', marginTop: 8 }}>负面反馈 ({negativePercent}%)</div>
                  </div>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <Card title="游客关注点词云" style={{ height: '100%' }}>
                <ReactECharts option={wordCloudOption} style={{ height: 280 }} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="服务建议" style={{ height: '100%' }}>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    margin: 0,
                    color: '#1677ff',
                    fontSize: 13,
                    lineHeight: 1.8,
                  }}
                >
                  {data.suggestion}
                </pre>
              </Card>
            </Col>
          </Row>

          <div style={{ marginTop: 24 }}>
            <Card title="情感趋势分析">
              <ReactECharts option={trendChartOption} style={{ height: 300 }} />
            </Card>
          </div>

          <div style={{ marginTop: 24 }}>
            <Card title="高频问题统计">
              <Table
                columns={topQuestionsColumns}
                dataSource={data.top_questions}
                rowKey="question"
                pagination={false}
              />
            </Card>
          </div>
        </Spin>
      </Card>
    </div>
  )
}

export default ReportPage
