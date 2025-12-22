import React, { useState } from 'react';
import { Tabs, Card, Space, Typography } from 'antd';
import { useSelector } from 'react-redux';
import {
  SettingOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  SlaRulesManager,
  BusinessHoursManager,
  HolidayCalendarManager,
  SlaDashboard,
  TicketReopenConfig
} from '../components/modules/sla';

const { Title, Text } = Typography;

/**
 * SLA Settings Page
 * Admin interface for configuring SLA rules, business hours, and holidays
 */
const SlaSettings = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useSelector(state => state.auth);

  // Coordinators only see the Dashboard tab
  const isCoordinator = user?.role === 'coordinator';

  const allTabItems = [
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
    },
    {
      key: 'reopen',
      label: (
        <Space>
          <ReloadOutlined />
          <span>Ticket Reopen</span>
        </Space>
      ),
      children: <TicketReopenConfig />
    }
  ];

  // Filter tabs based on role - coordinators only see dashboard
  const tabItems = isCoordinator
    ? allTabItems.filter(tab => tab.key === 'dashboard')
    : allTabItems;

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
