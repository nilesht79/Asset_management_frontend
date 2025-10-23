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
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  message,
  Empty,
  Tooltip,
  Badge,
  Descriptions,
  Timeline,
  Divider,
  Alert,
  Statistic,
  Progress,
  Spin
} from 'antd';
import {
  LaptopOutlined,
  PlusOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ToolOutlined,
  InboxOutlined,
  SendOutlined,
  HistoryOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  RiseOutlined,
  FileSearchOutlined,
  DashboardOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { fetchMyRequisitions, createRequisition } from '../../../../store/slices/requisitionSlice';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Forms
  const [requestForm] = Form.useForm();

  // Redux state
  const user = useSelector(state => state.auth.user);
  const { requisitions, loading } = useSelector(state => state.requisitions);

  // Dashboard statistics
  const [stats, setStats] = useState({
    totalRequisitions: 0,
    pendingRequisitions: 0,
    approvedRequisitions: 0,
    rejectedRequisitions: 0,
    assignedAssets: 0,
    completedRequisitions: 0
  });

  // Recent activity
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (requisitions.length > 0) {
      calculateStats(requisitions);
      prepareRecentActivity(requisitions);
    }
  }, [requisitions]);

  const loadDashboardData = async () => {
    try {
      await dispatch(fetchMyRequisitions({ limit: 100 })).unwrap();
    } catch (error) {
      message.error('Failed to load dashboard data');
      console.error(error);
    }
  };

  const calculateStats = (requisitionsData) => {
    const newStats = {
      totalRequisitions: requisitionsData.length,
      pendingRequisitions: requisitionsData.filter(r =>
        ['pending_dept_head', 'pending_it_head', 'pending_assignment'].includes(r.status)
      ).length,
      approvedRequisitions: requisitionsData.filter(r =>
        ['approved_by_dept_head', 'approved_by_it_head'].includes(r.status)
      ).length,
      rejectedRequisitions: requisitionsData.filter(r =>
        ['rejected_by_dept_head', 'rejected_by_it_head', 'cancelled'].includes(r.status)
      ).length,
      assignedAssets: requisitionsData.filter(r =>
        ['assigned', 'delivered'].includes(r.status)
      ).length,
      completedRequisitions: requisitionsData.filter(r => r.status === 'completed').length
    };
    setStats(newStats);
  };

  const prepareRecentActivity = (requisitionsData) => {
    const activities = requisitionsData
      .slice(0, 5)
      .map(req => ({
        id: req.requisition_id,
        requisition_number: req.requisition_number,
        status: req.status,
        purpose: req.purpose,
        created_at: req.created_at,
        urgency: req.urgency
      }));
    setRecentActivity(activities);
  };

  // Status renderers
  const getStatusTag = (status) => {
    const statusConfig = {
      pending_dept_head: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending Dept Head' },
      approved_by_dept_head: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Dept Approved' },
      rejected_by_dept_head: { color: 'red', icon: <CloseCircleOutlined />, text: 'Dept Rejected' },
      pending_it_head: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending IT Head' },
      approved_by_it_head: { color: 'blue', icon: <CheckCircleOutlined />, text: 'IT Approved' },
      rejected_by_it_head: { color: 'red', icon: <CloseCircleOutlined />, text: 'IT Rejected' },
      pending_assignment: { color: 'purple', icon: <ClockCircleOutlined />, text: 'Pending Assignment' },
      assigned: { color: 'cyan', icon: <CheckCircleOutlined />, text: 'Asset Assigned' },
      delivered: { color: 'lime', icon: <CheckCircleOutlined />, text: 'Delivered' },
      completed: { color: 'green', icon: <CheckCircleOutlined />, text: 'Completed' },
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

  // Requisitions Table Columns
  const requisitionsColumns = [
    {
      title: 'Requisition #',
      dataIndex: 'requisition_number',
      key: 'requisition_number',
      render: (text) => <Text strong code>{text}</Text>,
      width: 150
    },
    {
      title: 'Purpose',
      dataIndex: 'purpose',
      key: 'purpose',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Product Type',
      dataIndex: 'product_type_name',
      key: 'product_type_name',
      width: 150
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      width: 180
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
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/requisitions/${record.requisition_id}`)}
        >
          View
        </Button>
      ),
      width: 100
    }
  ];

  // Handle Request Asset
  const handleRequestAsset = async (values) => {
    try {
      setSubmitting(true);
      await dispatch(createRequisition(values)).unwrap();
      message.success('Asset requisition submitted successfully');
      requestForm.resetFields();
      setRequestModalVisible(false);
      loadDashboardData();
    } catch (error) {
      message.error(error.message || 'Failed to submit requisition');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Spin spinning={loading}>
        {/* Header Section */}
        <div style={{ marginBottom: 24 }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Col>
              <Title level={2} style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#262626' }}>
                Employee Dashboard
              </Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                Welcome back, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
              </Text>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setRequestModalVisible(true)}
                size="large"
              >
                New Requisition
              </Button>
            </Col>
          </Row>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Requisitions"
                value={stats.totalRequisitions}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#262626' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Pending Review"
                value={stats.pendingRequisitions}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Assets Assigned"
                value={stats.assignedAssets}
                prefix={<LaptopOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Completed"
                value={stats.completedRequisitions}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Area */}
        <Row gutter={[16, 16]}>
          {/* Left Column - Requisitions Overview */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  <Text strong>My Requisitions</Text>
                  <Badge count={stats.totalRequisitions} />
                </Space>
              }
              extra={
                <Button
                  type="link"
                  onClick={() => navigate('/requisitions/my-requisitions')}
                >
                  View All
                </Button>
              }
              bordered={false}
              style={{ marginBottom: '16px' }}
            >
              <Table
                columns={requisitionsColumns}
                dataSource={requisitions.slice(0, 5)}
                rowKey="requisition_id"
                loading={loading}
                pagination={false}
                scroll={{ x: 800 }}
                locale={{
                  emptyText: (
                    <Empty
                      description="No requisitions found"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setRequestModalVisible(true)}
                      >
                        Create Your First Requisition
                      </Button>
                    </Empty>
                  )
                }}
              />
            </Card>

            {/* Requisition Status Overview */}
            {stats.totalRequisitions > 0 && (
              <Card
                title={<Text strong>Status Overview</Text>}
                bordered={false}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Pending Review</Text>
                      <Text type="secondary">
                        {stats.pendingRequisitions} / {stats.totalRequisitions}
                      </Text>
                    </div>
                    <Progress
                      percent={Math.round((stats.pendingRequisitions / stats.totalRequisitions) * 100)}
                      strokeColor="#faad14"
                      showInfo={false}
                    />
                  </div>
                  <div>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Assigned Assets</Text>
                      <Text type="secondary">
                        {stats.assignedAssets} / {stats.totalRequisitions}
                      </Text>
                    </div>
                    <Progress
                      percent={Math.round((stats.assignedAssets / stats.totalRequisitions) * 100)}
                      strokeColor="#52c41a"
                      showInfo={false}
                    />
                  </div>
                  <div>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <Text>Completed</Text>
                      <Text type="secondary">
                        {stats.completedRequisitions} / {stats.totalRequisitions}
                      </Text>
                    </div>
                    <Progress
                      percent={Math.round((stats.completedRequisitions / stats.totalRequisitions) * 100)}
                      strokeColor="#1890ff"
                      showInfo={false}
                    />
                  </div>
                </Space>
              </Card>
            )}
          </Col>

          {/* Right Column - Recent Activity & Quick Actions */}
          <Col xs={24} lg={8}>
            {/* Quick Actions */}
            <Card
              title={<Text strong>Quick Actions</Text>}
              bordered={false}
              style={{ marginBottom: '16px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setRequestModalVisible(true)}
                  block
                >
                  New Requisition
                </Button>
                <Button
                  icon={<FileTextOutlined />}
                  onClick={() => navigate('/requisitions/my-requisitions')}
                  block
                >
                  View All Requisitions
                </Button>
                <Button
                  icon={<HistoryOutlined />}
                  onClick={() => navigate('/requisitions/my-requisitions?status=completed')}
                  block
                >
                  View History
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
                      key={activity.id}
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
                        <Space size={4} wrap>
                          {getStatusTag(activity.status)}
                          {getUrgencyTag(activity.urgency)}
                        </Space>
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ marginBottom: 4, color: '#8c8c8c', fontSize: '13px' }}
                        >
                          {activity.purpose}
                        </Paragraph>
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

        {/* Quick Requisition Modal */}
        <Modal
          title="Create New Requisition"
          open={requestModalVisible}
          onCancel={() => {
            setRequestModalVisible(false);
            requestForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Alert
            message="For full requisition form with all options, click below"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            action={
              <Button
                size="small"
                type="link"
                onClick={() => {
                  setRequestModalVisible(false);
                  navigate('/requisitions/new');
                }}
              >
                Go to Full Form
              </Button>
            }
          />
          <Form
            form={requestForm}
            layout="vertical"
            onFinish={handleRequestAsset}
          >
            <Form.Item
              name="purpose"
              label="Purpose / Justification"
              rules={[
                { required: true, message: 'Please provide the purpose' },
                { min: 20, message: 'Please provide at least 20 characters' }
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Explain why you need this asset..."
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="category_id"
                  label="Category"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Select placeholder="Select category">
                    <Select.Option value={1}>Laptop</Select.Option>
                    <Select.Option value={2}>Desktop</Select.Option>
                    <Select.Option value={3}>Monitor</Select.Option>
                    <Select.Option value={4}>Keyboard</Select.Option>
                    <Select.Option value={5}>Mouse</Select.Option>
                    <Select.Option value={6}>Headset</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="product_type_id"
                  label="Product Type"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Select placeholder="Select type">
                    <Select.Option value={1}>Standard Laptop</Select.Option>
                    <Select.Option value={2}>Workstation</Select.Option>
                    <Select.Option value={3}>Monitor 24"</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="quantity"
                  label="Quantity"
                  rules={[{ required: true }]}
                  initialValue={1}
                >
                  <Input type="number" min={1} max={10} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="urgency"
                  label="Urgency"
                  rules={[{ required: true }]}
                  initialValue="medium"
                >
                  <Select>
                    <Select.Option value="low">Low</Select.Option>
                    <Select.Option value="medium">Medium</Select.Option>
                    <Select.Option value="high">High</Select.Option>
                    <Select.Option value="critical">Critical</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="required_by_date"
                  label="Required By"
                  rules={[{ required: true }]}
                >
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0 }}>
              <Space style={{ float: 'right' }}>
                <Button
                  onClick={() => {
                    setRequestModalVisible(false);
                    requestForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  icon={<SendOutlined />}
                >
                  Submit Requisition
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
};

export default EmployeeDashboard;
