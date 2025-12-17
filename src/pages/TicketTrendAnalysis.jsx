/**
 * TICKET TREND ANALYSIS PAGE
 * Shows ticket volume trends over time with category breakdowns
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Table,
  Statistic,
  Spin,
  message,
  Tabs,
  Tag,
  Progress,
  Space,
  Empty,
  Tooltip
} from 'antd';
import {
  DownloadOutlined,
  ReloadOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  ClockCircleOutlined,
  FolderOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import ticketService from '../services/ticket';
import masterService from '../services/master';
import departmentService from '../services/department';
import userService from '../services/user';

const { Option } = Select;

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

const TicketTrendAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [trendData, setTrendData] = useState(null);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [engineers, setEngineers] = useState([]);

  // Filters
  const [monthsBack, setMonthsBack] = useState(6);
  const [locationId, setLocationId] = useState(null);
  const [departmentId, setDepartmentId] = useState(null);
  const [priority, setPriority] = useState(null);
  const [engineerId, setEngineerId] = useState(null);

  // Load initial data
  useEffect(() => {
    loadFilterOptions();
    fetchTrendData();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [locationsRes, departmentsRes, engineersRes] = await Promise.all([
        masterService.getLocations({ limit: 1000 }),
        departmentService.getDepartments({ limit: 1000 }),
        userService.getUsers({ role: 'engineer', limit: 1000 })
      ]);

      setLocations(locationsRes?.data?.data?.locations || locationsRes?.data?.data || []);
      setDepartments(departmentsRes?.data?.data?.departments || departmentsRes?.data?.data || []);
      setEngineers(engineersRes?.data?.data?.users || engineersRes?.data?.users || []);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const fetchTrendData = async () => {
    setLoading(true);
    try {
      const params = {
        months_back: monthsBack
      };
      if (locationId) params.location_id = locationId;
      if (departmentId) params.department_id = departmentId;
      if (priority) params.priority = priority;
      if (engineerId) params.engineer_id = engineerId;

      const response = await ticketService.getTrendAnalysis(params);
      setTrendData(response?.data?.data || response?.data || null);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      message.error('Failed to fetch trend analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {
        months_back: monthsBack
      };
      if (locationId) params.location_id = locationId;
      if (departmentId) params.department_id = departmentId;
      if (priority) params.priority = priority;
      if (engineerId) params.engineer_id = engineerId;

      await ticketService.exportTrendAnalysis(params);
      message.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      message.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const handleApplyFilters = () => {
    fetchTrendData();
  };

  const handleReset = () => {
    setMonthsBack(6);
    setLocationId(null);
    setDepartmentId(null);
    setPriority(null);
    setEngineerId(null);
    setTimeout(() => fetchTrendData(), 0);
  };

  // Render change indicator
  const renderChangeIndicator = (change, changePercent) => {
    if (change === null || change === undefined) return <MinusOutlined style={{ color: '#8c8c8c' }} />;
    if (change > 0) {
      return (
        <span style={{ color: '#f5222d' }}>
          <RiseOutlined /> +{change} ({changePercent}%)
        </span>
      );
    }
    if (change < 0) {
      return (
        <span style={{ color: '#52c41a' }}>
          <FallOutlined /> {change} ({changePercent}%)
        </span>
      );
    }
    return <MinusOutlined style={{ color: '#8c8c8c' }} />;
  };

  // Monthly volume table columns
  const monthlyColumns = [
    {
      title: 'Period',
      dataIndex: 'period_label',
      key: 'period_label',
      width: 150
    },
    {
      title: 'Total Tickets',
      dataIndex: 'total_tickets',
      key: 'total_tickets',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.total_tickets - b.total_tickets
    },
    {
      title: 'Closed',
      dataIndex: 'closed_tickets',
      key: 'closed_tickets',
      width: 100,
      align: 'right'
    },
    {
      title: 'Active',
      dataIndex: 'active_tickets',
      key: 'active_tickets',
      width: 100,
      align: 'right'
    },
    {
      title: 'Critical',
      dataIndex: 'critical_tickets',
      key: 'critical_tickets',
      width: 100,
      align: 'right',
      render: (val) => val > 0 ? <Tag color="red">{val}</Tag> : val
    },
    {
      title: 'Avg Resolution',
      dataIndex: 'avg_resolution_hours',
      key: 'avg_resolution_hours',
      width: 130,
      align: 'right',
      render: (val) => val ? `${Math.round(val)} hrs` : 'N/A'
    },
    {
      title: 'MoM Change',
      key: 'change',
      width: 140,
      align: 'right',
      render: (_, record) => renderChangeIndicator(record.change, record.change_percent)
    }
  ];

  // Category breakdown table columns
  const categoryColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 200
    },
    {
      title: 'Total',
      dataIndex: 'total_tickets',
      key: 'total_tickets',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.total_tickets - b.total_tickets,
      defaultSortOrder: 'descend'
    },
    {
      title: 'Closed',
      dataIndex: 'closed_tickets',
      key: 'closed_tickets',
      width: 100,
      align: 'right'
    },
    {
      title: 'Active',
      dataIndex: 'active_tickets',
      key: 'active_tickets',
      width: 100,
      align: 'right'
    },
    {
      title: 'Share',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 150,
      render: (val) => (
        <Progress
          percent={val}
          size="small"
          format={(percent) => `${percent}%`}
        />
      )
    }
  ];

  // Priority breakdown columns
  const priorityColumns = [
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (val) => {
        const colors = {
          emergency: 'red',
          critical: 'red',
          high: 'orange',
          medium: 'blue',
          low: 'green'
        };
        return <Tag color={colors[val] || 'default'}>{val?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Total',
      dataIndex: 'total_tickets',
      key: 'total_tickets',
      width: 100,
      align: 'right'
    },
    {
      title: 'Closed',
      dataIndex: 'closed_tickets',
      key: 'closed_tickets',
      width: 100,
      align: 'right'
    },
    {
      title: 'Share',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 150,
      render: (val) => `${val}%`
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
      title: 'Total',
      dataIndex: 'total_tickets',
      key: 'total_tickets',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.total_tickets - b.total_tickets,
      defaultSortOrder: 'descend'
    },
    {
      title: 'Closed',
      dataIndex: 'closed_tickets',
      key: 'closed_tickets',
      width: 100,
      align: 'right'
    },
    {
      title: 'Share',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 150,
      render: (val) => `${val}%`
    }
  ];

  // Department breakdown columns
  const departmentColumns = [
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department_name',
      width: 200
    },
    {
      title: 'Total',
      dataIndex: 'total_tickets',
      key: 'total_tickets',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.total_tickets - b.total_tickets,
      defaultSortOrder: 'descend'
    },
    {
      title: 'Closed',
      dataIndex: 'closed_tickets',
      key: 'closed_tickets',
      width: 100,
      align: 'right'
    },
    {
      title: 'Share',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 150,
      render: (val) => `${val}%`
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
      title: 'Total',
      dataIndex: 'total_tickets',
      key: 'total_tickets',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.total_tickets - b.total_tickets,
      defaultSortOrder: 'descend'
    },
    {
      title: 'Closed',
      dataIndex: 'closed_tickets',
      key: 'closed_tickets',
      width: 100,
      align: 'right'
    },
    {
      title: 'Active',
      dataIndex: 'active_tickets',
      key: 'active_tickets',
      width: 100,
      align: 'right'
    },
    {
      title: 'Avg Resolution',
      dataIndex: 'avg_resolution_hours',
      key: 'avg_resolution_hours',
      width: 120,
      align: 'right',
      render: (val) => val ? `${Math.round(val)} hrs` : 'N/A'
    },
    {
      title: 'Share',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 100,
      render: (val) => `${val}%`
    }
  ];

  const summary = trendData?.summary || {};
  const monthlyVolume = trendData?.monthly_volume || [];
  const byCategory = trendData?.by_category || [];
  const byPriority = trendData?.by_priority || [];
  const byLocation = trendData?.by_location || [];
  const byDepartment = trendData?.by_department || [];
  const byEngineer = trendData?.by_engineer || [];

  const tabItems = [
    {
      key: 'monthly',
      label: (
        <span>
          <LineChartOutlined /> Monthly Volume
        </span>
      ),
      children: (
        <div>
          {/* Monthly Volume Chart */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period_label" tick={{ fontSize: 12 }} />
                <YAxis />
                <RechartsTooltip contentStyle={{ color: '#000' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_tickets"
                  name="Total Tickets"
                  stroke="#1890ff"
                  strokeWidth={2}
                  dot={{ fill: '#1890ff' }}
                />
                <Line
                  type="monotone"
                  dataKey="closed_tickets"
                  name="Closed"
                  stroke="#52c41a"
                  strokeWidth={2}
                  dot={{ fill: '#52c41a' }}
                />
                <Line
                  type="monotone"
                  dataKey="critical_tickets"
                  name="Critical"
                  stroke="#f5222d"
                  strokeWidth={2}
                  dot={{ fill: '#f5222d' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Monthly Volume Table */}
          <Table
            columns={monthlyColumns}
            dataSource={monthlyVolume}
            rowKey="period"
            size="small"
            pagination={false}
            scroll={{ x: 800 }}
          />
        </div>
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
            <Card size="small" title="Category Distribution" style={{ marginBottom: 16 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="total_tickets"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                  >
                    {byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ color: '#000' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card size="small" title="Category Breakdown">
              <Table
                columns={categoryColumns}
                dataSource={byCategory}
                rowKey="category"
                size="small"
                pagination={false}
                scroll={{ y: 280 }}
              />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'priority',
      label: (
        <span>
          <PieChartOutlined /> By Priority
        </span>
      ),
      children: (
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card size="small" title="Priority Distribution" style={{ marginBottom: 16 }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={byPriority}
                    dataKey="total_tickets"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ priority, percentage }) => `${priority}: ${percentage}%`}
                  >
                    {byPriority.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ color: '#000' }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card size="small" title="Priority Breakdown">
              <Table
                columns={priorityColumns}
                dataSource={byPriority}
                rowKey="priority"
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
            <Card size="small" title="Location Distribution" style={{ marginBottom: 16 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byLocation.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="location_name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <RechartsTooltip contentStyle={{ color: '#000' }} />
                  <Bar dataKey="total_tickets" name="Total" fill="#722ed1" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
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
      key: 'department',
      label: (
        <span>
          <TeamOutlined /> By Department
        </span>
      ),
      children: (
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card size="small" title="Department Distribution" style={{ marginBottom: 16 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byDepartment.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="department_name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <RechartsTooltip contentStyle={{ color: '#000' }} />
                  <Bar dataKey="total_tickets" name="Total" fill="#13c2c2" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card size="small" title="Department Breakdown">
              <Table
                columns={departmentColumns}
                dataSource={byDepartment}
                rowKey="department_name"
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
            <Card size="small" title="Engineer Distribution" style={{ marginBottom: 16 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={byEngineer.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="engineer_name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <RechartsTooltip contentStyle={{ color: '#000' }} />
                  <Bar dataKey="total_tickets" name="Total" fill="#eb2f96" />
                  <Bar dataKey="closed_tickets" name="Closed" fill="#52c41a" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
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
          Ticket Trend Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze ticket volume trends over time by category, priority, and location
        </p>
      </div>

      {/* Filters */}
      <Card size="small" className="mb-4">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6} lg={4}>
            <label className="block text-sm font-medium mb-1">Time Period</label>
            <Select
              value={monthsBack}
              onChange={setMonthsBack}
              style={{ width: '100%' }}
            >
              <Option value={3}>Last 3 Months</Option>
              <Option value={6}>Last 6 Months</Option>
              <Option value={9}>Last 9 Months</Option>
              <Option value={12}>Last 12 Months</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6} lg={5}>
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

          <Col xs={24} sm={12} md={6} lg={4}>
            <label className="block text-sm font-medium mb-1">Department</label>
            <Select
              value={departmentId}
              onChange={setDepartmentId}
              allowClear
              placeholder="All Departments"
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
            >
              {departments
                .filter(dept => dept.id || dept.department_id)
                .map(dept => (
                  <Option key={dept.id || dept.department_id} value={dept.id || dept.department_id}>
                    {dept.name || dept.department_name}
                  </Option>
                ))}
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <Select
              value={priority}
              onChange={setPriority}
              allowClear
              placeholder="All Priorities"
              style={{ width: '100%' }}
            >
              <Option value="emergency">Emergency</Option>
              <Option value="critical">Critical</Option>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
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
            <Space>
              <Button
                type="primary"
                onClick={handleApplyFilters}
                loading={loading}
              >
                Apply Filters
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                Reset
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={exporting}
              >
                Export Excel
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <Spin spinning={loading}>
        {trendData ? (
          <>
            <Row gutter={[16, 16]} className="mb-4">
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="Total Tickets"
                    value={summary.total_tickets || 0}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="Closed"
                    value={summary.closed_tickets || 0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="Active"
                    value={summary.active_tickets || 0}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="Critical"
                    value={summary.critical_tickets || 0}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="Avg Resolution"
                    value={summary.avg_resolution_hours ? Math.round(summary.avg_resolution_hours) : 'N/A'}
                    suffix={summary.avg_resolution_hours ? 'hrs' : ''}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Card size="small">
                  <Statistic
                    title="Categories"
                    value={summary.unique_categories || 0}
                    prefix={<FolderOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Tabs for different views */}
            <Card>
              <Tabs items={tabItems} defaultActiveKey="monthly" />
            </Card>
          </>
        ) : (
          <Card>
            <Empty description="No trend data available. Apply filters to view analysis." />
          </Card>
        )}
      </Spin>
    </div>
  );
};

export default TicketTrendAnalysis;
