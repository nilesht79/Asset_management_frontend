/**
 * AuditLogFiltersDrawer Component
 * Advanced filters for audit logs
 */

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  Space,
  Divider,
  message
} from 'antd';
import {
  FilterOutlined,
  ClearOutlined,
  SearchOutlined
} from '@ant-design/icons';
import auditLogService from '../../../services/auditLog';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AuditLogFiltersDrawer = ({ visible, onClose, onApply, currentFilters }) => {
  const [form] = Form.useForm();
  const [filterOptions, setFilterOptions] = useState({
    action_categories: [],
    action_types: [],
    statuses: [],
    login_event_types: []
  });
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchFilterOptions();
      // Set current filters to form
      if (currentFilters) {
        const formValues = { ...currentFilters };
        if (currentFilters.start_date && currentFilters.end_date) {
          formValues.dateRange = [
            currentFilters.start_date,
            currentFilters.end_date
          ];
        }
        form.setFieldsValue(formValues);
      }
    }
  }, [visible, currentFilters]);

  const fetchFilterOptions = async () => {
    setLoadingOptions(true);
    try {
      const response = await auditLogService.getFilterOptions();
      const data = response.data?.data || response.data;
      setFilterOptions(data);
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      // Use default options if API fails
      setFilterOptions({
        action_categories: [
          { value: 'auth', label: 'Authentication' },
          { value: 'user', label: 'User Management' },
          { value: 'asset', label: 'Assets' },
          { value: 'ticket', label: 'Tickets' },
          { value: 'requisition', label: 'Requisitions' },
          { value: 'permission', label: 'Permissions' },
          { value: 'master', label: 'Master Data' },
          { value: 'system', label: 'System' },
          { value: 'file', label: 'Files' },
          { value: 'job', label: 'Jobs' },
          { value: 'security', label: 'Security' },
          { value: 'report', label: 'Reports' }
        ],
        action_types: [
          { value: 'CREATE', label: 'Create' },
          { value: 'READ', label: 'Read' },
          { value: 'UPDATE', label: 'Update' },
          { value: 'DELETE', label: 'Delete' },
          { value: 'LOGIN', label: 'Login' },
          { value: 'LOGOUT', label: 'Logout' },
          { value: 'EXPORT', label: 'Export' },
          { value: 'IMPORT', label: 'Import' },
          { value: 'APPROVE', label: 'Approve' },
          { value: 'REJECT', label: 'Reject' },
          { value: 'ASSIGN', label: 'Assign' },
          { value: 'EXECUTE', label: 'Execute' }
        ],
        statuses: [
          { value: 'success', label: 'Success' },
          { value: 'failure', label: 'Failure' },
          { value: 'error', label: 'Error' }
        ],
        login_event_types: [
          { value: 'login_success', label: 'Login Success' },
          { value: 'login_failed', label: 'Login Failed' },
          { value: 'logout', label: 'Logout' },
          { value: 'token_refresh', label: 'Token Refresh' },
          { value: 'password_reset', label: 'Password Reset' }
        ]
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleApply = () => {
    const values = form.getFieldsValue();
    const filters = {};

    if (values.dateRange && values.dateRange[0] && values.dateRange[1]) {
      filters.start_date = values.dateRange[0].format('YYYY-MM-DD');
      filters.end_date = values.dateRange[1].format('YYYY-MM-DD');
    }

    if (values.action_category) filters.action_category = values.action_category;
    if (values.action_type) filters.action_type = values.action_type;
    if (values.status) filters.status = values.status;
    if (values.user_email) filters.user_email = values.user_email;
    if (values.ip_address) filters.ip_address = values.ip_address;
    if (values.resource_type) filters.resource_type = values.resource_type;
    if (values.resource_id) filters.resource_id = values.resource_id;
    if (values.action) filters.action = values.action;
    if (values.search) filters.search = values.search;

    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    form.resetFields();
    onApply({});
    onClose();
  };

  return (
    <Drawer
      title={
        <Space>
          <FilterOutlined />
          <span>Advanced Filters</span>
        </Space>
      }
      placement="right"
      width={400}
      onClose={onClose}
      open={visible}
      destroyOnClose
      footer={
        <div className="flex justify-end gap-2">
          <Button icon={<ClearOutlined />} onClick={handleReset}>
            Reset
          </Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        {/* Date Range */}
        <Form.Item name="dateRange" label="Date Range">
          <RangePicker className="w-full" />
        </Form.Item>

        <Divider>Action Filters</Divider>

        {/* Category */}
        <Form.Item name="action_category" label="Category">
          <Select
            placeholder="Select category"
            allowClear
            loading={loadingOptions}
            showSearch
            optionFilterProp="children"
          >
            {filterOptions.action_categories.map((cat) => (
              <Option key={cat.value} value={cat.value}>
                {cat.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Action Type */}
        <Form.Item name="action_type" label="Action Type">
          <Select
            placeholder="Select action type"
            allowClear
            loading={loadingOptions}
            showSearch
            optionFilterProp="children"
          >
            {filterOptions.action_types.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Status */}
        <Form.Item name="status" label="Status">
          <Select
            placeholder="Select status"
            allowClear
            loading={loadingOptions}
          >
            {filterOptions.statuses.map((status) => (
              <Option key={status.value} value={status.value}>
                {status.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Action Name */}
        <Form.Item name="action" label="Action Name">
          <Input placeholder="e.g., login_success, asset_created" />
        </Form.Item>

        <Divider>User Filters</Divider>

        {/* User Email */}
        <Form.Item name="user_email" label="User Email">
          <Input placeholder="Search by email" />
        </Form.Item>

        {/* IP Address */}
        <Form.Item name="ip_address" label="IP Address">
          <Input placeholder="e.g., 192.168.1.1" />
        </Form.Item>

        <Divider>Resource Filters</Divider>

        {/* Resource Type */}
        <Form.Item name="resource_type" label="Resource Type">
          <Select
            placeholder="Select resource type"
            allowClear
            showSearch
          >
            <Option value="user">User</Option>
            <Option value="asset">Asset</Option>
            <Option value="ticket">Ticket</Option>
            <Option value="requisition">Requisition</Option>
            <Option value="department">Department</Option>
            <Option value="location">Location</Option>
            <Option value="permission">Permission</Option>
            <Option value="settings">Settings</Option>
            <Option value="file">File</Option>
            <Option value="report">Report</Option>
          </Select>
        </Form.Item>

        {/* Resource ID */}
        <Form.Item name="resource_id" label="Resource ID">
          <Input placeholder="UUID or ID of resource" />
        </Form.Item>

        <Divider>General Search</Divider>

        {/* Search */}
        <Form.Item name="search" label="Keyword Search">
          <Input placeholder="Search in action, resource name, email, endpoint" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AuditLogFiltersDrawer;
