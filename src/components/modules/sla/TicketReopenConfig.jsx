/**
 * Ticket Reopen Configuration Component
 * Allows admins to configure ticket reopen settings
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Select,
  Switch,
  Button,
  Space,
  Typography,
  Spin,
  Alert,
  Descriptions,
  Divider,
  message
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import ticketService from '../../../services/ticket';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const TicketReopenConfig = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await ticketService.getReopenConfig();
      const data = response.data?.data || response.data;
      setConfig(data);
      if (data) {
        form.setFieldsValue({
          reopen_window_days: data.reopen_window_days,
          max_reopen_count: data.max_reopen_count,
          sla_reset_mode: data.sla_reset_mode,
          require_reopen_reason: data.require_reopen_reason,
          notify_assignee: data.notify_assignee,
          notify_manager: data.notify_manager
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      message.error('Failed to load reopen configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      await ticketService.updateReopenConfig(values);
      message.success('Configuration saved successfully');
      fetchConfig();
    } catch (error) {
      console.error('Error saving config:', error);
      message.error(error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" />
        <p className="mt-4 text-gray-500">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message="Ticket Reopen Settings"
        description="Configure how and when closed tickets can be reopened. This affects ticket workflow and SLA tracking."
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            reopen_window_days: 7,
            max_reopen_count: 3,
            sla_reset_mode: 'continue',
            require_reopen_reason: true,
            notify_assignee: true,
            notify_manager: true
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reopen Window */}
            <div>
              <Title level={5}>Time Window</Title>
              <Paragraph type="secondary">
                How long after closure can a ticket be reopened?
              </Paragraph>

              <Form.Item
                name="reopen_window_days"
                label="Reopen Window (Days)"
                rules={[
                  { required: true, message: 'Required' },
                  { type: 'number', min: 1, max: 365, message: 'Must be 1-365 days' }
                ]}
                tooltip="Number of days after closure during which a ticket can be reopened"
              >
                <InputNumber
                  min={1}
                  max={365}
                  style={{ width: '100%' }}
                  addonAfter="days"
                />
              </Form.Item>

              <Form.Item
                name="max_reopen_count"
                label="Maximum Reopens Allowed"
                rules={[
                  { required: true, message: 'Required' },
                  { type: 'number', min: 1, max: 10, message: 'Must be 1-10 times' }
                ]}
                tooltip="Maximum number of times a single ticket can be reopened"
              >
                <InputNumber
                  min={1}
                  max={10}
                  style={{ width: '100%' }}
                  addonAfter="times"
                />
              </Form.Item>
            </div>

            {/* SLA Handling */}
            <div>
              <Title level={5}>SLA Handling</Title>
              <Paragraph type="secondary">
                How should SLA be handled when a ticket is reopened?
              </Paragraph>

              <Form.Item
                name="sla_reset_mode"
                label="SLA Reset Mode"
                rules={[{ required: true, message: 'Required' }]}
                tooltip="Determines how SLA timers are handled when reopening"
              >
                <Select
                  optionLabelProp="label"
                  style={{ width: '100%' }}
                  dropdownStyle={{ minWidth: 280 }}
                >
                  <Option value="continue" label="Continue">
                    <div style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>
                      <Text strong>Continue</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        SLA timer continues from where it left off
                      </Text>
                    </div>
                  </Option>
                  <Option value="reset" label="Reset">
                    <div style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>
                      <Text strong>Reset</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        SLA timer resets to beginning
                      </Text>
                    </div>
                  </Option>
                  <Option value="new_sla" label="New SLA">
                    <div style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>
                      <Text strong>New SLA</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Apply a new SLA calculation
                      </Text>
                    </div>
                  </Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <Divider />

          {/* Additional Settings */}
          <Title level={5}>Additional Settings</Title>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Form.Item
              name="require_reopen_reason"
              label="Require Reopen Reason"
              valuePropName="checked"
              tooltip="If enabled, users must provide a reason when reopening a ticket"
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>

            <Form.Item
              name="notify_assignee"
              label="Notify Assigned Engineer"
              valuePropName="checked"
              tooltip="Send notification to the assigned engineer when ticket is reopened"
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>

            <Form.Item
              name="notify_manager"
              label="Notify Manager"
              valuePropName="checked"
              tooltip="Send notification to the ticket manager/coordinator when ticket is reopened"
            >
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </div>

          <Divider />

          {/* Actions */}
          <div className="flex justify-end">
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchConfig}>
                Reset
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving}
              >
                Save Configuration
              </Button>
            </Space>
          </div>
        </Form>
      </Card>

      {/* Current Config Display */}
      {config && (
        <Card title="Current Configuration" size="small">
          <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
            <Descriptions.Item label="Reopen Window">
              {config.reopen_window_days} days
            </Descriptions.Item>
            <Descriptions.Item label="Max Reopens">
              {config.max_reopen_count} times
            </Descriptions.Item>
            <Descriptions.Item label="SLA Mode">
              {config.sla_reset_mode?.toUpperCase()}
            </Descriptions.Item>
            <Descriptions.Item label="Require Reason">
              {config.require_reopen_reason ? 'Yes' : 'No'}
            </Descriptions.Item>
            <Descriptions.Item label="Notify Engineer">
              {config.notify_assignee ? 'Yes' : 'No'}
            </Descriptions.Item>
            <Descriptions.Item label="Notify Manager">
              {config.notify_manager ? 'Yes' : 'No'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );
};

export default TicketReopenConfig;
