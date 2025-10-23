import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Space,
  Table,
  Tag,
  Input,
  message,
  Modal,
  Form,
  Descriptions,
  Tabs,
  Row,
  Col,
  Statistic,
  Alert
} from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SendOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import api from '../services/api';
import moment from 'moment';
import './EngineerDeliveries.css';

const { TextArea } = Input;

const EngineerDeliveries = () => {
  const [deliveryTickets, setDeliveryTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('assigned_to_me');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [form] = Form.useForm();

  // Statistics
  const [stats, setStats] = useState({
    assigned_to_me: 0,
    pending_upload: 0,
    pending_verification: 0,
    completed: 0
  });

  useEffect(() => {
    loadDeliveryTickets();
  }, [searchText, activeTab]);

  useEffect(() => {
    if (deliveryTickets.length > 0) {
      const newStats = {
        assigned_to_me: deliveryTickets.filter(t =>
          t.status === 'in_transit' || t.status === 'pending_verification'
        ).length,
        pending_upload: deliveryTickets.filter(t => t.status === 'in_transit').length,
        pending_verification: deliveryTickets.filter(t => t.status === 'pending_verification').length,
        completed: deliveryTickets.filter(t => t.status === 'delivered').length
      };
      setStats(newStats);
    }
  }, [deliveryTickets]);

  const loadDeliveryTickets = async () => {
    try {
      setLoading(true);
      const params = {};

      // Engineers should see deliveries assigned to them
      if (searchText) {
        params.search = searchText;
      }

      // Filter by tab
      if (activeTab === 'assigned_to_me') {
        // Show in_transit and pending_verification
        params.assigned_engineer = 'me'; // Backend should filter by current user
      } else if (activeTab === 'pending_upload') {
        params.status = 'in_transit';
        params.assigned_engineer = 'me';
      } else if (activeTab === 'pending_verification') {
        params.status = 'pending_verification';
        params.assigned_engineer = 'me';
      } else if (activeTab === 'completed') {
        params.status = 'delivered';
        params.assigned_engineer = 'me';
      }

      const response = await api.get('/delivery-tickets', { params });
      setDeliveryTickets(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to load delivery tickets:', error);
      message.error('Failed to load delivery tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = (ticket) => {
    setSelectedTicket(ticket);
    setUploadModalVisible(true);
    form.resetFields();
  };

  const handleUploadSubmit = async () => {
    try {
      await form.validateFields();
      setProcessingId(selectedTicket.ticket_id);

      const fileInput = document.querySelector('input[type="file"]');
      if (!fileInput || !fileInput.files[0]) {
        message.error('Please select a file to upload');
        return;
      }

      const formData = new FormData();
      formData.append('signed_form', fileInput.files[0]);

      await api.post(
        `/delivery-tickets/${selectedTicket.ticket_id}/upload-signed-form`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      message.success('Signed form uploaded successfully');

      setUploadModalVisible(false);
      setSelectedTicket(null);
      form.resetFields();
      loadDeliveryTickets();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to upload signed form');
    } finally {
      setProcessingId(null);
    }
  };

  const handleGenerateDeliveryForm = async (ticket) => {
    try {
      setProcessingId(ticket.ticket_id);
      const response = await api.post(
        `/delivery-tickets/${ticket.ticket_id}/generate-form`,
        {},
        { responseType: 'blob' }
      );

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
    } catch (error) {
      message.error('Failed to generate delivery form');
    } finally {
      setProcessingId(null);
    }
  };

  const statusConfig = {
    in_transit: { label: 'In Transit', color: 'orange', icon: <SendOutlined /> },
    pending_verification: { label: 'Awaiting Verification', color: 'blue', icon: <ClockCircleOutlined /> },
    pending_confirmation: { label: 'Pending Confirmation', color: 'cyan', icon: <ClockCircleOutlined /> },
    delivered: { label: 'Delivered', color: 'green', icon: <CheckCircleOutlined /> },
    failed: { label: 'Failed', color: 'red', icon: <CloseCircleOutlined /> }
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
      title: 'Installation Date',
      dataIndex: 'scheduled_delivery_date',
      key: 'scheduled_delivery_date',
      width: 130,
      render: (date) => date ? moment(date).format('DD MMM YYYY') : '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        const config = statusConfig[status] || statusConfig.in_transit;
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
          {/* Upload signed form - Only for in_transit status */}
          {record.status === 'in_transit' && (
            <Button
              size="small"
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => handleUploadClick(record)}
              loading={processingId === record.ticket_id}
            >
              Upload Signed Form
            </Button>
          )}

          {/* Pending verification - Show status only */}
          {record.status === 'pending_verification' && (
            <Tag color="blue">Awaiting Coordinator Verification</Tag>
          )}

          {/* Generate/View Form - Always available */}
          <Button
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handleGenerateDeliveryForm(record)}
            loading={processingId === record.ticket_id}
          >
            View Form
          </Button>
        </Space>
      )
    }
  ];

  const renderUploadModal = () => {
    if (!selectedTicket) return null;

    return (
      <Modal
        title="Upload Signed Delivery Form"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          setSelectedTicket(null);
          form.resetFields();
        }}
        onOk={handleUploadSubmit}
        confirmLoading={processingId === selectedTicket.ticket_id}
        okText="Upload"
        width={600}
      >
        <Alert
          message="Instructions"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              <li>Visit the employee at their location</li>
              <li>Have the employee sign the printed delivery form</li>
              <li>Scan or take a clear photo of the signed form</li>
              <li>Upload the signed form below</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

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
          <Descriptions.Item label="Department">
            {selectedTicket.department_name}
          </Descriptions.Item>
          {selectedTicket.scheduled_delivery_date && (
            <Descriptions.Item label="Installation Date">
              {moment(selectedTicket.scheduled_delivery_date).format('DD MMM YYYY, hh:mm A')}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Form form={form} layout="vertical">
          <Form.Item
            name="signed_form"
            label="Signed Delivery Form"
            rules={[{ required: true, message: 'Please upload the signed form' }]}
          >
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px'
              }}
            />
          </Form.Item>

          <Form.Item name="notes" label="Notes (Optional)">
            <TextArea rows={3} placeholder="Add any notes about the delivery..." />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const tabItems = [
    {
      key: 'assigned_to_me',
      label: (
        <span>
          <SendOutlined /> Assigned to Me
          {stats.assigned_to_me > 0 && <span className="tab-badge">{stats.assigned_to_me}</span>}
        </span>
      )
    },
    {
      key: 'pending_upload',
      label: (
        <span>
          <UploadOutlined /> Pending Upload
          {stats.pending_upload > 0 && <span className="tab-badge">{stats.pending_upload}</span>}
        </span>
      )
    },
    {
      key: 'pending_verification',
      label: (
        <span>
          <ClockCircleOutlined /> Awaiting Verification
          {stats.pending_verification > 0 && <span className="tab-badge">{stats.pending_verification}</span>}
        </span>
      )
    },
    {
      key: 'completed',
      label: <span><CheckCircleOutlined /> Completed</span>
    }
  ];

  return (
    <div className="engineer-deliveries-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>My Deliveries</h2>
          <p className="page-description">Manage asset deliveries assigned to you</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Assigned to Me"
              value={stats.assigned_to_me}
              prefix={<SendOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Upload"
              value={stats.pending_upload}
              prefix={<UploadOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Awaiting Verification"
              value={stats.pending_verification}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Instructions */}
      <Alert
        message="Engineer Workflow"
        description={
          <ol style={{ marginBottom: 0, paddingLeft: 20 }}>
            <li><strong>In Transit:</strong> Delivery is assigned to you. Schedule visit with employee.</li>
            <li><strong>Upload Signed Form:</strong> Visit employee, have them sign the delivery form, then upload it here.</li>
            <li><strong>Awaiting Verification:</strong> Coordinator will verify the signature and complete the delivery.</li>
          </ol>
        }
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
      />

      {/* Search */}
      <Card style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by ticket number, asset tag, or recipient name"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: '100%', maxWidth: 500 }}
          allowClear
        />
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
            showTotal: (total) => `Total ${total} deliveries`
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Upload Modal */}
      {renderUploadModal()}
    </div>
  );
};

export default EngineerDeliveries;
