import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Tooltip,
  message,
  Popconfirm,
  Row,
  Col,
  Divider,
  Typography,
  Empty,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BellOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  FireOutlined
} from '@ant-design/icons';
import slaService from '../../../services/sla';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const TRIGGER_TYPES = [
  { value: 'warning_zone', label: 'Warning Zone', color: 'gold', icon: <WarningOutlined /> },
  { value: 'imminent_breach', label: 'Imminent Breach', color: 'orange', icon: <ExclamationCircleOutlined /> },
  { value: 'breached', label: 'Breached', color: 'red', icon: <FireOutlined /> },
  { value: 'recurring_breach', label: 'Recurring Breach', color: 'volcano', icon: <FireOutlined /> }
];

const RECIPIENT_TYPES = [
  { value: 'assigned_engineer', label: 'Assigned Engineer' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'it_head', label: 'IT Head' },
  { value: 'department_head', label: 'Department Head' },
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'custom_role', label: 'Custom Role' },
  { value: 'custom_designation', label: 'Custom Designation' }
];

const REFERENCE_THRESHOLDS = [
  { value: 'avg_tat', label: 'Average TAT (Target)' },
  { value: 'max_tat', label: 'Maximum TAT (Deadline)' }
];

/**
 * Escalation Rules Manager Component
 * Admin interface for managing escalation rules linked to SLA rules
 */
const EscalationRulesManager = ({ slaRuleId, slaRuleName, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [form] = Form.useForm();
  const recipientType = Form.useWatch('recipient_type', form);

  useEffect(() => {
    if (slaRuleId) {
      fetchRules();
    }
    fetchDesignations();
    fetchRoles();
  }, [slaRuleId]);

  const fetchDesignations = async () => {
    setLoadingDesignations(true);
    try {
      const response = await slaService.getDesignations();
      setDesignations(response.data?.data?.designations || []);
    } catch (error) {
      console.error('Failed to fetch designations:', error);
    } finally {
      setLoadingDesignations(false);
    }
  };

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await slaService.getRoles();
      setRoles(response.data?.data?.roles || []);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  // Set form values when modal opens for editing
  useEffect(() => {
    if (modalVisible && editingRule) {
      setTimeout(() => {
        form.setFieldsValue({
          escalation_level: editingRule.escalation_level,
          trigger_type: editingRule.trigger_type,
          reference_threshold: editingRule.reference_threshold,
          trigger_offset_minutes: editingRule.trigger_offset_minutes,
          repeat_interval_minutes: editingRule.repeat_interval_minutes,
          max_repeat_count: editingRule.max_repeat_count,
          recipient_type: editingRule.recipient_type,
          recipient_role: editingRule.recipient_role,
          number_of_recipients: editingRule.number_of_recipients,
          notification_template: editingRule.notification_template,
          include_ticket_details: editingRule.include_ticket_details === true || editingRule.include_ticket_details === 1,
          is_active: editingRule.is_active === true || editingRule.is_active === 1
        });
      }, 0);
    }
  }, [modalVisible, editingRule, form]);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await slaService.getEscalationRules(slaRuleId);
      const data = response.data?.data;
      setRules(data?.rules || []);
    } catch (error) {
      message.error('Failed to fetch escalation rules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRule(null);
    form.resetFields();
    form.setFieldsValue({
      escalation_level: rules.length + 1,
      trigger_type: 'warning_zone',
      reference_threshold: 'avg_tat',
      trigger_offset_minutes: -30,
      recipient_type: 'assigned_engineer',
      number_of_recipients: 1,
      include_ticket_details: true,
      is_active: true
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.resetFields();
    setEditingRule(record);
    setModalVisible(true);
  };

  const handleDelete = async (ruleId) => {
    try {
      await slaService.deleteEscalationRule(ruleId);
      message.success('Escalation rule deleted successfully');
      fetchRules();
    } catch (error) {
      message.error('Failed to delete escalation rule');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const ruleData = {
        escalation_rule_id: editingRule?.escalation_rule_id,
        sla_rule_id: slaRuleId,
        escalation_level: values.escalation_level,
        trigger_type: values.trigger_type,
        reference_threshold: values.reference_threshold,
        trigger_offset_minutes: values.trigger_offset_minutes,
        repeat_interval_minutes: values.repeat_interval_minutes || null,
        max_repeat_count: values.max_repeat_count || null,
        recipient_type: values.recipient_type,
        recipient_role: values.recipient_role || null,
        number_of_recipients: values.number_of_recipients,
        escalation_type: 'notification', // Always email notification
        notification_template: values.notification_template || null,
        include_ticket_details: values.include_ticket_details,
        is_active: values.is_active
      };

      await slaService.saveEscalationRule(ruleData);
      message.success(editingRule ? 'Rule updated successfully' : 'Rule created successfully');
      setModalVisible(false);
      setEditingRule(null);
      fetchRules();
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error('Failed to save escalation rule');
    }
  };

  const getTriggerTypeInfo = (type) => {
    return TRIGGER_TYPES.find(t => t.value === type) || {};
  };

  const getRecipientLabel = (type) => {
    return RECIPIENT_TYPES.find(r => r.value === type)?.label || type;
  };

  const formatOffset = (minutes, refThreshold) => {
    if (minutes === 0) return `At ${refThreshold === 'avg_tat' ? 'Avg' : 'Max'} TAT`;
    if (minutes < 0) return `${Math.abs(minutes)}m before ${refThreshold === 'avg_tat' ? 'Avg' : 'Max'} TAT`;
    return `${minutes}m after ${refThreshold === 'avg_tat' ? 'Avg' : 'Max'} TAT`;
  };

  const columns = [
    {
      title: 'Level',
      dataIndex: 'escalation_level',
      key: 'escalation_level',
      width: 80,
      align: 'center',
      render: (level) => (
        <Badge count={level} style={{ backgroundColor: level <= 2 ? '#52c41a' : level <= 3 ? '#faad14' : '#ff4d4f' }} />
      )
    },
    {
      title: 'Trigger',
      key: 'trigger',
      width: 200,
      render: (_, record) => {
        const triggerInfo = getTriggerTypeInfo(record.trigger_type);
        return (
          <Space direction="vertical" size={0}>
            <Tag color={triggerInfo.color} icon={triggerInfo.icon}>
              {triggerInfo.label}
            </Tag>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {formatOffset(record.trigger_offset_minutes, record.reference_threshold)}
            </Text>
          </Space>
        );
      }
    },
    {
      title: 'Recipients',
      key: 'recipients',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{getRecipientLabel(record.recipient_type)}</Text>
          {record.recipient_role && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {record.recipient_type === 'custom_designation' ? 'Designation' : 'Role'}: {record.recipient_role}
            </Text>
          )}
          <Text type="secondary" style={{ fontSize: '11px' }}>
            Count: {record.number_of_recipients}
          </Text>
        </Space>
      )
    },
    {
      title: 'Repeat',
      key: 'repeat',
      width: 120,
      render: (_, record) => (
        record.repeat_interval_minutes ? (
          <Space direction="vertical" size={0}>
            <Text style={{ fontSize: '12px' }}>Every {record.repeat_interval_minutes}m</Text>
            {record.max_repeat_count && (
              <Text type="secondary" style={{ fontSize: '11px' }}>Max: {record.max_repeat_count}x</Text>
            )}
          </Space>
        ) : (
          <Tag>Once</Tag>
        )
      )
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      align: 'center',
      render: (isActive) => (
        <Badge status={isActive ? 'success' : 'default'} text={isActive ? 'Active' : 'Inactive'} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
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
            title="Delete this rule?"
            onConfirm={() => handleDelete(record.escalation_rule_id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <ThunderboltOutlined style={{ fontSize: 20 }} />
          <Title level={5} style={{ margin: 0 }}>
            Escalation Rules for: {slaRuleName}
          </Title>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Level
        </Button>
      </div>

      {rules.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No escalation rules configured"
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create First Rule
          </Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="escalation_rule_id"
          loading={loading}
          pagination={false}
          size="small"
        />
      )}

      <Modal
        title={
          <Space>
            <BellOutlined />
            <span>{editingRule ? 'Edit Escalation Rule' : 'Create Escalation Rule'}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingRule(null);
        }}
        onOk={handleSubmit}
        width={700}
        okText={editingRule ? 'Update' : 'Create'}
        forceRender
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="escalation_level"
                label="Escalation Level"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="trigger_type"
                label="Trigger Type"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Select>
                  {TRIGGER_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>
                      <Space>
                        {type.icon}
                        {type.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="reference_threshold"
                label="Reference"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Select>
                  {REFERENCE_THRESHOLDS.map(ref => (
                    <Option key={ref.value} value={ref.value}>{ref.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider>Timing</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="trigger_offset_minutes"
                label="Trigger Offset (minutes)"
                tooltip="Negative = before threshold, 0 = at threshold, Positive = after threshold"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="-30 = 30min before" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="repeat_interval_minutes"
                label="Repeat Interval (minutes)"
                tooltip="Leave empty for one-time notification"
              >
                <InputNumber min={5} style={{ width: '100%' }} placeholder="Optional" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="max_repeat_count"
                label="Max Repeat Count"
                tooltip="Maximum number of repeat notifications"
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="Optional" />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Recipients</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="recipient_type"
                label="Recipient Type"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Select>
                  {RECIPIENT_TYPES.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="recipient_role"
                label={recipientType === 'custom_designation' ? 'Designation' : 'Custom Role'}
                tooltip={recipientType === 'custom_designation'
                  ? 'Select the designation to notify'
                  : 'Select the role to notify'}
                rules={[{
                  required: recipientType === 'custom_role' || recipientType === 'custom_designation',
                  message: recipientType === 'custom_designation' ? 'Designation is required' : 'Role is required'
                }]}
              >
                {recipientType === 'custom_designation' ? (
                  <Select
                    placeholder="Select designation"
                    loading={loadingDesignations}
                    showSearch
                    optionFilterProp="children"
                  >
                    {designations.map(d => (
                      <Option key={d.value} value={d.value}>
                        {d.label} ({d.userCount} users)
                      </Option>
                    ))}
                  </Select>
                ) : recipientType === 'custom_role' ? (
                  <Select
                    placeholder="Select role"
                    loading={loadingRoles}
                    showSearch
                    optionFilterProp="children"
                  >
                    {roles.map(r => (
                      <Option key={r.value} value={r.value}>
                        {r.label} ({r.userCount} users)
                      </Option>
                    ))}
                  </Select>
                ) : (
                  <Input placeholder="N/A" disabled />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="number_of_recipients"
                label="Number of Recipients"
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Notification</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="include_ticket_details" valuePropName="checked" label="Include Ticket Details">
                <Switch checkedChildren="Yes" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notification_template"
            label="Custom Message (Optional)"
          >
            <TextArea
              rows={3}
              placeholder="Custom notification message. Leave blank for default template."
            />
          </Form.Item>

          <Form.Item name="is_active" valuePropName="checked" label="Status">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EscalationRulesManager;
