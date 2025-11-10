import React, { useState } from 'react';
import { Modal, Alert, Checkbox, Typography, Space, List } from 'antd';
import { WarningOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

/**
 * ForceCompleteModal - Modal to confirm force-completing a reconciliation with pending assets
 * @param {boolean} visible - Whether modal is visible
 * @param {function} onConfirm - Callback when user confirms
 * @param {function} onCancel - Callback when user cancels
 * @param {number} pendingCount - Number of pending assets
 * @param {object} reconciliation - Current reconciliation object
 */
const ForceCompleteModal = ({
  visible,
  onConfirm,
  onCancel,
  pendingCount,
  reconciliation
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      await onConfirm();
      handleClose();
    } catch (error) {
      console.error('Force complete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmed(false);
    setLoading(false);
    onCancel();
  };

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 20 }} />
          <span>Force Complete Reconciliation</span>
        </Space>
      }
      open={visible}
      onOk={handleOk}
      onCancel={handleClose}
      okText="Force Complete"
      cancelText="Cancel"
      okButtonProps={{
        danger: true,
        disabled: !confirmed,
        loading: loading
      }}
      width={600}
      maskClosable={false}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Warning Alert */}
        <Alert
          message="Incomplete Reconciliation Warning"
          description={
            <Paragraph style={{ margin: 0 }}>
              This reconciliation has <Text strong>{pendingCount}</Text> asset(s) that have not been reconciled yet.
              Force-completing will mark the reconciliation as completed without verifying all assets.
            </Paragraph>
          }
          type="warning"
          showIcon
          icon={<WarningOutlined />}
        />

        {/* Reconciliation Details */}
        <div>
          <Text strong>Reconciliation:</Text>
          <div style={{ marginTop: 8, paddingLeft: 16 }}>
            <div><Text type="secondary">Name:</Text> {reconciliation?.reconciliation_name || 'N/A'}</div>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">Total Assets:</Text> {reconciliation?.total_assets || 0}
            </div>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">Reconciled:</Text> {reconciliation?.reconciled_assets || 0}
            </div>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">Pending:</Text> <Text strong style={{ color: '#faad14' }}>{pendingCount}</Text>
            </div>
          </div>
        </div>

        {/* Consequences */}
        <div>
          <Text strong>What will happen if you force complete:</Text>
          <List
            size="small"
            style={{ marginTop: 8 }}
            dataSource={[
              'The reconciliation status will be changed to "Completed"',
              `${pendingCount} pending assets will remain unverified`,
              'The reconciliation will be marked as "force completed" in the system',
              'You will not be able to add or reconcile more assets',
              'This action can help generate reports even with incomplete data'
            ]}
            renderItem={(item) => (
              <List.Item style={{ padding: '4px 0', border: 'none' }}>
                <Text>• {item}</Text>
              </List.Item>
            )}
          />
        </div>

        {/* Best Practices */}
        <Alert
          message="Best Practice Recommendation"
          description="Consider pausing this reconciliation instead of force-completing. This allows you to resume verification later without losing progress."
          type="info"
          showIcon
        />

        {/* Confirmation Checkbox */}
        <Checkbox
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        >
          <Text>
            I understand that <Text strong>{pendingCount} assets</Text> will remain unverified
            and I want to force complete this reconciliation anyway
          </Text>
        </Checkbox>
      </Space>
    </Modal>
  );
};

export default ForceCompleteModal;
