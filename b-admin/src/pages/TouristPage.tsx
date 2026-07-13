import { Button, Space, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography

function TouristPage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 40,
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: 60,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          textAlign: 'center',
          maxWidth: 600,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '50%',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            color: '#fff',
          }}
        >
          🤖
        </div>
        <Title level={2} style={{ marginBottom: 16 }}>
          景区导览AI数字人
        </Title>
        <Paragraph style={{ color: '#666', marginBottom: 32 }}>
          欢迎来到灵山胜境智能导览系统
        </Paragraph>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Button
            type="primary"
            size="large"
            style={{ width: '100%', height: 48, fontSize: 16 }}
            onClick={() => navigate('/admin')}
          >
            进入管理后台
          </Button>
          <Button
            size="large"
            style={{ width: '100%', height: 48, fontSize: 16 }}
            onClick={() => navigate('/admin/dashboard')}
          >
            查看数据大屏
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default TouristPage
