import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Switch,
  Button,
  Space,
  Typography,
  Divider,
  Alert,
  Spin,
  message,
  Tooltip,
  Row,
  Col,
  Descriptions,
  Tag,
  Collapse
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

/**
 * FaultThresholdConfig Component
 * Admin UI for configuring fault analysis threshold rules
 */
const FaultThresholdConfig = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState(null);
  const [form] = Form.useForm();

  // Default configuration values (matching backend stored procedure defaults)
  const defaultConfig = {
    // Asset-level thresholds
    asset_fault_count_threshold: 3,
    asset_fault_period_months: 6,

    // Model-level thresholds
    model_fault_count_threshold: 5,
    model_fault_period_months: 3,

    // Cost thresholds
    high_cost_threshold_percentage: 50, // % of purchase cost

    // Same fault thresholds
    same_fault_count_threshold: 2,
    same_fault_period_months: 3,

    // Auto-analysis settings
    auto_analysis_enabled: true,
    auto_analysis_interval_hours: 24,

    // Notification settings
    notify_on_critical_flag: true,
    notify_on_high_flag: true,
    notify_on_medium_flag: false,
    notify_on_low_flag: false
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from backend
      // For now, load from localStorage or use defaults
      const savedConfig = localStorage.getItem('faultThresholdConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        form.setFieldsValue(parsed);
      } else {
        setConfig(defaultConfig);
        form.setFieldsValue(defaultConfig);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      message.error('Failed to load configuration');
      setConfig(defaultConfig);
      form.setFieldsValue(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      // In a real implementation, this would save to backend
      // For now, save to localStorage
      localStorage.setItem('faultThresholdConfig', JSON.stringify(values));
      setConfig(values);
      message.success('Configuration saved successfully');
    } catch (error) {
      console.error('Failed to save config:', error);
      message.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(defaultConfig);
    message.info('Form reset to default values');
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" tip="Loading configuration..." />
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space>
            <SettingOutlined />
            <span>Fault Analysis Threshold Configuration</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Reset to Defaults
            </Button>
          </Space>
        }
      >
        <Alert
          message="Configuration Guide"
          description="These thresholds determine when assets or product models are automatically flagged as problematic. Adjust values based on your organization's asset management policies."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={defaultConfig}
        >
          <Collapse defaultActiveKey={['asset', 'model', 'cost', 'auto']} ghost>
            {/* Asset-Level Thresholds */}
            <Panel
              header={
                <Space>
                  <WarningOutlined style={{ color: '#dc2626' }} />
                  <Text strong>Asset-Level Fault Thresholds</Text>
                  <Tag color="red">Critical</Tag>
                </Space>
              }
              key="asset"
            >
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                Flag individual assets that have recurring faults within a specified period.
              </Paragraph>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="asset_fault_count_threshold"
                    label={
                      <Space>
                        <span>Fault Count Threshold</span>
                        <Tooltip title="Number of faults required to flag an asset">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber
                      min={1}
                      max={20}
                      style={{ width: '100%' }}
                      addonAfter="faults"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="asset_fault_period_months"
                    label={
                      <Space>
                        <span>Monitoring Period</span>
                        <Tooltip title="Time window to count faults">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber
                      min={1}
                      max={24}
                      style={{ width: '100%' }}
                      addonAfter="months"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                message={`Current Rule: Flag asset if ${form.getFieldValue('asset_fault_count_threshold') || 3}+ faults occur within ${form.getFieldValue('asset_fault_period_months') || 6} months`}
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
              />
            </Panel>

            {/* Model-Level Thresholds */}
            <Panel
              header={
                <Space>
                  <WarningOutlined style={{ color: '#ea580c' }} />
                  <Text strong>Product Model Fault Thresholds</Text>
                  <Tag color="orange">High</Tag>
                </Space>
              }
              key="model"
            >
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                Flag product models/OEMs that have widespread issues across multiple assets.
              </Paragraph>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="model_fault_count_threshold"
                    label={
                      <Space>
                        <span>Total Fault Count</span>
                        <Tooltip title="Number of faults across all assets of this model">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber
                      min={1}
                      max={50}
                      style={{ width: '100%' }}
                      addonAfter="faults"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="model_fault_period_months"
                    label={
                      <Space>
                        <span>Monitoring Period</span>
                        <Tooltip title="Time window to count model faults">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber
                      min={1}
                      max={12}
                      style={{ width: '100%' }}
                      addonAfter="months"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                message={`Current Rule: Flag model if ${form.getFieldValue('model_fault_count_threshold') || 5}+ faults occur across all its assets within ${form.getFieldValue('model_fault_period_months') || 3} months`}
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
              />
            </Panel>

            {/* Same Fault Thresholds */}
            <Panel
              header={
                <Space>
                  <WarningOutlined style={{ color: '#0ea5e9' }} />
                  <Text strong>Recurring Same Fault Thresholds</Text>
                  <Tag color="blue">Medium</Tag>
                </Space>
              }
              key="samefault"
            >
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                Flag assets that have the same type of fault repeatedly.
              </Paragraph>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="same_fault_count_threshold"
                    label={
                      <Space>
                        <span>Same Fault Count</span>
                        <Tooltip title="Number of times same fault type must occur">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber
                      min={2}
                      max={10}
                      style={{ width: '100%' }}
                      addonAfter="occurrences"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="same_fault_period_months"
                    label={
                      <Space>
                        <span>Monitoring Period</span>
                        <Tooltip title="Time window for same fault detection">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber
                      min={1}
                      max={12}
                      style={{ width: '100%' }}
                      addonAfter="months"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            {/* Cost Thresholds */}
            <Panel
              header={
                <Space>
                  <WarningOutlined style={{ color: '#9333ea' }} />
                  <Text strong>High Repair Cost Threshold</Text>
                  <Tag color="purple">Cost Alert</Tag>
                </Space>
              }
              key="cost"
            >
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                Flag assets where total repair costs exceed a percentage of the original purchase cost.
              </Paragraph>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="high_cost_threshold_percentage"
                    label={
                      <Space>
                        <span>Cost Threshold</span>
                        <Tooltip title="Percentage of purchase cost that triggers high cost flag">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber
                      min={10}
                      max={200}
                      style={{ width: '100%' }}
                      addonAfter="% of purchase cost"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                message={`Current Rule: Flag asset if total repair costs exceed ${form.getFieldValue('high_cost_threshold_percentage') || 50}% of purchase price`}
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
              />
            </Panel>

            {/* Auto Analysis Settings */}
            <Panel
              header={
                <Space>
                  <SettingOutlined style={{ color: '#16a34a' }} />
                  <Text strong>Automatic Analysis Settings</Text>
                  <Tag color="green">Automation</Tag>
                </Space>
              }
              key="auto"
            >
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                Configure automatic fault analysis scheduling.
              </Paragraph>

              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="auto_analysis_enabled"
                    label="Enable Automatic Analysis"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="auto_analysis_interval_hours"
                    label={
                      <Space>
                        <span>Analysis Interval</span>
                        <Tooltip title="How often to run automatic analysis">
                          <InfoCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <InputNumber
                      min={1}
                      max={168}
                      style={{ width: '100%' }}
                      addonAfter="hours"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>

            {/* Notification Settings */}
            <Panel
              header={
                <Space>
                  <CheckCircleOutlined style={{ color: '#2563eb' }} />
                  <Text strong>Notification Preferences</Text>
                  <Tag color="blue">Alerts</Tag>
                </Space>
              }
              key="notify"
            >
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                Choose which severity levels should trigger notifications.
              </Paragraph>

              <Row gutter={24}>
                <Col xs={12} md={6}>
                  <Form.Item
                    name="notify_on_critical_flag"
                    label={<Tag color="red">Critical</Tag>}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item
                    name="notify_on_high_flag"
                    label={<Tag color="orange">High</Tag>}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item
                    name="notify_on_medium_flag"
                    label={<Tag color="gold">Medium</Tag>}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Item
                    name="notify_on_low_flag"
                    label={<Tag color="blue">Low</Tag>}
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Panel>
          </Collapse>

          <Divider />

          {/* Current Configuration Summary */}
          <Card
            size="small"
            title="Current Configuration Summary"
            style={{ marginBottom: 24, background: '#f8fafc' }}
          >
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
              <Descriptions.Item label="Asset Threshold">
                {form.getFieldValue('asset_fault_count_threshold')} faults / {form.getFieldValue('asset_fault_period_months')} months
              </Descriptions.Item>
              <Descriptions.Item label="Model Threshold">
                {form.getFieldValue('model_fault_count_threshold')} faults / {form.getFieldValue('model_fault_period_months')} months
              </Descriptions.Item>
              <Descriptions.Item label="Cost Threshold">
                {form.getFieldValue('high_cost_threshold_percentage')}% of purchase
              </Descriptions.Item>
              <Descriptions.Item label="Same Fault">
                {form.getFieldValue('same_fault_count_threshold')} times / {form.getFieldValue('same_fault_period_months')} months
              </Descriptions.Item>
              <Descriptions.Item label="Auto Analysis">
                {form.getFieldValue('auto_analysis_enabled') ? (
                  <Tag color="green">Every {form.getFieldValue('auto_analysis_interval_hours')}h</Tag>
                ) : (
                  <Tag color="default">Disabled</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
                size="large"
              >
                Save Configuration
              </Button>
              <Button onClick={handleReset} size="large">
                Reset to Defaults
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FaultThresholdConfig;
