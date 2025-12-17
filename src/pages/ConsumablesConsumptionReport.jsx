/**
 * CONSUMABLES CONSUMPTION REPORT PAGE
 * Shows consumption report for delivered consumable requests
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Table,
  Statistic,
  Spin,
  message,
  Tabs,
  Tag,
  Space,
  Empty,
  Divider,
  Tooltip
} from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  EnvironmentOutlined,
  FolderOutlined,
  DollarOutlined,
  NumberOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import consumableService from '../services/consumable';
import masterService from '../services/master';
import userService from '../services/user';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

const ConsumablesConsumptionReport = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [consumables, setConsumables] = useState([]);
  const [engineers, setEngineers] = useState([]);

  // Filters
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(90, 'day'),
    dayjs()
  ]);
  const [categoryId, setCategoryId] = useState(null);
  const [locationId, setLocationId] = useState(null);
  const [consumableId, setConsumableId] = useState(null);
  const [engineerId, setEngineerId] = useState(null);

  // Load initial data
  useEffect(() => {
    loadFilterOptions();
    fetchReport();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [categoriesRes, locationsRes, consumablesRes, engineersRes] = await Promise.all([
        consumableService.getCategories(),
        masterService.getLocations({ limit: 1000 }),
        consumableService.getConsumables({ limit: 500 }),
        userService.getUsers({ role: 'engineer', limit: 1000 })
      ]);

      setCategories(categoriesRes?.data?.data?.categories || categoriesRes?.data?.categories || []);
      setLocations(locationsRes?.data?.data?.locations || locationsRes?.data?.data || []);
      setConsumables(consumablesRes?.data?.data?.consumables || consumablesRes?.data?.consumables || []);
      setEngineers(engineersRes?.data?.data?.users || engineersRes?.data?.users || []);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange && dateRange[0]) {
        params.date_from = dateRange[0].format('YYYY-MM-DD');
      }
      if (dateRange && dateRange[1]) {
        params.date_to = dateRange[1].format('YYYY-MM-DD');
      }
      if (categoryId) params.category_id = categoryId;
      if (locationId) params.location_id = locationId;
      if (consumableId) params.consumable_id = consumableId;
      if (engineerId) params.engineer_id = engineerId;

      const response = await consumableService.getConsumptionReport(params);
      setReportData(response?.data?.data || response?.data || null);
    } catch (error) {
      console.error('Error fetching report:', error);
      message.error('Failed to fetch consumption report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (dateRange && dateRange[0]) {
        params.date_from = dateRange[0].format('YYYY-MM-DD');
      }
      if (dateRange && dateRange[1]) {
        params.date_to = dateRange[1].format('YYYY-MM-DD');
      }
      if (categoryId) params.category_id = categoryId;
      if (locationId) params.location_id = locationId;
      if (consumableId) params.consumable_id = consumableId;
      if (engineerId) params.engineer_id = engineerId;

      await consumableService.exportConsumptionReport(params);
      message.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      message.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleReset = () => {
    setDateRange([dayjs().subtract(90, 'day'), dayjs()]);
    setCategoryId(null);
    setLocationId(null);
    setConsumableId(null);
    setEngineerId(null);
    setTimeout(() => fetchReport(), 0);
  };

  // Quick date presets
  const setQuickDateRange = (range) => {
    setDateRange(range);
    setTimeout(() => fetchReport(), 0);
  };

  // Summary table columns
  const summaryColumns = [
    {
      title: 'Consumable',
      dataIndex: 'consumable_name',
      key: 'consumable_name',
      width: 200
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 100
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 150
    },
    {
      title: 'Requests',
      dataIndex: 'request_count',
      key: 'request_count',
      width: 100,
      align: 'right'
    },
    {
      title: 'Qty Delivered',
      dataIndex: 'total_delivered',
      key: 'total_delivered',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.total_delivered - b.total_delivered,
      defaultSortOrder: 'descend',
      render: (val, record) => `${val} ${record.unit_of_measure || ''}`
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
      width: 100,
      align: 'right',
      render: (val) => val ? `₹${parseFloat(val).toFixed(2)}` : '-'
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
      width: 120,
      align: 'right',
      render: (val) => `₹${parseFloat(val || 0).toFixed(2)}`
    }
  ];

  // Detailed table columns
  const detailColumns = [
    {
      title: 'Request #',
      dataIndex: 'request_number',
      key: 'request_number',
      width: 130
    },
    {
      title: 'Delivered Date',
      dataIndex: 'delivered_at',
      key: 'delivered_at',
      width: 120,
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
    },
    {
      title: 'Consumable',
      dataIndex: 'consumable_name',
      key: 'consumable_name',
      width: 180
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 130
    },
    {
      title: 'Qty',
      dataIndex: 'quantity_delivered',
      key: 'quantity_delivered',
      width: 80,
      align: 'right'
    },
    {
      title: 'Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
      width: 100,
      align: 'right',
      render: (val) => `₹${parseFloat(val || 0).toFixed(2)}`
    },
    {
      title: 'Requested By',
      dataIndex: 'requested_by_name',
      key: 'requested_by_name',
      width: 150
    },
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department_name',
      width: 130
    },
    {
      title: 'Location',
      dataIndex: 'location_name',
      key: 'location_name',
      width: 130
    },
    {
      title: 'Asset',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      width: 120,
      render: (tag, record) => tag ? (
        <div>
          <div>{tag}</div>
          <small style={{ color: '#888' }}>{record.asset_product_name}</small>
        </div>
      ) : '-'
    }
  ];

  // Category breakdown columns
  const categoryColumns = [
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 200
    },
    {
      title: 'Requests',
      dataIndex: 'request_count',
      key: 'request_count',
      width: 100,
      align: 'right'
    },
    {
      title: 'Qty Delivered',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.total_quantity - b.total_quantity,
      defaultSortOrder: 'descend'
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
      width: 120,
      align: 'right',
      render: (val) => `₹${parseFloat(val || 0).toFixed(2)}`
    }
  ];

  // Location breakdown columns
  const locationColumns = [
    {
      title: 'Location',
      dataIndex: 'location_name',
      key: 'location_name',
      width: 200
    },
    {
      title: 'Requests',
      dataIndex: 'request_count',
      key: 'request_count',
      width: 100,
      align: 'right'
    },
    {
      title: 'Qty Delivered',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.total_quantity - b.total_quantity,
      defaultSortOrder: 'descend'
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
      width: 120,
      align: 'right',
      render: (val) => `₹${parseFloat(val || 0).toFixed(2)}`
    }
  ];

  // Engineer breakdown columns
  const engineerColumns = [
    {
      title: 'Engineer',
      dataIndex: 'engineer_name',
      key: 'engineer_name',
      width: 200
    },
    {
      title: 'Requests',
      dataIndex: 'request_count',
      key: 'request_count',
      width: 100,
      align: 'right'
    },
    {
      title: 'Qty Delivered',
      dataIndex: 'total_quantity',
      key: 'total_quantity',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.total_quantity - b.total_quantity,
      defaultSortOrder: 'descend'
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
      width: 120,
      align: 'right',
      render: (val) => `₹${parseFloat(val || 0).toFixed(2)}`
    }
  ];

  const totals = reportData?.totals || {};
  const summary = reportData?.summary || [];
  const details = reportData?.details || [];
  const byCategory = reportData?.by_category || [];
  const byLocation = reportData?.by_location || [];
  const byEngineer = reportData?.by_engineer || [];

  const tabItems = [
    {
      key: 'summary',
      label: (
        <span>
          <ShoppingOutlined /> Summary
        </span>
      ),
      children: (
        <div>
          {/* Summary Chart */}
          {summary.length > 0 && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="consumable_name" type="category" width={150} tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(value) => [value, 'Qty Delivered']} contentStyle={{ color: '#000' }} />
                  <Legend />
                  <Bar dataKey="total_delivered" name="Quantity Delivered" fill="#1890ff" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Summary Table */}
          <Table
            columns={summaryColumns}
            dataSource={summary}
            rowKey="consumable_id"
            size="small"
            pagination={{ pageSize: 20 }}
            scroll={{ x: 900 }}
          />
        </div>
      )
    },
    {
      key: 'details',
      label: (
        <span>
          <NumberOutlined /> Details
        </span>
      ),
      children: (
        <Table
          columns={detailColumns}
          dataSource={details}
          rowKey="request_id"
          size="small"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1400 }}
        />
      )
    },
    {
      key: 'category',
      label: (
        <span>
          <FolderOutlined /> By Category
        </span>
      ),
      children: (
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            {byCategory.length > 0 && (
              <Card size="small" title="Category Distribution" style={{ marginBottom: 16 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="total_quantity"
                      nameKey="category_name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ category_name, total_quantity }) => `${category_name}: ${total_quantity}`}
                    >
                      {byCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ color: '#000' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </Col>
          <Col xs={24} lg={12}>
            <Card size="small" title="Category Breakdown">
              <Table
                columns={categoryColumns}
                dataSource={byCategory}
                rowKey="category_name"
                size="small"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'location',
      label: (
        <span>
          <EnvironmentOutlined /> By Location
        </span>
      ),
      children: (
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            {byLocation.length > 0 && (
              <Card size="small" title="Location Distribution" style={{ marginBottom: 16 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={byLocation.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="location_name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ color: '#000' }} />
                    <Bar dataKey="total_quantity" name="Quantity" fill="#722ed1" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </Col>
          <Col xs={24} lg={12}>
            <Card size="small" title="Location Breakdown">
              <Table
                columns={locationColumns}
                dataSource={byLocation}
                rowKey="location_name"
                size="small"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'engineer',
      label: (
        <span>
          <UserOutlined /> By Engineer
        </span>
      ),
      children: (
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            {byEngineer.length > 0 && (
              <Card size="small" title="Engineer Distribution" style={{ marginBottom: 16 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={byEngineer.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="engineer_name" type="category" width={120} tick={{ fontSize: 11 }} />
                    <RechartsTooltip contentStyle={{ color: '#000' }} />
                    <Bar dataKey="total_quantity" name="Quantity" fill="#eb2f96" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </Col>
          <Col xs={24} lg={12}>
            <Card size="small" title="Engineer Breakdown">
              <Table
                columns={engineerColumns}
                dataSource={byEngineer}
                rowKey="engineer_name"
                size="small"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </Col>
        </Row>
      )
    }
  ];

  return (
    <div className="p-4">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Consumables Consumption Report
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track delivered consumables across locations and categories
        </p>
      </div>

      {/* Filters */}
      <Card size="small" className="mb-4">
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={5}>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select
              value={categoryId}
              onChange={setCategoryId}
              allowClear
              placeholder="All Categories"
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={8} lg={5}>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Select
              value={locationId}
              onChange={setLocationId}
              allowClear
              placeholder="All Locations"
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="label"
              optionLabelProp="label"
              dropdownStyle={{ minWidth: 280 }}
            >
              {locations.map(loc => {
                const isValidValue = (val) => val && !['NA', 'N/A', 'NULL', 'null', '-'].includes(String(val).trim().toUpperCase());
                const details = [loc.building, loc.floor].filter(isValidValue).join(', ');
                const displayText = details ? `${loc.name} (${details})` : loc.name;
                return (
                  <Option key={loc.id} value={loc.id} label={displayText}>
                    <Tooltip title={displayText} placement="right">
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {displayText}
                      </div>
                    </Tooltip>
                  </Option>
                );
              })}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={8} lg={4}>
            <label className="block text-sm font-medium mb-1">Engineer</label>
            <Select
              value={engineerId}
              onChange={setEngineerId}
              allowClear
              placeholder="All Engineers"
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
            >
              {engineers.map(eng => (
                <Option key={eng.id} value={eng.id}>
                  {eng.firstName} {eng.lastName}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={24} md={24} lg={6}>
            <label className="block text-sm font-medium mb-1">&nbsp;</label>
            <Space wrap>
              <Button type="primary" onClick={handleApplyFilters} loading={loading}>
                Apply Filters
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                Reset
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exporting}>
                Export Excel
              </Button>
            </Space>
          </Col>
        </Row>

        <Divider style={{ margin: '12px 0' }} />

        <Row gutter={8}>
          <Col>
            <span style={{ marginRight: 8, color: '#888' }}>Quick Presets:</span>
          </Col>
          <Col>
            <Space size={4} wrap>
              <Button
                size="small"
                onClick={() => setQuickDateRange([dayjs().subtract(30, 'day'), dayjs()])}
              >
                Last 30 Days
              </Button>
              <Button
                size="small"
                onClick={() => setQuickDateRange([dayjs().subtract(60, 'day'), dayjs()])}
              >
                Last 60 Days
              </Button>
              <Button
                size="small"
                onClick={() => setQuickDateRange([dayjs().subtract(90, 'day'), dayjs()])}
              >
                Last 90 Days
              </Button>
              <Divider type="vertical" />
              <Button
                size="small"
                onClick={() => {
                  const year = dayjs().year();
                  setQuickDateRange([dayjs(`${year}-01-01`), dayjs(`${year}-03-31`)]);
                }}
              >
                Q1 {dayjs().year()}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const year = dayjs().year();
                  setQuickDateRange([dayjs(`${year}-04-01`), dayjs(`${year}-06-30`)]);
                }}
              >
                Q2 {dayjs().year()}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const year = dayjs().year();
                  setQuickDateRange([dayjs(`${year}-07-01`), dayjs(`${year}-09-30`)]);
                }}
              >
                Q3 {dayjs().year()}
              </Button>
              <Button
                size="small"
                onClick={() => {
                  const year = dayjs().year();
                  setQuickDateRange([dayjs(`${year}-10-01`), dayjs(`${year}-12-31`)]);
                }}
              >
                Q4 {dayjs().year()}
              </Button>
              <Divider type="vertical" />
              <Button
                size="small"
                onClick={() => setQuickDateRange([dayjs().startOf('year'), dayjs()])}
              >
                YTD
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <Spin spinning={loading}>
        {reportData ? (
          <>
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="Total Requests"
                    value={totals.total_requests || 0}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="Qty Delivered"
                    value={totals.total_quantity || 0}
                    valueStyle={{ color: '#52c41a' }}
                    prefix={<ShoppingOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="Total Cost"
                    value={totals.total_cost || 0}
                    precision={2}
                    prefix="₹"
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="Unique Consumables"
                    value={totals.unique_consumables || 0}
                    prefix={<FolderOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="Locations"
                    value={totals.unique_locations || 0}
                    prefix={<EnvironmentOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Tabs */}
            <Card>
              <Tabs items={tabItems} defaultActiveKey="summary" />
            </Card>
          </>
        ) : (
          <Card>
            <Empty description="No consumption data available. Apply filters to view report." />
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default ConsumablesConsumptionReport;
