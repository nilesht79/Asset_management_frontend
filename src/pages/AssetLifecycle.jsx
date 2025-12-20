import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Tabs,
  Badge,
  message,
  Grid
} from 'antd';
import {
  SearchOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  SyncOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate, useSearchParams } from 'react-router-dom';
import assetService from '../services/asset';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const AssetLifecycle = () => {
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [alertType, setAlertType] = useState(searchParams.get('alertType') || '');
  const [searchText, setSearchText] = useState('');

  // Fetch statistics on mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  // Fetch assets when filters change
  useEffect(() => {
    fetchAssets();
  }, [pagination.current, pagination.pageSize, activeTab, alertType, searchText]);

  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const response = await assetService.getLifecycleStatistics();
      if (response.data?.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      message.error('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      // Set alertType based on tab or specific filter
      if (alertType) {
        params.alertType = alertType;
      } else if (activeTab === 'warranty') {
        params.alertType = 'all_warranty';
      } else if (activeTab === 'eol') {
        params.alertType = 'all_eol';
      } else if (activeTab === 'eos') {
        params.alertType = 'all_eos';
      }

      if (searchText) {
        params.search = searchText;
      }

      const response = await assetService.getLifecycleAssets(params);
      if (response.data?.success) {
        setAssets(response.data.data.assets);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.pagination.total
        }));
      }
    } catch (error) {
      console.error('Error fetching lifecycle assets:', error);
      message.error('Failed to load lifecycle assets');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setAlertType('');
    setPagination(prev => ({ ...prev, current: 1 }));
    setSearchParams({ tab: key });
  };

  const handleAlertTypeFilter = (type) => {
    setAlertType(type);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (paginationConfig) => {
    setPagination({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      total: pagination.total
    });
  };

  // Export to CSV
  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const params = {};

      // Set alertType based on tab or specific filter
      if (alertType) {
        params.alertType = alertType;
      } else if (activeTab === 'warranty') {
        params.alertType = 'all_warranty';
      } else if (activeTab === 'eol') {
        params.alertType = 'all_eol';
      } else if (activeTab === 'eos') {
        params.alertType = 'all_eos';
      }

      if (searchText) {
        params.search = searchText;
      }

      // Fetch all data for export (no pagination)
      params.export = true;

      const response = await assetService.getLifecycleAssets(params);
      if (response.data?.success) {
        const exportData = response.data.data.assets;

        // Convert to CSV
        const csvHeaders = [
          'Asset Tag',
          'Product Name',
          'Model',
          'Category',
          'Serial Number',
          'Alert Type',
          'Days Remaining',
          'Warranty End Date',
          'EOL Date',
          'EOS Date',
          'Assigned To',
          'Department',
          'Location',
          'Recommended Action'
        ];

        const csvRows = exportData.map(asset => [
          asset.asset_tag || '',
          asset.product_name || '',
          asset.product_model || '',
          asset.category_name || '',
          asset.serial_number || '',
          asset.alert_type || '',
          asset.days_remaining || '',
          asset.warranty_end_date ? dayjs(asset.warranty_end_date).format('DD MMM YYYY') : '',
          asset.eol_date ? dayjs(asset.eol_date).format('DD MMM YYYY') : '',
          asset.eos_date ? dayjs(asset.eos_date).format('DD MMM YYYY') : '',
          asset.assigned_to_name || 'Unassigned',
          asset.department_name || '',
          asset.location_name || '',
          asset.recommended_action || ''
        ]);

        // Create CSV content
        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const filename = `Asset_Lifecycle_${activeTab}_${dayjs().format('YYYY-MM-DD')}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        message.success(`Exported ${exportData.length} assets to CSV`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      message.error('Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };

  // Get alert tag styling
  const getAlertTag = (alertType, daysRemaining) => {
    const alertConfig = {
      warranty_expired: { color: 'red', icon: <WarningOutlined />, label: 'Warranty Expired' },
      warranty_30: { color: 'red', icon: <ClockCircleOutlined />, label: 'Warranty < 30d' },
      warranty_60: { color: 'orange', icon: <ClockCircleOutlined />, label: 'Warranty 31-60d' },
      warranty_90: { color: 'gold', icon: <ClockCircleOutlined />, label: 'Warranty 61-90d' },
      eol_reached: { color: 'red', icon: <StopOutlined />, label: 'EOL Reached' },
      eol_approaching: { color: 'orange', icon: <ExclamationCircleOutlined />, label: 'EOL Approaching' },
      eos_reached: { color: 'red', icon: <StopOutlined />, label: 'EOS Reached' },
      eos_approaching: { color: 'orange', icon: <ExclamationCircleOutlined />, label: 'EOS Approaching' },
    };

    const config = alertConfig[alertType] || { color: 'default', label: alertType };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.label}
      </Tag>
    );
  };

  // Get action tag styling
  const getActionTag = (action) => {
    const actionConfig = {
      'Renew': { color: 'blue', icon: <SyncOutlined /> },
      'Replace': { color: 'orange', icon: <ToolOutlined /> },
      'Dispose': { color: 'red', icon: <DeleteOutlined /> },
      'No Action': { color: 'default', icon: null }
    };

    const config = actionConfig[action] || { color: 'default' };
    return (
      <Tag color={config.color} icon={config.icon}>
        {action}
      </Tag>
    );
  };

  // Table columns
  const columns = [
    {
      title: 'Asset Tag',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      fixed: 'left',
      width: 175,
      render: (text) => (
        <Button
          type="link"
          onClick={() => navigate(`/assets/inventory?search=${encodeURIComponent(text)}`)}
          style={{ padding: 0, whiteSpace: 'nowrap' }}
        >
          {text}
        </Button>
      )
    },
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 200,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.product_model}</Text>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 120,
    },
    {
      title: 'Alert',
      dataIndex: 'alert_type',
      key: 'alert_type',
      width: 150,
      render: (alertType, record) => getAlertTag(alertType, record.days_remaining)
    },
    {
      title: 'Days Remaining',
      dataIndex: 'days_remaining',
      key: 'days_remaining',
      width: 130,
      sorter: true,
      render: (days) => {
        let color = 'green';
        if (days < 0) color = 'red';
        else if (days <= 30) color = 'red';
        else if (days <= 60) color = 'orange';
        else if (days <= 90) color = 'gold';

        return (
          <Text strong style={{ color }}>
            {days < 0 ? `${Math.abs(days)} days overdue` : `${days} days`}
          </Text>
        );
      }
    },
    {
      title: 'Warranty End',
      dataIndex: 'warranty_end_date',
      key: 'warranty_end_date',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD MMM YYYY') : '-'
    },
    {
      title: 'EOL Date',
      dataIndex: 'eol_date',
      key: 'eol_date',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD MMM YYYY') : '-'
    },
    {
      title: 'EOS Date',
      dataIndex: 'eos_date',
      key: 'eos_date',
      width: 120,
      render: (date) => date ? dayjs(date).format('DD MMM YYYY') : '-'
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to_name',
      key: 'assigned_to_name',
      width: 150,
      render: (name) => name || <Text type="secondary">Unassigned</Text>
    },
    {
      title: 'Recommended Action',
      dataIndex: 'recommended_action',
      key: 'recommended_action',
      width: 150,
      render: (action) => getActionTag(action)
    }
  ];

  // Determine if mobile view
  const isMobile = !screens.md;

  // Statistics cards
  const renderStatCards = () => {
    if (!statistics) return null;

    const cardStyle = { height: '100%', minHeight: isMobile ? 'auto' : '120px' };
    const statisticStyle = { fontSize: isMobile ? '20px' : '24px' };

    return (
      <Row gutter={[12, 12]} className="mb-4">
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card size="small" className="text-center h-full" style={cardStyle} bodyStyle={{ padding: isMobile ? '12px' : '16px' }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>Total Alerts</span>}
              value={statistics.total_alerts}
              prefix={<WarningOutlined style={{ color: '#ff4d4f', fontSize: isMobile ? '16px' : '20px' }} />}
              valueStyle={{ color: '#ff4d4f', ...statisticStyle }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            size="small"
            className="text-center cursor-pointer hover:shadow-md transition-shadow h-full"
            style={cardStyle}
            bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
            onClick={() => handleTabChange('warranty')}
          >
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>Warranty</span>}
              value={statistics.warranty?.total || 0}
              prefix={<SafetyCertificateOutlined style={{ color: '#faad14', fontSize: isMobile ? '16px' : '20px' }} />}
              valueStyle={{ color: '#faad14', ...statisticStyle }}
            />
            <div style={{ fontSize: isMobile ? '10px' : '12px' }} className="mt-1 text-gray-500">
              {statistics.warranty?.expired || 0} expired
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            size="small"
            className="text-center cursor-pointer hover:shadow-md transition-shadow h-full"
            style={cardStyle}
            bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
            onClick={() => handleTabChange('eol')}
          >
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>EOL</span>}
              value={statistics.eol?.total || 0}
              prefix={<ClockCircleOutlined style={{ color: '#ff7a45', fontSize: isMobile ? '16px' : '20px' }} />}
              valueStyle={{ color: '#ff7a45', ...statisticStyle }}
            />
            <div style={{ fontSize: isMobile ? '10px' : '12px' }} className="mt-1 text-gray-500">
              {statistics.eol?.reached || 0} reached
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Card
            size="small"
            className="text-center cursor-pointer hover:shadow-md transition-shadow h-full"
            style={cardStyle}
            bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
            onClick={() => handleTabChange('eos')}
          >
            <Statistic
              title={<span style={{ fontSize: isMobile ? '12px' : '14px' }}>EOS</span>}
              value={statistics.eos?.total || 0}
              prefix={<StopOutlined style={{ color: '#f5222d', fontSize: isMobile ? '16px' : '20px' }} />}
              valueStyle={{ color: '#f5222d', ...statisticStyle }}
            />
            <div style={{ fontSize: isMobile ? '10px' : '12px' }} className="mt-1 text-gray-500">
              {statistics.eos?.reached || 0} reached
            </div>
          </Card>
        </Col>
      </Row>
    );
  };

  // Tab items with badge counts
  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          All Alerts
          <Badge count={statistics?.total_alerts || 0} style={{ marginLeft: 8 }} />
        </span>
      )
    },
    {
      key: 'warranty',
      label: (
        <span>
          Warranty
          <Badge count={statistics?.warranty?.total || 0} style={{ marginLeft: 8, backgroundColor: '#faad14' }} />
        </span>
      )
    },
    {
      key: 'eol',
      label: (
        <span>
          End of Life
          <Badge count={statistics?.eol?.total || 0} style={{ marginLeft: 8, backgroundColor: '#ff7a45' }} />
        </span>
      )
    },
    {
      key: 'eos',
      label: (
        <span>
          End of Support
          <Badge count={statistics?.eos?.total || 0} style={{ marginLeft: 8, backgroundColor: '#f5222d' }} />
        </span>
      )
    }
  ];

  // Filter buttons for warranty tab
  const renderWarrantyFilters = () => {
    if (activeTab !== 'warranty') return null;

    const buttonSize = isMobile ? 'small' : 'small';
    const buttonStyle = isMobile ? { fontSize: '11px', padding: '0 8px' } : {};

    return (
      <Space wrap size={isMobile ? 4 : 8}>
        <Button
          type={alertType === '' ? 'primary' : 'default'}
          size={buttonSize}
          style={buttonStyle}
          onClick={() => handleAlertTypeFilter('')}
        >
          All ({statistics?.warranty?.total || 0})
        </Button>
        <Button
          type={alertType === 'warranty_expired' ? 'primary' : 'default'}
          danger={alertType === 'warranty_expired'}
          size={buttonSize}
          style={buttonStyle}
          onClick={() => handleAlertTypeFilter('warranty_expired')}
        >
          Expired ({statistics?.warranty?.expired || 0})
        </Button>
        <Button
          type={alertType === 'warranty_30' ? 'primary' : 'default'}
          size={buttonSize}
          style={buttonStyle}
          onClick={() => handleAlertTypeFilter('warranty_30')}
        >
          {isMobile ? '30d' : '30 Days'} ({statistics?.warranty?.days_30 || 0})
        </Button>
        <Button
          type={alertType === 'warranty_60' ? 'primary' : 'default'}
          size={buttonSize}
          style={buttonStyle}
          onClick={() => handleAlertTypeFilter('warranty_60')}
        >
          {isMobile ? '60d' : '60 Days'} ({statistics?.warranty?.days_60 || 0})
        </Button>
        <Button
          type={alertType === 'warranty_90' ? 'primary' : 'default'}
          size={buttonSize}
          style={buttonStyle}
          onClick={() => handleAlertTypeFilter('warranty_90')}
        >
          {isMobile ? '90d' : '90 Days'} ({statistics?.warranty?.days_90 || 0})
        </Button>
      </Space>
    );
  };

  // Get responsive columns - hide some columns on mobile
  const getResponsiveColumns = () => {
    if (isMobile) {
      return columns.filter(col =>
        ['asset_tag', 'alert_type', 'days_remaining', 'recommended_action'].includes(col.key)
      ).map(col => ({
        ...col,
        fixed: col.key === 'asset_tag' ? 'left' : undefined,
        width: col.key === 'asset_tag' ? 100 : col.key === 'days_remaining' ? 100 : 120
      }));
    }
    return columns;
  };

  return (
    <div style={{ padding: isMobile ? '12px' : '16px' }}>
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'} mb-4`}>
        <div>
          <Title level={isMobile ? 5 : 4} style={{ marginBottom: 0 }}>Asset Lifecycle Management</Title>
          {!isMobile && <Text type="secondary">Monitor warranty, EOL, and EOS status of assets</Text>}
        </div>
        <Space size={isMobile ? 'small' : 'middle'}>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExportCSV}
            loading={exportLoading}
            size={isMobile ? 'small' : 'middle'}
          >
            {!isMobile && 'Export CSV'}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => { fetchAssets(); fetchStatistics(); }}
            size={isMobile ? 'small' : 'middle'}
          >
            {!isMobile && 'Refresh'}
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Spin spinning={statsLoading}>
        {renderStatCards()}
      </Spin>

      {/* Main Content Card */}
      <Card bodyStyle={{ padding: isMobile ? '12px' : '24px' }}>
        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size={isMobile ? 'small' : 'middle'}
          style={{ marginBottom: isMobile ? '12px' : '16px' }}
        />

        {/* Filters */}
        <Row gutter={[12, 12]} style={{ marginBottom: isMobile ? '12px' : '16px' }}>
          <Col xs={24} sm={24} md={8}>
            <Input
              placeholder={isMobile ? "Search..." : "Search by asset tag, product name..."}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size={isMobile ? 'small' : 'middle'}
            />
          </Col>
          <Col xs={24} sm={24} md={16}>
            {renderWarrantyFilters()}
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={getResponsiveColumns()}
          dataSource={assets}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: isMobile ? 10 : pagination.pageSize,
            total: pagination.total,
            showSizeChanger: !isMobile,
            showTotal: isMobile ? undefined : (total, range) => `${range[0]}-${range[1]} of ${total} assets`,
            pageSizeOptions: ['10', '20', '50', '100'],
            size: isMobile ? 'small' : 'default'
          }}
          onChange={handleTableChange}
          scroll={{ x: isMobile ? 500 : 1500 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default AssetLifecycle;
