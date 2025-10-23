import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Select,
  Input,
  Pagination,
  Empty,
  Spin,
  Modal,
  Form,
  message,
  Row,
  Col,
  Statistic,
  Tag
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import {
  fetchMyRequisitions,
  cancelRequisition,
  setFilters,
  clearFilters
} from '../store/slices/requisitionSlice';
import RequisitionCard from '../components/requisitions/RequisitionCard';
import EmployeeDeliveryConfirmation from '../components/requisitions/EmployeeDeliveryConfirmation';
import './MyRequisitions.css';

const { Option } = Select;
const { confirm } = Modal;
const { TextArea } = Input;

const MyRequisitions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { requisitions, pagination, loading, filters } = useSelector((state) => state.requisitions);

  const [cancelForm] = Form.useForm();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Delivery signature modal state
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [selectedDeliveryRequisition, setSelectedDeliveryRequisition] = useState(null);

  // Statistics state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Load requisitions on mount and when filters/pagination change
  useEffect(() => {
    loadRequisitions();
  }, [filters, pagination.page]);

  // Calculate statistics when requisitions change
  useEffect(() => {
    if (requisitions.length > 0) {
      const newStats = {
        total: pagination.total || requisitions.length,
        pending: requisitions.filter(r =>
          ['pending_dept_head', 'pending_it_head', 'pending_assignment'].includes(r.status)
        ).length,
        approved: requisitions.filter(r =>
          ['assigned', 'delivered', 'completed'].includes(r.status)
        ).length,
        rejected: requisitions.filter(r =>
          ['rejected_by_dept_head', 'rejected_by_it_head', 'cancelled'].includes(r.status)
        ).length
      };
      setStats(newStats);
    }
  }, [requisitions, pagination.total]);

  const loadRequisitions = () => {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      ...filters
    };

    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });

    dispatch(fetchMyRequisitions(params));
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ ...filters, [key]: value }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const handlePageChange = (page, pageSize) => {
    dispatch(fetchMyRequisitions({
      page,
      limit: pageSize,
      ...filters
    }));
  };

  const handleCancelClick = (requisition) => {
    setSelectedRequisition(requisition);
    setCancelModalVisible(true);
    cancelForm.resetFields();
  };

  const handleCancelSubmit = async () => {
    try {
      const values = await cancelForm.validateFields();
      setCancelLoading(true);

      await dispatch(cancelRequisition({
        id: selectedRequisition.requisition_id,
        cancellation_reason: values.cancellation_reason
      })).unwrap();

      message.success('Requisition cancelled successfully');
      setCancelModalVisible(false);
      setSelectedRequisition(null);
      cancelForm.resetFields();
      loadRequisitions();
    } catch (error) {
      message.error(error.message || 'Failed to cancel requisition');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleNewRequisition = () => {
    navigate('/requisitions/new');
  };

  const handleSignForDelivery = (requisition) => {
    setSelectedDeliveryRequisition(requisition);
    setSignatureModalVisible(true);
  };

  const handleSignatureSuccess = () => {
    setSignatureModalVisible(false);
    setSelectedDeliveryRequisition(null);
    loadRequisitions(); // Reload to update status
  };

  return (
    <div className="my-requisitions-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>My Asset Requisitions</h2>
          <p className="page-description">View and manage your asset requisition requests</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleNewRequisition}
        >
          New Requisition
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Requisitions"
              value={stats.total}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Rejected/Cancelled"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap style={{ width: '100%' }}>
          <Input
            placeholder="Search by requisition number or purpose"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <Select
            placeholder="Filter by Status"
            value={filters.status || undefined}
            onChange={(value) => handleFilterChange('status', value)}
            style={{ width: 200 }}
            allowClear
          >
            <Option value="pending_dept_head">Pending Dept Head</Option>
            <Option value="approved_by_dept_head">Approved by Dept Head</Option>
            <Option value="rejected_by_dept_head">Rejected by Dept Head</Option>
            <Option value="pending_it_head">Pending IT Head</Option>
            <Option value="approved_by_it_head">Approved by IT Head</Option>
            <Option value="rejected_by_it_head">Rejected by IT Head</Option>
            <Option value="pending_assignment">Pending Assignment</Option>
            <Option value="assigned">Assigned</Option>
            <Option value="delivered">Delivered</Option>
            <Option value="completed">Completed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>

          <Select
            placeholder="Filter by Urgency"
            value={filters.urgency || undefined}
            onChange={(value) => handleFilterChange('urgency', value)}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="low">Low</Option>
            <Option value="medium">Medium</Option>
            <Option value="high">High</Option>
            <Option value="critical">Critical</Option>
          </Select>

          <Button
            icon={<FilterOutlined />}
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </Space>
      </Card>

      {/* Requisitions List */}
      <Card>
        <Spin spinning={loading}>
          {requisitions.length === 0 && !loading ? (
            <Empty
              description="No requisitions found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={handleNewRequisition}>
                Create Your First Requisition
              </Button>
            </Empty>
          ) : (
            <>
              {requisitions.map((requisition) => (
                <RequisitionCard
                  key={requisition.requisition_id}
                  requisition={requisition}
                  onCancel={handleCancelClick}
                  onSignForDelivery={handleSignForDelivery}
                  showActions={true}
                />
              ))}

              {/* Pagination */}
              {pagination.total > pagination.limit && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Pagination
                    current={pagination.page}
                    pageSize={pagination.limit}
                    total={pagination.total}
                    onChange={handlePageChange}
                    showSizeChanger
                    showTotal={(total) => `Total ${total} requisitions`}
                  />
                </div>
              )}
            </>
          )}
        </Spin>
      </Card>

      {/* Cancel Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            Cancel Requisition
          </Space>
        }
        open={cancelModalVisible}
        onCancel={() => {
          setCancelModalVisible(false);
          setSelectedRequisition(null);
          cancelForm.resetFields();
        }}
        onOk={handleCancelSubmit}
        confirmLoading={cancelLoading}
        okText="Cancel Requisition"
        okButtonProps={{ danger: true }}
      >
        {selectedRequisition && (
          <div style={{ marginBottom: 16 }}>
            <p>
              Are you sure you want to cancel requisition{' '}
              <Tag color="blue">{selectedRequisition.requisition_number}</Tag>?
            </p>
            <p className="text-secondary">
              Purpose: {selectedRequisition.purpose}
            </p>
          </div>
        )}

        <Form form={cancelForm} layout="vertical">
          <Form.Item
            name="cancellation_reason"
            label="Cancellation Reason"
            rules={[
              { required: true, message: 'Please provide a reason for cancellation' },
              { min: 10, message: 'Reason must be at least 10 characters' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Please explain why you are cancelling this requisition..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Employee Delivery Signature Modal */}
      {selectedDeliveryRequisition && (
        <EmployeeDeliveryConfirmation
          requisition={selectedDeliveryRequisition}
          visible={signatureModalVisible}
          onCancel={() => {
            setSignatureModalVisible(false);
            setSelectedDeliveryRequisition(null);
          }}
          onSuccess={handleSignatureSuccess}
        />
      )}
    </div>
  );
};

export default MyRequisitions;
