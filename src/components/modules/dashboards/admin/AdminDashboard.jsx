import { useState, useEffect } from 'react'
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
  Badge,
  Tag,
  Progress,
  Divider
} from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  AlertOutlined,
  DatabaseOutlined,
  AppstoreOutlined,
  BankOutlined,
  BarChartOutlined,
  PieChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  ToolOutlined,
  RiseOutlined,
  SwapOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ReactECharts from 'echarts-for-react'
import dashboardService from '../../../../services/dashboard'
import { fetchStandbyStatistics, selectStandbyStatistics } from '../../../../store/slices/standbySlice'

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

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    masterStats: {},
    masterDataStats: {},
    departmentOverview: []
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [pendingApprovals, setPendingApprovals] = useState([])
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const standbyStatistics = useSelector(selectStandbyStatistics)

  useEffect(() => {
    loadDashboardData()
    dispatch(fetchStandbyStatistics())
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    
    try {
      const [dashboardResponse, activitiesResponse, approvalsResponse] = await Promise.all([
        dashboardService.getAdminDashboard(),
        dashboardService.getRecentActivities({ limit: 8 }),
        dashboardService.getPendingApprovals({ limit: 5 })
      ])

      setDashboardData(dashboardResponse.data.data)
      setRecentActivities(activitiesResponse.data.data)
      setPendingApprovals(approvalsResponse.data.data)
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
        total: dashboardData.masterDataStats?.oems?.total || 0,
        active: dashboardData.masterDataStats?.oems?.active || 0,
        myManaged: dashboardData.masterDataStats?.oems?.myManaged || 0
      },
      {
        name: 'Categories',
        total: dashboardData.masterDataStats?.categories?.total || 0,
        active: dashboardData.masterDataStats?.categories?.active || 0,
        myManaged: dashboardData.masterDataStats?.categories?.myCreated || 0
      },
      {
        name: 'Products',
        total: dashboardData.masterDataStats?.products?.total || 0,
        active: dashboardData.masterDataStats?.products?.active || 0,
        myManaged: dashboardData.masterDataStats?.products?.myManaged || 0
      },
      {
        name: 'Locations',
        total: dashboardData.masterDataStats?.locations?.total || 0,
        active: dashboardData.masterDataStats?.locations?.active || 0,
        myManaged: dashboardData.masterDataStats?.locations?.myAssigned || 0
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
        data: ['Total Records', 'Active Records', 'My Managed'],
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
        axisLine: { lineStyle: { color: THEME.border } },
        axisTick: { lineStyle: { color: THEME.border } },
        axisLabel: { color: THEME.gray, fontSize: 11 },
        splitLine: { lineStyle: { color: THEME.border, type: 'dashed' } }
      },
      series: [
        {
          name: 'Total Records',
          type: 'bar',
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
          name: 'My Managed',
          type: 'bar',
          data: data.map(item => item.myManaged),
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
        }
      ]
    }
  }

  const getDepartmentDistributionConfig = () => {
    const data = dashboardData.departmentOverview?.map(dept => ({
      name: dept.name,
      value: dept.users,
      itemStyle: { color: dept.status === 'active' ? THEME.success : THEME.gray }
    })) || []

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} users ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: THEME.border,
        borderWidth: 1,
        textStyle: { color: THEME.dark }
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: THEME.gray, fontSize: 12 }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: false
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

  const userEngagementRate = dashboardData.masterStats?.totalUsers ? Math.round((dashboardData.masterStats?.activeUsers / dashboardData.masterStats?.totalUsers) * 100) : 0


  return (
    <div style={{ 
      padding: '24px', 
      background: `linear-gradient(135deg, ${THEME.light} 0%, #ffffff 100%)`,
      minHeight: '100vh'
    }}>
      <Spin spinning={loading} size="large">
        {/* Admin Dashboard Header */}
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
                <UserOutlined style={{ marginRight: '12px', color: THEME.primary }} />
                Admin Dashboard
              </Title>
              <Text style={{ 
                fontSize: '14px', 
                color: THEME.gray, 
                marginTop: '4px', 
                display: 'block'
              }}>
                Master Data Management & User Administration
              </Text>
            </Col>
            <Col>
              <div style={{ textAlign: 'right' }}>
                <Badge 
                  status="success" 
                  text={
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>
                      System: Online
                    </span>
                  }
                />
                <div style={{ fontSize: '12px', color: THEME.gray, marginTop: '4px' }}>
                  Last updated: {new Date().toLocaleString()}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Key Metrics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card style={{ 
              borderRadius: '16px', 
              border: 'none',
              boxShadow: `0 8px 25px ${THEME.shadow}`,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}>
              <Statistic
                title={<span style={{ fontSize: '14px', fontWeight: 500, color: THEME.dark }}>Active Users</span>}
                value={dashboardData.masterStats?.activeUsers || 0}
                prefix={<UserOutlined style={{ color: THEME.primary, fontSize: '20px' }} />}
                valueStyle={{ color: THEME.primary, fontSize: '28px', fontWeight: 600 }}
                suffix={`/${dashboardData.masterStats?.totalUsers || 0}`}
              />
              <div style={{ marginTop: '16px' }}>
                <Progress
                  percent={userEngagementRate}
                  strokeColor={{
                    '0%': THEME.primary,
                    '100%': THEME.success,
                  }}
                  trailColor={`${THEME.border}`}
                  size={8}
                  showInfo={false}
                />
                <Text style={{ fontSize: '12px', color: THEME.gray, marginTop: '8px' }}>
                  {userEngagementRate}% engagement rate
                </Text>
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
              <Statistic
                title={<span style={{ fontSize: '14px', fontWeight: 500, color: THEME.dark }}>Departments</span>}
                value={dashboardData.masterStats?.managedDepartments || 0}
                prefix={<TeamOutlined style={{ color: THEME.success, fontSize: '20px' }} />}
                valueStyle={{ color: THEME.success, fontSize: '28px', fontWeight: 600 }}
              />
              <div style={{ marginTop: '16px' }}>
                <Tag color={THEME.success} style={{ fontSize: '12px', fontWeight: 500 }}>
                  Active Management
                </Tag>
                <Text style={{ fontSize: '12px', color: THEME.gray, display: 'block', marginTop: '8px' }}>
                  Organizational units
                </Text>
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
              <Statistic
                title={<span style={{ fontSize: '14px', fontWeight: 500, color: THEME.dark }}>Total Locations</span>}
                value={dashboardData.masterStats?.totalLocations || 0}
                prefix={<GlobalOutlined style={{ color: THEME.warning, fontSize: '20px' }} />}
                valueStyle={{ color: THEME.warning, fontSize: '28px', fontWeight: 600 }}
              />
              <div style={{ marginTop: '16px' }}>
                <Text style={{ fontSize: '12px', color: THEME.success, fontWeight: 500 }}>
                  {dashboardData.masterStats?.activeLocations || 0} Active
                </Text>
                <Text style={{ fontSize: '12px', color: THEME.gray, display: 'block', marginTop: '4px' }}>
                  Physical sites
                </Text>
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
              <Statistic
                title={<span style={{ fontSize: '14px', fontWeight: 500, color: THEME.dark }}>Pending Approvals</span>}
                value={pendingApprovals?.length || 0}
                prefix={<AlertOutlined style={{ color: THEME.danger, fontSize: '20px' }} />}
                valueStyle={{ color: THEME.danger, fontSize: '28px', fontWeight: 600 }}
              />
              <div style={{ marginTop: '16px' }}>
                <Badge status="processing" text="Requires Action" />
                <Text style={{ fontSize: '12px', color: THEME.gray, display: 'block', marginTop: '4px' }}>
                  User registrations
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Standby Assets Statistics */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col span={24}>
            <Card
              title={
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: `1px solid ${THEME.border}`
                }}>
                  <SwapOutlined style={{ marginRight: '8px', color: THEME.info, fontSize: '16px' }} />
                  <span style={{ fontSize: '16px', fontWeight: 600, color: THEME.dark }}>
                    Standby Assets Pool
                  </span>
                  <Tag
                    color={THEME.info}
                    style={{ fontSize: '11px', fontWeight: 500, marginLeft: '12px' }}
                    onClick={() => navigate('/standby/pool')}
                  >
                    VIEW ALL
                  </Tag>
                </div>
              }
              style={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: `0 4px 12px ${THEME.shadow}`
              }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ textAlign: 'center', padding: '12px' }}>
                    <Statistic
                      title={<span style={{ fontSize: '13px', color: THEME.gray }}>Total Pool</span>}
                      value={standbyStatistics.total || 0}
                      valueStyle={{ color: THEME.info, fontSize: '32px', fontWeight: 600 }}
                      prefix={<SwapOutlined />}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ textAlign: 'center', padding: '12px' }}>
                    <Statistic
                      title={<span style={{ fontSize: '13px', color: THEME.gray }}>Available</span>}
                      value={standbyStatistics.available || 0}
                      valueStyle={{ color: THEME.success, fontSize: '32px', fontWeight: 600 }}
                      prefix={<CheckCircleOutlined />}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ textAlign: 'center', padding: '12px' }}>
                    <Statistic
                      title={<span style={{ fontSize: '13px', color: THEME.gray }}>Assigned</span>}
                      value={standbyStatistics.assigned || 0}
                      valueStyle={{ color: THEME.warning, fontSize: '32px', fontWeight: 600 }}
                      prefix={<ClockCircleOutlined />}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <div style={{ textAlign: 'center', padding: '12px' }}>
                    <Statistic
                      title={<span style={{ fontSize: '13px', color: THEME.gray }}>Under Repair</span>}
                      value={standbyStatistics.under_repair || 0}
                      valueStyle={{ color: THEME.danger, fontSize: '32px', fontWeight: 600 }}
                      prefix={<ToolOutlined />}
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Analytics Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          {/* Master Data Overview Chart */}
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
                      Master Data Overview
                    </span>
                  </div>
                  <Tag color={THEME.primary} style={{ fontSize: '11px', fontWeight: 500 }}>
                    ADMIN VIEW
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
              <ReactECharts 
                option={getMasterDataOverviewConfig()} 
                style={{ height: '350px', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
            </Card>
          </Col>

          {/* Department Distribution */}
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
                    Department Users
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
              <ReactECharts 
                option={getDepartmentDistributionConfig()} 
                style={{ height: '280px', width: '100%' }}
                opts={{ renderer: 'svg' }}
              />
              <Divider style={{ margin: '16px 0' }} />
              <div style={{ textAlign: 'center' }}>
                <Statistic
                  title="Total Users"
                  value={dashboardData.masterStats?.totalUsers || 0}
                  valueStyle={{ color: THEME.primary, fontSize: '20px', fontWeight: 600 }}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Activities and Tasks */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          {/* Recent Activities */}
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
                    <RiseOutlined style={{ marginRight: '8px', color: THEME.primary, fontSize: '16px' }} />
                    <span style={{ fontSize: '16px', fontWeight: 600, color: THEME.dark }}>
                      Recent Activities
                    </span>
                  </div>
                  <Badge status="processing" text="Live" style={{ fontSize: '11px', fontWeight: 500 }} />
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
                  style={{ maxHeight: '300px', overflow: 'auto' }}
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

          {/* Pending Approvals */}
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
                    <AlertOutlined style={{ marginRight: '8px', color: THEME.primary, fontSize: '16px' }} />
                    <span style={{ fontSize: '16px', fontWeight: 600, color: THEME.dark }}>
                      Pending Approvals
                    </span>
                  </div>
                  <Badge count={pendingApprovals?.length || 0} showZero />
                </div>
              }
              style={{ 
                borderRadius: '12px', 
                border: 'none',
                boxShadow: `0 4px 12px ${THEME.shadow}`
              }}
              bodyStyle={{ padding: '0' }}
            >
              {pendingApprovals && pendingApprovals.length > 0 ? (
                <List
                  dataSource={pendingApprovals}
                  style={{ maxHeight: '300px', overflow: 'auto' }}
                  renderItem={(approval, index) => (
                    <List.Item style={{ 
                      padding: '16px 20px', 
                      borderBottom: index < pendingApprovals.length - 1 ? `1px solid ${THEME.border}` : 'none'
                    }}>
                      <List.Item.Meta
                        avatar={
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${THEME.warning}20 0%, ${THEME.warning}10 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            color: THEME.warning,
                            border: `2px solid ${THEME.warning}30`
                          }}>
                            <UserOutlined />
                          </div>
                        }
                        title={
                          <div>
                            <Text strong style={{ fontSize: '14px', color: THEME.dark }}>
                              {approval.type}
                            </Text>
                            <Tag 
                              color={approval.priority === 'high' ? 'red' : approval.priority === 'medium' ? 'orange' : 'blue'}
                              size="small"
                              style={{ marginLeft: '8px', fontSize: '10px' }}
                            >
                              {approval.priority?.toUpperCase()}
                            </Tag>
                          </div>
                        }
                        description={
                          <div>
                            <div style={{ fontSize: '13px', color: THEME.gray, marginBottom: '4px' }}>
                              {approval.item}
                            </div>
                            <Text style={{ fontSize: '11px', color: THEME.gray }}>
                              {approval.date}
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
                        No pending approvals
                      </span>
                    }
                  />
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
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
                Admin Actions
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
              { key: '/users', icon: UserOutlined, title: 'User Management', desc: 'Manage users & access', color: THEME.primary },
              { key: '/masters/oem', icon: DatabaseOutlined, title: 'Master Data', desc: 'OEMs, Categories, Products', color: THEME.success },
              { key: '/masters/locations', icon: GlobalOutlined, title: 'Locations', desc: 'Site & facility data', color: THEME.warning },
              { key: '/departments', icon: TeamOutlined, title: 'Departments', desc: 'Department management', color: THEME.purple },
              { key: '/admin/reports', icon: BarChartOutlined, title: 'Reports', desc: 'Analytics & insights', color: THEME.info },
              { key: '/admin/settings', icon: DatabaseOutlined, title: 'Settings', desc: 'System configuration', color: THEME.gray }
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
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)'
                    e.currentTarget.style.boxShadow = `0 2px 8px ${THEME.shadow}`
                  }}
                  onClick={() => navigate(item.key)}
                  bodyStyle={{ padding: '16px 12px' }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    border: `2px solid ${item.color}30`,
                  }}>
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

export default AdminDashboard