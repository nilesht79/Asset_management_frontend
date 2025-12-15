import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Modal, Form, Input, Select, Card, Row, Col, message, Button, Divider, Alert } from 'antd';
import { UserAddOutlined, LaptopOutlined, ToolOutlined } from '@ant-design/icons';
import ticketService from '../../../services/ticket';
import AssetSelector from './AssetSelector';

const { Option } = Select;
const { TextArea } = Input;

const CreateTicketModal = ({ visible, onClose, onSuccess, currentUser }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedAssets, setSelectedAssets] = useState([]);

  // Watch service_type to show alert for repair/replace
  const serviceType = Form.useWatch('service_type', form);

  // Check if current user is an engineer (not coordinator/admin)
  const isEngineerRole = currentUser?.role === 'engineer';

  useEffect(() => {
    if (visible) {
      fetchEmployees();
      // Only fetch engineers if user is coordinator/admin (not engineer)
      if (!isEngineerRole) {
        fetchEngineers();
      }
      form.resetFields();
      setEmployeeInfo(null);
      setSelectedEmployee(null);
      setIsGuestMode(false);
      setSearchText('');
      setSelectedAssets([]);
    }
  }, [visible, isEngineerRole]);

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
    if (userId === 'GUEST') {
      handleGuestSelection();
      return;
    }

    const employee = employees.find((e) => e.user_id === userId);
    setSelectedEmployee(userId);
    setIsGuestMode(false);
    setSelectedAssets([]); // Reset asset selection when employee changes

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

  const handleSearch = (value) => {
    setSearchText(value || '');
  };

  const handleGuestSelection = useCallback(() => {
    setIsGuestMode(true);
    setSelectedEmployee(null);
    setEmployeeInfo(null);
    setSelectedAssets([]); // Clear assets for guest tickets
    form.setFieldsValue({ created_by_user_id: undefined });
    // Pre-fill guest name with search text if available
    if (searchText) {
      form.setFieldsValue({ guest_name: searchText });
    }
  }, [searchText, form]);

  const notFoundContent = useMemo(() => {
    if (searchText) {
      return (
        <div style={{ padding: '8px' }}>
          <Button
            type="link"
            icon={<UserAddOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleGuestSelection();
            }}
            block
          >
            Create Guest Ticket for "{searchText}"
          </Button>
        </div>
      );
    }
    return (
      <div style={{ padding: '12px 16px', textAlign: 'center', color: '#999' }}>
        No employees found
      </div>
    );
  }, [searchText, handleGuestSelection]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const ticketData = {
        is_guest: isGuestMode,
        title: values.title,
        description: values.description,
        priority: values.priority,
        category: values.category,
        ticket_type: values.ticket_type || 'internal',
        service_type: values.service_type || 'general',
        assigned_to_engineer_id: values.assigned_to_engineer_id || null
      };

      if (isGuestMode) {
        // Guest ticket
        ticketData.guest_name = values.guest_name;
        ticketData.guest_email = values.guest_email;
        ticketData.guest_phone = values.guest_phone || null;
        ticketData.created_by_user_id = null;
      } else {
        // Employee ticket
        ticketData.created_by_user_id = values.created_by_user_id;
      }

      // Create the ticket first
      const response = await ticketService.createTicket(ticketData);
      const ticketId = response.data?.data?.ticket_id || response.data?.ticket_id;

      // If assets were selected, link them to the ticket
      if (selectedAssets.length > 0 && ticketId) {
        try {
          await ticketService.linkMultipleAssets(ticketId, selectedAssets);
        } catch (assetError) {
          console.error('Failed to link assets:', assetError);
          message.warning('Ticket created but failed to link some assets');
        }
      }

      form.resetFields();
      setEmployeeInfo(null);
      setSelectedEmployee(null);
      setIsGuestMode(false);
      setSearchText('');
      setSelectedAssets([]);
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
          priority: 'medium',
          ticket_type: 'internal',
          service_type: 'general'
        }}
      >
        {/* Employee/Guest Selection */}
        <Form.Item
          name="created_by_user_id"
          label="Create Ticket For"
          rules={[
            {
              required: !isGuestMode,
              message: 'Please select an employee or choose guest'
            }
          ]}
        >
          <Select
            showSearch
            placeholder="Search employee name or type for guest"
            onChange={handleEmployeeChange}
            onSearch={handleSearch}
            filterOption={(input, option) => {
              if (!option?.children) return false;
              const searchText = typeof option.children === 'string'
                ? option.children
                : option.children.join(' ');
              return searchText.toLowerCase().includes(input.toLowerCase());
            }}
            notFoundContent={notFoundContent}
          >
            {employees.map((emp) => (
              <Option key={emp.user_id} value={emp.user_id}>
                {emp.full_name || `${emp.first_name} ${emp.last_name}`} ({emp.email})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Display Employee Info (Inherited Data) */}
        {employeeInfo && !isGuestMode && (
          <Card size="small" className="mb-4" style={{ backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}>
            <div className="text-sm">
              <div className="font-semibold mb-2" style={{ color: '#0050b3' }}>
                Ticket will be created for:
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
                Department and location will be automatically inherited from the employee
              </div>
            </div>
          </Card>
        )}

        {/* Guest Information Fields */}
        {isGuestMode && (
          <Card
            size="small"
            className="mb-4"
            style={{ backgroundColor: '#f0f5ff', borderColor: '#adc6ff' }}
          >
            <div className="text-sm font-semibold mb-3" style={{ color: '#1d39c4' }}>
              Guest Information
            </div>

            <Form.Item
              name="guest_name"
              label="Guest Name"
              rules={[
                { required: true, message: 'Please enter guest name' },
                { min: 2, message: 'Name must be at least 2 characters' }
              ]}
            >
              <Input placeholder="Full name of the guest" maxLength={100} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="guest_email"
                  label="Guest Email"
                  rules={[
                    { required: true, message: 'Please enter guest email' },
                    { type: 'email', message: 'Please enter valid email' }
                  ]}
                >
                  <Input placeholder="guest@example.com" maxLength={255} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="guest_phone" label="Guest Phone (Optional)">
                  <Input placeholder="+1 234 567 8900" maxLength={20} />
                </Form.Item>
              </Col>
            </Row>

            <div className="text-xs" style={{ color: '#8c8c8c' }}>
              Guest tickets will not have department or location assigned
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

        {/* Asset Selection - Only for employee tickets (not guests) */}
        {selectedEmployee && !isGuestMode && (
          <>
            <Divider style={{ margin: '16px 0' }}>
              <LaptopOutlined /> Related Assets (Optional)
            </Divider>
            <AssetSelector
              userId={selectedEmployee}
              selectedAssets={selectedAssets}
              onSelectionChange={setSelectedAssets}
              disabled={loading}
            />
            <div style={{ marginTop: 8, marginBottom: 16 }}>
              <span style={{ color: '#8c8c8c', fontSize: '12px' }}>
                Select assets that are related to this issue. This helps engineers identify and track affected equipment.
              </span>
            </div>
          </>
        )}

        <Row gutter={16}>
          <Col span={12}>
            {/* Ticket Type */}
            <Form.Item
              name="ticket_type"
              label="Ticket Type"
              rules={[{ required: true, message: 'Please select ticket type' }]}
            >
              <Select placeholder="Select ticket type">
                <Option value="internal">Internal (Employee)</Option>
                <Option value="external">External (Vendor/Client)</Option>
                <Option value="walk_in">Walk-in</Option>
                <Option value="phone">Phone Request</Option>
                <Option value="email">Email Request</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            {/* Service Type */}
            <Form.Item
              name="service_type"
              label="Service Type"
              rules={[{ required: true, message: 'Please select service type' }]}
              tooltip="Repair/Replace tickets will require a service report upon closure"
            >
              <Select placeholder="Select service type">
                <Option value="general">General Support</Option>
                <Option value="repair">Repair Service</Option>
                <Option value="replace">Replacement Service</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Service Type Alert */}
        {(serviceType === 'repair' || serviceType === 'replace') && (
          <Alert
            message={
              <span>
                <ToolOutlined style={{ marginRight: 8 }} />
                {serviceType === 'repair'
                  ? 'Repair Service Selected'
                  : 'Replacement Service Selected'}
              </span>
            }
            description={
              serviceType === 'repair'
                ? 'A service report will be required when closing this ticket. You can document spare parts used and repair details.'
                : 'A service report will be required when closing this ticket. You can document the replacement asset and any components transferred.'
            }
            type="info"
            showIcon={false}
            className="mb-4"
            style={{ backgroundColor: '#fff7e6', borderColor: '#ffd591' }}
          />
        )}

        <Row gutter={16}>
          <Col span={12}>
            {/* Priority */}
            <Form.Item
              name="priority"
              label="Priority"
              rules={[{ required: true, message: 'Please select priority' }]}
            >
              <Select placeholder="Select priority">
                <Option value="low">Low</Option>
                <Option value="medium">Medium</Option>
                <Option value="high">High</Option>
                <Option value="critical">Critical</Option>
                <Option value="emergency">Emergency</Option>
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
                <Option value="Hardware">Hardware Issue</Option>
                <Option value="Software">Software Issue</Option>
                <Option value="Network">Network/Connectivity</Option>
                <Option value="Access">Access/Permission</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Auto-Assign Engineer (Optional) - Only visible to coordinators/admins */}
        {!isEngineerRole && (
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
        )}
      </Form>
    </Modal>
  );
};

export default CreateTicketModal;
