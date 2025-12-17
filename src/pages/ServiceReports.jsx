import React, { useState, useEffect, useCallback } from 'react';
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
  Dropdown,
  Tooltip
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  FilePdfOutlined,
  ToolOutlined,
  SwapOutlined,
  ClearOutlined
} from '@ant-design/icons';
import serviceReportService from '../services/serviceReport';
import userService from '../services/user';
import masterService from '../services/master';
import departmentService from '../services/department';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ServiceReports = () => {
  // Data states
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  // Filter states
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [serviceTypeFilter, setServiceTypeFilter] = useState(null);
  const [engineerFilter, setEngineerFilter] = useState(null);
  const [locationFilter, setLocationFilter] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState(null);
  const [searchText, setSearchText] = useState('');

  // Dropdown data
  const [engineers, setEngineers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Detail drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // PDF export loading
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [engineersRes, locationsRes, departmentsRes] = await Promise.all([
          userService.getEngineers().catch(() => ({ data: { data: [] } })),
          masterService.getLocations().catch(() => ({ data: { data: { locations: [] } } })),
          departmentService.getDepartments().catch(() => ({ data: { data: { departments: [] } } }))
        ]);

        // Parse engineers - API returns { data: { users: [...] } }
        const engData = engineersRes.data?.data?.users || engineersRes.data?.users || [];
        setEngineers(Array.isArray(engData) ? engData : []);

        // Parse locations - API returns { data: { locations: [...] } }
        const locData = locationsRes.data?.data?.locations || locationsRes.data?.locations || [];
        setLocations(Array.isArray(locData) ? locData : []);

        // Parse departments - API returns { data: { departments: [...] } }
        const deptData = departmentsRes.data?.data?.departments || departmentsRes.data?.departments || [];
        setDepartments(Array.isArray(deptData) ? deptData : []);
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
      const params = { page, limit: pagination.limit };

      if (dateRange && dateRange[0] && dateRange[1]) {
        params.date_from = dateRange[0].format('YYYY-MM-DD');
        params.date_to = dateRange[1].format('YYYY-MM-DD');
      }
      if (serviceTypeFilter) params.service_type = serviceTypeFilter;
      if (engineerFilter) params.engineer_id = engineerFilter;
      if (locationFilter) params.location_id = locationFilter;
      if (departmentFilter) params.department_id = departmentFilter;
      if (searchText) params.search = searchText;

      const response = await serviceReportService.getDetailedReports(params);
      const data = response.data?.data || response.data || {};

      setReports(data.reports || []);
      setPagination(prev => ({
        ...prev,
        page: data.pagination?.page || page,
        total: data.pagination?.total || 0
      }));
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      message.error('Failed to load service reports');
    } finally {
      setLoading(false);
    }
  }, [dateRange, serviceTypeFilter, engineerFilter, locationFilter, departmentFilter, searchText, pagination.limit]);

  // Initial fetch
  useEffect(() => {
    fetchReports();
  }, []);

  // Apply filters
  const handleApplyFilter = () => {
    fetchReports(1);
  };

  // Clear filters
  const handleClearFilters = () => {
    setDateRange([dayjs().subtract(30, 'day'), dayjs()]);
    setServiceTypeFilter(null);
    setEngineerFilter(null);
    setLocationFilter(null);
    setDepartmentFilter(null);
    setSearchText('');
    setTimeout(() => fetchReports(1), 0);
  };

  // View report details
  const handleViewDetails = async (record) => {
    setSelectedReport(record);
    setDrawerVisible(true);
    setLoadingDetail(true);

    try {
      const response = await serviceReportService.getReportById(record.report_id);
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
      await serviceReportService.downloadPDF(record.report_id, record.report_number);
      message.success({ content: 'PDF downloaded successfully', key: 'pdf' });
    } catch (error) {
      message.error({ content: 'Failed to download PDF', key: 'pdf' });
    }
  };

  // Download bulk PDF
  const handleBulkExport = async (type) => {
    setExportLoading(true);
    try {
      let reportIds = [];

      if (type === 'selected') {
        if (selectedRowKeys.length === 0) {
          message.warning('Please select at least one report');
          setExportLoading(false);
          return;
        }
        reportIds = selectedRowKeys;
      } else if (type === 'all') {
        reportIds = reports.map(r => r.report_id);
      }

      if (reportIds.length === 0) {
        message.warning('No reports to export');
        setExportLoading(false);
        return;
      }

      message.loading({ content: `Generating PDF for ${reportIds.length} reports...`, key: 'bulkPdf' });
      await serviceReportService.downloadBulkPDF(reportIds);
      message.success({ content: 'Bulk PDF downloaded successfully', key: 'bulkPdf' });
    } catch (error) {
      message.error({ content: 'Failed to download bulk PDF', key: 'bulkPdf' });
    } finally {
      setExportLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Report #',
      dataIndex: 'report_number',
      key: 'report_number',
      width: 130,
      fixed: 'left',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      render: (date) => dayjs(date).format('DD-MM-YYYY')
    },
    {
      title: 'Type',
      dataIndex: 'service_type',
      key: 'service_type',
      width: 100,
      render: (type) => (
        <Tag
          color={serviceReportService.getServiceTypeColor(type)}
          icon={type === 'repair' ? <ToolOutlined /> : <SwapOutlined />}
        >
          {type === 'repair' ? 'Repair' : 'Replace'}
        </Tag>
      )
    },
    {
      title: 'Ticket',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      width: 120,
      render: (text, record) => (
        <Tooltip title={record.ticket_title}>
          <Text>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Asset',
      key: 'asset',
      width: 180,
      render: (_, record) => (
        <div>
          <div>{record.asset_product_name || '-'}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.asset_tag || ''}
          </Text>
        </div>
      )
    },
    {
      title: 'Engineer',
      dataIndex: 'engineer_name',
      key: 'engineer_name',
      width: 150,
      render: (text) => text || '-'
    },
    {
      title: 'Location',
      dataIndex: 'location_name',
      key: 'location_name',
      width: 150,
      render: (text, record) => (
        <div>
          <div>{text || '-'}</div>
          {record.location_building && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.location_building}
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department_name',
      width: 130,
      render: (text) => text || '-'
    },
    {
      title: 'Parts',
      dataIndex: 'parts_count',
      key: 'parts_count',
      width: 70,
      align: 'center',
      render: (count) => count > 0 ? <Tag color="blue">{count}</Tag> : '-'
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
      width: 110,
      align: 'right',
      render: (value) => `₹${parseFloat(value || 0).toFixed(2)}`
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
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Download PDF">
            <Button
              type="text"
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
    onChange: (keys) => setSelectedRowKeys(keys),
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE
    ]
  };

  // Export menu items
  const exportMenuItems = [
    {
      key: 'selected',
      label: `Export Selected (${selectedRowKeys.length})`,
      icon: <FilePdfOutlined />,
      disabled: selectedRowKeys.length === 0,
      onClick: () => handleBulkExport('selected')
    },
    {
      key: 'all',
      label: `Export All on Page (${reports.length})`,
      icon: <FilePdfOutlined />,
      disabled: reports.length === 0,
      onClick: () => handleBulkExport('all')
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>
          <FileTextOutlined style={{ marginRight: 8 }} />
          Service Reports
        </Title>
        <Text type="secondary">
          View and export service reports for repair and replacement activities
        </Text>
      </div>

      {/* Filters */}
      <Card size="small" className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Date Range</Text>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD-MM-YYYY"
                style={{ width: '100%' }}
                allowClear
              />
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8} lg={4}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Service Type</Text>
              <Select
                value={serviceTypeFilter}
                onChange={setServiceTypeFilter}
                placeholder="All Types"
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="repair">Repair</Option>
                <Option value="replace">Replacement</Option>
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8} lg={4}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Engineer</Text>
              <Select
                value={engineerFilter}
                onChange={setEngineerFilter}
                placeholder="All Engineers"
                style={{ width: '100%' }}
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {engineers.map(eng => (
                  <Option key={eng.user_id || eng.id} value={eng.user_id || eng.id}>
                    {eng.firstName || eng.first_name} {eng.lastName || eng.last_name}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8} lg={4}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Location</Text>
              <Select
                value={locationFilter}
                onChange={setLocationFilter}
                placeholder="All Locations"
                style={{ width: '100%' }}
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {locations.map(loc => {
                  const locationLabel = `${loc.name}${loc.building ? ` - ${loc.building}` : ''}${loc.floor ? ` (Floor ${loc.floor})` : ''}`;
                  const tooltipContent = (
                    <div>
                      <div><strong>{loc.name}</strong></div>
                      {loc.building && <div>Building: {loc.building}</div>}
                      {loc.floor && <div>Floor: {loc.floor}</div>}
                      {loc.address && <div>Address: {loc.address}</div>}
                      {(loc.city_name || loc.state_name) && (
                        <div>{[loc.city_name, loc.state_name].filter(Boolean).join(', ')}</div>
                      )}
                    </div>
                  );
                  return (
                    <Option key={loc.id} value={loc.id}>
                      <Tooltip title={tooltipContent} placement="right" mouseEnterDelay={0.5}>
                        <span style={{ display: 'block' }}>{locationLabel}</span>
                      </Tooltip>
                    </Option>
                  );
                })}
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={8} lg={4}>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>Department</Text>
              <Select
                value={departmentFilter}
                onChange={setDepartmentFilter}
                placeholder="All Departments"
                style={{ width: '100%' }}
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {departments.map(dept => (
                  <Option key={dept.department_id || dept.id} value={dept.department_id || dept.id}>
                    {dept.department_name || dept.name}
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24}>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Input
                  placeholder="Search by report #, ticket #, asset tag, engineer..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined />}
                  onPressEnter={handleApplyFilter}
                  allowClear
                />
              </Col>
              <Col>
                <Space>
                  <Button
                    icon={<ClearOutlined />}
                    onClick={handleClearFilters}
                  >
                    Clear
                  </Button>
                  <Button
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={handleApplyFilter}
                  >
                    Apply Filters
                  </Button>
                  <Dropdown
                    menu={{ items: exportMenuItems }}
                    trigger={['click']}
                  >
                    <Button
                      icon={<DownloadOutlined />}
                      loading={exportLoading}
                    >
                      Export PDF
                    </Button>
                  </Dropdown>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            Service Reports
            {selectedRowKeys.length > 0 && (
              <Tag color="blue">{selectedRowKeys.length} selected</Tag>
            )}
          </Space>
        }
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchReports(pagination.page)}
            loading={loading}
          >
            Refresh
          </Button>
        }
      >
        <Table
          loading={loading}
          dataSource={reports}
          columns={columns}
          rowKey="report_id"
          rowSelection={rowSelection}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} reports`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, page, limit: pageSize }));
              fetchReports(page);
            }
          }}
          scroll={{ x: 1400 }}
          locale={{
            emptyText: (
              <Empty
                description="No service reports found"
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
            Service Report Details
            {selectedReport && (
              <Tag color={serviceReportService.getServiceTypeColor(selectedReport.service_type)}>
                {selectedReport.service_type === 'repair' ? 'Repair' : 'Replacement'}
              </Tag>
            )}
          </Space>
        }
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          selectedReport && (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadPDF(selectedReport)}
            >
              Download PDF
            </Button>
          )
        }
      >
        {selectedReport && (
          <div>
            <Descriptions title="Report Information" column={2} bordered size="small">
              <Descriptions.Item label="Report #" span={1}>
                <Text strong>{selectedReport.report_number}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Date" span={1}>
                {dayjs(selectedReport.created_at).format('DD-MM-YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Ticket #" span={1}>
                {selectedReport.ticket_number}
              </Descriptions.Item>
              <Descriptions.Item label="Ticket Title" span={1}>
                {selectedReport.ticket_title}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="Asset Information" column={2} bordered size="small">
              <Descriptions.Item label="Asset Tag" span={1}>
                {selectedReport.asset_tag || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Serial Number" span={1}>
                {selectedReport.asset_serial || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Product" span={2}>
                {selectedReport.asset_product_name || '-'}
              </Descriptions.Item>
              {selectedReport.service_type === 'replace' && selectedReport.replacement_asset_tag && (
                <>
                  <Descriptions.Item label="Replacement Asset" span={1}>
                    {selectedReport.replacement_asset_tag}
                  </Descriptions.Item>
                  <Descriptions.Item label="Replacement Product" span={1}>
                    {selectedReport.replacement_product_name || '-'}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>

            <Divider />

            <Descriptions title="Service Details" column={1} bordered size="small">
              <Descriptions.Item label="Diagnosis">
                {selectedReport.diagnosis || 'No diagnosis recorded'}
              </Descriptions.Item>
              <Descriptions.Item label="Work Performed">
                {selectedReport.work_performed || 'No work details recorded'}
              </Descriptions.Item>
              {/* Condition fields only shown for repair service */}
              {selectedReport.service_type === 'repair' && (
                <>
                  <Descriptions.Item label="Condition Before">
                    <Tag color={serviceReportService.getConditionColor(selectedReport.condition_before)}>
                      {serviceReportService.getConditionDisplayName(selectedReport.condition_before)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Condition After">
                    <Tag color={serviceReportService.getConditionColor(selectedReport.condition_after)}>
                      {serviceReportService.getConditionDisplayName(selectedReport.condition_after)}
                    </Tag>
                  </Descriptions.Item>
                </>
              )}
              {selectedReport.engineer_notes && (
                <Descriptions.Item label="Engineer Notes">
                  {selectedReport.engineer_notes}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedReport.parts_used && selectedReport.parts_used.length > 0 && (
              <>
                <Divider />
                <Title level={5}>Spare Parts Used</Title>
                <Table
                  size="small"
                  dataSource={selectedReport.parts_used}
                  rowKey="asset_tag"
                  pagination={false}
                  columns={[
                    { title: 'Part', dataIndex: 'product_name', key: 'product_name' },
                    { title: 'Asset Tag', dataIndex: 'asset_tag', key: 'asset_tag' },
                    { title: 'Qty', dataIndex: 'quantity', key: 'quantity', align: 'center' },
                    {
                      title: 'Cost',
                      key: 'cost',
                      align: 'right',
                      render: (_, record) => `₹${parseFloat((record.quantity || 1) * (record.unit_cost || 0)).toFixed(2)}`
                    }
                  ]}
                />
              </>
            )}

            <Divider />

            <Descriptions title="Cost Summary" column={2} bordered size="small">
              <Descriptions.Item label="Parts Cost">
                ₹{parseFloat(selectedReport.total_parts_cost || 0).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Labor Cost">
                ₹{parseFloat(selectedReport.labor_cost || 0).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Total Cost" span={2}>
                <Text strong style={{ fontSize: 16 }}>
                  ₹{(parseFloat(selectedReport.total_parts_cost || 0) + parseFloat(selectedReport.labor_cost || 0)).toFixed(2)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="User & Location" column={2} bordered size="small">
              <Descriptions.Item label="Raised By" span={1}>
                {selectedReport.raised_by_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Email" span={1}>
                {selectedReport.raised_by_email || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Engineer" span={1}>
                {selectedReport.engineer_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Department" span={1}>
                {selectedReport.department_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Location" span={2}>
                {selectedReport.location_name || '-'}
                {selectedReport.location_building && ` (${selectedReport.location_building})`}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ServiceReports;
