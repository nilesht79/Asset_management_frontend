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
  MonitorOutlined,
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
  DeliveredProcedureOutlined
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
          icon: <DatabaseOutlined />,
          label: 'Master Data',
          children: [
            {
              key: '/masters/boards',
              label: 'Board Master',
            },
            {
              key: '/masters/oem',
              label: 'OEM Master',
            },
            {
              key: '/masters/products',
              label: 'Product Master',
            },
            {
              key: '/masters/locations',
              label: 'Location Master',
            },
          ],
        },
        // Asset Management Module
        {
          key: 'assets',
          icon: <DesktopOutlined />,
          label: 'Asset Management',
          children: [
            {
              key: '/assets/inventory',
              label: 'Asset Inventory',
            },
            {
              key: '/assets/movement',
              label: 'Asset Movement',
            },
            {
              key: '/standby/pool',
              label: 'Standby Pool',
              icon: <SwapOutlined />
            },
            {
              key: '/standby/assignments',
              label: 'Standby Assignments',
            }
          ],
        },
        // Ticketing & SLA Module
        {
          key: '/tickets',
          icon: <CustomerServiceOutlined />,
          label: 'Ticket Management',
        },
        // Inventory Reconciliation Module
        {
          key: '/reconciliation',
          icon: <CheckCircleOutlined />,
          label: 'Inventory Reconciliation',
        },
        // Reporting & Analytics Module
        {
          key: 'reports',
          icon: <BarChartOutlined />,
          label: 'Reports & Analytics',
          children: [
            {
              key: '/reports/dashboard',
              label: 'Report Dashboard',
            },
            {
              key: '/reports/asset-inventory',
              label: 'Asset Inventory Reports',
            },
            {
              key: '/reports/asset-lifecycle',
              label: 'Asset Lifecycle Reports',
            },
            {
              key: '/reports/asset-performance',
              label: 'Asset Performance Reports',
            },
            {
              key: '/reports/tickets',
              label: 'Ticketing Reports',
            },
            {
              key: '/reports/sla-compliance',
              label: 'SLA Compliance Reports',
            },
            {
              key: '/reports/custom',
              label: 'Custom Reports',
            },
          ],
        },
        // Monitoring Module
        {
          key: 'monitoring',
          icon: <MonitorOutlined />,
          label: 'Monitoring',
          children: [
            {
              key: '/monitoring/devices',
              label: 'Device Monitoring',
            },
            {
              key: '/monitoring/services',
              label: 'Service Monitoring',
            },
            {
              key: '/monitoring/alerts',
              label: 'Alert Management',
            },
            {
              key: '/monitoring/uptime',
              label: 'Uptime Reports',
            },
          ],
        },
        // Settings Module
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: 'Settings',
          children: [
            ...(user?.role === 'superadmin' ? [
              {
                key: '/settings/permission-control',
                icon: <SecurityScanOutlined />,
                label: 'Permission Control',
              },
              {
                key: '/settings/field-templates',
                icon: <ControlOutlined />,
                label: 'Field Templates',
              }
            ] : []),
            {
              key: '/settings/system-config',
              icon: <ControlOutlined />,
              label: 'System Configuration',
            },
          ],
        }
      )
    }

    // Coordinator items - Asset allocation, movement, ticketing workflows
    if (['coordinator', 'department_coordinator'].includes(user?.role)) {
      baseItems.push(
        {
          key: 'assets',
          icon: <DesktopOutlined />,
          label: 'Asset Management',
          children: [
            {
              key: '/assets/inventory',
              label: 'Asset Inventory',
            },
            {
              key: '/assets/movement',
              label: 'Asset Movement',
            },
            {
              key: '/standby/pool',
              label: 'Standby Pool',
              icon: <SwapOutlined />
            },
            {
              key: '/standby/assignments',
              label: 'Standby Assignments',
            },
            {
              key: 'asset-requisitions',
              icon: <ShoppingOutlined />,
              label: 'Asset Requisitions',
              children: [
                {
                  key: '/assignments/asset-assignment',
                  icon: <SendOutlined />,
                  label: 'Asset Assignment',
                },
                {
                  key: '/deliveries/management',
                  icon: <DeliveredProcedureOutlined />,
                  label: 'Delivery Management',
                },
                {
                  key: '/requisitions/all-requisitions',
                  icon: <FileTextOutlined />,
                  label: 'All Requisitions',
                }
              ]
            }
          ],
        },
        {
          key: '/tickets',
          icon: <CustomerServiceOutlined />,
          label: 'Ticket Management',
        }
      )
    }

    // Department Head items - Department-scoped asset and ticket management
    if (['department_head', 'department_coordinator'].includes(user?.role)) {
      baseItems.push(
        {
          key: '/approvals/department-head',
          icon: <CheckCircleOutlined />,
          label: 'Requisition Approvals',
        },
        {
          key: '/requisitions/all-requisitions',
          icon: <FileTextOutlined />,
          label: 'All Requisitions',
        },
        // {
        //   key: 'department',
        //   icon: <UserOutlined />,
        //   label: 'Department Management',
        //   children: [
        //     {
        //       key: '/department/assets',
        //       label: 'Department Assets',
        //     },
        //     {
        //       key: '/department/tickets',
        //       label: 'Department Tickets',
        //     },
        //     {
        //       key: '/department/reports',
        //       label: 'Department Reports',
        //     },
        //   ],
        // }
      )
    }

    // IT Head items - IT approval workflow and asset management
    if (['it_head'].includes(user?.role)) {
      baseItems.push(
        {
          key: '/approvals/it-head',
          icon: <CheckCircleOutlined />,
          label: 'IT Requisition Approvals',
        },
        {
          key: '/requisitions/all-requisitions',
          icon: <FileTextOutlined />,
          label: 'All Requisitions',
        },
        {
          key: 'assets',
          icon: <DesktopOutlined />,
          label: 'Asset Management',
          children: [
            {
              key: '/assets/inventory',
              label: 'Asset Inventory',
            },
            {
              key: '/assets/components',
              label: 'Component Management',
            },
          ],
        },
        {
          key: '/tickets',
          icon: <CustomerServiceOutlined />,
          label: 'Ticket Management',
        }
      )
    }

    // Engineer items - Technical ticket handling, asset viewing, deliveries
    if (['engineer'].includes(user?.role)) {
      baseItems.push(
        {
          key: '/deliveries/my-deliveries',
          icon: <DeliveredProcedureOutlined />,
          label: 'My Deliveries',
        },
        {
          key: 'tickets',
          icon: <ToolOutlined />,
          label: 'Ticket Management',
          children: [
            {
              key: '/tickets/my-queue',
              label: 'My Tickets',
            },
            {
              key: '/tickets/repair',
              label: 'Repair Management',
            },
          ],
        },
        {
          key: '/reconciliation',
          icon: <CheckCircleOutlined />,
          label: 'Inventory Reconciliation',
        },
        {
          key: 'assets',
          icon: <DesktopOutlined />,
          label: 'Assets',
          children: [
            {
              key: '/assets/view',
              label: 'View Assets',
            },
          ],
        }
      )
    }

    // Employee items - Basic asset viewing, requisition creation
    if (['employee'].includes(user?.role)) {
      baseItems.push(
        {
          key: '/my-assets',
          icon: <DesktopOutlined />,
          label: 'My Assets',
        },
        {
          key: 'requisitions',
          icon: <ShoppingOutlined />,
          label: 'Asset Requisitions',
          children: [
            {
              key: '/requisitions/my-requisitions',
              label: 'My Requisitions',
            },
            {
              key: '/requisitions/new',
              label: 'New Requisition',
            },
          ],
        },
        {
          key: '/create-ticket',
          icon: <CustomerServiceOutlined />,
          label: 'Report Issue',
        },
        {
          key: '/my-tickets',
          icon: <FileTextOutlined />,
          label: 'My Tickets',
        }
      )
    }

    return baseItems
  }

  const handleMenuClick = ({ key }) => {
    navigate(key)
  }

  const getSelectedKeys = () => {
    const pathname = location.pathname

    // Find exact match first
    if (pathname === '/dashboard') return ['/dashboard']
    if (pathname === '/my-assets') return ['/my-assets']
    if (pathname === '/create-requisition') return ['/create-requisition']
    if (pathname === '/create-ticket') return ['/create-ticket']
    if (pathname === '/my-tickets') return ['/my-tickets']

    // User Management routes
    if (pathname.startsWith('/users')) return ['/users']
    if (pathname.startsWith('/departments')) return ['/departments']

    // Master Data routes
    if (pathname.startsWith('/masters/oem')) return ['/masters/oem']
    if (pathname.startsWith('/masters/product-categories')) return ['/masters/product-categories']
    if (pathname.startsWith('/masters/product-subcategories')) return ['/masters/product-subcategories']
    if (pathname.startsWith('/masters/product-types')) return ['/masters/product-types']
    if (pathname.startsWith('/masters/products')) return ['/masters/products']
    if (pathname.startsWith('/masters/clients')) return ['/masters/clients']
    if (pathname.startsWith('/masters/location-types')) return ['/masters/location-types']
    if (pathname.startsWith('/masters/locations')) return ['/masters/locations']

    // Asset Management routes
    if (pathname.startsWith('/assets/inventory')) return ['/assets/inventory']
    if (pathname.startsWith('/assets/assignment')) return ['/assets/assignment']
    if (pathname.startsWith('/assets/movement')) return ['/assets/movement']
    if (pathname.startsWith('/assets/lifecycle')) return ['/assets/lifecycle']
    if (pathname.startsWith('/assets/requisitions')) return ['/assets/requisitions']
    if (pathname.startsWith('/assets/discovery')) return ['/assets/discovery']
    if (pathname.startsWith('/assets/audit')) return ['/assets/audit']
    if (pathname.startsWith('/assets/delivery')) return ['/assets/delivery']
    if (pathname.startsWith('/assets/view')) return ['/assets/view']

    // Asset Requisitions routes (nested under Asset Management)
    if (pathname.startsWith('/assignments/asset-assignment')) return ['/assignments/asset-assignment']
    if (pathname.startsWith('/deliveries/management')) return ['/deliveries/management']
    if (pathname.startsWith('/requisitions/all-requisitions')) return ['/requisitions/all-requisitions']

    // Ticket Management routes
    if (pathname.startsWith('/tickets')) return ['/tickets']

    // Reports & Analytics routes
    if (pathname.startsWith('/reports/dashboard')) return ['/reports/dashboard']
    if (pathname.startsWith('/reports/asset-inventory')) return ['/reports/asset-inventory']
    if (pathname.startsWith('/reports/asset-lifecycle')) return ['/reports/asset-lifecycle']
    if (pathname.startsWith('/reports/asset-performance')) return ['/reports/asset-performance']
    if (pathname.startsWith('/reports/tickets')) return ['/reports/tickets']
    if (pathname.startsWith('/reports/sla-compliance')) return ['/reports/sla-compliance']
    if (pathname.startsWith('/reports/custom')) return ['/reports/custom']

    // Monitoring routes
    if (pathname.startsWith('/monitoring/devices')) return ['/monitoring/devices']
    if (pathname.startsWith('/monitoring/services')) return ['/monitoring/services']
    if (pathname.startsWith('/monitoring/alerts')) return ['/monitoring/alerts']
    if (pathname.startsWith('/monitoring/uptime')) return ['/monitoring/uptime']

    // Department Management routes
    if (pathname.startsWith('/department/assets')) return ['/department/assets']
    if (pathname.startsWith('/department/requisitions')) return ['/department/requisitions']
    if (pathname.startsWith('/department/tickets')) return ['/department/tickets']
    if (pathname.startsWith('/department/reports')) return ['/department/reports']

    // Settings routes
    if (pathname.startsWith('/settings/permission-control')) return ['/settings/permission-control']
    if (pathname.startsWith('/settings/system-config')) return ['/settings/system-config']

    return [pathname]
  }

  const getInitialOpenKeys = () => {
    const pathname = location.pathname
    const keys = []

    if (pathname.startsWith('/users') || pathname.startsWith('/departments')) {
      keys.push('users')
    }
    if (pathname.startsWith('/masters')) {
      keys.push('masters')
    }
    if (pathname.startsWith('/assets')) {
      keys.push('assets')
    }
    // Auto-open Asset Requisitions submenu for requisition-related routes
    if (pathname.startsWith('/assignments/asset-assignment') ||
        pathname.startsWith('/deliveries/management') ||
        pathname.startsWith('/requisitions/all-requisitions')) {
      keys.push('assets', 'asset-requisitions')
    }
    if (pathname.startsWith('/tickets')) {
      keys.push('tickets')
    }
    if (pathname.startsWith('/reports')) {
      keys.push('reports')
    }
    if (pathname.startsWith('/monitoring')) {
      keys.push('monitoring')
    }
    if (pathname.startsWith('/department')) {
      keys.push('department')
    }
    if (pathname.startsWith('/settings')) {
      keys.push('settings')
    }

    return keys
  }

  const handleOpenChange = (keys) => {
    setOpenKeys(keys)
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="shadow-lg transition-all duration-300 themed-sidebar"
      style={{
        background: `linear-gradient(180deg, ${theme.sidebar.bg} 0%, ${theme.sidebar.hover} 100%)`,
        borderRight: `1px solid rgba(255, 255, 255, 0.12)`,
        boxShadow: `2px 0 8px rgba(0, 0, 0, 0.1)`
      }}
      width={280}
      collapsedWidth={80}
    >
      {/* Logo and Brand */}
      <div className="h-20 flex items-center justify-center px-4 border-b-2 border-opacity-30"
           style={{ borderBottomColor: theme.sidebar.active }}>
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: theme.accent }}>
            <img
              src="/logo.png"
              alt="PolePlus"
              className="w-6 h-6 object-contain filter brightness-0 invert"
            />
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: theme.accent }}>
              <img
                src="/logo.png"
                alt="PolePlus"
                className="w-6 h-6 object-contain filter brightness-0 invert"
              />
            </div>
            <div>
              <div className="text-white font-bold text-lg leading-none">
                PolePlus
              </div>
              <div className="text-xs opacity-75 leading-none mt-1"
                   style={{ color: theme.sidebar.icon }}>
                Asset Management
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-hidden">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={getMenuItems()}
          onClick={handleMenuClick}
          className="border-none sidebar-menu"
          style={{
            backgroundColor: 'transparent',
            '--sidebar-bg': theme.sidebar.bg,
            '--sidebar-hover': theme.sidebar.hover,
            '--sidebar-active': theme.sidebar.active,
            '--sidebar-text': theme.sidebar.text,
            '--sidebar-icon': theme.sidebar.icon,
            '--accent-color': theme.accent
          }}
        />
      </div>
    </Sider>
  )
}

export default Sidebar