import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Card,
  Button,
  Space,
  Table,
  Tag,
  Input,
  Select,
  message,
  Modal,
  Form,
  DatePicker,
  Descriptions,
  Tabs,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeliveredProcedureOutlined,
  PrinterOutlined,
  SendOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import api from '../services/api';
import moment from 'moment';
import './DeliveryManagement.css';

const { Option } = Select;
const { TextArea } = Input;

const DeliveryManagement = () => {
  const [deliveryTickets, setDeliveryTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    delivery_type: '',
    board_id: '',
    department_id: ''
  });
  const [activeTab, setActiveTab] = useState('active');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateAction, setUpdateAction] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [form] = Form.useForm();
  const [boards, setBoards] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    active: 0, // in_transit + pending_verification + pending_confirmation
    completed: 0, // delivered
    failed: 0
  });

  useEffect(() => {
    loadDeliveryTickets();
  }, [filters, activeTab]);

  useEffect(() => {
    loadBoards();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (filters.board_id !== undefined) {
      loadDepartments();
    }
  }, [filters.board_id]);

  useEffect(() => {
    if (deliveryTickets.length > 0) {
      const newStats = {
        active: deliveryTickets.filter(t =>
          t.status === 'in_transit' ||
          t.status === 'pending_verification' ||
          t.status === 'pending_confirmation'
        ).length,
        completed: deliveryTickets.filter(t => t.status === 'delivered').length,
        failed: deliveryTickets.filter(t => t.status === 'failed').length
      };
      setStats(newStats);
    }
  }, [deliveryTickets]);

  const loadDeliveryTickets = async () => {
    try {
      setLoading(true);

      // Load all delivery tickets
      const response = await api.get('/delivery-tickets', { params: filters });
      let tickets = response.data.data || response.data;

      // Filter by active tab on client side
      if (activeTab === 'active') {
        tickets = tickets.filter(t =>
          t.status === 'in_transit' ||
          t.status === 'pending_verification' ||
          t.status === 'pending_confirmation'
        );
      } else if (activeTab === 'completed') {
        tickets = tickets.filter(t => t.status === 'delivered');
      } else if (activeTab === 'failed') {
        tickets = tickets.filter(t => t.status === 'failed');
      }

      setDeliveryTickets(tickets);
    } catch (error) {
      console.error('Failed to load delivery tickets:', error);
      message.error('Failed to load delivery tickets');
    } finally {
      setLoading(false);
    }
  };

  const loadBoards = async () => {
    try {
      const response = await api.get('/boards', {
        params: { limit: 1000, page: 1 }
      });
      const data = response.data.data || response.data;
      setBoards(data.boards || data || []);
    } catch (error) {
      console.error('Failed to load boards:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await api.get('/departments', {
        params: {
          limit: 1000,
          page: 1,
          board_id: filters.board_id || undefined
        }
      });
      const data = response.data.data || response.data;
      setDepartments(data.departments || data || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: '', delivery_type: '', board_id: '', department_id: '' });
  };

  const handleUpdateClick = (ticket, action) => {
    setSelectedTicket(ticket);
    setUpdateAction(action);
    setUpdateModalVisible(true);
    form.resetFields();
  };

  const handleUpdateSubmit = async () => {
    try {
      const values = await form.validateFields();
      setProcessingId(selectedTicket.ticket_id);

      let endpoint = '';
      let payload = values;
      let method = 'PUT';
      let isFileUpload = false;

      switch (updateAction) {
        case 'upload_signature':
          endpoint = `/delivery-tickets/${selectedTicket.ticket_id}/upload-signed-form`;
          method = 'POST';
          isFileUpload = true;
          // Create FormData for file upload
          const formData = new FormData();
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput && fileInput.files[0]) {
            formData.append('signed_form', fileInput.files[0]);
          }
          payload = formData;
          break;

        case 'verify':
          endpoint = `/delivery-tickets/${selectedTicket.ticket_id}/verify-signature`;
          payload = {
            verification_notes: values.verification_notes,
            approved: values.approved
          };
          break;

        case 'confirm_functionality':
          endpoint = `/delivery-tickets/${selectedTicket.ticket_id}/confirm-functionality`;
          payload = {
            functionality_notes: values.functionality_notes,
            confirmed: values.confirmed
          };
          break;

        case 'mark_delivered':
          endpoint = `/delivery-tickets/${selectedTicket.ticket_id}/mark-delivered`;
          payload = {
            notes: values.notes
          };
          break;

        default:
          break;
      }

      if (method === 'POST') {
        await api.post(endpoint, payload, isFileUpload ? {
          headers: { 'Content-Type': 'multipart/form-data' }
        } : {});
      } else {
        await api.put(endpoint, payload);
      }

      message.success(`Action completed successfully`);

      setUpdateModalVisible(false);
      setSelectedTicket(null);
      setUpdateAction(null);
      form.resetFields();
      loadDeliveryTickets();
    } catch (error) {
      message.error(error.response?.data?.message || `Failed to complete action`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleGenerateDeliveryForm = async (ticket) => {
    try {
      setProcessingId(ticket.ticket_id);
      const response = await api.post(`/delivery-tickets/${ticket.ticket_id}/generate-form`, {}, {
        responseType: 'blob'
      });

      // Create download link for PDF
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Delivery_Form_${ticket.ticket_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up the URL
      window.URL.revokeObjectURL(url);

      message.success('Delivery form generated successfully');
      loadDeliveryTickets();
    } catch (error) {
      message.error('Failed to generate delivery form');
    } finally {
      setProcessingId(null);
    }
  };

  const statusConfig = {
    in_transit: { label: 'In Transit', color: 'orange', icon: <SendOutlined /> },
    pending_verification: { label: 'Pending Verification', color: 'blue', icon: <ClockCircleOutlined /> },
    pending_confirmation: { label: 'Pending Confirmation', color: 'cyan', icon: <ClockCircleOutlined /> },
    delivered: { label: 'Delivered', color: 'green', icon: <CheckCircleOutlined /> },
    failed: { label: 'Failed', color: 'red', icon: <CloseCircleOutlined /> },
    cancelled: { label: 'Cancelled', color: 'default', icon: <CloseCircleOutlined /> }
  };

  const deliveryTypeConfig = {
    physical: { label: 'Physical Delivery', color: 'blue' },
    pickup: { label: 'Self Pickup', color: 'green' },
    courier: { label: 'Courier Service', color: 'purple' }
  };

  const columns = [
    {
      title: 'Ticket Number',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Requisition',
      dataIndex: 'requisition_number',
      key: 'requisition_number',
      width: 150,
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: 'Asset Tag',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      width: 120,
      render: (text) => <Tag color="cyan">{text}</Tag>
    },
    {
      title: 'Recipient',
      dataIndex: 'recipient_name',
      key: 'recipient_name',
      width: 150
    },
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department_name',
      width: 150
    },
    {
      title: 'Delivery Type',
      dataIndex: 'delivery_type',
      key: 'delivery_type',
      width: 130,
      render: (type) => {
        const config = deliveryTypeConfig[type] || deliveryTypeConfig.physical;
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const config = statusConfig[status] || statusConfig.pending;
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space size="small" wrap>
          {/* In Transit - Engineer uploads signed form */}
          {record.status === 'in_transit' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleUpdateClick(record, 'upload_signature')}
              loading={processingId === record.ticket_id}
            >
              Upload Signed Form
            </Button>
          )}

          {/* Pending Verification - Employee has signed, coordinator confirms functionality */}
          {record.status === 'pending_verification' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleUpdateClick(record, 'confirm_functionality')}
              loading={processingId === record.ticket_id}
            >
              Confirm Functionality
            </Button>
          )}

          {/* Pending Confirmation - Coordinator confirms functionality */}
          {record.status === 'pending_confirmation' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleUpdateClick(record, 'confirm_functionality')}
              loading={processingId === record.ticket_id}
            >
              Confirm Functionality
            </Button>
          )}

          {/* Mark as Delivered - Coordinator can bypass verification only for in_transit status */}
          {record.status === 'in_transit' && (
            <Button
              size="small"
              type="primary"
              danger
              onClick={() => handleUpdateClick(record, 'mark_delivered')}
              loading={processingId === record.ticket_id}
            >
              Mark as Delivered
            </Button>
          )}

          {/* Generate/View Form - Always available */}
          <Button
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handleGenerateDeliveryForm(record)}
            loading={processingId === record.ticket_id}
          >
            {record.physical_form_generated ? 'View/Print Form' : 'Generate Form'}
          </Button>
        </Space>
      )
    }
  ];

  const renderUpdateModal = () => {
    if (!selectedTicket) return null;

    let title = '';
    let fields = null;

    switch (updateAction) {
      case 'upload_signature':
        title = 'Upload Signed Form';
        fields = (
          <>
            <Form.Item
              name="signed_form"
              label="Upload Signed Form (PDF/Image)"
              rules={[{ required: true, message: 'Please upload signed form' }]}
            >
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
            </Form.Item>
            <Form.Item name="notes" label="Notes">
              <TextArea rows={3} placeholder="Add any notes..." />
            </Form.Item>
          </>
        );
        break;

      case 'verify':
        title = 'Verify Signature';
        fields = (
          <>
            {selectedTicket.recipient_signature_path && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ marginBottom: 8, fontWeight: 600 }}>Online Signature:</p>
                <img
                  src={`http://localhost:3001${selectedTicket.recipient_signature_path}`}
                  alt="Signature"
                  style={{ maxWidth: '100%', border: '1px solid #d9d9d9', padding: 8, borderRadius: 4 }}
                />
              </div>
            )}
            {selectedTicket.signed_form_upload_path && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ marginBottom: 8, fontWeight: 600 }}>Signed Form Upload:</p>
                <a
                  href={`http://localhost:3001${selectedTicket.signed_form_upload_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1890ff', textDecoration: 'underline' }}
                >
                  View Signed Form
                </a>
              </div>
            )}
            <Form.Item name="verification_notes" label="Verification Notes">
              <TextArea rows={3} placeholder="Add verification notes..." />
            </Form.Item>
            <Form.Item
              name="approved"
              label="Verification Decision"
              rules={[{ required: true, message: 'Please select verification decision' }]}
            >
              <Select placeholder="Select decision">
                <Select.Option value={true}>Approve - Signature Verified</Select.Option>
                <Select.Option value={false}>Reject - Signature Invalid</Select.Option>
              </Select>
            </Form.Item>
          </>
        );
        break;

      case 'confirm_functionality':
        title = 'Confirm Functionality';
        fields = (
          <>
            <Form.Item name="functionality_notes" label="Functionality Confirmation Notes">
              <TextArea rows={4} placeholder="Confirm asset functionality and employee satisfaction..." />
            </Form.Item>
            <Form.Item
              name="confirmed"
              label="Confirmation Decision"
              rules={[{ required: true, message: 'Please select confirmation decision' }]}
            >
              <Select placeholder="Select decision">
                <Select.Option value={true}>Confirm - Asset Working Properly</Select.Option>
                <Select.Option value={false}>Report Issues - Asset Not Functional</Select.Option>
              </Select>
            </Form.Item>
          </>
        );
        break;

      case 'mark_delivered':
        title = 'Mark as Delivered (Bypass Verification)';
        fields = (
          <>
            <div style={{ marginBottom: 16, padding: 12, background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 4 }}>
              <p style={{ margin: 0, color: '#d46b08', fontWeight: 500 }}>
                Warning: This will bypass signature verification and directly complete the delivery.
              </p>
            </div>
            <Form.Item name="notes" label="Notes" rules={[{ required: true, message: 'Please provide a reason for bypassing verification' }]}>
              <TextArea rows={4} placeholder="Why are you bypassing the verification process? (e.g., physical signature already verified in person, special circumstances...)" />
            </Form.Item>
          </>
        );
        break;

      default:
        break;
    }

    return (
      <Modal
        title={title}
        open={updateModalVisible}
        onCancel={() => {
          setUpdateModalVisible(false);
          setSelectedTicket(null);
          setUpdateAction(null);
          form.resetFields();
        }}
        onOk={handleUpdateSubmit}
        confirmLoading={processingId === selectedTicket.ticket_id}
        okText="Confirm"
      >
        <Descriptions bordered size="small" column={1} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Ticket Number">
            <Tag color="blue">{selectedTicket.ticket_number}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Recipient">
            {selectedTicket.recipient_name}
          </Descriptions.Item>
          <Descriptions.Item label="Asset">
            <Tag color="cyan">{selectedTicket.asset_tag}</Tag>
          </Descriptions.Item>
        </Descriptions>

        <Form form={form} layout="vertical">
          {fields}
        </Form>
      </Modal>
    );
  };

  const tabItems = [
    {
      key: 'active',
      label: (
        <span>
          <ClockCircleOutlined /> Active
          {stats.active > 0 && <span className="tab-badge">{stats.active}</span>}
        </span>
      )
    },
    {
      key: 'completed',
      label: <span><CheckCircleOutlined /> Completed</span>
    },
    {
      key: 'failed',
      label: (
        <span>
          <CloseCircleOutlined /> Failed
          {stats.failed > 0 && <span className="tab-badge">{stats.failed}</span>}
        </span>
      )
    }
  ];

  return (
    <div className="delivery-management-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Delivery Management</h2>
          <p className="page-description">Track and manage asset delivery tickets</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Deliveries"
              value={stats.active}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Failed"
              value={stats.failed}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap style={{ width: '100%' }}>
          <Input
            placeholder="Search by ticket or asset tag"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <Select
            placeholder="Delivery Type"
            value={filters.delivery_type || undefined}
            onChange={(value) => handleFilterChange('delivery_type', value)}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="physical">Physical Delivery</Option>
            <Option value="pickup">Self Pickup</Option>
            <Option value="courier">Courier Service</Option>
          </Select>

          <Select
            placeholder="Filter by Board"
            value={filters.board_id || undefined}
            onChange={(value) => {
              handleFilterChange('board_id', value);
              if (filters.department_id) {
                setFilters({ ...filters, board_id: value, department_id: '' });
              }
            }}
            style={{ width: 180 }}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {boards.map(board => (
              <Option key={board.id} value={board.id}>
                {board.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Filter by Department"
            value={filters.department_id || undefined}
            onChange={(value) => handleFilterChange('department_id', value)}
            style={{ width: 200 }}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {departments.map(dept => (
              <Option key={dept.id} value={dept.id}>
                {dept.name}
              </Option>
            ))}
          </Select>

          <Button icon={<FilterOutlined />} onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </Space>
      </Card>

      {/* Tabs & Table */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        <Table
          columns={columns}
          dataSource={deliveryTickets}
          loading={loading}
          rowKey="ticket_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} tickets`
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Update Modal */}
      {renderUpdateModal()}
    </div>
  );
};

export default DeliveryManagement;
