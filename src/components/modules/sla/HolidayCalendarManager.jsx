import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  DatePicker,
  Switch,
  message,
  Popconfirm,
  Row,
  Col,
  Divider,
  Typography,
  List,
  Tooltip,
  Badge,
  Empty
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  GiftOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import slaService from '../../../services/sla';

const { Text } = Typography;

/**
 * Holiday Calendar Manager Component
 * Admin interface for managing holiday calendars and dates
 */
const HolidayCalendarManager = () => {
  const [loading, setLoading] = useState(false);
  const [calendars, setCalendars] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState(null);
  const [form] = Form.useForm();
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    fetchCalendars();
  }, []);

  const fetchCalendars = async () => {
    setLoading(true);
    try {
      const response = await slaService.getHolidayCalendars();
      const data = response.data?.data;
      setCalendars(data?.calendars || []);
    } catch (error) {
      message.error('Failed to fetch holiday calendars');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCalendar(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true
    });
    setHolidays([]);
    setModalVisible(true);
  };

  const handleEdit = async (record) => {
    setEditingCalendar(record);
    setLoading(true);

    try {
      const response = await slaService.getHolidayDates(record.calendar_id);
      const dates = response.data?.data?.dates || [];

      form.setFieldsValue({
        calendar_name: record.calendar_name,
        description: record.description,
        year: record.calendar_year ? dayjs().year(record.calendar_year) : null,
        is_active: record.is_active === true || record.is_active === 1
      });

      const parsedHolidays = dates.map((d, idx) => ({
        key: idx,
        holiday_date: d.holiday_date,
        holiday_name: d.holiday_name,
        is_recurring: d.is_recurring === true || d.is_recurring === 1
      }));
      setHolidays(parsedHolidays);

      setModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch holiday dates');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (calendarId) => {
    try {
      await slaService.deleteHolidayCalendar(calendarId);
      message.success('Calendar deleted successfully');
      fetchCalendars();
    } catch (error) {
      message.error('Failed to delete calendar');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Extract year from dayjs object or use current year
      const yearValue = values.year
        ? (typeof values.year === 'object' ? values.year.year() : values.year)
        : new Date().getFullYear();

      const calendarData = {
        calendar_id: editingCalendar?.calendar_id,
        calendar_name: values.calendar_name,
        description: values.description,
        calendar_year: yearValue,
        is_active: values.is_active,
        dates: holidays.map(h => ({
          holiday_date: h.holiday_date,
          holiday_name: h.holiday_name,
          is_recurring: h.is_recurring
        }))
      };

      await slaService.saveHolidayCalendar(calendarData);
      message.success(editingCalendar ? 'Calendar updated successfully' : 'Calendar created successfully');
      setModalVisible(false);
      setEditingCalendar(null);
      fetchCalendars();
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error('Failed to save calendar');
    }
  };

  const addHoliday = () => {
    setHolidays(prev => [
      ...prev,
      {
        key: Date.now(),
        holiday_date: dayjs().format('YYYY-MM-DD'),
        holiday_name: '',
        is_recurring: false
      }
    ]);
  };

  const updateHoliday = (key, field, value) => {
    setHolidays(prev => prev.map(h =>
      h.key === key ? { ...h, [field]: value } : h
    ));
  };

  const removeHoliday = (key) => {
    setHolidays(prev => prev.filter(h => h.key !== key));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return dayjs(dateStr).format('DD MMM YYYY');
  };

  const renderHolidayCount = (record) => {
    // This would ideally come from the backend
    return (
      <Badge count={record.holiday_count || 0} showZero overflowCount={99} style={{ backgroundColor: '#52c41a' }}>
        <Tag icon={<GiftOutlined />}>Holidays</Tag>
      </Badge>
    );
  };

  const columns = [
    {
      title: 'Calendar Name',
      dataIndex: 'calendar_name',
      key: 'calendar_name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Text strong>{text}</Text>
            {!record.is_active && <Tag color="default">Inactive</Tag>}
          </Space>
          {record.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text>
          )}
        </Space>
      )
    },
    {
      title: 'Year',
      dataIndex: 'calendar_year',
      key: 'calendar_year',
      width: 100,
      align: 'center',
      render: (year) => <Tag color="blue">{year}</Tag>
    },
    {
      title: 'Holidays',
      key: 'holidays',
      width: 120,
      render: (_, record) => renderHolidayCount(record)
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center',
      render: (isActive) => (
        <Badge status={isActive ? 'success' : 'default'} text={isActive ? 'Active' : 'Inactive'} />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this calendar?"
            description="This will also delete all holiday dates."
            onConfirm={() => handleDelete(record.calendar_id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card
      title={
        <Space>
          <CalendarOutlined />
          <span>Holiday Calendars</span>
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Create Calendar
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={calendars}
        rowKey="calendar_id"
        loading={loading}
        pagination={false}
        size="middle"
      />

      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>{editingCalendar ? 'Edit Calendar' : 'Create Calendar'}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCalendar(null);
        }}
        onOk={handleSubmit}
        width={700}
        okText={editingCalendar ? 'Update' : 'Create'}
        forceRender
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="calendar_name"
                label="Calendar Name"
                rules={[{ required: true, message: 'Please enter calendar name' }]}
              >
                <Input placeholder="e.g., India Public Holidays 2025" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="year" label="Year">
                <DatePicker
                  picker="year"
                  style={{ width: '100%' }}
                  placeholder="Select year"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Brief description of this calendar" />
          </Form.Item>

          <Divider>
            Holiday Dates
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={addHoliday}
              style={{ marginLeft: 8 }}
            >
              Add Holiday
            </Button>
          </Divider>

          {holidays.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No holidays added yet"
              style={{ padding: '24px 0' }}
            >
              <Button type="dashed" icon={<PlusOutlined />} onClick={addHoliday}>
                Add First Holiday
              </Button>
            </Empty>
          ) : (
            <List
              size="small"
              dataSource={holidays}
              renderItem={(holiday) => (
                <List.Item
                  key={holiday.key}
                  actions={[
                    <Tooltip title="Recurring yearly" key="recurring">
                      <Switch
                        size="small"
                        checked={holiday.is_recurring}
                        onChange={(checked) => updateHoliday(holiday.key, 'is_recurring', checked)}
                      />
                    </Tooltip>,
                    <Button
                      key="delete"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeHoliday(holiday.key)}
                      size="small"
                    />
                  ]}
                >
                  <Row gutter={16} style={{ width: '100%' }} align="middle">
                    <Col span={8}>
                      <DatePicker
                        value={holiday.holiday_date ? dayjs(holiday.holiday_date) : null}
                        onChange={(date) => updateHoliday(holiday.key, 'holiday_date', date?.format('YYYY-MM-DD'))}
                        format="DD MMM YYYY"
                        style={{ width: '100%' }}
                        size="small"
                      />
                    </Col>
                    <Col span={14}>
                      <Input
                        value={holiday.holiday_name}
                        onChange={(e) => updateHoliday(holiday.key, 'holiday_name', e.target.value)}
                        placeholder="Holiday name (e.g., Republic Day)"
                        size="small"
                      />
                    </Col>
                    <Col span={2}>
                      {holiday.is_recurring && (
                        <Tooltip title="Recurring yearly">
                          <Tag color="blue" style={{ margin: 0 }}>R</Tag>
                        </Tooltip>
                      )}
                    </Col>
                  </Row>
                </List.Item>
              )}
            />
          )}

          <Divider />

          <Form.Item name="is_active" valuePropName="checked" label="Status">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default HolidayCalendarManager;
