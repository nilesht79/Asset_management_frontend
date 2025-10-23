/**
 * Make Assignment Permanent Modal
 * Confirmation modal to convert temporary standby assignment to permanent
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
  Card,
  Typography,
  Alert,
  Space
} from 'antd';
import {
  makeAssignmentPermanent,
  selectAssignmentOperationLoading,
  clearOperationError
} from '../../../store/slices/standbyAssignmentSlice';
import { LockOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text, Title } = Typography;

const MakePermanentModal = ({ visible, onClose, assignment, onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  // Redux state
  const loading = useSelector(selectAssignmentOperationLoading);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      dispatch(clearOperationError());
    }
  }, [visible, form, dispatch]);

  // Handle submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      await dispatch(
        makeAssignmentPermanent({
          assignmentId: assignment.id,
          notes: values.notes || ''
        })
      ).unwrap();

      message.success('Assignment made permanent successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      message.error(error || 'Failed to make assignment permanent');
    }
  };

  if (!assignment) return null;

  const assignmentDuration = dayjs().diff(dayjs(assignment.assigned_date), 'days');
  const isOverdue =
    assignment.expected_return_date &&
    dayjs().isAfter(dayjs(assignment.expected_return_date));

  return (
    <Modal
      title={
        <Space>
          <LockOutlined />
          Make Assignment Permanent
        </Space>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      okText="Make Permanent"
      okButtonProps={{ danger: true }}
      cancelText="Cancel"
    >
      {/* Warning Alert */}
      <Alert
        message="Permanent Action"
        description="This action cannot be undone. The standby asset will become a permanent assignment and will no longer be available in the standby pool."
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        style={{ marginBottom: 16 }}
      />

      {/* Overdue Alert */}
      {isOverdue && (
        <Alert
          message="Assignment Overdue"
          description={`This assignment is ${dayjs().diff(
            dayjs(assignment.expected_return_date),
            'days'
          )} days overdue. Making it permanent is appropriate if the original asset will not return.`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Assignment Summary */}
      <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f0f2f5' }}>
        <Title level={5} style={{ marginTop: 0 }}>
          Assignment Details
        </Title>

        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text strong>User:</Text>
            <div>{assignment.user_name}</div>
          </Col>
          <Col span={12}>
            <Text strong>Duration:</Text>
            <div>{assignmentDuration} days</div>
          </Col>
          <Col span={12}>
            <Text strong>Standby Asset:</Text>
            <div>{assignment.standby_asset_tag}</div>
          </Col>
          <Col span={12}>
            <Text strong>Status:</Text>
            <div style={{ textTransform: 'uppercase' }}>{assignment.status}</div>
          </Col>
          <Col span={12}>
            <Text strong>Original Asset:</Text>
            <div>{assignment.original_asset_tag || 'N/A'}</div>
          </Col>
          <Col span={12}>
            <Text strong>Reason Category:</Text>
            <div style={{ textTransform: 'capitalize' }}>{assignment.reason_category}</div>
          </Col>
          <Col span={12}>
            <Text strong>Assigned Date:</Text>
            <div>{dayjs(assignment.assigned_date).format('YYYY-MM-DD')}</div>
          </Col>
          <Col span={12}>
            <Text strong>Expected Return:</Text>
            <div>
              {assignment.expected_return_date ? (
                <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
                  {dayjs(assignment.expected_return_date).format('YYYY-MM-DD')}
                  {isOverdue && ' (Overdue)'}
                </span>
              ) : (
                'Not specified'
              )}
            </div>
          </Col>
          <Col span={24}>
            <Text strong>Original Reason:</Text>
            <div>{assignment.reason}</div>
          </Col>
        </Row>
      </Card>

      {/* What will happen */}
      <Card
        size="small"
        style={{ marginBottom: 16, backgroundColor: '#fff7e6', borderColor: '#ffd591' }}
      >
        <Title level={5} style={{ marginTop: 0 }}>
          <LockOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
          What will happen:
        </Title>
        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
          <li>
            The standby asset <strong>({assignment.standby_asset_tag})</strong> will become a
            permanent assignment to {assignment.user_name}
          </li>
          <li>The asset will be removed from the standby pool permanently</li>
          <li>The standby flags will be removed from the asset</li>
          <li>Assignment status will be marked as "Permanent"</li>
          <li>
            {assignment.original_asset_id
              ? 'The original asset will remain in its current state (likely retired/disposed)'
              : 'No original asset to handle'}
          </li>
        </ul>
      </Card>

      {/* Form */}
      <Form form={form} layout="vertical">
        <Form.Item
          name="notes"
          label="Reason for Making Permanent"
          tooltip="Explain why this temporary assignment is being made permanent"
          rules={[
            { required: true, message: 'Please provide a reason' },
            { min: 10, message: 'Reason must be at least 10 characters' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Example: Original asset was damaged beyond repair and will be disposed. User will keep the standby laptop permanently."
            showCount
            maxLength={1000}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MakePermanentModal;
