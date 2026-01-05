import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Button,
  Space,
  Select,
  Input,
  Pagination,
  Empty,
  Spin,
  Row,
  Col,
  Statistic,
  message,
  Tabs,
  Tag,
  Descriptions
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeliveredProcedureOutlined,
  WarningOutlined,
  SendOutlined
} from '@ant-design/icons';
import {
  fetchPendingAssignments,
  assignAsset,
  setFilters,
  clearFilters
} from '../store/slices/requisitionSlice';
import RequisitionCard from '../components/requisitions/RequisitionCard';
import AssetSelectionModal from '../components/requisitions/AssetSelectionModal';
import EngineerAssignmentModal from '../components/requisitions/EngineerAssignmentModal';
import api from '../services/api';
import './AssetAssignment.css';

const { Option } = Select;

const AssetAssignment = () => {
  const dispatch = useDispatch();
  const { pendingApprovals = [], pagination = { page: 1, limit: 10, total: 0 }, loading = false, filters = {} } = useSelector((state) => state.requisitions || {});

  const [assetModalVisible, setAssetModalVisible] = useState(false);
  const [engineerModalVisible, setEngineerModalVisible] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [boards, setBoards] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    critical: 0,
    assigned: 0
  });

  useEffect(() => {
    loadAssignments();
  }, [filters, pagination?.page, activeTab]);

  useEffect(() => {
    loadBoards();
    loadDepartments();
  }, []);

  useEffect(() => {
    if (filters.board_id !== undefined) {
      loadDepartments();
    }
  }, [filters.board_id]);

  useEffect(() => {
    if (pendingApprovals.length > 0) {
      const newStats = {
        pending: pendingApprovals.filter(r => r.status === 'pending_assignment').length,
        critical: pendingApprovals.filter(r => r.urgency === 'critical' && r.status === 'pending_assignment').length,
        assigned: pendingApprovals.filter(r => r.status === 'assigned').length
      };
      setStats(newStats);
    }
  }, [pendingApprovals]);

  const loadAssignments = () => {
    const params = {
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
      ...filters
    };

    // Filter by tab
    if (activeTab === 'pending') {
      params.status = 'pending_assignment';
    } else if (activeTab === 'assigned') {
      params.status = 'assigned';
    }

    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    dispatch(fetchPendingAssignments(params));
  };

  const loadBoards = async () => {
    try {
      const response = await api.get('/boards', {
        params: { limit: 1000, page: 1 }
      });
      const data = response.data.data || response.data;
      setBoards(data.boards || data || []);
    } catch (error) {
      console.error('Failed to load boards:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await api.get('/departments', {
        params: {
          limit: 1000,
          page: 1,
          board_id: filters.board_id || undefined
        }
      });
      const data = response.data.data || response.data;
      setDepartments(data.departments || data || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ ...filters, [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handlePageChange = (page, pageSize) => {
    dispatch(fetchPendingAssignments({
      page,
      limit: pageSize,
      ...filters,
      status: activeTab === 'pending' ? 'pending_assignment' : activeTab === 'assigned' ? 'assigned' : undefined
    }));
  };

  const handleAssignClick = (requisition) => {
    setSelectedRequisition(requisition);
    setAssetModalVisible(true);
  };

  const handleAssetSelected = (asset) => {
    setSelectedAsset(asset);
    setAssetModalVisible(false);
    setEngineerModalVisible(true);
  };

  const handleEngineerAssigned = async (engineerData) => {
    try {
      setProcessingId(selectedRequisition.requisition_id);

      const payload = {
        requisition_id: selectedRequisition.requisition_id,
        asset_id: selectedAsset.id, // Asset API returns 'id' not 'asset_id'
        engineer_id: engineerData.engineer_id,
        installation_scheduled_date: engineerData.installation_scheduled_date,
        installation_notes: engineerData.installation_notes
      };

      await dispatch(assignAsset(payload)).unwrap();
      message.success('Asset assigned successfully. Engineer assigned for installation.');

      setEngineerModalVisible(false);
      setSelectedRequisition(null);
      setSelectedAsset(null);
      loadAssignments();
    } catch (error) {
      message.error(error.message || 'Failed to assign asset');
    } finally {
      setProcessingId(null);
    }
  };

  const urgencyConfig = {
    low: { label: 'Low', color: 'green' },
    medium: { label: 'Medium', color: 'blue' },
    high: { label: 'High', color: 'orange' },
    critical: { label: 'Critical', color: 'red' }
  };

  const renderAssignmentCard = (requisition) => {
    const urgency = urgencyConfig[requisition.urgency] || urgencyConfig.medium;

    return (
      <Card
        key={requisition.requisition_id}
        className="assignment-card"
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col xs={24} lg={16}>
            <RequisitionCard
              requisition={requisition}
              showActions={false}
            />

            {/* Approval Summary */}
            <div style={{ marginTop: 12, padding: 12, background: '#f0f7ff', borderRadius: 4 }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <strong>Approval Summary:</strong>
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> Department Head: {requisition.dept_head_name}
                    </div>
                    {requisition.dept_head_comments && (
                      <div style={{ marginLeft: 20, fontSize: 12, color: '#666' }}>
                        "{requisition.dept_head_comments}"
                      </div>
                    )}
                  </Col>
                  <Col span={12}>
                    <div>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> IT Head: {requisition.it_head_name}
                    </div>
                    {requisition.it_head_comments && (
                      <div style={{ marginLeft: 20, fontSize: 12, color: '#666' }}>
                        "{requisition.it_head_comments}"
                      </div>
                    )}
                  </Col>
                </Row>
              </Space>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div className="assignment-actions">
              <Descriptions
                title="Required Asset"
                column={1}
                size="small"
                bordered
                style={{ marginBottom: 16 }}
              >
                {requisition.category_name && (
                  <Descriptions.Item label="Category">
                    {requisition.category_name}
                  </Descriptions.Item>
                )}
                {requisition.subcategory_name && (
                  <Descriptions.Item label="Subcategory">
                    {requisition.subcategory_name}
                  </Descriptions.Item>
                )}
                {requisition.product_name && (
                  <Descriptions.Item label="Product">
                    {requisition.product_name}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Quantity">
                  {requisition.quantity}
                </Descriptions.Item>
                <Descriptions.Item label="Urgency">
                  <Tag color={urgency.color}>
                    {urgency.color === 'red' && <WarningOutlined />} {urgency.label}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>

              {requisition.status === 'pending_assignment' && (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => handleAssignClick(requisition)}
                  loading={processingId === requisition.requisition_id}
                  block
                  size="large"
                >
                  Assign Asset
                </Button>
              )}

              {requisition.status === 'assigned' && (
                <div style={{ textAlign: 'center' }}>
                  <Tag color="success" style={{ padding: '8px 16px', fontSize: 14 }}>
                    <CheckCircleOutlined /> Asset Assigned
                  </Tag>
                  {requisition.assigned_asset_tag && (
                    <div style={{ marginTop: 8 }}>
                      <strong>Asset Tag:</strong>
                      <div>
                        <Tag color="blue">{requisition.assigned_asset_tag}</Tag>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  const tabItems = [
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined /> Pending Assignment
          {stats.pending > 0 && (
            <span className="tab-badge">{stats.pending}</span>
          )}
        </span>
      ),
      children: (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" tip="Loading pending assignments..." />
            </div>
          ) : pendingApprovals.length === 0 ? (
            <Empty
              description="No pending assignments"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <p>All approved requisitions have been assigned assets.</p>
            </Empty>
          ) : (
            <>
              {pendingApprovals.map(requisition => renderAssignmentCard(requisition))}

              {(pagination?.total || 0) > (pagination?.limit || 10) && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Pagination
                    current={pagination?.page || 1}
                    pageSize={pagination?.limit || 10}
                    total={pagination?.total || 0}
                    onChange={handlePageChange}
                    showSizeChanger
                    showTotal={(total) => `Total ${total} requisitions`}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )
    },
    {
      key: 'assigned',
      label: (
        <span>
          <CheckCircleOutlined /> Assigned
        </span>
      ),
      children: (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" tip="Loading assigned requisitions..." />
            </div>
          ) : pendingApprovals.length === 0 ? (
            <Empty
              description="No assigned requisitions"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              {pendingApprovals.map(requisition => renderAssignmentCard(requisition))}

              {(pagination?.total || 0) > (pagination?.limit || 10) && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Pagination
                    current={pagination?.page || 1}
                    pageSize={pagination?.limit || 10}
                    total={pagination?.total || 0}
                    onChange={handlePageChange}
                    showSizeChanger
                    showTotal={(total) => `Total ${total} requisitions`}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="asset-assignment-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Asset Assignment & Fulfillment</h2>
          <p className="page-description">Assign assets to approved requisitions and schedule delivery</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Pending Assignment"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Critical Priority"
              value={stats.critical}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Assigned Today"
              value={stats.assigned}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap style={{ width: '100%' }}>
          <Input
            placeholder="Search by requisition number or employee"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <Select
            placeholder="Filter by Urgency"
            value={filters.urgency || undefined}
            onChange={(value) => handleFilterChange('urgency', value)}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="critical">Critical</Option>
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
          </Select>

          <Select
            placeholder="Filter by Board"
            value={filters.board_id || undefined}
            onChange={(value) => {
              handleFilterChange('board_id', value);
              if (filters.department_id) {
                dispatch(setFilters({ ...filters, board_id: value, department_id: '' }));
              }
            }}
            style={{ width: 180 }}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {boards.map(board => (
              <Option key={board.id} value={board.id}>
                {board.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Filter by Department"
            value={filters.department_id || undefined}
            onChange={(value) => handleFilterChange('department_id', value)}
            style={{ width: 200 }}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {departments.map(dept => (
              <Option key={dept.id} value={dept.id}>
                {dept.name}
              </Option>
            ))}
          </Select>

          <Button
            icon={<FilterOutlined />}
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </Space>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* Asset Selection Modal */}
      {selectedRequisition && (
        <AssetSelectionModal
          visible={assetModalVisible}
          onCancel={() => {
            setAssetModalVisible(false);
            setSelectedRequisition(null);
          }}
          onSelect={handleAssetSelected}
          requisition={selectedRequisition}
        />
      )}

      {/* Engineer Assignment Modal */}
      {selectedRequisition && selectedAsset && (
        <EngineerAssignmentModal
          visible={engineerModalVisible}
          onCancel={() => {
            setEngineerModalVisible(false);
            setSelectedAsset(null);
          }}
          onSubmit={handleEngineerAssigned}
          requisition={selectedRequisition}
          asset={selectedAsset}
          loading={processingId === selectedRequisition.requisition_id}
        />
      )}
    </div>
  );
};

export default AssetAssignment;
