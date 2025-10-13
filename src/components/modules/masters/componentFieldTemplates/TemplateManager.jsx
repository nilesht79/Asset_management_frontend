import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Space,
  message,
  Popconfirm,
  Tag,
  Divider,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  fetchComponentFieldTemplates,
  createFieldTemplate,
  updateFieldTemplate,
  deleteFieldTemplate,
  createFieldOption,
  updateFieldOption,
  deleteFieldOption,
  clearError,
  clearSuccess,
} from '../../../../store/slices/componentFieldTemplatesSlice';
import { fetchProductTypes } from '../../../../store/slices/masterSlice';

const { Option } = Select;
const { Title, Text } = Typography;

const TemplateManager = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [optionForm] = Form.useForm();

  const { templates, loading, error, success } = useSelector(
    (state) => state.componentFieldTemplates
  );
  const { productTypes } = useSelector((state) => state.master);

  // Extract product types array from the data structure
  const types = Array.isArray(productTypes?.data) ? productTypes.data.filter(t => t.is_active) : [];

  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingOption, setEditingOption] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedProductType, setSelectedProductType] = useState(null);

  useEffect(() => {
    dispatch(fetchProductTypes({ page: 1, limit: 100, status: 'active' }));
    dispatch(fetchComponentFieldTemplates());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      message.success('Operation completed successfully');
      dispatch(clearSuccess());
      dispatch(fetchComponentFieldTemplates());
      setIsTemplateModalVisible(false);
      setIsOptionModalVisible(false);
      form.resetFields();
      optionForm.resetFields();
      setEditingTemplate(null);
      setEditingOption(null);
    }
  }, [success, dispatch, form, optionForm]);

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    form.resetFields();
    setIsTemplateModalVisible(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    form.setFieldsValue({
      product_type_id: template.product_type_id,
      field_name: template.field_name,
      display_label: template.display_label,
      field_type: template.field_type,
      is_required: template.is_required,
      display_order: template.display_order,
      placeholder_text: template.placeholder_text,
      help_text: template.help_text,
      min_value: template.min_value,
      max_value: template.max_value,
    });
    setIsTemplateModalVisible(true);
  };

  const handleDeleteTemplate = async (id) => {
    await dispatch(deleteFieldTemplate(id));
  };

  const handleTemplateSubmit = async (values) => {
    if (editingTemplate) {
      await dispatch(updateFieldTemplate({ id: editingTemplate.id, data: values }));
    } else {
      await dispatch(createFieldTemplate(values));
    }
  };

  const handleManageOptions = (template) => {
    setSelectedTemplate(template);
    setIsOptionModalVisible(true);
  };

  const handleCreateOption = () => {
    setEditingOption(null);
    optionForm.resetFields();
    const maxOrder = selectedTemplate.options?.length > 0
      ? Math.max(...selectedTemplate.options.map(o => o.display_order))
      : 0;
    optionForm.setFieldsValue({ display_order: maxOrder + 1 });
  };

  const handleEditOption = (option) => {
    setEditingOption(option);
    optionForm.setFieldsValue({
      option_value: option.option_value,
      option_label: option.option_label,
      is_default: option.is_default,
      display_order: option.display_order,
    });
  };

  const handleDeleteOption = async (optionId) => {
    await dispatch(deleteFieldOption(optionId));
  };

  const handleOptionSubmit = async (values) => {
    if (editingOption) {
      await dispatch(updateFieldOption({ optionId: editingOption.id, data: values }));
    } else {
      await dispatch(createFieldOption({ fieldTemplateId: selectedTemplate.id, data: values }));
    }
    setEditingOption(null);
    optionForm.resetFields();
  };

  const fieldTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'number_with_unit', label: 'Number with Unit' },
    { value: 'select', label: 'Dropdown (Select)' },
    { value: 'multiselect', label: 'Multi-select' },
  ];

  // Filter templates by selected product type
  const filteredTemplates = selectedProductType
    ? templates.filter(t => t.product_type_id === selectedProductType)
    : templates;

  // Group templates by product type
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    const typeName = template.product_type_name || 'Unknown';
    if (!acc[typeName]) {
      acc[typeName] = [];
    }
    acc[typeName].push(template);
    return acc;
  }, {});

  const columns = [
    {
      title: 'Display Order',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 100,
      sorter: (a, b) => a.display_order - b.display_order,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Field Name',
      dataIndex: 'field_name',
      key: 'field_name',
      width: 150,
    },
    {
      title: 'Display Label',
      dataIndex: 'display_label',
      key: 'display_label',
      width: 200,
    },
    {
      title: 'Field Type',
      dataIndex: 'field_type',
      key: 'field_type',
      width: 150,
      render: (type) => (
        <Tag color="blue">{fieldTypeOptions.find(f => f.value === type)?.label || type}</Tag>
      ),
    },
    {
      title: 'Required',
      dataIndex: 'is_required',
      key: 'is_required',
      width: 100,
      render: (required) => (
        <Tag color={required ? 'red' : 'default'}>{required ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: 'Options',
      dataIndex: 'options',
      key: 'options',
      width: 100,
      render: (options) => (
        <Text>{options?.length || 0} options</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditTemplate(record)}
          >
            Edit
          </Button>
          {(record.field_type === 'select' || record.field_type === 'multiselect' || record.field_type === 'number_with_unit') && (
            <Button
              type="link"
              size="small"
              icon={<SettingOutlined />}
              onClick={() => handleManageOptions(record)}
            >
              Options
            </Button>
          )}
          <Popconfirm
            title="Delete this field template?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteTemplate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const optionColumns = [
    {
      title: 'Order',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 80,
      sorter: (a, b) => a.display_order - b.display_order,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Value',
      dataIndex: 'option_value',
      key: 'option_value',
      width: 150,
    },
    {
      title: 'Label',
      dataIndex: 'option_label',
      key: 'option_label',
      width: 200,
    },
    {
      title: 'Default',
      dataIndex: 'is_default',
      key: 'is_default',
      width: 100,
      render: (isDefault) => (
        <Tag color={isDefault ? 'green' : 'default'}>{isDefault ? 'Yes' : 'No'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditOption(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this option?"
            onConfirm={() => handleDeleteOption(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3}>Component Field Templates</Title>
            <Text type="secondary">
              Configure dynamic fields for each product type
            </Text>
          </Col>
          <Col>
            <Space>
              <Select
                placeholder="Filter by Product Type"
                style={{ width: 250 }}
                allowClear
                value={selectedProductType}
                onChange={setSelectedProductType}
              >
                {types.map((type) => (
                  <Option key={type.id} value={type.id}>
                    {type.name}
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateTemplate}
              >
                Add Field Template
              </Button>
            </Space>
          </Col>
        </Row>

        {Object.entries(groupedTemplates).map(([typeName, typeTemplates]) => (
          <div key={typeName} style={{ marginBottom: 24 }}>
            <Divider orientation="left">
              <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                {typeName}
              </Tag>
            </Divider>
            <Table
              columns={columns}
              dataSource={typeTemplates}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </div>
        ))}

        {filteredTemplates.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">No field templates configured</Text>
          </div>
        )}
      </Card>

      {/* Template Modal */}
      <Modal
        title={editingTemplate ? 'Edit Field Template' : 'Create Field Template'}
        open={isTemplateModalVisible}
        onCancel={() => {
          setIsTemplateModalVisible(false);
          setEditingTemplate(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleTemplateSubmit}
        >
          <Form.Item
            name="product_type_id"
            label="Product Type"
            rules={[{ required: true, message: 'Please select a product type' }]}
          >
            <Select placeholder="Select product type">
              {types.map((type) => (
                <Option key={type.id} value={type.id}>
                  {type.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="field_name"
                label="Field Name (Internal)"
                rules={[{ required: true, message: 'Please enter field name' }]}
              >
                <Input placeholder="e.g., capacity, speed, interface" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="display_label"
                label="Display Label"
                rules={[{ required: true, message: 'Please enter display label' }]}
              >
                <Input placeholder="e.g., Memory Size, Clock Speed" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="field_type"
                label="Field Type"
                rules={[{ required: true, message: 'Please select field type' }]}
              >
                <Select placeholder="Select field type">
                  {fieldTypeOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="display_order"
                label="Display Order"
                rules={[{ required: true, message: 'Please enter display order' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="is_required" label="Required Field" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="placeholder_text" label="Placeholder Text">
            <Input placeholder="e.g., Enter value" />
          </Form.Item>

          <Form.Item name="help_text" label="Help Text">
            <Input.TextArea
              rows={2}
              placeholder="Additional help text for this field"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="min_value" label="Minimum Value (for numbers)">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="max_value" label="Maximum Value (for numbers)">
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => {
                setIsTemplateModalVisible(false);
                setEditingTemplate(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTemplate ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Options Modal */}
      <Modal
        title={`Manage Options: ${selectedTemplate?.display_label}`}
        open={isOptionModalVisible}
        onCancel={() => {
          setIsOptionModalVisible(false);
          setSelectedTemplate(null);
          setEditingOption(null);
          optionForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleCreateOption}
            block
          >
            Add Option
          </Button>

          {editingOption !== null && (
            <Card size="small" title={editingOption ? 'Edit Option' : 'New Option'}>
              <Form
                form={optionForm}
                layout="vertical"
                onFinish={handleOptionSubmit}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="option_value"
                      label="Option Value"
                      rules={[{ required: true, message: 'Please enter option value' }]}
                    >
                      <Input placeholder="e.g., GB, DDR4" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="option_label"
                      label="Option Label"
                      rules={[{ required: true, message: 'Please enter option label' }]}
                    >
                      <Input placeholder="e.g., Gigabytes, DDR4 Memory" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="display_order" label="Display Order" rules={[{ required: true }]}>
                      <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="is_default" label="Set as Default" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Space style={{ float: 'right' }}>
                    <Button onClick={() => {
                      setEditingOption(null);
                      optionForm.resetFields();
                    }}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      {editingOption ? 'Update' : 'Add'}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          )}

          <Table
            columns={optionColumns}
            dataSource={selectedTemplate?.options || []}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Space>
      </Modal>
    </div>
  );
};

export default TemplateManager;
