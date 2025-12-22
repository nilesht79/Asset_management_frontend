import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Alert, Typography, Result, Spin } from 'antd'
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import authService from '../services/auth'

const { Title, Text } = Typography

const ResetPassword = () => {
  const [form] = Form.useForm()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState(null)
  const [tokenError, setTokenError] = useState(null)
  const [success, setSuccess] = useState(false)

  const token = searchParams.get('token')

  // Verify token on page load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenError('No reset token provided. Please request a new password reset link.')
        setIsVerifying(false)
        return
      }

      try {
        await authService.verifyResetToken(token)
        setIsVerifying(false)
      } catch (err) {
        console.error('Token verification error:', err)
        setTokenError(err.response?.data?.message || 'Invalid or expired reset link. Please request a new one.')
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const handleSubmit = async (values) => {
    if (values.password !== values.confirm_password) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await authService.resetPassword(token, values.password)
      setSuccess(true)
    } catch (err) {
      console.error('Reset password error:', err)
      setError(err.response?.data?.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while verifying token
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Card className="shadow-lg border-0 p-8">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Verifying reset link...</p>
          </Card>
        </div>
      </div>
    )
  }

  // Show error if token is invalid
  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <Result
              status="error"
              title="Invalid Reset Link"
              subTitle={tokenError}
              extra={[
                <Link to="/forgot-password" key="retry">
                  <Button type="primary" size="large">
                    Request New Link
                  </Button>
                </Link>,
                <Link to="/login" key="login">
                  <Button size="large">
                    Back to Login
                  </Button>
                </Link>
              ]}
            />
          </Card>
        </div>
      </div>
    )
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <Result
              status="success"
              title="Password Reset Successful"
              subTitle="Your password has been reset successfully. You can now login with your new password."
              extra={[
                <Button
                  type="primary"
                  size="large"
                  key="login"
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </Button>
              ]}
            />
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
          <ArrowLeftOutlined className="mr-2" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="PolePlus"
            className="h-16 w-auto mx-auto mb-4"
          />
          <Title level={2} className="mb-2">
            Reset Password
          </Title>
          <Text className="text-gray-600">
            Enter your new password below
          </Text>
        </div>

        <Card className="shadow-lg border-0">
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className="mb-4"
            />
          )}

          <Form
            form={form}
            name="reset-password"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="password"
              label="New Password"
              rules={[
                {
                  required: true,
                  message: 'Please enter your new password',
                },
                {
                  min: 8,
                  message: 'Password must be at least 8 characters',
                },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: 'Password must contain uppercase, lowercase, number and special character (@$!%*?&)',
                },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label="Confirm Password"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: 'Please confirm your password',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Passwords do not match'))
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </Form.Item>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <Text className="text-xs text-gray-500">
                Password requirements:
              </Text>
              <ul className="text-xs text-gray-500 mt-1 ml-4 list-disc">
                <li>At least 8 characters</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
                <li>One special character (@$!%*?&)</li>
              </ul>
            </div>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 text-base font-medium"
                loading={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <div className="text-center mt-6">
          <Text className="text-gray-500 text-sm">
            &copy; 2024 Asset Management System. All rights reserved.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
