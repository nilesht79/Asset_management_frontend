import React from 'react';
import { Timeline, Tag, Typography, Space } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  DeliveredProcedureOutlined,
  CheckSquareOutlined
} from '@ant-design/icons';
import './RequisitionTimeline.css';

const { Text, Paragraph } = Typography;

const RequisitionTimeline = ({ requisition, approvalHistory = [] }) => {
  // Helper to format dates
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper to get status color
  const getStatusColor = (status, action) => {
    if (action === 'approved' || action === 'created') return 'green';
    if (action === 'rejected') return 'red';
    if (action === 'cancelled') return 'gray';
    if (status?.includes('pending')) return 'blue';
    return 'blue';
  };

  // Helper to get icon
  const getStatusIcon = (action, status) => {
    if (action === 'approved' || action === 'created') return <CheckCircleOutlined />;
    if (action === 'rejected') return <CloseCircleOutlined />;
    if (action === 'cancelled') return <CloseCircleOutlined />;
    if (status?.includes('pending')) return <ClockCircleOutlined />;
    return <ClockCircleOutlined />;
  };

  // Build timeline items from approval history
  const buildTimelineItems = () => {
    const items = [];

    // Sort approval history by timestamp
    const sortedHistory = [...approvalHistory].sort(
      (a, b) => new Date(a.action_timestamp) - new Date(b.action_timestamp)
    );

    sortedHistory.forEach((history, index) => {
      const color = getStatusColor(history.new_status, history.action);
      const icon = getStatusIcon(history.action, history.new_status);

      items.push({
        color,
        dot: icon,
        children: (
          <div className="timeline-item">
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              {/* Header */}
              <div>
                <Text strong style={{ fontSize: '14px' }}>
                  {getLabelForAction(history.action, history.approval_level)}
                </Text>
                {history.action === 'approved' && (
                  <Tag color="green" style={{ marginLeft: 8 }}>Approved</Tag>
                )}
                {history.action === 'rejected' && (
                  <Tag color="red" style={{ marginLeft: 8 }}>Rejected</Tag>
                )}
                {history.action === 'cancelled' && (
                  <Tag color="default" style={{ marginLeft: 8 }}>Cancelled</Tag>
                )}
              </div>

              {/* Details */}
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <UserOutlined /> {history.approver_name} ({history.approver_role})
                </Text>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <ClockCircleOutlined /> {formatDateTime(history.action_timestamp)}
                </Text>
              </div>

              {/* Comments */}
              {history.comments && (
                <div style={{ marginTop: 4 }}>
                  <Paragraph
                    style={{
                      fontSize: '12px',
                      padding: '8px',
                      background: '#f5f5f5',
                      borderRadius: '4px',
                      margin: 0
                    }}
                  >
                    <Text type="secondary">Comments: </Text>
                    {history.comments}
                  </Paragraph>
                </div>
              )}
            </Space>
          </div>
        )
      });
    });

    // Add pending states if applicable
    if (requisition.status === 'pending_dept_head') {
      items.push({
        color: 'gray',
        dot: <ClockCircleOutlined />,
        children: (
          <div className="timeline-item pending">
            <Text type="secondary">Awaiting Department Head Approval</Text>
            {requisition.dept_head_name && (
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Assigned to: {requisition.dept_head_name}
                </Text>
              </div>
            )}
          </div>
        )
      });
    }

    if (requisition.status === 'pending_it_head') {
      items.push({
        color: 'gray',
        dot: <ClockCircleOutlined />,
        children: (
          <div className="timeline-item pending">
            <Text type="secondary">Awaiting IT Head Approval</Text>
            {requisition.it_head_name && (
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Assigned to: {requisition.it_head_name}
                </Text>
              </div>
            )}
          </div>
        )
      });
    }

    if (requisition.status === 'pending_assignment') {
      items.push({
        color: 'gray',
        dot: <ClockCircleOutlined />,
        children: (
          <div className="timeline-item pending">
            <Text type="secondary">Awaiting Asset Assignment</Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Coordinator will assign an asset soon
              </Text>
            </div>
          </div>
        )
      });
    }

    if (requisition.status === 'assigned') {
      items.push({
        color: 'blue',
        dot: <DeliveredProcedureOutlined />,
        children: (
          <div className="timeline-item">
            <Space direction="vertical" size="small">
              <Text strong>Asset Assigned</Text>
              {requisition.assigned_asset_tag && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Asset Tag: <Tag color="blue">{requisition.assigned_asset_tag}</Tag>
                  </Text>
                </div>
              )}
              {requisition.assigned_coordinator_id && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <UserOutlined /> Assigned by coordinator
                  </Text>
                </div>
              )}
              {requisition.assignment_date && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <ClockCircleOutlined /> {formatDateTime(requisition.assignment_date)}
                  </Text>
                </div>
              )}
            </Space>
          </div>
        )
      });

      // Add pending employee signature state
      items.push({
        color: 'gray',
        dot: <ClockCircleOutlined />,
        children: (
          <div className="timeline-item pending">
            <Text type="secondary">Awaiting Employee Digital Signature</Text>
          </div>
        )
      });
    }

    if (requisition.status === 'pending_verification') {
      items.push({
        color: 'blue',
        dot: <DeliveredProcedureOutlined />,
        children: (
          <div className="timeline-item">
            <Space direction="vertical" size="small">
              <Text strong>Asset Assigned</Text>
              {requisition.assigned_asset_tag && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Asset Tag: <Tag color="blue">{requisition.assigned_asset_tag}</Tag>
                  </Text>
                </div>
              )}
              {requisition.assignment_date && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <ClockCircleOutlined /> {formatDateTime(requisition.assignment_date)}
                  </Text>
                </div>
              )}
            </Space>
          </div>
        )
      });

      // Employee signed
      items.push({
        color: 'green',
        dot: <CheckCircleOutlined />,
        children: (
          <div className="timeline-item">
            <Space direction="vertical" size="small">
              <Text strong>Employee Digitally Signed</Text>
              {requisition.employee_confirmed_at && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <ClockCircleOutlined /> {formatDateTime(requisition.employee_confirmed_at)}
                  </Text>
                </div>
              )}
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} /> Signature received
                </Text>
              </div>
            </Space>
          </div>
        )
      });

      // Add pending verification state
      items.push({
        color: 'gray',
        dot: <ClockCircleOutlined />,
        children: (
          <div className="timeline-item pending">
            <Text type="secondary">Awaiting Coordinator Functionality Verification</Text>
          </div>
        )
      });
    }

    if (requisition.status === 'delivered') {
      items.push({
        color: 'cyan',
        dot: <DeliveredProcedureOutlined />,
        children: (
          <div className="timeline-item">
            <Space direction="vertical" size="small">
              <Text strong>Asset Delivered</Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Awaiting employee confirmation
              </Text>
            </Space>
          </div>
        )
      });

      // Add pending confirmation
      items.push({
        color: 'gray',
        dot: <ClockCircleOutlined />,
        children: (
          <div className="timeline-item pending">
            <Text type="secondary">Awaiting Employee Confirmation</Text>
          </div>
        )
      });
    }

    if (requisition.status === 'completed') {
      // Show asset assignment
      items.push({
        color: 'blue',
        dot: <DeliveredProcedureOutlined />,
        children: (
          <div className="timeline-item">
            <Space direction="vertical" size="small">
              <Text strong>Asset Assigned</Text>
              {requisition.assigned_asset_tag && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Asset Tag: <Tag color="blue">{requisition.assigned_asset_tag}</Tag>
                  </Text>
                </div>
              )}
              {requisition.assignment_date && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <ClockCircleOutlined /> {formatDateTime(requisition.assignment_date)}
                  </Text>
                </div>
              )}
            </Space>
          </div>
        )
      });

      // Show employee signature
      if (requisition.employee_signature_path) {
        items.push({
          color: 'green',
          dot: <CheckCircleOutlined />,
          children: (
            <div className="timeline-item">
              <Space direction="vertical" size="small">
                <Text strong>Employee Digitally Signed</Text>
                {requisition.employee_confirmed_at && (
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      <ClockCircleOutlined /> {formatDateTime(requisition.employee_confirmed_at)}
                    </Text>
                  </div>
                )}
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> Signature received
                  </Text>
                </div>
              </Space>
            </div>
          )
        });
      }

      // Show completion with verification
      items.push({
        color: 'green',
        dot: <CheckSquareOutlined />,
        children: (
          <div className="timeline-item">
            <Space direction="vertical" size="small">
              <Text strong style={{ color: '#52c41a' }}>Functionality Verified & Completed</Text>
              {requisition.completed_at && (
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    <ClockCircleOutlined /> {formatDateTime(requisition.completed_at)}
                  </Text>
                </div>
              )}
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} /> Coordinator verified asset functionality
                </Text>
              </div>
            </Space>
          </div>
        )
      });
    }

    return items;
  };

  // Get human-readable label for action
  const getLabelForAction = (action, level) => {
    if (action === 'created') return 'Requisition Created';
    if (action === 'approved' && level === 'dept_head') return 'Department Head Approval';
    if (action === 'rejected' && level === 'dept_head') return 'Department Head Rejection';
    if (action === 'approved' && level === 'it_head') return 'IT Head Approval';
    if (action === 'rejected' && level === 'it_head') return 'IT Head Rejection';
    if (action === 'cancelled') return 'Requisition Cancelled';
    if (action === 'assigned') return 'Asset Assigned';
    if (action === 'delivered') return 'Asset Delivered';
    if (action === 'confirmed') return 'Delivery Confirmed';
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  const timelineItems = buildTimelineItems();

  return (
    <div className="requisition-timeline">
      <Timeline mode="left" items={timelineItems} />
    </div>
  );
};

export default RequisitionTimeline;
