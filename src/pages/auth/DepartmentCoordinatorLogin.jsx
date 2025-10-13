import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd'
import { UserOutlined, LockOutlined, TeamOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { login } from '../../store/slices/authSlice'

const { Title, Text } = Typography

const DepartmentCoordinatorLogin = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await dispatch(login({
        ...values,
        role: 'department_coordinator',
        loginType: 'role-based'
      })).unwrap()
      
      if (result.user.role === 'department_coordinator') {
        navigate('/dashboard')
      } else {
        setError('Invalid role. This login is specifically for Department Coordinators.')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-red-300 hover:text-white mb-6 transition-colors duration-200">
            <ArrowLeftOutlined className="mr-2" />
            Back to Home
          </Link>
          
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-red-700 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <TeamOutlined className="text-4xl text-white" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
            </div>
          </div>
          
          <Title 
            level={2} 
            className="text-4xl font-black mb-4"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fecaca 50%, #ffffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(220, 38, 38, 0.3)'
            }}
          >
            Department Coordinator
          </Title>
          <Text className="text-red-100 text-lg font-light">
            Resource coordination and <span className="text-red-300 font-semibold">workflow</span> management
          </Text>
        </div>

        <Card 
          className="shadow-2xl border-0 backdrop-blur-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254, 202, 202, 0.2) 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(220, 38, 38, 0.2)'
          }}
        >
          {error && (
            <Alert
              message="Login Error"
              description={error}
              type="error"
              closable
              className="mb-4"
              onClose={() => setError(null)}
            />
          )}

          <Form
            form={form}
            name="department_coordinator_login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="dept.coordinator@company.com"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-14 text-xl font-bold transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-red-500/25"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  borderRadius: '16px',
                  border: '2px solid #ef4444',
                  boxShadow: '0 20px 40px rgba(220, 38, 38, 0.3)'
                }}
              >
                {loading ? 'Authenticating...' : 'Access Coordination Portal'}
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
            <Space direction="vertical" size="small">
              <Text className="text-red-700 font-semibold text-lg">
                Coordination Capabilities:
              </Text>
              <div className="grid grid-cols-1 gap-2 mt-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <Text className="text-gray-700 font-medium">
                    Department Asset Management
                  </Text>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <Text className="text-gray-700 font-medium">
                    Local Requisition Processing
                  </Text>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <Text className="text-gray-700 font-medium">
                    Resource Allocation & Workflows
                  </Text>
                </div>
              </div>
            </Space>
          </div>
        </Card>

        <div className="text-center mt-8">
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <Text className="text-red-200 font-medium">
              Secure access portal • Need assistance? Contact your 
              <span className="text-white font-semibold">system administrator</span>
            </Text>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepartmentCoordinatorLogin