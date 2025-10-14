import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Card, Row, Col, message, Tag, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import ticketService from '../../../services/ticket';

const { Option } = Select;

const AssignEngineerModal = ({ visible, ticket, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState(null);

  useEffect(() => {
    if (visible && ticket) {
      fetchEngineers();
      form.resetFields();
      setSelectedEngineer(null);

      // Pre-select engineer if already assigned
      if (ticket.assigned_to_engineer_id) {
        form.setFieldsValue({
          engineer_id: ticket.assigned_to_engineer_id
        });
      }
    }
  }, [visible, ticket]);

  const fetchEngineers = async () => {
    try {
      // Fetch all available engineers (no filtering by department)
      // This ensures engineers are always available for assignment
      const response = await ticketService.getAvailableEngineers();
      const data = response.data.data || response.data;
      setEngineers(data.engineers || []);
    } catch (error) {
      console.error('Failed to fetch engineers:', error);
      message.error('Failed to load engineers');
    }
  };

  const handleEngineerChange = (engineerId) => {
    const engineer = engineers.find((e) => e.user_id === engineerId);
    setSelectedEngineer(engineer);
  };

  const handleSubmit = async (values) => {
    if (!ticket) return;

    setLoading(true);
    try {
      await ticketService.assignEngineer(ticket.ticket_id, values.engineer_id);
      form.resetFields();
      setSelectedEngineer(null);
      onSuccess();
    } catch (error) {
      console.error('Failed to assign engineer:', error);
      message.error(
        error.response?.data?.message || 'Failed to assign engineer'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return null;

  return (
    <Modal
      title="Assign Engineer"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Assign Engineer"
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      {/* Ticket Info */}
      <Card size="small" className="mb-4" style={{ backgroundColor: '#f0f5ff', borderColor: '#adc6ff' }}>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Ticket:</span>{' '}
            <Tag color="blue">{ticket.ticket_number}</Tag>
          </div>
          <div>
            <span className="font-semibold">Title:</span> {ticket.title}
          </div>
          <div>
            <span className="font-semibold">Created For:</span>{' '}
            {ticket.created_by_user_name} ({ticket.created_by_user_email})
          </div>
          <Row gutter={16}>
            <Col span={12}>
              <span className="font-semibold">Department:</span>{' '}
              {ticket.department_name || 'N/A'}
            </Col>
            <Col span={12}>
              <span className="font-semibold">Location:</span>{' '}
              {ticket.location_name || 'N/A'}
            </Col>
          </Row>
        </div>
      </Card>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Engineer Selection */}
        <Form.Item
          name="engineer_id"
          label="Select Engineer"
          rules={[{ required: true, message: 'Please select an engineer' }]}
        >
          <Select
            showSearch
            placeholder="Search and select engineer"
            onChange={handleEngineerChange}
            filterOption={(input, option) =>
              option.children.props.children[1].toLowerCase().includes(input.toLowerCase())
            }
            optionLabelProp="label"
          >
            {engineers.map((eng) => (
              <Option
                key={eng.user_id}
                value={eng.user_id}
                label={eng.full_name}
              >
                <div className="flex items-center space-x-2">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <div className="flex-1">
                    <div className="font-medium">{eng.full_name}</div>
                    <div className="text-xs text-gray-500">
                      {eng.email}
                      {eng.department_name && (
                        <> • {eng.department_name}</>
                      )}
                    </div>
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Selected Engineer Info */}
        {selectedEngineer && (
          <Card
            size="small"
            style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}
          >
            <div className="space-y-1 text-sm">
              <div className="font-semibold" style={{ color: '#389e0d' }}>
                ✓ Selected Engineer:
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ color: '#595959' }}>Name:</div>
                  <div className="font-medium">{selectedEngineer.full_name}</div>
                </Col>
                <Col span={12}>
                  <div style={{ color: '#595959' }}>Employee ID:</div>
                  <div className="font-medium">
                    {selectedEngineer.employee_id || 'N/A'}
                  </div>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ color: '#595959' }}>Department:</div>
                  <div className="font-medium">
                    {selectedEngineer.department_name || 'Not Assigned'}
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ color: '#595959' }}>Location:</div>
                  <div className="font-medium">
                    {selectedEngineer.location_name || 'Not Assigned'}
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        )}
      </Form>

      {engineers.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          No engineers available. Please contact administrator.
        </div>
      )}
    </Modal>
  );
};

export default AssignEngineerModal;
