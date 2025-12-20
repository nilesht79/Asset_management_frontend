import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  message,
  Empty,
  Tooltip,
  Statistic,
  Spin,
  Alert,
  Progress,
  Badge,
  Divider,
  Avatar
} from 'antd';
import {
  LaptopOutlined,
  PlusOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  CustomerServiceOutlined,
  InboxOutlined,
  ShoppingOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  IdcardOutlined,
  RightOutlined,
  SyncOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  FireOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import apiClient from '../../../../services/api';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

// Get time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/dashboard/employee');
      setDashboardData(response.data.data);
    } catch (error) {
      message.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate asset health from myAssets
  const assetHealth = useMemo(() => {
    if (!dashboardData?.myAssets) return { excellent: 0, good: 0, fair: 0, poor: 0, total: 0 };

    const assets = dashboardData.myAssets;
    const health = {
      excellent: assets.filter(a => a.condition_status === 'excellent').length,
      good: assets.filter(a => a.condition_status === 'good').length,
      fair: assets.filter(a => a.condition_status === 'fair').length,
      poor: assets.filter(a => a.condition_status === 'poor').length,
      total: assets.length
    };
    return health;
  }, [dashboardData?.myAssets]);

  // Calculate attention items
  const attentionItems = useMemo(() => {
    if (!dashboardData) return [];

    const items = [];
    const { stats, myTickets, myRequisitions } = dashboardData;

    // Open tickets
    if (stats.openTickets > 0) {
      items.push({
        type: 'ticket',
        icon: <CustomerServiceOutlined />,
        color: '#fa8c16',
        text: `${stats.openTickets} open ticket${stats.openTickets > 1 ? 's' : ''} awaiting resolution`,
        action: () => navigate('/my-tickets')
      });
    }

    // Pending requisitions
    if (stats.pendingRequisitions > 0) {
      items.push({
        type: 'requisition',
        icon: <ClockCircleOutlined />,
        color: '#722ed1',
        text: `${stats.pendingRequisitions} requisition${stats.pendingRequisitions > 1 ? 's' : ''} pending approval`,
        action: () => navigate('/requisitions/my-requisitions')
      });
    }

    // Overdue requisitions - only count truly pending ones (not approved or processed)
    const pendingStatuses = ['pending_dept_head', 'pending_it_head', 'pending_assignment'];
    const overdueReqs = myRequisitions?.filter(r =>
      r.required_by_date &&
      dayjs(r.required_by_date).isBefore(dayjs()) &&
      pendingStatuses.includes(r.status)
    ) || [];

    if (overdueReqs.length > 0) {
      items.push({
        type: 'overdue',
        icon: <ExclamationCircleOutlined />,
        color: '#ff4d4f',
        text: `${overdueReqs.length} requisition${overdueReqs.length > 1 ? 's' : ''} past required date`,
        action: () => navigate('/requisitions/my-requisitions')
      });
    }

    // High priority tickets
    const highPriorityTickets = myTickets?.filter(t =>
      ['critical', 'emergency', 'high'].includes(t.priority) &&
      !['resolved', 'closed'].includes(t.status)
    ) || [];

    if (highPriorityTickets.length > 0) {
      items.push({
        type: 'priority',
        icon: <FireOutlined />,
        color: '#ff4d4f',
        text: `${highPriorityTickets.length} high priority ticket${highPriorityTickets.length > 1 ? 's' : ''} need attention`,
        action: () => navigate('/my-tickets')
      });
    }

    return items;
  }, [dashboardData, navigate]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        <Empty description="Failed to load dashboard data" />
      </div>
    );
  }

  const { stats, myAssets, myRequisitions, myTickets, myConsumableRequests } = dashboardData;

  // Status tag renderers
  const getRequisitionStatusTag = (status) => {
    const statusConfig = {
      pending_dept_head: { color: 'orange', text: 'Pending Dept Head', icon: <ClockCircleOutlined /> },
      approved_by_dept_head: { color: 'blue', text: 'Dept Approved', icon: <CheckCircleOutlined /> },
      rejected_by_dept_head: { color: 'red', text: 'Rejected', icon: <CloseCircleOutlined /> },
      pending_it_head: { color: 'orange', text: 'Pending IT Head', icon: <ClockCircleOutlined /> },
      approved_by_it_head: { color: 'blue', text: 'IT Approved', icon: <CheckCircleOutlined /> },
      rejected_by_it_head: { color: 'red', text: 'Rejected', icon: <CloseCircleOutlined /> },
      pending_assignment: { color: 'purple', text: 'Pending Assignment', icon: <ClockCircleOutlined /> },
      assigned: { color: 'cyan', text: 'Assigned', icon: <UserOutlined /> },
      delivered: { color: 'lime', text: 'Delivered', icon: <CheckCircleOutlined /> },
      completed: { color: 'green', text: 'Completed', icon: <CheckCircleOutlined /> },
      cancelled: { color: 'default', text: 'Cancelled', icon: <CloseCircleOutlined /> }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  const getTicketStatusConfig = (status) => {
    const config = {
      open: { color: '#1890ff', text: 'Open', step: 1 },
      assigned: { color: '#722ed1', text: 'Assigned', step: 2 },
      in_progress: { color: '#fa8c16', text: 'In Progress', step: 3 },
      pending_closure: { color: '#13c2c2', text: 'Pending Closure', step: 4 },
      resolved: { color: '#52c41a', text: 'Resolved', step: 5 },
      closed: { color: '#8c8c8c', text: 'Closed', step: 5 }
    };
    return config[status] || { color: '#8c8c8c', text: status, step: 0 };
  };

  const getConsumableStatusTag = (status) => {
    const statusConfig = {
      pending: { color: 'gold', text: 'Pending', icon: <ClockCircleOutlined /> },
      approved: { color: 'blue', text: 'Approved', icon: <CheckCircleOutlined /> },
      rejected: { color: 'red', text: 'Rejected', icon: <CloseCircleOutlined /> },
      delivered: { color: 'green', text: 'Delivered', icon: <CheckCircleOutlined /> },
      cancelled: { color: 'default', text: 'Cancelled', icon: <CloseCircleOutlined /> }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  const getPriorityTag = (priority) => {
    const config = {
      critical: { color: '#ff4d4f', bg: '#fff1f0', icon: <FireOutlined />, pulse: true },
      emergency: { color: '#ff4d4f', bg: '#fff1f0', icon: <ThunderboltOutlined />, pulse: true },
      high: { color: '#fa8c16', bg: '#fff7e6', icon: <WarningOutlined /> },
      urgent: { color: '#fa8c16', bg: '#fff7e6', icon: <ExclamationCircleOutlined /> },
      medium: { color: '#1890ff', bg: '#e6f7ff', icon: null },
      normal: { color: '#1890ff', bg: '#e6f7ff', icon: null },
      low: { color: '#52c41a', bg: '#f6ffed', icon: null }
    };
    const cfg = config[priority] || { color: '#8c8c8c', bg: '#fafafa' };
    return (
      <Tag
        color={cfg.color}
        icon={cfg.icon}
        style={{
          animation: cfg.pulse ? 'pulse 2s infinite' : 'none',
          fontWeight: cfg.pulse ? 600 : 400
        }}
      >
        {priority?.toUpperCase()}
      </Tag>
    );
  };

  const getConditionTag = (condition) => {
    const config = {
      excellent: { color: 'green', icon: <SafetyCertificateOutlined /> },
      good: { color: 'blue', icon: <CheckCircleOutlined /> },
      fair: { color: 'orange', icon: <WarningOutlined /> },
      poor: { color: 'red', icon: <ToolOutlined /> }
    };
    const cfg = config[condition] || { color: 'default' };
    return <Tag color={cfg.color} icon={cfg.icon}>{condition?.charAt(0).toUpperCase() + condition?.slice(1)}</Tag>;
  };

  // Table columns
  const assetColumns = [
    {
      title: 'Asset',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong code style={{ fontSize: 13 }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.product_name}</Text>
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: 'Condition',
      dataIndex: 'condition_status',
      key: 'condition_status',
      render: (condition) => getConditionTag(condition)
    }
  ];

  const requisitionColumns = [
    {
      title: 'Requisition',
      dataIndex: 'requisition_number',
      key: 'requisition_number',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong code style={{ fontSize: 13 }}>{text}</Text>
          <Text type="secondary" ellipsis style={{ fontSize: 12, maxWidth: 150 }}>{record.purpose}</Text>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getRequisitionStatusTag(status)
    },
    {
      title: 'Required By',
      dataIndex: 'required_by_date',
      key: 'required_by_date',
      render: (date, record) => {
        if (!date) return <Text type="secondary">-</Text>;
        const isOverdue = dayjs(date).isBefore(dayjs()) &&
          !['completed', 'cancelled', 'rejected_by_dept_head', 'rejected_by_it_head'].includes(record.status);
        const daysLeft = dayjs(date).diff(dayjs(), 'day');

        return (
          <Tooltip title={dayjs(date).format('MMM D, YYYY')}>
            {isOverdue ? (
              <Tag color="error" icon={<ExclamationCircleOutlined />}>Overdue</Tag>
            ) : daysLeft <= 3 ? (
              <Tag color="warning" icon={<ClockCircleOutlined />}>{daysLeft}d left</Tag>
            ) : (
              <Text type="secondary">{dayjs(date).format('MMM D')}</Text>
            )}
          </Tooltip>
        );
      }
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/requisitions/${record.requisition_id}`)}
        />
      )
    }
  ];

  const ticketColumns = [
    {
      title: 'Ticket',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Space size={4}>
            <Text strong code style={{ fontSize: 13 }}>{text}</Text>
            {getPriorityTag(record.priority)}
          </Space>
          <Text type="secondary" ellipsis style={{ fontSize: 12, maxWidth: 180 }}>{record.title}</Text>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const config = getTicketStatusConfig(status);
        return (
          <Space direction="vertical" size={2} style={{ width: '100%' }}>
            <Tag color={config.color}>{config.text}</Tag>
            {record.engineer_name ? (
              <Text type="secondary" style={{ fontSize: 11 }}>
                <UserOutlined /> {record.engineer_name}
              </Text>
            ) : status !== 'closed' && status !== 'resolved' ? (
              <Text type="warning" style={{ fontSize: 11 }}>
                <WarningOutlined /> Unassigned
              </Text>
            ) : null}
          </Space>
        );
      }
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <Tooltip title={dayjs(date).format('MMM D, YYYY h:mm A')}>
          <Text type="secondary" style={{ fontSize: 12 }}>{dayjs(date).fromNow()}</Text>
        </Tooltip>
      )
    }
  ];

  const consumableColumns = [
    {
      title: 'Request',
      dataIndex: 'request_number',
      key: 'request_number',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong code style={{ fontSize: 13 }}>{text}</Text>
          <Text type="secondary" ellipsis style={{ fontSize: 12, maxWidth: 120 }}>{record.consumable_name}</Text>
        </Space>
      )
    },
    {
      title: 'Qty',
      key: 'quantity',
      width: 80,
      render: (_, record) => (
        <Space size={4}>
          <Text>{record.quantity_requested}</Text>
          {record.quantity_issued > 0 && record.quantity_issued < record.quantity_requested && (
            <Tooltip title={`${record.quantity_issued} issued`}>
              <Tag color="orange" style={{ fontSize: 10 }}>Partial</Tag>
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getConsumableStatusTag(status)
    }
  ];

  // Asset health percentage
  const healthScore = assetHealth.total > 0
    ? Math.round(((assetHealth.excellent + assetHealth.good) / assetHealth.total) * 100)
    : 100;

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>

      {/* Enhanced Header Section */}
      <Card
        bordered={false}
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0, fontWeight: 500, color: '#262626' }}>
              {getGreeting()}, {user?.firstName || 'User'}!
            </Title>
            <Space split={<Divider type="vertical" style={{ borderColor: '#d9d9d9' }} />} style={{ marginTop: 8 }}>
              {user?.employeeId && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <IdcardOutlined style={{ marginRight: 4 }} />
                  {user.employeeId}
                </Text>
              )}
              {user?.department?.name && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <TeamOutlined style={{ marginRight: 4 }} />
                  {user.department.name}
                </Text>
              )}
              {user?.location?.name && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  {user.location.name}
                </Text>
              )}
            </Space>
          </Col>
          <Col>
            <Button
              icon={<SyncOutlined />}
              onClick={loadDashboardData}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Attention Required Banner */}
      {attentionItems.length > 0 && (
        <Card
          bordered={false}
          style={{ marginBottom: 16, background: '#fffbe6', border: '1px solid #ffe58f' }}
          bodyStyle={{ padding: '12px 20px' }}
        >
          <Row align="middle" gutter={16}>
            <Col>
              <Badge count={attentionItems.length} offset={[-2, 2]}>
                <Avatar
                  icon={<BellOutlined />}
                  style={{ background: '#faad14' }}
                />
              </Badge>
            </Col>
            <Col flex={1}>
              <Text strong style={{ fontSize: 14, color: '#ad6800' }}>Attention Required</Text>
              <div style={{ marginTop: 4 }}>
                <Space wrap size={[16, 8]}>
                  {attentionItems.map((item, idx) => (
                    <Button
                      key={idx}
                      type="link"
                      size="small"
                      onClick={item.action}
                      style={{ padding: 0, height: 'auto', color: item.color }}
                    >
                      {item.icon} {item.text} <RightOutlined style={{ fontSize: 10 }} />
                    </Button>
                  ))}
                </Space>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Quick Actions */}
      <Card
        bordered={false}
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '12px 20px' }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col>
            <Text strong style={{ fontSize: 13, color: '#595959' }}>Quick Actions:</Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<ShoppingOutlined />}
              onClick={() => navigate('/requisitions/new')}
            >
              Request Asset
            </Button>
          </Col>
          <Col>
            <Button
              icon={<CustomerServiceOutlined />}
              onClick={() => navigate('/create-ticket')}
            >
              Report Issue
            </Button>
          </Col>
          <Col>
            <Button
              icon={<InboxOutlined />}
              onClick={() => navigate('/consumables/requests')}
            >
              Request Consumable
            </Button>
          </Col>
        </Row>
      </Card>

      {/* KPI Cards */}
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        {/* My Assets Card with Health */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate('/my-assets')}
            style={{ height: '100%' }}
            bodyStyle={{ padding: 16 }}
          >
            <Row justify="space-between" align="top">
              <Col>
                <Text type="secondary" style={{ fontSize: 13 }}>My Assets</Text>
                <div style={{ fontSize: 28, fontWeight: 600, color: '#1890ff', lineHeight: 1.2, marginTop: 4 }}>
                  {stats.totalAssets}
                </div>
              </Col>
              <Col>
                <Tooltip title={`Health: ${healthScore}%`}>
                  <Progress
                    type="circle"
                    percent={healthScore}
                    width={50}
                    strokeColor={healthScore >= 80 ? '#52c41a' : healthScore >= 50 ? '#faad14' : '#ff4d4f'}
                    format={() => <LaptopOutlined style={{ color: '#1890ff', fontSize: 18 }} />}
                  />
                </Tooltip>
              </Col>
            </Row>
            {assetHealth.total > 0 && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {assetHealth.excellent > 0 && <Tag color="green" style={{ fontSize: 11 }}>{assetHealth.excellent} Excellent</Tag>}
                {assetHealth.good > 0 && <Tag color="blue" style={{ fontSize: 11 }}>{assetHealth.good} Good</Tag>}
                {assetHealth.fair > 0 && <Tag color="orange" style={{ fontSize: 11 }}>{assetHealth.fair} Fair</Tag>}
                {assetHealth.poor > 0 && <Tag color="red" style={{ fontSize: 11 }}>{assetHealth.poor} Poor</Tag>}
              </div>
            )}
          </Card>
        </Col>

        {/* Requisitions Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate('/requisitions/my-requisitions')}
            style={{ height: '100%' }}
            bodyStyle={{ padding: 16 }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>Asset Requisitions</Text>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClockCircleOutlined style={{ color: '#faad14', fontSize: 20 }} />
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14', lineHeight: 1 }}>{stats.pendingRequisitions}</div>
                    <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Pending</div>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a', lineHeight: 1 }}>{stats.completedRequisitions}</div>
                    <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Completed</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Tickets Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate('/my-tickets')}
            style={{ height: '100%' }}
            bodyStyle={{ padding: 16 }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>My Tickets</Text>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <WarningOutlined style={{ color: '#fa8c16', fontSize: 20 }} />
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#fa8c16', lineHeight: 1 }}>{stats.openTickets}</div>
                    <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Open</div>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a', lineHeight: 1 }}>{stats.resolvedTickets}</div>
                    <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Resolved</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Consumables Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate('/consumables/requests')}
            style={{ height: '100%' }}
            bodyStyle={{ padding: 16 }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>Consumable Requests</Text>
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ClockCircleOutlined style={{ color: '#722ed1', fontSize: 20 }} />
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#722ed1', lineHeight: 1 }}>{stats.pendingConsumableRequests}</div>
                    <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Pending</div>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a', lineHeight: 1 }}>{stats.deliveredConsumableRequests}</div>
                    <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>Delivered</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={12}>
          {/* My Assets */}
          <Card
            title={
              <Space>
                <LaptopOutlined style={{ color: '#1890ff' }} />
                <span>My Assets</span>
                <Tag color="blue">{myAssets?.length || 0}</Tag>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate('/my-assets')} style={{ padding: 0 }}>
                View All <RightOutlined style={{ fontSize: 10 }} />
              </Button>
            }
            bordered={false}
            style={{ marginBottom: 16 }}
            bodyStyle={{ padding: '0 16px 16px' }}
          >
            <Table
              dataSource={myAssets}
              columns={assetColumns}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: (
                  <Empty
                    description="No assets assigned"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button type="primary" icon={<ShoppingOutlined />} onClick={() => navigate('/requisitions/new')}>
                      Request an Asset
                    </Button>
                  </Empty>
                )
              }}
            />
          </Card>

          {/* My Requisitions */}
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: '#722ed1' }} />
                <span>My Requisitions</span>
              </Space>
            }
            extra={
              <Space>
                <Button type="link" onClick={() => navigate('/requisitions/my-requisitions')} style={{ padding: 0 }}>
                  View All <RightOutlined style={{ fontSize: 10 }} />
                </Button>
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => navigate('/requisitions/new')}>
                  New
                </Button>
              </Space>
            }
            bordered={false}
            bodyStyle={{ padding: '0 16px 16px' }}
          >
            <Table
              dataSource={myRequisitions}
              columns={requisitionColumns}
              rowKey="requisition_id"
              pagination={false}
              size="small"
              locale={{
                emptyText: (
                  <Empty
                    description="No requisitions yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/requisitions/new')}>
                      Create Requisition
                    </Button>
                  </Empty>
                )
              }}
            />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={12}>
          {/* My Tickets */}
          <Card
            title={
              <Space>
                <CustomerServiceOutlined style={{ color: '#fa8c16' }} />
                <span>My Tickets</span>
                {stats.openTickets > 0 && <Badge count={stats.openTickets} style={{ backgroundColor: '#fa8c16' }} />}
              </Space>
            }
            extra={
              <Space>
                <Button type="link" onClick={() => navigate('/my-tickets')} style={{ padding: 0 }}>
                  View All <RightOutlined style={{ fontSize: 10 }} />
                </Button>
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => navigate('/create-ticket')}>
                  Report Issue
                </Button>
              </Space>
            }
            bordered={false}
            style={{ marginBottom: 16 }}
            bodyStyle={{ padding: '0 16px 16px' }}
          >
            <Table
              dataSource={myTickets}
              columns={ticketColumns}
              rowKey="ticket_id"
              pagination={false}
              size="small"
              locale={{
                emptyText: (
                  <Empty
                    description="No tickets raised"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button type="primary" icon={<CustomerServiceOutlined />} onClick={() => navigate('/create-ticket')}>
                      Report an Issue
                    </Button>
                  </Empty>
                )
              }}
            />
          </Card>

          {/* My Consumable Requests */}
          <Card
            title={
              <Space>
                <InboxOutlined style={{ color: '#13c2c2' }} />
                <span>My Consumable Requests</span>
              </Space>
            }
            extra={
              <Button type="link" onClick={() => navigate('/consumables/requests')} style={{ padding: 0 }}>
                View All <RightOutlined style={{ fontSize: 10 }} />
              </Button>
            }
            bordered={false}
            bodyStyle={{ padding: '0 16px 16px' }}
          >
            <Table
              dataSource={myConsumableRequests}
              columns={consumableColumns}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: (
                  <Empty
                    description="No consumable requests"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button type="primary" icon={<InboxOutlined />} onClick={() => navigate('/consumables/requests')}>
                      Request Consumables
                    </Button>
                  </Empty>
                )
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDashboard;
