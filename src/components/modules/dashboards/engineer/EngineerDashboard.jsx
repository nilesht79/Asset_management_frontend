import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  Space,
  Badge,
  Tooltip,
  Empty,
  Alert,
  Spin,
  Typography,
  Button
} from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  TruckOutlined,
  WarningOutlined,
  FireOutlined,
  RiseOutlined,
  FallOutlined,
  InboxOutlined,
  EnvironmentOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../../../services/api'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Line, Pie } from '@ant-design/charts'

dayjs.extend(relativeTime)

const { Text } = Typography

const EngineerDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/dashboard/engineer')
      if (response.data.success) {
        setDashboardData(response.data.data)
      }
    } catch (error) {
      console.error('Error loading engineer dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Empty description="Failed to load dashboard data" />
      </div>
    )
  }

  const { kpi, activeTickets, pendingDeliveries, pendingConsumableDeliveries, performance, workSummary } = dashboardData

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'red',
      emergency: 'red',
      high: 'orange',
      medium: 'blue',
      low: 'green'
    }
    return colors[priority] || 'default'
  }

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      open: 'blue',
      assigned: 'cyan',
      in_progress: 'geekblue',
      pending: 'orange',
      resolved: 'green',
      closed: 'default'
    }
    return colors[status] || 'default'
  }

  // Get SLA status indicator
  const getSlaIndicator = (ticket) => {
    if (!ticket.sla_status) {
      return <Badge status="default" text="No SLA" />
    }

    if (ticket.sla_status === 'breached') {
      return (
        <Tooltip title={`Breached ${Math.abs(ticket.time_remaining_minutes || 0)} minutes ago`}>
          <Badge status="error" text="Breached" />
        </Tooltip>
      )
    }

    if (ticket.sla_status === 'critical') {
      return (
        <Tooltip title={`Critical: ${ticket.time_remaining_minutes || 0} minutes remaining`}>
          <Badge status="error" text="Critical" />
        </Tooltip>
      )
    }

    if (ticket.sla_status === 'warning') {
      return (
        <Tooltip title={`Warning: ${ticket.time_remaining_minutes || 0} minutes remaining`}>
          <Badge status="warning" text="Warning" />
        </Tooltip>
      )
    }

    return (
      <Tooltip title="Within SLA target">
        <Badge status="success" text="On Track" />
      </Tooltip>
    )
  }

  // Tickets table columns
  const ticketColumns = [
    {
      title: 'Ticket',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      render: (text, record) => (
        <a onClick={() => navigate(`/tickets/${record.ticket_id}`)}>{text}</a>
      )
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>{priority?.toUpperCase()}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status?.replace('_', ' ').toUpperCase()}</Tag>
      )
    },
    {
      title: 'SLA',
      key: 'sla',
      render: (_, record) => getSlaIndicator(record)
    },
    {
      title: 'SLA Deadline',
      dataIndex: 'max_target_time',
      key: 'max_target_time',
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY HH:mm') : 'N/A'
    }
  ]

  // Deliveries table columns
  const deliveryColumns = [
    {
      title: 'Ticket',
      dataIndex: 'ticket_number',
      key: 'ticket_number'
    },
    {
      title: 'Asset',
      dataIndex: 'asset_tag',
      key: 'asset_tag'
    },
    {
      title: 'Recipient',
      dataIndex: 'user_name',
      key: 'user_name'
    },
    {
      title: 'Location',
      dataIndex: 'delivery_location_name',
      key: 'delivery_location_name',
      ellipsis: true
    },
    {
      title: 'Scheduled',
      dataIndex: 'scheduled_delivery_date',
      key: 'scheduled_delivery_date',
      render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'
    }
  ]

  // Chart data for resolution trend (Ant Design Charts format)
  const resolutionTrendData = performance.resolutionTrend.map(item => ({
    date: dayjs(item.date).format('MMM DD'),
    value: item.resolved_count
  }))

  const resolutionTrendConfig = {
    data: resolutionTrendData,
    xField: 'date',
    yField: 'value',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 4,
      shape: 'circle'
    }
  }

  // Chart data for priority distribution (Ant Design Charts format)
  const priorityDistributionData = performance.priorityDistribution.map(item => ({
    type: item.priority?.toUpperCase() || 'UNKNOWN',
    value: item.count
  }))

  const priorityDistributionConfig = {
    data: priorityDistributionData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'outer'
    },
    interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    legend: {
      position: 'bottom'
    },
    color: (item) => {
      const colors = {
        'CRITICAL': '#ff4d4f',
        'EMERGENCY': '#ff4d4f',
        'HIGH': '#fa8c16',
        'MEDIUM': '#1890ff',
        'LOW': '#52c41a'
      }
      return colors[item.type] || '#d9d9d9'
    }
  }

  // Format minutes to hours
  const formatMinutes = (minutes) => {
    if (!minutes) return '0h'
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Engineer Dashboard</h1>
        <Text type="secondary">Welcome back! Here's an overview of your tasks and performance.</Text>
      </div>

      {/* Alerts Section */}
      {(kpi.overdueTickets > 0 || kpi.slaAtRisk > 0) && (
        <Row gutter={[16, 16]} className="mb-4 sm:mb-6">
          <Col span={24}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {kpi.overdueTickets > 0 && (
                <Alert
                  message={`${kpi.overdueTickets} Overdue Ticket${kpi.overdueTickets > 1 ? 's' : ''}`}
                  description="You have tickets that have breached their SLA (exceeded max TAT). Please address them urgently."
                  type="error"
                  showIcon
                  icon={<FireOutlined />}
                />
              )}
              {kpi.slaAtRisk > 0 && (
                <Alert
                  message={`${kpi.slaAtRisk} Ticket${kpi.slaAtRisk > 1 ? 's' : ''} At Risk of SLA Breach`}
                  description="These tickets are in warning or critical zones (approaching max TAT). Immediate attention required."
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                />
              )}
            </Space>
          </Col>
        </Row>
      )}

      {/* KPI Cards */}
      <Row gutter={[12, 12]} className="mb-4 sm:mb-6" style={{ display: 'flex', flexWrap: 'wrap' }}>
        <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card hoverable onClick={() => navigate('/engineer/tickets')} style={{ flex: 1, minHeight: 120 }}>
            <Statistic
              title="My Active Tickets"
              value={kpi.activeTickets}
              prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card style={{ flex: 1, minHeight: 120 }}>
            <Statistic
              title="Resolved Today"
              value={kpi.todayCompleted}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card hoverable style={{ flex: 1, minHeight: 120, width: '100%' }}>
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>Pending Deliveries</Text>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Tooltip title="Asset Requisition Deliveries">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TruckOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: '#fa8c16', lineHeight: 1 }}>{kpi.pendingDeliveries}</div>
                      <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>Assets</div>
                    </div>
                  </div>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="Consumable Deliveries">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <InboxOutlined style={{ color: '#722ed1', fontSize: 20 }} />
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: '#722ed1', lineHeight: 1 }}>{kpi.pendingConsumableDeliveries || 0}</div>
                      <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>Consumables</div>
                    </div>
                  </div>
                </Tooltip>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6} style={{ display: 'flex' }}>
          <Card style={{ flex: 1, minHeight: 120, width: '100%' }}>
            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 14 }}>SLA Status</Text>
            </div>
            <Row gutter={16}>
              <Col span={12}>
                <Tooltip title="Tickets in warning or critical zones (approaching max TAT)">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <WarningOutlined style={{ color: '#faad14', fontSize: 20 }} />
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14', lineHeight: 1 }}>{kpi.slaAtRisk}</div>
                      <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>At Risk</div>
                    </div>
                  </div>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="Tickets that have breached their SLA (exceeded max TAT)">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: '#ff4d4f', lineHeight: 1 }}>{kpi.overdueTickets}</div>
                      <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>Overdue</div>
                    </div>
                  </div>
                </Tooltip>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[12, 12]}>
        {/* Left Column - Tickets and Deliveries */}
        <Col xs={24} lg={16}>
          {/* Active Tickets Table */}
          <Card
            title={<span className="text-sm sm:text-base">My Active Tickets</span>}
            extra={
              <Button
                type="link"
                onClick={() => navigate('/engineer/tickets')}
                className="text-xs sm:text-sm"
              >
                View All
              </Button>
            }
            className="mb-4"
          >
            <Table
              dataSource={activeTickets}
              columns={ticketColumns}
              rowKey="ticket_id"
              pagination={false}
              locale={{ emptyText: 'No active tickets' }}
              scroll={{ x: 800 }}
            />
          </Card>

          {/* Pending Deliveries Table */}
          <Card
            title={<span className="text-sm sm:text-base">Pending Asset Deliveries</span>}
            extra={
              <Button
                type="link"
                onClick={() => navigate('/deliveries/my-deliveries')}
                className="text-xs sm:text-sm"
              >
                View All
              </Button>
            }
            className="mb-4"
          >
            <Table
              dataSource={pendingDeliveries}
              columns={deliveryColumns}
              rowKey="ticket_id"
              pagination={false}
              locale={{ emptyText: 'No pending deliveries' }}
              scroll={{ x: 700 }}
            />
          </Card>

          {/* Pending Consumable Deliveries Table */}
          <Card
            title={<span className="text-sm sm:text-base">Pending Consumable Deliveries</span>}
            extra={
              <Button
                type="link"
                onClick={() => navigate('/consumables/requests')}
                className="text-xs sm:text-sm"
              >
                View All
              </Button>
            }
            className="mb-4"
          >
            <Table
              dataSource={pendingConsumableDeliveries || []}
              columns={[
                {
                  title: 'Request #',
                  dataIndex: 'request_number',
                  key: 'request_number',
                  width: 120
                },
                {
                  title: 'Consumable',
                  dataIndex: 'consumable_name',
                  key: 'consumable_name',
                  ellipsis: true
                },
                {
                  title: 'Qty',
                  dataIndex: 'quantity_requested',
                  key: 'quantity_requested',
                  width: 60,
                  align: 'center'
                },
                {
                  title: 'Requested For',
                  dataIndex: 'requested_for_name',
                  key: 'requested_for_name',
                  render: (text, record) => (
                    <Space direction="vertical" size={0}>
                      <span>{text}</span>
                      {record.location_name && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          <EnvironmentOutlined style={{ marginRight: 4 }} />
                          {record.location_name}
                        </Text>
                      )}
                    </Space>
                  )
                },
                {
                  title: 'Priority',
                  dataIndex: 'priority',
                  key: 'priority',
                  width: 80,
                  render: (priority) => (
                    <Tag color={getPriorityColor(priority)}>{priority?.toUpperCase()}</Tag>
                  )
                }
              ]}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: 'No pending consumable deliveries' }}
              scroll={{ x: 600 }}
            />
          </Card>

          {/* Resolution Trend Chart */}
          <Card
            title={<span className="text-sm sm:text-base">Ticket Resolution Trend (Last 7 Days)</span>}
            className="mb-4"
          >
            {performance.resolutionTrend.length > 0 ? (
              <Line {...resolutionTrendConfig} height={250} />
            ) : (
              <Empty description="No resolution data available" />
            )}
          </Card>
        </Col>

        {/* Right Column - Performance and Summary */}
        <Col xs={24} lg={8}>
          {/* SLA Compliance */}
          <Card
            title={<span className="text-sm sm:text-base">SLA Compliance Rate (Last 30 Days)</span>}
            className="mb-4"
          >
            <div className="text-center">
              <Progress
                type="circle"
                percent={Math.round(performance.slaCompliance.compliancePercentage)}
                strokeColor={
                  performance.slaCompliance.compliancePercentage >= 90
                    ? '#52c41a'
                    : performance.slaCompliance.compliancePercentage >= 70
                    ? '#faad14'
                    : '#ff4d4f'
                }
                format={(percent) => `${percent}%`}
              />
              <div className="mt-4">
                <Text type="secondary">
                  {performance.slaCompliance.withinSla} of {performance.slaCompliance.totalResolved} tickets resolved within SLA
                </Text>
              </div>
            </div>
          </Card>

          {/* Priority Distribution */}
          <Card
            title={<span className="text-sm sm:text-base">Active Tickets by Priority</span>}
            className="mb-4"
          >
            {performance.priorityDistribution.length > 0 ? (
              <Pie {...priorityDistributionConfig} height={300} />
            ) : (
              <Empty description="No ticket data available" />
            )}
          </Card>

          {/* Average Resolution Time */}
          <Card
            title={<span className="text-sm sm:text-base">Average Resolution Time (Last 30 Days)</span>}
            className="mb-4"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="Your Average"
                value={formatMinutes(performance.averageResolutionTime.avgMinutes)}
                prefix={<ClockCircleOutlined />}
              />
              <Statistic
                title="SLA Target"
                value={formatMinutes(performance.averageResolutionTime.avgSlaTargetMinutes)}
                valueStyle={{
                  color: performance.averageResolutionTime.avgMinutes <= performance.averageResolutionTime.avgSlaTargetMinutes
                    ? '#52c41a'
                    : '#ff4d4f'
                }}
                prefix={
                  performance.averageResolutionTime.avgMinutes <= performance.averageResolutionTime.avgSlaTargetMinutes
                    ? <RiseOutlined />
                    : <FallOutlined />
                }
              />
            </Space>
          </Card>

          {/* Work Summary */}
          <Card
            title={<span className="text-sm sm:text-base">Work Summary</span>}
            className="mb-4"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong className="text-sm sm:text-base">This Week</Text>
                <Row gutter={[8, 8]} className="mt-2">
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Tickets"
                      value={workSummary.thisWeek.ticketsResolved}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Asset Deliveries"
                      value={workSummary.thisWeek.assetDeliveries}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Consumables"
                      value={workSummary.thisWeek.consumableDeliveries}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                </Row>
              </div>
              <div>
                <Text strong className="text-sm sm:text-base">This Month</Text>
                <Row gutter={[8, 8]} className="mt-2">
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Tickets"
                      value={workSummary.thisMonth.ticketsResolved}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Asset Deliveries"
                      value={workSummary.thisMonth.assetDeliveries}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                  <Col xs={12} sm={8}>
                    <Statistic
                      title="Consumables"
                      value={workSummary.thisMonth.consumableDeliveries}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                </Row>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default EngineerDashboard
