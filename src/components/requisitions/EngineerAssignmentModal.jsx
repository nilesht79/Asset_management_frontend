import React, { useState, useEffect } from 'react';
import { Modal, Form, DatePicker, Select, Input, Descriptions, Alert, Tag, Space, message, Spin } from 'antd';
import {
  ToolOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import api from '../../services/api';
import './EngineerAssignmentModal.css';

const { Option } = Select;
const { TextArea } = Input;

const EngineerAssignmentModal = ({
  visible,
  onCancel,
  onSubmit,
  requisition,
  asset,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [engineers, setEngineers] = useState([]);
  const [loadingEngineers, setLoadingEngineers] = useState(false);

  useEffect(() => {
    if (visible) {
      loadEngineers();
    }
  }, [visible]);

  const loadEngineers = async () => {
    try {
      setLoadingEngineers(true);
      // Load all available engineers (no department filter)
      const response = await api.get('/users/engineers/available');
      setEngineers(response.data.data?.engineers || []);
    } catch (error) {
      console.error('Failed to load engineers:', error);
      message.error('Failed to load available engineers');
      setEngineers([]);
    } finally {
      setLoadingEngineers(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Format the date
      const formattedValues = {
        engineer_id: values.engineer_id,
        installation_scheduled_date: values.installation_scheduled_date
          ? values.installation_scheduled_date.format('YYYY-MM-DD HH:mm:ss')
          : null,
        installation_notes: values.installation_notes
      };

      onSubmit(formattedValues);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const disabledDate = (current) => {
    // Cannot select dates before today
    return current && current < moment().startOf('day');
  };

  const disabledTime = (current) => {
    // If selected date is today, disable past hours
    if (current && current.isSame(moment(), 'day')) {
      const currentHour = moment().hour();
      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < currentHour; i++) {
            hours.push(i);
          }
          return hours;
        }
      };
    }
    return {};
  };

  return (
    <Modal
      title={
        <Space>
          <ToolOutlined style={{ color: '#1890ff' }} />
          Assign Engineer for Installation
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Assign Engineer"
      cancelText="Cancel"
      confirmLoading={loading}
      width={700}
      maskClosable={false}
    >
      <Alert
        message="Asset Assignment Confirmation"
        description={
          <div>
            <div><strong>Asset:</strong> <Tag color="blue">{asset?.asset_tag}</Tag> - {asset?.product_name}
              {asset?.product_model && ` (${asset?.product_model})`}
            </div>
            <div><strong>Recipient:</strong> {requisition?.requester_name} ({requisition?.department_name})</div>
            <div><strong>Category:</strong> {asset?.category_name}</div>
          </div>
        }
        type="info"
        showIcon
        icon={<CheckCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      {/* Asset Details */}
      <Descriptions
        title="Asset Information"
        bordered
        size="small"
        column={2}
        style={{ marginBottom: 16 }}
      >
        <Descriptions.Item label="Asset Tag" span={2}>
          <Tag color="blue">{asset?.asset_tag}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Category">
          {asset?.category_name}
        </Descriptions.Item>
        <Descriptions.Item label="Product Type">
          {asset?.product_type_name}
        </Descriptions.Item>
        <Descriptions.Item label="Product" span={2}>
          {asset?.product_name}
          {asset?.product_model && ` - ${asset?.product_model}`}
        </Descriptions.Item>
        {asset?.serial_number && (
          <Descriptions.Item label="Serial Number" span={2}>
            {asset?.serial_number}
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* Engineer Assignment Form */}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          installation_scheduled_date: moment().add(1, 'days').hour(10).minute(0)
        }}
      >
        <Form.Item
          name="engineer_id"
          label={
            <Space>
              <UserOutlined />
              Assign Engineer
            </Space>
          }
          rules={[{ required: true, message: 'Please select an engineer' }]}
        >
          <Select
            placeholder="Select an engineer for installation"
            loading={loadingEngineers}
            notFoundContent={loadingEngineers ? <Spin size="small" /> : 'No engineers available'}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {engineers.map((engineer) => (
              <Option key={engineer.user_id} value={engineer.user_id}>
                {engineer.firstName} {engineer.lastName} ({engineer.employee_id})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="installation_scheduled_date"
          label={
            <Space>
              <CalendarOutlined />
              Installation Date & Time
            </Space>
          }
          rules={[{ required: true, message: 'Please select installation date and time' }]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            placeholder="Select installation date and time"
            disabledDate={disabledDate}
            disabledTime={disabledTime}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="installation_notes"
          label={
            <Space>
              <ClockCircleOutlined />
              Installation Notes (Optional)
            </Space>
          }
        >
          <TextArea
            rows={3}
            placeholder="Add any special instructions or notes for the installation..."
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>

      <Alert
        message="What happens next?"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>The assigned engineer will be notified about the installation</li>
            <li>Engineer will deliver and install the asset at the scheduled time</li>
            <li>Employee will confirm receipt with digital signature</li>
            <li>Requisition will be marked as completed</li>
          </ul>
        }
        type="success"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};

export default EngineerAssignmentModal;
