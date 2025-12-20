import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  message,
  Empty,
  Row,
  Col,
  Statistic,
  Button,
  Input,
  Tooltip,
  Descriptions,
  Drawer
} from 'antd';
import {
  LaptopOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CustomerServiceOutlined,
  ApiOutlined,
  DesktopOutlined,
  DownOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import assetService from '../services/asset';

const { Title, Text } = Typography;
const { Search } = Input;

const MyAssets = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [allAssets, setAllAssets] = useState([]); // Raw assets including components
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  useEffect(() => {
    loadAssets();
  }, []);

  // Process assets to organize hierarchy and apply search filter
  useEffect(() => {
    if (!allAssets.length) {
      setFilteredAssets([]);
      return;
    }

    // Separate parent/standalone assets from components
    const parentAssets = allAssets.filter(a => !a.is_component && a.asset_type !== 'component');
    const components = allAssets.filter(a => a.is_component || a.asset_type === 'component');

    // Create a map of parent_asset_id to components
    const componentMap = {};
    components.forEach(comp => {
      const parentId = comp.parent_asset_id;
      if (parentId) {
        if (!componentMap[parentId]) {
          componentMap[parentId] = [];
        }
        componentMap[parentId].push(comp);
      }
    });

    // Attach components to parent assets
    const assetsWithComponents = parentAssets.map(asset => ({
      ...asset,
      components: componentMap[asset.id] || [],
      hasComponents: (componentMap[asset.id] || []).length > 0
    }));

    // Apply search filter
    let filtered = assetsWithComponents;
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = assetsWithComponents.filter(asset => {
        // Check parent asset
        const matchesParent =
          asset.asset_tag?.toLowerCase().includes(searchLower) ||
          asset.product_name?.toLowerCase().includes(searchLower) ||
          asset.serial_number?.toLowerCase().includes(searchLower) ||
          asset.category_name?.toLowerCase().includes(searchLower);

        // Check components
        const matchesComponent = asset.components?.some(comp =>
          comp.asset_tag?.toLowerCase().includes(searchLower) ||
          comp.product_name?.toLowerCase().includes(searchLower) ||
          comp.serial_number?.toLowerCase().includes(searchLower) ||
          comp.category_name?.toLowerCase().includes(searchLower)
        );

        return matchesParent || matchesComponent;
      });
    }

    setAssets(assetsWithComponents);
    setFilteredAssets(filtered);
  }, [searchText, allAssets]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await assetService.getMyAssets();
      const assetData = response.data?.data?.assets || response.data?.assets || [];
      setAllAssets(assetData);
    } catch (error) {
      message.error('Failed to load assets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      assigned: { color: 'green', text: 'Assigned' },
      in_use: { color: 'blue', text: 'In Use' },
      available: { color: 'cyan', text: 'Available' },
      maintenance: { color: 'orange', text: 'Maintenance' },
      faulty: { color: 'red', text: 'Faulty' }
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getConditionTag = (condition) => {
    const conditionConfig = {
      excellent: { color: 'green', text: 'Excellent' },
      good: { color: 'blue', text: 'Good' },
      fair: { color: 'orange', text: 'Fair' },
      poor: { color: 'red', text: 'Poor' }
    };
    const config = conditionConfig[condition] || { color: 'default', text: condition || 'Unknown' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const handleViewAsset = (asset) => {
    setSelectedAsset(asset);
    setDrawerVisible(true);
  };

  const handleReportIssue = (asset) => {
    navigate('/create-ticket', { state: { asset } });
  };

  // Render component table inside expanded row
  const expandedRowRender = (record) => {
    if (!record.components || record.components.length === 0) {
      return null;
    }

    const componentColumns = [
      {
        title: 'Component',
        dataIndex: 'asset_tag',
        key: 'asset_tag',
        render: (text) => (
          <Space>
            <ApiOutlined style={{ color: '#52c41a' }} />
            <Text strong code>{text}</Text>
          </Space>
        )
      },
      {
        title: 'Product',
        dataIndex: 'product_name',
        key: 'product_name',
        render: (text, comp) => (
          <Space direction="vertical" size={0}>
            <Text>{text}</Text>
            {comp.product_model && (
              <Text type="secondary" style={{ fontSize: 12 }}>{comp.product_model}</Text>
            )}
          </Space>
        )
      },
      {
        title: 'Category',
        dataIndex: 'category_name',
        key: 'category_name',
        render: (text) => <Tag color="green">{text}</Tag>
      },
      {
        title: 'Serial Number',
        dataIndex: 'serial_number',
        key: 'serial_number',
        render: (text) => text || '-'
      },
      {
        title: 'Condition',
        dataIndex: 'condition_status',
        key: 'condition_status',
        render: (condition) => getConditionTag(condition)
      },
      {
        title: 'Actions',
        key: 'actions',
        width: 120,
        render: (_, comp) => (
          <Space>
            <Tooltip title="View Details">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewAsset(comp)}
              />
            </Tooltip>
            <Tooltip title="Report Issue">
              <Button
                type="text"
                size="small"
                icon={<CustomerServiceOutlined />}
                onClick={() => handleReportIssue(comp)}
              />
            </Tooltip>
          </Space>
        )
      }
    ];

    return (
      <div style={{ margin: '8px 0', padding: '12px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ApiOutlined style={{ color: '#52c41a' }} />
          <Text strong style={{ color: '#52c41a' }}>
            Installed Components ({record.components.length})
          </Text>
        </div>
        <Table
          columns={componentColumns}
          dataSource={record.components}
          rowKey="id"
          pagination={false}
          size="small"
          showHeader={true}
        />
      </div>
    );
  };

  const columns = [
    {
      title: 'Asset Tag',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      render: (text, record) => (
        <Space>
          {record.hasComponents ? (
            <DesktopOutlined style={{ color: '#1890ff' }} />
          ) : (
            <LaptopOutlined style={{ color: '#595959' }} />
          )}
          <Text strong code>{text}</Text>
          {record.hasComponents && (
            <Tag color="blue" style={{ fontSize: 11 }}>
              {record.components.length} component{record.components.length > 1 ? 's' : ''}
            </Tag>
          )}
        </Space>
      ),
      sorter: (a, b) => (a.asset_tag || '').localeCompare(b.asset_tag || '')
    },
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.product_model && (
            <Text type="secondary" style={{ fontSize: 12 }}>{record.product_model}</Text>
          )}
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      render: (text) => text || '-'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Assigned', value: 'assigned' },
        { text: 'In Use', value: 'in_use' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: 'Condition',
      dataIndex: 'condition_status',
      key: 'condition_status',
      render: (condition) => getConditionTag(condition)
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewAsset(record)}
            />
          </Tooltip>
          <Tooltip title="Report Issue">
            <Button
              type="text"
              icon={<CustomerServiceOutlined />}
              onClick={() => handleReportIssue(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Calculate stats (including components)
  const totalComponents = assets.reduce((sum, a) => sum + (a.components?.length || 0), 0);
  const stats = {
    total: assets.length,
    components: totalComponents,
    assigned: assets.filter(a => a.status === 'assigned').length,
    good: allAssets.filter(a => ['excellent', 'good'].includes(a.condition_status)).length
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
          <LaptopOutlined style={{ marginRight: 12 }} />
          My Assets
        </Title>
        <Text type="secondary">
          View all assets assigned to you
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Assets"
              value={stats.total}
              prefix={<LaptopOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Assigned"
              value={stats.assigned}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Components"
              value={stats.components}
              prefix={<ApiOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false}>
            <Statistic
              title="Good Condition"
              value={stats.good}
              prefix={<CheckCircleOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card bordered={false}>
        {/* Toolbar */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder="Search assets..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            prefix={<SearchOutlined />}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={loadAssets}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<CustomerServiceOutlined />}
            onClick={() => navigate('/create-ticket')}
          >
            Report Issue
          </Button>
        </Space>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredAssets}
          rowKey="id"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} assets`
          }}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys(keys),
            rowExpandable: (record) => record.hasComponents,
            expandIcon: ({ expanded, onExpand, record }) =>
              record.hasComponents ? (
                <Button
                  type="text"
                  size="small"
                  icon={expanded ? <DownOutlined /> : <RightOutlined />}
                  onClick={(e) => onExpand(record, e)}
                  style={{ marginRight: 8 }}
                />
              ) : (
                <span style={{ width: 32, display: 'inline-block' }} />
              )
          }}
          locale={{
            emptyText: (
              <Empty
                description="No assets assigned to you"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
        />
      </Card>

      {/* Asset Details Drawer */}
      <Drawer
        title="Asset Details"
        placement="right"
        width={480}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setSelectedAsset(null);
        }}
        extra={
          <Button
            type="primary"
            icon={<CustomerServiceOutlined />}
            onClick={() => {
              setDrawerVisible(false);
              handleReportIssue(selectedAsset);
            }}
          >
            Report Issue
          </Button>
        }
      >
        {selectedAsset && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Asset Tag">
              <Space>
                {(selectedAsset.is_component || selectedAsset.asset_type === 'component') ? (
                  <ApiOutlined style={{ color: '#52c41a' }} />
                ) : selectedAsset.hasComponents ? (
                  <DesktopOutlined style={{ color: '#1890ff' }} />
                ) : (
                  <LaptopOutlined style={{ color: '#595959' }} />
                )}
                <Text strong code>{selectedAsset.asset_tag}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Asset Type">
              <Tag color={
                (selectedAsset.is_component || selectedAsset.asset_type === 'component') ? 'green' :
                selectedAsset.asset_type === 'parent' || selectedAsset.hasComponents ? 'blue' : 'default'
              }>
                {(selectedAsset.is_component || selectedAsset.asset_type === 'component') ? 'COMPONENT' :
                  selectedAsset.asset_type === 'parent' || selectedAsset.hasComponents ? 'PARENT' : 'STANDALONE'}
              </Tag>
            </Descriptions.Item>
            {(selectedAsset.is_component || selectedAsset.asset_type === 'component') && selectedAsset.parent_asset_tag && (
              <Descriptions.Item label="Parent Asset">
                <Space>
                  <DesktopOutlined style={{ color: '#1890ff' }} />
                  <Text code>{selectedAsset.parent_asset_tag}</Text>
                </Space>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Serial Number">
              {selectedAsset.serial_number || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Product">
              {selectedAsset.product_name}
            </Descriptions.Item>
            <Descriptions.Item label="Model">
              {selectedAsset.product_model || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              <Tag>{selectedAsset.category_name}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="OEM">
              {selectedAsset.oem_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Product Type">
              {selectedAsset.product_type_name || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedAsset.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Condition">
              {getConditionTag(selectedAsset.condition_status)}
            </Descriptions.Item>
            {selectedAsset.hasComponents && selectedAsset.components?.length > 0 && (
              <Descriptions.Item label="Components">
                <Space direction="vertical" size={4}>
                  {selectedAsset.components.map(comp => (
                    <Tag key={comp.id} color="green" icon={<ApiOutlined />}>
                      {comp.asset_tag} - {comp.product_name}
                    </Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default MyAssets;
