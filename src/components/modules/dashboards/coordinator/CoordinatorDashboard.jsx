import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Progress,
  Badge,
  Tooltip,
  Empty,
  Spin,
  Alert,
  Divider
} from 'antd'
import {
  Package,
  ClipboardList,
  AlertTriangle,
  MapPin,
  BarChart3,
  FileText,
  Target,
  Truck,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Zap,
  Shield,
  PackageCheck,
  CheckCircle,
  XCircle,
  Timer,
  Boxes,
  Wrench,
  CalendarClock,
  ArrowRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import dashboardService from '../../../../services/dashboard'
import LocationPieChart from '../../../common/Charts/LocationPieChart'
import TicketStatusByCategory from '../../../common/Charts/TicketStatusByCategory'
import FaultTrendsWidget from '../widgets/FaultTrendsWidget'

const CoordinatorDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [dashboardData, setDashboardData] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    try {
      const response = await dashboardService.getCoordinatorDashboard()
      if (response.data?.success) {
        setDashboardData(response.data.data)
        setLastUpdated(new Date())
      }
    } catch (err) {
      console.error('Error loading coordinator dashboard:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadDashboardData(true)
  }

  // Enhanced table columns with better styling
  const pendingActionsColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const config = {
          requisition: { color: 'blue', label: 'Requisition', icon: <ClipboardList size={12} /> },
          ticket: { color: 'orange', label: 'Ticket', icon: <FileText size={12} /> },
          delivery: { color: 'purple', label: 'Delivery', icon: <Truck size={12} /> }
        }
        return (
          <Tag
            color={config[type]?.color}
            className="flex items-center gap-1 w-fit"
            icon={config[type]?.icon}
          >
            {config[type]?.label || type}
          </Tag>
        )
      }
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
      width: 140,
      render: (text) => (
        <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
          {text}
        </span>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span className="text-gray-700">{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => {
        const config = {
          urgent: { color: 'red', bg: 'bg-red-50' },
          high: { color: 'orange', bg: 'bg-orange-50' },
          normal: { color: 'blue', bg: 'bg-blue-50' },
          low: { color: 'default', bg: 'bg-gray-50' }
        }
        return (
          <Tag color={config[priority]?.color} className="font-medium">
            {priority?.toUpperCase()}
          </Tag>
        )
      }
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => {
        const paths = {
          requisition: '/assignments/asset-assignment',
          ticket: '/tickets',
          delivery: '/deliveries/management'
        }
        return (
          <Button
            type="primary"
            size="small"
            ghost
            className="flex items-center gap-1"
            onClick={() => navigate(paths[record.type])}
          >
            View <ArrowRight size={12} />
          </Button>
        )
      }
    }
  ]

  const engineerWorkloadColumns = [
    {
      title: 'Engineer',
      dataIndex: 'engineer_name',
      key: 'engineer_name',
      render: (name) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <Users size={14} className="text-gray-500" />
          </div>
          <span className="font-medium text-gray-800">{name}</span>
        </div>
      )
    },
    {
      title: 'Active Tickets',
      dataIndex: 'active_tickets',
      key: 'active_tickets',
      align: 'center',
      width: 130,
      render: (count) => {
        const color = count > 5 ? '#f5222d' : count > 2 ? '#faad14' : '#52c41a'
        return (
          <div className="flex flex-col items-center gap-1">
            <Badge count={count} showZero style={{ backgroundColor: color }} />
            <Progress
              percent={Math.min((count / 10) * 100, 100)}
              size="small"
              showInfo={false}
              strokeColor={color}
              className="w-16"
            />
          </div>
        )
      }
    },
    {
      title: 'Pending Deliveries',
      dataIndex: 'pending_deliveries',
      key: 'pending_deliveries',
      align: 'center',
      width: 140,
      render: (count) => (
        <div className="flex items-center justify-center gap-1">
          <Truck size={14} className="text-purple-500" />
          <span className="font-medium text-purple-600">{count}</span>
        </div>
      )
    },
    {
      title: 'Resolved (Week)',
      dataIndex: 'resolved_this_week',
      key: 'resolved_this_week',
      align: 'center',
      width: 130,
      render: (count) => (
        <div className="flex items-center justify-center gap-1">
          <CheckCircle size={14} className="text-green-500" />
          <span className="text-green-600 font-semibold">{count}</span>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Spin size="large" />
        <div className="text-gray-500 text-sm">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Dashboard Error"
          description={error}
          type="error"
          showIcon
          icon={<XCircle className="text-red-500" />}
          action={
            <Button type="primary" onClick={() => loadDashboardData()}>
              <RefreshCw size={14} className="mr-1" /> Retry
            </Button>
          }
        />
      </div>
    )
  }

  const data = dashboardData || {}
  const assets = data.assets || {}
  const tickets = data.tickets || {}
  const sla = data.sla || {}
  const requisitions = data.requisitions || {}
  const consumables = data.consumables || {}
  const deliveries = data.deliveries || {}

  // Calculate critical alerts
  const criticalAlerts = []
  if ((sla.activeStatus?.breached || 0) > 0) {
    criticalAlerts.push({ type: 'error', message: `${sla.activeStatus.breached} SLA breached tickets require immediate attention` })
  }
  if ((tickets.byPriority?.critical || 0) > 0) {
    criticalAlerts.push({ type: 'warning', message: `${tickets.byPriority.critical} critical priority tickets pending` })
  }
  if ((consumables.inventory?.lowStock || 0) > 5) {
    criticalAlerts.push({ type: 'warning', message: `${consumables.inventory.lowStock} consumable items are running low on stock` })
  }

  // SLA donut chart data calculation
  const slaTotal = (sla.activeStatus?.onTrack || 0) + (sla.activeStatus?.warning || 0) +
                   (sla.activeStatus?.critical || 0) + (sla.activeStatus?.breached || 0)
  const slaOnTrackPercent = slaTotal > 0 ? Math.round((sla.activeStatus?.onTrack || 0) / slaTotal * 100) : 0

  return (
    <div className="space-y-6 pb-6">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 -mx-6 -mt-6 px-6 py-5 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coordinator Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Service Operations & Asset Lifecycle Management</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-400 uppercase tracking-wider">Last Updated</div>
              <div className="text-sm font-medium text-gray-700">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <Button
              type="default"
              icon={<RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />}
              onClick={handleRefresh}
              loading={refreshing}
              className="flex items-center gap-2 border-gray-300 hover:border-blue-400 hover:text-blue-600"
            >
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-2">
          {criticalAlerts.map((alert, index) => (
            <Alert
              key={index}
              message={alert.message}
              type={alert.type}
              showIcon
              icon={<AlertTriangle size={16} />}
              banner
              className="rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Primary KPI Row - Asset & Ticket Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <Card
            className="border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 h-full cursor-pointer group"
            bodyStyle={{ padding: '20px' }}
            onClick={() => navigate('/assets/inventory')}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-50 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                <Package className="text-blue-600" size={24} />
              </div>
              <Tooltip title="Asset utilization rate">
                <div className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">
                  {assets.utilizationRate || 0}% Utilized
                </div>
              </Tooltip>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{(assets.total || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500 mb-4">Total Assets</div>
            <Progress
              percent={assets.utilizationRate || 0}
              size="small"
              showInfo={false}
              strokeColor={{ '0%': '#3b82f6', '100%': '#1d4ed8' }}
              trailColor="#e5e7eb"
              className="mb-3"
            />
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="font-bold text-green-600">{assets.assigned || 0}</div>
                <div className="text-green-600">Assigned</div>
              </div>
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="font-bold text-orange-600">{assets.available || 0}</div>
                <div className="text-orange-600">Available</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <div className="font-bold text-red-600">{assets.underRepair || 0}</div>
                <div className="text-red-600">Repair</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            className="border border-gray-200 hover:shadow-lg hover:border-orange-300 transition-all duration-300 h-full cursor-pointer group"
            bodyStyle={{ padding: '20px' }}
            onClick={() => navigate('/tickets')}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-orange-50 p-3 rounded-xl group-hover:bg-orange-100 transition-colors">
                <FileText className="text-orange-600" size={24} />
              </div>
              {(tickets.unassigned || 0) > 0 && (
                <Tooltip title="Unassigned tickets requiring attention">
                  <Badge
                    count={tickets.unassigned}
                    style={{ backgroundColor: '#f5222d' }}
                    className="animate-pulse"
                  />
                </Tooltip>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{(tickets.total || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500 mb-4">Total Tickets</div>
            <div className="flex items-center gap-2 mb-3 text-xs">
              <span className="text-gray-500">Today:</span>
              <span className="flex items-center gap-1 text-blue-600">
                <TrendingUp size={12} /> {tickets.today?.created || 0} new
              </span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle size={12} /> {tickets.today?.resolved || 0} resolved
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="font-bold text-blue-600">{tickets.open || 0}</div>
                <div className="text-blue-600">Open</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg">
                <div className="font-bold text-purple-600">{tickets.inProgress || 0}</div>
                <div className="text-purple-600">In Progress</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="font-bold text-green-600">{tickets.resolved || 0}</div>
                <div className="text-green-600">Resolved</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            className="border border-gray-200 hover:shadow-lg hover:border-green-300 transition-all duration-300 h-full cursor-pointer group"
            bodyStyle={{ padding: '20px' }}
            onClick={() => navigate('/reports/sla-compliance')}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-50 p-3 rounded-xl group-hover:bg-green-100 transition-colors">
                <Shield className="text-green-600" size={24} />
              </div>
              {(sla.atRisk || 0) > 0 ? (
                <Tooltip title={`${sla.atRisk} tickets at risk of SLA breach`}>
                  <div className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <AlertTriangle size={12} /> {sla.atRisk} At Risk
                  </div>
                </Tooltip>
              ) : (
                <div className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                  <CheckCircle size={12} /> On Track
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{sla.complianceRate || 0}%</div>
            <div className="text-sm text-gray-500 mb-4">SLA Compliance</div>
            <Progress
              percent={parseFloat(sla.complianceRate || 0)}
              size="small"
              showInfo={false}
              strokeColor={
                parseFloat(sla.complianceRate) >= 90
                  ? { '0%': '#22c55e', '100%': '#16a34a' }
                  : parseFloat(sla.complianceRate) >= 70
                    ? { '0%': '#facc15', '100%': '#eab308' }
                    : { '0%': '#f87171', '100%': '#dc2626' }
              }
              trailColor="#e5e7eb"
              className="mb-3"
            />
            <div className="grid grid-cols-4 gap-1 text-xs">
              <Tooltip title="On Track">
                <div className="text-center p-1.5 bg-green-50 rounded">
                  <div className="font-bold text-green-600">{sla.activeStatus?.onTrack || 0}</div>
                </div>
              </Tooltip>
              <Tooltip title="Warning">
                <div className="text-center p-1.5 bg-yellow-50 rounded">
                  <div className="font-bold text-yellow-600">{sla.activeStatus?.warning || 0}</div>
                </div>
              </Tooltip>
              <Tooltip title="Critical">
                <div className="text-center p-1.5 bg-orange-50 rounded">
                  <div className="font-bold text-orange-600">{sla.activeStatus?.critical || 0}</div>
                </div>
              </Tooltip>
              <Tooltip title="Breached">
                <div className="text-center p-1.5 bg-red-50 rounded">
                  <div className="font-bold text-red-600">{sla.activeStatus?.breached || 0}</div>
                </div>
              </Tooltip>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card
            className="border border-gray-200 hover:shadow-lg hover:border-purple-300 transition-all duration-300 h-full cursor-pointer group"
            bodyStyle={{ padding: '20px' }}
            onClick={() => navigate('/assignments/asset-assignment')}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-50 p-3 rounded-xl group-hover:bg-purple-100 transition-colors">
                <ClipboardList className="text-purple-600" size={24} />
              </div>
              {(requisitions.pendingAssignment || 0) > 0 && (
                <Badge
                  count={requisitions.pendingAssignment}
                  style={{ backgroundColor: '#722ed1' }}
                  title="Pending assignment"
                />
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{(requisitions.total || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-500 mb-4">Requisitions</div>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Completion Rate</span>
                <span className="font-medium">
                  {requisitions.total > 0
                    ? Math.round((requisitions.completed || 0) / requisitions.total * 100)
                    : 0}%
                </span>
              </div>
              <Progress
                percent={requisitions.total > 0 ? Math.round((requisitions.completed || 0) / requisitions.total * 100) : 0}
                size="small"
                showInfo={false}
                strokeColor={{ '0%': '#a855f7', '100%': '#7c3aed' }}
                trailColor="#e5e7eb"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-orange-50 rounded-lg">
                <div className="font-bold text-orange-600">{requisitions.pendingApproval || 0}</div>
                <div className="text-orange-600">Pending</div>
              </div>
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="font-bold text-blue-600">{requisitions.assignedPendingDelivery || 0}</div>
                <div className="text-blue-600">Delivery</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="font-bold text-green-600">{requisitions.completed || 0}</div>
                <div className="text-green-600">Done</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Section Divider */}
      <div className="flex items-center gap-4 py-2">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Operations Summary</span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* Consolidated Secondary KPIs - 4 Grouped Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            className="border border-gray-200 hover:shadow-md transition-all h-full"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Zap className="text-blue-600" size={18} />
              </div>
              <span className="font-semibold text-gray-700">Today's Activity</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-600">{tickets.today?.created || 0}</div>
                <div className="text-xs text-gray-500">New Tickets</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-600">{tickets.today?.resolved || 0}</div>
                <div className="text-xs text-gray-500">Resolved</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="border border-gray-200 hover:shadow-md transition-all h-full"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-50 p-2 rounded-lg">
                <Truck className="text-purple-600" size={18} />
              </div>
              <span className="font-semibold text-gray-700">Deliveries & Requests</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-purple-600">{deliveries.pending || 0}</div>
                <div className="text-xs text-gray-500">Pending Deliveries</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-orange-600">{consumables.pending || 0}</div>
                <div className="text-xs text-gray-500">Consumable Req.</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="border border-gray-200 hover:shadow-md transition-all h-full"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-50 p-2 rounded-lg">
                <Boxes className="text-amber-600" size={18} />
              </div>
              <span className="font-semibold text-gray-700">Inventory Alerts</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-red-600">{consumables.inventory?.lowStock || 0}</div>
                <div className="text-xs text-gray-500">Low Stock</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-amber-600">{assets.warrantyExpiring || 0}</div>
                <div className="text-xs text-gray-500">Warranty Expiring</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            className="border border-gray-200 hover:shadow-md transition-all h-full"
            bodyStyle={{ padding: '16px' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-cyan-50 p-2 rounded-lg">
                <PackageCheck className="text-cyan-600" size={18} />
              </div>
              <span className="font-semibold text-gray-700">Asset Updates</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-cyan-600">{assets.addedThisMonth || 0}</div>
                <div className="text-xs text-gray-500">New This Month</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-indigo-600">{tickets.byPriority?.critical || 0}</div>
                <div className="text-xs text-gray-500">Critical Tickets</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Fault Analysis Widget */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <FaultTrendsWidget compact={true} />
        </Col>
      </Row>

      {/* Section Divider */}
      <div className="flex items-center gap-4 py-2">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">SLA & Analytics</span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* Enhanced SLA Status with Visual Gauge */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <Timer size={18} className="text-gray-600" />
                <span className="font-semibold">Active SLA Status</span>
              </div>
            }
            className="border border-gray-200 hover:shadow-md transition-all h-full"
            extra={
              <Button type="link" size="small" onClick={() => navigate('/reports/sla-compliance')}>
                View Report <ArrowRight size={12} className="ml-1" />
              </Button>
            }
          >
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Progress
                  type="circle"
                  percent={slaOnTrackPercent}
                  size={140}
                  strokeWidth={10}
                  strokeColor={{
                    '0%': '#22c55e',
                    '100%': '#16a34a',
                  }}
                  trailColor="#f3f4f6"
                  format={() => (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{slaOnTrackPercent}%</div>
                      <div className="text-xs text-gray-500">On Track</div>
                    </div>
                  )}
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">On Track</span>
                </div>
                <Badge count={sla.activeStatus?.onTrack || 0} style={{ backgroundColor: '#52c41a' }} showZero />
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-600">Warning</span>
                </div>
                <Badge count={sla.activeStatus?.warning || 0} style={{ backgroundColor: '#faad14' }} showZero />
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-600">Critical</span>
                </div>
                <Badge count={sla.activeStatus?.critical || 0} style={{ backgroundColor: '#f5222d' }} showZero />
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-gray-600">Breached</span>
                </div>
                <Badge count={sla.activeStatus?.breached || 0} style={{ backgroundColor: '#722ed1' }} showZero />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-gray-600" />
                <span className="font-semibold">Ticket Priority Distribution</span>
              </div>
            }
            className="border border-gray-200 hover:shadow-md transition-all h-full"
            extra={
              <Button type="link" size="small" onClick={() => navigate('/tickets')}>
                View All <ArrowRight size={12} className="ml-1" />
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-red-200 transition-colors">
                    <XCircle className="text-red-600" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-red-600 mb-1">{tickets.byPriority?.critical || 0}</div>
                  <div className="text-sm font-medium text-red-600">Critical</div>
                  <div className="text-xs text-red-400 mt-1">Immediate Action</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                    <AlertCircle className="text-orange-600" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">{tickets.byPriority?.high || 0}</div>
                  <div className="text-sm font-medium text-orange-600">High</div>
                  <div className="text-xs text-orange-400 mt-1">Priority Response</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
                    <Clock className="text-blue-600" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{tickets.byPriority?.medium || 0}</div>
                  <div className="text-sm font-medium text-blue-600">Medium</div>
                  <div className="text-xs text-blue-400 mt-1">Standard Queue</div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">{tickets.byPriority?.low || 0}</div>
                  <div className="text-sm font-medium text-green-600">Low</div>
                  <div className="text-xs text-green-400 mt-1">When Available</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-gray-600" />
                <span className="font-semibold">Asset Distribution by Location</span>
              </div>
            }
            className="border border-gray-200 hover:shadow-md transition-all"
            style={{ height: '420px' }}
            bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'auto' }}
            extra={
              <Button type="link" size="small" onClick={() => navigate('/assets/inventory')}>
                View All <ArrowRight size={12} className="ml-1" />
              </Button>
            }
          >
            <LocationPieChart
              data={data.locationDistribution || []}
              title="Assets"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-gray-600" />
                <span className="font-semibold">Tickets by Category</span>
              </div>
            }
            className="border border-gray-200 hover:shadow-md transition-all"
            style={{ height: '420px' }}
            bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'auto' }}
            extra={
              <Button type="link" size="small" onClick={() => navigate('/tickets')}>
                View All <ArrowRight size={12} className="ml-1" />
              </Button>
            }
          >
            <TicketStatusByCategory data={tickets.byCategory || []} />
          </Card>
        </Col>
      </Row>

      {/* Section Divider */}
      <div className="flex items-center gap-4 py-2">
        <div className="h-px bg-gray-200 flex-1"></div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Actions & Workload</span>
        <div className="h-px bg-gray-200 flex-1"></div>
      </div>

      {/* Pending Actions & Engineer Workload */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-orange-500" />
                <span className="font-semibold">Pending Actions</span>
                <Badge
                  count={(data.pendingActions || []).length}
                  style={{ backgroundColor: '#f59e0b' }}
                  className="ml-2"
                />
              </div>
            }
            className="border border-gray-200 hover:shadow-md transition-all"
          >
            {(data.pendingActions || []).length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center">
                    <CheckCircle className="text-green-500 mx-auto mb-2" size={32} />
                    <span className="text-gray-500">All caught up! No pending actions.</span>
                  </div>
                }
              />
            ) : (
              <Table
                columns={pendingActionsColumns}
                dataSource={data.pendingActions || []}
                rowKey="id"
                pagination={{ pageSize: 5, showSizeChanger: false, size: 'small' }}
                size="small"
                className="pending-actions-table"
                rowClassName="hover:bg-gray-50 transition-colors"
              />
            )}
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                <span className="font-semibold">Engineer Workload</span>
              </div>
            }
            className="border border-gray-200 hover:shadow-md transition-all"
            extra={
              <Tooltip title="View detailed workload">
                <Button type="link" size="small">
                  Details <ArrowRight size={12} className="ml-1" />
                </Button>
              </Tooltip>
            }
          >
            {(data.engineerWorkload || []).length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-gray-500">No engineers assigned yet</span>
                }
              />
            ) : (
              <Table
                columns={engineerWorkloadColumns}
                dataSource={data.engineerWorkload || []}
                rowKey="engineer_id"
                pagination={false}
                size="small"
                rowClassName="hover:bg-gray-50 transition-colors"
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CoordinatorDashboard
