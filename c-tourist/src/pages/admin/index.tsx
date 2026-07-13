import { useState } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Layout, Menu, Button, theme } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import Dashboard from './pages/Dashboard'
import Spots from './pages/Spots'
import Logs from './pages/Logs'
import Settings from './pages/Settings'
import './index.css'

const { Sider, Content, Header } = Layout

type MenuItem = Required<MenuProps>['items'][number]

const menuItems: MenuItem[] = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '仪表' },
  { key: '/admin/spots',     icon: <EnvironmentOutlined />, label: '景点管理' },
  { key: '/admin/logs',      icon: <FileTextOutlined />,    label: '对话日志' },
  { key: '/admin/settings',  icon: <SettingOutlined />,     label: '系统配置' },
]

const AdminPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  // 根据当前路径获取页面标题
  const currentItem = menuItems.find(
    (item) => item?.key === location.pathname
  ) as { label?: string } | undefined
  const pageTitle = currentItem?.label ?? '管理后台'

  return (
    <Layout className="admin-layout">
      {/* ========== 侧边栏 ========== */}
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        className="admin-sider"
        breakpoint="lg"
        onBreakpoint={(broken) => setCollapsed(broken)}
      >
        {/* Logo 区域 */}
        <div className="admin-logo">
          {collapsed ? (
            <span className="admin-logo-icon">🏔️</span>
          ) : (
            <span className="admin-logo-text">🏔️ 智慧旅游管理</span>
          )}
        </div>

        {/* 导航菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>

      {/* ========== 右侧内容区 ========== */}
      <Layout>
        {/* 顶部栏 */}
        <Header className="admin-header" style={{ background: token.colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="admin-collapse-btn"
          />
          <h1 className="admin-page-title">{pageTitle}</h1>
        </Header>

        {/* 内容区 */}
        <Content className="admin-content">
          <div className="admin-content-inner">
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="spots" element={<Spots />} />
              <Route path="logs" element={<Logs />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminPage
