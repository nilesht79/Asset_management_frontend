import React from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

const { Content } = Layout

const MainLayout = () => {
  return (
    <Layout
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
      }}
    >
      <Sidebar />
      <Layout style={{ background: 'transparent' }}>
        <Header />
        <Content
          className="p-6 overflow-auto"
          style={{
            background: 'transparent',
            minHeight: 'calc(100vh - 80px)'
          }}
        >
          <div className="max-w-full">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout