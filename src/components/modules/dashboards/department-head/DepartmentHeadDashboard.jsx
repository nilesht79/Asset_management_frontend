import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Statistic,
  Empty,
  Spin,
  Progress,
  Timeline,
  Badge,
  Tooltip
} from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
  TeamOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { fetchPendingDeptApprovals, fetchAllRequisitions } from '../../../../store/slices/requisitionSlice';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const DepartmentHeadDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPending: 0,
    approved: 0,
    rejected: 0,
    totalDepartmentRequests: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // Redux state
  const user = useSelector(state => state.auth.user);
  const { pendingApprovals, requisitions } = useSelector(state => state.requisitions);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    calculateStats();
    prepareRecentActivity();
  }, [pendingApprovals, requisitions]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch both pending approvals and all department requisitions
      await Promise.all([
        dispatch(fetchPendingDeptApprovals({ limit: 100 })).unwrap(),
        dispatch(fetchAllRequisitions({ limit: 100 })).unwrap()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const newStats = {
      totalPending: pendingApprovals?.length || 0,
      approved: requisitions.filter(r =>
        ['approved_by_dept_head', 'pending_it_head', 'approved_by_it_head', 'pending_assignment', 'assigned', 'delivered', 'completed'].includes(r.status)
      ).length,
      rejected: requisitions.filter(r => r.status === 'rejected_by_dept_head').length,
      totalDepartmentRequests: requisitions?.length || 0
    };
    setStats(newStats);
  };

  const prepareRecentActivity = () => {
    // Combine pending approvals and requisitions you've already acted on
    const myActivity = [];

    // Add pending approvals (you need to act on these)
    if (pendingApprovals && pendingApprovals.length > 0) {
      myActivity.push(...pendingApprovals);
    }

    // Add requisitions you've already approved or rejected
    if (requisitions && requisitions.length > 0) {
      const myActedRequisitions = requisitions.filter(r =>
        ['approved_by_dept_head', 'pending_it_head', 'approved_by_it_head', 'rejected_by_dept_head', 'pending_assignment', 'assigned', 'delivered', 'completed'].includes(r.status)
      );
      myActivity.push(...myActedRequisitions);
    }

    if (myActivity.length === 0) {
      setRecentActivity([]);
      return;
    }

    // Sort by most recent and take top 5
    const sorted = myActivity
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    setRecentActivity(sorted);
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      pending_dept_head: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending Your Review' },
      approved_by_dept_head: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Approved by You' },
      rejected_by_dept_head: { color: 'red', icon: <CloseCircleOutlined />, text: 'Rejected by You' },
      pending_it_head: { color: 'purple', icon: <ClockCircleOutlined />, text: 'Pending IT Head' },
      approved_by_it_head: { color: 'cyan', icon: <CheckCircleOutlined />, text: 'IT Approved' },
      rejected_by_it_head: { color: 'red', icon: <CloseCircleOutlined />, text: 'IT Rejected' },
      pending_assignment: { color: 'geekblue', icon: <ClockCircleOutlined />, text: 'Pending Assignment' },
      assigned: { color: 'green', icon: <CheckCircleOutlined />, text: 'Assigned' },
      delivered: { color: 'lime', icon: <CheckCircleOutlined />, text: 'Delivered' },
      completed: { color: 'success', icon: <CheckCircleOutlined />, text: 'Completed' },
      cancelled: { color: 'default', icon: <CloseCircleOutlined />, text: 'Cancelled' }
    };

    const config = statusConfig[status] || { color: 'default', icon: null, text: status };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getUrgencyTag = (urgency) => {
    const urgencyConfig = {
      low: { color: 'green', text: 'Low' },
      medium: { color: 'blue', text: 'Medium' },
      high: { color: 'orange', text: 'High' },
      critical: { color: 'red', text: 'Critical' }
    };
    const config = urgencyConfig[urgency] || urgencyConfig.medium;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Pending Approvals Table Columns
  const pendingColumns = [
    {
      title: 'Requisition #',
      dataIndex: 'requisition_number',
      key: 'requisition_number',
      render: (text) => <Text strong code>{text}</Text>,
      width: 150
    },
    {
      title: 'Employee',
      dataIndex: 'employee_name',
      key: 'employee_name',
      render: (text) => <Text>{text}</Text>,
      width: 150
    },
    {
      title: 'Product Type',
      dataIndex: 'product_type_name',
      key: 'product_type_name',
      width: 150
    },
    {
      title: 'Urgency',
      dataIndex: 'urgency',
      key: 'urgency',
      render: (urgency) => getUrgencyTag(urgency),
      width: 100
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <Tooltip title={dayjs(date).format('MMMM DD, YYYY HH:mm')}>
          {dayjs(date).fromNow()}
        </Tooltip>
      ),
      width: 120
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/requisitions/${record.requisition_id}`)}
        >
          Review
        </Button>
      ),
      width: 120
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Spin spinning={loading}>
        {/* Header Section */}
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#262626' }}>
                {user?.role === 'department_coordinator' ? 'Department Coordinator Dashboard' : 'Department Head Dashboard'}
              </Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Welcome back, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'} • {user?.department?.name || 'Department'}
              </Text>
            </Col>
          </Row>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Pending Your Review"
                value={stats.totalPending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Approved by You"
                value={stats.approved}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Rejected by You"
                value={stats.rejected}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Department Requests"
                value={stats.totalDepartmentRequests}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#262626' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Area */}
        <Row gutter={[16, 16]}>
          {/* Left Column - Pending Approvals */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <ClockCircleOutlined />
                  <Text strong>Pending Your Approval</Text>
                  <Badge count={stats.totalPending} />
                </Space>
              }
              extra={
                <Button
                  type="link"
                  onClick={() => navigate('/requisitions/pending-dept-approvals')}
                >
                  View All
                </Button>
              }
              bordered={false}
              style={{ marginBottom: '16px' }}
            >
              <Table
                columns={pendingColumns}
                dataSource={pendingApprovals.slice(0, 5)}
                rowKey="requisition_id"
                loading={loading}
                pagination={false}
                scroll={{ x: 800 }}
                locale={{
                  emptyText: (
                    <Empty
                      description="No pending approvals"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )
                }}
              />
            </Card>
          </Col>

          {/* Right Column - Quick Actions & Recent Activity */}
          <Col xs={24} lg={8}>
            {/* Quick Actions */}
            <Card
              title={<Text strong>Quick Actions</Text>}
              bordered={false}
              style={{ marginBottom: '16px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Button
                  icon={<TeamOutlined />}
                  onClick={() => navigate('/requisitions/all-requisitions')}
                  block
                >
                  View Department Requests
                </Button>
                <Button
                  icon={<HistoryOutlined />}
                  onClick={() => navigate('/requisitions/all-requisitions?status=approved_by_dept_head')}
                  block
                >
                  View Approval History
                </Button>
              </Space>
            </Card>

            {/* Recent Activity */}
            <Card
              title={
                <Space>
                  <HistoryOutlined />
                  <Text strong>Recent Activity</Text>
                </Space>
              }
              bordered={false}
            >
              {recentActivity.length > 0 ? (
                <Timeline>
                  {recentActivity.map((activity) => (
                    <Timeline.Item
                      key={activity.requisition_id}
                      color={
                        activity.status === 'completed' ? 'green' :
                        activity.status.includes('rejected') ? 'red' :
                        activity.status.includes('approved') ? 'blue' : 'orange'
                      }
                    >
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Text strong code style={{ fontSize: '12px' }}>
                          {activity.requisition_number}
                        </Text>
                        <Text style={{ fontSize: '12px' }}>
                          {activity.employee_name}
                        </Text>
                        <Space size={4} wrap>
                          {getStatusTag(activity.status)}
                          {getUrgencyTag(activity.urgency)}
                        </Space>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {dayjs(activity.created_at).fromNow()}
                        </Text>
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty
                  description="No recent activity"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default DepartmentHeadDashboard;
