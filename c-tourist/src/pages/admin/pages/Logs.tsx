import { Card, Table, Tag, Space, Input, Select } from 'antd'
import type { TableProps } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

interface ChatLog {
  key: string
  user: string
  question: string
  sentiment: 'positive' | 'neutral' | 'negative'
  time: string
}

const columns: TableProps<ChatLog>['columns'] = [
  { title: '用户', dataIndex: 'user', key: 'user', width: 100 },
  { title: '提问内容', dataIndex: 'question', key: 'question', ellipsis: true },
  {
    title: '情感',
    dataIndex: 'sentiment',
    key: 'sentiment',
    width: 100,
    render: (s: ChatLog['sentiment']) => {
      const map = {
        positive: { color: 'green', text: '😊 正面' },
        neutral: { color: 'blue', text: '😐 中性' },
        negative: { color: 'red', text: '😟 负面' },
      }
      return <Tag color={map[s].color}>{map[s].text}</Tag>
    },
  },
  { title: '时间', dataIndex: 'time', key: 'time', width: 180 },
  {
    title: '操作',
    key: 'action',
    width: 120,
    render: () => (
      <Space>
        <a>详情</a>
      </Space>
    ),
  },
]

const dataSource: ChatLog[] = [
  { key: '1', user: '游客A', question: '黄山门票多少钱？有什么优惠吗？', sentiment: 'neutral', time: '2026-07-11 10:30:00' },
  { key: '2', user: '游客B', question: '推荐一下适合亲子的景点，非常感谢！', sentiment: 'positive', time: '2026-07-11 10:28:00' },
  { key: '3', user: '游客C', question: '景区内餐饮太贵了，有没有平价的推荐？', sentiment: 'negative', time: '2026-07-11 10:15:00' },
  { key: '4', user: '游客D', question: '宏村有什么特色小吃？', sentiment: 'neutral', time: '2026-07-11 10:10:00' },
  { key: '5', user: '游客E', question: '导游服务非常好，讲解得很详细！', sentiment: 'positive', time: '2026-07-11 09:55:00' },
]

const Logs: React.FC = () => {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>对话日志</h2>
      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Input placeholder="搜索对话..." prefix={<SearchOutlined />} style={{ width: 260 }} />
          <Select
            placeholder="情感筛选"
            style={{ width: 140 }}
            options={[
              { value: 'positive', label: '😊 正面' },
              { value: 'neutral', label: '😐 中性' },
              { value: 'negative', label: '😟 负面' },
            ]}
          />
        </div>
        <Table<ChatLog>
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default Logs
