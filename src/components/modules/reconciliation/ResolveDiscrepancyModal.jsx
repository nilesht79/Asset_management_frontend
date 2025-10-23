import React, { useState } from 'react';
import { Modal, Form, Select, Input, message, Space, Tag, Typography, Row, Col, Alert } from 'antd';
import { WarningOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const ResolveDiscrepancyModal = ({ visible, discrepancy, reconciliationId, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: { color: 'red', icon: <ExclamationCircleOutlined />, label: 'Critical' },
      major: { color: 'orange', icon: <WarningOutlined />, label: 'Major' },
      minor: { color: 'blue', icon: <InfoCircleOutlined />, label: 'Minor' }
    };
    return configs[severity] || configs.minor;
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await axios.put(
        `/api/v1/reconciliations/${reconciliationId}/discrepancies/${discrepancy.id}/resolve`,
        {
          resolution_action: values.resolution_action,
          resolution_notes: values.resolution_notes || null
        }
      );

      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to resolve discrepancy');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  if (!discrepancy) return null;

  const severityConfig = getSeverityConfig(discrepancy.severity);

  return (
    <Modal
      title="Resolve Discrepancy"
      open={visible}
      onOk={form.submit}
      onCancel={handleCancel}
      okText="Resolve"
      cancelText="Cancel"
      confirmLoading={loading}
      width={700}
      maskClosable={false}
    >
      <div style={{ marginTop: 20 }}>
        {/* Discrepancy Info */}
        <Alert
          type="warning"
          message={
            <Space>
              <Tag color={severityConfig.color} icon={severityConfig.icon}>
                {severityConfig.label}
              </Tag>
              <Text strong>{discrepancy.field_display_name} Discrepancy</Text>
            </Space>
          }
          description={
            <div style={{ marginTop: 8 }}>
              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Text type="secondary">Asset: </Text>
                  <Text code strong>{discrepancy.asset_tag}</Text>
                </Col>
                <Col span={12}>
                  <Text type="secondary">System Value:</Text>
                  <div>
                    <Text code>{discrepancy.system_value || 'N/A'}</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Physical Value:</Text>
                  <div>
                    <Text code style={{ color: '#fa8c16' }}>{discrepancy.physical_value || 'N/A'}</Text>
                  </div>
                </Col>
                <Col span={24}>
                  <Text type="secondary">Detected By:</Text>
                  <div>
                    <Text>{discrepancy.detected_by_name}</Text>
                  </div>
                </Col>
              </Row>
            </div>
          }
          style={{ marginBottom: 24 }}
          showIcon
        />

        {/* Resolution Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            resolution_action: 'updated_system'
          }}
        >
          <Form.Item
            name="resolution_action"
            label="Resolution Action"
            rules={[{ required: true, message: 'Please select a resolution action' }]}
            tooltip="How was this discrepancy resolved?"
          >
            <Select placeholder="Select resolution action" size="large">
              <Option value="updated_system">
                <Space>
                  <Text>Updated System</Text>
                  <Text type="secondary">(Changed system to match physical)</Text>
                </Space>
              </Option>
              <Option value="updated_physical">
                <Space>
                  <Text>Updated Physical</Text>
                  <Text type="secondary">(Changed physical to match system)</Text>
                </Space>
              </Option>
              <Option value="verified_correct">
                <Space>
                  <Text>Verified Correct</Text>
                  <Text type="secondary">(Both values are actually correct)</Text>
                </Space>
              </Option>
              <Option value="accepted_as_is">
                <Space>
                  <Text>Accepted As-Is</Text>
                  <Text type="secondary">(Discrepancy acknowledged, no action needed)</Text>
                </Space>
              </Option>
              <Option value="escalated">
                <Space>
                  <Text>Escalated</Text>
                  <Text type="secondary">(Forwarded to higher authority)</Text>
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="resolution_notes"
            label="Resolution Notes"
            rules={[
              { required: true, message: 'Please provide resolution notes' },
              { max: 2000, message: 'Notes must not exceed 2000 characters' }
            ]}
            tooltip="Explain how and why this discrepancy was resolved"
          >
            <TextArea
              rows={6}
              placeholder="Enter detailed notes about how this discrepancy was resolved..."
              showCount
              maxLength={2000}
            />
          </Form.Item>
        </Form>

        <Alert
          type="info"
          message="Resolution Guidelines"
          description={
            <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
              <li><Text strong>Updated System:</Text> Use when you've corrected the system record to match reality</li>
              <li><Text strong>Updated Physical:</Text> Use when you've physically corrected the asset to match system</li>
              <li><Text strong>Verified Correct:</Text> Use when both values are correct but appear different</li>
              <li><Text strong>Accepted As-Is:</Text> Use when discrepancy exists but no action is needed</li>
              <li><Text strong>Escalated:</Text> Use when the discrepancy requires manager or specialist review</li>
            </ul>
          }
          showIcon
          style={{ marginTop: 16 }}
        />
      </div>
    </Modal>
  );
};

export default ResolveDiscrepancyModal;
