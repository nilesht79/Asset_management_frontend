import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Tag,
  Button,
  Empty,
  Spin,
  Space,
  Typography,
  Tooltip,
  Popconfirm,
  message,
  Badge
} from 'antd';
import {
  LaptopOutlined,
  DesktopOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  PlusOutlined,
  HistoryOutlined,
  LinkOutlined
} from '@ant-design/icons';
import ticketService from '../../../services/ticket';

const { Text, Title } = Typography;

/**
 * LinkedAssets Component
 * Displays assets linked to a ticket with options to add/remove
 */
const LinkedAssets = ({
  ticketId,
  canEdit = false,
  onAddAsset,
  showRepairHistory = false,
  onViewRepairHistory
}) => {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    if (ticketId) {
      fetchLinkedAssets();
    }
  }, [ticketId]);

  const fetchLinkedAssets = async () => {
    setLoading(true);
    try {
      const response = await ticketService.getTicketAssets(ticketId);
      const data = response.data?.data || response.data;
      setAssets(data.assets || []);
    } catch (error) {
      console.error('Failed to fetch linked assets:', error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkAsset = async (assetId) => {
    try {
      await ticketService.unlinkAsset(ticketId, assetId);
      message.success('Asset unlinked from ticket');
      fetchLinkedAssets();
    } catch (error) {
      console.error('Failed to unlink asset:', error);
      message.error('Failed to unlink asset');
    }
  };

  const getAssetIcon = (assetType) => {
    switch (assetType) {
      case 'parent':
        return <DesktopOutlined />;
      case 'component':
        return <AppstoreOutlined />;
      default:
        return <LaptopOutlined />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'green',
      assigned: 'blue',
      in_repair: 'orange',
      reserved: 'gold',
      disposed: 'red'
    };
    return colors[status] || 'default';
  };

  const getConditionColor = (condition) => {
    const colors = {
      excellent: 'green',
      good: 'blue',
      fair: 'gold',
      poor: 'orange',
      damaged: 'red'
    };
    return colors[condition] || 'default';
  };

  if (loading) {
    return (
      <Card size="small">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="Loading linked assets..." />
        </div>
      </Card>
    );
  }

  return (
    <Card
      size="small"
      title={
        <Space>
          <LinkOutlined />
          <span>Linked Assets</span>
          <Badge count={assets.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      extra={
        canEdit && onAddAsset && (
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={onAddAsset}
            size="small"
          >
            Add Asset
          </Button>
        )
      }
    >
      {assets.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No assets linked to this ticket"
        />
      ) : (
        <List
          size="small"
          dataSource={assets}
          renderItem={(item) => (
            <List.Item
              key={item.asset_id}
              actions={[
                showRepairHistory && onViewRepairHistory && (
                  <Tooltip title="View Repair History" key="history">
                    <Button
                      type="text"
                      size="small"
                      icon={<HistoryOutlined />}
                      onClick={() => onViewRepairHistory(item.asset_id)}
                    />
                  </Tooltip>
                ),
                canEdit && (
                  <Popconfirm
                    key="unlink"
                    title="Unlink this asset?"
                    description="This will remove the asset from this ticket."
                    onConfirm={() => handleUnlinkAsset(item.asset_id)}
                    okText="Unlink"
                    cancelText="Cancel"
                  >
                    <Tooltip title="Unlink Asset">
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </Popconfirm>
                )
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={
                  <span style={{ fontSize: '20px', color: '#1890ff' }}>
                    {getAssetIcon(item.asset_type)}
                  </span>
                }
                title={
                  <Space size="small">
                    <Text strong>{item.asset_tag}</Text>
                    {item.asset_type === 'component' && item.parent_asset_tag && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        (Part of {item.parent_asset_tag})
                      </Text>
                    )}
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Space size="small" wrap>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.product_name}
                        {item.product_model && ` (${item.product_model})`}
                      </Text>
                      {item.oem_name && (
                        <Tag color="blue" style={{ fontSize: '10px' }}>
                          {item.oem_name}
                        </Tag>
                      )}
                    </Space>
                    <Space size="small" style={{ marginTop: 4 }}>
                      <Tag
                        color={getStatusColor(item.asset_status)}
                        style={{ fontSize: '10px' }}
                      >
                        {item.asset_status}
                      </Tag>
                      {item.condition_status && (
                        <Tag
                          color={getConditionColor(item.condition_status)}
                          style={{ fontSize: '10px' }}
                        >
                          {item.condition_status}
                        </Tag>
                      )}
                      {item.serial_number && (
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          S/N: {item.serial_number}
                        </Text>
                      )}
                    </Space>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}

      {assets.length > 0 && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid #f0f0f0',
            fontSize: '12px',
            color: '#8c8c8c'
          }}
        >
          {assets.length} asset{assets.length !== 1 ? 's' : ''} linked to this
          ticket
        </div>
      )}
    </Card>
  );
};

export default LinkedAssets;
