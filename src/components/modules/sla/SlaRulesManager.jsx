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
  Collapse,
  Badge,
  Drawer
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  BellOutlined
} from '@ant-design/icons';
import slaService from '../../../services/sla';
import EscalationRulesManager from './EscalationRulesManager';

const { Text, Title } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
const { TextArea } = Input;

/**
 * SLA Rules Manager Component
 * Admin interface for managing SLA rules
 */
const SlaRulesManager = () => {
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [businessHoursSchedules, setBusinessHoursSchedules] = useState([]);
  const [holidayCalendars, setHolidayCalendars] = useState([]);
  const [escalationDrawerVisible, setEscalationDrawerVisible] = useState(false);
  const [selectedRuleForEscalation, setSelectedRuleForEscalation] = useState(null);
  const [form] = Form.useForm();

  const handleManageEscalations = (record) => {
    setSelectedRuleForEscalation(record);
    setEscalationDrawerVisible(true);
  };

  useEffect(() => {
    fetchRules();
    fetchSchedules();
    fetchCalendars();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await slaService.getRules();
      const data = response.data?.data;
      setRules(data?.rules || []);
    } catch (error) {
      message.error('Failed to fetch SLA rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await slaService.getBusinessHoursSchedules();
      const data = response.data?.data;
      setBusinessHoursSchedules(data?.schedules || []);
    } catch (error) {
      console.error('Failed to fetch business hours schedules:', error);
    }
  };

  const fetchCalendars = async () => {
    try {
      const response = await slaService.getHolidayCalendars();
      const data = response.data?.data;
      setHolidayCalendars(data?.calendars || []);
    } catch (error) {
      console.error('Failed to fetch holiday calendars:', error);
    }
  };

  const handleCreate = () => {
    setEditingRule(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
      priority_order: rules.length + 1,
      min_tat_minutes: 60,
      avg_tat_minutes: 120,
      max_tat_minutes: 240
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRule(record);

    // Parse pause conditions from JSON
    let pauseConditions = {};
    try {
      pauseConditions = JSON.parse(record.pause_conditions || '{}');
    } catch (e) {
      pauseConditions = {};
    }

    // Parse comma-separated fields from database
    // Note: "all" in database means "any" (no specific selection) in UI
    const parseCommaSeparated = (value) => {
      if (!value || value.toLowerCase() === 'all') return [];
      return value.split(',').map(s => s.trim()).filter(s => s && s.toLowerCase() !== 'all');
    };

    form.setFieldsValue({
      rule_name: record.rule_name,
      description: record.description,
      priority_order: record.priority_order,
      is_active: record.is_active === true || record.is_active === 1,
      min_tat_minutes: record.min_tat_minutes,
      avg_tat_minutes: record.avg_tat_minutes,
      max_tat_minutes: record.max_tat_minutes,
      business_hours_schedule_id: record.business_hours_schedule_id,
      holiday_calendar_id: record.holiday_calendar_id,
      // Conditions from separate database columns
      // "all" means no specific selection (any)
      ticket_priorities: parseCommaSeparated(record.applicable_priority),
      ticket_types: parseCommaSeparated(record.applicable_ticket_type),
      ticket_channels: parseCommaSeparated(record.applicable_ticket_channels),
      vip_only: record.is_vip_override === true || record.is_vip_override === 1,
      asset_importance: parseCommaSeparated(record.applicable_asset_importance),
      // Pause conditions
      pause_on_pending_closure: pauseConditions.pending_closure === true || pauseConditions.pending_closure === 1,
      pause_on_awaiting_info: pauseConditions.awaiting_info === true || pauseConditions.awaiting_info === 1,
      pause_on_hold: pauseConditions.on_hold === true || pauseConditions.on_hold === 1
    });
    setModalVisible(true);
  };

  const handleDuplicate = (record) => {
    setEditingRule(null);

    let pauseConditions = {};
    try {
      pauseConditions = JSON.parse(record.pause_conditions || '{}');
    } catch (e) {
      pauseConditions = {};
    }

    // Parse comma-separated fields from database
    // Note: "all" in database means "any" (no specific selection) in UI
    const parseCommaSeparated = (value) => {
      if (!value || value.toLowerCase() === 'all') return [];
      return value.split(',').map(s => s.trim()).filter(s => s && s.toLowerCase() !== 'all');
    };

    form.setFieldsValue({
      rule_name: `${record.rule_name} (Copy)`,
      description: record.description,
      priority_order: rules.length + 1,
      is_active: false, // Duplicates start as inactive
      min_tat_minutes: record.min_tat_minutes,
      avg_tat_minutes: record.avg_tat_minutes,
      max_tat_minutes: record.max_tat_minutes,
      business_hours_schedule_id: record.business_hours_schedule_id,
      holiday_calendar_id: record.holiday_calendar_id,
      ticket_priorities: parseCommaSeparated(record.applicable_priority),
      ticket_types: parseCommaSeparated(record.applicable_ticket_type),
      ticket_channels: parseCommaSeparated(record.applicable_ticket_channels),
      vip_only: record.is_vip_override === true || record.is_vip_override === 1,
      asset_importance: parseCommaSeparated(record.applicable_asset_importance),
      pause_on_pending_closure: pauseConditions.pending_closure === true || pauseConditions.pending_closure === 1,
      pause_on_awaiting_info: pauseConditions.awaiting_info === true || pauseConditions.awaiting_info === 1,
      pause_on_hold: pauseConditions.on_hold === true || pauseConditions.on_hold === 1
    });
    setModalVisible(true);
  };

  const handleDelete = async (ruleId) => {
    try {
      await slaService.deleteRule(ruleId);
      message.success('SLA rule deleted successfully');
      fetchRules();
    } catch (error) {
      message.error('Failed to delete SLA rule');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Build pause conditions as JSON
      const pauseConditions = {
        pending_closure: values.pause_on_pending_closure || false,
        awaiting_info: values.pause_on_awaiting_info || false,
        on_hold: values.pause_on_hold || false
      };

      // Build rule data matching backend column structure
      const ruleData = {
        rule_name: values.rule_name,
        description: values.description,
        priority_order: values.priority_order,
        is_active: values.is_active,
        min_tat_minutes: values.min_tat_minutes,
        avg_tat_minutes: values.avg_tat_minutes,
        max_tat_minutes: values.max_tat_minutes,
        business_hours_schedule_id: values.business_hours_schedule_id || null,
        holiday_calendar_id: values.holiday_calendar_id || null,
        // Conditions as separate comma-separated fields
        applicable_priority: values.ticket_priorities?.length > 0 ? values.ticket_priorities.join(',') : null,
        applicable_ticket_type: values.ticket_types?.length > 0 ? values.ticket_types.join(',') : null,
        applicable_ticket_channels: values.ticket_channels?.length > 0 ? values.ticket_channels.join(',') : null,
        applicable_asset_importance: values.asset_importance?.length > 0 ? values.asset_importance.join(',') : null,
        is_vip_override: values.vip_only || false,
        allow_pause_resume: true,
        pause_conditions: pauseConditions
      };

      if (editingRule) {
        await slaService.updateRule(editingRule.sla_rule_id, ruleData);
        message.success('SLA rule updated successfully');
      } else {
        await slaService.createRule(ruleData);
        message.success('SLA rule created successfully');
      }

      setModalVisible(false);
      fetchRules();
    } catch (error) {
      if (error.errorFields) {
        return; // Form validation error
      }
      message.error('Failed to save SLA rule');
    }
  };

  const formatMinutes = (minutes) => {
    return slaService.formatDuration(minutes);
  };

  const renderConditions = (record) => {
    const tags = [];

    // Helper to parse comma-separated values
    // "all" means "any" - no specific filter
    const parseCommaSeparated = (value) => {
      if (!value || value.toLowerCase() === 'all') return [];
      return value.split(',').map(s => s.trim()).filter(s => s && s.toLowerCase() !== 'all');
    };

    // VIP Only flag
    if (record.is_vip_override === true || record.is_vip_override === 1) {
      tags.push(<Tag key="vip" color="gold">VIP Only</Tag>);
    }

    // Priorities from applicable_priority column
    const priorities = parseCommaSeparated(record.applicable_priority);
    if (priorities.length > 0) {
      priorities.forEach(p => {
        tags.push(
          <Tag key={`priority-${p}`} color={slaService.getPriorityColor(p)}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Tag>
        );
      });
    }

    // Ticket types from applicable_ticket_type column
    const ticketTypes = parseCommaSeparated(record.applicable_ticket_type);
    if (ticketTypes.length > 0) {
      ticketTypes.forEach(t => {
        tags.push(<Tag key={`type-${t}`} color="blue">{t}</Tag>);
      });
    }

    // Ticket channels from applicable_ticket_channels column
    const channels = parseCommaSeparated(record.applicable_ticket_channels);
    if (channels.length > 0) {
      channels.forEach(c => {
        tags.push(<Tag key={`channel-${c}`} color="purple">{c}</Tag>);
      });
    }

    // Asset importance from applicable_asset_importance column
    const importance = parseCommaSeparated(record.applicable_asset_importance);
    if (importance.length > 0) {
      importance.forEach(i => {
        tags.push(<Tag key={`importance-${i}`} color="cyan">{i}</Tag>);
      });
    }

    return tags.length > 0 ? <Space wrap size={[4, 4]}>{tags}</Space> : <Text type="secondary">Any</Text>;
  };

  const columns = [
    {
      title: 'Priority',
      dataIndex: 'priority_order',
      key: 'priority_order',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.priority_order - b.priority_order,
      defaultSortOrder: 'ascend'
    },
    {
      title: 'Rule Name',
      dataIndex: 'rule_name',
      key: 'rule_name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Text strong>{text}</Text>
            {!record.is_active && <Tag color="default">Inactive</Tag>}
          </Space>
          {record.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text>
          )}
        </Space>
      )
    },
    {
      title: 'Conditions',
      key: 'conditions',
      render: (_, record) => renderConditions(record)
    },
    {
      title: 'TAT Thresholds',
      key: 'tat',
      width: 200,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Minimum TAT">
            <Tag color="green">{formatMinutes(record.min_tat_minutes)}</Tag>
          </Tooltip>
          <Tooltip title="Average TAT">
            <Tag color="gold">{formatMinutes(record.avg_tat_minutes)}</Tag>
          </Tooltip>
          <Tooltip title="Maximum TAT">
            <Tag color="red">{formatMinutes(record.max_tat_minutes)}</Tag>
          </Tooltip>
        </Space>
      )
    },
    {
      title: 'Business Hours',
      dataIndex: 'business_hours_name',
      key: 'business_hours_name',
      width: 150,
      render: (text) => text || <Text type="secondary">Default</Text>
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
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Escalation Rules">
            <Button
              type="text"
              icon={<BellOutlined />}
              onClick={() => handleManageEscalations(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleDuplicate(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this SLA rule?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.sla_rule_id)}
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
    <Card
      title={
        <Space>
          <ClockCircleOutlined />
          <span>SLA Rules</span>
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Create Rule
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={rules}
        rowKey="sla_rule_id"
        loading={loading}
        pagination={false}
        size="middle"
      />

      <Modal
        title={
          <Space>
            <ThunderboltOutlined />
            <span>{editingRule ? 'Edit SLA Rule' : 'Create SLA Rule'}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={800}
        okText={editingRule ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="rule_name"
                label="Rule Name"
                rules={[{ required: true, message: 'Please enter rule name' }]}
              >
                <Input placeholder="e.g., Critical Priority SLA" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="priority_order"
                label={
                  <Space>
                    <span>Priority Order</span>
                    <Tooltip title="Lower number = higher priority. Rules are evaluated in order.">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber min={1} max={999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea rows={2} placeholder="Brief description of this rule" />
          </Form.Item>

          <Divider>TAT Thresholds (in minutes)</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="min_tat_minutes"
                label={<Text type="success">Minimum TAT</Text>}
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  addonAfter="min"
                  placeholder="60"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="avg_tat_minutes"
                label={<Text type="warning">Average TAT</Text>}
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  addonAfter="min"
                  placeholder="120"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="max_tat_minutes"
                label={<Text type="danger">Maximum TAT</Text>}
                rules={[{ required: true, message: 'Required' }]}
              >
                <InputNumber
                  min={1}
                  style={{ width: '100%' }}
                  addonAfter="min"
                  placeholder="240"
                />
              </Form.Item>
            </Col>
          </Row>

          <Collapse ghost defaultActiveKey={['conditions']}>
            <Panel header="Matching Conditions" key="conditions">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="ticket_priorities" label="Ticket Priorities">
                    <Select mode="multiple" placeholder="Any priority" allowClear>
                      <Option value="critical">Critical</Option>
                      <Option value="high">High</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="low">Low</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="ticket_types" label="Ticket Types">
                    <Select mode="multiple" placeholder="Any type" allowClear>
                      <Option value="incident">Incident</Option>
                      <Option value="service_request">Service Request</Option>
                      <Option value="change_request">Change Request</Option>
                      <Option value="problem">Problem</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="ticket_channels" label="Ticket Channels">
                    <Select mode="multiple" placeholder="Any channel" allowClear>
                      <Option value="portal">Portal</Option>
                      <Option value="email">Email</Option>
                      <Option value="phone">Phone</Option>
                      <Option value="walk_in">Walk-in</Option>
                      <Option value="chat">Chat</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="asset_importance" label="Asset Importance">
                    <Select mode="multiple" placeholder="Any importance" allowClear>
                      <Option value="mission_critical">Mission Critical</Option>
                      <Option value="business_critical">Business Critical</Option>
                      <Option value="important">Important</Option>
                      <Option value="standard">Standard</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="vip_only" valuePropName="checked">
                <Switch /> <Text style={{ marginLeft: 8 }}>VIP Users Only</Text>
              </Form.Item>
            </Panel>

            <Panel header="Business Hours & Calendar" key="schedule">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="business_hours_schedule_id" label="Business Hours Schedule">
                    <Select placeholder="Select schedule" allowClear>
                      {businessHoursSchedules.map(schedule => (
                        <Option key={schedule.schedule_id} value={schedule.schedule_id}>
                          {schedule.schedule_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="holiday_calendar_id" label="Holiday Calendar">
                    <Select placeholder="Select calendar" allowClear>
                      {holidayCalendars.map(calendar => (
                        <Option key={calendar.calendar_id} value={calendar.calendar_id}>
                          {calendar.calendar_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            <Panel header="Pause Conditions" key="pause">
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                SLA timer will pause when ticket enters these statuses
              </Text>
              <Space direction="vertical">
                <Form.Item name="pause_on_pending_closure" valuePropName="checked" noStyle>
                  <Switch size="small" />
                </Form.Item>
                <Text style={{ marginLeft: 8 }}>Pending Closure</Text>

                <Form.Item name="pause_on_awaiting_info" valuePropName="checked" noStyle>
                  <Switch size="small" />
                </Form.Item>
                <Text style={{ marginLeft: 8 }}>Awaiting Information</Text>

                <Form.Item name="pause_on_hold" valuePropName="checked" noStyle>
                  <Switch size="small" />
                </Form.Item>
                <Text style={{ marginLeft: 8 }}>On Hold</Text>
              </Space>
            </Panel>
          </Collapse>

          <Divider />

          <Form.Item name="is_active" valuePropName="checked">
            <Switch /> <Text style={{ marginLeft: 8 }}>Active</Text>
          </Form.Item>
        </Form>
      </Modal>

      {/* Escalation Rules Drawer */}
      <Drawer
        title={
          <Space>
            <BellOutlined />
            <span>Escalation Rules</span>
          </Space>
        }
        placement="right"
        width={800}
        open={escalationDrawerVisible}
        onClose={() => {
          setEscalationDrawerVisible(false);
          setSelectedRuleForEscalation(null);
        }}
        destroyOnClose
      >
        {selectedRuleForEscalation && (
          <EscalationRulesManager
            slaRuleId={selectedRuleForEscalation.sla_rule_id}
            slaRuleName={selectedRuleForEscalation.rule_name}
            onClose={() => setEscalationDrawerVisible(false)}
          />
        )}
      </Drawer>
    </Card>
  );
};

export default SlaRulesManager;
