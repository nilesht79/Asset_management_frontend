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
  Divider
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
        bottom: 0,
        textStyle: { color: THEME.gray }
      },
      grid: { left: 60, right: 60, bottom: 60, top: 40, containLabel: true },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisLine: { lineStyle: { color: THEME.border } },
        axisTick: { lineStyle: { color: THEME.border } },
        axisLabel: { color: THEME.gray, fontSize: 12 }
      },
      yAxis: {
        type: 'value',
        name: 'Records',
        axisLine: { lineStyle: { color: THEME.border } },
        axisTick: { lineStyle: { color: THEME.border } },
        axisLabel: { color: THEME.gray, fontSize: 11 },
        splitLine: { lineStyle: { color: THEME.border, type: 'dashed' } }
      },
      series: [
        {
          name: 'Total Records',
          type: 'bar',
          barWidth: '20%',
          data: data.map(item => item.total),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#3b82f6' },
                { offset: 1, color: '#1d4ed8' }
              ]
            }
          }
        },
        {
          name: 'Active Records',
          type: 'bar',
          barWidth: '20%',
          data: data.map(item => item.active),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#059669' }
              ]
            }
          }
        },
        {
          name: 'Pending Records',
          type: 'bar',
          barWidth: '20%',
          data: data.map(item => item.pending),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#f59e0b' },
                { offset: 1, color: '#d97706' }
              ]
            }
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
        bottom: -5,
        textStyle: { color: THEME.gray }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '80%'],
        center: ['50%', '45%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        label: {
          formatter: '{b}\\n{c} ({d}%)',
          fontSize: 12,
          color: THEME.dark
        },
        labelLine: {
          length: 15,
          length2: 10
        }
      }]
    }
  }

  const getUserEngagementConfig = () => {
    const data = [
      { 
        name: 'Active Users', 
        value: dashboardData.users.active, 
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
        value: dashboardData.users.inactive, 
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
    ]

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} users ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: THEME.border,
        textStyle: { color: THEME.dark }
      },
      legend: {
        orient: 'horizontal',
        bottom: -5,
        textStyle: { color: THEME.gray }
      },
      series: [{
        type: 'pie',
        radius: ['30%', '75%'],
        center: ['50%', '45%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        label: {
          formatter: '{b}\\n{c} ({d}%)',
          fontSize: 12,
          color: THEME.dark,
          fontWeight: 'bold'
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
            <Card style={{ 
              borderRadius: '16px', 
              border: 'none',
              boxShadow: `0 8px 25px ${THEME.shadow}`,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}>
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
                  <Text style={{ fontSize: '14px', color: THEME.gray, marginTop: '8px' }}>
                    {totalActiveMasterData} active of {totalMasterDataRecords} total
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ 
              borderRadius: '16px', 
              border: 'none',
              boxShadow: `0 8px 25px ${THEME.shadow}`,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}>
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
                  <Text style={{ fontSize: '14px', color: THEME.gray, marginTop: '8px' }}>
                    {dashboardData.users.active} active of {dashboardData.users.total} users
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
                  <Tag color={THEME.primary} style={{ fontSize: '11px', fontWeight: 500 }}>
                    LIVE
                  </Tag>
                </div>
              }
              style={{ 
                borderRadius: '12px', 
                border: 'none',
                boxShadow: `0 4px 12px ${THEME.shadow}`
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <Alert 
                message="CMDB Health" 
                description="Track configuration item completion rates. Red trend line highlights CIs requiring attention to maintain service quality."
                type="info" 
                showIcon 
                style={{ 
                  marginBottom: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${THEME.info}20`
                }}
              />
              <ReactECharts 
                option={getMasterDataOverviewConfig()} 
                style={{ height: '350px', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
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
                height: '100%'
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '13px', color: THEME.gray, fontWeight: 400 }}>
                  Configuration item distribution across categories
                </Text>
              </div>
              <ReactECharts 
                option={getMasterDataDistributionConfig()} 
                style={{ height: '280px', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
              <Divider style={{ margin: '16px 0' }} />
              <div style={{ textAlign: 'center' }}>
                <Statistic
                  title="Total CIs"
                  value={totalMasterDataRecords}
                  valueStyle={{ color: THEME.primary, fontSize: '20px', fontWeight: 600 }}
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
                boxShadow: `0 4px 12px ${THEME.shadow}`
              }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ marginTop: '-12px' }}>
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
                    marginBottom: '8px',
                    borderRadius: '8px'
                  }}
                />
              </div>
              <ReactECharts 
                option={getUserEngagementConfig()} 
                style={{ height: '240px', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
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
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            background: `linear-gradient(135deg, ${getActivityColor(activity.severity)}20 0%, ${getActivityColor(activity.severity)}10 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
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

        {/* Service Management Actions */}
        <Card 
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              paddingBottom: '12px',
              borderBottom: `1px solid ${THEME.border}`
            }}>
              <AppstoreOutlined style={{ marginRight: '8px', color: THEME.primary, fontSize: '16px' }} />
              <span style={{ fontSize: '16px', fontWeight: 600, color: THEME.dark }}>
                Service Management
              </span>
            </div>
          }
          style={{ 
            borderRadius: '12px', 
            border: 'none',
            boxShadow: `0 4px 12px ${THEME.shadow}`
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <Row gutter={[16, 16]}>
            {[
              { key: '/users', icon: TeamOutlined, title: 'User Management', desc: 'Manage users & access', color: THEME.primary },
              { key: '/masters/oem', icon: DatabaseOutlined, title: 'Configuration Items', desc: 'CMDB management', color: THEME.success },
              { key: '/assets', icon: AppstoreOutlined, title: 'Asset Registry', desc: 'IT asset tracking', color: THEME.warning },
              { key: '/masters/locations', icon: GlobalOutlined, title: 'Location Management', desc: 'Site & facility data', color: THEME.purple },
              { key: '/departments', icon: BankOutlined, title: 'Service Catalog', desc: 'Department services', color: THEME.info },
              { key: '/settings', icon: SettingOutlined, title: 'System Settings', desc: 'Service configuration', color: THEME.gray }
            ].map(item => (
              <Col xs={12} sm={8} lg={4} key={item.key}>
                <Card 
                  hoverable
                  style={{ 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    boxShadow: `0 2px 8px ${THEME.shadow}`,
                    transition: 'all 0.2s ease',
                    height: '120px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = `0 8px 25px ${THEME.shadow}`
                    const icon = e.currentTarget.querySelector('.action-icon')
                    if (icon) {
                      icon.style.transform = 'scale(1.1)'
                      icon.style.background = `linear-gradient(135deg, ${item.color}30 0%, ${item.color}20 100%)`
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)'
                    e.currentTarget.style.boxShadow = `0 2px 8px ${THEME.shadow}`
                    const icon = e.currentTarget.querySelector('.action-icon')
                    if (icon) {
                      icon.style.transform = 'scale(1)'
                      icon.style.background = `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`
                    }
                  }}
                  onClick={() => navigate(item.key)}
                  bodyStyle={{ padding: '16px 12px' }}
                >
                  <div 
                    className="action-icon"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      border: `2px solid ${item.color}30`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <item.icon style={{ 
                      fontSize: '20px', 
                      color: item.color
                    }} />
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: 500, 
                    color: THEME.dark,
                    marginBottom: '4px'
                  }}>
                    {item.title}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: THEME.gray,
                    lineHeight: '1.2'
                  }}>
                    {item.desc}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Spin>
    </div>
  )
}

export default SuperAdminDashboard
