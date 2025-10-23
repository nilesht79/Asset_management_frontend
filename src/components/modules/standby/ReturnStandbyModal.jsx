/**
 * Return Standby Asset Modal
 * Form to return standby asset and swap back to original
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
  returnStandbyAsset,
  selectAssignmentOperationLoading,
  clearOperationError
} from '../../../store/slices/standbyAssignmentSlice';
import { SwapOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text, Title } = Typography;

const ReturnStandbyModal = ({ visible, onClose, assignment, onSuccess }) => {
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

      const returnData = {
        return_notes: values.return_notes || ''
      };

      await dispatch(
        returnStandbyAsset({
          assignmentId: assignment.id,
          returnData
        })
      ).unwrap();

      message.success('Standby asset returned successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      message.error(error || 'Failed to return standby asset');
    }
  };

  if (!assignment) return null;

  const assignmentDuration = dayjs().diff(dayjs(assignment.assigned_date), 'days');

  return (
    <Modal
      title={
        <Space>
          <SwapOutlined />
          Return Standby Asset
        </Space>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      okText="Confirm Return"
      cancelText="Cancel"
    >
      {/* Warning if no original asset */}
      {!assignment.original_asset_id && (
        <Alert
          message="No Original Asset"
          description="This assignment has no original asset. Returning will only unassign the standby asset from the user."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Assignment Summary */}
      <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f0f2f5' }}>
        <Title level={5} style={{ marginTop: 0 }}>
          Assignment Summary
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
            <Text strong>Original Asset:</Text>
            <div>{assignment.original_asset_tag || 'N/A'}</div>
          </Col>
          <Col span={12}>
            <Text strong>Assigned Date:</Text>
            <div>{dayjs(assignment.assigned_date).format('YYYY-MM-DD')}</div>
          </Col>
          <Col span={12}>
            <Text strong>Expected Return:</Text>
            <div>
              {assignment.expected_return_date
                ? dayjs(assignment.expected_return_date).format('YYYY-MM-DD')
                : 'Not specified'}
            </div>
          </Col>
          <Col span={24}>
            <Text strong>Reason:</Text>
            <div>{assignment.reason}</div>
          </Col>
        </Row>
      </Card>

      {/* What will happen */}
      <Card
        size="small"
        style={{ marginBottom: 16, backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}
      >
        <Title level={5} style={{ marginTop: 0 }}>
          <CheckCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          What will happen:
        </Title>
        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
          {assignment.original_asset_id ? (
            <>
              <li>
                <strong>Original asset ({assignment.original_asset_tag})</strong> will be reassigned
                to {assignment.user_name}
              </li>
              <li>
                <strong>Standby asset ({assignment.standby_asset_tag})</strong> will be returned to
                the standby pool
              </li>
            </>
          ) : (
            <li>
              <strong>Standby asset ({assignment.standby_asset_tag})</strong> will be unassigned
              from {assignment.user_name} and returned to the pool
            </li>
          )}
          <li>Assignment status will be marked as "Returned"</li>
          <li>Asset movement history will be updated</li>
        </ul>
      </Card>

      {/* Form */}
      <Form form={form} layout="vertical">
        <Form.Item
          name="return_notes"
          label="Return Notes"
          tooltip="Provide any notes about the condition of the returned asset or the return process"
        >
          <TextArea
            rows={4}
            placeholder="Optional: Provide return notes, asset condition, or any issues found..."
            showCount
            maxLength={1000}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReturnStandbyModal;
