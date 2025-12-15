import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tag,
  message,
  Tooltip,
  Typography,
  Popconfirm,
  Badge,
  Row,
  Col,
  Statistic,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  ToolOutlined,
  SearchOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import repairHistoryService from '../../../services/repairHistory';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// Fault categories
const FAULT_CATEGORIES = [
  { value: 'Hardware', color: 'red' },
  { value: 'Software', color: 'blue' },
  { value: 'Network', color: 'cyan' },
  { value: 'Electrical', color: 'orange' },
  { value: 'Mechanical', color: 'purple' },
  { value: 'Other', color: 'default' }
];

/**
 * FaultTypeManagement Component
 * Admin CRUD interface for managing fault types
 */
const FaultTypeManagement = () => {
  const [loading, setLoading] = useState(false);
  const [faultTypes, setFaultTypes] = useState([]);
  const [stats, setStats] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedFaultType, setSelectedFaultType] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadFaultTypes();
    loadStats();
  }, []);

  const loadFaultTypes = async () => {
    setLoading(true);
    try {
      const response = await repairHistoryService.getFaultTypes();
      const data = response.data?.data || response.data;
      const faultTypesData = data?.faultTypes || data?.fault_types || data;
      setFaultTypes(Array.isArray(faultTypesData) ? faultTypesData : []);
    } catch (error) {
      console.error('Failed to load fault types:', error);
      message.error('Failed to load fault types');
      setFaultTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await repairHistoryService.getFaultTypeStats();
      const data = response.data?.data || response.data;
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCreate = () => {
    setSelectedFaultType(null);
    setModalMode('create');
    form.resetFields();
    form.setFieldsValue({ is_active: true });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedFaultType(record);
    setModalMode('edit');
    form.setFieldsValue({
      name: record.name,
      category: record.category,
      description: record.description,
      is_active: record.is_active
    });
    setModalVisible(true);
  };

  const handleDelete = async (record) => {
    try {
      await repairHistoryService.deleteFaultType(record.fault_type_id);
      message.success('Fault type deleted successfully');
      loadFaultTypes();
      loadStats();
    } catch (error) {
      console.error('Failed to delete fault type:', error);
      message.error(error.response?.data?.message || 'Failed to delete fault type');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (modalMode === 'create') {
        await repairHistoryService.createFaultType(values);
        message.success('Fault type created successfully');
      } else {
        await repairHistoryService.updateFaultType(selectedFaultType.fault_type_id, values);
        message.success('Fault type updated successfully');
      }
      setModalVisible(false);
      loadFaultTypes();
      loadStats();
    } catch (error) {
      console.error('Failed to save fault type:', error);
      message.error(error.response?.data?.message || 'Failed to save fault type');
    }
  };

  const getCategoryColor = (category) => {
    const found = FAULT_CATEGORIES.find(c => c.value === category);
    return found ? found.color : 'default';
  };

  // Filter fault types based on search and category
  const filteredFaultTypes = (Array.isArray(faultTypes) ? faultTypes : []).filter(ft => {
    const matchesSearch = !searchText ||
      ft.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      ft.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !categoryFilter || ft.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {!record.is_active && <Tag color="default">Inactive</Tag>}
        </Space>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: FAULT_CATEGORIES.map(c => ({ text: c.value, value: c.value })),
      onFilter: (value, record) => record.category === value,
      render: (category) => (
        <Tag color={getCategoryColor(category)}>{category}</Tag>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 300,
      render: (text) => text || '-'
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false }
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Fault Type"
            description="Are you sure you want to delete this fault type?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={record.usage_count > 0}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Fault Types"
              value={faultTypes.length}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Types"
              value={faultTypes.filter(f => f.is_active).length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Categories"
              value={[...new Set(faultTypes.map(f => f.category))].length}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card
        title={
          <Space>
            <ToolOutlined />
            <span>Fault Type Management</span>
          </Space>
        }
        extra={
          <Space>
            <Input
              placeholder="Search fault types..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="Filter by category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 150 }}
              allowClear
            >
              {FAULT_CATEGORIES.map(cat => (
                <Option key={cat.value} value={cat.value}>
                  <Tag color={cat.color}>{cat.value}</Tag>
                </Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={loadFaultTypes}>
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Add Fault Type
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredFaultTypes}
          rowKey="fault_type_id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} fault types`
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No fault types found"
              />
            )
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          <Space>
            {modalMode === 'create' ? <PlusOutlined /> : <EditOutlined />}
            <span>{modalMode === 'create' ? 'Create Fault Type' : 'Edit Fault Type'}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_active: true }}
        >
          <Form.Item
            name="name"
            label="Fault Type Name"
            rules={[
              { required: true, message: 'Please enter fault type name' },
              { max: 100, message: 'Name cannot exceed 100 characters' }
            ]}
          >
            <Input placeholder="e.g., Hard Drive Failure, Display Issue" />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select category">
              {FAULT_CATEGORIES.map(cat => (
                <Option key={cat.value} value={cat.value}>
                  <Tag color={cat.color}>{cat.value}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ max: 500, message: 'Description cannot exceed 500 characters' }]}
          >
            <TextArea
              rows={3}
              placeholder="Brief description of this fault type..."
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Status"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {modalMode === 'create' ? 'Create' : 'Save Changes'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FaultTypeManagement;
