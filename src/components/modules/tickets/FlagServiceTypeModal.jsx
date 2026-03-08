import React, { useState } from 'react';
import { Modal, Radio, Input, message, Alert, Space, Typography } from 'antd';
import { ToolOutlined, SwapOutlined } from '@ant-design/icons';
import ticketService from '../../../services/ticket';

const { TextArea } = Input;
const { Text } = Typography;

const FlagServiceTypeModal = ({ visible, ticket, onClose, onSuccess }) => {
  const [serviceType, setServiceType] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!serviceType) {
      message.warning('Please select a service type');
      return;
    }

    setLoading(true);
    try {
      await ticketService.requestServiceTypeChange(ticket.ticket_id, serviceType, notes || null);
      message.success('Service type change request submitted successfully');
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to submit request';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setServiceType(null);
    setNotes('');
    onClose();
  };

  return (
    <Modal
      title="Flag Service Type"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleClose}
      okText="Submit Request"
      confirmLoading={loading}
      okButtonProps={{ disabled: !serviceType }}
      width={500}
    >
      <Alert
        message="Service Type Change Request"
        description={`Ticket ${ticket?.ticket_number} - "${ticket?.title}". This request will be sent to a coordinator for approval.`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Select Service Type *</Text>
        <Radio.Group
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio.Button value="repair" style={{ width: '100%', height: 'auto', padding: '12px 16px' }}>
              <Space>
                <ToolOutlined />
                <div>
                  <div><strong>Repair Service</strong></div>
                </div>
              </Space>
            </Radio.Button>
            <Radio.Button value="replace" style={{ width: '100%', height: 'auto', padding: '12px 16px' }}>
              <Space>
                <SwapOutlined />
                <div>
                  <div><strong>Replacement Service</strong></div>
                </div>
              </Space>
            </Radio.Button>
          </Space>
        </Radio.Group>
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Notes (Optional)</Text>
        <TextArea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe why this service type is needed..."
          rows={3}
          maxLength={1000}
          showCount
        />
      </div>
    </Modal>
  );
};

export default FlagServiceTypeModal;
