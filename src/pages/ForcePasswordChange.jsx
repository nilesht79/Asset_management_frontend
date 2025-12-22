import React, { useState } from 'react'
import { Form, Input, Button, Card, Alert, Typography, Result } from 'antd'
import { LockOutlined, SafetyOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../store/slices/authSlice'
import authService from '../services/auth'

const { Title, Text } = Typography

const ForcePasswordChange = () => {
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (values) => {
    if (values.new_password !== values.confirm_password) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await authService.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password
      })
      setSuccess(true)

      // Logout after successful password change (backend revokes tokens)
      setTimeout(() => {
        dispatch(logout())
        navigate('/login', { replace: true })
      }, 2000)
    } catch (err) {
      console.error('Password change error:', err)
      setError(err.response?.data?.message || 'Failed to change password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-0">
            <Result
              status="success"
              title="Password Changed Successfully"
              subTitle="You will be redirected to login with your new password."
            />
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafetyOutlined className="text-4xl text-red-600" />
          </div>
          <Title level={2} className="mb-2">
            Password Change Required
          </Title>
          <Text className="text-gray-600">
            {user?.firstName ? `Hello ${user.firstName}, ` : ''}
            For security reasons, you must change your password before continuing.
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
            name="force-password-change"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="current_password"
              label="Current Password"
              rules={[
                {
                  required: true,
                  message: 'Please enter your current password',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item
              name="new_password"
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
              label="Confirm New Password"
              dependencies={['new_password']}
              rules={[
                {
                  required: true,
                  message: 'Please confirm your new password',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('new_password') === value) {
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

            <Form.Item className="mb-2">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 text-base font-medium"
                loading={isLoading}
              >
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </Form.Item>

            <Button
              type="link"
              className="w-full text-gray-500"
              onClick={handleLogout}
            >
              Logout instead
            </Button>
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

export default ForcePasswordChange
