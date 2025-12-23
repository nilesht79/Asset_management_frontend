import React, { useEffect, useState } from 'react';
import { Modal, Table, Input, Select, Space, Tag, Button, message, Empty, Alert, Collapse, Row, Col } from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import './AssetSelectionModal.css';

const { Option } = Select;
const { Panel } = Collapse;

const AssetSelectionModal = ({
  visible,
  onCancel,
  onSelect,
  requisition
}) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'available',
    category_id: undefined,
    product_type_id: undefined,
    product_id: undefined
  });

  // Dropdown options
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Initialize filters from requisition when modal opens
  useEffect(() => {
    if (visible) {
      // Auto-populate filters from requisition requirements
      setFilters({
        search: '',
        status: 'available',
        category_id: requisition?.asset_category_id || undefined,
        product_type_id: requisition?.product_type_id || undefined,
        product_id: requisition?.requested_product_id || undefined
      });
      loadFilterOptions();
    }
  }, [visible, requisition]);

  useEffect(() => {
    if (visible) {
      loadAvailableAssets();
    }
  }, [filters]);

  // Load filter dropdown options
  const loadFilterOptions = async () => {
    try {
      setLoadingOptions(true);
      const [catRes, ptRes, prodRes] = await Promise.all([
        api.get('/masters/categories', { params: { limit: 1000 } }),
        api.get('/masters/product-types', { params: { limit: 1000 } }),
        api.get('/masters/products', { params: { limit: 1000 } })
      ]);

      setCategories(catRes.data.data?.categories || catRes.data.categories || catRes.data.data || []);
      setProductTypes(ptRes.data.data?.productTypes || ptRes.data.productTypes || ptRes.data.data || []);
      setProducts(prodRes.data.data?.products || prodRes.data.products || prodRes.data.data || []);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadAvailableAssets = async () => {
    try {
      setLoading(true);

      const params = {
        status: 'available',
        limit: 100
      };

      // Apply filters (auto-populated from requisition requirements)
      if (filters.search) params.search = filters.search;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.product_type_id) params.product_type_id = filters.product_type_id;
      if (filters.product_id) params.product_id = filters.product_id;

      const response = await api.get('/assets', { params });
      const assetsData = response.data.data?.assets || response.data.assets || [];
      setAssets(Array.isArray(assetsData) ? assetsData : []);
    } catch (error) {
      console.error('Failed to load assets:', error);
      message.error('Failed to load available assets');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleClearFilters = () => {
    // Only reset search and product (category and product type are locked from requisition)
    setFilters({
      ...filters,
      search: '',
      product_id: undefined
    });
  };

  const handleRowClick = (record) => {
    setSelectedAsset(record);
  };

  const handleConfirm = () => {
    if (!selectedAsset) {
      message.warning('Please select an asset');
      return;
    }
    onSelect(selectedAsset);
    setSelectedAsset(null);
  };

  const handleCancel = () => {
    setSelectedAsset(null);
    onCancel();
  };

  const columns = [
    {
      title: 'Asset Tag',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      width: 150,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 150
    },
    {
      title: 'Product Type',
      dataIndex: 'product_type_name',
      key: 'product_type_name',
      width: 150
    },
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      width: 200,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          {record.product_model && (
            <div style={{ fontSize: 12, color: '#666' }}>
              Model: {record.product_model}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
      width: 150,
      render: (text) => text || 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusConfig = {
          available: { color: 'green', label: 'Available' },
          in_use: { color: 'blue', label: 'In Use' },
          maintenance: { color: 'orange', label: 'Maintenance' },
          retired: { color: 'red', label: 'Retired' }
        };
        const config = statusConfig[status] || statusConfig.available;
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    }
  ];

  return (
    <Modal
      title="Select Asset to Assign"
      open={visible}
      onCancel={handleCancel}
      onOk={handleConfirm}
      width={1200}
      okText="Assign Selected Asset"
      okButtonProps={{
        disabled: !selectedAsset,
        icon: <CheckCircleOutlined />
      }}
      className="asset-selection-modal"
    >
      {/* Requisition Requirements - Always visible */}
      <Collapse
        ghost
        defaultActiveKey={['1']}
        style={{ marginBottom: 16, background: '#f0f7ff', borderRadius: 8 }}
      >
        <Panel
          header={
            <span>
              <InfoCircleOutlined style={{ marginRight: 8 }} />
              Requisition Requirements
            </span>
          }
          key="1"
        >
          <Row gutter={16}>
            <Col span={12}>
              <div><strong>Requester:</strong> {requisition?.requester_name || 'N/A'}</div>
              <div><strong>Department:</strong> {requisition?.department_name || 'N/A'}</div>
              <div><strong>Quantity:</strong> {requisition?.quantity || 1}</div>
            </Col>
            <Col span={12}>
              {requisition?.category_name && <div><strong>Requested Category:</strong> {requisition?.category_name}</div>}
              {requisition?.product_type_name && <div><strong>Requested Type:</strong> {requisition?.product_type_name}</div>}
              {requisition?.product_name && <div><strong>Preferred Product:</strong> {requisition?.product_name}</div>}
            </Col>
          </Row>
        </Panel>
      </Collapse>

      {/* Info about filtering */}
      <Alert
        message="Assets are filtered based on the requisition's category and product type requirements."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Filters */}
      <div style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Search asset tag / serial"
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Category"
              value={filters.category_id}
              onChange={(value) => handleFilterChange('category_id', value)}
              style={{ width: '100%' }}
              disabled={!!requisition?.asset_category_id}
              showSearch
              optionFilterProp="children"
              loading={loadingOptions}
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Product Type"
              value={filters.product_type_id}
              onChange={(value) => handleFilterChange('product_type_id', value)}
              style={{ width: '100%' }}
              disabled={!!requisition?.product_type_id}
              showSearch
              optionFilterProp="children"
              loading={loadingOptions}
            >
              {productTypes.map(pt => (
                <Option key={pt.id} value={pt.id}>{pt.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="Product"
              value={filters.product_id}
              onChange={(value) => handleFilterChange('product_id', value)}
              style={{ width: '100%' }}
              allowClear
              showSearch
              optionFilterProp="children"
              loading={loadingOptions}
            >
              {products.map(p => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={3}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleClearFilters}
              block
            >
              Reset
            </Button>
          </Col>
        </Row>
      </div>

      {/* Assets Table */}
      <Table
        columns={columns}
        dataSource={assets}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} assets`
        }}
        scroll={{ x: 1000 }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: selectedAsset?.id === record.id ? 'selected-row' : '',
          style: { cursor: 'pointer' }
        })}
        locale={{
          emptyText: (
            <Empty
              description="No available assets found matching the criteria"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <p>Try adjusting the filters or check if assets are available in inventory.</p>
            </Empty>
          )
        }}
      />

      {selectedAsset && (
        <Alert
          message="Selected Asset"
          description={
            <div>
              <Tag color="blue">{selectedAsset.asset_tag}</Tag> - {selectedAsset.product_name}
              {selectedAsset.product_model && ` (${selectedAsset.product_model})`}
            </div>
          }
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginTop: 16 }}
        />
      )}
    </Modal>
  );
};

export default AssetSelectionModal;
