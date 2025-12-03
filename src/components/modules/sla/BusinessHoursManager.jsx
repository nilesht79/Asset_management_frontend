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
  TimePicker,
  Switch,
  Checkbox,
  message,
  Popconfirm,
  Row,
  Col,
  Divider,
  Typography,
  Select,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  ScheduleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import slaService from '../../../services/sla';

const { Text, Title } = Typography;
const { Option } = Select;

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' }
];

/**
 * Business Hours Manager Component
 * Admin interface for managing business hours schedules
 */
const BusinessHoursManager = () => {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form] = Form.useForm();
  const [dayDetails, setDayDetails] = useState({});
  const [breaks, setBreaks] = useState([]);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await slaService.getBusinessHoursSchedules();
      const data = response.data?.data;
      setSchedules(data?.schedules || []);
    } catch (error) {
      message.error('Failed to fetch business hours schedules');
    } finally {
      setLoading(false);
    }
  };

  const initializeDayDetails = () => {
    const details = {};
    DAYS_OF_WEEK.forEach(day => {
      details[day.value] = {
        is_working_day: day.value >= 1 && day.value <= 5, // Mon-Fri
        start_time: '09:00',
        end_time: '18:00'
      };
    });
    return details;
  };

  const handleCreate = () => {
    setEditingSchedule(null);
    form.resetFields();
    form.setFieldsValue({
      is_default: false,
      timezone: 'Asia/Kolkata'
    });
    setDayDetails(initializeDayDetails());
    setBreaks([]);
    setModalVisible(true);
  };

  const handleEdit = async (record) => {
    setEditingSchedule(record);
    setLoading(true);

    try {
      const response = await slaService.getBusinessHoursDetails(record.schedule_id);
      const responseData = response.data?.data;
      const daysList = responseData?.details || [];
      const breaksList = responseData?.breaks || [];

      form.setFieldsValue({
        schedule_name: record.schedule_name,
        description: record.description,
        timezone: record.timezone || 'Asia/Kolkata',
        is_default: record.is_default === true || record.is_default === 1
      });

      // Parse day details
      const parsedDayDetails = {};
      DAYS_OF_WEEK.forEach(day => {
        const dayData = daysList.find(d => d.day_of_week === day.value);
        parsedDayDetails[day.value] = {
          is_working_day: dayData?.is_working_day === true || dayData?.is_working_day === 1 || (dayData?.is_working_day === undefined && day.value >= 1 && day.value <= 5),
          start_time: dayData?.start_time?.slice(0, 5) || '09:00',
          end_time: dayData?.end_time?.slice(0, 5) || '18:00'
        };
      });
      setDayDetails(parsedDayDetails);

      // Parse breaks
      const parsedBreaks = breaksList.map((b, idx) => ({
        key: idx,
        break_name: b.break_name,
        start_time: b.start_time?.slice(0, 5) || '12:00',
        end_time: b.end_time?.slice(0, 5) || '13:00',
        applies_to_days: b.applies_to_days || [1, 2, 3, 4, 5]
      }));
      setBreaks(parsedBreaks);

      setModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch schedule details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId) => {
    try {
      await slaService.deleteBusinessHoursSchedule(scheduleId);
      message.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      message.error('Failed to delete schedule');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Build day details array
      const dayDetailsArray = Object.entries(dayDetails).map(([dayOfWeek, details]) => ({
        day_of_week: parseInt(dayOfWeek),
        is_working_day: details.is_working_day,
        start_time: details.start_time,
        end_time: details.end_time
      }));

      // Build breaks array
      const breaksArray = breaks.map(b => ({
        break_name: b.break_name,
        start_time: b.start_time,
        end_time: b.end_time,
        applies_to_days: b.applies_to_days
      }));

      const scheduleData = {
        schedule_id: editingSchedule?.schedule_id,
        schedule_name: values.schedule_name,
        description: values.description,
        timezone: values.timezone,
        is_default: values.is_default,
        days: dayDetailsArray,
        breaks: breaksArray
      };

      await slaService.saveBusinessHoursSchedule(scheduleData);
      message.success(editingSchedule ? 'Schedule updated successfully' : 'Schedule created successfully');
      setModalVisible(false);
      fetchSchedules();
    } catch (error) {
      if (error.errorFields) {
        return;
      }
      message.error('Failed to save schedule');
    }
  };

  const handleDayChange = (dayOfWeek, field, value) => {
    setDayDetails(prev => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value
      }
    }));
  };

  const addBreak = () => {
    setBreaks(prev => [
      ...prev,
      {
        key: Date.now(),
        break_name: 'Lunch Break',
        start_time: '12:00',
        end_time: '13:00',
        applies_to_days: [1, 2, 3, 4, 5]
      }
    ]);
  };

  const updateBreak = (key, field, value) => {
    setBreaks(prev => prev.map(b =>
      b.key === key ? { ...b, [field]: value } : b
    ));
  };

  const removeBreak = (key) => {
    setBreaks(prev => prev.filter(b => b.key !== key));
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const renderDaysSummary = (record) => {
    // This would need actual data from the schedule
    // For now, show a simple summary
    return (
      <Space>
        {DAYS_OF_WEEK.map(day => (
          <Tag
            key={day.value}
            color={day.value >= 1 && day.value <= 5 ? 'blue' : 'default'}
            style={{ margin: 0, fontSize: '10px', padding: '0 4px' }}
          >
            {day.short}
          </Tag>
        ))}
      </Space>
    );
  };

  const columns = [
    {
      title: 'Schedule Name',
      dataIndex: 'schedule_name',
      key: 'schedule_name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Text strong>{text}</Text>
            {record.is_default && <Tag color="green">Default</Tag>}
          </Space>
          {record.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.description}</Text>
          )}
        </Space>
      )
    },
    {
      title: 'Timezone',
      dataIndex: 'timezone',
      key: 'timezone',
      width: 150
    },
    {
      title: 'Working Days',
      key: 'working_days',
      render: (_, record) => renderDaysSummary(record)
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
          {!record.is_default && (
            <Popconfirm
              title="Delete this schedule?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.schedule_id)}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Delete">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <Card
      title={
        <Space>
          <ScheduleOutlined />
          <span>Business Hours Schedules</span>
        </Space>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Create Schedule
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={schedules}
        rowKey="schedule_id"
        loading={loading}
        pagination={false}
        size="middle"
      />

      <Modal
        title={
          <Space>
            <ClockCircleOutlined />
            <span>{editingSchedule ? 'Edit Schedule' : 'Create Schedule'}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
        okText={editingSchedule ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="schedule_name"
                label="Schedule Name"
                rules={[{ required: true, message: 'Please enter schedule name' }]}
              >
                <Input placeholder="e.g., Standard Business Hours" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="timezone" label="Timezone">
                <Select>
                  <Option value="Asia/Kolkata">Asia/Kolkata (IST)</Option>
                  <Option value="UTC">UTC</Option>
                  <Option value="America/New_York">America/New_York (EST)</Option>
                  <Option value="Europe/London">Europe/London (GMT)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} placeholder="Brief description of this schedule" />
          </Form.Item>

          <Divider>Working Hours by Day</Divider>

          <div style={{ marginBottom: 16 }}>
            {DAYS_OF_WEEK.map(day => (
              <Row key={day.value} gutter={16} style={{ marginBottom: 8 }} align="middle">
                <Col span={6}>
                  <Checkbox
                    checked={dayDetails[day.value]?.is_working_day}
                    onChange={(e) => handleDayChange(day.value, 'is_working_day', e.target.checked)}
                  >
                    {day.label}
                  </Checkbox>
                </Col>
                <Col span={8}>
                  <TimePicker
                    value={dayDetails[day.value]?.start_time ? dayjs(dayDetails[day.value].start_time, 'HH:mm') : null}
                    onChange={(time) => handleDayChange(day.value, 'start_time', time?.format('HH:mm'))}
                    format="HH:mm"
                    disabled={!dayDetails[day.value]?.is_working_day}
                    placeholder="Start"
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={2} style={{ textAlign: 'center' }}>
                  <Text type="secondary">to</Text>
                </Col>
                <Col span={8}>
                  <TimePicker
                    value={dayDetails[day.value]?.end_time ? dayjs(dayDetails[day.value].end_time, 'HH:mm') : null}
                    onChange={(time) => handleDayChange(day.value, 'end_time', time?.format('HH:mm'))}
                    format="HH:mm"
                    disabled={!dayDetails[day.value]?.is_working_day}
                    placeholder="End"
                    style={{ width: '100%' }}
                  />
                </Col>
              </Row>
            ))}
          </div>

          <Divider>
            Break Times
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={addBreak}
              style={{ marginLeft: 8 }}
            >
              Add Break
            </Button>
          </Divider>

          {breaks.length === 0 ? (
            <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: 16 }}>
              No breaks configured. Click "Add Break" to add lunch or other breaks.
            </Text>
          ) : (
            breaks.map(breakItem => (
              <Row key={breakItem.key} gutter={16} style={{ marginBottom: 8 }} align="middle">
                <Col span={6}>
                  <Input
                    value={breakItem.break_name}
                    onChange={(e) => updateBreak(breakItem.key, 'break_name', e.target.value)}
                    placeholder="Break name"
                    size="small"
                  />
                </Col>
                <Col span={5}>
                  <TimePicker
                    value={breakItem.start_time ? dayjs(breakItem.start_time, 'HH:mm') : null}
                    onChange={(time) => updateBreak(breakItem.key, 'start_time', time?.format('HH:mm'))}
                    format="HH:mm"
                    placeholder="Start"
                    size="small"
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={5}>
                  <TimePicker
                    value={breakItem.end_time ? dayjs(breakItem.end_time, 'HH:mm') : null}
                    onChange={(time) => updateBreak(breakItem.key, 'end_time', time?.format('HH:mm'))}
                    format="HH:mm"
                    placeholder="End"
                    size="small"
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={6}>
                  <Select
                    mode="multiple"
                    value={breakItem.applies_to_days}
                    onChange={(value) => updateBreak(breakItem.key, 'applies_to_days', value)}
                    placeholder="Days"
                    size="small"
                    style={{ width: '100%' }}
                    maxTagCount={2}
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <Option key={day.value} value={day.value}>{day.short}</Option>
                    ))}
                  </Select>
                </Col>
                <Col span={2}>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeBreak(breakItem.key)}
                    size="small"
                  />
                </Col>
              </Row>
            ))
          )}

          <Divider />

          <Form.Item name="is_default" valuePropName="checked">
            <Switch /> <Text style={{ marginLeft: 8 }}>Set as Default Schedule</Text>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default BusinessHoursManager;
