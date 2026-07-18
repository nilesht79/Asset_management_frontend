import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Alert, Typography } from 'antd'
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
// import { useNavigate } from 'react-router-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
// import { useNavigate } from 'react-router-dom'
import { login, clearError } from '../store/slices/authSlice'
import { Link } from 'react-router-dom'
import { message } from 'antd'

const { Title, Text } = Typography

const Login = () => {
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  const { isLoading, error, isAuthenticated, user } = useSelector(state => state.auth)
  const [showError, setShowError] = useState(false)
  

  // Handle redirect if already authenticated (e.g., page refresh while logged in)
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     if (user.mustChangePassword) {
  //       navigate('/force-password-change', { replace: true })
  //     } else {
  //       navigate('/dashboard', { replace: true })
  //     }
  //   }
  // }, [isAuthenticated, user, navigate])

  useEffect(() => {
  if (isAuthenticated && user) {
    if (user.mustChangePassword) {
      navigate('/force-password-change', { replace: true })
    } else {
      navigate(redirect || '/dashboard', { replace: true })
    }
  }
}, [isAuthenticated, user, redirect, navigate])

  useEffect(() => {
    if (error) {
      setShowError(true)
    }
  }, [error])

  const handleSubmit = async (values) => {
    try {
      dispatch(clearError())
      setShowError(false)

      // Get the login result directly to check mustChangePassword
      const result = await dispatch(login(values)).unwrap()

      // // Immediately redirect based on mustChangePassword flag
      // if (result.user?.mustChangePassword) {
      //   navigate('/force-password-change', { replace: true })
      // } else {
      //   navigate('/dashboard', { replace: true })
      // }
      if (result.user?.mustChangePassword) {
  navigate('/force-password-change', { replace: true })
  } else {
    navigate(redirect || '/dashboard', { replace: true })
  }
    } catch (err) {
  console.log('LOGIN ERROR:', err)

  message.error(
    err?.message || 'Employee ID or Password is incorrect'
  )
}
  }

  const handleErrorClose = () => {
    setShowError(false)
    dispatch(clearError())
  }

  return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">

  <div className="flex-1 flex items-center justify-center p-4">
      
      <div className="w-full max-w-md">
         {/* <Link to="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            <ArrowLeftOutlined className="mr-2" />
            Back to Home
          </Link> */}
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="PolePlus"
            className="h-16 w-auto mx-auto mb-4"
          />
          <Title level={2} className="mb-2">
            Unified ITSM Platform
          </Title>
          <Text className="text-gray-600">
            Sign in to access your account
          </Text>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          {/* {showError && (
            <Alert
              message="Login Failed"
              description={error}
              type="error"
              showIcon
              closable
              onClose={handleErrorClose}
              className="mb-4"
            />
          )} */}

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="employeeId"
              label="Employee ID"
              rules={[
                {
                  required: true,
                  message: 'Please enter your Employee ID',
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Enter your Employee ID (e.g., T-12345)"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: 'Please enter your password',
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </Form.Item>

             {error && (
    <div
      style={{
        color: '#ff4d4f',
        marginBottom: '15px',
        textAlign: 'center'
      }}
    >
      {error}
    </div>
  )}

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-12 text-base font-medium"
                loading={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Form.Item>
          </Form>

          {/* <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-red-600 hover:text-red-700 text-sm">
              Forgot Password?
            </Link>
          </div> */}
          <div className="mt-4 text-center">
  <Button
    type="link"
    className="text-red-600"
    onClick={() => {
      const employeeId = form.getFieldValue("employeeId");

      if (!employeeId) {
        return form.setFields([
          {
            name: "employeeId",
            errors: ["Please enter Employee ID first"]
          }
        ]);
      }

      navigate("/forgot-password", {
        state: {
          employeeId
        }
      });
    }}
  >
    Forgot Password?
  </Button>
</div>
        </Card>

      </div>
    </div>

    
    <footer
  className="mt-auto border-t"
  style={{
    background: "linear-gradient(90deg, #003062 0%, #0A3D73 50%, #1A4C82 100%)",
    borderColor: "#0A3D73",
    color: "#fff",
    padding: "60px 0 35px"
  }}
>
  <div className="w-full px-6 lg:px-12">

    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 items-start"> */}
<div
  className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start"
  style={{
    minHeight: "120px"
  }}
>
      <div className="flex items-center space-x-3">
        <img
          src="/logo.png"
          alt="PolePlus Logo"
          className="h-10 w-auto"
        />

        <div>
          <div
            className="text-4xl font-bold"
            style={{ color: "#E30613" }}
          >
            PolePlus
          </div>

          <div
            className="text-lg"
            style={{ color: "#E5E7EB" }}
          >
            Enterprise level IT Services Management (ITSM) Platform
          </div>
        </div>
      </div>

      <div>
        
      </div>

      <div>
        <h2
          style={{
            color: "#FFFFFF",
            marginBottom: "10px",
            marginTop: 0
          }}
        >
          Contact Support
        </h2>

        <div
          className="space-y-2 text-sm"
          style={{ color: "#E5E7EB" }}
        >
          <div>
           

            <a
              href="tel:02265967466"
              style={{ color: "#FFFFFF", fontSize: "20px" }}
            >
              📞 +91 22 6791 8181
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span>✉</span>

            <a
              href="mailto:it.tickets@mailmmrda.maharashtra.gov.in"
              style={{ color: "#E5E7EB", fontSize: "20px" }}
            >
              helpdesk.fms@cidcoindia.com
            </a>
          </div>
        </div>
      </div>

    </div>

    <div
      className="pt-2 mt-2 flex flex-wrap justify-center items-center gap-2 text-sm"
      style={{
        borderTop: "1px solid rgba(255,255,255,0.2)",
        color: "#E5E7EB"
      }}
    >
      <span style={{
        fontSize: "20px"
      }}>
        © 2026 PolePlus Unified ITSM Platform. All Rights Reserved.
      </span>

      <span>|</span>

      <span>Powered By</span>

      <img
        src="/logo.png"
        alt="PolePlus"
        className="h-6 w-auto object-contain"
      />
    </div>
</div>   

    </footer>

</div> 
)

}

export default Login
