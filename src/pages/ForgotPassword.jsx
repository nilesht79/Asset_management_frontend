import React, { useState } from 'react'
import { Form, Input, Button, Card, Alert, Typography, Result } from 'antd'
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import authService from '../services/auth'

const { Title, Text } = Typography

const ForgotPassword = () => {
  const [form] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const handleSubmit = async (values) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.forgotPassword(values.email)
      setSubmittedEmail(values.email)
      setSuccess(true)
    } catch (err) {
      console.error('Forgot password error:', err)
      setError(err.response?.data?.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <Result
              status="success"
              title="Check Your Email"
              subTitle={
                <div className="text-left mt-4">
                  <p className="text-gray-600 mb-4">
                    If an account exists for <strong>{submittedEmail}</strong>, we've sent a password reset link.
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    The link will expire in 1 hour. If you don't see the email, check your spam folder.
                  </p>
                </div>
              }
              extra={[
                <Link to="/login" key="login">
                  <Button type="primary" size="large">
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
            Forgot Password
          </Title>
          <Text className="text-gray-600">
            Enter your email to receive a password reset link
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
            name="forgot-password"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                {
                  required: true,
                  message: 'Please enter your email address',
                },
                {
                  type: 'email',
                  message: 'Please enter a valid email address',
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Enter your email address"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 text-base font-medium"
                loading={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-6 text-center">
            <Text className="text-gray-500">
              Remember your password?{' '}
              <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
                Sign In
              </Link>
            </Text>
          </div>
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

export default ForgotPassword
