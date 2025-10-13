import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Button, Table, Tag, Progress, Space } from 'antd'
import { 
  ToolOutlined, 
  ShoppingCartOutlined, 
  CustomerServiceOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const CoordinatorDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    // Mock API call - replace with actual API
    setTimeout(() => {
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
      setLoading(false)
    }, 1000)
  }

  const quickActions = [
    { title: 'Asset Assignment', icon: <ToolOutlined />, path: '/assets/assignment', color: 'blue' },
    { title: 'Requisitions', icon: <ShoppingCartOutlined />, path: '/assets/requisitions', color: 'green' },
    { title: 'My Tickets', icon: <CustomerServiceOutlined />, path: '/tickets/my-tickets', color: 'orange' },
    { title: 'Asset Reports', icon: <BarChartOutlined />, path: '/reports/assets', color: 'purple' }
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

  const getAlertIcon = (severity) => {
    const icons = {
      warning: <AlertOutlined className="text-orange-500" />,
      info: <FileTextOutlined className="text-blue-500" />,
      error: <AlertOutlined className="text-red-500" />
    }
    return icons[severity] || <AlertOutlined />
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Coordinator Dashboard</h1>
        <p className="text-blue-100">Asset allocation and lifecycle management overview</p>
      </div>

      {/* Asset Management Stats */}
      <Row gutter={16}>
        <Col span={6}>
          <Card className="border-l-4 border-l-blue-500">
            <Statistic
              title="Managed Assets"
              value={dashboardData.assetStats?.managedAssets || 0}
              prefix={<ToolOutlined className="text-blue-500" />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="border-l-4 border-l-green-500">
            <Statistic
              title="Assigned"
              value={dashboardData.assetStats?.assignedAssets || 0}
              suffix={`/ ${dashboardData.assetStats?.managedAssets || 0} total`}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="border-l-4 border-l-orange-500">
            <Statistic
              title="Available"
              value={dashboardData.assetStats?.availableAssets || 0}
              prefix={<ShoppingCartOutlined className="text-orange-500" />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="border-l-4 border-l-red-500">
            <Statistic
              title="Maintenance"
              value={dashboardData.assetStats?.underMaintenance || 0}
              prefix={<AlertOutlined className="text-red-500" />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Workflow Stats */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Requisition Workflow" loading={loading}>
            <Row gutter={16}>
              <Col span={6}>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{dashboardData.requisitionStats?.pendingApprovals || 0}</div>
                  <div className="text-gray-600">Pending</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{dashboardData.requisitionStats?.approved || 0}</div>
                  <div className="text-gray-600">Approved</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{dashboardData.requisitionStats?.fulfilled || 0}</div>
                  <div className="text-gray-600">Fulfilled</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{dashboardData.requisitionStats?.rejected || 0}</div>
                  <div className="text-gray-600">Rejected</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Ticket Management" loading={loading}>
            <Row gutter={16}>
              <Col span={6}>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{dashboardData.ticketStats?.assignedToMe || 0}</div>
                  <div className="text-gray-600">Assigned</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{dashboardData.ticketStats?.inProgress || 0}</div>
                  <div className="text-gray-600">In Progress</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{dashboardData.ticketStats?.completed || 0}</div>
                  <div className="text-gray-600">Completed</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{dashboardData.ticketStats?.overdue || 0}</div>
                  <div className="text-gray-600">Overdue</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Quick Actions */}
        <Col span={12}>
          <Card title="Quick Actions" className="h-full">
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  size="large"
                  className="h-20 flex flex-col items-center justify-center"
                  onClick={() => navigate(action.path)}
                >
                  <div className={`text-${action.color}-500 text-xl mb-1`}>
                    {action.icon}
                  </div>
                  <span className="text-sm">{action.title}</span>
                </Button>
              ))}
            </div>
          </Card>
        </Col>

        {/* Alerts */}
        <Col span={12}>
          <Card title="Asset Alerts" className="h-full">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dashboardData.alerts?.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                  {getAlertIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="text-sm">{alert.message}</div>
                    <div className="text-xs text-gray-500">{alert.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Asset Category Overview */}
      <Card title="Asset Category Distribution" loading={loading}>
        <Table
          columns={categoryColumns}
          dataSource={dashboardData.assetCategories}
          rowKey="category"
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Recent Assignments */}
      <Card title="Recent Asset Assignments" loading={loading}>
        <Table
          columns={assignmentColumns}
          dataSource={dashboardData.recentAssignments}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="middle"
        />
      </Card>
    </div>
  )
}

export default CoordinatorDashboard