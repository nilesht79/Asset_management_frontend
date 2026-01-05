import React from 'react';
import { Card, Tag, Space, Typography, Row, Col, Button, Tooltip } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  StopOutlined,
  WarningOutlined,
  SignatureOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatDateOnly, formatLocalDateTime } from '../../utils/dateUtils';

const { Text, Title } = Typography;

const RequisitionCard = ({ requisition, onCancel, onSignForDelivery, showActions = true }) => {
  const navigate = useNavigate();

  // Status configuration
  const statusConfig = {
    pending_dept_head: { label: 'Pending Department Head', color: 'orange', icon: <ClockCircleOutlined /> },
    approved_by_dept_head: { label: 'Approved by Dept Head', color: 'blue', icon: <CheckCircleOutlined /> },
    rejected_by_dept_head: { label: 'Rejected by Dept Head', color: 'red', icon: <CloseCircleOutlined /> },
    pending_it_head: { label: 'Pending IT Head', color: 'orange', icon: <ClockCircleOutlined /> },
    approved_by_it_head: { label: 'Approved by IT Head', color: 'blue', icon: <CheckCircleOutlined /> },
    rejected_by_it_head: { label: 'Rejected by IT Head', color: 'red', icon: <CloseCircleOutlined /> },
    pending_assignment: { label: 'Pending Assignment', color: 'purple', icon: <ClockCircleOutlined /> },
    assigned: { label: 'Asset Assigned', color: 'cyan', icon: <CheckCircleOutlined /> },
    pending_verification: { label: 'Pending Verification', color: 'gold', icon: <WarningOutlined /> },
    delivered: { label: 'Delivered', color: 'lime', icon: <CheckCircleOutlined /> },
    completed: { label: 'Completed', color: 'green', icon: <CheckCircleOutlined /> },
    cancelled: { label: 'Cancelled', color: 'default', icon: <StopOutlined /> }
  };

  // Urgency configuration
  const urgencyConfig = {
    low: { label: 'Low', color: 'green' },
    medium: { label: 'Medium', color: 'blue' },
    high: { label: 'High', color: 'orange' },
    critical: { label: 'Critical', color: 'red' }
  };

  const status = statusConfig[requisition.status] || statusConfig.pending_dept_head;
  const urgency = urgencyConfig[requisition.urgency] || urgencyConfig.medium;

  // Employees can cancel only while pending dept head review
  // Once dept head approves and sends to IT head, cancellation is not allowed
  const canCancel = ['pending_dept_head'].includes(requisition.status);

  // Check if asset is assigned and waiting for employee signature
  const canSignForDelivery = requisition.status === 'assigned' &&
                              requisition.delivery_ticket_id &&
                              !requisition.employee_signed;

  return (
    <Card
      hoverable
      style={{ marginBottom: 16, borderLeft: `4px solid ${urgency.color === 'red' ? '#ff4d4f' : urgency.color === 'orange' ? '#fa8c16' : urgency.color === 'blue' ? '#1890ff' : '#52c41a'}` }}
      onClick={() => navigate(`/requisitions/${requisition.requisition_id}`)}
    >
      <Row gutter={[16, 16]}>
        <Col span={18}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {/* Header */}
            <div>
              <Title level={5} style={{ margin: 0 }}>
                {requisition.requisition_number}
              </Title>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Created: {formatDateOnly(requisition.created_at)}
              </Text>
            </div>

            {/* Purpose */}
            <div>
              <Text strong>Purpose: </Text>
              <Text>{requisition.purpose}</Text>
            </div>

            {/* Asset Info */}
            {requisition.category_name && (
              <div>
                <Text type="secondary">Category: </Text>
                <Text>{requisition.category_name}</Text>
              </div>
            )}

            {requisition.subcategory_name && (
              <div>
                <Text type="secondary">Subcategory: </Text>
                <Text>{requisition.subcategory_name}</Text>
              </div>
            )}

            {/* Required By Date */}
            {requisition.required_by_date && (
              <div>
                <Text type="secondary">Required By: </Text>
                <Text strong>{formatDateOnly(requisition.required_by_date)}</Text>
              </div>
            )}

            {/* Tags */}
            <Space size="small" wrap>
              <Tag icon={status.icon} color={status.color}>
                {status.label}
              </Tag>
              <Tag color={urgency.color}>
                {urgency.color === 'red' && <WarningOutlined />} {urgency.label} Priority
              </Tag>
              {requisition.quantity > 1 && (
                <Tag>Qty: {requisition.quantity}</Tag>
              )}
            </Space>
          </Space>
        </Col>

        <Col span={6} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          {/* Department */}
          <div style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
              Department
            </Text>
            <Text strong style={{ fontSize: '12px' }}>
              {requisition.department_name}
            </Text>
          </div>

          {/* Actions */}
          {showActions && (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                block
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/requisitions/${requisition.requisition_id}`);
                }}
              >
                View Details
              </Button>
              {canSignForDelivery && onSignForDelivery && (
                <Tooltip title="Sign to confirm asset delivery">
                  <Button
                    type="primary"
                    icon={<SignatureOutlined />}
                    size="small"
                    block
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSignForDelivery(requisition);
                    }}
                  >
                    Sign for Delivery
                  </Button>
                </Tooltip>
              )}
              {canCancel && onCancel && (
                <Tooltip title="Cancel this requisition">
                  <Button
                    danger
                    icon={<StopOutlined />}
                    size="small"
                    block
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel(requisition);
                    }}
                  >
                    Cancel
                  </Button>
                </Tooltip>
              )}
            </Space>
          )}
        </Col>
      </Row>

      {/* Assigned Asset Info (if available) */}
      {requisition.assigned_asset_tag && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <Space>
              <Text type="secondary">Assigned Asset:</Text>
              <Tag color="blue">{requisition.assigned_asset_tag}</Tag>
              <Text type="secondary">by {requisition.assigned_coordinator_name}</Text>
            </Space>
            {requisition.assigned_engineer_name && (
              <Space>
                <Text type="secondary">Assigned Engineer:</Text>
                <Tag color="green">{requisition.assigned_engineer_name}</Tag>
                {requisition.installation_scheduled_date && (
                  <Text type="secondary">
                    (Scheduled: {formatLocalDateTime(requisition.installation_scheduled_date)})
                  </Text>
                )}
              </Space>
            )}
          </Space>
        </div>
      )}

      {/* Rejection Info (if rejected) */}
      {(requisition.status === 'rejected_by_dept_head' || requisition.status === 'rejected_by_it_head') && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
          <Text type="danger" strong>
            Rejection Reason:
          </Text>
          <br />
          <Text>
            {requisition.status === 'rejected_by_dept_head'
              ? requisition.dept_head_comments
              : requisition.it_head_comments}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default RequisitionCard;
