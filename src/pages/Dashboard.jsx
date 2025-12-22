import React from 'react'
import { Typography } from 'antd'
import { useSelector } from 'react-redux'

// Role-specific dashboard components
import SuperAdminDashboard from '../components/modules/dashboards/superadmin/SuperAdminDashboard'
import AdminDashboard from '../components/modules/dashboards/admin/AdminDashboard'
import EmployeeDashboard from '../components/modules/dashboards/employee/EmployeeDashboard'
import CoordinatorDashboard from '../components/modules/dashboards/coordinator/CoordinatorDashboard'
import DepartmentHeadDashboard from '../components/modules/dashboards/department-head/DepartmentHeadDashboard'
import ITHeadDashboard from '../components/modules/dashboards/it-head/ITHeadDashboard'
import EngineerDashboard from '../components/modules/dashboards/engineer/EngineerDashboard'

const { Title, Text } = Typography

const Dashboard = () => {
  const { user, isLoading, isAuthenticated, error } = useSelector(state => state.auth)

  // Show loading while authentication is in progress
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Handle case where authentication failed
  if (!isAuthenticated || !user || !user.role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the dashboard</p>
          {error && <p className="text-red-500 text-sm mt-2">Error: {error}</p>}
        </div>
      </div>
    )
  }

  // Route to role-specific dashboards
  if (user.role === 'superadmin') {
    return <SuperAdminDashboard />
  }

  if (user.role === 'admin') {
    return <AdminDashboard />
  }

  if (user.role === 'employee') {
    return <EmployeeDashboard />
  }

  if (user.role === 'coordinator') {
    return <CoordinatorDashboard />
  }

  if (user.role === 'department_head' || user.role === 'dept_head' || user.role === 'department_coordinator') {
    return <DepartmentHeadDashboard />
  }

  if (user.role === 'it_head') {
    return <ITHeadDashboard />
  }

  if (user.role === 'engineer') {
    return <EngineerDashboard />
  }

  // For other roles, show fallback
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <Title level={2}>Welcome to Unified ITSM Platform</Title>
        <Text className="text-gray-600">
          Your role ({user.role}) dashboard is not configured yet.<br/>
          Please contact your system administrator.
        </Text>
      </div>
    </div>
  )
}

export default Dashboard