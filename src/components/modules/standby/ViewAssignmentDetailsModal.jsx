/**
 * View Assignment Details Modal
 * Display detailed information about a standby assignment
 */

import React from 'react';
import { Modal, Descriptions, Tag, Space, Divider } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const ViewAssignmentDetailsModal = ({ visible, onClose, assignment }) => {
  if (!assignment) return null;

  const getStatusColor = (status) => {
    const colors = {
      active: 'green',
      returned: 'blue',
      permanent: 'purple'
    };
    return colors[status] || 'default';
  };

  const getReasonColor = (category) => {
    const colors = {
      repair: 'orange',
      maintenance: 'blue',
      lost: 'red',
      stolen: 'purple',
      other: 'default'
    };
    return colors[category] || 'default';
  };

  const calculateDuration = () => {
    const endDate = assignment.actual_return_date || dayjs();
    const days = dayjs(endDate).diff(dayjs(assignment.assigned_date), 'days');
    return days;
  };

  const getDaysStatus = () => {
    if (!assignment.expected_return_date || assignment.status !== 'active') return null;

    const daysUntilDue = dayjs(assignment.expected_return_date).diff(dayjs(), 'days');

    if (daysUntilDue < 0) {
      return {
        type: 'overdue',
        days: Math.abs(daysUntilDue),
        color: 'red',
        text: `${Math.abs(daysUntilDue)} days overdue`
      };
    } else if (daysUntilDue <= 3) {
      return {
        type: 'approaching',
        days: daysUntilDue,
        color: 'orange',
        text: `Due in ${daysUntilDue} days`
      };
    } else {
      return {
        type: 'normal',
        days: daysUntilDue,
        color: 'blue',
        text: `Due in ${daysUntilDue} days`
      };
    }
  };

  const daysStatus = getDaysStatus();

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          <span>Assignment Details</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
    >
      {/* User Information */}
      <Divider orientation="left">User Information</Divider>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="User Name" span={1}>
          <strong>{assignment.user_name}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Email" span={1}>
          {assignment.user_email}
        </Descriptions.Item>
        <Descriptions.Item label="Employee ID" span={1}>
          {assignment.employee_id || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Department" span={1}>
          {assignment.department_name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Location" span={2}>
          {assignment.location_name || 'N/A'}
        </Descriptions.Item>
      </Descriptions>

      {/* Asset Information */}
      <Divider orientation="left">Asset Information</Divider>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Standby Asset Tag" span={1}>
          <strong style={{ fontFamily: 'monospace' }}>{assignment.standby_asset_tag}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Standby Asset Product" span={1}>
          {assignment.standby_product_name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Original Asset Tag" span={1}>
          {assignment.original_asset_tag ? (
            <strong style={{ fontFamily: 'monospace' }}>{assignment.original_asset_tag}</strong>
          ) : (
            'N/A (No replacement)'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Original Asset Product" span={1}>
          {assignment.original_product_name || 'N/A'}
        </Descriptions.Item>
      </Descriptions>

      {/* Assignment Details */}
      <Divider orientation="left">Assignment Details</Divider>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Status" span={1}>
          <Tag color={getStatusColor(assignment.status)}>
            {assignment.status?.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Reason Category" span={1}>
          <Tag color={getReasonColor(assignment.reason_category)}>
            {assignment.reason_category?.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Reason Details" span={2}>
          {assignment.reason || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Assigned Date" span={1}>
          {dayjs(assignment.assigned_date).format('YYYY-MM-DD HH:mm')}
        </Descriptions.Item>
        <Descriptions.Item label="Assigned By" span={1}>
          {assignment.assigned_by_name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Expected Return Date" span={1}>
          {assignment.expected_return_date ? (
            <div>
              <div>{dayjs(assignment.expected_return_date).format('YYYY-MM-DD')}</div>
              {daysStatus && (
                <Tag color={daysStatus.color} style={{ marginTop: 4 }}>
                  {daysStatus.text}
                </Tag>
              )}
            </div>
          ) : (
            'N/A'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Duration" span={1}>
          {calculateDuration()} days
        </Descriptions.Item>
      </Descriptions>

      {/* Return Information (if applicable) */}
      {(assignment.status === 'returned' || assignment.status === 'permanent') && (
        <>
          <Divider orientation="left">Return/Completion Information</Divider>
          <Descriptions bordered column={2} size="small">
            {assignment.actual_return_date && (
              <Descriptions.Item label="Actual Return Date" span={1}>
                {dayjs(assignment.actual_return_date).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            )}
            {assignment.returned_by_name && (
              <Descriptions.Item label="Returned By" span={1}>
                {assignment.returned_by_name}
              </Descriptions.Item>
            )}
            {assignment.status === 'permanent' && (
              <>
                <Descriptions.Item label="Made Permanent On" span={1}>
                  {assignment.permanent_date
                    ? dayjs(assignment.permanent_date).format('YYYY-MM-DD HH:mm')
                    : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Made Permanent By" span={1}>
                  {assignment.permanent_by_name || 'N/A'}
                </Descriptions.Item>
              </>
            )}
            {assignment.return_notes && (
              <Descriptions.Item label="Return Notes" span={2}>
                {assignment.return_notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        </>
      )}

      {/* Timestamps */}
      <Divider orientation="left">Record Information</Divider>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Created At" span={1}>
          {assignment.created_at
            ? dayjs(assignment.created_at).format('YYYY-MM-DD HH:mm')
            : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Last Modified" span={1}>
          {assignment.returned_at
            ? dayjs(assignment.returned_at).format('YYYY-MM-DD HH:mm')
            : assignment.made_permanent_at
              ? dayjs(assignment.made_permanent_at).format('YYYY-MM-DD HH:mm')
              : assignment.created_at
                ? dayjs(assignment.created_at).format('YYYY-MM-DD HH:mm')
                : 'N/A'}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewAssignmentDetailsModal;
