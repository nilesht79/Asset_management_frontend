/**
 * AuditLogDetailDrawer Component
 * Shows detailed information about a single audit log entry
 */

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Descriptions,
  Tag,
  Spin,
  Card,
  Typography,
  Space,
  Divider,
  Table,
  Empty,
  message,
  Timeline,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  DesktopOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import auditLogService from '../../../services/auditLog';

const { Text, Title } = Typography;

const AuditLogDetailDrawer = ({ visible, auditId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [auditLog, setAuditLog] = useState(null);

  useEffect(() => {
    if (visible && auditId) {
      fetchAuditLog();
    }
  }, [visible, auditId]);

  const fetchAuditLog = async () => {
    setLoading(true);
    try {
      const response = await auditLogService.getLogById(auditId);
      const data = response.data?.data || response.data;
      setAuditLog(data);
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
      message.error('Failed to load audit log details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failure':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  const renderChangesComparison = () => {
    if (!auditLog?.old_value && !auditLog?.new_value) return null;

    const oldValue = auditLog.old_value || {};
    const newValue = auditLog.new_value || {};
    const changedFields = auditLog.changed_fields || [];

    // If we have field_changes from DATA_CHANGE_AUDIT table
    if (auditLog.field_changes && auditLog.field_changes.length > 0) {
      const columns = [
        {
          title: 'Field',
          dataIndex: 'field_name',
          key: 'field_name',
          width: 150,
          render: (text) => <Text strong>{text}</Text>
        },
        {
          title: 'Old Value',
          dataIndex: 'old_value',
          key: 'old_value',
          render: (text) => (
            <Text type="secondary" delete={text !== null}>
              {text || <Text type="secondary" italic>null</Text>}
            </Text>
          )
        },
        {
          title: 'New Value',
          dataIndex: 'new_value',
          key: 'new_value',
          render: (text) => (
            <Text type="success">
              {text || <Text type="secondary" italic>null</Text>}
            </Text>
          )
        }
      ];

      return (
        <Card size="small" title="Field Changes" className="mt-4">
          <Table
            columns={columns}
            dataSource={auditLog.field_changes}
            rowKey="field_name"
            pagination={false}
            size="small"
          />
        </Card>
      );
    }

    // Otherwise, show old/new value JSON comparison
    if (Object.keys(oldValue).length > 0 || Object.keys(newValue).length > 0) {
      return (
        <Card size="small" title="Data Changes" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text strong className="block mb-2">Previous Value</Text>
              <pre className="bg-red-50 p-3 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(oldValue, null, 2) || 'N/A'}
              </pre>
            </div>
            <div>
              <Text strong className="block mb-2">New Value</Text>
              <pre className="bg-green-50 p-3 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(newValue, null, 2) || 'N/A'}
              </pre>
            </div>
          </div>
          {changedFields.length > 0 && (
            <div className="mt-3">
              <Text strong>Changed Fields: </Text>
              {changedFields.map((field, idx) => (
                <Tag key={idx} color="blue">{field}</Tag>
              ))}
            </div>
          )}
        </Card>
      );
    }

    return null;
  };

  const renderMetadata = () => {
    if (!auditLog?.metadata) return null;

    return (
      <Card size="small" title="Additional Metadata" className="mt-4">
        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-48">
          {JSON.stringify(auditLog.metadata, null, 2)}
        </pre>
      </Card>
    );
  };

  return (
    <Drawer
      title={
        <Space>
          <FileTextOutlined />
          <span>Audit Log Details</span>
        </Space>
      }
      placement="right"
      width={700}
      onClose={onClose}
      open={visible}
      destroyOnClose
    >
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Loading audit log..." />
        </div>
      ) : !auditLog ? (
        <Empty description="Audit log not found" />
      ) : (
        <div className="space-y-4">
          {/* Header Card */}
          <Card size="small">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Title level={4} className="!mb-1">
                  {auditLog.action?.replace(/_/g, ' ').toUpperCase()}
                </Title>
                <Space size="small">
                  <Tag color={auditLogService.getCategoryColor(auditLog.action_category)}>
                    {auditLogService.getCategoryLabel(auditLog.action_category)}
                  </Tag>
                  <Tag color={auditLogService.getActionTypeColor(auditLog.action_type)}>
                    {auditLog.action_type}
                  </Tag>
                  <Tag
                    icon={getStatusIcon(auditLog.status)}
                    color={auditLogService.getStatusColor(auditLog.status)}
                  >
                    {auditLog.status?.toUpperCase()}
                  </Tag>
                </Space>
              </div>
              {auditLog.status_code && (
                <Tag color={auditLog.status_code >= 400 ? 'red' : 'green'}>
                  HTTP {auditLog.status_code}
                </Tag>
              )}
            </div>

            <Descriptions column={2} size="small">
              <Descriptions.Item label="Timestamp">
                <Tooltip title={dayjs(auditLog.created_at).format('YYYY-MM-DD HH:mm:ss.SSS')}>
                  {dayjs(auditLog.created_at).format('MMM DD, YYYY HH:mm:ss')}
                </Tooltip>
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {auditLog.duration_ms ? `${auditLog.duration_ms}ms` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Request ID" span={2}>
                <Text code copyable className="text-xs">
                  {auditLog.request_id || 'N/A'}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* User Information */}
          <Card
            size="small"
            title={
              <Space>
                <UserOutlined />
                <span>User Information</span>
              </Space>
            }
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item label="User Email">
                {auditLog.user_email || <Text type="secondary">System</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="User Role">
                <Tag>{auditLog.user_role || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="User ID">
                <Text code className="text-xs">{auditLog.user_id || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Session ID">
                <Text code className="text-xs">{auditLog.session_id || 'N/A'}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Client Information */}
          <Card
            size="small"
            title={
              <Space>
                <DesktopOutlined />
                <span>Client Information</span>
              </Space>
            }
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item label="IP Address">
                <Text code>{auditLog.ip_address || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Client Type">
                <Tag>{auditLog.client_type || 'web'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="User Agent" span={2}>
                <Text className="text-xs" ellipsis={{ tooltip: auditLog.user_agent }}>
                  {auditLog.user_agent || 'N/A'}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Request Information */}
          <Card
            size="small"
            title={
              <Space>
                <ApiOutlined />
                <span>Request Information</span>
              </Space>
            }
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item label="HTTP Method">
                <Tag color={
                  auditLog.http_method === 'GET' ? 'blue' :
                  auditLog.http_method === 'POST' ? 'green' :
                  auditLog.http_method === 'PUT' || auditLog.http_method === 'PATCH' ? 'orange' :
                  auditLog.http_method === 'DELETE' ? 'red' : 'default'
                }>
                  {auditLog.http_method || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Source">
                <Tag>{auditLog.source_system || 'api'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Endpoint" span={2}>
                <Text code className="text-xs">{auditLog.endpoint || 'N/A'}</Text>
              </Descriptions.Item>
              {auditLog.query_params && (
                <Descriptions.Item label="Query Params" span={2}>
                  <pre className="bg-gray-50 p-2 rounded text-xs m-0">
                    {JSON.stringify(auditLog.query_params, null, 2)}
                  </pre>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Resource Information */}
          {(auditLog.resource_type || auditLog.resource_id) && (
            <Card
              size="small"
              title={
                <Space>
                  <GlobalOutlined />
                  <span>Resource Information</span>
                </Space>
              }
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Resource Type">
                  <Tag>{auditLog.resource_type || 'N/A'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Resource Name">
                  {auditLog.resource_name || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Resource ID" span={2}>
                  <Text code copyable className="text-xs">
                    {auditLog.resource_id || 'N/A'}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Error Information */}
          {auditLog.status !== 'success' && auditLog.error_message && (
            <Card
              size="small"
              title={
                <Space>
                  <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  <span style={{ color: '#ff4d4f' }}>Error Information</span>
                </Space>
              }
              className="border-red-200"
            >
              <Descriptions column={1} size="small">
                {auditLog.error_code && (
                  <Descriptions.Item label="Error Code">
                    <Tag color="red">{auditLog.error_code}</Tag>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Error Message">
                  <Text type="danger">{auditLog.error_message}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Reason */}
          {auditLog.reason && (
            <Card size="small" title="Reason / Justification">
              <Text>{auditLog.reason}</Text>
            </Card>
          )}

          {/* Changes Comparison */}
          {renderChangesComparison()}

          {/* Additional Metadata */}
          {renderMetadata()}
        </div>
      )}
    </Drawer>
  );
};

export default AuditLogDetailDrawer;
