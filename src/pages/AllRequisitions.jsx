import React, { useEffect, useState } from 'react';
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
  Row,
  Col,
  Statistic,
  Tag
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import RequisitionCard from '../components/requisitions/RequisitionCard';
import api from '../services/api';
import './AllRequisitions.css';

const { Option } = Select;

const AllRequisitions = () => {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    urgency: '',
    board_id: '',
    department_id: '',
    requester_id: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Statistics state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Additional filter options
  const [boards, setBoards] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  // Load requisitions on mount and when filters/pagination change
  useEffect(() => {
    loadRequisitions();
  }, [filters, pagination.page]);

  // Load boards, departments and users for filters
  useEffect(() => {
    loadBoards();
    loadDepartments();
  }, []);

  // Reload departments when board filter changes
  useEffect(() => {
    if (filters.board_id !== undefined) {
      loadDepartments();
    }
  }, [filters.board_id]);

  // Calculate statistics when requisitions change
  useEffect(() => {
    if (requisitions.length > 0) {
      const newStats = {
        total: pagination.total || requisitions.length,
        pending: requisitions.filter(r =>
          ['pending_dept_head', 'pending_it_head', 'pending_assignment'].includes(r.status)
        ).length,
        approved: requisitions.filter(r =>
          ['assigned', 'pending_verification', 'delivered', 'completed'].includes(r.status)
        ).length,
        rejected: requisitions.filter(r =>
          ['rejected_by_dept_head', 'rejected_by_it_head', 'cancelled'].includes(r.status)
        ).length
      };
      setStats(newStats);
    }
  }, [requisitions, pagination.total]);

  const loadRequisitions = async () => {
    try {
      setLoading(true);

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

      const response = await api.get('/requisitions/all-requisitions', { params });
      const data = response.data.data || response.data;

      setRequisitions(data.requisitions || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Failed to load requisitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBoards = async () => {
    try {
      const response = await api.get('/boards', {
        params: {
          limit: 1000,
          page: 1
        }
      });
      const data = response.data.data || response.data;
      setBoards(data.boards || data || []);
    } catch (error) {
      console.error('Failed to load boards:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      // Request all departments without pagination for the filter dropdown
      const response = await api.get('/departments', {
        params: {
          limit: 1000, // Large limit to get all departments
          page: 1,
          board_id: filters.board_id || undefined // Filter departments by selected board
        }
      });
      const data = response.data.data || response.data;
      setDepartments(data.departments || data || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      urgency: '',
      board_id: '',
      department_id: '',
      requester_id: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      page,
      limit: pageSize
    }));
  };

  const handleViewDetails = (requisition) => {
    navigate(`/requisitions/details/${requisition.requisition_id}`);
  };

  return (
    <div className="all-requisitions-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>All Asset Requisitions</h2>
          <p className="page-description">View and track all requisition requests across the organization</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Requisitions"
              value={stats.total}
              prefix={<FileTextOutlined />}
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
            placeholder="Search by requisition number, purpose, or requester"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ width: 350 }}
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
            <Option value="pending_verification">Pending Verification</Option>
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

          <Select
            placeholder="Filter by Board"
            value={filters.board_id || undefined}
            onChange={(value) => {
              handleFilterChange('board_id', value);
              // Reset department filter when board changes
              if (filters.department_id) {
                setFilters(prev => ({ ...prev, department_id: '' }));
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

      {/* Requisitions List */}
      <Card>
        <Spin spinning={loading}>
          {requisitions.length === 0 && !loading ? (
            <Empty
              description="No requisitions found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <>
              {requisitions.map((requisition) => (
                <RequisitionCard
                  key={requisition.requisition_id}
                  requisition={requisition}
                  onView={handleViewDetails}
                  showActions={false}
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
    </div>
  );
};

export default AllRequisitions;
