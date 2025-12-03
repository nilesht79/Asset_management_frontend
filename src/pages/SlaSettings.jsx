import React, { useState } from 'react';
import { Tabs, Card, Space, Typography } from 'antd';
import {
  SettingOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import {
  SlaRulesManager,
  BusinessHoursManager,
  HolidayCalendarManager,
  SlaDashboard
} from '../components/modules/sla';

const { Title, Text } = Typography;

/**
 * SLA Settings Page
 * Admin interface for configuring SLA rules, business hours, and holidays
 */
const SlaSettings = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabItems = [
    {
      key: 'dashboard',
      label: (
        <Space>
          <DashboardOutlined />
          <span>Dashboard</span>
        </Space>
      ),
      children: <SlaDashboard />
    },
    {
      key: 'rules',
      label: (
        <Space>
          <ThunderboltOutlined />
          <span>SLA Rules</span>
        </Space>
      ),
      children: <SlaRulesManager />
    },
    {
      key: 'business-hours',
      label: (
        <Space>
          <ClockCircleOutlined />
          <span>Business Hours</span>
        </Space>
      ),
      children: <BusinessHoursManager />
    },
    {
      key: 'holidays',
      label: (
        <Space>
          <CalendarOutlined />
          <span>Holiday Calendars</span>
        </Space>
      ),
      children: <HolidayCalendarManager />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Title level={2} style={{ marginBottom: 8 }}>
          <Space>
            <SettingOutlined />
            SLA Configuration
          </Space>
        </Title>
        <Text type="secondary">
          Configure SLA rules, business hours schedules, and holiday calendars for ticket management
        </Text>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
};

export default SlaSettings;
