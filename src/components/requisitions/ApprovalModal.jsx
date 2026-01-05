import React from 'react';
import { Modal, Form, Input, Space, Tag, Descriptions, Alert } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import './ApprovalModal.css';
import { formatDateOnly } from '../../utils/dateUtils';

const { TextArea } = Input;

const ApprovalModal = ({
  visible,
  onCancel,
  onSubmit,
  requisition,
  action, // 'approve' or 'reject'
  role, // 'Department Head' or 'IT Head'
  loading = false
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const urgencyConfig = {
    low: { label: 'Low', color: 'green' },
    medium: { label: 'Medium', color: 'blue' },
    high: { label: 'High', color: 'orange' },
    critical: { label: 'Critical', color: 'red' }
  };

  const urgency = urgencyConfig[requisition?.urgency] || urgencyConfig.medium;

  const isApproval = action === 'approve';
  const title = isApproval ? `Approve Requisition` : `Reject Requisition`;
  const icon = isApproval ? (
    <CheckCircleOutlined style={{ color: '#52c41a' }} />
  ) : (
    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
  );

  const alertType = isApproval ? 'success' : 'error';
  const alertMessage = isApproval
    ? `You are about to approve this requisition. It will be forwarded to the IT Head for final approval.`
    : `You are about to reject this requisition. The employee will be notified of your decision.`;

  return (
    <Modal
      title={
        <Space>
          {icon}
          {title}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={isApproval ? 'Approve' : 'Reject'}
      okButtonProps={{
        type: isApproval ? 'primary' : 'default',
        danger: !isApproval
      }}
      width={700}
      className="approval-modal"
    >
      {requisition && (
        <div>
          {/* Alert */}
          <Alert
            message={alertMessage}
            type={alertType}
            showIcon
            icon={isApproval ? <CheckCircleOutlined /> : <WarningOutlined />}
            style={{ marginBottom: 16 }}
          />

          {/* Requisition Summary */}
          <div className="requisition-summary">
            <Descriptions
              title="Requisition Details"
              bordered
              size="small"
              column={2}
            >
              <Descriptions.Item label="Requisition Number" span={2}>
                <Tag color="blue">{requisition.requisition_number}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Urgency" span={2}>
                <Tag color={urgency.color}>
                  {urgency.color === 'red' && <WarningOutlined />} {urgency.label}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Requester">
                {requisition.requester_name}
              </Descriptions.Item>

              <Descriptions.Item label="Department">
                {requisition.department_name}
              </Descriptions.Item>

              {requisition.category_name && (
                <Descriptions.Item label="Category">
                  {requisition.category_name}
                </Descriptions.Item>
              )}

              {requisition.subcategory_name && (
                <Descriptions.Item label="Subcategory">
                  {requisition.subcategory_name}
                </Descriptions.Item>
              )}

              {requisition.product_name && (
                <Descriptions.Item label="Requested Product" span={2}>
                  {requisition.product_name}
                  {requisition.product_model && ` - ${requisition.product_model}`}
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Quantity">
                {requisition.quantity}
              </Descriptions.Item>

              {requisition.required_by_date && (
                <Descriptions.Item label="Required By">
                  {formatDateOnly(requisition.required_by_date)}
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Purpose" span={2}>
                {requisition.purpose}
              </Descriptions.Item>

              <Descriptions.Item label="Justification" span={2}>
                {requisition.justification}
              </Descriptions.Item>

              {requisition.specifications && (
                <Descriptions.Item label="Specifications" span={2}>
                  {requisition.specifications}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>

          {/* Comments Form */}
          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: 16 }}
          >
            <Form.Item
              name="comments"
              label={isApproval ? 'Comments (Optional)' : 'Rejection Reason (Required)'}
              rules={[
                {
                  required: !isApproval,
                  message: 'Please provide a reason for rejection'
                },
                {
                  min: isApproval ? 0 : 20,
                  message: 'Rejection reason must be at least 20 characters'
                },
                {
                  max: 1000,
                  message: 'Comments must not exceed 1000 characters'
                }
              ]}
              help={
                isApproval
                  ? 'Add any notes or conditions for approval (optional)'
                  : 'Explain why this requisition is being rejected. This will be shared with the employee.'
              }
            >
              <TextArea
                rows={4}
                placeholder={
                  isApproval
                    ? 'e.g., Approved. Please coordinate with IT for asset allocation.'
                    : 'e.g., The requested asset is not aligned with current budget constraints. Please discuss alternatives with your supervisor.'
                }
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Form>

          {/* Warning for Critical Items */}
          {requisition.urgency === 'critical' && (
            <Alert
              message="Critical Priority Requisition"
              description="This is a critical priority request. Please review carefully and process promptly."
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              style={{ marginTop: 16 }}
            />
          )}
        </div>
      )}
    </Modal>
  );
};

export default ApprovalModal;
