/**
 * Standby Assignments Page
 * Lists all standby asset assignments with actions
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  message,
  Tooltip,
  Dropdown
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  SwapOutlined,
  LockOutlined,
  MoreOutlined,
  HistoryOutlined,
  EyeOutlined
} from '@ant-design/icons';
import {
  fetchStandbyAssignments,
  setFilters,
  clearFilters,
  setPagination,
  selectStandbyAssignments,
  selectAssignmentPagination,
  selectAssignmentFilters,
  selectAssignmentLoading
} from '../store/slices/standbyAssignmentSlice';
import { fetchUsers, selectUsers } from '../store/slices/userSlice';
import ReturnStandbyModal from '../components/modules/standby/ReturnStandbyModal';
import MakePermanentModal from '../components/modules/standby/MakePermanentModal';
import ViewAssignmentDetailsModal from '../components/modules/standby/ViewAssignmentDetailsModal';
import ViewAssignmentHistoryModal from '../components/modules/standby/ViewAssignmentHistoryModal';
import dayjs from 'dayjs';

const { Search } = Input;

const StandbyAssignments = () => {
  const dispatch = useDispatch();

  // Redux state
  const assignments = useSelector(selectStandbyAssignments);
  const pagination = useSelector(selectAssignmentPagination);
  const filters = useSelector(selectAssignmentFilters);
  const loading = useSelector(selectAssignmentLoading);
  const usersState = useSelector(selectUsers);
  const users = usersState.data || [];

  // Local state
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [permanentModalVisible, setPermanentModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchStandbyAssignments({ ...filters, ...pagination }));
    dispatch(fetchUsers());
  }, []);

  // Fetch when filters or pagination change
  useEffect(() => {
    dispatch(
      fetchStandbyAssignments({ ...filters, page: pagination.page, limit: pagination.limit })
    );
  }, [filters, pagination.page, pagination.limit]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    dispatch(setPagination({ page: 1 }));
  };

  // Handle search
  const handleSearch = (value) => {
    dispatch(setFilters({ search: value }));
    dispatch(setPagination({ page: 1 }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(setPagination({ page: 1 }));
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchStandbyAssignments({ ...filters, ...pagination }));
  };

  // Handle return
  const handleReturnClick = (assignment) => {
    setSelectedAssignment(assignment);
    setReturnModalVisible(true);
  };

  // Handle make permanent
  const handleMakePermanentClick = (assignment) => {
    setSelectedAssignment(assignment);
    setPermanentModalVisible(true);
  };

  // Handle view details
  const handleViewDetailsClick = (assignment) => {
    setSelectedAssignment(assignment);
    setDetailsModalVisible(true);
  };

  // Handle view history
  const handleViewHistoryClick = (assignment) => {
    setSelectedAssignment(assignment);
    setHistoryModalVisible(true);
  };

  // Handle pagination change
  const handleTableChange = (newPagination) => {
    dispatch(
      setPagination({
        page: newPagination.current,
        limit: newPagination.pageSize
      })
    );
  };

  // Calculate days status
  const getDaysStatus = (assignment) => {
    if (!assignment.expected_return_date) return null;

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

  // Table columns
  const columns = [
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 180,
      fixed: 'left',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{record.user_email}</div>
        </div>
      )
    },
    {
      title: 'Standby Asset',
      dataIndex: 'standby_asset_tag',
      key: 'standby_asset_tag',
      width: 150,
      render: (text) => <span style={{ fontFamily: 'monospace' }}>{text}</span>
    },
    {
      title: 'Original Asset',
      dataIndex: 'original_asset_tag',
      key: 'original_asset_tag',
      width: 150,
      render: (text) => (text ? <span style={{ fontFamily: 'monospace' }}>{text}</span> : '-')
    },
    {
      title: 'Reason',
      dataIndex: 'reason_category',
      key: 'reason_category',
      width: 120,
      render: (category) => {
        const colors = {
          repair: 'orange',
          maintenance: 'blue',
          lost: 'red',
          stolen: 'purple',
          other: 'default'
        };
        return <Tag color={colors[category]}>{category?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const colors = {
          active: 'green',
          returned: 'blue',
          permanent: 'purple'
        };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Returned', value: 'returned' },
        { text: 'Permanent', value: 'permanent' }
      ]
    },
    {
      title: 'Assigned Date',
      dataIndex: 'assigned_date',
      key: 'assigned_date',
      width: 130,
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a, b) => dayjs(a.assigned_date).unix() - dayjs(b.assigned_date).unix()
    },
    {
      title: 'Expected Return',
      dataIndex: 'expected_return_date',
      key: 'expected_return_date',
      width: 160,
      render: (date, record) => {
        if (!date) return '-';

        const status = getDaysStatus(record);
        if (!status) return dayjs(date).format('YYYY-MM-DD');

        return (
          <Tooltip title={status.text}>
            <div>
              <div>{dayjs(date).format('YYYY-MM-DD')}</div>
              <Tag color={status.color} style={{ fontSize: '11px', marginTop: 4 }}>
                {status.text}
              </Tag>
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 100,
      render: (_, record) => {
        const endDate = record.actual_return_date || dayjs();
        const days = dayjs(endDate).diff(dayjs(record.assigned_date), 'days');
        return `${days} days`;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            label: 'View Details',
            icon: <EyeOutlined />,
            onClick: () => handleViewDetailsClick(record)
          }
        ];

        // Add action items based on status
        if (record.status === 'active') {
          if (record.original_asset_id) {
            items.push({
              key: 'return',
              label: 'Return & Swap',
              icon: <SwapOutlined />,
              onClick: () => handleReturnClick(record)
            });
          }
          items.push({
            key: 'permanent',
            label: 'Make Permanent',
            icon: <LockOutlined />,
            danger: true,
            onClick: () => handleMakePermanentClick(record)
          });
        }

        if (record.status === 'returned' || record.status === 'permanent') {
          items.push({
            key: 'history',
            label: 'View History',
            icon: <HistoryOutlined />,
            onClick: () => handleViewHistoryClick(record)
          });
        }

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="link" icon={<MoreOutlined />} />
          </Dropdown>
        );
      }
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Standby Assignments"
        extra={
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            Refresh
          </Button>
        }
      >
        {/* Filters */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="Search by user, asset tag..."
            allowClear
            enterButton={<SearchOutlined />}
            style={{ width: 300 }}
            onSearch={handleSearch}
            defaultValue={filters.search}
          />

          <Select
            placeholder="Status"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('status', value)}
            value={filters.status}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'returned', label: 'Returned' },
              { value: 'permanent', label: 'Permanent' }
            ]}
          />

          <Select
            placeholder="User"
            allowClear
            showSearch
            style={{ width: 250 }}
            onChange={(value) => handleFilterChange('user_id', value)}
            value={filters.user_id}
            filterOption={(input, option) => {
              const label = option.label || '';
              return label.toLowerCase().includes(input.toLowerCase());
            }}
            options={users.map((user) => ({
              value: user.user_id,
              label: `${user.firstName} ${user.lastName}`
            }))}
          />

          <Select
            placeholder="Reason Category"
            allowClear
            style={{ width: 150 }}
            onChange={(value) => handleFilterChange('reason_category', value)}
            value={filters.reason_category}
            options={[
              { value: 'repair', label: 'Repair' },
              { value: 'maintenance', label: 'Maintenance' },
              { value: 'lost', label: 'Lost' },
              { value: 'stolen', label: 'Stolen' },
              { value: 'other', label: 'Other' }
            ]}
          />

          <Button onClick={handleClearFilters}>Clear Filters</Button>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={assignments}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} assignments`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Modals */}
      <ReturnStandbyModal
        visible={returnModalVisible}
        onClose={() => {
          setReturnModalVisible(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        onSuccess={handleRefresh}
      />

      <MakePermanentModal
        visible={permanentModalVisible}
        onClose={() => {
          setPermanentModalVisible(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
        onSuccess={handleRefresh}
      />

      <ViewAssignmentDetailsModal
        visible={detailsModalVisible}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
      />

      <ViewAssignmentHistoryModal
        visible={historyModalVisible}
        onClose={() => {
          setHistoryModalVisible(false);
          setSelectedAssignment(null);
        }}
        assignment={selectedAssignment}
      />
    </div>
  );
};

export default StandbyAssignments;
