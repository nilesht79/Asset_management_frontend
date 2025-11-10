import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Select,
  Input,
  Row,
  Col,
  Typography,
  Statistic,
  Modal,
  message,
  Tooltip
} from 'antd';
import {
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import reconciliationService from '../../../services/reconciliation';
import ResolveDiscrepancyModal from './ResolveDiscrepancyModal';
import DiscrepancyDetailsModal from './DiscrepancyDetailsModal';

const { Option } = Select;
const { Text, Title } = Typography;
const { Search } = Input;

const DiscrepancyList = () => {
  const { id: reconciliationId } = useParams();

  // State
  const [discrepancies, setDiscrepancies] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  // Filters
  const [filters, setFilters] = useState({
    field_name: null,
    discrepancy_type: null,
    severity: null,
    is_resolved: null,
    search: ''
  });

  // Modals
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState(null);

  // Load data on mount and filter changes
  useEffect(() => {
    loadDiscrepancies();
    loadStatistics();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadDiscrepancies = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };

      // Remove null/empty values
      Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === '') {
          delete params[key];
        }
      });

      const response = await axios.get(
        `/api/v1/reconciliations/${reconciliationId}/discrepancies`,
        { params }
      );

      setDiscrepancies(response.data.data.discrepancies);
      setPagination({
        ...pagination,
        total: response.data.data.pagination.totalItems
      });
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to load discrepancies');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await axios.get(
        `/api/v1/reconciliations/${reconciliationId}/discrepancies/statistics`
      );
      setStatistics(response.data.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, current: 1 }); // Reset to first page
  };

  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      message.loading({ content: 'Generating report...', key: 'download', duration: 0 });

      const response = await reconciliationService.exportDiscrepancies(reconciliationId, 'csv');

      // Create blob from response
      const blob = new Blob([response.data], { type: 'text/csv' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from content-disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'discrepancies_report.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success({ content: 'Report downloaded successfully', key: 'download', duration: 2 });
    } catch (error) {
      console.error('Download error:', error);
      message.error({ content: error.response?.data?.message || 'Failed to download report', key: 'download', duration: 3 });
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      field_name: null,
      discrepancy_type: null,
      severity: null,
      is_resolved: null,
      search: ''
    });
  };

  const handleViewDetails = (discrepancy) => {
    setSelectedDiscrepancy(discrepancy);
    setDetailsModalVisible(true);
  };

  const handleResolve = (discrepancy) => {
    setSelectedDiscrepancy(discrepancy);
    setResolveModalVisible(true);
  };

  const handleResolveSuccess = () => {
    setResolveModalVisible(false);
    setSelectedDiscrepancy(null);
    loadDiscrepancies();
    loadStatistics();
    message.success('Discrepancy resolved successfully');
  };

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: { color: 'red', icon: <ExclamationCircleOutlined />, label: 'Critical' },
      major: { color: 'orange', icon: <WarningOutlined />, label: 'Major' },
      minor: { color: 'blue', icon: <InfoCircleOutlined />, label: 'Minor' }
    };
    return configs[severity] || configs.minor;
  };

  const getDiscrepancyTypeLabel = (type) => {
    const labels = {
      location_mismatch: 'Location Mismatch',
      condition_changed: 'Condition Changed',
      assignment_mismatch: 'Assignment Mismatch',
      serial_number_mismatch: 'Serial Number Mismatch',
      status_mismatch: 'Status Mismatch',
      asset_missing: 'Asset Missing',
      asset_damaged: 'Asset Damaged',
      extra_asset: 'Extra Asset',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const columns = [
    {
      title: 'Asset Tag',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      width: 120,
      fixed: 'left',
      render: (text) => <Text code strong>{text}</Text>
    },
    {
      title: 'Field',
      dataIndex: 'field_display_name',
      key: 'field_display_name',
      width: 120
    },
    {
      title: 'Type',
      dataIndex: 'discrepancy_type',
      key: 'discrepancy_type',
      width: 150,
      render: (type) => getDiscrepancyTypeLabel(type)
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => {
        const config = getSeverityConfig(severity);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      }
    },
    {
      title: 'System Value',
      dataIndex: 'system_value',
      key: 'system_value',
      width: 150,
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 150, display: 'block' }}>
            {text || 'N/A'}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Physical Value',
      dataIndex: 'physical_value',
      key: 'physical_value',
      width: 150,
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 150, display: 'block', color: '#fa8c16' }}>
            {text || 'N/A'}
          </Text>
        </Tooltip>
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_resolved',
      key: 'is_resolved',
      width: 100,
      render: (isResolved) => (
        isResolved ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Resolved</Tag>
        ) : (
          <Tag color="warning" icon={<WarningOutlined />}>Pending</Tag>
        )
      )
    },
    {
      title: 'Detected By',
      dataIndex: 'detected_by_name',
      key: 'detected_by_name',
      width: 130,
      render: (text) => text || 'N/A'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            >
              Details
            </Button>
          </Tooltip>
          {!record.is_resolved && (
            <Tooltip title="Resolve Discrepancy">
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleResolve(record)}
              >
                Resolve
              </Button>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Discrepancies"
                value={statistics.summary.total}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Resolved"
                value={statistics.summary.resolved}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending"
                value={statistics.summary.pending}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Resolution Rate"
                value={statistics.summary.resolution_rate}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: statistics.summary.resolution_rate >= 50 ? '#3f8600' : '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {/* First Row - Filter Inputs */}
          <Col xs={24} sm={12} md={6} lg={6}>
            <Search
              placeholder="Search by asset tag or notes..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} sm={6} md={4} lg={4}>
            <Select
              placeholder="Severity"
              value={filters.severity}
              onChange={(value) => handleFilterChange('severity', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="critical">Critical</Option>
              <Option value="major">Major</Option>
              <Option value="minor">Minor</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={6} lg={6}>
            <Select
              placeholder="Type"
              value={filters.discrepancy_type}
              onChange={(value) => handleFilterChange('discrepancy_type', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="location_mismatch">Location Mismatch</Option>
              <Option value="condition_changed">Condition Changed</Option>
              <Option value="assignment_mismatch">Assignment Mismatch</Option>
              <Option value="serial_number_mismatch">Serial Number Mismatch</Option>
              <Option value="status_mismatch">Status Mismatch</Option>
              <Option value="asset_missing">Asset Missing</Option>
              <Option value="asset_damaged">Asset Damaged</Option>
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4} lg={4}>
            <Select
              placeholder="Status"
              value={filters.is_resolved}
              onChange={(value) => handleFilterChange('is_resolved', value)}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="false">Pending</Option>
              <Option value="true">Resolved</Option>
            </Select>
          </Col>

          {/* Second Row - Action Buttons */}
          <Col xs={24} sm={24} md={24} lg={24}>
            <Space wrap>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadReport}
                disabled={!discrepancies || discrepancies.length === 0}
              >
                Download CSV
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadDiscrepancies}>
                Refresh
              </Button>
              <Button icon={<FilterOutlined />} onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Discrepancies Table */}
      <Card title={<Title level={4}>Discrepancies</Title>}>
        <Table
          columns={columns}
          dataSource={discrepancies}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} discrepancies`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          size="middle"
        />
      </Card>

      {/* Modals */}
      <ResolveDiscrepancyModal
        visible={resolveModalVisible}
        discrepancy={selectedDiscrepancy}
        reconciliationId={reconciliationId}
        onClose={() => setResolveModalVisible(false)}
        onSuccess={handleResolveSuccess}
      />

      <DiscrepancyDetailsModal
        visible={detailsModalVisible}
        discrepancy={selectedDiscrepancy}
        reconciliationId={reconciliationId}
        onClose={() => setDetailsModalVisible(false)}
      />
    </div>
  );
};

export default DiscrepancyList;
