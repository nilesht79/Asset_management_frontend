import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Tag,
  Progress,
  Space,
  Divider,
  Descriptions,
  Badge,
  Tooltip,
  Empty
} from 'antd'
import {
  ToolOutlined,
  ShoppingCartOutlined,
  CustomerServiceOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  RiseOutlined,
  FallOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAssetStatistics } from '../../../../store/slices/assetSlice'
import assetService from '../../../../services/asset'
import ticketService from '../../../../services/ticket'
import LocationPieChart from '../../../common/Charts/LocationPieChart'
import TicketStatusByCategory from '../../../common/Charts/TicketStatusByCategory'

const CoordinatorDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({})
  const [ticketStatsByCategory, setTicketStatsByCategory] = useState([])
  const [todaysTickets, setTodaysTickets] = useState([])
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { statistics } = useSelector(state => state.asset)

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Calculate ticket stats by category from tickets array
  const calculateTicketStatsByCategory = (tickets) => {
    const categoryMap = {}

    tickets.forEach(ticket => {
      const category = ticket.category || 'Other'

      if (!categoryMap[category]) {
        categoryMap[category] = {
          category,
          total_tickets: 0,
          open_tickets: 0,
          assigned_tickets: 0,
          in_progress_tickets: 0,
          pending_tickets: 0,
          resolved_tickets: 0,
          closed_tickets: 0,
          today_total: 0,
          today_open: 0,
          today_assigned: 0,
          today_in_progress: 0,
          today_resolved: 0,
          today_closed: 0
        }
      }

      const cat = categoryMap[category]
      cat.total_tickets++

      // Count by status
      if (ticket.status === 'open') cat.open_tickets++
      else if (ticket.status === 'assigned') cat.assigned_tickets++
      else if (ticket.status === 'in_progress') cat.in_progress_tickets++
      else if (ticket.status === 'pending') cat.pending_tickets++
      else if (ticket.status === 'resolved') cat.resolved_tickets++
      else if (ticket.status === 'closed') cat.closed_tickets++

      // Check if created today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const ticketDate = new Date(ticket.created_at)
      ticketDate.setHours(0, 0, 0, 0)

      if (ticketDate.getTime() === today.getTime()) {
        cat.today_total++
        if (ticket.status === 'open') cat.today_open++
        else if (ticket.status === 'assigned') cat.today_assigned++
        else if (ticket.status === 'in_progress') cat.today_in_progress++
        else if (ticket.status === 'resolved') cat.today_resolved++
        else if (ticket.status === 'closed') cat.today_closed++
      }
    })

    return Object.values(categoryMap).sort((a, b) => b.total_tickets - a.total_tickets)
  }

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch asset statistics (already includes location distribution)
      await dispatch(fetchAssetStatistics())

      // Fetch all tickets and calculate stats by category on frontend
      const allTicketsResponse = await ticketService.getTickets({ limit: 10000 })
      const allTickets = allTicketsResponse.data?.data?.tickets || []

      // Calculate ticket stats by category
      const categoryStats = calculateTicketStatsByCategory(allTickets)
      setTicketStatsByCategory(categoryStats)

      // Filter today's tickets
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayTickets = allTickets.filter(ticket => {
        const ticketDate = new Date(ticket.created_at)
        ticketDate.setHours(0, 0, 0, 0)
        return ticketDate.getTime() === today.getTime()
      })

      setTodaysTickets(todayTickets)

      // Keep existing mock data for other sections
      setDashboardData({
        assetStats: {
          managedAssets: 420,
          assignedAssets: 380,
          availableAssets: 40,
          underMaintenance: 15,
          utilizationRate: 90,
          overdueReturns: 8
        },
        requisitionStats: {
          pendingApprovals: 12,
          approved: 35,
          fulfilled: 28,
          rejected: 3
        },
        ticketStats: {
          assignedToMe: 18,
          inProgress: 12,
          completed: 45,
          overdue: 3
        },
        assetCategories: [
          { category: 'Laptops', assigned: 180, available: 20, maintenance: 5 },
          { category: 'Desktops', assigned: 120, available: 15, maintenance: 3 },
          { category: 'Mobile Devices', assigned: 80, available: 5, maintenance: 7 }
        ],
        recentAssignments: [
          { id: 1, asset: 'MacBook Pro 16"', user: 'John Smith', date: '2024-01-20', status: 'assigned' },
          { id: 2, asset: 'Dell Laptop', user: 'Sarah Wilson', date: '2024-01-19', status: 'pending' },
          { id: 3, asset: 'iPhone 15', user: 'Mike Johnson', date: '2024-01-19', status: 'assigned' }
        ],
        alerts: [
          { id: 1, message: 'Asset EOL approaching for 15 devices', severity: 'warning', time: '1 hour ago' },
          { id: 2, message: 'Monthly asset verification due', severity: 'info', time: '2 hours ago' },
          { id: 3, message: 'Asset return overdue: HP Laptop #HP-2023-001', severity: 'error', time: '3 hours ago' }
        ]
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    { title: 'Asset Inventory', icon: <ToolOutlined />, path: '/assets/inventory', color: 'blue' },
    { title: 'Requisitions', icon: <ShoppingCartOutlined />, path: '/assets/inventory', color: 'green' },
    { title: 'Tickets', icon: <CustomerServiceOutlined />, path: '/tickets', color: 'orange' },
    { title: 'Asset Reports', icon: <BarChartOutlined />, path: '/assets/inventory', color: 'purple' }
  ]

  const assignmentColumns = [
    {
      title: 'Asset',
      dataIndex: 'asset',
      key: 'asset'
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user'
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = { assigned: 'green', pending: 'orange', returned: 'blue' }
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>
      }
    }
  ]

  const categoryColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Assigned',
      dataIndex: 'assigned',
      key: 'assigned',
      align: 'center'
    },
    {
      title: 'Available',
      dataIndex: 'available',
      key: 'available',
      align: 'center'
    },
    {
      title: 'Maintenance',
      dataIndex: 'maintenance',
      key: 'maintenance',
      align: 'center',
      render: (count) => <Tag color={count > 0 ? 'orange' : 'green'}>{count}</Tag>
    }
  ]

  const todaysTicketsColumns = [
    {
      title: 'Ticket #',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      width: 130,
      render: (text) => <span className="font-mono font-semibold text-blue-600">{text}</span>
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 250
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => {
        const colors = {
          low: 'green',
          medium: 'blue',
          high: 'orange',
          critical: 'red',
          emergency: 'red'
        }
        return <Tag color={colors[priority]}>{priority?.toUpperCase()}</Tag>
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const colors = {
          open: 'blue',
          assigned: 'orange',
          in_progress: 'purple',
          resolved: 'green',
          closed: 'default'
        }
        return <Tag color={colors[status]}>{status?.replace('_', ' ').toUpperCase()}</Tag>
      }
    },
    {
      title: 'Created For',
      dataIndex: 'created_by_user_name',
      key: 'created_by_user_name',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Assigned To',
      dataIndex: 'engineer_name',
      key: 'engineer_name',
      width: 150,
      ellipsis: true,
      render: (name) => name || <Tag color="default">Unassigned</Tag>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120
    }
  ]

  const getAlertIcon = (severity) => {
    const icons = {
      warning: <AlertOutlined className="text-orange-500" />,
      info: <FileTextOutlined className="text-blue-500" />,
      error: <AlertOutlined className="text-red-500" />
    }
    return icons[severity] || <AlertOutlined />
  }

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Coordinator Dashboard</h1>
            <p className="text-blue-100 text-sm mt-1">Asset allocation and lifecycle management overview</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-200">Last Updated</div>
            <div className="text-sm font-semibold">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics - Compact Grid with Progress */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} lg={6}>
          <Badge.Ribbon text="Active" color="blue">
            <Card size="small" className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="text-xs">Total Assets</span>}
                value={statistics.data?.totalAssets || 0}
                prefix={<ToolOutlined className="text-blue-500" />}
                loading={statistics.loading}
                valueStyle={{ fontSize: '24px' }}
              />
              <Progress
                percent={100}
                size="small"
                showInfo={false}
                strokeColor="#3b82f6"
                className="mt-2"
              />
            </Card>
          </Badge.Ribbon>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Tooltip title={`${((statistics.data?.assignedAssets / statistics.data?.totalAssets) * 100 || 0).toFixed(1)}% Utilization Rate`}>
            <Card size="small" className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="text-xs">Assigned</span>}
                value={statistics.data?.assignedAssets || 0}
                prefix={<CheckCircleOutlined className="text-green-500" />}
                loading={statistics.loading}
                valueStyle={{ fontSize: '24px' }}
                suffix={
                  <span className="text-xs text-gray-400">
                    /{statistics.data?.totalAssets || 0}
                  </span>
                }
              />
              <Progress
                percent={((statistics.data?.assignedAssets / statistics.data?.totalAssets) * 100) || 0}
                size="small"
                showInfo={false}
                strokeColor="#22c55e"
                className="mt-2"
              />
            </Card>
          </Tooltip>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-xs">Available</span>}
              value={statistics.data?.availableAssets || 0}
              prefix={<ShoppingCartOutlined className="text-orange-500" />}
              loading={statistics.loading}
              valueStyle={{ fontSize: '24px' }}
            />
            <Progress
              percent={((statistics.data?.availableAssets / statistics.data?.totalAssets) * 100) || 0}
              size="small"
              showInfo={false}
              strokeColor="#f97316"
              className="mt-2"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Badge.Ribbon text={statistics.data?.underRepairAssets > 0 ? "Alert" : "Good"} color={statistics.data?.underRepairAssets > 0 ? "red" : "green"}>
            <Card size="small" className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
              <Statistic
                title={<span className="text-xs">Under Repair</span>}
                value={statistics.data?.underRepairAssets || 0}
                prefix={<AlertOutlined className="text-red-500" />}
                loading={statistics.loading}
                valueStyle={{ fontSize: '24px' }}
              />
              <Progress
                percent={statistics.data?.underRepairAssets > 0 ? 100 : 0}
                size="small"
                showInfo={false}
                strokeColor="#ef4444"
                status={statistics.data?.underRepairAssets > 0 ? "exception" : "success"}
                className="mt-2"
              />
            </Card>
          </Badge.Ribbon>
        </Col>
      </Row>

      <Divider orientation="left" className="text-gray-600">Quick Overview</Divider>

      {/* Quick Insights - Two Column Layout */}
      <Row gutter={[12, 12]}>
        {/* Today's Activity */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={<span className="text-sm font-semibold">📊 Today's Activity</span>}
            className="shadow-sm"
          >
            <Space direction="vertical" size="small" className="w-full">
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <Tooltip title="Tickets created today">
                    <div className="text-center p-2 bg-blue-50 rounded border border-blue-200 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="text-xl font-bold text-blue-600">{todaysTickets.length}</div>
                      <div className="text-xs text-gray-600">New Tickets</div>
                    </div>
                  </Tooltip>
                </Col>
                <Col span={12}>
                  <Tooltip title="Assets added this month">
                    <div className="text-center p-2 bg-green-50 rounded border border-green-200 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="text-xl font-bold text-green-600">{statistics.data?.addedThisMonth || 0}</div>
                      <div className="text-xs text-gray-600">Assets</div>
                    </div>
                  </Tooltip>
                </Col>
                <Col span={12}>
                  <Tooltip title="Tickets resolved today">
                    <div className="text-center p-2 bg-purple-50 rounded border border-purple-200 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="text-xl font-bold text-purple-600">
                        {todaysTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
                      </div>
                      <div className="text-xs text-gray-600">Resolved</div>
                    </div>
                  </Tooltip>
                </Col>
                <Col span={12}>
                  <Tooltip title="Assets with expiring warranties">
                    <div className="text-center p-2 bg-orange-50 rounded border border-orange-200 hover:shadow-sm transition-shadow cursor-pointer">
                      <div className="text-xl font-bold text-orange-600">
                        {statistics.data?.warrantyExpiringSoon || 0}
                      </div>
                      <div className="text-xs text-gray-600">Warranty Alerts</div>
                    </div>
                  </Tooltip>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={<span className="text-sm font-semibold">⚡ Quick Actions</span>}
            className="shadow-sm"
          >
            <Space direction="vertical" size="small" className="w-full">
              <Row gutter={[8, 8]}>
                {quickActions.map((action, index) => (
                  <Col span={12} key={index}>
                    <Tooltip title={`Navigate to ${action.title}`} placement="top">
                      <Button
                        block
                        size="small"
                        className="h-12 flex items-center justify-center hover:scale-105 transition-transform"
                        onClick={() => navigate(action.path)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`text-${action.color}-500`}>{action.icon}</span>
                          <span className="text-xs font-medium">{action.title}</span>
                        </div>
                      </Button>
                    </Tooltip>
                  </Col>
                ))}
              </Row>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider orientation="left" className="text-gray-600">Detailed Analytics</Divider>

      {/* Main Content - Two Column Layout */}
      <Row gutter={[12, 12]}>
        {/* Left Column */}
        <Col xs={24} lg={12}>
          {/* Asset Distribution by Location */}
          <Card
            size="small"
            title={
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">📍 Asset Distribution by Location</span>
                <Button
                  type="link"
                  size="small"
                  icon={<EnvironmentOutlined />}
                  onClick={() => navigate('/assets')}
                >
                  Details
                </Button>
              </div>
            }
            loading={statistics.loading}
            className="shadow-sm"
            style={{ minHeight: '420px' }}
          >
            <LocationPieChart
              data={statistics.data?.locationDistribution || []}
              title="Total Assets"
            />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={12}>
          {/* Ticket Status by Category */}
          <Card
            size="small"
            title={
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">🎫 Ticket Status by Category</span>
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate('/tickets')}
                >
                  All Tickets
                </Button>
              </div>
            }
            loading={loading}
            className="shadow-sm"
            style={{ minHeight: '420px', maxHeight: '420px', overflow: 'auto' }}
          >
            <TicketStatusByCategory data={ticketStatsByCategory} />
          </Card>
        </Col>
      </Row>

      <Divider orientation="left" className="text-gray-600">Recent Activity</Divider>

      {/* Today's Tickets - Full Width */}
      <Card
        size="small"
        title={
          <div className="flex items-center justify-between">
            <Space>
              <span className="text-sm font-semibold">📋 Today's Tickets</span>
              <Badge count={todaysTickets.length} showZero overflowCount={99} style={{ backgroundColor: '#1890ff' }} />
            </Space>
            <Button
              type="primary"
              size="small"
              onClick={() => navigate('/tickets')}
            >
              View All Tickets
            </Button>
          </div>
        }
        loading={loading}
        className="shadow-sm"
      >
        {todaysTickets.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No tickets created today"
            className="py-8"
          />
        ) : (
          <Table
            columns={todaysTicketsColumns}
            dataSource={todaysTickets}
            rowKey="ticket_id"
            pagination={{ pageSize: 5, size: 'small' }}
            size="small"
            scroll={{ x: 1200 }}
          />
        )}
      </Card>
    </div>
  )
}

export default CoordinatorDashboard