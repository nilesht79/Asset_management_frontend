import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Card, Row, Col, message, Tag, Alert } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import ticketService from '../../../services/ticket';

const { TextArea } = Input;

const CloseTicketModal = ({ visible, ticket, onClose, onSuccess }) => {
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
      await ticketService.closeTicket(ticket.ticket_id, values.resolution_notes);
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Failed to close ticket:', error);
      message.error(
        error.response?.data?.message || 'Failed to close ticket'
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
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <span>Close Ticket</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Close Ticket"
      okButtonProps={{ danger: false, type: 'primary' }}
      confirmLoading={loading}
      width={650}
      destroyOnClose
    >
      {/* Warning Alert */}
      <Alert
        message="Closing Ticket"
        description="Once closed, this ticket will be marked as resolved and removed from active queue. You can provide resolution notes below."
        type="info"
        showIcon
        className="mb-4"
      />

      {/* Ticket Info */}
      <Card size="small" className="mb-4" style={{ backgroundColor: '#fffbe6', borderColor: '#ffe58f' }}>
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
            <div className="text-gray-700 mt-1">{ticket.description}</div>
          </div>

          <Row gutter={16} className="mt-2">
            <Col span={12}>
              <div>
                <span className="font-semibold">Created For:</span>
                <div>{ticket.created_by_user_name}</div>
                <div className="text-xs text-gray-500">
                  {ticket.created_by_user_email}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <span className="font-semibold">Assigned To:</span>
                <div>
                  {ticket.engineer_name || (
                    <Tag color="default">Unassigned</Tag>
                  )}
                </div>
                {ticket.engineer_email && (
                  <div className="text-xs text-gray-500">
                    {ticket.engineer_email}
                  </div>
                )}
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <div>
                <span className="font-semibold">Status:</span>
                <div>
                  <Tag color={ticketService.getStatusColor(ticket.status)}>
                    {ticketService.getStatusDisplayName(ticket.status)}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <span className="font-semibold">Priority:</span>
                <div>
                  <Tag color={ticketService.getPriorityColor(ticket.priority)}>
                    {ticketService.getPriorityDisplayName(ticket.priority)}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div>
                <span className="font-semibold">Category:</span>
                <div>{ticket.category || 'N/A'}</div>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Resolution Notes */}
        <Form.Item
          name="resolution_notes"
          label="Resolution Notes"
          rules={[
            { required: true, message: 'Please provide resolution notes' },
            { min: 10, message: 'Resolution notes must be at least 10 characters' }
          ]}
          extra="Describe how the issue was resolved and any actions taken"
        >
          <TextArea
            rows={5}
            placeholder="Example: Issue resolved by replacing faulty RAM module. System tested and confirmed working properly. User notified and verified satisfaction."
            maxLength={2000}
            showCount
          />
        </Form.Item>
      </Form>

      <div className="text-xs text-gray-500 mt-2">
        💡 Tip: Detailed resolution notes help track common issues and improve future support.
      </div>
    </Modal>
  );
};

export default CloseTicketModal;
