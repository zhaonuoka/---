import React from 'react'
import { Layout, Menu } from 'antd'
import {
  DatabaseOutlined,
  SettingOutlined,
  BarChartOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { Outlet } from 'react-router-dom'

const { Header, Content, Sider } = Layout

const menuItems = [
  { key: '/admin/dashboard', icon: <BarChartOutlined />, label: '数据大屏' },
  { key: '/admin/knowledge', icon: <DatabaseOutlined />, label: '知识库管理' },
  { key: '/admin/config', icon: <SettingOutlined />, label: '数字人配置' },
  { key: '/admin/report', icon: <FileTextOutlined />, label: '报告中心' },
]

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="dark"
        width={200}
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          景区AI导览
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          style={{
            borderRight: 0,
            background: 'transparent',
            color: '#e8e8e8',
          }}
          theme="dark"
          items={menuItems.map((item) => ({
            ...item,
            icon: React.cloneElement(item.icon, { style: { color: '#b8b8b8' } }),
          }))}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ margin: 0, color: '#333' }}>管理后台</h2>
          <span style={{ color: '#666' }}>欢迎管理员</span>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#f5f5f5',
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
