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
  Package,
  CheckCircle2,
  PackageOpen,
  Wrench,
  ClipboardList,
  AlertTriangle,
  MapPin,
  BarChart3,
  Activity,
  FileText,
  Zap,
  ShieldAlert,
  Calendar,
  Target
} from 'lucide-react'
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
    { title: 'Asset Inventory', icon: <Package size={18} />, path: '/assets/inventory', color: '#3b82f6', bgColor: 'bg-blue-50', hoverColor: 'hover:bg-blue-100' },
    { title: 'Requisitions', icon: <ClipboardList size={18} />, path: '/assets/inventory', color: '#10b981', bgColor: 'bg-green-50', hoverColor: 'hover:bg-green-100' },
    { title: 'Tickets', icon: <FileText size={18} />, path: '/tickets', color: '#f59e0b', bgColor: 'bg-orange-50', hoverColor: 'hover:bg-orange-100' },
    { title: 'Asset Reports', icon: <BarChart3 size={18} />, path: '/assets/inventory', color: '#8b5cf6', bgColor: 'bg-purple-50', hoverColor: 'hover:bg-purple-100' }
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
      warning: <AlertTriangle size={18} className="text-orange-500" />,
      info: <FileText size={18} className="text-blue-500" />,
      error: <ShieldAlert size={18} className="text-red-500" />
    }
    return icons[severity] || <AlertTriangle size={18} />
  }

  return (
    <div className="space-y-5">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200 -mx-6 -mt-6 px-6 py-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              {/* <div className="bg-blue-600 p-2.5 rounded-lg">
                <Target className="text-white" size={22} />
              </div> */}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Coordinator Dashboard</h1>
                <p className="text-sm text-gray-600 mt-0.5">Asset Operations & Lifecycle Management</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Last Updated</div>
            <div className="text-sm font-medium text-gray-900">{new Date().toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border border-gray-200 hover:border-blue-400 transition-colors" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Package className="text-blue-600" size={20} />
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">
              {statistics.loading ? '...' : (statistics.data?.totalAssets || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-3">Total Assets</div>
            <Progress
              percent={100}
              size="small"
              showInfo={false}
              strokeColor="#2563eb"
              trailColor="#e5e7eb"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="border border-gray-200 hover:border-green-400 transition-colors" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-50 p-2 rounded-lg">
                <CheckCircle2 className="text-green-600" size={20} />
              </div>
              <Tooltip title={`${((statistics.data?.assignedAssets / statistics.data?.totalAssets) * 100 || 0).toFixed(1)}% utilization rate`}>
                <div className="text-xs text-green-600 font-medium">
                  {((statistics.data?.assignedAssets / statistics.data?.totalAssets) * 100 || 0).toFixed(0)}%
                </div>
              </Tooltip>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">
              {statistics.loading ? '...' : (statistics.data?.assignedAssets || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-3">Assigned Assets</div>
            <Progress
              percent={((statistics.data?.assignedAssets / statistics.data?.totalAssets) * 100) || 0}
              size="small"
              showInfo={false}
              strokeColor="#16a34a"
              trailColor="#e5e7eb"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="border border-gray-200 hover:border-orange-400 transition-colors" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="bg-orange-50 p-2 rounded-lg">
                <PackageOpen className="text-orange-600" size={20} />
              </div>
              <div className="text-xs text-orange-600 font-medium">
                {((statistics.data?.availableAssets / statistics.data?.totalAssets) * 100 || 0).toFixed(0)}%
              </div>
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">
              {statistics.loading ? '...' : (statistics.data?.availableAssets || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-3">Available Assets</div>
            <Progress
              percent={((statistics.data?.availableAssets / statistics.data?.totalAssets) * 100) || 0}
              size="small"
              showInfo={false}
              strokeColor="#ea580c"
              trailColor="#e5e7eb"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="border border-gray-200 hover:border-red-400 transition-colors" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-50 p-2 rounded-lg">
                <Wrench className="text-red-600" size={20} />
              </div>
              {statistics.data?.underRepairAssets > 0 ? (
                <Badge status="error" text="Alert" />
              ) : (
                <Badge status="success" text="Normal" />
              )}
            </div>
            <div className="text-3xl font-semibold text-gray-900 mb-1">
              {statistics.loading ? '...' : (statistics.data?.underRepairAssets || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mb-3">Under Repair</div>
            <Progress
              percent={statistics.data?.underRepairAssets > 0 ? 100 : 0}
              size="small"
              showInfo={false}
              strokeColor={statistics.data?.underRepairAssets > 0 ? "#dc2626" : "#16a34a"}
              trailColor="#e5e7eb"
              status={statistics.data?.underRepairAssets > 0 ? "exception" : "success"}
            />
          </Card>
        </Col>
      </Row>

      {/* Overview Section */}
      <Row gutter={[16, 16]}>
        {/* Today's Activity */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-gray-700" />
                <span className="font-semibold">Today's Activity</span>
              </div>
            }
            className="border border-gray-200"
            style={{ height: '340px' }}
          >
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} className="text-blue-600" />
                    <span className="text-xs text-gray-500 uppercase">Tickets</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">{todaysTickets.length}</div>
                  <div className="text-xs text-gray-600 mt-1">New Today</div>
                </div>
              </Col>

              <Col span={12}>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-green-400 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={16} className="text-green-600" />
                    <span className="text-xs text-gray-500 uppercase">Assets</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">{statistics.data?.addedThisMonth || 0}</div>
                  <div className="text-xs text-gray-600 mt-1">Added This Month</div>
                </div>
              </Col>

              <Col span={12}>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-400 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-purple-600" />
                    <span className="text-xs text-gray-500 uppercase">Resolved</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {todaysTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Tickets Today</div>
                </div>
              </Col>

              <Col span={12}>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-orange-400 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert size={16} className="text-orange-600" />
                    <span className="text-xs text-gray-500 uppercase">Warranties</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {statistics.data?.warrantyExpiringSoon || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Expiring Soon</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-gray-700" />
                <span className="font-semibold">Quick Actions</span>
              </div>
            }
            className="border border-gray-200"
            style={{ height: '340px' }}
          >
            <Row gutter={[12, 12]}>
              {quickActions.map((action, index) => (
                <Col span={12} key={index}>
                  <Button
                    block
                    className="border border-gray-200 hover:border-blue-400 transition-colors"
                    style={{ height: '118px' }}
                    onClick={() => navigate(action.path)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div style={{ color: action.color }}>
                        {action.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{action.title}</span>
                    </div>
                  </Button>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Analytics Section */}
      <Row gutter={[16, 16]}>
        {/* Asset Distribution */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-gray-700" />
                  <span className="font-semibold">Asset Distribution by Location</span>
                </div>
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate('/assets')}
                >
                  View All
                </Button>
              </div>
            }
            loading={statistics.loading}
            className="border border-gray-200"
            style={{ height: '580px' }}
            bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'auto' }}
          >
            <LocationPieChart
              data={statistics.data?.locationDistribution || []}
              title="Total Assets"
            />
          </Card>
        </Col>

        {/* Ticket Analytics */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-gray-700" />
                  <span className="font-semibold">Ticket Status by Category</span>
                </div>
                <Button
                  type="link"
                  size="small"
                  onClick={() => navigate('/tickets')}
                >
                  View All
                </Button>
              </div>
            }
            loading={loading}
            className="border border-gray-200"
            style={{ height: '580px' }}
            bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'auto' }}
          >
            <TicketStatusByCategory data={ticketStatsByCategory} />
          </Card>
        </Col>
      </Row>

      {/* Today's Tickets */}
      <Card
        title={
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-700" />
              <span className="font-semibold">Today's Tickets</span>
              <Badge count={todaysTickets.length} showZero overflowCount={99} />
            </div>
            <Button
              type="primary"
              onClick={() => navigate('/tickets')}
            >
              View All Tickets
            </Button>
          </div>
        }
        loading={loading}
        className="border border-gray-200"
      >
        {todaysTickets.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No tickets created today"
          />
        ) : (
          <Table
            columns={todaysTicketsColumns}
            dataSource={todaysTickets}
            rowKey="ticket_id"
            pagination={{
              pageSize: 5,
              showTotal: (total) => `Total ${total} tickets`
            }}
            scroll={{ x: 1200 }}
          />
        )}
      </Card>
    </div>
  )
}

export default CoordinatorDashboard