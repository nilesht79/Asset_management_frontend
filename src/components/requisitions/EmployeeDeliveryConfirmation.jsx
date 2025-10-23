import React, { useState } from 'react';
import { Modal, Button, Alert, Descriptions, Space, message } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  SignatureOutlined
} from '@ant-design/icons';
import SignatureCapture from './SignatureCapture';
import api from '../../services/api';
import './EmployeeDeliveryConfirmation.css';

const EmployeeDeliveryConfirmation = ({
  requisition,
  visible,
  onCancel,
  onSuccess
}) => {
  const [signatureData, setSignatureData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Info, 2: Signature, 3: Confirmation

  const handleSignatureComplete = (signature) => {
    setSignatureData(signature);
    setStep(3);
  };

  const handleConfirm = async () => {
    if (!signatureData) {
      message.warning('Please provide your signature');
      return;
    }

    try {
      setLoading(true);

      // Call API to confirm delivery
      await api.post(`/delivery-tickets/${requisition.delivery_ticket_id}/confirm-by-employee`, {
        signature_data: signatureData
      });

      message.success('Delivery confirmed successfully! Thank you.');

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to confirm delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSignatureData(null);
    setStep(1);
    onCancel();
  };

  const renderStep1 = () => (
    <div>
      <Alert
        message="Asset Delivery Confirmation"
        description="Please review the asset details below and confirm receipt. You will be asked to provide your digital signature as acknowledgment."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Descriptions
        title="Asset Details"
        bordered
        size="small"
        column={1}
      >
        <Descriptions.Item label="Asset Tag">
          {requisition.assigned_asset_tag}
        </Descriptions.Item>
        {requisition.product_name && (
          <Descriptions.Item label="Product">
            {requisition.product_name}
            {requisition.product_model && ` - ${requisition.product_model}`}
          </Descriptions.Item>
        )}
        {requisition.category_name && (
          <Descriptions.Item label="Category">
            {requisition.category_name}
          </Descriptions.Item>
        )}
        {requisition.product_type_name && (
          <Descriptions.Item label="Product Type">
            {requisition.product_type_name}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Requisition Number">
          {requisition.requisition_number}
        </Descriptions.Item>
        <Descriptions.Item label="Purpose">
          {requisition.purpose}
        </Descriptions.Item>
      </Descriptions>

      <Alert
        message="Important Notice"
        description={
          <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li>Please inspect the asset for any physical damage</li>
            <li>Verify the asset is in working condition</li>
            <li>Ensure all accessories (if any) are included</li>
            <li>Your signature confirms receipt and acceptance of the asset</li>
            <li>You will be responsible for this asset going forward</li>
          </ul>
        }
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        style={{ marginTop: 16 }}
      />
    </div>
  );

  const renderStep2 = () => (
    <div>
      <Alert
        message="Digital Signature Required"
        description="Please sign in the box below using your mouse or touch screen. Your signature confirms that you have received the asset in good condition."
        type="info"
        showIcon
        icon={<SignatureOutlined />}
        style={{ marginBottom: 16 }}
      />

      <SignatureCapture onComplete={handleSignatureComplete} />
    </div>
  );

  const renderStep3 = () => (
    <div>
      <Alert
        message="Ready to Confirm"
        description="You have reviewed the asset details and provided your signature. Click 'Confirm Receipt' to complete the process."
        type="success"
        showIcon
        icon={<CheckCircleOutlined />}
        style={{ marginBottom: 16 }}
      />

      <div style={{ textAlign: 'center', padding: '20px' }}>
        <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
        <h3 style={{ marginTop: 16 }}>Signature Captured</h3>
        <p>Your digital signature has been recorded successfully.</p>
      </div>

      <Descriptions
        title="Confirmation Summary"
        bordered
        size="small"
        column={1}
      >
        <Descriptions.Item label="Asset Tag">
          {requisition.assigned_asset_tag}
        </Descriptions.Item>
        <Descriptions.Item label="Requisition">
          {requisition.requisition_number}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          Ready to Confirm
        </Descriptions.Item>
      </Descriptions>
    </div>
  );

  const getFooter = () => {
    const buttons = [];

    if (step === 1) {
      buttons.push(
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button
          key="next"
          type="primary"
          onClick={() => setStep(2)}
          icon={<SignatureOutlined />}
        >
          Proceed to Signature
        </Button>
      );
    } else if (step === 2) {
      buttons.push(
        <Button key="back" onClick={() => setStep(1)}>
          Back
        </Button>,
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>
      );
      // Note: SignatureCapture component will have its own Complete button
    } else if (step === 3) {
      buttons.push(
        <Button key="back" onClick={() => { setStep(2); setSignatureData(null); }}>
          Retake Signature
        </Button>,
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          loading={loading}
          icon={<CheckCircleOutlined />}
        >
          Confirm Receipt
        </Button>
      );
    }

    return buttons;
  };

  return (
    <Modal
      title={
        <Space>
          <CheckCircleOutlined style={{ color: '#1890ff' }} />
          Confirm Asset Delivery - Step {step} of 3
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={getFooter()}
      width={700}
      className="employee-delivery-confirmation-modal"
    >
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </Modal>
  );
};

export default EmployeeDeliveryConfirmation;
