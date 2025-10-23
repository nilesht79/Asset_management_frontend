/**
 * Add to Standby Pool Modal
 * Select assets to add to the standby pool
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Modal,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  message,
  Alert
} from 'antd';
import {
  addToStandbyPool,
  selectStandbyOperationLoading,
  clearOperationError
} from '../../../store/slices/standbySlice';
import {
  fetchAssets,
  selectAssets
} from '../../../store/slices/assetSlice';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

const { Search } = Input;

const AddToStandbyPoolModal = ({ visible, onClose, onSuccess }) => {
  const dispatch = useDispatch();

  // Redux state
  const assetsState = useSelector(selectAssets);
  const assets = assetsState.data || [];
  const assetsLoading = assetsState.loading;
  const operationLoading = useSelector(selectStandbyOperationLoading);

  // Local state
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('available');

  // Fetch available assets when modal opens
  useEffect(() => {
    if (visible) {
      dispatch(
        fetchAssets({
          status: 'available',
          is_standby_asset: false, // Only non-standby assets
          asset_type: 'standalone' // Cannot add components to standby pool
        })
      );
    }
  }, [visible, dispatch]);

  // Reset on close
  useEffect(() => {
    if (!visible) {
      setSelectedAssets([]);
      setSearchText('');
      setStatusFilter('available');
      dispatch(clearOperationError());
    }
  }, [visible, dispatch]);

  // Handle add to pool
  const handleAddToPool = async () => {
    if (selectedAssets.length === 0) {
      message.warning('Please select at least one asset');
      return;
    }

    try {
      // Add each selected asset to the pool
      const promises = selectedAssets.map((assetId) =>
        dispatch(addToStandbyPool(assetId)).unwrap()
      );

      await Promise.all(promises);

      message.success(`Successfully added ${selectedAssets.length} asset(s) to standby pool`);
      onSuccess?.();
      onClose();
    } catch (error) {
      message.error(error || 'Failed to add assets to standby pool');
    }
  };

  // Row selection config
  const rowSelection = {
    selectedRowKeys: selectedAssets,
    onChange: (selectedRowKeys) => {
      setSelectedAssets(selectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.assigned_to !== null // Disable if assigned
    })
  };

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesSearch =
        asset.asset_tag?.toLowerCase().includes(searchLower) ||
        asset.serial_number?.toLowerCase().includes(searchLower) ||
        asset.product_name?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filter by status
    if (statusFilter && asset.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Table columns
  const columns = [
    {
      title: 'Asset Tag',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      width: 150,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
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
            <div style={{ fontSize: '12px', color: '#888' }}>{record.product_model}</div>
          )}
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category_name',
      key: 'category_name',
      width: 120
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors = {
          available: 'green',
          assigned: 'blue',
          maintenance: 'orange'
        };
        return <Tag color={colors[status]}>{status?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Condition',
      dataIndex: 'condition_status',
      key: 'condition_status',
      width: 100,
      render: (condition) => {
        const colors = {
          excellent: 'green',
          good: 'blue',
          fair: 'orange',
          poor: 'red'
        };
        return condition ? (
          <Tag color={colors[condition]}>{condition?.toUpperCase()}</Tag>
        ) : (
          '-'
        );
      }
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <PlusOutlined />
          Add Assets to Standby Pool
        </Space>
      }
      open={visible}
      onCancel={onClose}
      onOk={handleAddToPool}
      confirmLoading={operationLoading}
      width={1000}
      okText={`Add ${selectedAssets.length} Asset(s)`}
      okButtonProps={{ disabled: selectedAssets.length === 0 }}
      cancelText="Cancel"
    >
      {/* Info Alert */}
      <Alert
        message="Select Available Assets"
        description="Only available, standalone (non-component) assets that are not already in the standby pool can be added. Assigned assets cannot be added."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Filters */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="Search by asset tag, serial, product..."
          allowClear
          enterButton={<SearchOutlined />}
          style={{ width: 350 }}
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
        />

        <Select
          placeholder="Status"
          allowClear
          style={{ width: 150 }}
          onChange={(value) => setStatusFilter(value)}
          value={statusFilter}
          options={[
            { value: 'available', label: 'Available' },
            { value: 'maintenance', label: 'Maintenance' }
          ]}
        />

        <span style={{ marginLeft: 16 }}>
          <strong>{selectedAssets.length}</strong> asset(s) selected
        </span>
      </Space>

      {/* Table */}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredAssets}
        rowKey="id"
        loading={assetsLoading}
        scroll={{ y: 400 }}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `Total ${total} assets`
        }}
      />
    </Modal>
  );
};

export default AddToStandbyPoolModal;
