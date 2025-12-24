import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Spin,
  Empty,
  Statistic,
  Row,
  Col,
  Button,
  Tabs,
  Badge,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
  Alert,
  Descriptions,
  Progress
} from 'antd';
import {
  WarningOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  FlagOutlined,
  ToolOutlined,
  DollarOutlined,
  BarChartOutlined,
  PlusOutlined,
  EyeOutlined,
  SettingOutlined,
  HistoryOutlined,
  RedoOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import faultAnalysisService from '../../../services/faultAnalysis';

const { Text, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * FaultAnalysisDashboard Component
 * Admin dashboard for monitoring and managing problematic assets
 */
const FaultAnalysisDashboard = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const isAdmin = currentUser?.role === 'admin';
  const [loading, setLoading] = useState(false);
  const [activeFlags, setActiveFlags] = useState([]);
  const [resolvedFlags, setResolvedFlags] = useState([]);
  const [stats, setStats] = useState(null);
  const [assetAnalysis, setAssetAnalysis] = useState([]);
  const [modelAnalysis, setModelAnalysis] = useState([]);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [flagModalVisible, setFlagModalVisible] = useState(false);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [repairHistoryModalVisible, setRepairHistoryModalVisible] = useState(false);
  const [selectedAssetRepairs, setSelectedAssetRepairs] = useState([]);
  const [selectedAssetInfo, setSelectedAssetInfo] = useState(null);
  const [loadingRepairs, setLoadingRepairs] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [activeTab, setActiveTab] = useState('flags');
  const [form] = Form.useForm();
  const [resolveForm] = Form.useForm();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [flagsRes, statsRes] = await Promise.all([
        faultAnalysisService.getActiveFlags(),
        faultAnalysisService.getFlagStats()
      ]);

      const flagsData = flagsRes.data?.data || flagsRes.data;
      const statsData = statsRes.data?.data || statsRes.data;

      setActiveFlags(flagsData.flags || []);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      message.error('Failed to load fault analysis data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetAnalysis = async () => {
    try {
      const response = await faultAnalysisService.analyzeAllAssets();
      const data = response.data?.data || response.data;
      setAssetAnalysis(data.problematic_assets || data.problematicAssets || []);
    } catch (error) {
      console.error('Failed to fetch asset analysis:', error);
    }
  };

  const fetchModelAnalysis = async () => {
    try {
      const response = await faultAnalysisService.analyzeModels();
      const data = response.data?.data || response.data;
      setModelAnalysis(data.problematic_models || data.problematicModels || []);
    } catch (error) {
      console.error('Failed to fetch model analysis:', error);
    }
  };

  const fetchResolvedFlags = async () => {
    try {
      const response = await faultAnalysisService.getResolvedFlags();
      const data = response.data?.data || response.data;
      setResolvedFlags(data.flags || []);
    } catch (error) {
      console.error('Failed to fetch resolved flags:', error);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === 'assets' && assetAnalysis.length === 0) {
      fetchAssetAnalysis();
    } else if (key === 'models' && modelAnalysis.length === 0) {
      fetchModelAnalysis();
    } else if (key === 'history') {
      fetchResolvedFlags();
    }
  };

  const handleRunAutoAnalysis = async () => {
    setRunningAnalysis(true);
    try {
      const response = await faultAnalysisService.runAutoAnalysis({
        createFlags: true
      });
      const data = response.data?.data || response.data;
      message.success(`Analysis complete: ${data.flags_created || data.flagsCreated || 0} new flags created`);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to run auto analysis:', error);
      message.error('Failed to run automatic analysis');
    } finally {
      setRunningAnalysis(false);
    }
  };

  const handleCreateFlag = async (values) => {
    try {
      await faultAnalysisService.createFlag(values);
      message.success('Fault flag created successfully');
      setFlagModalVisible(false);
      form.resetFields();
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to create flag:', error);
      message.error('Failed to create fault flag');
    }
  };

  const handleResolveFlag = async (values) => {
    if (!selectedFlag) return;

    try {
      await faultAnalysisService.resolveFlag(selectedFlag.flag_id, values);
      message.success('Flag resolved successfully');
      setResolveModalVisible(false);
      resolveForm.resetFields();
      setSelectedFlag(null);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to resolve flag:', error);
      message.error('Failed to resolve flag');
    }
  };

  const handleDeactivateFlag = async (flagId) => {
    try {
      await faultAnalysisService.deactivateFlag(flagId);
      message.success('Flag deactivated');
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to deactivate flag:', error);
      message.error('Failed to deactivate flag');
    }
  };

  const openResolveModal = (flag) => {
    setSelectedFlag(flag);
    setResolveModalVisible(true);
  };

  const fetchAssetRepairHistory = async (assetId, assetInfo) => {
    setLoadingRepairs(true);
    setSelectedAssetInfo(assetInfo);
    setRepairHistoryModalVisible(true);
    try {
      const { default: apiClient } = await import('../../../utils/apiClient');
      const response = await apiClient.get(`/assets/${assetId}/repair-history`);
      const data = response.data?.data || response.data;
      setSelectedAssetRepairs(data?.repairs || data || []);
    } catch (error) {
      console.error('Failed to fetch repair history:', error);
      message.error('Failed to fetch repair history');
      setSelectedAssetRepairs([]);
    } finally {
      setLoadingRepairs(false);
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'severe':
        return <CloseCircleOutlined style={{ color: 'red' }} />;
      case 'critical':
        return <ExclamationCircleOutlined style={{ color: 'orange' }} />;
      default:
        return <WarningOutlined style={{ color: 'gold' }} />;
    }
  };

  const flagColumns = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => (
        <Tag color={faultAnalysisService.getSeverityColor(severity)} icon={getSeverityIcon(severity)}>
          {severity?.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Warning', value: 'warning' },
        { text: 'Critical', value: 'critical' },
        { text: 'Severe', value: 'severe' }
      ],
      onFilter: (value, record) => record.severity === value
    },
    {
      title: 'Recurrence',
      dataIndex: 'recurrence_count',
      key: 'recurrence_count',
      width: 110,
      render: (count, record) => {
        if (!count || count === 0) return <Text type="secondary">-</Text>;
        return (
          <Tooltip title={record.previous_resolved_at ?
            `Previous flag resolved on ${new Date(record.previous_resolved_at).toLocaleDateString()} (${record.previous_resolution_action || 'N/A'})` :
            'Recurring issue'
          }>
            <Tag color="volcano" icon={<RedoOutlined />}>
              #{count + 1} occurrence
            </Tag>
          </Tooltip>
        );
      },
      sorter: (a, b) => (a.recurrence_count || 0) - (b.recurrence_count || 0)
    },
    {
      title: 'Flag Type',
      dataIndex: 'flag_type',
      key: 'flag_type',
      width: 140,
      render: (type) => (
        <Tag color={type === 'asset' ? 'blue' : type === 'product_model' ? 'purple' : 'cyan'}>
          {faultAnalysisService.getFlagTypeDisplayName(type)}
        </Tag>
      )
    },
    {
      title: 'Target',
      key: 'target',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space size="small">
            {record.asset_type === 'component' && (
              <Tag color="cyan" style={{ fontSize: '10px' }}>COMPONENT</Tag>
            )}
            {record.asset_type === 'parent' && (
              <Tag color="blue" style={{ fontSize: '10px' }}>PARENT</Tag>
            )}
            <Text strong>
              {record.asset_tag || record.product_name || record.oem_name || 'N/A'}
            </Text>
          </Space>
          {record.asset_type === 'component' && record.parent_asset_tag && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              (of {record.parent_asset_tag})
            </Text>
          )}
          {record.product_model && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Model: {record.product_model}
            </Text>
          )}
          {record.asset_type === 'parent' && record.component_repairs_count > 0 && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              +{record.component_repairs_count} component repairs
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Reason',
      dataIndex: 'flag_reason',
      key: 'flag_reason',
      ellipsis: true,
      width: 200
    },
    {
      title: 'Fault Count',
      dataIndex: 'fault_count',
      key: 'fault_count',
      width: 100,
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: count >= 5 ? 'red' : count >= 3 ? 'orange' : 'gold' }} />
      ),
      sorter: (a, b) => a.fault_count - b.fault_count
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_repair_cost',
      key: 'total_repair_cost',
      width: 120,
      render: (cost) => (
        <Text type={cost > 1000 ? 'danger' : 'secondary'}>
          ₹{(cost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
      sorter: (a, b) => (a.total_repair_cost || 0) - (b.total_repair_cost || 0)
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Resolve Flag">
            <Button
              type="text"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => openResolveModal(record)}
            />
          </Tooltip>
          <Tooltip title="Deactivate">
            <Button
              type="text"
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleDeactivateFlag(record.flag_id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const assetAnalysisColumns = [
    {
      title: 'Asset',
      key: 'asset',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space size="small">
            {record.asset_type === 'component' && (
              <Tag color="cyan" style={{ fontSize: '10px' }}>COMPONENT</Tag>
            )}
            {record.asset_type === 'parent' && (
              <Tag color="blue" style={{ fontSize: '10px' }}>PARENT</Tag>
            )}
            <Text strong>{record.asset_tag}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.product_name}
          </Text>
          {record.asset_type === 'component' && record.parent_asset_tag && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              (of {record.parent_asset_tag})
            </Text>
          )}
          {record.asset_type === 'parent' && record.component_repairs_count > 0 && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              +{record.component_repairs_count} component repairs
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'asset_status',
      key: 'asset_status',
      width: 100,
      render: (status) => <Tag>{status}</Tag>
    },
    {
      title: 'Repairs',
      dataIndex: 'total_repairs',
      key: 'total_repairs',
      width: 80,
      render: (count) => (
        <Badge count={count} style={{ backgroundColor: count >= 5 ? 'red' : count >= 3 ? 'orange' : '#52c41a' }} />
      ),
      sorter: (a, b) => a.total_repairs - b.total_repairs
    },
    {
      title: 'Recent Repairs',
      dataIndex: 'repairs_last_6_months',
      key: 'repairs_last_6_months',
      width: 120,
      render: (count) => (
        <Text type={count >= 3 ? 'danger' : 'secondary'}>{count} in 6 months</Text>
      )
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_repair_cost',
      key: 'total_repair_cost',
      width: 120,
      render: (cost) => `₹${(cost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sorter: (a, b) => (a.total_repair_cost || 0) - (b.total_repair_cost || 0)
    },
    {
      title: 'Warranty',
      dataIndex: 'under_warranty',
      key: 'under_warranty',
      width: 100,
      render: (underWarranty) => (
        <Tag color={underWarranty ? 'green' : 'default'}>
          {underWarranty ? 'Yes' : 'No'}
        </Tag>
      )
    },
    {
      title: 'Active Flags',
      dataIndex: 'active_flags',
      key: 'active_flags',
      width: 100,
      render: (count) => count > 0 ? (
        <Tag color="red" icon={<FlagOutlined />}>{count}</Tag>
      ) : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Repair History">
            <Button
              type="primary"
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => fetchAssetRepairHistory(record.asset_id, {
                asset_tag: record.asset_tag,
                product_name: record.product_name,
                product_model: record.product_model
              })}
            >
              History
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  const modelAnalysisColumns = [
    {
      title: 'Product Model',
      key: 'model',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.product_name}</Text>
          {record.product_model && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Model: {record.product_model}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'OEM',
      dataIndex: 'oem_name',
      key: 'oem_name',
      width: 150,
      render: (name) => <Tag color="blue">{name || 'N/A'}</Tag>
    },
    {
      title: 'Total Assets',
      dataIndex: 'total_assets',
      key: 'total_assets',
      width: 100
    },
    {
      title: 'Total Repairs',
      dataIndex: 'total_repairs',
      key: 'total_repairs',
      width: 100,
      sorter: (a, b) => a.total_repairs - b.total_repairs
    },
    {
      title: 'Repair Rate',
      dataIndex: 'repair_rate',
      key: 'repair_rate',
      width: 120,
      render: (rate) => (
        <Progress
          percent={Math.min(rate * 100, 100)}
          size="small"
          status={rate > 0.5 ? 'exception' : rate > 0.3 ? 'active' : 'success'}
          format={(pct) => `${pct.toFixed(0)}%`}
        />
      ),
      sorter: (a, b) => (a.repair_rate || 0) - (b.repair_rate || 0)
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_repair_cost',
      key: 'total_repair_cost',
      width: 120,
      render: (cost) => `₹${(cost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sorter: (a, b) => (a.total_repair_cost || 0) - (b.total_repair_cost || 0)
    },
    {
      title: 'Active Flags',
      dataIndex: 'active_flags',
      key: 'active_flags',
      width: 100,
      render: (count) => count > 0 ? (
        <Tag color="red" icon={<FlagOutlined />}>{count}</Tag>
      ) : '-'
    }
  ];

  const resolvedFlagsColumns = [
    {
      title: 'Resolved Date',
      dataIndex: 'resolved_at',
      key: 'resolved_at',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
      sorter: (a, b) => new Date(a.resolved_at) - new Date(b.resolved_at),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Flag Type',
      dataIndex: 'flag_type',
      key: 'flag_type',
      width: 140,
      render: (type) => (
        <Tag color={type === 'asset' ? 'blue' : type === 'product_model' ? 'purple' : 'cyan'}>
          {faultAnalysisService.getFlagTypeDisplayName(type)}
        </Tag>
      ),
      filters: [
        { text: 'Individual Asset', value: 'asset' },
        { text: 'Product Model', value: 'product_model' },
        { text: 'Manufacturer (OEM)', value: 'oem' }
      ],
      onFilter: (value, record) => record.flag_type === value
    },
    {
      title: 'Target',
      key: 'target',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space size="small">
            {record.asset_type === 'component' && (
              <Tag color="cyan" style={{ fontSize: '10px' }}>COMPONENT</Tag>
            )}
            {record.asset_type === 'parent' && (
              <Tag color="blue" style={{ fontSize: '10px' }}>PARENT</Tag>
            )}
            <Text strong>
              {record.asset_tag || record.product_name || record.oem_name || 'N/A'}
            </Text>
          </Space>
          {record.asset_type === 'component' && record.parent_asset_tag && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              (of {record.parent_asset_tag})
            </Text>
          )}
          {record.product_model && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Model: {record.product_model}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Original Reason',
      dataIndex: 'flag_reason',
      key: 'flag_reason',
      ellipsis: true,
      width: 180
    },
    {
      title: 'Resolution Action',
      dataIndex: 'resolution_action',
      key: 'resolution_action',
      width: 150,
      render: (action) => (
        <Tag color="green">
          {faultAnalysisService.getResolutionActionDisplayName(action)}
        </Tag>
      ),
      filters: [
        { text: 'Asset Replaced', value: 'replaced' },
        { text: 'Asset Repaired', value: 'repaired' },
        { text: 'Asset Retired', value: 'retired' },
        { text: 'Vendor Notified', value: 'vendor_notified' },
        { text: 'Under Monitoring', value: 'monitoring' },
        { text: 'Dismissed', value: 'dismissed' },
        { text: 'Other', value: 'other' }
      ],
      onFilter: (value, record) => record.resolution_action === value
    },
    {
      title: 'Resolution Notes',
      dataIndex: 'resolution_notes',
      key: 'resolution_notes',
      ellipsis: true,
      width: 200
    },
    {
      title: 'Resolved By',
      dataIndex: 'resolved_by_name',
      key: 'resolved_by_name',
      width: 150,
      render: (name) => name || '-'
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => (
        <Tag color={faultAnalysisService.getSeverityColor(severity)}>
          {severity?.toUpperCase()}
        </Tag>
      )
    }
  ];

  const renderStatsCards = () => {
    if (!stats) return null;

    const activeFlags = stats.active_flags || stats.activeFlags || 0;
    const criticalFlags = stats.critical_flags || stats.criticalFlags || 0;
    const severeFlags = stats.severe_flags || stats.severeFlags || 0;
    const resolvedFlags = stats.resolved_flags || stats.resolvedFlags || 0;
    const recurringFlags = stats.recurring_flags || stats.recurringFlags || 0;

    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Active Flags"
              value={activeFlags}
              prefix={<FlagOutlined />}
              valueStyle={{ color: activeFlags > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Critical/Severe"
              value={criticalFlags + severeFlags}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Tooltip title="Assets flagged multiple times after resolution">
              <Statistic
                title="Recurring Issues"
                value={recurringFlags}
                prefix={<RedoOutlined />}
                valueStyle={{ color: recurringFlags > 0 ? '#fa541c' : '#52c41a' }}
              />
            </Tooltip>
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Resolved Flags"
              value={resolvedFlags}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Warning Flags"
              value={stats.warning_flags || stats.warningFlags || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" tip="Loading fault analysis data..." />
      </div>
    );
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <BarChartOutlined />
            <span>Fault Analysis Dashboard</span>
          </Space>
        }
        extra={
          <Space>
            {isAdmin && (
              <>
                <Tooltip title="Manage Fault Types">
                  <Button
                    icon={<ToolOutlined />}
                    onClick={() => navigate('/admin/fault-types')}
                  >
                    Fault Types
                  </Button>
                </Tooltip>
                <Tooltip title="Configure Thresholds">
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => navigate('/settings/fault-thresholds')}
                  >
                    Thresholds
                  </Button>
                </Tooltip>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => setFlagModalVisible(true)}
                >
                  Manual Flag
                </Button>
                <Button
                  type="primary"
                  loading={runningAnalysis}
                  onClick={handleRunAutoAnalysis}
                >
                  Run Auto Analysis
                </Button>
              </>
            )}
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDashboardData}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        {renderStatsCards()}

        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <Tabs.TabPane
            tab={
              <span>
                <FlagOutlined />
                Active Flags
                <Badge count={activeFlags.length} style={{ marginLeft: 8 }} />
              </span>
            }
            key="flags"
          >
            {activeFlags.length === 0 ? (
              <Empty
                description="No active fault flags"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={flagColumns}
                dataSource={activeFlags}
                rowKey="flag_id"
                size="small"
                pagination={{ pageSize: 10 }}
              />
            )}
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                <ToolOutlined />
                Asset Analysis
              </span>
            }
            key="assets"
          >
            <Alert
              message="Problematic Assets"
              description="Assets with 3 or more repairs in the last 6 months or significant repair costs"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={assetAnalysisColumns}
              dataSource={assetAnalysis}
              rowKey="asset_id"
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                <BarChartOutlined />
                Model Analysis
              </span>
            }
            key="models"
          >
            <Alert
              message="Product Model Analysis"
              description="Aggregated repair statistics by product model/OEM to identify systemic issues"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={modelAnalysisColumns}
              dataSource={modelAnalysis}
              rowKey={(record) => `${record.product_id}-${record.oem_id}`}
              size="small"
              pagination={{ pageSize: 10 }}
            />
          </Tabs.TabPane>

          <Tabs.TabPane
            tab={
              <span>
                <HistoryOutlined />
                Resolution History
                <Badge count={resolvedFlags.length} style={{ marginLeft: 8, backgroundColor: '#52c41a' }} />
              </span>
            }
            key="history"
          >
            <Alert
              message="Resolution History"
              description="View all resolved fault flags and their resolution details"
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
            {resolvedFlags.length === 0 ? (
              <Empty
                description="No resolved flags yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                columns={resolvedFlagsColumns}
                dataSource={resolvedFlags}
                rowKey="flag_id"
                size="small"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1200 }}
              />
            )}
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* Create Manual Flag Modal */}
      <Modal
        title="Create Manual Fault Flag"
        open={flagModalVisible}
        onCancel={() => {
          setFlagModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Create Flag"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateFlag}>
          <Form.Item
            name="flag_type"
            label="Flag Type"
            rules={[{ required: true, message: 'Please select flag type' }]}
          >
            <Select placeholder="Select type">
              <Option value="asset">Individual Asset</Option>
              <Option value="product_model">Product Model</Option>
              <Option value="oem">Manufacturer (OEM)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.flag_type !== currentValues.flag_type}
          >
            {({ getFieldValue }) => {
              const flagType = getFieldValue('flag_type');
              if (flagType === 'asset') {
                return (
                  <Form.Item
                    name="asset_id"
                    label="Asset ID"
                    rules={[{ required: true, message: 'Please enter asset ID' }]}
                  >
                    <Input placeholder="Enter asset ID (UUID)" />
                  </Form.Item>
                );
              } else if (flagType === 'product_model') {
                return (
                  <Form.Item
                    name="product_id"
                    label="Product ID"
                    rules={[{ required: true, message: 'Please enter product ID' }]}
                  >
                    <Input placeholder="Enter product ID (UUID)" />
                  </Form.Item>
                );
              } else if (flagType === 'oem') {
                return (
                  <Form.Item
                    name="oem_id"
                    label="OEM ID"
                    rules={[{ required: true, message: 'Please enter OEM ID' }]}
                  >
                    <Input placeholder="Enter OEM ID (UUID)" />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            name="severity"
            label="Severity"
            rules={[{ required: true, message: 'Please select severity' }]}
          >
            <Select placeholder="Select severity">
              <Option value="warning">Warning</Option>
              <Option value="critical">Critical</Option>
              <Option value="severe">Severe</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="flag_reason"
            label="Reason"
            rules={[{ required: true, message: 'Please enter reason' }]}
          >
            <TextArea rows={3} placeholder="Describe the reason for this flag" maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Resolve Flag Modal */}
      <Modal
        title="Resolve Fault Flag"
        open={resolveModalVisible}
        onCancel={() => {
          setResolveModalVisible(false);
          resolveForm.resetFields();
          setSelectedFlag(null);
        }}
        onOk={() => resolveForm.submit()}
        okText="Resolve"
      >
        {selectedFlag && (
          <Descriptions size="small" column={1} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Flag Type">
              {faultAnalysisService.getFlagTypeDisplayName(selectedFlag.flag_type)}
            </Descriptions.Item>
            <Descriptions.Item label="Target">
              {selectedFlag.asset_tag || selectedFlag.product_name || selectedFlag.oem_name}
            </Descriptions.Item>
            <Descriptions.Item label="Reason">
              {selectedFlag.flag_reason}
            </Descriptions.Item>
          </Descriptions>
        )}

        <Form form={resolveForm} layout="vertical" onFinish={handleResolveFlag}>
          <Form.Item
            name="resolution_action"
            label="Resolution Action"
            rules={[{ required: true, message: 'Please select resolution action' }]}
          >
            <Select placeholder="Select action taken">
              <Option value="replaced">Asset Replaced</Option>
              <Option value="repaired">Asset Repaired</Option>
              <Option value="retired">Asset Retired</Option>
              <Option value="vendor_notified">Vendor Notified</Option>
              <Option value="monitoring">Under Monitoring</Option>
              <Option value="dismissed">Dismissed</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="resolution_notes"
            label="Resolution Notes"
            rules={[{ required: true, message: 'Please enter resolution notes' }]}
          >
            <TextArea rows={3} placeholder="Describe the resolution" maxLength={1000} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Repair History Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <span>Repair History</span>
            {selectedAssetInfo && (
              <Tag color="blue">{selectedAssetInfo.asset_tag}</Tag>
            )}
          </Space>
        }
        open={repairHistoryModalVisible}
        onCancel={() => {
          setRepairHistoryModalVisible(false);
          setSelectedAssetRepairs([]);
          setSelectedAssetInfo(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setRepairHistoryModalVisible(false);
            setSelectedAssetRepairs([]);
            setSelectedAssetInfo(null);
          }}>
            Close
          </Button>
        ]}
        width={900}
      >
        {selectedAssetInfo && (
          <Descriptions size="small" column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Asset Tag">{selectedAssetInfo.asset_tag}</Descriptions.Item>
            <Descriptions.Item label="Product">{selectedAssetInfo.product_name}</Descriptions.Item>
            <Descriptions.Item label="Model">{selectedAssetInfo.product_model || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Total Repairs">{selectedAssetRepairs.length}</Descriptions.Item>
          </Descriptions>
        )}

        {loadingRepairs ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin tip="Loading repair history..." />
          </div>
        ) : selectedAssetRepairs.length === 0 ? (
          <Empty description="No repair history found" />
        ) : (
          <Table
            dataSource={selectedAssetRepairs}
            rowKey="repair_id"
            size="small"
            pagination={{ pageSize: 5 }}
            columns={[
              {
                title: 'Date',
                dataIndex: 'repair_date',
                key: 'repair_date',
                width: 100,
                render: (date) => date ? new Date(date).toLocaleDateString() : '-',
                sorter: (a, b) => new Date(a.repair_date) - new Date(b.repair_date),
                defaultSortOrder: 'descend'
              },
              {
                title: 'Asset',
                key: 'asset',
                width: 150,
                render: (_, record) => (
                  <Space direction="vertical" size={0}>
                    <Space size="small">
                      {record.is_component_repair ? (
                        <Tag color="cyan" style={{ fontSize: '10px' }}>COMPONENT</Tag>
                      ) : null}
                      <Text strong style={{ fontSize: '12px' }}>
                        {record.component_asset_tag || record.asset_tag || 'N/A'}
                      </Text>
                    </Space>
                    {record.is_component_repair && record.parent_asset_tag && (
                      <Text type="secondary" style={{ fontSize: '10px' }}>
                        (of {record.parent_asset_tag})
                      </Text>
                    )}
                  </Space>
                )
              },
              {
                title: 'Fault Type',
                dataIndex: 'fault_type_name',
                key: 'fault_type_name',
                width: 130,
                render: (name) => name || 'N/A'
              },
              {
                title: 'Description',
                dataIndex: 'fault_description',
                key: 'fault_description',
                ellipsis: true
              },
              {
                title: 'Resolution',
                dataIndex: 'resolution',
                key: 'resolution',
                ellipsis: true,
                width: 130
              },
              {
                title: 'Cost',
                dataIndex: 'total_cost',
                key: 'total_cost',
                width: 90,
                render: (cost) => `₹${(cost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              },
              {
                title: 'Status',
                dataIndex: 'repair_status',
                key: 'repair_status',
                width: 90,
                render: (status) => (
                  <Tag color={status === 'completed' ? 'green' : status === 'in_progress' ? 'blue' : 'default'}>
                    {status || 'N/A'}
                  </Tag>
                )
              },
              {
                title: 'Warranty',
                dataIndex: 'warranty_claim',
                key: 'warranty_claim',
                width: 70,
                render: (warranty) => warranty ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>
              }
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default FaultAnalysisDashboard;
