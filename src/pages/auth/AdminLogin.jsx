import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Form, Input, Button, Card, Typography, Alert, Space, Tabs } from 'antd'
import { UserOutlined, LockOutlined, SafetyCertificateOutlined, ArrowLeftOutlined, UserAddOutlined } from '@ant-design/icons'
import { login } from '../../store/slices/authSlice'
import authService from '../../services/auth'

const { Title, Text } = Typography
const { TabPane } = Tabs

const AdminLogin = () => {
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogin = async (values) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await dispatch(login({
        ...values,
        role: 'admin',
        loginType: 'role-based'
      })).unwrap()
      
      if (result.user.role === 'admin') {
        // Setup token auto-refresh after successful login
        authService.setupTokenRefresh()
        navigate('/dashboard')
      } else {
        setError('Invalid role. This login is specifically for Administrators.')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Add role and registration type to the payload
      const registrationData = {
        ...values,
        role: 'admin',
        registrationType: 'self-registration'
      }
      
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSuccess('Admin account created successfully! You can now login.')
        registerForm.resetFields()
      } else {
        setError(result.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      setError('Registration failed. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <ArrowLeftOutlined className="mr-2" />
            Back to Home
          </Link>
          
          <div className="mb-4">
            <SafetyCertificateOutlined style={{ fontSize: '64px', color: '#f5222d' }} />
          </div>
          
          <Title level={2} className="text-gray-800 mb-2">
            Admin Access Portal
          </Title>
          <Text className="text-gray-600">
            System administration and management access
          </Text>
        </div>

        <Card className="shadow-lg border-0">
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              closable
              className="mb-4"
              onClose={() => setError(null)}
            />
          )}
          
          {success && (
            <Alert
              message="Success"
              description={success}
              type="success"
              closable
              className="mb-4"
              onClose={() => setSuccess(null)}
            />
          )}

          <Tabs defaultActiveKey="login" centered>
            <TabPane tab="Login" key="login">
              <Form
                form={loginForm}
                name="admin_login"
                onFinish={handleLogin}
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
                    placeholder="admin@company.com"
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
                    className="w-full h-12 text-lg"
                    style={{ backgroundColor: '#f5222d', borderColor: '#f5222d' }}
                  >
                    {loading ? 'Signing In...' : 'Sign In as Admin'}
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="Self Register" key="register">
              <Form
                form={registerForm}
                name="admin_register"
                onFinish={handleRegister}
                layout="vertical"
                size="large"
              >
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[
                    { required: true, message: 'Please enter your first name' },
                    { min: 2, message: 'First name must be at least 2 characters' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="John"
                  />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[
                    { required: true, message: 'Please enter your last name' },
                    { min: 2, message: 'Last name must be at least 2 characters' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Doe"
                  />
                </Form.Item>

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
                    placeholder="admin@company.com"
                    autoComplete="username"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Please create a password' },
                    { min: 8, message: 'Password must be at least 8 characters' },
                    { 
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message: 'Password must contain uppercase, lowercase, number, and special character'
                    }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Create strong password"
                    autoComplete="new-password"
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject(new Error('Passwords do not match'))
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="w-full h-12 text-lg"
                    style={{ backgroundColor: '#f5222d', borderColor: '#f5222d' }}
                    icon={<UserAddOutlined />}
                  >
                    {loading ? 'Creating Account...' : 'Create Admin Account'}
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>

          <div className="text-center mt-6">
            <Space direction="vertical" size="small">
              <Text className="text-gray-500">
                Admin access includes:
              </Text>
              <Text className="text-sm text-gray-600">
                • User management & permissions
              </Text>
              <Text className="text-sm text-gray-600">
                • System configuration
              </Text>
              <Text className="text-sm text-gray-600">
                • Advanced reporting & analytics
              </Text>
            </Space>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Text className="text-gray-500">
            Admin registration requires approval. Contact superadmin if needed.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin