import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Progress,
  message,
  Input,
  Select,
  Row,
  Col,
  Checkbox,
  Tooltip,
  Statistic,
  Breadcrumb,
  Modal,
  Form,
  Alert,
  Tabs
} from 'antd';
import {
  CheckCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  EnvironmentOutlined,
  TagOutlined,
  WarningOutlined,
  UnorderedListOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  fetchReconciliation,
  fetchReconciliationAssets,
  fetchReconciliationStatistics,
  reconcileAsset,
  bulkReconcileAssets,
  setAssetsPagination,
  selectCurrentReconciliation,
  selectReconciliationAssets,
  selectReconciliationStatistics,
  selectReconciliationLoading,
  selectReconciliationAssetsPagination
} from '../../../store/slices/reconciliationSlice';
import ReconcileAssetModal from './ReconcileAssetModal';
import DiscrepancyList from './DiscrepancyList';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

// Bulk Reconcile Form Component
const BulkReconcileForm = ({ assetCount, onSubmit }) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit(values);
    }).catch(info => {
      console.log('Validation Failed:', info);
    });
  };

  // Expose submit handler for parent
  React.useEffect(() => {
    window.bulkReconcileFormSubmit = handleSubmit;
  }, [handleSubmit]);

  return (
    <div style={{ marginTop: 16 }}>
      <p>You are about to reconcile <strong>{assetCount}</strong> assets with the same status.</p>

      <Alert
        type="info"
        message="Bulk Reconciliation"
        description="Bulk reconciliation applies the same status to all selected assets. For assets with specific discrepancies (location, condition, assignment changes), please reconcile them individually to enable detailed discrepancy tracking."
        style={{ marginBottom: 16 }}
        showIcon
      />

      <Form form={form} layout="vertical">
        <Form.Item
          name="reconciliation_status"
          label="Reconciliation Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select placeholder="Select status for all selected assets" size="large">
            <Option value="verified">
              <CheckCircleOutlined style={{ color: '#52c41a' }} /> Verified - All Match System Data
            </Option>
            <Option value="discrepancy">
              <WarningOutlined style={{ color: '#faad14' }} /> Discrepancy - Found Differences
            </Option>
            <Option value="missing">
              <WarningOutlined style={{ color: '#ff4d4f' }} /> Missing - Assets Not Found
            </Option>
            <Option value="damaged">
              <WarningOutlined style={{ color: '#ff7a45' }} /> Damaged - Physical Damage Detected
            </Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="discrepancy_notes"
          label="Notes (Optional)"
          rules={[{ max: 5000, message: 'Notes must not exceed 5000 characters' }]}
        >
          <TextArea
            rows={3}
            placeholder="Enter notes that apply to all selected assets..."
            showCount
            maxLength={5000}
          />
        </Form.Item>
      </Form>
    </div>
  );
};

const ReconciliationAssets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: reconciliationId } = useParams();
  const { user } = useSelector(state => state.auth);

  const currentReconciliation = useSelector(selectCurrentReconciliation);
  const assets = useSelector(selectReconciliationAssets);
  const statistics = useSelector(selectReconciliationStatistics);
  const loading = useSelector(selectReconciliationLoading);
  const pagination = useSelector(selectReconciliationAssetsPagination);

  const [selectedAssetIds, setSelectedAssetIds] = useState([]);
  const [isReconcileModalVisible, setIsReconcileModalVisible] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState(null);
  const [reconciliationStatusFilter, setReconciliationStatusFilter] = useState(null);

  // Check permissions
  const canReconcile = ['admin', 'superadmin', 'engineer'].includes(user?.role);

  useEffect(() => {
    loadData();
  }, [reconciliationId]);

  useEffect(() => {
    if (reconciliationId) {
      loadAssets();
    }
  }, [reconciliationId, pagination.page, pagination.limit, searchText, statusFilter, reconciliationStatusFilter]);

  const loadData = () => {
    dispatch(fetchReconciliation(reconciliationId));
    dispatch(fetchReconciliationStatistics(reconciliationId));
  };

  const loadAssets = () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit
    };

    if (searchText) params.search = searchText;
    if (statusFilter) params.status = statusFilter;
    if (reconciliationStatusFilter) params.reconciliation_status = reconciliationStatusFilter;

    dispatch(fetchReconciliationAssets({ reconciliationId, params }));
  };

  const handleSearch = (value) => {
    setSearchText(value);
    dispatch(setAssetsPagination({ page: 1 }));
  };

  const handleFilterChange = (field, value) => {
    if (field === 'status') setStatusFilter(value);
    if (field === 'reconciliation_status') setReconciliationStatusFilter(value);
    dispatch(setAssetsPagination({ page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter(null);
    setReconciliationStatusFilter(null);
    dispatch(setAssetsPagination({ page: 1 }));
  };

  const handleTableChange = (paginationConfig) => {
    dispatch(setAssetsPagination({
      page: paginationConfig.current,
      limit: paginationConfig.pageSize
    }));
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      setSelectedAssetIds(assets.map(a => a.id));
    } else {
      setSelectedAssetIds([]);
    }
  };

  const handleSelectAsset = (assetId, selected) => {
    if (selected) {
      setSelectedAssetIds([...selectedAssetIds, assetId]);
    } else {
      setSelectedAssetIds(selectedAssetIds.filter(id => id !== assetId));
    }
  };

  const handleReconcileSingle = (asset) => {
    setSelectedAsset(asset);
    setIsReconcileModalVisible(true);
  };

  const handleReconcileSuccess = () => {
    setIsReconcileModalVisible(false);
    setSelectedAsset(null);
    setSelectedAssetIds([]);
    loadData();
    loadAssets();
  };

  const handleBulkReconcile = () => {
    if (selectedAssetIds.length === 0) {
      message.warning('Please select assets to reconcile');
      return;
    }

    // Show modal for bulk reconciliation
    const modal = Modal.confirm({
      title: `Bulk Reconcile ${selectedAssetIds.length} Assets`,
      width: 600,
      content: (
        <BulkReconcileForm
          assetCount={selectedAssetIds.length}
          onSubmit={handleBulkReconcileSubmit}
        />
      ),
      okText: 'Reconcile All',
      cancelText: 'Cancel',
      onOk: () => {
        // Trigger form validation and submission
        if (window.bulkReconcileFormSubmit) {
          window.bulkReconcileFormSubmit();
        }
        return false; // Prevent auto-close, we'll close manually after success
      }
    });
  };

  const handleBulkReconcileSubmit = async (values) => {
    try {
      await dispatch(bulkReconcileAssets({
        reconciliationId,
        assetIds: selectedAssetIds,
        data: {
          reconciliation_status: values.reconciliation_status,
          discrepancy_notes: values.discrepancy_notes || null
        }
      })).unwrap();

      message.success(`Successfully reconciled ${selectedAssetIds.length} assets`);
      setSelectedAssetIds([]);
      loadData(); // Reload reconciliation and statistics
      loadAssets(); // Reload assets list
      Modal.destroyAll(); // Close the modal
    } catch (error) {
      message.error(error || 'Failed to bulk reconcile assets');
    }
  };

  const getReconciliationStatusConfig = (status) => {
    const configs = {
      pending: { color: 'default', label: 'Pending', icon: <WarningOutlined /> },
      verified: { color: 'success', label: 'Verified', icon: <CheckCircleOutlined /> },
      discrepancy: { color: 'warning', label: 'Discrepancy', icon: <WarningOutlined /> },
      missing: { color: 'error', label: 'Missing', icon: <WarningOutlined /> },
      damaged: { color: 'volcano', label: 'Damaged', icon: <WarningOutlined /> }
    };
    return configs[status] || configs.pending;
  };

  const columns = [
    {
      title: (
        <Checkbox
          checked={selectedAssetIds.length === assets.length && assets.length > 0}
          indeterminate={selectedAssetIds.length > 0 && selectedAssetIds.length < assets.length}
          onChange={(e) => handleSelectAll(e.target.checked)}
          disabled={!canReconcile || currentReconciliation?.status !== 'in_progress'}
        />
      ),
      key: 'checkbox',
      width: 50,
      fixed: 'left',
      render: (_, record) => {
        const isReconciled = record.reconciliation_status && record.reconciliation_status !== 'pending';
        return (
          <Checkbox
            checked={selectedAssetIds.includes(record.id)}
            onChange={(e) => handleSelectAsset(record.id, e.target.checked)}
            disabled={!canReconcile || currentReconciliation?.status !== 'in_progress' || isReconciled}
          />
        );
      }
    },
    {
      title: '#',
      key: 'index',
      width: 60,
      fixed: 'left',
      align: 'center',
      render: (_, __, index) => (
        <span className="text-gray-600 font-medium">
          {(pagination.page - 1) * pagination.limit + index + 1}
        </span>
      )
    },
    {
      title: 'Product',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div className="py-1">
          <div className="font-semibold text-gray-800 text-sm">{record.product_name || 'N/A'}</div>
          <div className="text-xs text-gray-500 mt-0.5">{record.product_model || 'No model'}</div>
        </div>
      )
    },
    {
      title: 'Asset ID',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      width: 120,
      render: (text) => <span className="font-mono text-xs bg-blue-50 px-2 py-1 rounded text-blue-700">{text}</span>
    },
    {
      title: 'Serial No',
      dataIndex: 'serial_number',
      key: 'serial_number',
      width: 130,
      render: (serial) => serial ? <span className="font-mono text-xs text-gray-700">{serial}</span> : <span className="text-gray-400">—</span>
    },
    {
      title: 'Assigned To',
      key: 'assigned_to',
      width: 180,
      render: (_, record) => {
        if (record.assigned_user_name) {
          return (
            <div className="py-1">
              <div className="font-medium text-gray-800 text-sm flex items-center">
                <UserOutlined className="mr-1.5 text-blue-500" />
                {record.assigned_user_name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 ml-5">{record.assigned_user_email || ''}</div>
            </div>
          );
        }
        return (
          <span className="text-gray-400 italic flex items-center">
            <UserOutlined className="mr-1.5" />
            Unassigned
          </span>
        );
      }
    },
    {
      title: 'Location',
      dataIndex: 'location_name',
      key: 'location',
      width: 150,
      render: (text) => text || <span className="text-gray-400">—</span>
    },
    {
      title: 'Asset Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      align: 'center',
      render: (status) => {
        const statusConfig = {
          available: { color: 'green', label: 'Available' },
          assigned: { color: 'blue', label: 'Assigned' },
          in_use: { color: 'cyan', label: 'In Use' },
          under_repair: { color: 'red', label: 'Under Repair' }
        };
        const config = statusConfig[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
    {
      title: 'Reconciliation Status',
      key: 'reconciliation_status',
      width: 150,
      align: 'center',
      render: (_, record) => {
        const config = getReconciliationStatusConfig(record.reconciliation_status || 'pending');
        return (
          <Tag icon={config.icon} color={config.color} className="px-3 py-1">
            {config.label}
          </Tag>
        );
      }
    },
    {
      title: 'Reconciled By',
      key: 'reconciled_by',
      width: 150,
      render: (_, record) => {
        if (record.reconciled_by_name) {
          return (
            <div className="text-sm">
              <div className="font-medium text-gray-800">{record.reconciled_by_name}</div>
              <div className="text-xs text-gray-500">
                {record.reconciled_at ? new Date(record.reconciled_at).toLocaleString() : ''}
              </div>
            </div>
          );
        }
        return <Text type="secondary">Not reconciled</Text>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const isPending = !record.reconciliation_status || record.reconciliation_status === 'pending';
        const isReconciled = record.reconciliation_status && record.reconciliation_status !== 'pending';

        return (
          <Space size="small">
            {canReconcile && currentReconciliation?.status === 'in_progress' && isPending && (
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleReconcileSingle(record)}
              >
                Reconcile
              </Button>
            )}
            {isReconciled && (
              <Tag color="success" icon={<CheckCircleOutlined />}>Done</Tag>
            )}
          </Space>
        );
      }
    }
  ];

  const progressPercentage = statistics?.statistics?.progress_percentage || 0;

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <Link to="/reconciliation">Reconciliation</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {currentReconciliation?.reconciliation_name || 'Assets'}
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/reconciliation')}
              className="mb-3"
            >
              Back to List
            </Button>
            <Title level={3} className="mb-2">
              {currentReconciliation?.reconciliation_name || 'Reconciliation Assets'}
            </Title>
            <Text type="secondary">
              {currentReconciliation?.description || 'Reconcile assets for this process'}
            </Text>
          </div>
          {canReconcile && currentReconciliation?.status === 'in_progress' && selectedAssetIds.length > 0 && (
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={handleBulkReconcile}
            >
              Bulk Reconcile ({selectedAssetIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Assets"
              value={statistics?.statistics?.total_assets || 0}
              prefix={<TagOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Reconciled"
              value={statistics?.statistics?.reconciled_assets || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending"
              value={statistics?.statistics?.pending_assets || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Progress"
              value={progressPercentage}
              suffix="%"
              prefix={<Progress type="circle" percent={progressPercentage} width={40} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs for Assets and Discrepancies */}
      <Tabs
        defaultActiveKey="assets"
        size="large"
        items={[
          {
            key: 'assets',
            label: (
              <span>
                <UnorderedListOutlined />
                Assets ({pagination.total || 0})
              </span>
            ),
            children: (
              <>
                {/* Filters */}
                <Card className="mb-4">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Search
                        placeholder="Search assets..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        onSearch={handleSearch}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </Col>
                    <Col span={5}>
                      <Select
                        placeholder="Asset Status"
                        allowClear
                        style={{ width: '100%' }}
                        value={statusFilter}
                        onChange={(value) => handleFilterChange('status', value)}
                      >
                        <Option value="available">Available</Option>
                        <Option value="assigned">Assigned</Option>
                        <Option value="in_use">In Use</Option>
                        <Option value="under_repair">Under Repair</Option>
                      </Select>
                    </Col>
                    <Col span={5}>
                      <Select
                        placeholder="Reconciliation Status"
                        allowClear
                        style={{ width: '100%' }}
                        value={reconciliationStatusFilter}
                        onChange={(value) => handleFilterChange('reconciliation_status', value)}
                      >
                        <Option value="pending">Pending</Option>
                        <Option value="verified">Verified</Option>
                        <Option value="discrepancy">Discrepancy</Option>
                        <Option value="missing">Missing</Option>
                        <Option value="damaged">Damaged</Option>
                      </Select>
                    </Col>
                    <Col span={4}>
                      <Button
                        icon={<FilterOutlined />}
                        onClick={handleClearFilters}
                        block
                      >
                        Clear Filters
                      </Button>
                    </Col>
                    <Col span={4}>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={loadAssets}
                        loading={loading}
                        block
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
                    dataSource={assets}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      current: pagination.page,
                      pageSize: pagination.limit,
                      total: pagination.total,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} assets`,
                      pageSizeOptions: ['10', '20', '50', '100']
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1600 }}
                    rowClassName={(record) =>
                      record.reconciliation_status && record.reconciliation_status !== 'pending'
                        ? 'bg-green-50'
                        : ''
                    }
                  />
                </Card>
              </>
            )
          },
          {
            key: 'discrepancies',
            label: (
              <span>
                <ExclamationCircleOutlined />
                Discrepancies
              </span>
            ),
            children: <DiscrepancyList reconciliationId={reconciliationId} />
          }
        ]}
      />

      {/* Reconcile Modal */}
      {isReconcileModalVisible && selectedAsset && (
        <ReconcileAssetModal
          visible={isReconcileModalVisible}
          asset={selectedAsset}
          reconciliationId={reconciliationId}
          onClose={() => {
            setIsReconcileModalVisible(false);
            setSelectedAsset(null);
          }}
          onSuccess={handleReconcileSuccess}
        />
      )}
    </div>
  );
};

export default ReconciliationAssets;
