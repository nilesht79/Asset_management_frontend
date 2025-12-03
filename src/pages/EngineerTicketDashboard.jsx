import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  message,
  Dropdown,
  Row,
  Col,
  Statistic,
  Select,
  FloatButton
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  MoreOutlined,
  EyeOutlined,
  SendOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  IssuesCloseOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import ticketService from '../services/ticket';
import RequestCloseTicketModal from '../components/modules/tickets/RequestCloseTicketModal';
import TicketDetailsDrawer from '../components/modules/tickets/TicketDetailsDrawer';
import CreateTicketModal from '../components/modules/tickets/CreateTicketModal';
import { SlaStatusIndicator } from '../components/modules/sla';
import useResponsive from '../hooks/useResponsive';

const { Search } = Input;
const { Option } = Select;

const EngineerTicketDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    in_progress: 0,
    pending_closure: 0,
    closed: 0
  });
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

  // Modal and Drawer states
  const [requestCloseModalVisible, setRequestCloseModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [createTicketModalVisible, setCreateTicketModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { user: currentUser } = useSelector((state) => state.auth);
  const { isMobile, isTablet } = useResponsive();

  useEffect(() => {
    fetchTickets();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };

      const response = await ticketService.getMyTickets(params);
      const data = response.data.data || response.data;

      setTickets(data.tickets || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0
      }));

      // Calculate stats from tickets
      calculateStats(data.tickets || []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      message.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ticketList) => {
    const stats = {
      total: ticketList.length,
      in_progress: ticketList.filter(t => t.status === 'in_progress').length,
      pending_closure: ticketList.filter(t => t.status === 'pending_closure').length,
      closed: ticketList.filter(t => t.status === 'closed').length
    };
    setStats(stats);
  };

  const handleTableChange = (paginationInfo) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
    setPagination((prev) => ({
      ...prev,
      current: 1
    }));
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setDetailsDrawerVisible(true);
  };

  const handleRequestClose = (ticket) => {
    setSelectedTicket(ticket);
    setRequestCloseModalVisible(true);
  };

  const handleRequestCloseSuccess = () => {
    setRequestCloseModalVisible(false);
    setSelectedTicket(null);
    fetchTickets();
    message.success('Close request submitted successfully! Waiting for coordinator approval.');
  };

  const getActionMenu = (ticket) => {
    const items = [
      {
        key: 'view',
        label: 'View Details',
        icon: <EyeOutlined />,
        onClick: () => handleViewTicket(ticket)
      }
    ];

    // Only show request close for in_progress tickets
    if (ticket.status === 'in_progress') {
      items.push({
        key: 'request-close',
        label: 'Request Close',
        icon: <SendOutlined />,
        onClick: () => handleRequestClose(ticket)
      });
    }

    return { items };
  };

  const columns = [
    {
      title: 'Ticket #',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      width: 130,
      fixed: !isMobile ? 'left' : false,
      responsive: ['sm'],
      render: (text) => (
        <span className="font-mono font-semibold text-blue-600">{text}</span>
      )
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status, record) => (
        <div>
          <Tag color={ticketService.getStatusColor(status)}>
            {ticketService.getStatusDisplayName(status).toUpperCase()}
          </Tag>
          {status === 'pending_closure' && (
            <div className="text-xs text-gray-500 mt-1">
              Awaiting approval
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 110,
      render: (priority) => (
        <Tag color={ticketService.getPriorityColor(priority)}>
          {ticketService.getPriorityDisplayName(priority).toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'SLA',
      key: 'sla_status',
      width: 100,
      render: (_, record) => (
        record.status !== 'closed' && record.status !== 'cancelled' ? (
          <SlaStatusIndicator
            status={record.sla_status}
            isPaused={record.sla_is_paused}
          />
        ) : (
          <Tag color="default">N/A</Tag>
        )
      )
    },
    {
      title: 'Created For',
      key: 'created_by_user',
      width: 220,
      render: (_, record) => (
        record.is_guest ? (
          <div>
            <Tag color="purple" style={{ marginBottom: 4 }}>
              GUEST
            </Tag>
            <div className="font-medium">{record.guest_name}</div>
            <div className="text-xs text-gray-500">{record.guest_email}</div>
          </div>
        ) : (
          <div>
            <div className="font-medium">{record.created_by_user_name}</div>
            <div className="text-xs text-gray-500">{record.created_by_user_email}</div>
          </div>
        )
      )
    },
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department_name',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Assigned',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => ticketService.formatRelativeTime(date),
      sorter: true
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={getActionMenu(record)}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-600">
            View and manage tickets assigned to you
          </p>
        </div>
      </div>

      {/* Stats Cards - Responsive */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Total Assigned"
              value={stats.total}
              prefix={<IssuesCloseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={stats.in_progress}
              valueStyle={{ color: '#722ed1' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Pending Closure"
              value={stats.pending_closure}
              valueStyle={{ color: '#13c2c2' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Closed"
              value={stats.closed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Table */}
      <Card>
        {/* Search and Filters Bar */}
        <Space wrap style={{ width: '100%', marginBottom: 16 }}>
          <Search
            placeholder="Search tickets..."
            allowClear
            style={{ width: isMobile ? '100%' : 300 }}
            onSearch={(value) => handleFilterChange('search', value)}
            enterButton={<SearchOutlined />}
          />

          <Select
            placeholder="Filter by Status"
            style={{ width: isMobile ? '100%' : 200 }}
            allowClear
            onChange={(value) => handleFilterChange('status', value || '')}
            value={filters.status || undefined}
          >
            <Option value="in_progress">In Progress</Option>
            <Option value="pending_closure">Pending Closure</Option>
            <Option value="resolved">Resolved</Option>
            <Option value="closed">Closed</Option>
          </Select>

          <Select
            placeholder="Filter by Priority"
            style={{ width: isMobile ? '100%' : 200 }}
            allowClear
            onChange={(value) => handleFilterChange('priority', value || '')}
            value={filters.priority || undefined}
          >
            <Option value="low">Low</Option>
            <Option value="medium">Medium</Option>
            <Option value="high">High</Option>
            <Option value="critical">Critical</Option>
            <Option value="emergency">Emergency</Option>
          </Select>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchTickets}
            disabled={loading}
          >
            {!isMobile && 'Refresh'}
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateTicketModalVisible(true)}
          >
            {!isMobile && 'Create Ticket'}
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="ticket_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          sticky
        />
      </Card>

      {/* Modals */}
      <CreateTicketModal
        visible={createTicketModalVisible}
        currentUser={currentUser}
        onClose={() => setCreateTicketModalVisible(false)}
        onSuccess={() => {
          setCreateTicketModalVisible(false);
          fetchTickets();
          message.success('Ticket created successfully');
        }}
      />

      <RequestCloseTicketModal
        visible={requestCloseModalVisible}
        ticket={selectedTicket}
        onClose={() => {
          setRequestCloseModalVisible(false);
          setSelectedTicket(null);
        }}
        onSuccess={handleRequestCloseSuccess}
      />

      <TicketDetailsDrawer
        visible={detailsDrawerVisible}
        ticket={selectedTicket}
        onClose={() => {
          setDetailsDrawerVisible(false);
          setSelectedTicket(null);
        }}
        onUpdate={fetchTickets}
      />

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <FloatButton.Group>
          <FloatButton
            icon={<ReloadOutlined />}
            onClick={fetchTickets}
            tooltip="Refresh"
          />
        </FloatButton.Group>
      )}
    </div>
  );
};

export default EngineerTicketDashboard;
