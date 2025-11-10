import { useState, useEffect, useMemo } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  message,
  Typography,
  List,
  Spin,
  Empty,
  Table,
  Badge,
  Tag,
  Progress,
  Alert,
  Divider,
  Drawer,
  Button,
  Space
} from 'antd'
import {
  UserOutlined,
  ToolOutlined,
  AlertOutlined,
  SettingOutlined,
  DatabaseOutlined,
  TeamOutlined,
  AppstoreOutlined,
  GlobalOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  BarChartOutlined,
  PieChartOutlined,
  DashboardOutlined,
  ExportOutlined,
  PlusOutlined,
  LineChartOutlined,
  TagsOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  ArrowRightOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import dashboardService from '../../../../services/dashboard'

const { Title, Text } = Typography

// Professional enterprise color palette
const THEME = {
  primary: '#2563eb',
  success: '#16a34a', 
  warning: '#ea580c',
  danger: '#dc2626',
  info: '#0ea5e9',
  purple: '#9333ea',
  gray: '#6b7280',
  dark: '#1f2937',
  light: '#f8fafc',
  border: '#e5e7eb',
  shadow: 'rgba(0, 0, 0, 0.1)',
  gradient: {
    primary: ['#3b82f6', '#1d4ed8'],
    success: ['#10b981', '#059669'],
    warning: ['#f59e0b', '#d97706'],
    danger: ['#ef4444', '#dc2626']
  }
}

const SuperAdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    oems: { total: 0, active: 0, pending: 0 },
    categories: { total: 0, active: 0, hierarchical: 0 },
    products: { total: 0, active: 0, draft: 0 },
    locations: { total: 0, active: 0, pending: 0 },
    departments: { total: 0, active: 0, users: 0 },
    users: { total: 0, active: 0, inactive: 0 }
  })
  const [systemHealth, setSystemHealth] = useState({})
  const [recentActivities, setRecentActivities] = useState([])
  const [ciDrawerVisible, setCiDrawerVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    
    try {
      const [dashboardResponse, systemHealthResponse, activitiesResponse] = await Promise.all([
        dashboardService.getSuperAdminDashboard(),
        dashboardService.getSystemHealth(),
        dashboardService.getRecentActivities({ limit: 8 })
      ])

      setDashboardData(dashboardResponse.data.data)
      setSystemHealth(systemHealthResponse.data.data)
      setRecentActivities(activitiesResponse.data.data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      message.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Professional chart configurations
  const getMasterDataOverviewConfig = () => {
    const data = [
      {
        name: 'OEMs',
        total: dashboardData.oems.total,
        active: dashboardData.oems.active,
        pending: dashboardData.oems.pending
      },
      {
        name: 'Categories',
        total: dashboardData.categories.total,
        active: dashboardData.categories.active,
        pending: dashboardData.categories.pending || 0
      },
      {
        name: 'Products',
        total: dashboardData.products.total,
        active: dashboardData.products.active,
        pending: dashboardData.products.draft
      },
      {
        name: 'Locations',
        total: dashboardData.locations.total,
        active: dashboardData.locations.active,
        pending: dashboardData.locations.pending
      },
      {
        name: 'Users',
        total: dashboardData.users.total,
        active: dashboardData.users.active,
        pending: dashboardData.users.inactive
      }
    ]

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: THEME.border,
        borderWidth: 1,
        textStyle: { color: THEME.dark }
      },
      legend: {
        data: ['Total Records', 'Active Records', 'Pending Records'],
        bottom: 3,
        textStyle: { color: THEME.gray, fontSize: 10 }
      },
      grid: { left: '3%', right: '3%', bottom: '18%', top: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisLine: { lineStyle: { color: THEME.border } },
        axisTick: { lineStyle: { color: THEME.border } },
        axisLabel: { color: THEME.gray, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        name: 'Records',
        nameTextStyle: { color: THEME.gray, fontSize: 11 },
        axisLine: { lineStyle: { color: THEME.border } },
        axisTick: { lineStyle: { color: THEME.border } },
        axisLabel: { color: THEME.gray, fontSize: 10 },
        splitLine: { lineStyle: { color: THEME.border, type: 'dashed', opacity: 0.3 } }
      },
      series: [
        {
          name: 'Total Records',
          type: 'bar',
          barWidth: '22%',
          data: data.map(item => item.total),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#1d4ed8' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: 'Active Records',
          type: 'bar',
          barWidth: '22%',
          data: data.map(item => item.active),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#059669' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          }
        },
        {
          name: 'Pending Records',
          type: 'bar',
          barWidth: '22%',
          data: data.map(item => item.pending),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#f59e0b' },
                { offset: 1, color: '#d97706' }
              ]
            },
            borderRadius: [4, 4, 0, 0]
          }
        },
      ]
    }
  }

  const getMasterDataDistributionConfig = () => {
    const data = [
      { name: 'OEMs', value: dashboardData.oems.total, itemStyle: { color: THEME.primary } },
      { name: 'Categories', value: dashboardData.categories.total, itemStyle: { color: THEME.success } },
      { name: 'Products', value: dashboardData.products.total, itemStyle: { color: THEME.warning } },
      { name: 'Locations', value: dashboardData.locations.total, itemStyle: { color: THEME.purple } }
    ].filter(item => item.value > 0)

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: THEME.border,
        borderWidth: 1,
        textStyle: { color: THEME.dark }
      },
      legend: {
        orient: 'horizontal',
        bottom: 5,
        textStyle: { color: THEME.gray, fontSize: 10 }
      },
      series: [{
        type: 'pie',
        radius: ['32%', '58%'],
        center: ['50%', '48%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        label: {
          formatter: (params) => {
            const percentage = params.percent || 0
            const value = params.value || 0
            return `${params.name}\n${value} (${percentage.toFixed(1)}%)`
          },
          fontSize: 10,
          color: THEME.dark,
          lineHeight: 14
        },
        labelLine: {
          length: 8,
          length2: 6,
          smooth: true
        }
      }]
    }
  }

  const getUserEngagementConfig = () => {
    // Ensure we have valid data and calculate accurate percentages
    const activeUsers = dashboardData.users.active || 0
    const inactiveUsers = dashboardData.users.inactive || 0
    const totalUsers = dashboardData.users.total || 0

    // Verify data consistency - inactive should be total - active if not provided correctly
    const calculatedInactive = totalUsers > 0 ? totalUsers - activeUsers : inactiveUsers

    const data = [
      {
        name: 'Active Users',
        value: activeUsers,
        itemStyle: {
          color: {
            type: 'radial',
            x: 0.5, y: 0.5, r: 0.8,
            colorStops: [
              { offset: 0, color: '#34d399' },
              { offset: 1, color: '#059669' }
            ]
          }
        }
      },
      {
        name: 'Inactive Users',
        value: calculatedInactive,
        itemStyle: {
          color: {
            type: 'radial',
            x: 0.5, y: 0.5, r: 0.8,
            colorStops: [
              { offset: 0, color: '#fbbf24' },
              { offset: 1, color: '#d97706' }
            ]
          }
        }
      }
    ].filter(item => item.value > 0) // Only show segments with actual values

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          const percentage = params.percent || 0
          const value = params.value || 0
          return `${params.name}: ${value} users (${percentage.toFixed(1)}%)`
        },
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: THEME.border,
        borderWidth: 1,
        textStyle: { color: THEME.dark }
      },
      legend: {
        orient: 'horizontal',
        bottom: 5,
        textStyle: { color: THEME.gray, fontSize: 10 }
      },
      series: [{
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '48%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        label: {
          formatter: (params) => {
            const percentage = params.percent || 0
            const value = params.value || 0
            return `${params.name}\n${value} (${percentage.toFixed(1)}%)`
          },
          fontSize: 12,
          color: THEME.dark,
          fontWeight: 'bold',
          lineHeight: 16
        },
        labelLine: {
          length: 15,
          length2: 10,
          smooth: true
        }
      }]
    }
  }


  const getActivityIcon = (type) => {
    const icons = {
      user_created: <UserOutlined />,
      oem_created: <BankOutlined />,
      category_created: <AppstoreOutlined />,
      product_created: <ToolOutlined />,
      location_created: <GlobalOutlined />,
      master_data_updated: <DatabaseOutlined />,
      system_alert: <AlertOutlined />,
      backup_completed: <CheckCircleOutlined />
    }
    return icons[type] || <AlertOutlined />
  }

  const getActivityColor = (severity) => {
    const colors = {
      info: THEME.info,
      success: THEME.success,
      warning: THEME.warning,
      error: THEME.danger
    }
    return colors[severity] || THEME.gray
  }

  // Memoize calculated values to prevent re-renders
  const totalMasterDataRecords = useMemo(() =>
    dashboardData.oems.total + dashboardData.categories.total + dashboardData.products.total + dashboardData.locations.total,
    [dashboardData.oems.total, dashboardData.categories.total, dashboardData.products.total, dashboardData.locations.total]
  )

  const totalActiveMasterData = useMemo(() =>
    dashboardData.oems.active + dashboardData.categories.active + dashboardData.products.active + dashboardData.locations.active,
    [dashboardData.oems.active, dashboardData.categories.active, dashboardData.products.active, dashboardData.locations.active]
  )

  const userEngagementRate = useMemo(() =>
    dashboardData.users.total ? Math.round((dashboardData.users.active / dashboardData.users.total) * 100) : 0,
    [dashboardData.users.total, dashboardData.users.active]
  )

  // Memoize current time to prevent constant re-renders
  const [currentTime] = useState(() => new Date().toLocaleString())

  // Filter recent activities for CI-related events
  const ciRecentActivities = useMemo(() =>
    recentActivities.filter(activity =>
      ['oem_created', 'category_created', 'product_created', 'location_created', 'master_data_updated'].includes(activity.type)
    ).slice(0, 5),
    [recentActivities]
  )

  // Get health status color based on percentage
  const getHealthStatus = (active, total) => {
    if (total === 0) return { color: THEME.gray, status: 'No Data', icon: '⚫' }
    const percentage = (active / total) * 100
    if (percentage >= 85) return { color: THEME.success, status: 'Healthy', icon: '✅' }
    if (percentage >= 70) return { color: THEME.warning, status: 'Needs Attention', icon: '⚠️' }
    return { color: THEME.danger, status: 'Critical', icon: '❌' }
  }

  // CI Category data for drawer
  const ciCategories = [
    {
      key: 'oems',
      title: 'OEMs',
      subtitle: 'Original Equipment Makers',
      icon: BankOutlined,
      data: dashboardData.oems,
      route: '/masters/oem',
      color: THEME.primary,
      metricLabel: 'Pending'
    },
    {
      key: 'categories',
      title: 'Product Categories',
      subtitle: 'Configuration Categories',
      icon: TagsOutlined,
      data: dashboardData.categories,
      route: '/masters/products?tab=category',
      color: THEME.success,
      metricLabel: 'Hierarchical',
      metricValue: dashboardData.categories.hierarchical
    },
    {
      key: 'products',
      title: 'Products',
      subtitle: 'Product Configurations',
      icon: ShoppingOutlined,
      data: dashboardData.products,
      route: '/masters/products',
      color: THEME.warning,
      metricLabel: 'Draft',
      metricValue: dashboardData.products.draft
    },
    {
      key: 'locations',
      title: 'Locations',
      subtitle: 'Location Registry',
      icon: EnvironmentOutlined,
      data: dashboardData.locations,
      route: '/masters/locations',
      color: THEME.purple,
      metricLabel: 'Pending'
    }
  ]

  return (
    <div style={{ 
      padding: '24px', 
      background: `linear-gradient(135deg, ${THEME.light} 0%, #ffffff 100%)`,
      minHeight: '100vh'
    }}>
      <Spin spinning={loading} size="large">
        {/* SuperAdmin Dashboard Header */}
        <div style={{ 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '24px',
          borderRadius: '12px',
          border: `1px solid ${THEME.border}`,
          boxShadow: `0 4px 12px ${THEME.shadow}`
        }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ 
                margin: 0, 
                color: THEME.dark, 
                fontSize: '28px', 
                fontWeight: 600
              }}>
                <DashboardOutlined style={{ marginRight: '12px', color: THEME.primary }} />
                SuperAdmin Dashboard
              </Title>
              <Text style={{ 
                fontSize: '14px', 
                color: THEME.gray, 
                marginTop: '4px', 
                display: 'block'
              }}>
                IT Service Management - Configuration & Asset Overview
              </Text>
            </Col>
            <Col>
              <div style={{ textAlign: 'right' }}>
                <Badge 
                  status={systemHealth.serverStatus === 'healthy' && systemHealth.databaseStatus === 'healthy' ? "success" : "error"} 
                  text={
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>
                      Service Status: {systemHealth.serverStatus === 'healthy' && systemHealth.databaseStatus === 'healthy' ? 'Available' : 'Incident'}
                    </span>
                  }
                />
                <div style={{ fontSize: '12px', color: THEME.gray, marginTop: '4px' }}>
                  Last updated: {currentTime}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Service Metrics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              onClick={() => setCiDrawerVisible(true)}
              style={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: `0 8px 25px ${THEME.shadow}`,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = `0 12px 35px ${THEME.shadow}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = `0 8px 25px ${THEME.shadow}`
              }}
            >
              <div style={{ position: 'relative' }}>
                <Statistic
                  title={<span style={{ fontSize: '14px', fontWeight: 500, color: THEME.dark }}>Configuration Items</span>}
                  value={totalMasterDataRecords}
                  prefix={<DatabaseOutlined style={{ color: THEME.primary, fontSize: '20px' }} />}
                  valueStyle={{ color: THEME.primary, fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ marginTop: '16px' }}>
                  <Progress
                    percent={totalMasterDataRecords ? Math.round((totalActiveMasterData / totalMasterDataRecords) * 100) : 0}
                    strokeColor={{
                      '0%': THEME.primary,
                      '100%': THEME.success,
                    }}
                    trailColor={`${THEME.border}`}
                    size={8}
                    showInfo={false}
                  />
                  <Text style={{ fontSize: '14px', color: THEME.gray, marginTop: '8px', display: 'block' }}>
                    {totalActiveMasterData} active of {totalMasterDataRecords} total
                  </Text>
                  <Text style={{ fontSize: '12px', color: THEME.primary, marginTop: '8px', display: 'block', fontWeight: 500 }}>
                    Click for details <ArrowRightOutlined style={{ fontSize: '10px' }} />
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card
              hoverable
              onClick={() => navigate('/users')}
              style={{
                borderRadius: '16px',
                border: 'none',
                boxShadow: `0 8px 25px ${THEME.shadow}`,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = `0 12px 35px ${THEME.shadow}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)'
                e.currentTarget.style.boxShadow = `0 8px 25px ${THEME.shadow}`
              }}
            >
              <div style={{ position: 'relative' }}>
                <Statistic
                  title={<span style={{ fontSize: '14px', fontWeight: 500, color: THEME.dark }}>Active Users</span>}
                  value={userEngagementRate}
                  suffix="%"
                  prefix={<TeamOutlined style={{ color: THEME.success, fontSize: '20px' }} />}
                  valueStyle={{ color: THEME.success, fontSize: '28px', fontWeight: 600 }}
                />
                <div style={{ marginTop: '16px' }}>
                  <Progress
                    percent={userEngagementRate}
                    strokeColor={{
                      '0%': THEME.success,
                      '100%': THEME.primary,
                    }}
                    trailColor={`${THEME.border}`}
                    size={8}
                    showInfo={false}
                  />
                  <Text style={{ fontSize: '14px', color: THEME.gray, marginTop: '8px', display: 'block' }}>
                    {dashboardData.users.active} active of {dashboardData.users.total} users
                  </Text>
                  <Text style={{ fontSize: '12px', color: THEME.success, marginTop: '8px', display: 'block', fontWeight: 500 }}>
                    Click for details <ArrowRightOutlined style={{ fontSize: '10px' }} />
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Analytics Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          {/* Configuration Item Analytics */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: `1px solid ${THEME.border}`
                }}>
                  <div>
                    <BarChartOutlined style={{ marginRight: '8px', color: THEME.primary, fontSize: '16px' }} />
                    <span style={{ fontSize: '16px', fontWeight: 600, color: THEME.dark }}>
                      Configuration Item Status
                    </span>
                  </div>
                  <Tag color={THEME.danger} style={{ fontSize: '11px', fontWeight: 500 }}>
                    LIVE
                  </Tag>
                </div>
              }
              style={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: `0 4px 12px ${THEME.shadow}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              bodyStyle={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <Alert
                message="CMDB Health"
                description="Track configuration item completion rates. Red trend line highlights CIs requiring attention to maintain service quality."
                type="info"
                showIcon
                style={{
                  marginBottom: '12px',
                  borderRadius: '8px',
                  border: `1px solid ${THEME.info}20`
                }}
              />
              <div style={{ width: '100%', height: '280px', overflow: 'hidden' }}>
                <ReactECharts
                  option={getMasterDataOverviewConfig()}
                  style={{ height: '280px', width: '100%' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>
            </Card>
          </Col>

          {/* CI Distribution */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: `1px solid ${THEME.border}`
                }}>
                  <PieChartOutlined style={{ marginRight: '8px', color: THEME.primary, fontSize: '16px' }} />
                  <span style={{ fontSize: '16px', fontWeight: 600, color: THEME.dark }}>
                    CI Distribution
                  </span>
                </div>
              }
              style={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: `0 4px 12px ${THEME.shadow}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              bodyStyle={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ marginBottom: '8px' }}>
                <Text style={{ fontSize: '13px', color: THEME.gray, fontWeight: 400 }}>
                  Configuration item distribution across categories
                </Text>
              </div>
              <div style={{ width: '100%', height: '280px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ReactECharts
                  option={getMasterDataDistributionConfig()}
                  style={{ height: '280px', width: '100%' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* User Analytics */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          {/* User Adoption Metrics */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: `1px solid ${THEME.border}`
                }}>
                  <div>
                    <TeamOutlined style={{ marginRight: '8px', color: THEME.primary, fontSize: '16px' }} />
                    <span style={{ fontSize: '16px', fontWeight: 600, color: THEME.dark }}>
                      User Account Status
                    </span>
                  </div>
                  <Badge
                    status={userEngagementRate > 80 ? "success" : "warning"}
                    text={`${userEngagementRate}% Active`}
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  />
                </div>
              }
              style={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: `0 4px 12px ${THEME.shadow}`,
                display: 'flex',
                flexDirection: 'column'
              }}
              bodyStyle={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <Alert
                message={`${userEngagementRate}% Active Accounts`}
                description={
                  userEngagementRate > 80
                    ? "Most user accounts are active and available for service access."
                    : "Consider reviewing inactive user accounts for security and license optimization."
                }
                type={userEngagementRate > 80 ? "success" : "warning"}
                showIcon
                style={{
                  marginBottom: '16px',
                  borderRadius: '8px'
                }}
              />
              <div style={{ width: '100%', height: '340px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ReactECharts
                  option={getUserEngagementConfig()}
                  style={{ height: '340px', width: '100%' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Service Operations */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          {/* Recent Activities */}
          <Col xs={24}>
            <Card 
              title={
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: `1px solid ${THEME.border}`
                }}>
                  <div>
                    <RiseOutlined style={{ marginRight: '8px', color: THEME.primary, fontSize: '16px' }} />
                    <span style={{ fontSize: '16px', fontWeight: 600, color: THEME.dark }}>
                      Recent Service Activities
                    </span>
                  </div>
                  <Badge status="processing" text="MONITORING" style={{ fontSize: '11px', fontWeight: 500 }} />
                </div>
              }
              style={{ 
                borderRadius: '12px', 
                border: 'none',
                boxShadow: `0 4px 12px ${THEME.shadow}`
              }}
              bodyStyle={{ padding: '0' }}
            >
              {recentActivities && recentActivities.length > 0 ? (
                <List
                  dataSource={recentActivities}
                  style={{ maxHeight: '350px', overflow: 'auto' }}
                  renderItem={(activity, index) => (
                    <List.Item style={{ 
                      padding: '16px 20px', 
                      borderBottom: index < recentActivities.length - 1 ? `1px solid ${THEME.border}` : 'none',
                      transition: 'all 0.2s ease'
                    }}>
                      <List.Item.Meta
                        avatar={
                          <div style={{
                            width: typeof window !== 'undefined' && window.innerWidth < 576 ? '32px' : '40px',
                            height: typeof window !== 'undefined' && window.innerWidth < 576 ? '32px' : '40px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${getActivityColor(activity.severity)}20 0%, ${getActivityColor(activity.severity)}10 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: typeof window !== 'undefined' && window.innerWidth < 576 ? '14px' : '16px',
                            color: getActivityColor(activity.severity),
                            border: `2px solid ${getActivityColor(activity.severity)}30`
                          }}>
                            {getActivityIcon(activity.type)}
                          </div>
                        }
                        title={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontSize: '14px', 
                                fontWeight: 500, 
                                color: THEME.dark, 
                                lineHeight: '1.4',
                                marginBottom: '4px'
                              }}>
                                {activity.description}
                              </div>
                              {activity.details && (
                                <div style={{
                                  fontSize: '12px',
                                  color: THEME.gray,
                                  lineHeight: '1.3',
                                  fontWeight: 400
                                }}>
                                  {activity.details}
                                </div>
                              )}
                            </div>
                            <Tag 
                              color={getActivityColor(activity.severity)} 
                              style={{ 
                                margin: '0 0 0 12px',
                                fontSize: '10px',
                                fontWeight: 500,
                                borderRadius: '8px',
                                textTransform: 'uppercase',
                                flexShrink: 0
                              }}
                            >
                              {activity.severity}
                            </Tag>
                          </div>
                        }
                        description={
                          <div style={{ marginTop: '8px' }}>
                            <Text style={{ fontSize: '12px', color: THEME.gray, fontWeight: 400 }}>
                              <ClockCircleOutlined style={{ marginRight: '4px', fontSize: '10px' }} />
                              {activity.time}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Empty 
                    description={
                      <span style={{ color: THEME.gray, fontSize: '14px' }}>
                        No recent activities
                      </span>
                    }
                  />
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Configuration Items Details Drawer */}
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DatabaseOutlined style={{ color: THEME.primary, fontSize: '20px' }} />
              <span style={{ fontSize: '18px', fontWeight: 600, color: THEME.dark }}>
                Configuration Item Details
              </span>
            </div>
          }
          placement="right"
          width={typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : (window.innerWidth < 1024 ? '90%' : 720)}
          onClose={() => setCiDrawerVisible(false)}
          open={ciDrawerVisible}
          styles={{
            body: { padding: '24px', background: THEME.light }
          }}
        >
          {/* Summary Header */}
          <Card
            style={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: `0 4px 12px ${THEME.shadow}`,
              marginBottom: '24px',
              background: `linear-gradient(135deg, ${THEME.primary}15 0%, ${THEME.success}10 100%)`
            }}
          >
            <Row align="middle" justify="space-between">
              <Col>
                <Statistic
                  title={<span style={{ fontSize: '14px', fontWeight: 500, color: THEME.dark }}>Total Configuration Items</span>}
                  value={totalMasterDataRecords}
                  valueStyle={{ color: THEME.primary, fontSize: '32px', fontWeight: 600 }}
                />
              </Col>
              <Col>
                <Statistic
                  title={<span style={{ fontSize: '14px', fontWeight: 500, color: THEME.dark }}>Active Rate</span>}
                  value={totalMasterDataRecords ? Math.round((totalActiveMasterData / totalMasterDataRecords) * 100) : 0}
                  suffix="%"
                  valueStyle={{ color: THEME.success, fontSize: '32px', fontWeight: 600 }}
                />
              </Col>
            </Row>
          </Card>

          {/* CI Category Breakdown */}
          <div style={{ marginBottom: '24px' }}>
            <Title level={5} style={{ color: THEME.dark, marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>
              <BarChartOutlined style={{ marginRight: '8px', color: THEME.primary }} />
              Category Breakdown
            </Title>
            <Row gutter={[16, 16]}>
              {ciCategories.map(category => {
                const Icon = category.icon
                const healthStatus = getHealthStatus(category.data.active, category.data.total)
                const activePercent = category.data.total ? Math.round((category.data.active / category.data.total) * 100) : 0
                const metricValue = category.metricValue !== undefined ? category.metricValue : (category.data.pending || 0)

                return (
                  <Col xs={24} sm={12} key={category.key}>
                    <Card
                      hoverable
                      onClick={() => {
                        setCiDrawerVisible(false)
                        navigate(category.route)
                      }}
                      style={{
                        borderRadius: '12px',
                        border: `2px solid ${category.color}20`,
                        boxShadow: `0 2px 8px ${THEME.shadow}`,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        height: '100%'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = `0 8px 20px ${category.color}30`
                        e.currentTarget.style.borderColor = category.color
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0px)'
                        e.currentTarget.style.boxShadow = `0 2px 8px ${THEME.shadow}`
                        e.currentTarget.style.borderColor = `${category.color}20`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: `linear-gradient(135deg, ${category.color}20 0%, ${category.color}10 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px',
                            border: `2px solid ${category.color}30`
                          }}
                        >
                          <Icon style={{ fontSize: '20px', color: category.color }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: THEME.dark, marginBottom: '2px' }}>
                            {category.title}
                          </div>
                          <div style={{ fontSize: '11px', color: THEME.gray }}>
                            {category.subtitle}
                          </div>
                        </div>
                      </div>

                      <Divider style={{ margin: '12px 0' }} />

                      <Row gutter={[8, 8]} style={{ marginBottom: '12px' }}>
                        <Col span={12}>
                          <div style={{ fontSize: '11px', color: THEME.gray, marginBottom: '4px' }}>Total</div>
                          <div style={{ fontSize: '20px', fontWeight: 600, color: category.color }}>
                            {category.data.total}
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ fontSize: '11px', color: THEME.gray, marginBottom: '4px' }}>Active</div>
                          <div style={{ fontSize: '20px', fontWeight: 600, color: THEME.success }}>
                            {category.data.active}
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ fontSize: '11px', color: THEME.gray, marginBottom: '4px' }}>{category.metricLabel}</div>
                          <div style={{ fontSize: '16px', fontWeight: 600, color: THEME.warning }}>
                            {metricValue}
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ fontSize: '11px', color: THEME.gray, marginBottom: '4px' }}>Health</div>
                          <div style={{ fontSize: '16px', fontWeight: 600, color: healthStatus.color }}>
                            {healthStatus.icon} {activePercent}%
                          </div>
                        </Col>
                      </Row>

                      <Progress
                        percent={activePercent}
                        strokeColor={{
                          '0%': category.color,
                          '100%': THEME.success
                        }}
                        trailColor={THEME.border}
                        size="small"
                        showInfo={false}
                      />

                      <div style={{
                        marginTop: '12px',
                        textAlign: 'center',
                        fontSize: '12px',
                        color: category.color,
                        fontWeight: 500
                      }}>
                        View Details <ArrowRightOutlined style={{ fontSize: '10px' }} />
                      </div>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </div>

          {/* Status Summary Table */}
          <Card
            title={
              <span style={{ fontSize: '16px', fontWeight: 600, color: THEME.dark }}>
                <PieChartOutlined style={{ marginRight: '8px', color: THEME.primary }} />
                Status Summary
              </span>
            }
            style={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: `0 4px 12px ${THEME.shadow}`,
              marginBottom: '24px'
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${THEME.border}` }}>
                    <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: THEME.gray }}>Category</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: THEME.gray }}>Total</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: THEME.gray }}>Active</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: THEME.gray }}>Pending</th>
                    <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: THEME.gray }}>Health</th>
                  </tr>
                </thead>
                <tbody>
                  {ciCategories.map(category => {
                    const healthStatus = getHealthStatus(category.data.active, category.data.total)
                    const activePercent = category.data.total ? Math.round((category.data.active / category.data.total) * 100) : 0
                    const pendingValue = category.data.pending || 0

                    return (
                      <tr key={category.key} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: category.color
                              }}
                            />
                            <span style={{ fontSize: '13px', fontWeight: 500, color: THEME.dark }}>
                              {category.title}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: THEME.dark }}>
                          {category.data.total}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: THEME.success }}>
                          {category.data.active}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: THEME.warning }}>
                          {pendingValue}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          <Tag color={healthStatus.color} style={{ fontSize: '11px', fontWeight: 600, margin: 0 }}>
                            {healthStatus.icon} {activePercent}%
                          </Tag>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card
            title={
              <span style={{ fontSize: '16px', fontWeight: 600, color: THEME.dark }}>
                <SettingOutlined style={{ marginRight: '8px', color: THEME.primary }} />
                Quick Actions
              </span>
            }
            style={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: `0 4px 12px ${THEME.shadow}`,
              marginBottom: '24px'
            }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button
                icon={<DatabaseOutlined />}
                onClick={() => {
                  setCiDrawerVisible(false)
                  navigate('/masters/oem')
                }}
                block
                size="large"
                style={{
                  height: '44px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textAlign: 'left'
                }}
              >
                Manage Configuration Items
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => message.info('Export functionality coming soon')}
                block
                size="large"
                style={{
                  height: '44px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textAlign: 'left'
                }}
              >
                Export CI Report
              </Button>
            </Space>
          </Card>

          {/* Recent CI Activities */}
          {ciRecentActivities.length > 0 && (
            <Card
              title={
                <span style={{ fontSize: '16px', fontWeight: 600, color: THEME.dark }}>
                  <ClockCircleOutlined style={{ marginRight: '8px', color: THEME.primary }} />
                  Recent Configuration Updates
                </span>
              }
              style={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: `0 4px 12px ${THEME.shadow}`
              }}
            >
              <List
                dataSource={ciRecentActivities}
                renderItem={(activity) => (
                  <List.Item style={{ padding: '12px 0', borderBottom: `1px solid ${THEME.border}` }}>
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${getActivityColor(activity.severity)}20 0%, ${getActivityColor(activity.severity)}10 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            color: getActivityColor(activity.severity),
                            border: `2px solid ${getActivityColor(activity.severity)}30`
                          }}
                        >
                          {getActivityIcon(activity.type)}
                        </div>
                      }
                      title={
                        <div style={{ fontSize: '13px', fontWeight: 500, color: THEME.dark }}>
                          {activity.description}
                        </div>
                      }
                      description={
                        <div style={{ fontSize: '11px', color: THEME.gray }}>
                          {activity.details && <div>{activity.details}</div>}
                          <div style={{ marginTop: '4px' }}>
                            <ClockCircleOutlined style={{ fontSize: '10px', marginRight: '4px' }} />
                            {activity.time}
                          </div>
                        </div>
                      }
                    />
                    <Tag
                      color={getActivityColor(activity.severity)}
                      style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        borderRadius: '8px',
                        textTransform: 'uppercase'
                      }}
                    >
                      {activity.severity}
                    </Tag>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Drawer>
      </Spin>
    </div>
  )
}

export default SuperAdminDashboard
