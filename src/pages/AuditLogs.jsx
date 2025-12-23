/**
 * AuditLogs Page
 * Comprehensive audit log management with dashboard, logs, and configuration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Select,
  Input,
  DatePicker,
  message,
  Tabs,
  Typography,
  Tooltip,
  Dropdown,
  Badge,
  Progress,
  List,
  Modal,
  InputNumber,
  Form,
  Spin,
  Empty
} from 'antd';
import {
  ReloadOutlined,
  FilterOutlined,
  ExportOutlined,
  EyeOutlined,
  SearchOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  SecurityScanOutlined,
  DatabaseOutlined,
  HistoryOutlined,
  DownloadOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import auditLogService from '../services/auditLog';
import AuditLogDetailDrawer from '../components/modules/audit/AuditLogDetailDrawer';
import AuditLogFiltersDrawer from '../components/modules/audit/AuditLogFiltersDrawer';
import useResponsive from '../hooks/useResponsive';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

const AuditLogs = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const { isMobile } = useResponsive();
  const isSuperadmin = currentUser?.role === 'superadmin';

  // Tab state
  const [activeTab, setActiveTab] = useState('logs');

  // Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [quickFilters, setQuickFilters] = useState({
    search: '',
    status: '',
    action_category: '',
    dateRange: null
  });

  // Login logs state
  const [loginLogs, setLoginLogs] = useState([]);
  const [loginLogsLoading, setLoginLogsLoading] = useState(false);
  const [loginPagination, setLoginPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [loginFilters, setLoginFilters] = useState({});

  // Statistics state
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsDays, setStatsDays] = useState(7);

  // Daily summaries state
  const [dailySummaries, setDailySummaries] = useState([]);
  const [summariesLoading, setSummariesLoading] = useState(false);

  // Retention config state
  const [retentionConfig, setRetentionConfig] = useState([]);
  const [retentionLoading, setRetentionLoading] = useState(false);
  const [editingRetention, setEditingRetention] = useState(null);

  // Drawers
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [filtersDrawerVisible, setFiltersDrawerVisible] = useState(false);

  // Export state
  const [exporting, setExporting] = useState(false);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    } else if (activeTab === 'login') {
      fetchLoginLogs();
    } else if (activeTab === 'dashboard') {
      fetchStatistics();
      fetchDailySummaries();
    } else if (activeTab === 'retention' && isSuperadmin) {
      fetchRetentionConfig();
    }
  }, [activeTab, pagination.current, pagination.pageSize, filters, quickFilters, loginPagination.current, loginPagination.pageSize, loginFilters, statsDays]);

  // Fetch audit logs
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
        ...buildQuickFilters()
      };

      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await auditLogService.getLogs(params);
      const data = response.data?.data || response.data;

      setLogs(Array.isArray(data) ? data : data.logs || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.pagination?.total || data?.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      message.error('Failed to load audit logs');
    } finally {
      setLogsLoading(false);
    }
  };

  // Build quick filters into params
  const buildQuickFilters = () => {
    const params = {};
    if (quickFilters.search) params.search = quickFilters.search;
    if (quickFilters.status) params.status = quickFilters.status;
    if (quickFilters.action_category) params.action_category = quickFilters.action_category;
    if (quickFilters.dateRange && quickFilters.dateRange[0] && quickFilters.dateRange[1]) {
      params.start_date = quickFilters.dateRange[0].format('YYYY-MM-DD');
      params.end_date = quickFilters.dateRange[1].format('YYYY-MM-DD');
    }
    return params;
  };

  // Fetch login logs
  const fetchLoginLogs = async () => {
    setLoginLogsLoading(true);
    try {
      const params = {
        page: loginPagination.current,
        limit: loginPagination.pageSize,
        ...loginFilters
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await auditLogService.getLoginLogs(params);
      const data = response.data?.data || response.data;

      setLoginLogs(Array.isArray(data) ? data : data.logs || []);
      setLoginPagination((prev) => ({
        ...prev,
        total: response.data?.pagination?.total || data?.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch login logs:', error);
      message.error('Failed to load login logs');
    } finally {
      setLoginLogsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const response = await auditLogService.getStatistics(statsDays);
      const data = response.data?.data || response.data;
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      message.error('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch daily summaries
  const fetchDailySummaries = async () => {
    setSummariesLoading(true);
    try {
      const response = await auditLogService.getDailySummaries(statsDays);
      const data = response.data?.data || response.data || [];
      setDailySummaries(data);
    } catch (error) {
      console.error('Failed to fetch daily summaries:', error);
    } finally {
      setSummariesLoading(false);
    }
  };

  // Fetch retention config
  const fetchRetentionConfig = async () => {
    setRetentionLoading(true);
    try {
      const response = await auditLogService.getRetentionConfig();
      const data = response.data?.data || response.data;
      setRetentionConfig(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch retention config:', error);
      message.error('Failed to load retention configuration');
    } finally {
      setRetentionLoading(false);
    }
  };

  // Handle table pagination
  const handleTableChange = (paginationInfo) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }));
  };

  // Handle login table pagination
  const handleLoginTableChange = (paginationInfo) => {
    setLoginPagination((prev) => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize
    }));
  };

  // Handle quick filter changes
  const handleQuickFilterChange = (key, value) => {
    setQuickFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Handle advanced filters
  const handleAdvancedFilters = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // View log details
  const handleViewLog = (record) => {
    setSelectedAuditId(record.audit_id);
    setDetailDrawerVisible(true);
  };

  // Export logs
  const handleExport = async (format = 'csv') => {
    setExporting(true);
    try {
      const params = {
        ...filters,
        ...buildQuickFilters()
      };

      const response = await auditLogService.exportLogs(params, format);

      if (format === 'csv') {
        // Download CSV file
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${dayjs().format('YYYY-MM-DD')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Download JSON
        const blob = new Blob([JSON.stringify(response.data?.data || response.data, null, 2)], {
          type: 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${dayjs().format('YYYY-MM-DD')}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      message.success(`Logs exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export logs');
    } finally {
      setExporting(false);
    }
  };

  // Update retention config
  const handleUpdateRetention = async (category, values) => {
    try {
      await auditLogService.updateRetentionConfig(category, values);
      message.success('Retention policy updated successfully');
      setEditingRetention(null);
      fetchRetentionConfig();
    } catch (error) {
      console.error('Failed to update retention:', error);
      message.error('Failed to update retention policy');
    }
  };

  // Run archive job
  const handleRunArchive = async () => {
    Modal.confirm({
      title: 'Run Archive Job',
      content: 'This will archive old audit logs based on retention policies. Continue?',
      onOk: async () => {
        try {
          const response = await auditLogService.runArchiveJob();
          const result = response.data?.data || response.data;
          message.success(
            `Archive completed: ${result.archived_count || 0} archived, ${result.deleted_count || 0} deleted`
          );
        } catch (error) {
          console.error('Archive job failed:', error);
          message.error('Failed to run archive job');
        }
      }
    });
  };

  // Generate summary
  const handleGenerateSummary = async (generateAll = true) => {
    try {
      const response = await auditLogService.generateSummary(null, generateAll);
      const result = response.data?.data || response.data;
      const msg = response.data?.message || `Summary generated: ${result.summaries_created || 0} entries created`;
      message.success(msg);
      // Refresh retention config to show updated data
      if (activeTab === 'retention') {
        fetchRetentionConfig();
      }
    } catch (error) {
      console.error('Generate summary failed:', error);
      message.error('Failed to generate summary');
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failure':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  // Main logs columns
  const logsColumns = [
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (date) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          <span>{dayjs(date).fromNow()}</span>
        </Tooltip>
      ),
      sorter: true
    },
    {
      title: 'User',
      dataIndex: 'user_email',
      key: 'user_email',
      width: 200,
      ellipsis: true,
      render: (email, record) => (
        <div>
          <div className="font-medium">{email || 'System'}</div>
          {record.user_role && (
            <Tag size="small" className="mt-1">
              {record.user_role}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 180,
      render: (action, record) => (
        <div>
          <div className="font-medium">{action?.replace(/_/g, ' ')}</div>
          <Space size={4} className="mt-1">
            <Tag color={auditLogService.getCategoryColor(record.action_category)} size="small">
              {record.action_category}
            </Tag>
            <Tag color={auditLogService.getActionTypeColor(record.action_type)} size="small">
              {record.action_type}
            </Tag>
          </Space>
        </div>
      )
    },
    {
      title: 'Resource',
      key: 'resource',
      width: 180,
      render: (_, record) =>
        record.resource_type ? (
          <div>
            <Tag>{record.resource_type}</Tag>
            {record.resource_name && (
              <div className="text-xs text-gray-500 mt-1 truncate" style={{ maxWidth: 150 }}>
                {record.resource_name}
              </div>
            )}
          </div>
        ) : (
          <Text type="secondary">-</Text>
        )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record) => (
        <Space>
          {getStatusIcon(status)}
          <Tag color={auditLogService.getStatusColor(status)}>{status}</Tag>
        </Space>
      )
    },
    {
      title: 'IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 130,
      render: (ip) => (ip ? <Text code>{ip}</Text> : '-')
    },
    {
      title: 'Duration',
      dataIndex: 'duration_ms',
      key: 'duration_ms',
      width: 90,
      render: (ms) => (ms ? `${ms}ms` : '-')
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewLog(record)} />
      )
    }
  ];

  // Login logs columns
  const loginColumns = [
    {
      title: 'Time',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (date) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          <span>{dayjs(date).fromNow()}</span>
        </Tooltip>
      )
    },
    {
      title: 'User',
      dataIndex: 'user_email',
      key: 'user_email',
      width: 220,
      render: (email, record) => (
        <div>
          <div className="font-medium">{email || 'Unknown'}</div>
          {record.user_role && <Tag size="small">{record.user_role}</Tag>}
        </div>
      )
    },
    {
      title: 'Event',
      dataIndex: 'event_type',
      key: 'event_type',
      width: 150,
      render: (type) => {
        const colors = {
          login_success: 'green',
          login_failed: 'red',
          logout: 'blue',
          token_refresh: 'cyan',
          password_reset: 'orange'
        };
        return (
          <Tag color={colors[type] || 'default'}>{type?.replace(/_/g, ' ').toUpperCase()}</Tag>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Space>
          {getStatusIcon(status)}
          <Tag color={auditLogService.getStatusColor(status)}>{status}</Tag>
        </Space>
      )
    },
    {
      title: 'Auth Method',
      dataIndex: 'auth_method',
      key: 'auth_method',
      width: 120,
      render: (method) => <Tag>{method || 'N/A'}</Tag>
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 130,
      render: (ip) => <Text code>{ip || 'N/A'}</Text>
    },
    {
      title: 'Failure Reason',
      dataIndex: 'failure_reason',
      key: 'failure_reason',
      ellipsis: true,
      render: (reason) =>
        reason ? <Text type="danger">{reason}</Text> : <Text type="secondary">-</Text>
    }
  ];

  // Retention config columns
  const retentionColumns = [
    {
      title: 'Category',
      dataIndex: 'action_category',
      key: 'action_category',
      render: (cat) => (
        <Tag color={auditLogService.getCategoryColor(cat)}>
          {auditLogService.getCategoryLabel(cat)}
        </Tag>
      )
    },
    {
      title: 'Retention Days',
      dataIndex: 'retention_days',
      key: 'retention_days',
      render: (days) => `${days} days`
    },
    {
      title: 'Archive Days',
      dataIndex: 'archive_days',
      key: 'archive_days',
      render: (days) => `${days} days`
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => setEditingRetention(record)}
          disabled={!isSuperadmin}
        >
          Edit
        </Button>
      )
    }
  ];

  // Render Statistics Dashboard
  const renderDashboard = () => (
    <Spin spinning={statsLoading}>
      {stats ? (
        <div className="space-y-6">
          {/* Time Range Selector */}
          <div className="flex justify-between items-center">
            <Title level={5} className="!mb-0">
              Statistics Overview
            </Title>
            <Select value={statsDays} onChange={setStatsDays} style={{ width: 150 }}>
              <Option value={1}>Last 24 hours</Option>
              <Option value={7}>Last 7 days</Option>
              <Option value={30}>Last 30 days</Option>
              <Option value={90}>Last 90 days</Option>
            </Select>
          </div>

          {/* Overview Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Logs"
                  value={stats.overview?.total_logs || 0}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Success"
                  value={stats.overview?.success_count || 0}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Failures"
                  value={(stats.overview?.failure_count || 0) + (stats.overview?.error_count || 0)}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Unique Users"
                  value={stats.overview?.unique_users || 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* By Category & Recent Failures */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Activity by Category" size="small">
                <List
                  size="small"
                  dataSource={stats.by_category || []}
                  renderItem={(item) => (
                    <List.Item>
                      <div className="flex justify-between w-full">
                        <Tag color={auditLogService.getCategoryColor(item.action_category)}>
                          {auditLogService.getCategoryLabel(item.action_category)}
                        </Tag>
                        <Space>
                          <Text>{item.count}</Text>
                          {item.failures > 0 && (
                            <Text type="danger">({item.failures} failed)</Text>
                          )}
                        </Space>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card
                title={
                  <Space>
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                    Recent Failures
                  </Space>
                }
                size="small"
              >
                {stats.recent_failures?.length > 0 ? (
                  <List
                    size="small"
                    dataSource={stats.recent_failures.slice(0, 5)}
                    renderItem={(item) => (
                      <List.Item>
                        <div className="w-full">
                          <div className="flex justify-between">
                            <Text strong>{item.action}</Text>
                            <Text type="secondary" className="text-xs">
                              {dayjs(item.created_at).fromNow()}
                            </Text>
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.user_email} - {item.error_message?.substring(0, 50)}
                            {item.error_message?.length > 50 ? '...' : ''}
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No recent failures" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
          </Row>

          {/* Top Actions & Login Stats */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card title="Top Actions" size="small">
                <List
                  size="small"
                  dataSource={(stats.top_actions || []).slice(0, 8)}
                  renderItem={(item, index) => (
                    <List.Item>
                      <div className="flex justify-between w-full items-center">
                        <Space>
                          <Badge count={index + 1} style={{ backgroundColor: index < 3 ? '#1890ff' : '#d9d9d9' }} />
                          <Text>{item.action?.replace(/_/g, ' ')}</Text>
                        </Space>
                        <Space>
                          <Text strong>{item.count}</Text>
                          {item.avg_duration && (
                            <Text type="secondary" className="text-xs">
                              (~{Math.round(item.avg_duration)}ms)
                            </Text>
                          )}
                        </Space>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Login Statistics" size="small">
                <List
                  size="small"
                  dataSource={stats.login_stats || []}
                  renderItem={(item) => (
                    <List.Item>
                      <div className="flex justify-between w-full">
                        <Space>
                          <Tag
                            color={
                              item.event_type === 'login_success'
                                ? 'green'
                                : item.event_type === 'login_failed'
                                ? 'red'
                                : 'blue'
                            }
                          >
                            {item.event_type?.replace(/_/g, ' ')}
                          </Tag>
                          <Tag color={item.status === 'success' ? 'green' : 'red'}>{item.status}</Tag>
                        </Space>
                        <Text strong>{item.count}</Text>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          {/* Daily Summaries */}
          <Card
            title={
              <Space>
                <HistoryOutlined />
                <span>Daily Summaries</span>
              </Space>
            }
            size="small"
            extra={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => fetchDailySummaries()}
                loading={summariesLoading}
              >
                Refresh
              </Button>
            }
          >
            <Spin spinning={summariesLoading}>
              {dailySummaries.length > 0 ? (
                <Table
                  size="small"
                  dataSource={dailySummaries}
                  rowKey={(record) => record.summary_date}
                  pagination={{ pageSize: 7, showSizeChanger: false }}
                  columns={[
                    {
                      title: 'Date',
                      dataIndex: 'summary_date',
                      key: 'summary_date',
                      render: (date) => dayjs(date).format('MMM DD, YYYY'),
                      width: 120
                    },
                    {
                      title: 'Total',
                      dataIndex: 'total_count',
                      key: 'total_count',
                      align: 'right',
                      width: 80
                    },
                    {
                      title: 'Success',
                      dataIndex: 'success_count',
                      key: 'success_count',
                      align: 'right',
                      width: 80,
                      render: (val) => <Text type="success">{val}</Text>
                    },
                    {
                      title: 'Failures',
                      dataIndex: 'failure_count',
                      key: 'failure_count',
                      align: 'right',
                      width: 80,
                      render: (val) => val > 0 ? <Text type="danger">{val}</Text> : val
                    },
                    {
                      title: 'Users',
                      dataIndex: 'unique_users',
                      key: 'unique_users',
                      align: 'right',
                      width: 70
                    },
                    {
                      title: 'Avg Duration',
                      dataIndex: 'avg_duration_ms',
                      key: 'avg_duration_ms',
                      align: 'right',
                      width: 100,
                      render: (val) => val ? `${Math.round(val)}ms` : '-'
                    }
                  ]}
                />
              ) : (
                <Empty
                  description="No summaries generated yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  {isSuperadmin && (
                    <Button type="primary" size="small" onClick={() => handleGenerateSummary(true)}>
                      Generate Summaries
                    </Button>
                  )}
                </Empty>
              )}
            </Spin>
          </Card>
        </div>
      ) : (
        <Empty description="No statistics available" />
      )}
    </Spin>
  );

  // Render Logs Table
  const renderLogsTable = () => (
    <div className="space-y-4">
      {/* Quick Filters */}
      <Card size="small">
        <Space wrap className="w-full">
          <Search
            placeholder="Search logs..."
            allowClear
            style={{ width: isMobile ? '100%' : 250 }}
            onSearch={(value) => handleQuickFilterChange('search', value)}
            enterButton={<SearchOutlined />}
          />

          <Select
            placeholder="Status"
            allowClear
            style={{ width: 120 }}
            value={quickFilters.status || undefined}
            onChange={(value) => handleQuickFilterChange('status', value)}
          >
            <Option value="success">Success</Option>
            <Option value="failure">Failure</Option>
            <Option value="error">Error</Option>
          </Select>

          <Select
            placeholder="Category"
            allowClear
            style={{ width: 150 }}
            value={quickFilters.action_category || undefined}
            onChange={(value) => handleQuickFilterChange('action_category', value)}
          >
            <Option value="auth">Authentication</Option>
            <Option value="user">User</Option>
            <Option value="asset">Asset</Option>
            <Option value="ticket">Ticket</Option>
            <Option value="requisition">Requisition</Option>
            <Option value="permission">Permission</Option>
            <Option value="system">System</Option>
            <Option value="master">Master Data</Option>
          </Select>

          <RangePicker
            value={quickFilters.dateRange}
            onChange={(dates) => handleQuickFilterChange('dateRange', dates)}
            style={{ width: isMobile ? '100%' : 240 }}
          />

          <Button icon={<FilterOutlined />} onClick={() => setFiltersDrawerVisible(true)}>
            {!isMobile && 'More Filters'}
          </Button>

          <Button icon={<ReloadOutlined />} onClick={fetchLogs} loading={logsLoading}>
            {!isMobile && 'Refresh'}
          </Button>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'csv',
                  label: 'Export as CSV',
                  icon: <DownloadOutlined />,
                  onClick: () => handleExport('csv')
                },
                {
                  key: 'json',
                  label: 'Export as JSON',
                  icon: <DownloadOutlined />,
                  onClick: () => handleExport('json')
                }
              ]
            }}
          >
            <Button icon={<ExportOutlined />} loading={exporting}>
              {!isMobile && 'Export'}
            </Button>
          </Dropdown>
        </Space>

        {/* Active Filters Display */}
        {Object.keys(filters).length > 0 && (
          <div className="mt-3">
            <Text type="secondary" className="mr-2">
              Active filters:
            </Text>
            {Object.entries(filters).map(([key, value]) => (
              <Tag
                key={key}
                closable
                onClose={() => {
                  const newFilters = { ...filters };
                  delete newFilters[key];
                  setFilters(newFilters);
                }}
              >
                {key}: {value}
              </Tag>
            ))}
            <Button type="link" size="small" onClick={() => setFilters({})}>
              Clear all
            </Button>
          </div>
        )}
      </Card>

      {/* Table */}
      <Table
        columns={logsColumns}
        dataSource={logs}
        rowKey="audit_id"
        loading={logsLoading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} logs`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        size="small"
      />
    </div>
  );

  // Render Login Logs Table
  const renderLoginLogs = () => (
    <div className="space-y-4">
      {/* Filters */}
      <Card size="small">
        <Space wrap>
          <Select
            placeholder="Event Type"
            allowClear
            style={{ width: 160 }}
            onChange={(value) => setLoginFilters((prev) => ({ ...prev, event_type: value }))}
          >
            <Option value="login_success">Login Success</Option>
            <Option value="login_failed">Login Failed</Option>
            <Option value="logout">Logout</Option>
            <Option value="token_refresh">Token Refresh</Option>
          </Select>

          <Select
            placeholder="Status"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => setLoginFilters((prev) => ({ ...prev, status: value }))}
          >
            <Option value="success">Success</Option>
            <Option value="failure">Failure</Option>
          </Select>

          <Input
            placeholder="IP Address"
            style={{ width: 150 }}
            onChange={(e) =>
              setLoginFilters((prev) => ({ ...prev, ip_address: e.target.value }))
            }
          />

          <Button icon={<ReloadOutlined />} onClick={fetchLoginLogs} loading={loginLogsLoading}>
            Refresh
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Table
        columns={loginColumns}
        dataSource={loginLogs}
        rowKey="login_audit_id"
        loading={loginLogsLoading}
        pagination={{
          ...loginPagination,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} login events`
        }}
        onChange={handleLoginTableChange}
        scroll={{ x: 'max-content' }}
        size="small"
      />
    </div>
  );

  // Render Retention Config
  const renderRetentionConfig = () => (
    <div className="space-y-4">
      <Card
        title="Retention Policies"
        extra={
          isSuperadmin && (
            <Space>
              <Button icon={<PlayCircleOutlined />} onClick={handleRunArchive}>
                Run Archive
              </Button>
              <Button icon={<HistoryOutlined />} onClick={() => handleGenerateSummary(true)}>
                Generate Summary
              </Button>
            </Space>
          )
        }
      >
        <Table
          columns={retentionColumns}
          dataSource={retentionConfig}
          rowKey="config_id"
          loading={retentionLoading}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Edit Retention Modal */}
      <Modal
        title={`Edit Retention: ${editingRetention?.action_category}`}
        open={!!editingRetention}
        onCancel={() => setEditingRetention(null)}
        footer={null}
        destroyOnClose
      >
        {editingRetention && (
          <Form
            layout="vertical"
            initialValues={{
              retention_days: editingRetention.retention_days,
              archive_days: editingRetention.archive_days
            }}
            onFinish={(values) =>
              handleUpdateRetention(editingRetention.action_category, values)
            }
          >
            <Form.Item
              name="retention_days"
              label="Retention Days"
              rules={[{ required: true, message: 'Required' }]}
              extra="How long to keep logs in the main table"
            >
              <InputNumber min={1} max={365} className="w-full" />
            </Form.Item>

            <Form.Item
              name="archive_days"
              label="Archive Days"
              rules={[{ required: true, message: 'Required' }]}
              extra="How long to keep logs in the archive table"
            >
              <InputNumber min={1} max={3650} className="w-full" />
            </Form.Item>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button onClick={() => setEditingRetention(null)}>Cancel</Button>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );

  // Tab items
  const tabItems = [
    {
      key: 'logs',
      label: (
        <span>
          <DatabaseOutlined />
          Audit Logs
        </span>
      ),
      children: renderLogsTable()
    },
    {
      key: 'login',
      label: (
        <span>
          <SecurityScanOutlined />
          Login Activity
        </span>
      ),
      children: renderLoginLogs()
    },
    {
      key: 'dashboard',
      label: (
        <span>
          <BarChartOutlined />
          Dashboard
        </span>
      ),
      children: renderDashboard()
    },
    ...(isSuperadmin
      ? [
          {
            key: 'retention',
            label: (
              <span>
                <SettingOutlined />
                Retention Config
              </span>
            ),
            children: renderRetentionConfig()
          }
        ]
      : [])
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="!mb-1">
          <HistoryOutlined className="mr-3" />
          Audit Logs
        </Title>
        <Text type="secondary">Monitor system activity and track changes across the platform</Text>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* Detail Drawer */}
      <AuditLogDetailDrawer
        visible={detailDrawerVisible}
        auditId={selectedAuditId}
        onClose={() => {
          setDetailDrawerVisible(false);
          setSelectedAuditId(null);
        }}
      />

      {/* Filters Drawer */}
      <AuditLogFiltersDrawer
        visible={filtersDrawerVisible}
        onClose={() => setFiltersDrawerVisible(false)}
        onApply={handleAdvancedFilters}
        currentFilters={filters}
      />
    </div>
  );
};

export default AuditLogs;
