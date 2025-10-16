import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  message,
  Dropdown,
  Tooltip,
  Row,
  Col,
  Statistic,
  Badge
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  IssuesCloseOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import ticketService from '../services/ticket';
import CreateTicketModal from '../components/modules/tickets/CreateTicketModal';
import AssignEngineerModal from '../components/modules/tickets/AssignEngineerModal';
import CloseTicketModal from '../components/modules/tickets/CloseTicketModal';
import TicketDetailsDrawer from '../components/modules/tickets/TicketDetailsDrawer';

const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

const TicketDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total_tickets: 0,
    open_tickets: 0,
    assigned_tickets: 0,
    in_progress_tickets: 0,
    resolved_tickets: 0,
    closed_tickets: 0,
    critical_tickets: 0,
    overdue_tickets: 0,
    resolved_today: 0
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: ''
  });

  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = ticketService.buildSearchParams(filters, {
        page: pagination.current,
        limit: pagination.pageSize
      });

      const response = await ticketService.getTickets(params);
      const data = response.data.data || response.data;

      setTickets(data.tickets || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      message.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await ticketService.getTicketStats();
      const data = response.data.data || response.data;
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
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

  const handleCreateTicket = () => {
    setCreateModalVisible(true);
  };

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    fetchTickets();
    fetchStats();
    message.success('Ticket created successfully');
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setDetailsDrawerVisible(true);
  };

  const handleAssignEngineer = (ticket) => {
    setSelectedTicket(ticket);
    setAssignModalVisible(true);
  };

  const handleAssignSuccess = () => {
    setAssignModalVisible(false);
    setSelectedTicket(null);
    fetchTickets();
    fetchStats();
    message.success('Engineer assigned successfully');
  };

  const handleCloseTicket = (ticket) => {
    setSelectedTicket(ticket);
    setCloseModalVisible(true);
  };

  const handleCloseSuccess = () => {
    setCloseModalVisible(false);
    setSelectedTicket(null);
    fetchTickets();
    fetchStats();
    message.success('Ticket closed successfully');
  };

  const handleExport = async () => {
    try {
      message.loading({ content: 'Exporting tickets...', key: 'export' });

      const params = ticketService.buildSearchParams(filters, {});
      const response = await ticketService.exportTickets(params);

      // Create blob and trigger download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tickets_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success({ content: 'Export completed successfully', key: 'export' });
    } catch (error) {
      console.error('Export error:', error);
      message.error({ content: error.message || 'Failed to export tickets', key: 'export' });
    }
  };

  const getActionMenu = (ticket) => ({
    items: [
      {
        key: 'view',
        label: 'View Details',
        icon: <EyeOutlined />,
        onClick: () => handleViewTicket(ticket)
      },
      {
        key: 'assign',
        label: 'Assign Engineer',
        icon: <UserAddOutlined />,
        onClick: () => handleAssignEngineer(ticket),
        disabled: ticket.status === 'closed'
      },
      {
        key: 'close',
        label: 'Close Ticket',
        icon: <CheckCircleOutlined />,
        onClick: () => handleCloseTicket(ticket),
        disabled: ticket.status === 'closed'
      }
    ]
  });

  const columns = [
    {
      title: 'Ticket #',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      width: 130,
      fixed: 'left',
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
      width: 120,
      render: (status) => (
        <Tag color={ticketService.getStatusColor(status)}>
          {ticketService.getStatusDisplayName(status).toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Open', value: 'open' },
        { text: 'Assigned', value: 'assigned' },
        { text: 'In Progress', value: 'in_progress' },
        { text: 'Resolved', value: 'resolved' },
        { text: 'Closed', value: 'closed' }
      ]
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
      ),
      filters: [
        { text: 'Low', value: 'low' },
        { text: 'Medium', value: 'medium' },
        { text: 'High', value: 'high' },
        { text: 'Critical', value: 'critical' },
        { text: 'Emergency', value: 'emergency' }
      ]
    },
    {
      title: 'Created For',
      key: 'created_by_user',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.created_by_user_name}</div>
          <div className="text-xs text-gray-500">{record.created_by_user_email}</div>
        </div>
      )
    },
    {
      title: 'Assigned To',
      key: 'engineer',
      width: 180,
      render: (_, record) =>
        record.engineer_name ? (
          <div>
            <div className="font-medium">{record.engineer_name}</div>
            <div className="text-xs text-gray-500">{record.engineer_email}</div>
          </div>
        ) : (
          <Tag color="default">Unassigned</Tag>
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
      title: 'Created',
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
          <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
          <p className="text-gray-600">
            Manage support tickets and assign engineers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Tickets"
              value={stats.total_tickets}
              prefix={<IssuesCloseOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Open Tickets"
              value={stats.open_tickets}
              valueStyle={{ color: '#1890ff' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={stats.in_progress_tickets}
              valueStyle={{ color: '#722ed1' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Badge count={stats.overdue_tickets} offset={[10, 0]}>
              <Statistic
                title="Resolved Today"
                value={stats.resolved_today}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Badge>
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Search
            placeholder="Search tickets..."
            allowClear
            style={{ width: 300 }}
            onSearch={(value) => handleFilterChange('search', value)}
            enterButton={<SearchOutlined />}
          />

          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => handleFilterChange('status', value)}
            value={filters.status || undefined}
          >
            <Option value="open">Open</Option>
            <Option value="assigned">Assigned</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="pending">Pending</Option>
            <Option value="resolved">Resolved</Option>
            <Option value="closed">Closed</Option>
          </Select>

          <Select
            placeholder="Filter by Priority"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => handleFilterChange('priority', value)}
            value={filters.priority || undefined}
          >
            <Option value="low">Low</Option>
            <Option value="medium">Medium</Option>
            <Option value="high">High</Option>
            <Option value="critical">Critical</Option>
            <Option value="emergency">Emergency</Option>
          </Select>

          <Select
            placeholder="Filter by Category"
            allowClear
            style={{ width: 180 }}
            onChange={(value) => handleFilterChange('category', value)}
            value={filters.category || undefined}
          >
            <Option value="Hardware">Hardware</Option>
            <Option value="Software">Software</Option>
            <Option value="Network">Network</Option>
            <Option value="Access">Access</Option>
            <Option value="Other">Other</Option>
          </Select>

          <div className="flex-1" />

          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={loading}
            >
              Export
            </Button>

            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchTickets();
                fetchStats();
              }}
              disabled={loading}
            >
              Refresh
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateTicket}
            >
              Create Ticket
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={tickets}
          rowKey="ticket_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Modals */}
      <CreateTicketModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      <AssignEngineerModal
        visible={assignModalVisible}
        ticket={selectedTicket}
        onClose={() => {
          setAssignModalVisible(false);
          setSelectedTicket(null);
        }}
        onSuccess={handleAssignSuccess}
      />

      <CloseTicketModal
        visible={closeModalVisible}
        ticket={selectedTicket}
        onClose={() => {
          setCloseModalVisible(false);
          setSelectedTicket(null);
        }}
        onSuccess={handleCloseSuccess}
      />

      <TicketDetailsDrawer
        visible={detailsDrawerVisible}
        ticket={selectedTicket}
        onClose={() => {
          setDetailsDrawerVisible(false);
          setSelectedTicket(null);
        }}
        onUpdate={() => {
          fetchTickets();
          fetchStats();
        }}
      />
    </div>
  );
};

export default TicketDashboard;
