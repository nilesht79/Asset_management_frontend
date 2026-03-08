import React, { useState, useEffect, useRef } from 'react';
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
  WindowsOutlined,
  ReloadOutlined,
  LinkOutlined,
  DisconnectOutlined,
  SafetyCertificateOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import emailSettingsService from '../../../services/emailSettings';
import { formatLocalDateTime } from '../../../utils/dateUtils';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Password } = Input;

/**
 * Email Settings Component
 * Superadmin interface for configuring email notifications
 * Supports Gmail, SMTP, and Microsoft 365 (OAuth 2.0)
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
  const [microsoftAuthLoading, setMicrosoftAuthLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const provider = Form.useWatch('provider', form);
  const popupCheckInterval = useRef(null);

  useEffect(() => {
    fetchConfiguration();
    fetchStats();
    return () => {
      if (popupCheckInterval.current) clearInterval(popupCheckInterval.current);
    };
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
          is_enabled: configData.is_enabled,
          microsoft_client_id: configData.microsoft_client_id,
          microsoft_tenant_id: configData.microsoft_tenant_id
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

  /**
   * Microsoft OAuth — open popup for authentication
   */
  const handleMicrosoftAuth = async () => {
    setMicrosoftAuthLoading(true);
    try {
      // First save config if not saved yet
      const values = await form.validateFields();
      await emailSettingsService.saveConfiguration(values);

      // Get auth URL
      const response = await emailSettingsService.getMicrosoftAuthUrl();
      const authUrl = response.data?.data?.authUrl;

      if (!authUrl) {
        message.error('Failed to get Microsoft authentication URL');
        return;
      }

      // Open popup
      const popup = window.open(
        authUrl,
        'microsoft-auth',
        'width=500,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        message.error('Popup blocked. Please allow popups for this site.');
        return;
      }

      // Poll for popup close
      popupCheckInterval.current = setInterval(() => {
        if (popup.closed) {
          clearInterval(popupCheckInterval.current);
          popupCheckInterval.current = null;
          // Refresh config to check auth status
          setTimeout(() => {
            fetchConfiguration();
            setMicrosoftAuthLoading(false);
          }, 1000);
        }
      }, 1000);
    } catch (error) {
      if (error.errorFields) {
        message.warning('Please fill in required fields and save before authenticating');
      } else {
        message.error(error.response?.data?.message || 'Failed to start Microsoft authentication');
      }
      setMicrosoftAuthLoading(false);
    }
  };

  /**
   * Revoke Microsoft authentication
   */
  const handleRevokeMicrosoft = async () => {
    Modal.confirm({
      title: 'Disconnect Microsoft Account',
      content: 'Are you sure you want to disconnect your Microsoft account? Emails will stop sending until you re-authenticate.',
      okText: 'Disconnect',
      okType: 'danger',
      onOk: async () => {
        setRevokeLoading(true);
        try {
          await emailSettingsService.revokeMicrosoftAuth();
          message.success('Microsoft account disconnected');
          fetchConfiguration();
        } catch (error) {
          message.error('Failed to disconnect Microsoft account');
        } finally {
          setRevokeLoading(false);
        }
      }
    });
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
                  <Option value="microsoft">
                    <Space>
                      <WindowsOutlined style={{ color: '#0078D4' }} />
                      Microsoft 365 / Outlook
                    </Space>
                  </Option>
                </Select>
              </Form.Item>

              {/* Provider-specific settings */}
              {provider === 'gmail' && (
                <>
                  <Divider>
                    <Space><GoogleOutlined /> Gmail Settings</Space>
                  </Divider>

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
              )}

              {provider === 'smtp' && (
                <>
                  <Divider>
                    <Space><CloudServerOutlined /> SMTP Settings</Space>
                  </Divider>

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

              {provider === 'microsoft' && (
                <>
                  <Divider>
                    <Space><WindowsOutlined /> Microsoft 365 Settings</Space>
                  </Divider>

                  <Alert
                    message="Azure App Registration Required"
                    description={
                      <div>
                        <Paragraph style={{ marginBottom: 8 }}>
                          To use Microsoft 365, register an app in Azure Portal:
                        </Paragraph>
                        <ol style={{ marginLeft: 16, marginBottom: 0 }}>
                          <li>Go to <a href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer">Azure App Registrations</a></li>
                          <li>Create a new registration (Web platform)</li>
                          <li>Add redirect URI: <Text code copyable>{`${window.location.origin.replace(':5173', ':3001').replace(':3000', ':3001')}/api/v1/settings/email/microsoft/callback`}</Text></li>
                          <li>Add API permissions: <Text code>Mail.Send</Text>, <Text code>User.Read</Text>, <Text code>offline_access</Text></li>
                          <li>Create a Client Secret and copy the values below</li>
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
                        name="microsoft_client_id"
                        label="Application (Client) ID"
                        rules={[{ required: provider === 'microsoft', message: 'Client ID is required' }]}
                      >
                        <Input
                          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="microsoft_tenant_id"
                        label="Directory (Tenant) ID"
                        rules={[{ required: provider === 'microsoft', message: 'Tenant ID is required' }]}
                        extra="Use 'common' for multi-tenant apps"
                      >
                        <Input
                          placeholder="common"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="microsoft_client_secret"
                        label="Client Secret"
                        extra={config?.microsoft_client_secret_set ? '(Secret is set, enter new value to change)' : ''}
                      >
                        <Password
                          placeholder="Enter client secret value"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Microsoft Authentication Status */}
                  <Card
                    size="small"
                    style={{
                      marginTop: 16,
                      background: config?.microsoft_is_authenticated ? '#f6ffed' : '#fff7e6',
                      borderColor: config?.microsoft_is_authenticated ? '#b7eb8f' : '#ffd591'
                    }}
                  >
                    <Row align="middle" justify="space-between">
                      <Col>
                        <Space direction="vertical" size={4}>
                          <Space>
                            <SafetyCertificateOutlined
                              style={{
                                color: config?.microsoft_is_authenticated ? '#52c41a' : '#faad14',
                                fontSize: 20
                              }}
                            />
                            <Text strong style={{ fontSize: 15 }}>
                              {config?.microsoft_is_authenticated ? 'Authenticated' : 'Not Authenticated'}
                            </Text>
                          </Space>
                          {config?.microsoft_is_authenticated && (
                            <Text type="secondary" style={{ marginLeft: 28 }}>
                              Connected as <Text strong>{config.microsoft_display_name}</Text> ({config.microsoft_user_email})
                            </Text>
                          )}
                          {!config?.microsoft_is_authenticated && (
                            <Text type="secondary" style={{ marginLeft: 28 }}>
                              Save configuration first, then authenticate with Microsoft
                            </Text>
                          )}
                        </Space>
                      </Col>
                      <Col>
                        {config?.microsoft_is_authenticated ? (
                          <Button
                            danger
                            icon={<DisconnectOutlined />}
                            onClick={handleRevokeMicrosoft}
                            loading={revokeLoading}
                          >
                            Disconnect
                          </Button>
                        ) : (
                          <Button
                            type="primary"
                            icon={microsoftAuthLoading ? <LoadingOutlined /> : <LinkOutlined />}
                            onClick={handleMicrosoftAuth}
                            loading={microsoftAuthLoading}
                            style={{ background: '#0078D4', borderColor: '#0078D4' }}
                          >
                            Authenticate with Microsoft
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </>
              )}

              {/* Sender Information — only for Gmail and SMTP */}
              {provider !== 'microsoft' && (
                <>
                  <Divider>
                    <Space><MailOutlined /> Sender Information</Space>
                  </Divider>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="from_email"
                        label="From Email Address"
                        rules={[
                          { required: provider !== 'microsoft', message: 'From email is required' },
                          { type: 'email', message: 'Please enter a valid email' }
                        ]}
                      >
                        <Input
                          placeholder="noreply@yourcompany.com"
                          prefix={<MailOutlined />}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="from_name"
                        label="From Name"
                      >
                        <Input
                          placeholder="Unified ITSM Platform"
                          size="large"
                        />
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
                  disabled={!config?.is_enabled || (provider === 'microsoft' && !config?.microsoft_is_authenticated)}
                >
                  Send Test Email
                </Button>
                {!config?.is_enabled && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Enable email service to send test emails</Text>
                  </div>
                )}
                {provider === 'microsoft' && config?.is_enabled && !config?.microsoft_is_authenticated && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Authenticate with Microsoft before sending test emails</Text>
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

            <Paragraph>
              <Text strong>Microsoft 365:</Text>
            </Paragraph>
            <ul style={{ paddingLeft: 16, marginBottom: 16 }}>
              <li>Uses OAuth 2.0 + Microsoft Graph API</li>
              <li>Tokens auto-refresh (no manual intervention)</li>
              <li>Requires Azure App Registration</li>
              <li>Supports custom domains (e.g., @company.com)</li>
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
