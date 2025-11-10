import React, { useEffect, useMemo } from 'react'
import { Layout, Avatar, Dropdown, Badge, Button, Space, Typography, Tooltip } from 'antd'
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SecurityScanOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ToolOutlined,
  IdcardOutlined,
  ContactsOutlined
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../../store/slices/authSlice'
import { toggleSidebar, selectSidebarCollapsed } from '../../../store/slices/uiSlice'
import { getThemeByRole, applyTheme } from '../../../utils/roleThemes'
import { useNavigate } from 'react-router-dom'

const { Header: AntHeader } = Layout
const { Text } = Typography

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const sidebarCollapsed = useSelector(selectSidebarCollapsed)

  // Get theme based on user role
  const theme = useMemo(() => {
    return user?.role ? getThemeByRole(user.role) : getThemeByRole('employee')
  }, [user?.role])

  // Apply theme on mount and role change
  useEffect(() => {
    if (user?.role) {
      applyTheme(user.role)
    }
  }, [user?.role])

  const handleLogout = () => {
    // Dispatch logout action and navigate after completion
    dispatch(logout()).then(() => {
      // Navigate to login page (same for all roles)
      navigate('/login')
    })
  }

  // Get role icon
  const getRoleIcon = (role) => {
    const iconMap = {
      superadmin: <SecurityScanOutlined className="text-red-500" />,
      admin: <SafetyCertificateOutlined className="text-blue-500" />,
      department_head: <TeamOutlined className="text-green-500" />,
      it_head: <SecurityScanOutlined className="text-indigo-500" />,
      coordinator: <ToolOutlined className="text-yellow-600" />,
      department_coordinator: <ContactsOutlined className="text-cyan-500" />,
      engineer: <ToolOutlined className="text-purple-500" />,
      employee: <IdcardOutlined className="text-slate-500" />
    }
    return iconMap[role] || iconMap.employee
  }

  // Get role display name
  const getRoleDisplayName = (role) => {
    return theme.name
  }

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile Settings',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Preferences',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ]

  return (
    <AntHeader
      className="border-b-2 px-6 flex items-center justify-between shadow-sm transition-all duration-300"
      style={{
        borderBottomColor: theme.accent,
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      {/* Left side - Menu toggle, logo and title */}
      <div className="flex items-center space-x-4">
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => dispatch(toggleSidebar())}
          className="text-gray-600 hover:text-current transition-colors duration-200"
          style={{
            color: theme.accent,
            fontSize: '16px'
          }}
        />

        {/* Logo and title */}
        <div className="flex items-center space-x-3">
          <div>
            <div className="text-lg font-bold text-gray-800">
              PolePlus Asset Management
            </div>
            <div className="text-xs font-medium" style={{ color: theme.accent }}>
              {getRoleDisplayName(user?.role)} Portal
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Role indicator, notifications and user menu */}
      <div className="flex items-center space-x-6">

        {/* Notifications */}
        <Tooltip title="Notifications">
          <Badge count={5} size="small" color={theme.accent} offset={[-6, 4]}>
            <Button
              type="text"
              icon={<BellOutlined />}
              className="text-gray-600 hover:text-current transition-colors duration-200"
              style={{
                color: theme.accent,
                fontSize: '18px',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
          </Badge>
        </Tooltip>

        {/* User menu */}
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Space className="cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-all duration-200">
            <Avatar
              size="default"
              icon={getRoleIcon(user?.role)}
              style={{
                backgroundColor: theme.accent,
                border: `2px solid ${theme.accent}30`
              }}
            />
            <div className="hidden md:block">
              <Text className="text-gray-800 font-medium block leading-none">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text className="text-gray-500 text-xs block leading-none mt-1">
                {getRoleDisplayName(user?.role)}
              </Text>
            </div>
          </Space>
        </Dropdown>
      </div>
    </AntHeader>
  )
}

export default Header