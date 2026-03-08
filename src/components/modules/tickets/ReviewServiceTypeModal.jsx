import React, { useState } from 'react';
import { Modal, Input, Button, message, Descriptions, Tag, Space, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ToolOutlined, SwapOutlined } from '@ant-design/icons';
import ticketService from '../../../services/ticket';

const { TextArea } = Input;

const ReviewServiceTypeModal = ({ visible, ticket, request, onClose, onSuccess }) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const serviceTypeLabel = request?.proposed_service_type === 'repair' ? 'Repair Service' : 'Replacement Service';
  const serviceTypeIcon = request?.proposed_service_type === 'repair' ? <ToolOutlined /> : <SwapOutlined />;

  const handleReview = async (action) => {
    setLoading(true);
    try {
      await ticketService.reviewServiceTypeChange(
        ticket.ticket_id,
        request.request_id,
        action,
        reviewNotes || null
      );
      message.success(`Service type change ${action === 'approved' ? 'approved' : 'rejected'} successfully`);
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to review request';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReviewNotes('');
    onClose();
  };

  if (!request) return null;

  return (
    <Modal
      title="Review Service Type Change Request"
      open={visible}
      onCancel={handleClose}
      width={550}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => handleReview('rejected')}
            loading={loading}
          >
            Reject
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleReview('approved')}
            loading={loading}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Approve
          </Button>
        </div>
      }
    >
      <Alert
        message="Service Type Change Request"
        description="An engineer has requested to change the service type for this ticket. Approving will auto-create a draft service report."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Ticket">{ticket?.ticket_number}</Descriptions.Item>
        <Descriptions.Item label="Title">{ticket?.title}</Descriptions.Item>
        <Descriptions.Item label="Requested By">{request.engineer_name}</Descriptions.Item>
        <Descriptions.Item label="Current Service Type">
          <Tag color="blue">General Support</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Proposed Service Type">
          <Tag color={request.proposed_service_type === 'repair' ? 'orange' : 'red'} icon={serviceTypeIcon}>
            {serviceTypeLabel}
          </Tag>
        </Descriptions.Item>
        {request.request_notes && (
          <Descriptions.Item label="Engineer Notes">{request.request_notes}</Descriptions.Item>
        )}
        <Descriptions.Item label="Requested On">
          {new Date(request.created_at).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>

      <div>
        <strong style={{ display: 'block', marginBottom: 8 }}>Review Notes (Optional)</strong>
        <TextArea
          value={reviewNotes}
          onChange={(e) => setReviewNotes(e.target.value)}
          placeholder="Add your review notes..."
          rows={3}
          maxLength={1000}
          showCount
        />
      </div>
    </Modal>
  );
};

export default ReviewServiceTypeModal;
