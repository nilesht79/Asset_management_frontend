import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Card, Row, Col, message } from 'antd';
import ticketService from '../../../services/ticket';

const { Option } = Select;
const { TextArea } = Input;

const CreateTicketModal = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchEmployees();
      fetchEngineers();
      form.resetFields();
      setEmployeeInfo(null);
      setSelectedEmployee(null);
    }
  }, [visible]);

  const fetchEmployees = async () => {
    try {
      const response = await ticketService.getEmployees();
      const data = response.data.data || response.data;
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      message.error('Failed to load employees');
    }
  };

  const fetchEngineers = async () => {
    try {
      const response = await ticketService.getAvailableEngineers();
      const data = response.data.data || response.data;
      setEngineers(data.engineers || []);
    } catch (error) {
      console.error('Failed to fetch engineers:', error);
    }
  };

  const handleEmployeeChange = (userId) => {
    const employee = employees.find((e) => e.user_id === userId);
    setSelectedEmployee(userId);

    if (employee) {
      setEmployeeInfo({
        name: employee.full_name || `${employee.first_name} ${employee.last_name}`,
        email: employee.email,
        department: employee.department_name || 'Not Assigned',
        location: employee.location_name || 'Not Assigned',
        employee_id: employee.employee_id
      });
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const ticketData = {
        created_by_user_id: values.created_by_user_id,
        title: values.title,
        description: values.description,
        priority: values.priority,
        category: values.category,
        assigned_to_engineer_id: values.assigned_to_engineer_id || null
      };

      await ticketService.createTicket(ticketData);
      form.resetFields();
      setEmployeeInfo(null);
      setSelectedEmployee(null);
      onSuccess();
    } catch (error) {
      console.error('Failed to create ticket:', error);
      message.error(
        error.response?.data?.message || 'Failed to create ticket'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Support Ticket"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Create Ticket"
      confirmLoading={loading}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          priority: 'medium'
        }}
      >
        {/* Employee Selection */}
        <Form.Item
          name="created_by_user_id"
          label="Create Ticket For (Employee)"
          rules={[
            { required: true, message: 'Please select an employee' }
          ]}
        >
          <Select
            showSearch
            placeholder="Search and select employee"
            onChange={handleEmployeeChange}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {employees.map((emp) => (
              <Option key={emp.user_id} value={emp.user_id}>
                {emp.full_name || `${emp.first_name} ${emp.last_name}`} ({emp.email})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Display Employee Info (Inherited Data) */}
        {employeeInfo && (
          <Card size="small" className="mb-4" style={{ backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}>
            <div className="text-sm">
              <div className="font-semibold mb-2" style={{ color: '#0050b3' }}>
                📋 Ticket will be created for:
              </div>
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ color: '#595959' }}>Employee:</div>
                  <div className="font-medium">{employeeInfo.name}</div>
                </Col>
                <Col span={12}>
                  <div style={{ color: '#595959' }}>Employee ID:</div>
                  <div className="font-medium">{employeeInfo.employee_id || 'N/A'}</div>
                </Col>
              </Row>
              <Row gutter={16} className="mt-2">
                <Col span={12}>
                  <div style={{ color: '#595959' }}>Department:</div>
                  <div className="font-medium">{employeeInfo.department}</div>
                </Col>
                <Col span={12}>
                  <div style={{ color: '#595959' }}>Location:</div>
                  <div className="font-medium">{employeeInfo.location}</div>
                </Col>
              </Row>
              <div className="mt-2 text-xs" style={{ color: '#8c8c8c' }}>
                ℹ️ Department and location will be automatically inherited from the employee
              </div>
            </div>
          </Card>
        )}

        {/* Ticket Title */}
        <Form.Item
          name="title"
          label="Issue Title"
          rules={[
            { required: true, message: 'Please enter ticket title' },
            { min: 5, message: 'Title must be at least 5 characters' }
          ]}
        >
          <Input
            placeholder="Brief description of the issue"
            maxLength={200}
          />
        </Form.Item>

        {/* Description */}
        <Form.Item
          name="description"
          label="Detailed Description"
          rules={[
            { required: true, message: 'Please enter description' },
            { min: 10, message: 'Description must be at least 10 characters' }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Provide detailed information about the issue"
            maxLength={2000}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            {/* Priority */}
            <Form.Item
              name="priority"
              label="Priority"
              rules={[{ required: true, message: 'Please select priority' }]}
            >
              <Select placeholder="Select priority">
                <Option value="low">🟢 Low</Option>
                <Option value="medium">🔵 Medium</Option>
                <Option value="high">🟠 High</Option>
                <Option value="critical">🔴 Critical</Option>
                <Option value="emergency">🚨 Emergency</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            {/* Category */}
            <Form.Item
              name="category"
              label="Issue Category"
            >
              <Select placeholder="Select category">
                <Option value="Hardware">🖥️ Hardware Issue</Option>
                <Option value="Software">💻 Software Issue</Option>
                <Option value="Network">🌐 Network/Connectivity</Option>
                <Option value="Access">🔐 Access/Permission</Option>
                <Option value="Other">📋 Other</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Auto-Assign Engineer (Optional) */}
        <Form.Item
          name="assigned_to_engineer_id"
          label="Assign to Engineer (Optional)"
          extra="Leave blank to assign later"
        >
          <Select
            allowClear
            placeholder="Select engineer to assign"
            showSearch
            filterOption={(input, option) => {
              if (!option?.children) return false;
              const searchText = typeof option.children === 'string'
                ? option.children
                : option.children.join(' ');
              return searchText.toLowerCase().includes(input.toLowerCase());
            }}
          >
            {engineers.map((eng) => (
              <Option key={eng.user_id} value={eng.user_id}>
                {eng.full_name || `${eng.first_name || ''} ${eng.last_name || ''}`.trim() || 'Unknown'} - {eng.department_name || 'No Dept'}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateTicketModal;
