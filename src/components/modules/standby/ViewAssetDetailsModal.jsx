/**
 * View Asset Details Modal
 * Display detailed information about a standby asset
 */

import React from 'react';
import { Modal, Descriptions, Tag, Space, Divider } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const ViewAssetDetailsModal = ({ visible, onClose, asset }) => {
  if (!asset) return null;

  const getStatusColor = (status) => {
    const colors = {
      available: 'green',
      assigned: 'blue',
      maintenance: 'orange',
      retired: 'red'
    };
    return colors[status] || 'default';
  };

  const getConditionColor = (condition) => {
    const colors = {
      excellent: 'green',
      good: 'blue',
      fair: 'orange',
      poor: 'red'
    };
    return colors[condition] || 'default';
  };

  return (
    <Modal
      title={
        <Space>
          <EyeOutlined />
          <span>Asset Details</span>
          {asset.asset_tag && <Tag color="blue">{asset.asset_tag}</Tag>}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      {/* Basic Information */}
      <Divider orientation="left">Basic Information</Divider>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Asset Tag" span={1}>
          <strong>{asset.asset_tag}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Serial Number" span={1}>
          {asset.serial_number || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Product" span={2}>
          {asset.product_name}
          {asset.product_model && ` (${asset.product_model})`}
        </Descriptions.Item>
        <Descriptions.Item label="Category" span={1}>
          {asset.category_name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Product Type" span={1}>
          {asset.product_type || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="OEM" span={1}>
          {asset.oem_name || 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Status" span={1}>
          <Tag color={getStatusColor(asset.status)}>
            {asset.status?.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Condition" span={2}>
          {asset.condition_status ? (
            <Tag color={getConditionColor(asset.condition_status)}>
              {asset.condition_status?.toUpperCase()}
            </Tag>
          ) : (
            'N/A'
          )}
        </Descriptions.Item>
      </Descriptions>

      {/* Standby Information */}
      <Divider orientation="left">Standby Asset Information</Divider>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Is Standby Asset" span={1}>
          <Tag color={asset.is_standby_asset ? 'green' : 'default'}>
            {asset.is_standby_asset ? 'YES' : 'NO'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Available for Assignment" span={1}>
          <Tag color={asset.standby_available ? 'green' : 'orange'}>
            {asset.standby_available ? 'AVAILABLE' : 'ASSIGNED'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Currently Assigned To" span={2}>
          {asset.assigned_to_name ? (
            <div>
              <strong>{asset.assigned_to_name}</strong>
              <br />
              <span style={{ fontSize: '12px', color: '#888' }}>
                {asset.assigned_to_email}
              </span>
            </div>
          ) : (
            'Not assigned'
          )}
        </Descriptions.Item>
        {asset.current_assignment && (
          <>
            <Descriptions.Item label="Active Assignment User" span={1}>
              {asset.current_assignment.name}
            </Descriptions.Item>
            <Descriptions.Item label="Assigned Date" span={1}>
              {dayjs(asset.current_assignment.assigned_date).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Assignment Reason" span={2}>
              {asset.current_assignment.reason}
            </Descriptions.Item>
          </>
        )}
      </Descriptions>

      {/* Specifications */}
      {(asset.capacity_value || asset.speed_value) && (
        <>
          <Divider orientation="left">Specifications</Divider>
          <Descriptions bordered column={2} size="small">
            {asset.capacity_value && (
              <Descriptions.Item label="Capacity" span={1}>
                {asset.capacity_value} {asset.capacity_unit}
              </Descriptions.Item>
            )}
            {asset.speed_value && (
              <Descriptions.Item label="Speed" span={1}>
                {asset.speed_value} {asset.speed_unit}
              </Descriptions.Item>
            )}
          </Descriptions>
        </>
      )}

      {/* Purchase Information */}
      {(asset.purchase_date || asset.purchase_cost || asset.warranty_end_date) && (
        <>
          <Divider orientation="left">Purchase Information</Divider>
          <Descriptions bordered column={2} size="small">
            {asset.purchase_date && (
              <Descriptions.Item label="Purchase Date" span={1}>
                {dayjs(asset.purchase_date).format('YYYY-MM-DD')}
              </Descriptions.Item>
            )}
            {asset.purchase_cost && (
              <Descriptions.Item label="Purchase Cost" span={1}>
                ${asset.purchase_cost.toLocaleString()}
              </Descriptions.Item>
            )}
            {asset.warranty_end_date && (
              <Descriptions.Item label="Warranty End Date" span={2}>
                {dayjs(asset.warranty_end_date).format('YYYY-MM-DD')}
                {dayjs().isAfter(dayjs(asset.warranty_end_date)) && (
                  <Tag color="red" style={{ marginLeft: 8 }}>
                    EXPIRED
                  </Tag>
                )}
              </Descriptions.Item>
            )}
          </Descriptions>
        </>
      )}

      {/* Timestamps */}
      <Divider orientation="left">Record Information</Divider>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Created At" span={1}>
          {asset.created_at ? dayjs(asset.created_at).format('YYYY-MM-DD HH:mm') : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Updated At" span={1}>
          {asset.updated_at ? dayjs(asset.updated_at).format('YYYY-MM-DD HH:mm') : 'N/A'}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewAssetDetailsModal;
