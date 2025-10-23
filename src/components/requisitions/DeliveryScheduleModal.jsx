import React from 'react';
import { Modal, Form, DatePicker, Select, Input, Descriptions, Alert, Tag, Space } from 'antd';
import {
  DeliveredProcedureOutlined,
  CheckCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import moment from 'moment';
import './DeliveryScheduleModal.css';

const { Option } = Select;
const { TextArea } = Input;

const DeliveryScheduleModal = ({
  visible,
  onCancel,
  onSubmit,
  requisition,
  asset,
  loading = false
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Format the date
      const formattedValues = {
        ...values,
        scheduled_delivery_date: values.scheduled_delivery_date
          ? values.scheduled_delivery_date.format('YYYY-MM-DD HH:mm:ss')
          : null
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
          <DeliveredProcedureOutlined style={{ color: '#1890ff' }} />
          Schedule Asset Delivery
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText="Assign & Schedule Delivery"
      okButtonProps={{ icon: <CheckCircleOutlined /> }}
      width={700}
      className="delivery-schedule-modal"
    >
      {requisition && asset && (
        <div>
          {/* Summary Alert */}
          <Alert
            message="Assignment Summary"
            description={
              <div>
                <div>
                  <strong>Asset:</strong> <Tag color="blue">{asset?.asset_tag}</Tag> - {asset?.product_name}
                  {asset?.product_model && ` (${asset.product_model})`}
                </div>
                <div style={{ marginTop: 4 }}>
                  <strong>Recipient:</strong> {requisition?.requester_name} ({requisition?.department_name})
                </div>
              </div>
            }
            type="info"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: 16 }}
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

          {/* Delivery Form */}
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              delivery_type: 'physical'
            }}
          >
            <Form.Item
              name="delivery_type"
              label="Delivery Type"
              rules={[{ required: true, message: 'Please select delivery type' }]}
            >
              <Select placeholder="Select delivery type">
                <Option value="physical">Physical Delivery</Option>
                <Option value="pickup">Self Pickup</Option>
                <Option value="courier">Courier Service</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="scheduled_delivery_date"
              label="Scheduled Delivery Date & Time"
              rules={[{ required: true, message: 'Please select delivery date and time' }]}
              help="When should this asset be delivered to the employee?"
            >
              <DatePicker
                showTime={{
                  format: 'HH:mm',
                  minuteStep: 15
                }}
                format="YYYY-MM-DD HH:mm"
                style={{ width: '100%' }}
                disabledDate={disabledDate}
                disabledTime={disabledTime}
                placeholder="Select delivery date and time"
                suffixIcon={<CalendarOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="delivery_notes"
              label="Delivery Notes (Optional)"
              help="Add any special instructions for the delivery"
            >
              <TextArea
                rows={3}
                placeholder="e.g., Contact recipient before delivery, Handle with care, etc."
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>

          {/* Process Info */}
          <Alert
            message="Next Steps"
            description={
              <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                <li>Asset will be marked as 'Assigned' to the requisition</li>
                <li>Asset status will be updated to 'In Use'</li>
                <li>Delivery ticket will be created with scheduled date</li>
                <li>Employee will be notified about the delivery</li>
                <li>Physical delivery form will be generated for signature</li>
              </ul>
            }
            type="success"
            showIcon
            style={{ marginTop: 16 }}
          />

          {/* Urgency Warning */}
          {requisition.urgency === 'critical' && (
            <Alert
              message="Critical Priority Requisition"
              description="This is a critical priority request. Please ensure timely delivery."
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </div>
      )}
    </Modal>
  );
};

export default DeliveryScheduleModal;
