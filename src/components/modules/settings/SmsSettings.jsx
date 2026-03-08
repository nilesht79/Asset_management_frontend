import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Space,
  Divider,
  Typography,
  Alert,
  Spin,
  Row,
  Col,
  message,
  Badge,
  Statistic,
  Tag,
  Modal
} from 'antd';
import {
  MessageOutlined,
  SaveOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  ApiOutlined,
  ReloadOutlined,
  PhoneOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import smsSettingsService from '../../../services/smsSettings';
import { formatLocalDateTime } from '../../../utils/dateUtils';

const { Title, Text, Paragraph } = Typography;
const { Password } = Input;

/**
 * SMS Settings Component
 * Superadmin interface for configuring SMS notifications via HTTP-based SMS gateways
 */
const SmsSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [form] = Form.useForm();
  const [testSmsModalVisible, setTestSmsModalVisible] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const DLT_TEMPLATE = 'Ticket ID TKT-TEST-0001 has been assigned to you at Test Location, Ground Floor, IT DEPARTMENT, raised by TEST USER(00000) - MMRDA';
  const [testMessage, setTestMessage] = useState(DLT_TEMPLATE);

  useEffect(() => {
    fetchConfiguration();
    fetchStats();
  }, []);

  const fetchConfiguration = async () => {
    setLoading(true);
    try {
      const response = await smsSettingsService.getConfiguration();
      const configData = response.data?.data?.config;
      setConfig(configData);

      if (configData) {
        form.setFieldsValue({
          base_url: configData.base_url,
          username: configData.username,
          sender_id: configData.sender_id,
          pe_id: configData.pe_id,
          template_id: configData.template_id,
          is_enabled: configData.is_enabled
        });
      }
    } catch (error) {
      message.error('Failed to fetch SMS configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await smsSettingsService.getStats();
      setStats(response.data?.data?.stats);
    } catch (error) {
      console.error('Failed to fetch SMS stats:', error);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      await smsSettingsService.saveConfiguration(values);
      message.success('SMS configuration saved successfully');
      fetchConfiguration();
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error(error.response?.data?.message || 'Failed to save SMS configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testPhone) {
      message.warning('Please enter a test phone number');
      return;
    }

    setTesting(true);
    try {
      await smsSettingsService.testConfiguration(testPhone, testMessage);
      message.success(`Test SMS sent to ${testPhone}`);
      setTestSmsModalVisible(false);
      setTestPhone('');
      setTestMessage(DLT_TEMPLATE);
      fetchConfiguration();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send test SMS');
    } finally {
      setTesting(false);
    }
  };

  const handleToggle = async (checked) => {
    try {
      await smsSettingsService.toggleService(checked);
      message.success(`SMS service ${checked ? 'enabled' : 'disabled'}`);
      fetchConfiguration();
    } catch (error) {
      message.error('Failed to toggle SMS service');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading SMS configuration...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        {/* Main Configuration Card */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <MessageOutlined />
                <span>SMS Configuration</span>
              </Space>
            }
            extra={
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchConfiguration}
                >
                  Refresh
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
            }
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                is_enabled: false
              }}
            >
              {/* Service Status */}
              <Alert
                message={
                  <Space>
                    <Text strong>SMS Service Status:</Text>
                    {config?.is_enabled ? (
                      <Tag color="success" icon={<CheckCircleOutlined />}>Enabled</Tag>
                    ) : (
                      <Tag color="default" icon={<CloseCircleOutlined />}>Disabled</Tag>
                    )}
                  </Space>
                }
                type={config?.is_enabled ? 'success' : 'warning'}
                style={{ marginBottom: 24 }}
                action={
                  <Switch
                    checked={config?.is_enabled}
                    onChange={handleToggle}
                    checkedChildren="ON"
                    unCheckedChildren="OFF"
                  />
                }
              />

              <Divider>
                <Space><GlobalOutlined /> Gateway Settings</Space>
              </Divider>

              {/* Gateway URL */}
              <Form.Item
                name="base_url"
                label="SMS Gateway Base URL"
                rules={[{ required: true, message: 'Gateway base URL is required' }]}
              >
                <Input
                  placeholder="https://your-gateway-url:port"
                  prefix={<ApiOutlined />}
                  size="large"
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: 'Username is required' }]}
                  >
                    <Input placeholder="Gateway username" size="large" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="password"
                    label="Password"
                    extra={config?.password_set ? '(Password is set, enter new value to change)' : ''}
                  >
                    <Password placeholder="Gateway password" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>
                <Space><MessageOutlined /> Sender Details</Space>
              </Divider>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="sender_id"
                    label="Sender ID"
                    rules={[{ required: true, message: 'Sender ID is required' }]}
                    extra="Header name that appears on SMS"
                  >
                    <Input placeholder="Sender ID" size="large" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="pe_id"
                    label="PE ID (Principal Entity ID)"
                    extra="DLT registered entity ID"
                  >
                    <Input placeholder="Principal Entity ID" size="large" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="template_id"
                    label="Template ID"
                    extra="DLT registered template ID"
                  >
                    <Input placeholder="Template ID" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              {/* Test Configuration */}
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Button
                  type="dashed"
                  icon={<SendOutlined />}
                  onClick={() => setTestSmsModalVisible(true)}
                  size="large"
                  disabled={!config?.is_enabled}
                >
                  Send Test SMS
                </Button>
                {!config?.is_enabled && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Enable SMS service to send test messages</Text>
                  </div>
                )}
              </div>
            </Form>
          </Card>
        </Col>

        {/* Statistics Card */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <SettingOutlined />
                <span>SMS Statistics</span>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Total SMS"
                  value={stats?.total_sms || 0}
                  prefix={<MessageOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Sent"
                  value={stats?.sent || 0}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Pending"
                  value={stats?.pending || 0}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Failed"
                  value={stats?.failed || 0}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Col>
            </Row>

            {stats?.last_sent_at && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Last SMS sent:</Text>
                <div>{formatLocalDateTime(stats.last_sent_at)}</div>
              </div>
            )}

            <Divider />

            {/* Test Status */}
            {config?.test_sms_sent_at && (
              <div>
                <Text strong>Last Test:</Text>
                <div style={{ marginTop: 8 }}>
                  <Badge
                    status={config.test_sms_status === 'success' ? 'success' : 'error'}
                    text={config.test_sms_status === 'success' ? 'Successful' : 'Failed'}
                  />
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary">
                      {formatLocalDateTime(config.test_sms_sent_at)}
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Help Card */}
          <Card title="Help" style={{ marginTop: 16 }}>
            <Paragraph>
              <Text strong>SMS Gateway Configuration:</Text>
            </Paragraph>
            <Paragraph>
              Configure your SMS gateway provider credentials here. This system supports HTTP-based
              SMS gateways that accept GET requests with query parameters.
            </Paragraph>

            <Paragraph>
              <Text strong>DLT Registration (India):</Text>
            </Paragraph>
            <ul style={{ paddingLeft: 16, marginBottom: 16 }}>
              <li><Text code>PE ID</Text> - Principal Entity ID from DLT portal</li>
              <li><Text code>Template ID</Text> - Registered message template ID</li>
              <li><Text code>Sender ID</Text> - Registered header/sender name</li>
            </ul>

            <Alert
              message="Notification Types"
              description="SMS notifications can be sent for ticket assignments, SLA warnings, and other critical alerts that require immediate attention."
              type="info"
              showIcon
            />
          </Card>
        </Col>
      </Row>

      {/* Test SMS Modal */}
      <Modal
        title="Send Test SMS"
        open={testSmsModalVisible}
        onCancel={() => {
          setTestSmsModalVisible(false);
          setTestPhone('');
          setTestMessage(DLT_TEMPLATE);
        }}
        onOk={handleTest}
        confirmLoading={testing}
        okText="Send Test"
        width={600}
      >
        <Alert
          message="DLT Template Compliance"
          description="The test message must match your DLT-registered template exactly, otherwise the telecom operator will silently drop the SMS even though the gateway accepts it."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form layout="vertical">
          <Form.Item
            label="Test Phone Number"
            help="Enter a 10-digit mobile number (with or without 91 prefix)"
          >
            <Input
              placeholder="10-digit mobile number"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              size="large"
              prefix={<PhoneOutlined />}
            />
          </Form.Item>
          <Form.Item
            label="Test Message"
            help="Pre-filled with the DLT-registered template. You may edit the sample values but the message format must match your registered template."
          >
            <Input.TextArea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              rows={4}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SmsSettings;
