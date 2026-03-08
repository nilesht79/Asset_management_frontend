import React from 'react';
import { Drawer, Table, Tag, Button, Empty, Badge, Tooltip, Typography } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  ToolOutlined,
  SwapOutlined,
  EyeOutlined
} from '@ant-design/icons';
import ticketService from '../../../services/ticket';

const { Text, Paragraph } = Typography;

const PendingServiceTypeRequestsDrawer = ({ visible, requests, onClose, onReviewRequest }) => {

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
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip title={text}>
          <Text strong>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority) => (
        <Tag color={ticketService.getPriorityColor(priority)}>
          {ticketService.getPriorityDisplayName(priority).toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Proposed Type',
      dataIndex: 'proposed_service_type',
      key: 'proposed_service_type',
      width: 150,
      render: (type) => (
        <Tag
          color={type === 'repair' ? 'orange' : 'red'}
          icon={type === 'repair' ? <ToolOutlined /> : <SwapOutlined />}
        >
          {type === 'repair' ? 'Repair Service' : 'Replacement Service'}
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
          onClick={() => onReviewRequest(record)}
        >
          Review
        </Button>
      )
    }
  ];

  const expandedRowRender = (record) => {
    return (
      <div className="bg-orange-50 p-4 rounded border border-orange-200">
        <div className="mb-2">
          <Text strong className="text-gray-700">
            Engineer Notes:
          </Text>
        </div>
        <Paragraph
          ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
          className="mb-0 text-gray-800"
        >
          {record.request_notes || 'No notes provided'}
        </Paragraph>
      </div>
    );
  };

  return (
    <Drawer
      title={
        <div className="flex items-center space-x-2">
          <ToolOutlined style={{ color: '#fa8c16' }} />
          <span>Pending Service Type Requests</span>
          <Badge count={requests.length} style={{ backgroundColor: '#fa8c16' }} />
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={1100}
      destroyOnClose
    >
      {requests.length === 0 ? (
        <Empty
          description="No pending service type requests"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <>
          <div className="mb-4 p-3 bg-orange-50 rounded border border-orange-200">
            <div className="flex items-center space-x-2">
              <AlertOutlined className="text-orange-600" />
              <Text>
                Engineers have flagged these tickets for repair or replacement. Review and approve or reject each request.
              </Text>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={requests}
            rowKey="request_id"
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
            scroll={{ x: 900 }}
            size="middle"
          />
        </>
      )}
    </Drawer>
  );
};

export default PendingServiceTypeRequestsDrawer;
