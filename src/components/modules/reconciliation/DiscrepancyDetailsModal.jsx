import React, { useState, useEffect } from 'react';
import { Modal, Spin, Typography, Row, Col, Tag, Space, Descriptions, Divider, Alert } from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  TagOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Text, Title } = Typography;

const DiscrepancyDetailsModal = ({ visible, discrepancy, reconciliationId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (visible && discrepancy) {
      loadDetails();
    }
  }, [visible, discrepancy]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/v1/reconciliations/${reconciliationId}/discrepancies/${discrepancy.id}`
      );
      setDetails(response.data.data);
    } catch (error) {
      console.error('Failed to load discrepancy details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: { color: 'red', icon: <ExclamationCircleOutlined />, label: 'Critical' },
      major: { color: 'orange', icon: <WarningOutlined />, label: 'Major' },
      minor: { color: 'blue', icon: <InfoCircleOutlined />, label: 'Minor' }
    };
    return configs[severity] || configs.minor;
  };

  const getDiscrepancyTypeLabel = (type) => {
    const labels = {
      location_mismatch: 'Location Mismatch',
      condition_changed: 'Condition Changed',
      assignment_mismatch: 'Assignment Mismatch',
      serial_number_mismatch: 'Serial Number Mismatch',
      status_mismatch: 'Status Mismatch',
      asset_missing: 'Asset Missing',
      asset_damaged: 'Asset Damaged',
      extra_asset: 'Extra Asset',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getResolutionActionLabel = (action) => {
    const labels = {
      updated_system: 'Updated System',
      updated_physical: 'Updated Physical',
      verified_correct: 'Verified Correct',
      accepted_as_is: 'Accepted As-Is',
      escalated: 'Escalated'
    };
    return labels[action] || action;
  };

  if (!discrepancy) return null;

  const severityConfig = getSeverityConfig(discrepancy.severity);

  return (
    <Modal
      title={
        <Space>
          <TagOutlined />
          <span>Discrepancy Details</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Spin spinning={loading}>
        {details && (
          <div style={{ marginTop: 20 }}>
            {/* Status Badge */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              {details.is_resolved ? (
                <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 16, padding: '8px 16px' }}>
                  RESOLVED
                </Tag>
              ) : (
                <Tag color="warning" icon={<WarningOutlined />} style={{ fontSize: 16, padding: '8px 16px' }}>
                  PENDING
                </Tag>
              )}
            </div>

            {/* Asset Information */}
            <Alert
              type="info"
              message={
                <Space>
                  <Text strong>Asset:</Text>
                  <Text code style={{ fontSize: 16 }}>{details.asset_tag}</Text>
                </Space>
              }
              style={{ marginBottom: 24 }}
              showIcon
            />

            {/* Discrepancy Information */}
            <Descriptions title="Discrepancy Information" bordered column={2} size="small">
              <Descriptions.Item label="Field" span={2}>
                <Text strong>{details.field_display_name}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Type" span={2}>
                {getDiscrepancyTypeLabel(details.discrepancy_type)}
              </Descriptions.Item>

              <Descriptions.Item label="Severity" span={2}>
                <Tag color={severityConfig.color} icon={severityConfig.icon}>
                  {severityConfig.label}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="System Value">
                <Text code>{details.system_value || 'N/A'}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Physical Value">
                <Text code style={{ color: '#fa8c16' }}>{details.physical_value || 'N/A'}</Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Detection Information */}
            <Descriptions title="Detection Information" bordered column={2} size="small">
              <Descriptions.Item label="Detected By" span={2}>
                <Space>
                  <UserOutlined />
                  <Text>{details.detected_by_name}</Text>
                  {details.detected_by_email && (
                    <Text type="secondary">({details.detected_by_email})</Text>
                  )}
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Detected At" span={2}>
                <Space>
                  <ClockCircleOutlined />
                  <Text>{moment(details.detected_at).format('MMMM DD, YYYY HH:mm:ss')}</Text>
                  <Text type="secondary">({moment(details.detected_at).fromNow()})</Text>
                </Space>
              </Descriptions.Item>
            </Descriptions>

            {/* Resolution Information */}
            {details.is_resolved && (
              <>
                <Divider />
                <Descriptions title="Resolution Information" bordered column={2} size="small">
                  <Descriptions.Item label="Resolution Action" span={2}>
                    <Tag color="green">{getResolutionActionLabel(details.resolution_action)}</Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Resolution Notes" span={2}>
                    <Text>{details.resolution_notes || 'No notes provided'}</Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Resolved By" span={2}>
                    <Space>
                      <UserOutlined />
                      <Text>{details.resolved_by_name}</Text>
                      {details.resolved_by_email && (
                        <Text type="secondary">({details.resolved_by_email})</Text>
                      )}
                    </Space>
                  </Descriptions.Item>

                  <Descriptions.Item label="Resolved At" span={2}>
                    <Space>
                      <ClockCircleOutlined />
                      <Text>{moment(details.resolved_at).format('MMMM DD, YYYY HH:mm:ss')}</Text>
                      <Text type="secondary">({moment(details.resolved_at).fromNow()})</Text>
                    </Space>
                  </Descriptions.Item>

                  <Descriptions.Item label="Time to Resolve" span={2}>
                    <Text strong>
                      {moment(details.resolved_at).diff(moment(details.detected_at), 'hours')} hours
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}

            <Divider />

            {/* Timestamps */}
            <Descriptions title="Timestamps" bordered column={1} size="small">
              <Descriptions.Item label="Created At">
                {moment(details.created_at).format('MMMM DD, YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {moment(details.updated_at).format('MMMM DD, YYYY HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Spin>
    </Modal>
  );
};

export default DiscrepancyDetailsModal;
