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
  Alert,
  Divider
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  CheckSquareOutlined,
  InboxOutlined
} from '@ant-design/icons';
import {
  fetchPendingITApprovals,
  approveITHead,
  rejectITHead,
  setFilters,
  clearFilters
} from '../store/slices/requisitionSlice';
import RequisitionCard from '../components/requisitions/RequisitionCard';
import ApprovalModal from '../components/requisitions/ApprovalModal';
import './ITHeadApprovals.css';

const { Option } = Select;

const ITHeadApprovals = () => {
  const dispatch = useDispatch();
  const { pendingApprovals = [], pagination = { page: 1, limit: 10, total: 0 }, loading = false, filters = {} } = useSelector((state) => state.requisitions || {});

  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [approvalAction, setApprovalAction] = useState(null); // 'approve' or 'reject'
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  // Statistics
  const [stats, setStats] = useState({
    pending: 0,
    critical: 0,
    high: 0
  });

  useEffect(() => {
    loadApprovals();
  }, [filters, pagination?.page, activeTab]);

  useEffect(() => {
    if (pendingApprovals.length > 0) {
      const newStats = {
        pending: pendingApprovals.filter(r => r.status === 'pending_it_head').length,
        critical: pendingApprovals.filter(r => r.urgency === 'critical').length,
        high: pendingApprovals.filter(r => r.urgency === 'high').length
      };
      setStats(newStats);
    }
  }, [pendingApprovals]);

  const loadApprovals = () => {
    const params = {
      page: pagination?.page || 1,
      limit: pagination?.limit || 10,
      ...filters
    };

    // Filter by tab
    if (activeTab === 'pending') {
      params.status = 'pending_it_head';
    }

    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    dispatch(fetchPendingITApprovals(params));
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ ...filters, [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handlePageChange = (page, pageSize) => {
    dispatch(fetchPendingITApprovals({
      page,
      limit: pageSize,
      ...filters,
      status: activeTab === 'pending' ? 'pending_it_head' : undefined
    }));
  };

  const handleApproveClick = (requisition) => {
    setSelectedRequisition(requisition);
    setApprovalAction('approve');
    setApprovalModalVisible(true);
  };

  const handleRejectClick = (requisition) => {
    setSelectedRequisition(requisition);
    setApprovalAction('reject');
    setApprovalModalVisible(true);
  };

  const handleApprovalSubmit = async (values) => {
    try {
      setProcessingId(selectedRequisition.requisition_id);

      const payload = {
        id: selectedRequisition.requisition_id,
        comments: values.comments
      };

      if (approvalAction === 'approve') {
        await dispatch(approveITHead(payload)).unwrap();
        message.success('Requisition approved successfully. Ready for asset assignment.');
      } else {
        await dispatch(rejectITHead(payload)).unwrap();
        message.success('Requisition rejected successfully');
      }

      setApprovalModalVisible(false);
      setSelectedRequisition(null);
      setApprovalAction(null);
      loadApprovals();
    } catch (error) {
      message.error(error.message || `Failed to ${approvalAction} requisition`);
    } finally {
      setProcessingId(null);
    }
  };

  const renderApprovalCard = (requisition) => {
    const availableCount = requisition.available_assets_count || 0;
    const totalCount = requisition.total_assets_count || 0;
    const inUseCount = requisition.in_use_assets_count || 0;
    const hasAvailableAssets = availableCount > 0;

    return (
      <Card
        key={requisition.requisition_id}
        className="approval-card"
        style={{ marginBottom: 16 }}
      >
        <RequisitionCard
          requisition={requisition}
          showActions={false}
        />

        {/* Asset Availability Section */}
        <div style={{ marginTop: 12 }}>
          <Divider orientation="left" style={{ margin: '12px 0' }}>
            <Space>
              <InboxOutlined />
              Asset Availability
            </Space>
          </Divider>

          {(requisition.asset_category_id && requisition.product_type_id) ? (
            <div style={{
              padding: 16,
              background: hasAvailableAssets ? '#f6ffed' : '#fff2f0',
              borderRadius: 8,
              border: `1px solid ${hasAvailableAssets ? '#b7eb8f' : '#ffccc7'}`
            }}>
              <Row gutter={16} align="middle">
                <Col span={8}>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Requested:</strong>
                  </div>
                  <div>
                    <Tag color="blue">{requisition.category_name || 'N/A'}</Tag>
                    <Tag color="purple">{requisition.product_type_name || 'N/A'}</Tag>
                  </div>
                </Col>
                <Col span={16}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="Available"
                        value={availableCount}
                        valueStyle={{ color: hasAvailableAssets ? '#52c41a' : '#ff4d4f', fontSize: 24 }}
                        prefix={hasAvailableAssets ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="In Use"
                        value={inUseCount}
                        valueStyle={{ color: '#1890ff', fontSize: 24 }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Total"
                        value={totalCount}
                        valueStyle={{ color: '#666', fontSize: 24 }}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>

              {!hasAvailableAssets && (
                <Alert
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  message="No assets currently available"
                  description="There are no available assets for this category and type. Consider rejecting or waiting until stock is replenished."
                  style={{ marginTop: 12 }}
                />
              )}

              {hasAvailableAssets && (
                <div style={{ marginTop: 12 }}>
                  <Tag color="success" icon={<CheckSquareOutlined />}>
                    {availableCount} asset{availableCount !== 1 ? 's' : ''} ready for assignment
                  </Tag>
                </div>
              )}
            </div>
          ) : (
            <Alert
              type="info"
              showIcon
              message="Category/Type not specified"
              description="This requisition does not specify a category or product type. Asset availability will be determined during assignment."
            />
          )}
        </div>

        {/* Show Department Head Approval Info */}
        {requisition.dept_head_name && (
          <div style={{ marginTop: 12, padding: 12, background: '#f0f7ff', borderRadius: 4 }}>
            <Space direction="vertical" size="small">
              <div>
                <strong>Department Head Approval:</strong>
              </div>
              <div>
                Approved by: {requisition.dept_head_name}
              </div>
              {requisition.dept_head_comments && (
                <div>
                  Comments: <em>{requisition.dept_head_comments}</em>
                </div>
              )}
            </Space>
          </div>
        )}

        <div className="approval-actions" style={{ marginTop: 16, textAlign: 'right' }}>
          <Space>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleRejectClick(requisition)}
              loading={processingId === requisition.requisition_id}
            >
              Reject
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApproveClick(requisition)}
              loading={processingId === requisition.requisition_id}
            >
              Approve
            </Button>
          </Space>
        </div>
      </Card>
    );
  };

  const tabItems = [
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined /> Pending Approvals
          {stats.pending > 0 && (
            <span className="tab-badge">{stats.pending}</span>
          )}
        </span>
      ),
      children: (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" tip="Loading pending approvals..." />
            </div>
          ) : pendingApprovals.length === 0 ? (
            <Empty
              description="No pending approvals"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <p>All caught up! No requisitions awaiting your approval.</p>
            </Empty>
          ) : (
            <>
              {pendingApprovals.map(requisition => renderApprovalCard(requisition))}

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
    <div className="it-head-approvals-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>IT Head Approvals</h2>
          <p className="page-description">Review and approve asset requisitions for final authorization</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Pending Approvals"
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
              title="High Priority"
              value={stats.high}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa8c16' }}
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

      {/* Approval Modal */}
      {selectedRequisition && (
        <ApprovalModal
          visible={approvalModalVisible}
          onCancel={() => {
            setApprovalModalVisible(false);
            setSelectedRequisition(null);
            setApprovalAction(null);
          }}
          onSubmit={handleApprovalSubmit}
          requisition={selectedRequisition}
          action={approvalAction}
          role="IT Head"
          loading={processingId === selectedRequisition.requisition_id}
        />
      )}
    </div>
  );
};

export default ITHeadApprovals;
