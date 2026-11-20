import { useState, useEffect, useMemo } from 'react'
import { Layout, Menu } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  DashboardOutlined,
  TeamOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  CustomerServiceOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  FileTextOutlined,
  ShoppingOutlined,
  ToolOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  ControlOutlined,
  SecurityScanOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  SendOutlined,
  DeliveredProcedureOutlined,
  InboxOutlined,
  WarningOutlined,
  AlertOutlined,
  ClockCircleOutlined,
  MailOutlined,
  ExportOutlined,
  ReloadOutlined,
  HistoryOutlined,
  CloudServerOutlined,
  MessageOutlined
} from '@ant-design/icons'
import { selectSidebarCollapsed } from '../../../store/slices/uiSlice'
import { getThemeByRole } from '../../../utils/roleThemes'

const { Sider } = Layout

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const collapsed = useSelector(selectSidebarCollapsed)
  const { user } = useSelector(state => state.auth)
  const [openKeys, setOpenKeys] = useState([])

  // Get theme based on user role
  const theme = useMemo(() => {
    return user?.role ? getThemeByRole(user.role) : getThemeByRole('employee')
  }, [user?.role])


  // Initialize open keys based on current route
  useEffect(() => {
    setOpenKeys(getInitialOpenKeys())
  }, [location.pathname])

  // Force re-render when user role changes
  useEffect(() => {
    console.log('User role changed to:', user?.role);
  }, [user?.role])

  // Menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Dashboard',
      }
    ]

    // Admin/Superadmin items - Complete Feature Set Based on SRS
    if (['admin', 'superadmin'].includes(user?.role)) {
      baseItems.push(
        // User Management Module
        {
          key: 'users',
          icon: <TeamOutlined />,
          label: 'User Management',
          children: [
             {
              key: '/users',
              label: 'User Master',
            },
            {
              key: '/departments',
              label: 'Department Master',
            },
          ],
        },
        // Master Data Module
        {
          key: 'masters',
