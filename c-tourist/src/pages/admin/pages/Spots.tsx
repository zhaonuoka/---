import { Card, Table, Tag, Space, Button, Input } from 'antd'
import type { TableProps } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'

interface ScenicSpot {
  key: string
  name: string
  category: string
  rating: number
  status: 'open' | 'closed' | 'maintenance'
}

const columns: TableProps<ScenicSpot>['columns'] = [
  { title: '景点名称', dataIndex: 'name', key: 'name' },
  { title: '分类', dataIndex: 'category', key: 'category' },
  {
    title: '评分',
    dataIndex: 'rating',
    key: 'rating',
    render: (r: number) => '⭐'.repeat(r),
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (s: ScenicSpot['status']) => {
      const map = {
        open: { color: 'green', text: '营业中' },
        closed: { color: 'red', text: '已关闭' },
        maintenance: { color: 'orange', text: '维护中' },
      }
      return <Tag color={map[s].color}>{map[s].text}</Tag>
    },
  },
  {
    title: '操作',
    key: 'action',
    render: () => (
      <Space>
        <a>编辑</a>
        <a style={{ color: '#ff4d4f' }}>删除</a>
      </Space>
    ),
  },
]

const dataSource: ScenicSpot[] = [
  { key: '1', name: '黄山风景区', category: '自然风光', rating: 5, status: 'open' },
  { key: '2', name: '宏村古镇', category: '历史文化', rating: 4, status: 'open' },
  { key: '3', name: '屯溪老街', category: '街区购物', rating: 4, status: 'open' },
  { key: '4', name: '西递古村', category: '历史文化', rating: 4, status: 'maintenance' },
  { key: '5', name: '齐云山', category: '自然风光', rating: 3, status: 'closed' },
]

const Spots: React.FC = () => {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>景点管理</h2>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Input placeholder="搜索景点..." prefix={<SearchOutlined />} style={{ width: 260 }} />
            <Button type="primary">搜索</Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />}>
            新增景点
          </Button>
        </div>
        <Table<ScenicSpot>
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default Spots
