import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Card, Row, Col, message, Tag, Alert } from 'antd';
import { SendOutlined, ClockCircleOutlined } from '@ant-design/icons';
import ticketService from '../../../services/ticket';

const { TextArea } = Input;

const RequestCloseTicketModal = ({ visible, ticket, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && ticket) {
      form.resetFields();
    }
  }, [visible, ticket]);

  const handleSubmit = async (values) => {
    if (!ticket) return;

    setLoading(true);
    try {
      await ticketService.requestTicketClose(ticket.ticket_id, values.request_notes);
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Failed to request ticket close:', error);
      message.error(
        error.response?.data?.message || 'Failed to submit close request'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return null;

  const calculateDuration = () => {
    if (!ticket.created_at) return 'N/A';
    const created = new Date(ticket.created_at);
    const now = new Date();
    const diffMs = now - created;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <SendOutlined style={{ color: '#1890ff' }} />
          <span>Request Ticket Closure</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Submit Request"
      okButtonProps={{ type: 'primary' }}
      confirmLoading={loading}
      width={650}
      destroyOnClose
    >
      {/* Info Alert */}
      <Alert
        message="Submit Close Request"
        description="Your coordinator will review your request and can approve or reject it. Provide detailed resolution notes explaining what was done to resolve the ticket."
        type="info"
        showIcon
        className="mb-4"
      />

      {/* Ticket Info */}
      <Card size="small" className="mb-4" style={{ backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}>
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold">Ticket:</span>{' '}
              <Tag color="blue">{ticket.ticket_number}</Tag>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                <ClockCircleOutlined /> Duration
              </div>
              <div className="font-semibold">{calculateDuration()}</div>
            </div>
          </div>

          <div>
            <span className="font-semibold">Title:</span> {ticket.title}
          </div>

          <div>
            <span className="font-semibold">Description:</span>
            <div className="text-gray-700 mt-1">{ticket.description || 'N/A'}</div>
          </div>

          <Row gutter={16} className="mt-2">
            <Col span={8}>
              <div className="text-xs text-gray-500">Priority</div>
              <Tag color={ticketService.getPriorityColor(ticket.priority)}>
                {ticketService.getPriorityDisplayName(ticket.priority).toUpperCase()}
              </Tag>
            </Col>
            <Col span={8}>
              <div className="text-xs text-gray-500">Status</div>
              <Tag color={ticketService.getStatusColor(ticket.status)}>
                {ticketService.getStatusDisplayName(ticket.status).toUpperCase()}
              </Tag>
            </Col>
            <Col span={8}>
              <div className="text-xs text-gray-500">Department</div>
              <div className="font-medium">{ticket.department_name || 'N/A'}</div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="request_notes"
          label="Resolution Notes"
          rules={[
            {
              required: true,
              message: 'Please provide resolution notes'
            },
            {
              min: 20,
              message: 'Please provide at least 20 characters describing the resolution'
            }
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Describe what was done to resolve this ticket... (minimum 20 characters)

Example:
- Diagnosed the issue as a faulty network cable
- Replaced the cable with a new one
- Tested the connection and verified internet access
- Issue is now resolved and user can access the network"
            maxLength={2000}
            showCount
          />
        </Form.Item>

        <Alert
          message="Important"
          description="After submitting, the ticket status will change to 'Pending Closure' and await coordinator approval."
          type="warning"
          showIcon
          className="mt-2"
        />
      </Form>
    </Modal>
  );
};

export default RequestCloseTicketModal;
