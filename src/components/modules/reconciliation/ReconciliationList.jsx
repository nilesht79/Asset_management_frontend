import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Progress,
  Tooltip,
  Modal,
  message,
  Input,
  Select,
  Row,
  Col,
  Statistic,
  Dropdown
} from 'antd';
import {
  PlusOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  FileTextOutlined,
  PauseCircleOutlined,
  CaretRightOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchReconciliations,
  startReconciliation,
  completeReconciliation,
  pauseReconciliation,
  resumeReconciliation,
  deleteReconciliation,
  setFilters,
  clearFilters,
  setPagination,
  selectReconciliations,
  selectReconciliationLoading,
  selectReconciliationPagination,
  selectReconciliationFilters
} from '../../../store/slices/reconciliationSlice';
import CreateReconciliationModal from './CreateReconciliationModal';
import ForceCompleteModal from './ForceCompleteModal';
import { formatDateOnly } from '../../../utils/dateUtils';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

const ReconciliationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const reconciliations = useSelector(selectReconciliations);
  const loading = useSelector(selectReconciliationLoading);
  const pagination = useSelector(selectReconciliationPagination);
  const filters = useSelector(selectReconciliationFilters);

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [selectedReconciliation, setSelectedReconciliation] = useState(null);
  const [isForceCompleteModalVisible, setIsForceCompleteModalVisible] = useState(false);
  const [forceCompleteData, setForceCompleteData] = useState(null);

  // Check if user can create reconciliation (admin/superadmin only)
  const canCreate = ['admin', 'superadmin'].includes(user?.role);
  const canStart = ['admin', 'superadmin', 'engineer'].includes(user?.role);

  useEffect(() => {
    loadReconciliations();
  }, [pagination.page, pagination.limit, filters]);

  const loadReconciliations = () => {
    dispatch(fetchReconciliations({
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    }));
  };

  const handleSearch = (value) => {
    dispatch(setFilters({ search: value }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(setPagination({ page: 1 }));
  };

  const handleTableChange = (paginationConfig) => {
    dispatch(setPagination({
      page: paginationConfig.current,
      limit: paginationConfig.pageSize
    }));
  };

  const handleViewAssets = (record) => {
    navigate(`/reconciliation/${record.id}/assets`);
  };

  const handleStart = (record) => {
    confirm({
      title: 'Start Reconciliation',
      content: `Are you sure you want to start "${record.reconciliation_name}"? You will be able to reconcile assets after starting.`,
      okText: 'Yes, Start',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(startReconciliation({ id: record.id, data: {} })).unwrap();
          message.success('Reconciliation started successfully');
          loadReconciliations();
        } catch (error) {
          message.error(error || 'Failed to start reconciliation');
        }
      }
    });
  };

  const handleComplete = async (record) => {
    try {
      // Try to complete normally first
      await dispatch(completeReconciliation({ id: record.id, data: {} })).unwrap();
      message.success('Reconciliation completed successfully');
      loadReconciliations();
    } catch (error) {
      // Check if error is due to pending assets
      if (error && error.includes('pending')) {
        // Extract pending count from error message
        const match = error.match(/(\d+)\s+asset/);
        const pendingCount = match ? parseInt(match[1]) : 0;

        // Show force complete modal
        setForceCompleteData({
          record,
          pendingCount
        });
        setIsForceCompleteModalVisible(true);
      } else {
        message.error(error || 'Failed to complete reconciliation');
      }
    }
  };

  const handleForceComplete = async () => {
    if (!forceCompleteData) return;

    try {
      await dispatch(completeReconciliation({
        id: forceCompleteData.record.id,
        data: { force: true }
      })).unwrap();
      message.success('Reconciliation force-completed successfully');
      loadReconciliations();
      setIsForceCompleteModalVisible(false);
      setForceCompleteData(null);
    } catch (error) {
      message.error(error || 'Failed to force complete reconciliation');
      throw error;
    }
  };

  const handlePause = (record) => {
    confirm({
      title: 'Pause Reconciliation',
      content: `Are you sure you want to pause "${record.reconciliation_name}"? You can resume it later.`,
      okText: 'Yes, Pause',
      okType: 'default',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(pauseReconciliation({ id: record.id, data: {} })).unwrap();
          message.success('Reconciliation paused successfully');
          loadReconciliations();
        } catch (error) {
          message.error(error || 'Failed to pause reconciliation');
        }
      }
    });
  };

  const handleResume = (record) => {
    confirm({
      title: 'Resume Reconciliation',
      content: `Are you sure you want to resume "${record.reconciliation_name}"?`,
      okText: 'Yes, Resume',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(resumeReconciliation({ id: record.id, data: {} })).unwrap();
          message.success('Reconciliation resumed successfully');
          loadReconciliations();
        } catch (error) {
          message.error(error || 'Failed to resume reconciliation');
        }
      }
    });
  };

  const handleDelete = (record) => {
    confirm({
      title: 'Delete Reconciliation',
      content: `Are you sure you want to delete "${record.reconciliation_name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteReconciliation(record.id)).unwrap();
          message.success('Reconciliation deleted successfully');
          loadReconciliations();
        } catch (error) {
          message.error(error || 'Failed to delete reconciliation');
        }
      }
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      draft: { color: 'default', label: 'Draft', icon: <FileTextOutlined /> },
      in_progress: { color: 'processing', label: 'In Progress', icon: <PlayCircleOutlined spin /> },
      paused: { color: 'warning', label: 'Paused', icon: <PauseCircleOutlined /> },
      completed: { color: 'success', label: 'Completed', icon: <CheckCircleOutlined /> },
      cancelled: { color: 'error', label: 'Cancelled', icon: <DeleteOutlined /> }
    };
    return configs[status] || configs.draft;
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => (
        <span className="text-gray-600 font-medium">
          {(pagination.page - 1) * pagination.limit + index + 1}
        </span>
      )
    },
    {
      title: 'Reconciliation Name',
      dataIndex: 'reconciliation_name',
      key: 'name',
      width: 250,
      render: (text, record) => (
        <div>
          <div className="font-semibold text-gray-800">{text}</div>
          {record.description && (
            <div className="text-xs text-gray-500 mt-1">{record.description}</div>
          )}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag icon={config.icon} color={config.color} className="px-3 py-1">
            {config.label}
          </Tag>
        );
      }
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 200,
      render: (_, record) => {
        const percentage = record.total_assets > 0
          ? Math.round((record.reconciled_assets / record.total_assets) * 100)
          : 0;

        return (
          <div>
            <Progress
              percent={percentage}
              size="small"
              status={record.status === 'completed' ? 'success' : 'active'}
            />
            <div className="text-xs text-gray-500 mt-1">
              {record.reconciled_assets} / {record.total_assets} assets
            </div>
          </div>
        );
      }
    },
    {
      title: 'Discrepancies',
      dataIndex: 'discrepancy_count',
      key: 'discrepancies',
      width: 120,
      align: 'center',
      render: (count) => (
        <Tag color={count > 0 ? 'warning' : 'default'}>
          {count || 0}
        </Tag>
      )
    },
    {
      title: 'Created By',
      key: 'created_by',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-gray-800">
            {record.created_by_name || 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {formatDateOnly(record.created_at)}
          </div>
        </div>
      )
    },
    {
      title: 'Started By',
      key: 'started_by',
      width: 180,
      render: (_, record) => {
        if (!record.started_by_name) {
          return <Text type="secondary">Not started</Text>;
        }
        return (
          <div>
            <div className="text-sm font-medium text-gray-800">
              {record.started_by_name}
            </div>
            <div className="text-xs text-gray-500">
              {formatDateOnly(record.started_at)}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 100,
      align: 'center',
      render: (_, record) => {
        // Build menu items for dropdown
        const menuItems = [];

        // Add status-specific actions
        if (record.status === 'draft' && canStart) {
          menuItems.push({
            key: 'start',
            label: 'Start',
            icon: <PlayCircleOutlined />,
            onClick: () => handleStart(record)
          });
        }

        if (record.status === 'in_progress' && canStart) {
          menuItems.push({
            key: 'pause',
            label: 'Pause',
            icon: <PauseCircleOutlined />,
            onClick: () => handlePause(record)
          });
          menuItems.push({
            key: 'complete',
            label: 'Complete',
            icon: <CheckCircleOutlined />,
            onClick: () => handleComplete(record)
          });
        }

        if (record.status === 'paused' && canStart) {
          menuItems.push({
            key: 'resume',
            label: 'Resume',
            icon: <CaretRightOutlined />,
            onClick: () => handleResume(record)
          });
        }

        if (canCreate && record.status !== 'completed') {
          menuItems.push({
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record)
          });
        }

        return (
          <Space size="small">
            <Tooltip title="View Assets">
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewAssets(record)}
              />
            </Tooltip>

            {menuItems.length > 0 && (
              <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  size="small"
                  icon={<MoreOutlined />}
                />
              </Dropdown>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <Title level={3} className="mb-2">
              Inventory Reconciliation
            </Title>
            <Text type="secondary">
              Manage and track inventory reconciliation processes
            </Text>
          </div>
          {canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => setIsCreateModalVisible(true)}
            >
              Create Reconciliation
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col span={8}>
            <Search
              placeholder="Search by name or description"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              defaultValue={filters.search}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Filter by status"
              allowClear
              size="large"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Option value="draft">Draft</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button
              icon={<FilterOutlined />}
              size="large"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </Col>
          <Col span={4}>
            <Button
              icon={<ReloadOutlined />}
              size="large"
              onClick={loadReconciliations}
              loading={loading}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={reconciliations}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} reconciliations`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Create Modal */}
      {isCreateModalVisible && (
        <CreateReconciliationModal
          visible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          onSuccess={() => {
            setIsCreateModalVisible(false);
            loadReconciliations();
          }}
        />
      )}

      {/* Force Complete Modal */}
      <ForceCompleteModal
        visible={isForceCompleteModalVisible}
        onConfirm={handleForceComplete}
        onCancel={() => {
          setIsForceCompleteModalVisible(false);
          setForceCompleteData(null);
        }}
        pendingCount={forceCompleteData?.pendingCount || 0}
        reconciliation={forceCompleteData?.record}
      />
    </div>
  );
};

export default ReconciliationList;
