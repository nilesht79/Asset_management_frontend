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
  AppstoreOutlined,
  LaptopOutlined,
  DeleteOutlined,
  CalendarOutlined,
  LinkOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import ticketService from '../../../services/ticket';
import { formatDateOnly } from '../../../utils/dateUtils';

const { Text } = Typography;

/**
 * LinkedSoftware Component
 * Displays software installations linked to a ticket with options to remove
 */
const LinkedSoftware = ({
  ticketId,
  canEdit = false
}) => {
  const [loading, setLoading] = useState(false);
  const [software, setSoftware] = useState([]);

  useEffect(() => {
    if (ticketId) {
      fetchLinkedSoftware();
    }
  }, [ticketId]);

  const fetchLinkedSoftware = async () => {
    setLoading(true);
    try {
      const response = await ticketService.getTicketSoftware(ticketId);
      const data = response.data?.data || response.data;
      setSoftware(data.software || []);
    } catch (error) {
      console.error('Failed to fetch linked software:', error);
      setSoftware([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkSoftware = async (installationId) => {
    try {
      await ticketService.unlinkSoftware(ticketId, installationId);
      message.success('Software unlinked from ticket');
      fetchLinkedSoftware();
    } catch (error) {
      console.error('Failed to unlink software:', error);
      message.error('Failed to unlink software');
    }
  };

  const getLicenseStatusColor = (isActive, expirationDate) => {
    if (!isActive) return 'default';
    if (expirationDate) {
      const expDate = new Date(expirationDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 0) return 'red';
      if (daysUntilExpiry <= 30) return 'orange';
    }
    return 'green';
  };

  const getLicenseStatusText = (isActive, expirationDate) => {
    if (!isActive) return 'Inactive';
    if (expirationDate) {
      const expDate = new Date(expirationDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry < 0) return 'Expired';
      if (daysUntilExpiry <= 30) return 'Expiring Soon';
    }
    return 'Active';
  };

  if (loading) {
    return (
      <Card size="small">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="Loading linked software..." />
        </div>
      </Card>
    );
  }

  return (
    <Card
      size="small"
      title={
        <Space>
          <AppstoreOutlined />
          <span>Linked Software</span>
          <Badge count={software.length} style={{ backgroundColor: '#722ed1' }} />
        </Space>
      }
    >
      {software.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No software linked to this ticket"
        />
      ) : (
        <List
          size="small"
          dataSource={software}
          renderItem={(item) => {
            const statusColor = getLicenseStatusColor(item.license_is_active, item.expiration_date);
            const statusText = getLicenseStatusText(item.license_is_active, item.expiration_date);

            return (
              <List.Item
                key={item.installation_id}
                actions={[
                  canEdit && (
                    <Popconfirm
                      key="unlink"
                      title="Unlink this software?"
                      description="This will remove the software from this ticket."
                      onConfirm={() => handleUnlinkSoftware(item.installation_id)}
                      okText="Unlink"
                      cancelText="Cancel"
                    >
                      <Tooltip title="Unlink Software">
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
                    <span style={{ fontSize: '20px', color: '#722ed1' }}>
                      <AppstoreOutlined />
                    </span>
                  }
                  title={
                    <Space size="small">
                      <Text strong>{item.software_name}</Text>
                      {item.software_version && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          v{item.software_version}
                        </Text>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Space size="small" wrap>
                        {item.software_vendor && (
                          <Tag color="purple" style={{ fontSize: '10px' }}>
                            {item.software_vendor}
                          </Tag>
                        )}
                        <Space size={4}>
                          <LaptopOutlined style={{ fontSize: '11px', color: '#8c8c8c' }} />
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {item.asset_tag}
                          </Text>
                          {item.asset_product_name && (
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                              ({item.asset_product_name})
                            </Text>
                          )}
                        </Space>
                      </Space>
                      <Space size="small" style={{ marginTop: 4 }}>
                        <Tag
                          icon={<SafetyCertificateOutlined />}
                          color={statusColor}
                          style={{ fontSize: '10px' }}
                        >
                          {statusText}
                        </Tag>
                        {item.expiration_date && (
                          <Tooltip title={`License expires: ${formatDateOnly(item.expiration_date)}`}>
                            <Tag icon={<CalendarOutlined />} style={{ fontSize: '10px' }}>
                              {formatDateOnly(item.expiration_date)}
                            </Tag>
                          </Tooltip>
                        )}
                        {item.installation_date && (
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            Installed: {formatDateOnly(item.installation_date)}
                          </Text>
                        )}
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}

      {software.length > 0 && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid #f0f0f0',
            fontSize: '12px',
            color: '#8c8c8c'
          }}
        >
          {software.length} software installation{software.length !== 1 ? 's' : ''} linked to this
          ticket
        </div>
      )}
    </Card>
  );
};

export default LinkedSoftware;
