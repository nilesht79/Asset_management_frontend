import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Checkbox,
  Row,
  Col,
  Typography,
  Alert,
  Statistic,
  Divider,
  notification,
  Input,
  Select,
  Spin,
  Collapse,
  Badge,
  Tooltip,
  Popconfirm,
  DatePicker,
  Timeline,
  Empty,
  Switch,
  Drawer
} from 'antd';
import {
  UserOutlined,
  SecurityScanOutlined,
  TeamOutlined,
  SaveOutlined,
  ReloadOutlined,
  HistoryOutlined,
  LockOutlined,
  UnlockOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  SwapOutlined,
  AuditOutlined,
  FilterOutlined,
  ClearOutlined,
  DownOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { usePermissions } from '../hooks/usePermissions';
import permissionService from '../services/permissions';
import { formatLocalDateTime } from '../utils/dateUtils';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Search } = Input;
const { Panel } = Collapse;
const { TextArea } = Input;

const SuperAdminPermissions = () => {
  const { isSuperAdmin } = usePermissions();

  // State
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [categories, setCategories] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('roles');

  // Modal states
  const [editRoleModal, setEditRoleModal] = useState(false);
  const [userPermModal, setUserPermModal] = useState(false);
  const [auditModal, setAuditModal] = useState(false);
  const [categoryEditModal, setCategoryEditModal] = useState(false);

  // Form states
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();
  const [userSearchForm] = Form.useForm();
  const [categoryForm] = Form.useForm();

  // User permission management
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ visible: false, permission: null, action: null });

  // Pagination and Filters
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPagination, setAuditPagination] = useState({ page: 1, limit: 3, total: 0, pages: 0 });
  const [auditFilters, setAuditFilters] = useState({
    actionType: null,
    targetType: null,
    dateRange: null
  });
  const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);
  const [displayedLogs, setDisplayedLogs] = useState([]);

  // ================================================
  // DATA FETCHING
  // ================================================

  useEffect(() => {
    if (isSuperAdmin()) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRoles(),
        loadPermissions(),
        loadCategories(),
        loadAnalytics()
      ]);
    } catch (error) {
      notification.error({
        message: 'Error Loading Data',
        description: error.message || 'Failed to load permission data'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    const response = await permissionService.getRoles();
    if (response.data.success) {
      setRoles(response.data.data);
    }
  };

  const loadPermissions = async () => {
    const response = await permissionService.getAllPermissions();
    if (response.data.success) {
      setPermissions(response.data.data);
    }
  };

  const loadCategories = async () => {
    const response = await permissionService.getCategories();
    if (response.data.success) {
      setCategories(response.data.data);
    }
  };

  const loadAnalytics = async () => {
    const response = await permissionService.getRoleDistribution();
    if (response.data.success) {
      setAnalytics(response.data.data);
    }
  };

  const loadAuditLogs = async (page = 1, filters = {}, append = false) => {
    setLoading(true);
    try {
      // Build filter object for API
      const apiFilters = {};
      if (filters.actionType) apiFilters.actionType = filters.actionType;
      if (filters.targetType) apiFilters.targetType = filters.targetType;
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        apiFilters.startDate = filters.dateRange[0].toISOString();
        apiFilters.endDate = filters.dateRange[1].toISOString();
      }

      const response = await permissionService.getAuditLogs(apiFilters, page, 3);
      console.log('📋 Audit Logs Response:', response.data);

      if (response.data.success) {
        const newLogs = response.data.data || [];

        if (append) {
          // Append to existing logs for "Show More"
          setAuditLogs(prev => [...prev, ...newLogs]);
          setDisplayedLogs(prev => [...prev, ...newLogs]);
        } else {
          // Replace logs for fresh load/filter
          setAuditLogs(newLogs);
          setDisplayedLogs(newLogs);
        }

        setAuditPagination(response.data.pagination || { page: 1, limit: 3, total: 0, pages: 0 });
        setAuditTotal(response.data.pagination?.total || 0);
        setAuditPage(page);
      }
    } catch (error) {
      console.error('❌ Error loading audit logs:', error);
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || 'Failed to load audit logs'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowMore = () => {
    const nextPage = auditPage + 1;
    loadAuditLogs(nextPage, auditFilters, true);
  };

  const handleApplyFilters = (values) => {
    const newFilters = {
      actionType: values.actionType || null,
      targetType: values.targetType || null,
      dateRange: values.dateRange || null
    };

    setAuditFilters(newFilters);
    setAuditPage(1);
    loadAuditLogs(1, newFilters, false);
    setFilterDrawerVisible(false);
  };

  const handleClearFilters = () => {
    setAuditFilters({
      actionType: null,
      targetType: null,
      dateRange: null
    });
    setAuditPage(1);
    loadAuditLogs(1, {}, false);
    setFilterDrawerVisible(false);
  };

  const loadUserPermissions = async (userId) => {
    setLoading(true);
    try {
      const response = await permissionService.getUserPermissions(userId);
      if (response.data.success) {
        setUserPermissions(response.data.data);
        setSelectedUser(response.data.data.user);
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to load user permissions'
      });
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // ROLE MANAGEMENT HANDLERS
  // ================================================

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions || []);
    setEditRoleModal(true);
  };

  const handleEditCategory = (categoryData, role) => {
    setSelectedCategory(categoryData);
    setSelectedRole(role);

    // Get current role's permissions that belong to this category
    const categoryPermKeys = categoryData.permissions.map(p => p.key);
    const rolePerms = role.permissions || [];
    const currentCategoryPerms = rolePerms.filter(p => categoryPermKeys.includes(p));

    setSelectedPermissions(currentCategoryPerms);
    setCategoryEditModal(true);
  };

  const handleSaveCategoryPermissions = async (values) => {
    setLoading(true);
    try {
      // Get all current role permissions
      const allRolePermissions = selectedRole.permissions || [];

      // Remove all permissions from this category
      const categoryPermKeys = selectedCategory.permissions.map(p => p.key);
      const otherCategoryPerms = allRolePermissions.filter(p => !categoryPermKeys.includes(p));

      // Add back the selected permissions from this category
      const updatedPermissions = [...otherCategoryPerms, ...selectedPermissions];

      await permissionService.updateRolePermissions(
        selectedRole.key,
        updatedPermissions,
        values.reason
      );

      notification.success({
        message: 'Success',
        description: `${selectedCategory.title} permissions updated for ${selectedRole.name}`
      });

      setCategoryEditModal(false);
      categoryForm.resetFields();
      // Restore body scroll
      document.body.style.overflow = 'auto';
      await loadRoles();
      await loadAnalytics();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || 'Failed to update permissions'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRolePermissions = async (values) => {
    setLoading(true);
    try {
      await permissionService.updateRolePermissions(
        selectedRole.key,
        selectedPermissions,
        values.reason
      );

      notification.success({
        message: 'Success',
        description: `Role "${selectedRole.name}" permissions updated successfully`
      });

      setEditRoleModal(false);
      form.resetFields();
      await loadRoles();
      await loadAnalytics();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || 'Failed to update role permissions'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionToggle = (permissionKey, checked) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionKey]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permissionKey));
    }
  };

  const handleCategoryToggle = (categoryKey, checked) => {
    const categoryPermissions = categories[categoryKey]?.permissions.map(p => p.key) || [];

    if (checked) {
      // Add all category permissions
      setSelectedPermissions([...new Set([...selectedPermissions, ...categoryPermissions])]);
    } else {
      // Remove all category permissions
      setSelectedPermissions(selectedPermissions.filter(p => !categoryPermissions.includes(p)));
    }
  };

  // ================================================
  // USER PERMISSION HANDLERS
  // ================================================

  const handleGrantPermission = async (values) => {
    setLoading(true);
    try {
      await permissionService.grantPermission(
        selectedUser.id,
        values.permissionKey,
        values.reason,
        values.expiresAt ? values.expiresAt.toISOString() : null
      );

      notification.success({
        message: 'Success',
        description: 'Permission granted successfully'
      });

      await loadUserPermissions(selectedUser.id);
      userSearchForm.resetFields();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || 'Failed to grant permission'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokePermission = async (permissionKey, reason) => {
    setLoading(true);
    try {
      await permissionService.revokePermission(selectedUser.id, permissionKey, reason);

      notification.success({
        message: 'Success',
        description: 'Permission revoked successfully'
      });

      await loadUserPermissions(selectedUser.id);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || 'Failed to revoke permission'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetUserPermissions = async (userId) => {
    setLoading(true);
    try {
      await permissionService.resetUserPermissions(userId);

      notification.success({
        message: 'Success',
        description: 'All custom permissions removed. User now has role default permissions.'
      });

      await loadUserPermissions(userId);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || 'Failed to reset permissions'
      });
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // UTILITY HANDLERS
  // ================================================

  const handleClearCache = async (type = 'all', identifier = null) => {
    setLoading(true);
    try {
      await permissionService.clearCache(
        type === 'user' ? identifier : null,
        type === 'role' ? identifier : null
      );

      notification.success({
        message: 'Success',
        description: 'Permission cache cleared successfully'
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to clear cache'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = {
      roles,
      permissions,
      categories,
      analytics,
      exportedAt: new Date().toISOString(),
      exportedBy: 'superadmin'
    };

    permissionService.exportToJSON(exportData, `permissions-export-${Date.now()}.json`);

    notification.success({
      message: 'Success',
      description: 'Permissions exported successfully'
    });
  };

  // ================================================
  // UTILITY FUNCTIONS
  // ================================================

  const getActionIcon = (actionType) => {
    switch (actionType?.toLowerCase()) {
      case 'grant':
      case 'add':
      case 'create':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'revoke':
      case 'remove':
      case 'delete':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'update':
      case 'modify':
        return <SwapOutlined style={{ color: '#1890ff' }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType?.toLowerCase()) {
      case 'grant':
      case 'add':
      case 'create':
        return 'green';
      case 'revoke':
      case 'remove':
      case 'delete':
        return 'red';
      case 'update':
      case 'modify':
        return 'blue';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // ================================================
  // RENDER FUNCTIONS
  // ================================================

  const renderRoleTable = () => {
    const columns = [
      {
        title: 'Role',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <Space direction="vertical" size={0}>
            <Text strong>{text}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Level {record.hierarchy}
            </Text>
          </Space>
        )
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true
      },
      {
        title: 'Users',
        dataIndex: 'userCount',
        key: 'userCount',
        render: (count) => (
          <Statistic
            value={count}
            prefix={<UserOutlined />}
            valueStyle={{ fontSize: '14px' }}
          />
        ),
        sorter: (a, b) => a.userCount - b.userCount
      },
      {
        title: 'Permissions',
        dataIndex: 'permissionCount',
        key: 'permissionCount',
        render: (count) => (
          <Badge count={count} showZero style={{ backgroundColor: '#52c41a' }} />
        ),
        sorter: (a, b) => a.permissionCount - b.permissionCount
      },
      {
        title: 'Status',
        key: 'status',
        render: (_, record) => (
          <Tag color={record.canModify ? 'green' : 'gold'} icon={record.canModify ? <UnlockOutlined /> : <LockOutlined />}>
            {record.canModify ? 'Editable' : 'System Role'}
          </Tag>
        )
      }
    ];

    return (
      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
      />
    );
  };

  const renderEditRoleModal = () => {
    if (!selectedRole) return null;

    const getCategoryProgress = (categoryKey) => {
      const categoryPerms = categories[categoryKey]?.permissions.map(p => p.key) || [];
      const selected = categoryPerms.filter(p => selectedPermissions.includes(p)).length;
      return `${selected}/${categoryPerms.length}`;
    };

    const isCategoryFullySelected = (categoryKey) => {
      const categoryPerms = categories[categoryKey]?.permissions.map(p => p.key) || [];
      return categoryPerms.every(p => selectedPermissions.includes(p));
    };

    const isCategoryPartiallySelected = (categoryKey) => {
      const categoryPerms = categories[categoryKey]?.permissions.map(p => p.key) || [];
      const hasAny = categoryPerms.some(p => selectedPermissions.includes(p));
      const hasAll = categoryPerms.every(p => selectedPermissions.includes(p));
      return hasAny && !hasAll;
    };

    return (
      <Modal
        title={
          <Space>
            <SecurityScanOutlined />
            <span>Edit Role Permissions: {selectedRole.name}</span>
          </Space>
        }
        open={editRoleModal}
        onCancel={() => {
          setEditRoleModal(false);
          form.resetFields();
        }}
        width={900}
        footer={null}
      >
        <Alert
          message={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>
                Editing permissions for <strong>{selectedRole.name}</strong> ({selectedRole.userCount} users)
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Current: {selectedRole.permissionCount} permissions |
                Selected: {selectedPermissions.length} permissions
              </Text>
            </Space>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveRolePermissions}
        >
          <Collapse accordion defaultActiveKey={[Object.keys(categories)[0]]}>
            {Object.entries(categories).map(([categoryKey, category]) => (
              <Panel
                key={categoryKey}
                header={
                  <Space>
                    <Checkbox
                      checked={isCategoryFullySelected(categoryKey)}
                      indeterminate={isCategoryPartiallySelected(categoryKey)}
                      onChange={(e) => handleCategoryToggle(categoryKey, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Text strong>{category.categoryName}</Text>
                    <Badge count={getCategoryProgress(categoryKey)} style={{ backgroundColor: '#1890ff' }} />
                  </Space>
                }
              >
                <Row gutter={[16, 8]}>
                  {category.permissions.map((perm) => (
                    <Col span={24} key={perm.key}>
                      <Checkbox
                        checked={selectedPermissions.includes(perm.key)}
                        onChange={(e) => handlePermissionToggle(perm.key, e.target.checked)}
                      >
                        <Space direction="vertical" size={0}>
                          <Text>{perm.name}</Text>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {perm.key}
                          </Text>
                        </Space>
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Panel>
            ))}
          </Collapse>

          <Divider />

          <Form.Item
            name="reason"
            label="Reason for Change (Optional)"
          >
            <TextArea
              rows={2}
              placeholder="e.g., Updated role permissions to align with new security policy"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => {
                setEditRoleModal(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  const renderFilterDrawer = () => (
    <Drawer
      title={
        <Space>
          <FilterOutlined />
          Filter Audit Logs
        </Space>
      }
      placement="right"
      width={400}
      onClose={() => setFilterDrawerVisible(false)}
      open={filterDrawerVisible}
    >
      <Form
        layout="vertical"
        onFinish={handleApplyFilters}
        initialValues={{
          actionType: auditFilters.actionType,
          targetType: auditFilters.targetType,
          dateRange: auditFilters.dateRange
        }}
      >
        <Form.Item
          name="actionType"
          label="Action Type"
        >
          <Select allowClear placeholder="Select action type">
            <Option value="ROLE_UPDATE">Role Update</Option>
            <Option value="GRANT">Grant Permission</Option>
            <Option value="REVOKE">Revoke Permission</Option>
            <Option value="CREATE">Create</Option>
            <Option value="UPDATE">Update</Option>
            <Option value="DELETE">Delete</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="targetType"
          label="Target Type"
        >
          <Select allowClear placeholder="Select target type">
            <Option value="ROLE">Role</Option>
            <Option value="USER">User</Option>
            <Option value="SYSTEM">System</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Date Range"
        >
          <DatePicker.RangePicker
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Divider />

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleClearFilters} icon={<ClearOutlined />}>
              Clear Filters
            </Button>
            <Button type="primary" htmlType="submit" icon={<FilterOutlined />}>
              Apply Filters
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Drawer>
  );

  const getActiveFiltersCount = () => {
    let count = 0;
    if (auditFilters.actionType) count++;
    if (auditFilters.targetType) count++;
    if (auditFilters.dateRange) count++;
    return count;
  };

  const renderAuditTrail = () => {
    const hasMoreToLoad = auditPagination.page < auditPagination.pages;
    const activeFiltersCount = getActiveFiltersCount();

    if (!Array.isArray(displayedLogs) || displayedLogs.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            activeFiltersCount > 0
              ? "No audit logs match your filters. Try adjusting your filter criteria."
              : "No audit logs found. Click 'Load Audit Logs' to fetch recent permission changes."
          }
        />
      );
    }

    const parsePermissionChanges = (oldValue, newValue) => {
      try {
        const oldPerms = typeof oldValue === 'string' ? JSON.parse(oldValue) : (Array.isArray(oldValue) ? oldValue : []);
        const newPerms = typeof newValue === 'string' ? JSON.parse(newValue) : (Array.isArray(newValue) ? newValue : []);

        const added = newPerms.filter(p => !oldPerms.includes(p));
        const removed = oldPerms.filter(p => !newPerms.includes(p));

        return { added, removed, oldPerms, newPerms };
      } catch (e) {
        return { added: [], removed: [], oldPerms: [], newPerms: [] };
      }
    };

    const getRoleName = (log) => {
      // Use role_display_name if available, otherwise fall back to role_name
      if (log.role_display_name) {
        return log.role_display_name;
      }
      if (log.role_name) {
        return log.role_name.replace(/_/g, ' ').toUpperCase();
      }
      // Fallback for non-role targets
      return log.target_id || 'Unknown';
    };

    return (
      <>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Alert
            message={
              <Space>
                <Text>Showing {displayedLogs.length} of {auditTotal} audit entries</Text>
                {activeFiltersCount > 0 && (
                  <Badge count={activeFiltersCount} style={{ backgroundColor: '#1890ff' }}>
                    <Tag color="blue">Filters Active</Tag>
                  </Badge>
                )}
              </Space>
            }
            type="info"
            showIcon
            icon={<AuditOutlined />}
          />
        </Space>

        <Timeline
          mode="alternate"
          style={{ marginTop: 24, padding: '0 20px' }}
          items={displayedLogs.map((log, index) => {
            const changes = parsePermissionChanges(log.old_value, log.new_value);

            return {
              key: log.audit_id || index,
              color: getActionColor(log.action_type),
              dot: getActionIcon(log.action_type),
              label: (
                <Tooltip title={formatLocalDateTime(log.performed_at)}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatTimestamp(log.performed_at)}
                  </Text>
                </Tooltip>
              ),
              children: (
                <Card
                  size="small"
                  style={{
                    marginBottom: 8,
                    borderLeft: `3px solid ${
                      log.action_type?.toLowerCase() === 'grant' || log.action_type?.toLowerCase() === 'add' || log.action_type?.toLowerCase() === 'create'
                        ? '#52c41a'
                        : log.action_type?.toLowerCase() === 'revoke' || log.action_type?.toLowerCase() === 'remove' || log.action_type?.toLowerCase() === 'delete'
                        ? '#ff4d4f'
                        : log.action_type?.toLowerCase() === 'update' || log.action_type?.toLowerCase() === 'modify'
                        ? '#1890ff'
                        : '#d9d9d9'
                    }`
                  }}
                >
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    {/* Header Tags */}
                    <Space wrap>
                      <Tag color={getActionColor(log.action_type)}>
                        {log.action_type?.toUpperCase() || 'UNKNOWN'}
                      </Tag>
                      <Tag color="purple">{log.target_type?.toUpperCase() || 'SYSTEM'}</Tag>
                    </Space>

                    {/* Main Action Description */}
                    <div>
                      <Text strong>{log.performed_by_name || 'System'}</Text>
                      <Text type="secondary"> updated permissions for </Text>
                      <Tag color="blue" style={{ fontWeight: 'bold' }}>
                        {getRoleName(log)}
                      </Tag>
                    </div>

                    {/* Permission Changes */}
                    {log.action_type?.toLowerCase() === 'role_update' && (changes.added.length > 0 || changes.removed.length > 0) && (
                      <div style={{ marginTop: 8, padding: 12, backgroundColor: '#fafafa', borderRadius: 4 }}>
                        {changes.added.length > 0 && (
                          <div style={{ marginBottom: changes.removed.length > 0 ? 12 : 0 }}>
                            <Text strong style={{ color: '#52c41a', fontSize: 12 }}>
                              ✓ Added Permissions ({changes.added.length}):
                            </Text>
                            <div style={{ marginTop: 4 }}>
                              <Space wrap size={[4, 4]}>
                                {changes.added.map((perm, idx) => (
                                  <Tag key={idx} color="success" style={{ margin: 0, fontSize: 11 }}>
                                    {perm}
                                  </Tag>
                                ))}
                              </Space>
                            </div>
                          </div>
                        )}

                        {changes.removed.length > 0 && (
                          <div>
                            <Text strong style={{ color: '#ff4d4f', fontSize: 12 }}>
                              ✗ Removed Permissions ({changes.removed.length}):
                            </Text>
                            <div style={{ marginTop: 4 }}>
                              <Space wrap size={[4, 4]}>
                                {changes.removed.map((perm, idx) => (
                                  <Tag key={idx} color="error" style={{ margin: 0, fontSize: 11 }}>
                                    {perm}
                                  </Tag>
                                ))}
                              </Space>
                            </div>
                          </div>
                        )}

                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #e8e8e8' }}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            Total permissions: {changes.oldPerms.length} → {changes.newPerms.length}
                            {changes.newPerms.length > changes.oldPerms.length &&
                              <Text style={{ color: '#52c41a', marginLeft: 4 }}>
                                (+{changes.newPerms.length - changes.oldPerms.length})
                              </Text>
                            }
                            {changes.newPerms.length < changes.oldPerms.length &&
                              <Text style={{ color: '#ff4d4f', marginLeft: 4 }}>
                                ({changes.newPerms.length - changes.oldPerms.length})
                              </Text>
                            }
                          </Text>
                        </div>
                      </div>
                    )}

                    {/* Reason */}
                    {log.reason && (
                      <div style={{ paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <HistoryOutlined /> <Text strong>Reason:</Text> {log.reason}
                        </Text>
                      </div>
                    )}
                  </Space>
                </Card>
              )
            };
          })}
        />

        {hasMoreToLoad && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Space direction="vertical" align="center" size={12}>
              <Text type="secondary">
                Loaded {displayedLogs.length} of {auditTotal} entries
              </Text>
              <Button
                type="primary"
                size="large"
                icon={<DownOutlined />}
                onClick={handleShowMore}
                loading={loading}
                style={{ minWidth: 200 }}
              >
                Show More (Load 3 More)
              </Button>
            </Space>
          </div>
        )}

        {!hasMoreToLoad && displayedLogs.length > 0 && (
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Text type="secondary">
              All {displayedLogs.length} entries loaded
            </Text>
          </div>
        )}
      </>
    );
  };

  const renderCategoryEditModal = () => {
    if (!selectedCategory || !selectedRole) return null;

    const handleToggleWithConfirm = (perm, checked) => {
      setConfirmModal({
        visible: true,
        permission: perm,
        action: checked ? 'enable' : 'disable'
      });
    };

    const handleConfirmToggle = () => {
      const { permission, action } = confirmModal;
      handlePermissionToggle(permission.key, action === 'enable');
      setConfirmModal({ visible: false, permission: null, action: null });
    };

    return (
      <>
        <Modal
          title={
            <Space>
              <span style={{ color: '#262626', fontSize: 20 }}>
                {selectedCategory.icon}
              </span>
              <span>Edit {selectedCategory.title} - {selectedRole.name}</span>
            </Space>
          }
          open={categoryEditModal}
          onCancel={() => {
            setCategoryEditModal(false);
            categoryForm.resetFields();
            // Ensure body scroll is restored when modal closes
            document.body.style.overflow = 'auto';
          }}
          afterClose={() => {
            // Cleanup: ensure body scroll is restored
            document.body.style.overflow = 'auto';
          }}
          width={700}
          footer={null}
        >
          <Alert
            message={
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>
                  Managing <strong>{selectedCategory.title}</strong> permissions for <strong>{selectedRole.name}</strong>
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Selected: {selectedPermissions.length} of {selectedCategory.permissions.length} permissions
                </Text>
              </Space>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form
            form={categoryForm}
            layout="vertical"
            onFinish={handleSaveCategoryPermissions}
          >
            <div
              style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}
              onMouseEnter={(e) => {
                // Lock body scroll when mouse enters modal scrollable area
                document.body.style.overflow = 'hidden';
              }}
              onMouseLeave={(e) => {
                // Unlock body scroll when mouse leaves
                document.body.style.overflow = 'auto';
              }}
            >
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {selectedCategory.permissions.map((perm) => {
                  const isEnabled = selectedPermissions.includes(perm.key);
                  return (
                    <Card
                      size="small"
                      key={perm.key}
                      style={{
                        borderLeft: `3px solid ${isEnabled ? '#262626' : '#e8e8e8'}`,
                        backgroundColor: isEnabled ? '#f5f5f5' : '#fafafa',
                        transition: 'all 0.3s',
                        boxShadow: isEnabled ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      <Row align="middle" gutter={16}>
                        <Col flex="auto">
                          <Space direction="vertical" size={2} style={{ width: '100%' }}>
                            <Space align="center">
                              {isEnabled ? (
                                <CheckCircleOutlined style={{ color: '#262626', fontSize: 16 }} />
                              ) : (
                                <CloseCircleOutlined style={{ color: '#d9d9d9', fontSize: 16 }} />
                              )}
                              <Text strong style={{ fontSize: 14 }}>{perm.name}</Text>
                            </Space>
                            <Text code style={{ fontSize: 11, color: '#666', display: 'block', marginLeft: 24 }}>
                              {perm.key}
                            </Text>
                            {perm.description && (
                              <Text type="secondary" style={{ fontSize: 11, display: 'block', marginLeft: 24 }}>
                                {perm.description}
                              </Text>
                            )}
                          </Space>
                        </Col>
                        <Col>
                          <Switch
                            checked={isEnabled}
                            onChange={(checked) => handleToggleWithConfirm(perm, checked)}
                            style={{
                              backgroundColor: isEnabled ? '#262626' : '#bfbfbf',
                              minWidth: '50px',
                              height: '24px'
                            }}
                          />
                        </Col>
                      </Row>
                    </Card>
                  );
                })}
              </Space>
            </div>

          <Divider />

          <Form.Item
            name="reason"
            label="Reason for Change (Optional)"
          >
            <TextArea
              rows={2}
              placeholder="e.g., Updated permissions based on security review"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => {
                setCategoryEditModal(false);
                categoryForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: confirmModal.action === 'enable' ? '#ef4444' : '#faad14' }} />
            <span>Confirm Permission Change</span>
          </Space>
        }
        open={confirmModal.visible}
        onOk={handleConfirmToggle}
        onCancel={() => setConfirmModal({ visible: false, permission: null, action: null })}
        okText={confirmModal.action === 'enable' ? 'Enable' : 'Disable'}
        okButtonProps={{
          danger: confirmModal.action === 'disable',
          type: confirmModal.action === 'enable' ? 'primary' : 'default'
        }}
        cancelText="Cancel"
        width={500}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Alert
            message={`You are about to ${confirmModal.action} this permission`}
            description={
              <Space direction="vertical" size={8} style={{ width: '100%', marginTop: 8 }}>
                <Text>This action will affect <strong>{selectedRole?.userCount || 0} users</strong> with the <Tag color="blue">{selectedRole?.name}</Tag> role.</Text>
                {confirmModal.action === 'disable' && (
                  <Text type="danger" strong>
                    <ExclamationCircleOutlined /> Disabling this permission may restrict user access to critical features.
                  </Text>
                )}
              </Space>
            }
            type={confirmModal.action === 'enable' ? 'info' : 'warning'}
            showIcon
          />

          {confirmModal.permission && (
            <Card size="small" style={{ backgroundColor: '#fafafa' }}>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 14 }}>{confirmModal.permission.name}</Text>
                <Text code style={{ fontSize: 12, color: '#666' }}>
                  {confirmModal.permission.key}
                </Text>
                {confirmModal.permission.description && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {confirmModal.permission.description}
                  </Text>
                )}
              </Space>
            </Card>
          )}

          <Text type="secondary" style={{ fontSize: 12 }}>
            Are you sure you want to proceed with this change?
          </Text>
        </Space>
      </Modal>
    </>
    );
  };

  const renderUserPermissionsGrid = () => {
    // Role hierarchy levels
    const roleHierarchy = {
      superadmin: 100,
      admin: 90,
      department_head: 70,
      coordinator: 60,
      department_coordinator: 50,
      engineer: 30,
      employee: 10
    };

    // Define role-appropriate permission patterns
    const getRoleAppropriatePermissions = (allPermissions, roleKey) => {
      const roleLevel = roleHierarchy[roleKey] || 0;

      // Admin-only permissions (level >= 90)
      const adminOnlyPatterns = [
        'users.create', 'users.delete', 'users.assign_roles', 'users.reset_password',
        'departments.create', 'departments.delete', 'departments.manage_hierarchy',
        'masters.create', 'masters.update', 'masters.delete', 'masters.write',
        'system.settings', 'system.maintenance', 'system.create', 'system.update',
        'permission-control.create', 'permission-control.update'
      ];

      // Coordinator-level permissions (level >= 60)
      const coordinatorPatterns = [
        'assets.create', 'assets.delete', 'assets.assign', 'assets.transfer', 'assets.retire',
        'tickets.assign', 'tickets.close', 'tickets.delete',
        'masters.read', 'departments.read', 'departments.update'
      ];

      // Engineer-level permissions (level >= 30)
      const engineerPatterns = [
        'assets.read', 'assets.update', 'assets.maintenance',
        'tickets.create', 'tickets.update', 'tickets.read',
        'reports.view'
      ];

      // Employee-level permissions (level >= 10)
      const employeePatterns = [
        'assets.read', 'tickets.create', 'tickets.read',
        'reports.view', 'statistics.read'
      ];

      return allPermissions.filter(perm => {
        const permKey = perm.key;

        // Superadmin gets everything
        if (roleLevel >= 100) return true;

        // Admin level
        if (roleLevel >= 90) {
          // Allow all except superadmin-specific
          return !permKey.includes('system.logs');
        }

        // Coordinator level
        if (roleLevel >= 60) {
          // Allow coordinator patterns and below
          const isAdminOnly = adminOnlyPatterns.some(pattern => permKey === pattern || permKey.startsWith(pattern));
          return !isAdminOnly;
        }

        // Engineer level
        if (roleLevel >= 30) {
          // Only engineer and employee patterns
          const isHighLevel = [...adminOnlyPatterns, ...coordinatorPatterns].some(
            pattern => permKey === pattern || permKey.startsWith(pattern.split('.')[0])
          );
          return !isHighLevel;
        }

        // Employee level
        if (roleLevel >= 10) {
          // Only basic read permissions
          return employeePatterns.some(pattern => permKey === pattern || permKey.startsWith(pattern));
        }

        return false;
      });
    };

    // Get filtered permissions based on selected role
    const getFilteredPermissions = (categoryFilter) => {
      const allPerms = Object.entries(categories)
        .filter(([key]) => categoryFilter(key))
        .flatMap(([, cat]) => cat.permissions || []);

      if (!selectedRole) return allPerms;

      return getRoleAppropriatePermissions(allPerms, selectedRole.key);
    };

    // Group permissions by category for 2x2 grid
    const permissionGroups = [
      {
        title: 'User Management',
        icon: <UserOutlined />,
        permissions: getFilteredPermissions((key) => key.includes('user')),
        minRole: 'admin'
      },
      {
        title: 'Asset Management',
        icon: <SecurityScanOutlined />,
        permissions: getFilteredPermissions((key) => key.includes('asset')),
        minRole: 'employee'
      },
      {
        title: 'System Administration',
        icon: <LockOutlined />,
        permissions: getFilteredPermissions((key) => key.includes('system') || key.includes('permission')),
        minRole: 'admin'
      },
      {
        title: 'Reports & Analytics',
        icon: <HistoryOutlined />,
        permissions: getFilteredPermissions((key) => key.includes('report') || key.includes('statistic') || key.includes('dashboard')),
        minRole: 'employee'
      }
    ];

    return (
      <div>
        <Alert
          message="Role-Based Permission Management"
          description={
            <Space direction="vertical" size={4}>
              <Text>Select a role below to view and edit role-appropriate permissions.</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <strong>Note:</strong> Only permissions relevant to the selected role's hierarchy level will be shown.
                For example, employees cannot manage users or system settings.
              </Text>
            </Space>
          }
          type="info"
          showIcon
          icon={<SecurityScanOutlined />}
          style={{ marginBottom: 24 }}
        />

        {/* Role Selector */}
        <Card style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>Select Role to Edit:</Text>
            <Select
              style={{ width: '100%' }}
              placeholder="Choose a role to manage permissions"
              size="large"
              value={selectedRole?.key}
              onChange={(roleKey) => {
                const role = roles.find(r => r.key === roleKey);
                setSelectedRole(role);
              }}
              disabled={roles.length === 0}
            >
              {roles.map((role) => (
                <Option key={role.key} value={role.key} disabled={role.key === 'superadmin'}>
                  <Space>
                    <TeamOutlined />
                    <Text strong>{role.name}</Text>
                    <Badge count={role.permissionCount} style={{ backgroundColor: '#52c41a' }} />
                    {role.key === 'superadmin' && <Tag color="gold">System Protected</Tag>}
                  </Space>
                </Option>
              ))}
            </Select>
            {selectedRole && (
              <Alert
                message={
                  <Space>
                    <Text>Editing permissions for: <strong>{selectedRole.name}</strong></Text>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <Text>This role currently has {selectedRole.permissionCount} total permissions.</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Showing {permissionGroups.reduce((sum, g) => sum + g.permissions.length, 0)} role-appropriate permissions below.
                    </Text>
                  </Space>
                }
                type="success"
                showIcon
              />
            )}
          </Space>
        </Card>

        <Row gutter={[24, 24]}>
          {permissionGroups.map((group, index) => {
            const getRolePermCount = () => {
              if (!selectedRole) return 0;
              const categoryPermKeys = group.permissions.map(p => p.key);
              const rolePerms = selectedRole.permissions || [];
              return rolePerms.filter(p => categoryPermKeys.includes(p)).length;
            };

            const isDisabled = !selectedRole || selectedRole.key === 'superadmin';
            const hasNoPermissions = group.permissions.length === 0;
            const isRestricted = selectedRole && hasNoPermissions;

            return (
              <Col xs={24} md={12} key={index}>
                <Card
                  hoverable={!isDisabled && !hasNoPermissions}
                  onClick={() => {
                    if (!isDisabled && !hasNoPermissions) {
                      handleEditCategory(group, selectedRole);
                    }
                  }}
                  style={{
                    borderLeft: `4px solid ${isRestricted ? '#ff4d4f' : '#d9d9d9'}`,
                    height: '100%',
                    minHeight: 350,
                    cursor: isDisabled || hasNoPermissions ? 'not-allowed' : 'pointer',
                    opacity: isDisabled || hasNoPermissions ? 0.6 : 1,
                    backgroundColor: isRestricted ? '#fff1f0' : '#fff',
                    transition: 'all 0.3s'
                  }}
                  title={
                    <Space>
                      <span style={{ color: isRestricted ? '#ff4d4f' : '#595959', fontSize: 20 }}>
                        {group.icon}
                      </span>
                      <Text strong style={{ fontSize: 16, color: isRestricted ? '#ff4d4f' : '#262626' }}>
                        {group.title}
                      </Text>
                      {isRestricted && (
                        <Tooltip title={`Not available for ${selectedRole.name} role`}>
                          <Tag color="red" style={{ fontSize: 10 }}>RESTRICTED</Tag>
                        </Tooltip>
                      )}
                    </Space>
                  }
                  extra={
                    <Space>
                      <Tooltip title="Total permissions in category">
                        <Badge
                          count={group.permissions.length}
                          style={{ backgroundColor: isRestricted ? '#ff4d4f' : '#8c8c8c' }}
                          showZero
                        />
                      </Tooltip>
                      {selectedRole && group.permissions.length > 0 && (
                        <Tooltip title="Enabled / Available for this role">
                          <Badge
                            count={`${getRolePermCount()}/${group.permissions.length}`}
                            style={{ backgroundColor: '#262626' }}
                          />
                        </Tooltip>
                      )}
                    </Space>
                  }
                >
                <div
                  style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 8 }}
                  onMouseEnter={(e) => {
                    // Lock body scroll when mouse enters scrollable area
                    document.body.style.overflow = 'hidden';
                  }}
                  onMouseLeave={(e) => {
                    // Unlock body scroll when mouse leaves
                    document.body.style.overflow = 'auto';
                  }}
                >
                  {isDisabled ? (
                    <div style={{
                      padding: 40,
                      textAlign: 'center',
                      backgroundColor: '#f5f5f5',
                      borderRadius: 8
                    }}>
                      <Text type="secondary">
                        {selectedRole?.key === 'superadmin'
                          ? 'Superadmin permissions cannot be modified'
                          : 'Select a role above to edit permissions'}
                      </Text>
                    </div>
                  ) : hasNoPermissions ? (
                    <div style={{
                      padding: 40,
                      textAlign: 'center',
                      backgroundColor: '#fff1f0',
                      borderRadius: 8,
                      border: '1px solid #ffccc7'
                    }}>
                      <Space direction="vertical" align="center">
                        <LockOutlined style={{ fontSize: 32, color: '#ff4d4f' }} />
                        <Text strong style={{ color: '#ff4d4f' }}>
                          Restricted for {selectedRole.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          This role's hierarchy level does not permit access to {group.title.toLowerCase()} permissions.
                        </Text>
                      </Space>
                    </div>
                  ) : group.permissions.length > 0 ? (
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        {group.permissions.slice(0, 5).map((perm, idx) => {
                          const isEnabled = selectedRole && selectedRole.permissions?.includes(perm.key);
                          return (
                            <Card
                              size="small"
                              key={idx}
                              style={{
                                borderLeft: `3px solid ${isEnabled ? '#262626' : '#e8e8e8'}`,
                                backgroundColor: isEnabled ? '#f5f5f5' : '#fafafa'
                              }}
                            >
                              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                                <Space>
                                  {isEnabled && <CheckCircleOutlined style={{ color: '#262626' }} />}
                                  <Text strong style={{ fontSize: 13 }}>
                                    {perm.name}
                                  </Text>
                                </Space>
                                <Text
                                  code
                                  style={{
                                    fontSize: 11,
                                    color: '#666',
                                    display: 'block'
                                  }}
                                >
                                  {perm.key}
                                </Text>
                              </Space>
                            </Card>
                          );
                        })}
                        {group.permissions.length > 5 && (
                          <Text type="secondary" style={{ fontSize: 11, textAlign: 'center', display: 'block' }}>
                            +{group.permissions.length - 5} more permissions...
                          </Text>
                        )}
                      </Space>
                  ) : (
                    <Empty
                      description="No permissions in this category"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
        </Row>
      </div>
    );
  };

  const renderAnalytics = () => {
    if (!Array.isArray(analytics) || analytics.length === 0) {
      return <Empty description="No analytics data available" />;
    }

    return (
      <Row gutter={[16, 16]}>
        {analytics.map((roleData) => (
          <Col xs={24} sm={12} md={8} lg={6} key={roleData.role}>
            <Card
              size="small"
              title={roleData.role.replace(/_/g, ' ').toUpperCase()}
              extra={<TeamOutlined />}
            >
              <Statistic
                title="Total Users"
                value={roleData.totalUsers}
                prefix={<UserOutlined />}
              />
              <Divider style={{ margin: '8px 0' }} />
              <Row gutter={8}>
                <Col span={12}>
                  <Statistic
                    title="Active"
                    value={roleData.activeUsers}
                    valueStyle={{ fontSize: '14px', color: '#52c41a' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Inactive"
                    value={roleData.inactiveUsers}
                    valueStyle={{ fontSize: '14px', color: '#ff4d4f' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  if (!isSuperAdmin()) {
    return (
      <Alert
        message="Access Denied"
        description="You do not have permission to access the permission control panel. This area is restricted to SuperAdmin users only."
        type="error"
        showIcon
        icon={<LockOutlined />}
      />
    );
  }

  return (
    <div className="permission-control-panel">
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2}>
                <SecurityScanOutlined /> Permission Control Panel
              </Title>
              <Paragraph type="secondary">
                Manage system-wide permissions, roles, and access control
              </Paragraph>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadData}
                  loading={loading}
                >
                  Refresh
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExport}
                >
                  Export
                </Button>
                <Popconfirm
                  title="Clear all permission caches?"
                  description="This will force all users to reload their permissions on next request."
                  onConfirm={() => handleClearCache('all')}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    icon={<SyncOutlined />}
                    danger
                  >
                    Clear All Caches
                  </Button>
                </Popconfirm>
              </Space>
            </Col>
          </Row>

          <Divider />

          {/* Main Content */}
          <Spin spinning={loading}>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Role Management
                  </span>
                }
                key="roles"
              >
                {renderRoleTable()}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <UserOutlined />
                    Permission Categories
                  </span>
                }
                key="users"
              >
                {renderUserPermissionsGrid()}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <HistoryOutlined />
                    Audit Logs
                    {auditTotal > 0 && <Badge count={auditTotal} style={{ marginLeft: 8, backgroundColor: '#1890ff' }} />}
                  </span>
                }
                key="audit"
              >
                <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
                  <Space wrap>
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={() => loadAuditLogs(1, auditFilters, false)}
                      loading={loading}
                    >
                      {auditLogs.length > 0 ? 'Refresh' : 'Load Audit Logs'}
                    </Button>
                    <Badge count={getActiveFiltersCount()} offset={[-5, 5]}>
                      <Button
                        icon={<FilterOutlined />}
                        onClick={() => setFilterDrawerVisible(true)}
                      >
                        Filters
                      </Button>
                    </Badge>
                    {getActiveFiltersCount() > 0 && (
                      <Button
                        icon={<ClearOutlined />}
                        onClick={handleClearFilters}
                        danger
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </Space>
                </Space>
                {renderAuditTrail()}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <SecurityScanOutlined />
                    Analytics
                  </span>
                }
                key="analytics"
              >
                <Title level={4}>Role Distribution</Title>
                {renderAnalytics()}
              </TabPane>
            </Tabs>
          </Spin>
        </Space>
      </Card>

      {/* Modals */}
      {renderEditRoleModal()}
      {renderCategoryEditModal()}

      {/* Filter Drawer */}
      {renderFilterDrawer()}
    </div>
  );
};

export default SuperAdminPermissions;
