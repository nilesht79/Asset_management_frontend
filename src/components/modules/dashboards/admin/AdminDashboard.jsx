import { useState, useEffect, useRef } from 'react'
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
import FaultTrendsWidget from '../widgets/FaultTrendsWidget'

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
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const standbyStatistics = useSelector(selectStandbyStatistics)
  const chartRef = useRef(null)

  useEffect(() => {
    loadDashboardData()
    dispatch(fetchStandbyStatistics())
  }, [])

  // Resize chart after loading completes
  useEffect(() => {
    if (!loading && chartRef.current) {
      const chart = chartRef.current.getEchartsInstance()
      if (chart) {
        setTimeout(() => chart.resize(), 100)
      }
    }
  }, [loading])

  const loadDashboardData = async () => {
    setLoading(true)

    try {
      const dashboardResponse = await dashboardService.getAdminDashboard()
      setDashboardData(dashboardResponse.data.data)
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
      grid: { left: 50, right: 30, bottom: 60, top: 40, containLabel: true },
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
                title={<span style={{ fontSize: '14px', fontWeight: 500, color: THEME.dark }}>Total Products</span>}
                value={dashboardData.masterDataStats?.products?.total || 0}
                prefix={<ToolOutlined style={{ color: THEME.purple, fontSize: '20px' }} />}
                valueStyle={{ color: THEME.purple, fontSize: '28px', fontWeight: 600 }}
              />
              <div style={{ marginTop: '16px' }}>
                <Text style={{ fontSize: '12px', color: THEME.success, fontWeight: 500 }}>
                  {dashboardData.masterDataStats?.products?.active || 0} Active
                </Text>
                <Text style={{ fontSize: '12px', color: THEME.gray, display: 'block', marginTop: '4px' }}>
                  Product catalog
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

        {/* Fault Analysis Widget */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col span={24}>
            <FaultTrendsWidget compact={false} />
          </Col>
        </Row>

        {/* Analytics Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          {/* Master Data Overview Chart */}
          <Col span={24}>
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
                ref={chartRef}
                option={getMasterDataOverviewConfig()}
                style={{ height: '350px' }}
                notMerge={true}
                lazyUpdate={true}
              />
            </Card>
          </Col>
        </Row>

      </Spin>
    </div>
  )
}

export default AdminDashboard