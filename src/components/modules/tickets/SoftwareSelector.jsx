import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Tree,
  Input,
  Empty,
  Spin,
  Tag,
  Badge,
  Tooltip,
  Space,
  Typography
} from 'antd';
import {
  AppstoreOutlined,
  LaptopOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import ticketService from '../../../services/ticket';
import { formatDateOnly } from '../../../utils/dateUtils';

const { Text } = Typography;
const { Search } = Input;

/**
 * SoftwareSelector Component
 * Allows users to select software installed on their assigned assets when creating a ticket
 * Shows software grouped by software name, with each installation on different assets
 */
const SoftwareSelector = ({
  userId,
  selectedSoftware = [],
  onSelectionChange,
  disabled = false,
  maxSelections = null,
  isSelfService = false
}) => {
  const [loading, setLoading] = useState(false);
  const [software, setSoftware] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [expandedKeys, setExpandedKeys] = useState([]);

  useEffect(() => {
    if (isSelfService) {
      fetchSoftware();
    } else if (userId) {
      fetchSoftware(userId);
    }
  }, [userId, isSelfService]);

  const fetchSoftware = async (uid = null) => {
    setLoading(true);
    try {
      const response = isSelfService
        ? await ticketService.getMySoftware()
        : await ticketService.getEmployeeSoftware(uid);

      const data = response.data?.data || response.data;
      setSoftware(data.software || []);

      // Auto-expand all software groups
      const groupKeys = [...new Set((data.software || []).map(s => `software-${s.software_name}`))];
      setExpandedKeys(groupKeys);
    } catch (error) {
      console.error('Failed to fetch software:', error);
      setSoftware([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter software based on search
  const filteredSoftware = useMemo(() => {
    if (!searchText) return software;

    const search = searchText.toLowerCase();
    return software.filter(item =>
      item.software_name?.toLowerCase().includes(search) ||
      item.software_vendor?.toLowerCase().includes(search) ||
      item.asset_tag?.toLowerCase().includes(search) ||
      item.license_key?.toLowerCase().includes(search)
    );
  }, [software, searchText]);

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

  // Build tree data structure - group by software name
  const treeData = useMemo(() => {
    // Group software by name
    const grouped = {};
    filteredSoftware.forEach(item => {
      const key = item.software_name;
      if (!grouped[key]) {
        grouped[key] = {
          software_name: item.software_name,
          software_vendor: item.software_vendor,
          software_version: item.software_version,
          installations: []
        };
      }
      grouped[key].installations.push(item);
    });

    const treeNodes = [];

    Object.values(grouped).forEach(group => {
      const groupKey = `software-${group.software_name}`;

      const children = group.installations.map(install => {
        const isSelected = selectedSoftware.includes(install.installation_id);
        const statusColor = getLicenseStatusColor(install.license_is_active, install.expiration_date);
        const statusText = getLicenseStatusText(install.license_is_active, install.expiration_date);

        return {
          key: install.installation_id,
          title: (
            <Space size="small">
              <Text>
                {install.asset_tag}
              </Text>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                ({install.asset_product_name})
              </Text>
              <Tag
                color={statusColor}
                style={{ fontSize: '10px' }}
              >
                {statusText}
              </Tag>
              {install.expiration_date && (
                <Tooltip title={`Expires: ${formatDateOnly(install.expiration_date)}`}>
                  <Tag icon={<CalendarOutlined />} style={{ fontSize: '10px' }}>
                    {formatDateOnly(install.expiration_date)}
                  </Tag>
                </Tooltip>
              )}
              {isSelected && (
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
              )}
            </Space>
          ),
          icon: <LaptopOutlined />,
          isLeaf: true,
          installation: install
        };
      });

      treeNodes.push({
        key: groupKey,
        title: (
          <Space size="small">
            <Text strong>{group.software_name}</Text>
            {group.software_version && (
              <Text type="secondary" style={{ fontSize: '11px' }}>
                v{group.software_version}
              </Text>
            )}
            {group.software_vendor && (
              <Tag color="purple" style={{ fontSize: '10px' }}>
                {group.software_vendor}
              </Tag>
            )}
            <Badge
              count={group.installations.length}
              style={{ backgroundColor: '#1890ff', fontSize: '10px' }}
              size="small"
            />
          </Space>
        ),
        icon: <AppstoreOutlined />,
        children,
        selectable: false
      });
    });

    return treeNodes;
  }, [filteredSoftware, selectedSoftware]);

  const handleCheck = (checkedKeys) => {
    // Filter out group keys (they start with 'software-')
    const installationKeys = checkedKeys.filter(key => !String(key).startsWith('software-'));

    if (maxSelections && installationKeys.length > maxSelections) {
      return;
    }

    onSelectionChange(installationKeys);
  };

  const handleSelect = (selectedKeys, { node }) => {
    if (disabled) return;
    if (String(node.key).startsWith('software-')) return; // Don't select group nodes

    const installationId = node.key;

    const newSelection = selectedSoftware.includes(installationId)
      ? selectedSoftware.filter(id => id !== installationId)
      : [...selectedSoftware, installationId];

    if (maxSelections && newSelection.length > maxSelections) {
      return;
    }

    onSelectionChange(newSelection);
  };

  if (loading) {
    return (
      <Card size="small">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="Loading software..." />
        </div>
      </Card>
    );
  }

  if (!isSelfService && !userId) {
    return (
      <Card size="small">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Select an employee to see their software"
        />
      </Card>
    );
  }

  if (software.length === 0) {
    return (
      <Card size="small">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No software installed on assigned assets"
        />
      </Card>
    );
  }

  return (
    <Card
      size="small"
      title={
        <Space>
          <AppstoreOutlined />
          <span>Select Related Software</span>
          {selectedSoftware.length > 0 && (
            <Badge
              count={selectedSoftware.length}
              style={{ backgroundColor: '#52c41a' }}
            />
          )}
        </Space>
      }
      extra={
        maxSelections && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {selectedSoftware.length}/{maxSelections} selected
          </Text>
        )
      }
    >
      <Search
        placeholder="Search software by name, vendor, or asset..."
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 12 }}
        prefix={<SearchOutlined />}
      />

      {treeData.length > 0 ? (
        <Tree
          checkable
          disabled={disabled}
          checkedKeys={selectedSoftware}
          expandedKeys={expandedKeys}
          onExpand={setExpandedKeys}
          onCheck={handleCheck}
          treeData={treeData}
          style={{ maxHeight: '300px', overflow: 'auto' }}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No software matches your search"
        />
      )}

      {selectedSoftware.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Selected software:
          </Text>
          <div style={{ marginTop: 4 }}>
            {selectedSoftware.map(installationId => {
              const install = software.find(s => s.installation_id === installationId);
              return install ? (
                <Tag
                  key={installationId}
                  closable={!disabled}
                  onClose={() => {
                    onSelectionChange(selectedSoftware.filter(id => id !== installationId));
                  }}
                  style={{ marginBottom: 4 }}
                >
                  {install.software_name} on {install.asset_tag}
                </Tag>
              ) : null;
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SoftwareSelector;
