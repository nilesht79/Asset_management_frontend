import React, { useState } from 'react';
import { Drawer, Table, Tag, Button, Empty, Badge, Tooltip, Typography } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  EyeOutlined
} from '@ant-design/icons';
import ticketService from '../../../services/ticket';

const { Text, Paragraph } = Typography;

const PendingCloseRequestsDrawer = ({ visible, requests, onClose, onReviewRequest, onUpdate }) => {
  const [expandedRows, setExpandedRows] = useState([]);

  const getRequestAge = (createdAt) => {
    if (!createdAt) return 'N/A';
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    }
  };

  const columns = [
    {
      title: 'Ticket #',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      width: 140,
      fixed: 'left',
      render: (text) => (
        <Tag color="blue" className="font-mono font-semibold">
          {text}
        </Tag>
      )
    },
    {
      title: 'Title',
      dataIndex: 'ticket_title',
      key: 'ticket_title',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text}>
          <Text strong>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'ticket_priority',
      key: 'priority',
      width: 100,
      render: (priority) => (
        <Tag color={ticketService.getPriorityColor(priority)}>
          {ticketService.getPriorityDisplayName(priority).toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Engineer',
      dataIndex: 'engineer_name',
      key: 'engineer',
      width: 150,
      render: (name, record) => (
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-gray-500">{record.engineer_email}</div>
        </div>
      )
    },
    {
      title: 'Created For',
      key: 'created_for',
      width: 180,
      render: (_, record) => (
        record.guest_name ? (
          <div>
            <Tag color="purple" size="small" style={{ marginBottom: 4 }}>
              GUEST
            </Tag>
            <div className="font-medium text-sm">{record.guest_name}</div>
            <div className="text-xs text-gray-500">{record.guest_email}</div>
          </div>
        ) : (
          <div>
            <div className="font-medium text-sm">{record.created_by_user_name}</div>
            <div className="text-xs text-gray-500">{record.created_by_user_email}</div>
          </div>
        )
      )
    },
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Requested',
      dataIndex: 'created_at',
      key: 'requested',
      width: 120,
      render: (date) => (
        <Tooltip title={ticketService.formatDate(date)}>
          <div className="flex items-center">
            <ClockCircleOutlined className="mr-1" />
            <span>{getRequestAge(date)}</span>
          </div>
        </Tooltip>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<CheckCircleOutlined />}
          onClick={() => {
            onReviewRequest(record);
            // Don't close drawer - let it stay open in background
          }}
        >
          Review
        </Button>
      )
    }
  ];

  const expandedRowRender = (record) => {
    return (
      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <div className="mb-2">
          <Text strong className="text-gray-700">
            Resolution Notes:
          </Text>
        </div>
        <Paragraph
          ellipsis={{
            rows: 3,
            expandable: true,
            symbol: 'more'
          }}
          className="mb-0 text-gray-800"
        >
          {record.request_notes}
        </Paragraph>
      </div>
    );
  };

  return (
    <Drawer
      title={
        <div className="flex items-center space-x-2">
          <AlertOutlined style={{ color: '#1890ff' }} />
          <span>Pending Close Requests</span>
          <Badge count={requests.length} style={{ backgroundColor: '#52c41a' }} />
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={1200}
      destroyOnClose
    >
      {requests.length === 0 ? (
        <Empty
          description="No pending close requests"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center space-x-2">
              <AlertOutlined className="text-blue-600" />
              <Text>
                Review each request to approve or reject ticket closure. Click on a row to view resolution notes.
              </Text>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={requests}
            rowKey="close_request_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} pending requests`
            }}
            expandable={{
              expandedRowRender,
              expandIcon: ({ expanded, onExpand, record }) => (
                <Button
                  type="text"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={(e) => onExpand(record, e)}
                >
                  {expanded ? 'Hide' : 'View'} Notes
                </Button>
              )
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </>
      )}
    </Drawer>
  );
};

export default PendingCloseRequestsDrawer;
