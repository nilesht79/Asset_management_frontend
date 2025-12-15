import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Card, Row, Col, message, Tag, Alert, Button } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ToolOutlined, SwapOutlined, FileTextOutlined } from '@ant-design/icons';
import ticketService from '../../../services/ticket';
import serviceReportService from '../../../services/serviceReport';
import ServiceReportModal from './ServiceReportModal';

const { TextArea } = Input;

const CloseTicketModal = ({ visible, ticket, linkedAssets = [], onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showServiceReport, setShowServiceReport] = useState(false);
  const [serviceReportCompleted, setServiceReportCompleted] = useState(false);

  // Check if ticket requires service report
  const requiresServiceReport = ticket?.service_type === 'repair' || ticket?.service_type === 'replace';
  const isRepair = ticket?.service_type === 'repair';
  const isReplace = ticket?.service_type === 'replace';

  useEffect(() => {
    if (visible && ticket) {
      form.resetFields();
      setServiceReportCompleted(false);
      setShowServiceReport(false);
    }
  }, [visible, ticket]);

  const handleSubmit = async (values) => {
    if (!ticket) return;

    // If service report is required but not completed, show service report modal
    if (requiresServiceReport && !serviceReportCompleted) {
      setShowServiceReport(true);
      return;
    }

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

  const handleServiceReportSuccess = () => {
    setShowServiceReport(false);
    setServiceReportCompleted(true);
    message.success('Service report created. Now complete the resolution notes to close the ticket.');
  };

  const handleOpenServiceReport = () => {
    setShowServiceReport(true);
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
      {/* Service Type Alert */}
      {requiresServiceReport && !serviceReportCompleted && (
        <Alert
          message={
            <span>
              {isRepair ? <ToolOutlined /> : <SwapOutlined />}{' '}
              {isRepair ? 'Repair Service Report Required' : 'Replacement Service Report Required'}
            </span>
          }
          description={
            <div>
              <p>
                {isRepair
                  ? 'This ticket requires a service report documenting the repair work and spare parts used.'
                  : 'This ticket requires a service report documenting the replacement and asset transfer.'}
              </p>
              <Button
                type="primary"
                size="small"
                icon={<FileTextOutlined />}
                onClick={handleOpenServiceReport}
                style={{ marginTop: 8 }}
              >
                Create Service Report
              </Button>
            </div>
          }
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      {/* Service Report Completed Alert */}
      {requiresServiceReport && serviceReportCompleted && (
        <Alert
          message="Service Report Created"
          description="Service report has been submitted. You can now close the ticket with resolution notes."
          type="success"
          showIcon
          className="mb-4"
        />
      )}

      {/* Standard Close Alert */}
      {!requiresServiceReport && (
        <Alert
          message="Closing Ticket"
          description="Once closed, this ticket will be marked as resolved and removed from active queue. You can provide resolution notes below."
          type="info"
          showIcon
          className="mb-4"
        />
      )}

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
            <Col span={6}>
              <div>
                <span className="font-semibold">Status:</span>
                <div>
                  <Tag color={ticketService.getStatusColor(ticket.status)}>
                    {ticketService.getStatusDisplayName(ticket.status)}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <span className="font-semibold">Priority:</span>
                <div>
                  <Tag color={ticketService.getPriorityColor(ticket.priority)}>
                    {ticketService.getPriorityDisplayName(ticket.priority)}
                  </Tag>
                </div>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <span className="font-semibold">Category:</span>
                <div>{ticket.category || 'N/A'}</div>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <span className="font-semibold">Service Type:</span>
                <div>
                  <Tag color={serviceReportService.getServiceTypeColor(ticket.service_type)}>
                    {serviceReportService.getServiceTypeDisplayName(ticket.service_type)}
                  </Tag>
                </div>
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
        {requiresServiceReport
          ? '💡 Tip: Service reports help track repair costs, spare parts usage, and asset lifecycle.'
          : '💡 Tip: Detailed resolution notes help track common issues and improve future support.'}
      </div>

      {/* Service Report Modal */}
      <ServiceReportModal
        visible={showServiceReport}
        ticket={ticket}
        linkedAssets={linkedAssets}
        onClose={() => setShowServiceReport(false)}
        onSuccess={handleServiceReportSuccess}
      />
    </Modal>
  );
};

export default CloseTicketModal;
