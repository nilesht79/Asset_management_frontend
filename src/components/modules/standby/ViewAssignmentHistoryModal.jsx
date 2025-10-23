/**
 * View Assignment History Modal
 * Display movement and change history for a standby assignment
 */

import React, { useEffect, useState } from 'react';
import { Modal, Timeline, Card, Descriptions, Tag, Spin, Empty, Space } from 'antd';
import {
  HistoryOutlined,
  UserOutlined,
  SwapOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';

const ViewAssignmentHistoryModal = ({ visible, onClose, assignment }) => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (visible && assignment) {
      fetchHistory();
    }
  }, [visible, assignment]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/standby/assignments/${assignment.id}/history`);
      setHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assignment history:', error);
      // If the API doesn't exist yet, create a fallback timeline from assignment data
      createFallbackHistory();
    } finally {
      setLoading(false);
    }
  };

  const createFallbackHistory = () => {
    if (!assignment) return;

    const historyItems = [];

    // Assignment creation
    historyItems.push({
      id: 1,
      action: 'created',
      timestamp: assignment.assigned_date,
      user_name: assignment.assigned_by_name || 'System',
      details: {
        standby_asset: assignment.standby_asset_tag,
        original_asset: assignment.original_asset_tag,
        reason_category: assignment.reason_category,
        reason: assignment.reason,
        expected_return_date: assignment.expected_return_date
      }
    });

    // Return action
    if (assignment.status === 'returned' && assignment.actual_return_date) {
      historyItems.push({
        id: 2,
        action: 'returned',
        timestamp: assignment.actual_return_date,
        user_name: assignment.returned_by_name || 'System',
        details: {
          return_notes: assignment.return_notes
        }
      });
    }

    // Permanent action
    if (assignment.status === 'permanent') {
      historyItems.push({
        id: 3,
        action: 'made_permanent',
        timestamp: assignment.permanent_date || assignment.updated_at,
        user_name: assignment.permanent_by_name || 'System',
        details: {
          note: 'Assignment made permanent'
        }
      });
    }

    setHistory(historyItems);
  };

  const getActionConfig = (action) => {
    const configs = {
      created: {
        icon: <UserOutlined />,
        color: 'blue',
        label: 'Assignment Created',
        description: 'Standby asset assigned to user'
      },
      returned: {
        icon: <SwapOutlined />,
        color: 'green',
        label: 'Asset Returned',
        description: 'Standby asset returned and swapped'
      },
      made_permanent: {
        icon: <LockOutlined />,
        color: 'purple',
        label: 'Made Permanent',
        description: 'Assignment made permanent'
      },
      updated: {
        icon: <ClockCircleOutlined />,
        color: 'orange',
        label: 'Assignment Updated',
        description: 'Assignment details modified'
      }
    };
    return configs[action] || configs.updated;
  };

  const renderHistoryItem = (item) => {
    const config = getActionConfig(item.action);

    return (
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              {config.icon}
              <strong>{config.label}</strong>
            </Space>
            <Tag color={config.color}>{item.action?.toUpperCase().replace('_', ' ')}</Tag>
          </div>

          <div style={{ color: '#666', fontSize: '12px' }}>
            {dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss')} by {item.user_name}
          </div>

          {item.details && Object.keys(item.details).length > 0 && (
            <Descriptions size="small" column={1} bordered>
              {item.details.standby_asset && (
                <Descriptions.Item label="Standby Asset">
                  <strong style={{ fontFamily: 'monospace' }}>
                    {item.details.standby_asset}
                  </strong>
                </Descriptions.Item>
              )}
              {item.details.original_asset && (
                <Descriptions.Item label="Original Asset">
                  <strong style={{ fontFamily: 'monospace' }}>
                    {item.details.original_asset}
                  </strong>
                </Descriptions.Item>
              )}
              {item.details.reason_category && (
                <Descriptions.Item label="Reason Category">
                  <Tag color="orange">{item.details.reason_category?.toUpperCase()}</Tag>
                </Descriptions.Item>
              )}
              {item.details.reason && (
                <Descriptions.Item label="Reason">
                  {item.details.reason}
                </Descriptions.Item>
              )}
              {item.details.expected_return_date && (
                <Descriptions.Item label="Expected Return">
                  {dayjs(item.details.expected_return_date).format('YYYY-MM-DD')}
                </Descriptions.Item>
              )}
              {item.details.return_notes && (
                <Descriptions.Item label="Return Notes">
                  {item.details.return_notes}
                </Descriptions.Item>
              )}
              {item.details.note && (
                <Descriptions.Item label="Note">
                  {item.details.note}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Space>
      </Card>
    );
  };

  const renderTimeline = () => {
    if (history.length === 0) {
      return <Empty description="No history available" />;
    }

    // Sort history by timestamp descending (newest first)
    const sortedHistory = [...history].sort(
      (a, b) => dayjs(b.timestamp).unix() - dayjs(a.timestamp).unix()
    );

    return (
      <Timeline
        mode="left"
        items={sortedHistory.map((item, index) => {
          const config = getActionConfig(item.action);
          return {
            key: item.id || index,
            dot: config.icon,
            color: config.color,
            children: renderHistoryItem(item)
          };
        })}
      />
    );
  };

  if (!assignment) return null;

  return (
    <Modal
      title={
        <Space>
          <HistoryOutlined />
          <span>Assignment History</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {/* Assignment Summary */}
      <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f5f5f5' }}>
        <Descriptions size="small" column={2}>
          <Descriptions.Item label="User">
            <strong>{assignment.user_name}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={
                assignment.status === 'active'
                  ? 'green'
                  : assignment.status === 'returned'
                    ? 'blue'
                    : 'purple'
              }
            >
              {assignment.status?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Standby Asset">
            <span style={{ fontFamily: 'monospace' }}>{assignment.standby_asset_tag}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Original Asset">
            {assignment.original_asset_tag ? (
              <span style={{ fontFamily: 'monospace' }}>{assignment.original_asset_tag}</span>
            ) : (
              'N/A'
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* History Timeline */}
      <Spin spinning={loading}>{renderTimeline()}</Spin>
    </Modal>
  );
};

export default ViewAssignmentHistoryModal;
