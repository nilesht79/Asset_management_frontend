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
  Statistic
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
  FileTextOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchReconciliations,
  startReconciliation,
  completeReconciliation,
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

  const handleComplete = (record) => {
    confirm({
      title: 'Complete Reconciliation',
      content: `Are you sure you want to mark "${record.reconciliation_name}" as completed? This action cannot be undone.`,
      okText: 'Yes, Complete',
      okType: 'primary',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(completeReconciliation({ id: record.id, data: {} })).unwrap();
          message.success('Reconciliation completed successfully');
          loadReconciliations();
        } catch (error) {
          message.error(error || 'Failed to complete reconciliation');
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
            {new Date(record.created_at).toLocaleDateString()}
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
              {new Date(record.started_at).toLocaleDateString()}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Assets">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewAssets(record)}
            >
              View
            </Button>
          </Tooltip>

          {record.status === 'draft' && canStart && (
            <Tooltip title="Start Reconciliation">
              <Button
                type="primary"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStart(record)}
              >
                Start
              </Button>
            </Tooltip>
          )}

          {record.status === 'in_progress' && canStart && (
            <Tooltip title="Mark as Complete">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleComplete(record)}
              >
                Complete
              </Button>
            </Tooltip>
          )}

          {canCreate && record.status !== 'completed' && (
            <Tooltip title="Delete">
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      )
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
    </div>
  );
};

export default ReconciliationList;
