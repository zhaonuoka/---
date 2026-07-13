import { Card, Row, Col, Statistic } from 'antd'
import {
  TeamOutlined,
  EnvironmentOutlined,
  MessageOutlined,
  StarOutlined,
} from '@ant-design/icons'

const Dashboard: React.FC = () => {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>仪表盘</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日游客"
              value={1893}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="景点数量"
              value={28}
              prefix={<EnvironmentOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日对话"
              value={1256}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="好评率"
              value={96.8}
              suffix="%"
              prefix={<StarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="游客趋势（ECharts 占位）" style={{ minHeight: 320 }}>
            <div style={{
              height: 260,
              background: '#fafafa',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#bbb',
              fontSize: 14,
            }}>
              📊 ECharts 图表区域 —— 待集成
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="情感分析（ECharts 占位）" style={{ minHeight: 320 }}>
            <div style={{
              height: 260,
              background: '#fafafa',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#bbb',
              fontSize: 14,
            }}>
              📊 ECharts 图表区域 —— 待集成
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
