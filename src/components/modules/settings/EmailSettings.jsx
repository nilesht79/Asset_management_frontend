import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Divider,
  Typography,
  Alert,
  Spin,
  Row,
  Col,
  InputNumber,
  message,
  Badge,
  Statistic,
  Tag,
  Modal
} from 'antd';
import {
  MailOutlined,
  SaveOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
  GoogleOutlined,
  CloudServerOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import emailSettingsService from '../../../services/emailSettings';
import { formatLocalDateTime } from '../../../utils/dateUtils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Password } = Input;

/**
 * Email Settings Component
 * Superadmin interface for configuring email notifications
 */
const EmailSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [form] = Form.useForm();
  const [testEmailModalVisible, setTestEmailModalVisible] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const provider = Form.useWatch('provider', form);

  useEffect(() => {
    fetchConfiguration();
    fetchStats();
  }, []);

  const fetchConfiguration = async () => {
    setLoading(true);
    try {
      const response = await emailSettingsService.getConfiguration();
      const configData = response.data?.data?.config;
      setConfig(configData);

      if (configData) {
        form.setFieldsValue({
          provider: configData.provider || 'smtp',
          smtp_host: configData.smtp_host,
          smtp_port: configData.smtp_port || 587,
          smtp_secure: configData.smtp_secure || false,
          smtp_user: configData.smtp_user,
          gmail_user: configData.gmail_user,
          from_email: configData.from_email,
          from_name: configData.from_name,
          is_enabled: configData.is_enabled
        });
      }
    } catch (error) {
      message.error('Failed to fetch email configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await emailSettingsService.getStats();
      setStats(response.data?.data?.stats);
    } catch (error) {
      console.error('Failed to fetch email stats:', error);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      await emailSettingsService.saveConfiguration(values);
      message.success('Email configuration saved successfully');
      fetchConfiguration();
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error(error.response?.data?.message || 'Failed to save email configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      message.warning('Please enter a test email address');
      return;
    }

    setTesting(true);
    try {
      await emailSettingsService.testConfiguration(testEmail);
      message.success(`Test email sent to ${testEmail}`);
      setTestEmailModalVisible(false);
      setTestEmail('');
      fetchConfiguration();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  const handleToggle = async (checked) => {
    try {
      await emailSettingsService.toggleService(checked);
      message.success(`Email service ${checked ? 'enabled' : 'disabled'}`);
      fetchConfiguration();
    } catch (error) {
      message.error('Failed to toggle email service');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading email configuration...</div>
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
                <MailOutlined />
                <span>Email Configuration</span>
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
                provider: 'smtp',
                smtp_port: 587,
                smtp_secure: false,
                is_enabled: false
              }}
            >
              {/* Service Status */}
              <Alert
                message={
                  <Space>
                    <Text strong>Email Service Status:</Text>
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

              {/* Provider Selection */}
              <Form.Item
                name="provider"
                label="Email Provider"
                rules={[{ required: true, message: 'Please select a provider' }]}
              >
                <Select size="large">
                  <Option value="gmail">
                    <Space>
                      <GoogleOutlined style={{ color: '#EA4335' }} />
                      Gmail (with App Password)
                    </Space>
                  </Option>
                  <Option value="smtp">
                    <Space>
                      <CloudServerOutlined style={{ color: '#1890ff' }} />
                      Custom SMTP Server
                    </Space>
                  </Option>
                </Select>
              </Form.Item>

              <Divider>
                {provider === 'gmail' ? (
                  <Space><GoogleOutlined /> Gmail Settings</Space>
                ) : (
                  <Space><CloudServerOutlined /> SMTP Settings</Space>
                )}
              </Divider>

              {provider === 'gmail' ? (
                /* Gmail Configuration */
                <>
                  <Alert
                    message="Gmail App Password Required"
                    description={
                      <div>
                        <Paragraph style={{ marginBottom: 8 }}>
                          To use Gmail, you need to generate an App Password:
                        </Paragraph>
                        <ol style={{ marginLeft: 16, marginBottom: 0 }}>
                          <li>Enable 2-Step Verification on your Google Account</li>
                          <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">App Passwords</a></li>
                          <li>Generate a new App Password for "Mail"</li>
                          <li>Use the 16-character password below</li>
                        </ol>
                      </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="gmail_user"
                        label="Gmail Address"
                        rules={[
                          { required: provider === 'gmail', message: 'Gmail address is required' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input
                          placeholder="your.email@gmail.com"
                          prefix={<GoogleOutlined />}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="gmail_app_password"
                        label="App Password"
                        extra={config?.gmail_app_password_set ? '(Password is set, enter new value to change)' : ''}
                      >
                        <Password
                          placeholder="xxxx xxxx xxxx xxxx"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              ) : (
                /* SMTP Configuration */
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="smtp_host"
                        label="SMTP Host"
                        rules={[{ required: provider === 'smtp', message: 'SMTP host is required' }]}
                      >
                        <Input placeholder="smtp.gmail.com" size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name="smtp_port"
                        label="Port"
                        rules={[{ required: provider === 'smtp', message: 'Port is required' }]}
                      >
                        <InputNumber
                          placeholder="587"
                          style={{ width: '100%' }}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        name="smtp_secure"
                        label="Use SSL/TLS"
                        valuePropName="checked"
                      >
                        <Switch checkedChildren="SSL" unCheckedChildren="TLS" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="smtp_user"
                        label="SMTP Username"
                        rules={[{ required: provider === 'smtp', message: 'Username is required' }]}
                      >
                        <Input placeholder="username" size="large" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="smtp_password"
                        label="SMTP Password"
                        extra={config?.smtp_password_set ? '(Password is set, enter new value to change)' : ''}
                      >
                        <Password placeholder="password" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}

              <Divider />

              {/* Test Configuration */}
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Button
                  type="dashed"
                  icon={<SendOutlined />}
                  onClick={() => setTestEmailModalVisible(true)}
                  size="large"
                  disabled={!config?.is_enabled}
                >
                  Send Test Email
                </Button>
                {!config?.is_enabled && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Enable email service to send test emails</Text>
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
                <span>Email Statistics</span>
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Total Notifications"
                  value={stats?.total_notifications || 0}
                  prefix={<MailOutlined />}
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
                <Text type="secondary">Last email sent:</Text>
                <div>{formatLocalDateTime(stats.last_sent_at)}</div>
              </div>
            )}

            <Divider />

            {/* Test Status */}
            {config?.test_email_sent_at && (
              <div>
                <Text strong>Last Test:</Text>
                <div style={{ marginTop: 8 }}>
                  <Badge
                    status={config.test_email_status === 'success' ? 'success' : 'error'}
                    text={config.test_email_status === 'success' ? 'Successful' : 'Failed'}
                  />
                  <div style={{ marginTop: 4 }}>
                    <Text type="secondary">
                      {formatLocalDateTime(config.test_email_sent_at)}
                    </Text>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Help Card */}
          <Card title="Help" style={{ marginTop: 16 }}>
            <Paragraph>
              <Text strong>Common SMTP Settings:</Text>
            </Paragraph>
            <ul style={{ paddingLeft: 16, marginBottom: 16 }}>
              <li><Text code>Gmail:</Text> smtp.gmail.com:587</li>
              <li><Text code>Outlook:</Text> smtp.office365.com:587</li>
              <li><Text code>Yahoo:</Text> smtp.mail.yahoo.com:587</li>
            </ul>

            <Alert
              message="Notification Types"
              description="Email notifications are sent for SLA warnings, imminent breaches, and actual breaches based on escalation rules configured in SLA settings."
              type="info"
              showIcon
            />
          </Card>
        </Col>
      </Row>

      {/* Test Email Modal */}
      <Modal
        title="Send Test Email"
        open={testEmailModalVisible}
        onCancel={() => {
          setTestEmailModalVisible(false);
          setTestEmail('');
        }}
        onOk={handleTest}
        confirmLoading={testing}
        okText="Send Test"
      >
        <Form layout="vertical">
          <Form.Item
            label="Test Email Address"
            help="A test email will be sent to this address to verify your configuration"
          >
            <Input
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              size="large"
              prefix={<MailOutlined />}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmailSettings;
