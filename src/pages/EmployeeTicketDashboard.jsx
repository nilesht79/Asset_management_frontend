import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  message,
  Empty,
  Row,
  Col,
  Statistic,
  Button,
  Input,
  Tooltip,
  Badge,
  FloatButton
} from 'antd';
import {
  CustomerServiceOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import ticketService from '../services/ticket';
import CreateTicketModal from '../components/modules/tickets/CreateTicketModal';
import TicketDetailsDrawer from '../components/modules/tickets/TicketDetailsDrawer';
import useResponsive from '../hooks/useResponsive';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Search } = Input;

const EmployeeTicketDashboard = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const { isMobile } = useResponsive();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0
  });

  // Modal and Drawer states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Pre-selected asset from MyAssets page
  const [preSelectedAsset, setPreSelectedAsset] = useState(null);

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [pagination.current, pagination.pageSize, filters]);

  // Auto-open create modal when navigating to /create-ticket
  useEffect(() => {
    if (location.pathname === '/create-ticket') {
      // Check if an asset was passed via location state (from MyAssets)
      if (location.state?.asset) {
        setPreSelectedAsset(location.state.asset);
      }
      setCreateModalVisible(true);
    }
  }, [location]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };

      const response = await ticketService.getMyCreatedTickets(params);
      const data = response.data?.data || response.data;
      const ticketData = data.tickets || [];

      setTickets(ticketData);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || ticketData.length
      }));
    } catch (error) {
      message.error('Failed to load tickets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Fetch all tickets just for stats (without pagination) or use a dedicated stats endpoint
      const response = await ticketService.getMyCreatedTickets({ page: 1, limit: 1000 });
      const data = response.data?.data || response.data;
      const allTickets = data.tickets || [];

      setStats({
        total: data.pagination?.total || allTickets.length,
        open: allTickets.filter(t => t.status === 'open').length,
        inProgress: allTickets.filter(t => ['assigned', 'in_progress'].includes(t.status)).length,
        resolved: allTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleTableChange = (paginationInfo) => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }));
  };

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      open: { color: 'blue', icon: <AlertOutlined />, text: 'Open' },
      assigned: { color: 'purple', icon: <ClockCircleOutlined />, text: 'Assigned' },
      in_progress: { color: 'orange', icon: <SyncOutlined spin />, text: 'In Progress' },
      pending_closure: { color: 'cyan', icon: <ClockCircleOutlined />, text: 'Pending Closure' },
      resolved: { color: 'green', icon: <CheckCircleOutlined />, text: 'Resolved' },
      closed: { color: 'default', icon: <CheckCircleOutlined />, text: 'Closed' }
    };
    const config = statusConfig[status] || { color: 'default', icon: null, text: status };
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  const getPriorityTag = (priority) => {
    const colors = {
      critical: 'red',
      emergency: 'red',
      high: 'orange',
      medium: 'blue',
      low: 'green'
    };
    return <Tag color={colors[priority] || 'default'}>{priority?.toUpperCase()}</Tag>;
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setDetailsDrawerVisible(true);
  };

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    setPreSelectedAsset(null);
    loadTickets();
    loadStats();
    message.success('Ticket created successfully');
    // Navigate to my-tickets if we came from create-ticket route
    if (location.pathname === '/create-ticket') {
      navigate('/my-tickets', { replace: true });
    }
  };

  const handleRefresh = () => {
    loadTickets();
    loadStats();
  };

  const handleCreateModalClose = () => {
    setCreateModalVisible(false);
    setPreSelectedAsset(null);
    // Navigate to my-tickets if we came from create-ticket route
    if (location.pathname === '/create-ticket') {
      navigate('/my-tickets', { replace: true });
    }
  };

  const columns = [
    {
      title: 'Ticket #',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      width: 130,
      render: (text) => <Text strong code>{text}</Text>,
      sorter: (a, b) => (a.ticket_number || '').localeCompare(b.ticket_number || '')
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (text) => <Tag>{text || 'General'}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Open', value: 'open' },
        { text: 'Assigned', value: 'assigned' },
        { text: 'In Progress', value: 'in_progress' },
        { text: 'Resolved', value: 'resolved' },
        { text: 'Closed', value: 'closed' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => getPriorityTag(priority)
    },
    {
      title: 'Engineer',
      dataIndex: 'engineer_name',
      key: 'engineer_name',
      width: 150,
      render: (text) => text || <Text type="secondary">Unassigned</Text>
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => (
        <Tooltip title={dayjs(date).format('MMMM DD, YYYY HH:mm')}>
          {dayjs(date).fromNow()}
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewTicket(record)}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
              <CustomerServiceOutlined style={{ marginRight: 12 }} />
              My Tickets
            </Title>
            <Text type="secondary">
              View and track your support tickets
            </Text>
          </Col>
          <Col>
            {!isMobile && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setCreateModalVisible(true)}
              >
                Report Issue
              </Button>
            )}
          </Col>
        </Row>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Tickets"
              value={stats.total}
              prefix={<CustomerServiceOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Open"
              value={stats.open}
              prefix={<AlertOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="In Progress"
              value={stats.inProgress}
              prefix={<SyncOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Resolved"
              value={stats.resolved}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card bordered={false}>
        {/* Toolbar */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="Search tickets..."
            allowClear
            style={{ width: isMobile ? '100%' : 300 }}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            {!isMobile && 'Refresh'}
          </Button>
          {isMobile && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Report Issue
            </Button>
          )}
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="ticket_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tickets`
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: (
              <Empty
                description="No tickets found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                >
                  Report Your First Issue
                </Button>
              </Empty>
            )
          }}
        />
      </Card>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        visible={createModalVisible}
        currentUser={currentUser}
        onClose={handleCreateModalClose}
        onSuccess={handleCreateSuccess}
        preSelectedAsset={preSelectedAsset}
      />

      {/* Ticket Details Drawer */}
      <TicketDetailsDrawer
        visible={detailsDrawerVisible}
        ticket={selectedTicket}
        onClose={() => {
          setDetailsDrawerVisible(false);
          setSelectedTicket(null);
        }}
        onUpdate={handleRefresh}
      />

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <FloatButton
          icon={<PlusOutlined />}
          type="primary"
          onClick={() => setCreateModalVisible(true)}
          tooltip="Report Issue"
        />
      )}
    </div>
  );
};

export default EmployeeTicketDashboard;
