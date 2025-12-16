import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Tag,
  Typography,
  Space,
  message,
  Empty,
  Input,
  Drawer,
  Descriptions,
  Divider,
  Statistic,
  Tabs,
  Tooltip,
  Spin
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  FilePdfOutlined,
  SwapOutlined,
  UserSwitchOutlined,
  EnvironmentOutlined,
  UserOutlined,
  DesktopOutlined,
  ClearOutlined,
  ExportOutlined
} from '@ant-design/icons';
import assetJobReportService from '../services/assetJobReport';
import masterService from '../services/master';
import departmentService from '../services/department';
import userService from '../services/user';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AssetJobReports = () => {
  // Data states
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // Filter states
  const [activeTab, setActiveTab] = useState('all');
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [locationFilter, setLocationFilter] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [userFilter, setUserFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [oemFilter, setOemFilter] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Dropdown data
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [oems, setOems] = useState([]);

  // Selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Detail drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Export loading
  const [exportLoading, setExportLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [locationsRes, departmentsRes, usersRes, categoriesRes, oemsRes] = await Promise.all([
          masterService.getLocations().catch(() => ({ data: { data: { locations: [] } } })),
          departmentService.getDepartments().catch(() => ({ data: { data: { departments: [] } } })),
          userService.getUsers({ limit: 1000 }).catch(() => ({ data: { data: [] } })),
          masterService.getCategories().catch(() => ({ data: { data: [] } })),
          masterService.getOEMs().catch(() => ({ data: { data: [] } }))
        ]);

        const locData = locationsRes.data?.data?.locations || locationsRes.data?.data || [];
        setLocations(Array.isArray(locData) ? locData : []);

        const deptData = departmentsRes.data?.data?.departments || departmentsRes.data?.data || [];
        setDepartments(Array.isArray(deptData) ? deptData : []);

        const userData = usersRes.data?.data?.users || usersRes.data?.data || [];
        setUsers(Array.isArray(userData) ? userData : []);

        const catData = categoriesRes.data?.data?.categories || categoriesRes.data?.data || [];
        setCategories(Array.isArray(catData) ? catData : []);

        const oemData = oemsRes.data?.data?.oems || oemsRes.data?.data || [];
        setOems(Array.isArray(oemData) ? oemData : []);
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch reports
  const fetchReports = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        report_type: activeTab
      };

      if (dateRange && dateRange[0] && dateRange[1]) {
        params.date_from = dateRange[0].format('YYYY-MM-DD');
        params.date_to = dateRange[1].format('YYYY-MM-DD');
      }
      if (locationFilter) params.location_id = locationFilter;
      if (departmentFilter) params.department_id = departmentFilter;
      if (userFilter) params.user_id = userFilter;
      if (categoryFilter) params.category_id = categoryFilter;
      if (oemFilter) params.oem_id = oemFilter;
      if (searchText) params.search = searchText;

      const response = await assetJobReportService.getReports(params);
      const data = response.data?.data || response.data || {};

      setReports(data.reports || []);
      setStatistics(data.statistics || {});
      setPagination(prev => ({
        ...prev,
        page: data.pagination?.page || page,
        total: data.pagination?.total || 0
      }));
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      message.error('Failed to load asset job reports');
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateRange, locationFilter, departmentFilter, userFilter, categoryFilter, oemFilter, searchText, pagination.limit]);

  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, []);

  // Fetch when tab changes
  useEffect(() => {
    fetchReports(1);
  }, [activeTab]);

  // Apply filters
  const handleApplyFilter = () => {
    fetchReports(1);
  };

  // Clear filters
  const handleClearFilters = () => {
    setDateRange([dayjs().subtract(30, 'day'), dayjs()]);
    setLocationFilter(null);
    setDepartmentFilter(null);
    setUserFilter(null);
    setCategoryFilter(null);
    setOemFilter(null);
    setSearchText('');
    setTimeout(() => fetchReports(1), 0);
  };

  // View report details
  const handleViewDetails = async (record) => {
    setSelectedReport(record);
    setDrawerVisible(true);
    setLoadingDetail(true);

    try {
      const response = await assetJobReportService.getReportById(record.movement_id);
      const fullReport = response.data?.data || response.data;
      setSelectedReport({ ...record, ...fullReport });
    } catch (error) {
      console.error('Failed to fetch report details:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Download single PDF
  const handleDownloadPDF = async (record) => {
    try {
      message.loading({ content: 'Generating PDF...', key: 'pdf' });
      await assetJobReportService.downloadPDF(record.movement_id, record.asset_tag, record.job_type);
      message.success({ content: 'PDF downloaded successfully', key: 'pdf' });
    } catch (error) {
      message.error({ content: 'Failed to download PDF', key: 'pdf' });
    }
  };

  // Download bulk PDF
  const handleBulkPDF = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select at least one report');
      return;
    }

    setPdfLoading(true);
    try {
      message.loading({ content: 'Generating bulk PDF...', key: 'bulkpdf' });
      await assetJobReportService.downloadBulkPDF(selectedRowKeys);
      message.success({ content: 'Bulk PDF downloaded successfully', key: 'bulkpdf' });
    } catch (error) {
      message.error({ content: 'Failed to download bulk PDF', key: 'bulkpdf' });
    } finally {
      setPdfLoading(false);
    }
  };

  // Export to Excel
  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const params = { report_type: activeTab };
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.date_from = dateRange[0].format('YYYY-MM-DD');
        params.date_to = dateRange[1].format('YYYY-MM-DD');
      }
      if (locationFilter) params.location_id = locationFilter;
      if (departmentFilter) params.department_id = departmentFilter;
      if (userFilter) params.user_id = userFilter;
      if (categoryFilter) params.category_id = categoryFilter;
      if (oemFilter) params.oem_id = oemFilter;
      if (searchText) params.search = searchText;

      await assetJobReportService.exportToExcel(params);
      message.success('Excel file downloaded successfully');
    } catch (error) {
      message.error('Failed to export to Excel');
    } finally {
      setExportLoading(false);
    }
  };

  // Get job type tag
  const getJobTypeTag = (jobType) => {
    const config = {
      install: { color: 'green', icon: <DownloadOutlined />, text: 'Install' },
      move: { color: 'cyan', icon: <SwapOutlined />, text: 'Move' },
      transfer: { color: 'orange', icon: <UserSwitchOutlined />, text: 'Transfer' }
    };
    const c = config[jobType] || { color: 'default', text: jobType };
    return <Tag color={c.color} icon={c.icon}>{c.text}</Tag>;
  };

  // Table columns
  const columns = [
    {
      title: 'Date',
      dataIndex: 'movement_date',
      key: 'movement_date',
      width: 140,
      render: (date) => dayjs(date).format('DD MMM YYYY HH:mm'),
      sorter: (a, b) => new Date(a.movement_date) - new Date(b.movement_date)
    },
    {
      title: 'Job Type',
      dataIndex: 'job_type',
      key: 'job_type',
      width: 110,
      render: (type) => getJobTypeTag(type)
    },
    {
      title: 'Asset',
      key: 'asset',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Tag color="blue">{record.asset_tag}</Tag>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.product_name}</Text>
        </Space>
      )
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      width: 140,
      ellipsis: true
    },
    {
      title: 'Assigned To',
      key: 'assigned_to',
      width: 180,
      render: (_, record) => record.assigned_to_name ? (
        <Space direction="vertical" size={0}>
          <Text><UserOutlined /> {record.assigned_to_name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.assigned_to_department}</Text>
        </Space>
      ) : '-'
    },
    {
      title: 'Previous User',
      key: 'previous_user',
      width: 180,
      render: (_, record) => record.previous_user_name ? (
        <Space direction="vertical" size={0}>
          <Text type="secondary"><UserOutlined /> {record.previous_user_name}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{record.previous_user_department}</Text>
        </Space>
      ) : '-'
    },
    {
      title: 'Location',
      key: 'location',
      width: 150,
      render: (_, record) => record.location_name ? (
        <Tooltip title={`${record.location_building || ''} ${record.location_floor || ''}`}>
          <Text><EnvironmentOutlined /> {record.location_name}</Text>
        </Tooltip>
      ) : '-'
    },
    {
      title: 'Performed By',
      dataIndex: 'performed_by_name',
      key: 'performed_by_name',
      width: 140,
      ellipsis: true
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Download PDF">
            <Button
              type="text"
              size="small"
              icon={<FilePdfOutlined />}
              onClick={() => handleDownloadPDF(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Row selection
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  };

  // Tab items
  const tabItems = [
    { key: 'all', label: 'All Reports' },
    { key: 'install', label: 'Install Jobs' },
    { key: 'move', label: 'Move Jobs' },
    { key: 'transfer', label: 'Transfer Jobs' }
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <DesktopOutlined style={{ marginRight: 8 }} />
          IT Asset Job Reports
        </Title>
        <Text type="secondary">
          Track IT asset installations, movements, and transfers
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card hoverable>
            <Statistic
              title="Total Jobs"
              value={statistics.total_count || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable>
            <Statistic
              title="Installations"
              value={statistics.install_count || 0}
              valueStyle={{ color: '#52c41a' }}
              prefix={<DownloadOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable>
            <Statistic
              title="Movements"
              value={statistics.move_count || 0}
              valueStyle={{ color: '#13c2c2' }}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable>
            <Statistic
              title="Transfers"
              value={statistics.transfer_count || 0}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<UserSwitchOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card style={{ marginBottom: 16 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search asset tag, serial, user..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Select
              placeholder="Location"
              style={{ width: '100%' }}
              value={locationFilter}
              onChange={setLocationFilter}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {locations.map(loc => (
                <Option key={loc.id} value={loc.id}>{loc.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Select
              placeholder="Department"
              style={{ width: '100%' }}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {departments.map(dept => (
                <Option key={dept.id || dept.department_id} value={dept.id || dept.department_id}>
                  {dept.name || dept.department_name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Select
              placeholder="Category"
              style={{ width: '100%' }}
              value={categoryFilter}
              onChange={setCategoryFilter}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={3}>
            <Select
              placeholder="OEM"
              style={{ width: '100%' }}
              value={oemFilter}
              onChange={setOemFilter}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {oems.map(oem => (
                <Option key={oem.id} value={oem.id}>{oem.name}</Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<FilterOutlined />}
                onClick={handleApplyFilter}
              >
                Apply
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
              >
                Clear
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchReports(pagination.page)}
              >
                Refresh
              </Button>
            </Space>
          </Col>
          <Col flex="auto" />
          <Col>
            <Space>
              {selectedRowKeys.length > 0 && (
                <Button
                  icon={<FilePdfOutlined />}
                  onClick={handleBulkPDF}
                  loading={pdfLoading}
                >
                  Download Selected ({selectedRowKeys.length}) PDF
                </Button>
              )}
              <Button
                type="primary"
                icon={<ExportOutlined />}
                onClick={handleExportExcel}
                loading={exportLoading}
              >
                Export to Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Reports Table */}
      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={reports}
          rowKey="movement_id"
          loading={loading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, page, limit: pageSize }));
              fetchReports(page);
            }
          }}
          scroll={{ x: 1400 }}
          locale={{
            emptyText: (
              <Empty
                description="No job reports found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={
          <Space>
            <FileTextOutlined />
            Job Report Details
            {selectedReport && getJobTypeTag(selectedReport.job_type)}
          </Space>
        }
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            onClick={() => selectedReport && handleDownloadPDF(selectedReport)}
          >
            Download PDF
          </Button>
        }
      >
        {loadingDetail ? (
          <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : selectedReport ? (
          <>
            <Descriptions title="Report Information" bordered column={1} size="small">
              <Descriptions.Item label="Report Number">
                JOB-{String(selectedReport.movement_id).padStart(6, '0')}
              </Descriptions.Item>
              <Descriptions.Item label="Date & Time">
                {dayjs(selectedReport.movement_date).format('DD MMM YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Job Type">
                {getJobTypeTag(selectedReport.job_type)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag>{selectedReport.status?.toUpperCase()}</Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Asset Details" bordered column={1} size="small">
              <Descriptions.Item label="Asset Tag">
                <Tag color="blue">{selectedReport.asset_tag}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Serial Number">
                {selectedReport.serial_number || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Product">
                {selectedReport.product_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Model">
                {selectedReport.product_model || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="OEM">
                {selectedReport.oem_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {selectedReport.category_name || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Assignment Details" bordered column={1} size="small">
              <Descriptions.Item label="Assigned To">
                <Space direction="vertical" size={0}>
                  <Text strong>{selectedReport.assigned_to_name || '-'}</Text>
                  {selectedReport.assigned_to_emp_code && (
                    <Text type="secondary">Emp: {selectedReport.assigned_to_emp_code}</Text>
                  )}
                  {selectedReport.assigned_to_email && (
                    <Text type="secondary">{selectedReport.assigned_to_email}</Text>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {selectedReport.assigned_to_department || '-'}
              </Descriptions.Item>
              {selectedReport.previous_user_name && (
                <>
                  <Descriptions.Item label="Previous User">
                    <Space direction="vertical" size={0}>
                      <Text>{selectedReport.previous_user_name}</Text>
                      {selectedReport.previous_user_emp_code && (
                        <Text type="secondary">Emp: {selectedReport.previous_user_emp_code}</Text>
                      )}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Previous Department">
                    {selectedReport.previous_user_department || '-'}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>

            <Divider />

            <Descriptions title="Location Details" bordered column={1} size="small">
              <Descriptions.Item label="Location">
                {selectedReport.location_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Building">
                {selectedReport.location_building || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Floor">
                {selectedReport.location_floor || '-'}
              </Descriptions.Item>
              {selectedReport.previous_location_name && (
                <Descriptions.Item label="Previous Location">
                  {selectedReport.previous_location_name}
                  {selectedReport.previous_location_building && ` - ${selectedReport.previous_location_building}`}
                </Descriptions.Item>
              )}
            </Descriptions>

            {(selectedReport.reason || selectedReport.notes) && (
              <>
                <Divider />
                <Descriptions title="Remarks" bordered column={1} size="small">
                  {selectedReport.reason && (
                    <Descriptions.Item label="Reason">
                      {selectedReport.reason}
                    </Descriptions.Item>
                  )}
                  {selectedReport.notes && (
                    <Descriptions.Item label="Notes">
                      {selectedReport.notes}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}

            <Divider />

            <Descriptions title="Performed By" bordered column={1} size="small">
              <Descriptions.Item label="Name">
                {selectedReport.performed_by_name || '-'}
              </Descriptions.Item>
              {selectedReport.performed_by_email && (
                <Descriptions.Item label="Email">
                  {selectedReport.performed_by_email}
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        ) : null}
      </Drawer>
    </div>
  );
};

export default AssetJobReports;
