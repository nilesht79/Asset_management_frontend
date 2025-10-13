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
  Statistic
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
  InfoCircleOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('assets');
  const [myAssets, setMyAssets] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myTickets, setMyTickets] = useState([]);

  // Modal states
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Forms
  const [requestForm] = Form.useForm();
  const [ticketForm] = Form.useForm();

  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // Mock data for now
      setMyAssets([
        {
          id: 1,
          assetTag: 'AST-2024-001',
          productName: 'Dell Latitude 5420',
          category: 'Laptop',
          serialNumber: 'DL5420-2024-001',
          assignedDate: '2024-01-15',
          condition: 'Good',
          warrantyExpiry: '2026-01-15'
        },
        {
          id: 2,
          assetTag: 'AST-2024-045',
          productName: 'HP Monitor 24"',
          category: 'Monitor',
          serialNumber: 'HP24-2024-045',
          assignedDate: '2024-01-15',
          condition: 'Good',
          warrantyExpiry: '2025-01-15'
        }
      ]);

      setMyRequests([
        {
          id: 1,
          requestId: 'REQ-2024-123',
          productType: 'Desktop Computer',
          quantity: 1,
          status: 'pending_dept_head',
          requestDate: '2024-03-01',
          reason: 'Current laptop is outdated'
        },
        {
          id: 2,
          requestId: 'REQ-2024-089',
          productType: 'Wireless Mouse',
          quantity: 1,
          status: 'approved',
          requestDate: '2024-02-15',
          reason: 'Mouse not working',
          approvedDate: '2024-02-16'
        }
      ]);

      setMyTickets([
        {
          id: 1,
          ticketId: 'TKT-2024-456',
          assetTag: 'AST-2024-001',
          issueType: 'Hardware Issue',
          subject: 'Laptop screen flickering',
          status: 'in_progress',
          priority: 'high',
          createdDate: '2024-03-05',
          assignedTo: 'John Doe (Engineer)'
        }
      ]);
    } catch (error) {
      message.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Status renderers
  const getStatusTag = (status) => {
    const statusConfig = {
      pending_dept_head: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Pending Dept Head' },
      pending_it_head: { color: 'blue', icon: <ClockCircleOutlined />, text: 'Pending IT Head' },
      approved: { color: 'green', icon: <CheckCircleOutlined />, text: 'Approved' },
      rejected: { color: 'red', icon: <CloseCircleOutlined />, text: 'Rejected' },
      allocated: { color: 'success', icon: <CheckCircleOutlined />, text: 'Allocated' },
      in_progress: { color: 'processing', icon: <ToolOutlined />, text: 'In Progress' },
      resolved: { color: 'success', icon: <CheckCircleOutlined />, text: 'Resolved' },
      open: { color: 'default', icon: <InboxOutlined />, text: 'Open' }
    };

    const config = statusConfig[status] || { color: 'default', icon: null, text: status };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // My Assets Table
  const assetsColumns = [
    {
      title: 'Asset Tag',
      dataIndex: 'assetTag',
      key: 'assetTag',
      render: (text) => <Text strong code>{text}</Text>
    },
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.category}</Text>
        </Space>
      )
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (text) => <Text code style={{ fontSize: 11 }}>{text}</Text>
    },
    {
      title: 'Assigned Date',
      dataIndex: 'assignedDate',
      key: 'assignedDate',
      render: (date) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Condition',
      dataIndex: 'condition',
      key: 'condition',
      render: (condition) => (
        <Tag color={condition === 'Good' ? 'green' : 'orange'}>{condition}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedItem(record);
                setDetailModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Report Issue">
            <Button
              type="text"
              icon={<WarningOutlined />}
              onClick={() => {
                ticketForm.setFieldsValue({ assetTag: record.assetTag });
                setTicketModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // My Requests Table
  const requestsColumns = [
    {
      title: 'Request ID',
      dataIndex: 'requestId',
      key: 'requestId',
      render: (text) => <Text strong code>{text}</Text>
    },
    {
      title: 'Product Type',
      dataIndex: 'productType',
      key: 'productType',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Request Date',
      dataIndex: 'requestDate',
      key: 'requestDate',
      render: (date) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedItem(record);
            setDetailModalVisible(true);
          }}
        >
          View
        </Button>
      )
    }
  ];

  // My Tickets Table
  const ticketsColumns = [
    {
      title: 'Ticket ID',
      dataIndex: 'ticketId',
      key: 'ticketId',
      render: (text) => <Text strong code>{text}</Text>
    },
    {
      title: 'Asset',
      dataIndex: 'assetTag',
      key: 'assetTag',
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Issue',
      dataIndex: 'subject',
      key: 'subject',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.issueType}</Text>
        </Space>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = { low: 'default', medium: 'blue', high: 'orange', critical: 'red' };
        return <Tag color={colors[priority]}>{priority.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (text) => <Text style={{ fontSize: 12 }}>{text || 'Unassigned'}</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedItem(record);
            setDetailModalVisible(true);
          }}
        >
          View
        </Button>
      )
    }
  ];

  // Handle Request Asset
  const handleRequestAsset = async (values) => {
    try {
      setLoading(true);
      // TODO: API call to create requisition
      message.success('Asset request submitted successfully');
      requestForm.resetFields();
      setRequestModalVisible(false);
      loadDashboardData();
    } catch (error) {
      message.error('Failed to submit request');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Create Ticket
  const handleCreateTicket = async (values) => {
    try {
      setLoading(true);
      // TODO: API call to create ticket
      message.success('Ticket created successfully');
      ticketForm.resetFields();
      setTicketModalVisible(false);
      loadDashboardData();
    } catch (error) {
      message.error('Failed to create ticket');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Section */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            My Workspace
          </Title>
          <Text type="secondary">Manage your assets, requests, and support tickets</Text>
        </Col>
        <Col>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setRequestModalVisible(true)}
              size="large"
            >
              Request Asset
            </Button>
            <Button
              icon={<ToolOutlined />}
              onClick={() => setTicketModalVisible(true)}
              size="large"
            >
              Report Issue
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="My Assets"
              value={myAssets.length}
              prefix={<LaptopOutlined />}
              valueStyle={{ color: '#262626' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Requests"
              value={myRequests.filter(r => r.status.includes('pending')).length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Open Tickets"
              value={myTickets.filter(t => ['open', 'in_progress'].includes(t.status)).length}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Approved Requests"
              value={myRequests.filter(r => r.status === 'approved').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          <Tabs.TabPane
            tab={
              <span>
                <LaptopOutlined />
                My Assets ({myAssets.length})
              </span>
            }
            key="assets"
          >
            <Table
              columns={assetsColumns}
              dataSource={myAssets}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{
                emptyText: (
                  <Empty
                    description="No assets assigned to you yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )
              }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                <FileTextOutlined />
                My Requests ({myRequests.length})
              </span>
            }
            key="requests"
          >
            <Table
              columns={requestsColumns}
              dataSource={myRequests}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{
                emptyText: (
                  <Empty
                    description="You haven't made any requests yet"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setRequestModalVisible(true)}
                    >
                      Request Your First Asset
                    </Button>
                  </Empty>
                )
              }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                <ToolOutlined />
                My Tickets ({myTickets.length})
              </span>
            }
            key="tickets"
          >
            <Table
              columns={ticketsColumns}
              dataSource={myTickets}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{
                emptyText: (
                  <Empty
                    description="No support tickets created"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    <Button
                      icon={<ToolOutlined />}
                      onClick={() => setTicketModalVisible(true)}
                    >
                      Report an Issue
                    </Button>
                  </Empty>
                )
              }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Request Asset Modal */}
      <Modal
        title={
          <Space>
            <PlusOutlined />
            <span>Request New Asset</span>
          </Space>
        }
        open={requestModalVisible}
        onCancel={() => {
          setRequestModalVisible(false);
          requestForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Alert
          message="Asset Request Process"
          description="Your request will be reviewed by your Department Head, then IT Head, and finally allocated by the Coordinator."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={requestForm}
          layout="vertical"
          onFinish={handleRequestAsset}
        >
          <Form.Item
            name="productCategory"
            label="Product Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select product category">
              <Select.Option value="laptop">Laptop</Select.Option>
              <Select.Option value="desktop">Desktop Computer</Select.Option>
              <Select.Option value="monitor">Monitor</Select.Option>
              <Select.Option value="keyboard">Keyboard</Select.Option>
              <Select.Option value="mouse">Mouse</Select.Option>
              <Select.Option value="headset">Headset</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="productType"
            label="Product Type / Model"
            rules={[{ required: true, message: 'Please specify product type' }]}
          >
            <Input placeholder="e.g., Dell Latitude 5420, HP Monitor 24 inch" />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
            initialValue={1}
          >
            <Input type="number" min={1} />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason for Request"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <TextArea
              rows={4}
              placeholder="Explain why you need this asset..."
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => {
                setRequestModalVisible(false);
                requestForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SendOutlined />}>
                Submit Request
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Ticket Modal */}
      <Modal
        title={
          <Space>
            <ToolOutlined />
            <span>Report Issue / Create Ticket</span>
          </Space>
        }
        open={ticketModalVisible}
        onCancel={() => {
          setTicketModalVisible(false);
          ticketForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={ticketForm}
          layout="vertical"
          onFinish={handleCreateTicket}
        >
          <Form.Item
            name="assetTag"
            label="Asset Tag"
            rules={[{ required: true, message: 'Please enter asset tag' }]}
          >
            <Select
              placeholder="Select asset"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {myAssets.map(asset => (
                <Select.Option key={asset.id} value={asset.assetTag}>
                  {asset.assetTag} - {asset.productName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="issueType"
            label="Issue Type"
            rules={[{ required: true, message: 'Please select issue type' }]}
          >
            <Select placeholder="Select issue type">
              <Select.Option value="hardware">Hardware Issue</Select.Option>
              <Select.Option value="software">Software Issue</Select.Option>
              <Select.Option value="performance">Performance Issue</Select.Option>
              <Select.Option value="network">Network/Connectivity</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
            initialValue="medium"
          >
            <Select>
              <Select.Option value="low">Low</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="critical">Critical</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter subject' }]}
          >
            <Input placeholder="Brief description of the issue" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Detailed Description"
            rules={[{ required: true, message: 'Please describe the issue' }]}
          >
            <TextArea
              rows={4}
              placeholder="Provide detailed information about the issue..."
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => {
                setTicketModalVisible(false);
                ticketForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SendOutlined />}>
                Create Ticket
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail View Modal */}
      <Modal
        title={selectedItem?.assetTag || selectedItem?.requestId || selectedItem?.ticketId}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedItem(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedItem && (
          <Descriptions bordered column={2} size="small">
            {Object.entries(selectedItem).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {typeof value === 'string' && value.includes('pending') ? getStatusTag(value) : value}
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default EmployeeDashboard;
