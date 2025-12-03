import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Space,
  Typography,
  Progress,
  Spin,
  DatePicker,
  Button,
  Tooltip,
  Badge,
  message,
  Alert
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  FireOutlined,
  ReloadOutlined,
  BellOutlined,
  RiseOutlined,
  FallOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import slaService from '../../../services/sla';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

/**
 * SLA Dashboard Component
 * Displays SLA metrics, performance stats, and alerts
 */
const SlaDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const params = {
        startDate: dateRange[0]?.format('YYYY-MM-DD'),
        endDate: dateRange[1]?.format('YYYY-MM-DD')
      };
      const response = await slaService.getDashboard(params);
      const data = response.data?.data;
      setDashboardData(data);
    } catch (error) {
      message.error('Failed to fetch SLA dashboard data');
      console.error('Dashboard fetch error:', error);
    }
  }, [dateRange]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDashboardData();
      setLoading(false);
    };
    loadData();
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    message.success('Dashboard refreshed');
  };

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Loading SLA Dashboard...</Text>
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const approachingBreach = dashboardData?.approaching_breach || [];
  const breachedTickets = dashboardData?.breached_tickets || [];
  const notificationStats = dashboardData?.notification_stats || {};

  // Calculate percentages
  const complianceRate = metrics.total_tickets > 0
    ? ((metrics.resolved_within_sla || 0) / metrics.total_tickets * 100).toFixed(1)
    : 0;

  const breachRate = metrics.total_tickets > 0
    ? ((metrics.breached_count || 0) / metrics.total_tickets * 100).toFixed(1)
    : 0;

  const getStatusColor = (status) => slaService.getStatusColor(status);

  const approachingBreachColumns = [
    {
      title: 'Ticket',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      width: 120,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {record.ticket_title?.substring(0, 30)}...
          </Text>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'sla_status',
      key: 'sla_status',
      width: 120,
      render: (status) => {
        const icon = status === 'warning' ? <WarningOutlined /> :
          status === 'critical' ? <ExclamationCircleOutlined /> :
          <ClockCircleOutlined />;
        return (
          <Tag color={getStatusColor(status)} icon={icon}>
            {slaService.getStatusDisplayName(status)}
          </Tag>
        );
      }
    },
    {
      title: 'Time Remaining',
      dataIndex: 'remaining_minutes',
      key: 'remaining_minutes',
      width: 120,
      render: (minutes) => {
        const isOverdue = minutes < 0;
        return (
          <Text type={isOverdue ? 'danger' : minutes < 30 ? 'warning' : undefined}>
            {isOverdue ? '-' : ''}{slaService.formatDuration(Math.abs(minutes))}
          </Text>
        );
      }
    },
    {
      title: 'Progress',
      dataIndex: 'percent_used',
      key: 'percent_used',
      width: 150,
      render: (percent) => (
        <Progress
          percent={Math.min(100, percent)}
          size="small"
          strokeColor={slaService.getZoneColor(percent)}
          format={() => `${percent}%`}
        />
      )
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to_name',
      key: 'assigned_to_name',
      width: 120,
      render: (text) => text || <Text type="secondary">Unassigned</Text>
    }
  ];

  const breachedColumns = [
    {
      title: 'Ticket',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      width: 120,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {record.ticket_title?.substring(0, 30)}...
          </Text>
        </Space>
      )
    },
    {
      title: 'Breached At',
      dataIndex: 'breached_at',
      key: 'breached_at',
      width: 140,
      render: (date) => date ? dayjs(date).format('MMM D, YYYY HH:mm') : '-'
    },
    {
      title: 'Overdue By',
      dataIndex: 'overdue_minutes',
      key: 'overdue_minutes',
      width: 100,
      render: (minutes) => (
        <Text type="danger">
          {slaService.formatDuration(Math.abs(minutes || 0))}
        </Text>
      )
    },
    {
      title: 'Escalation Level',
      dataIndex: 'escalation_level',
      key: 'escalation_level',
      width: 120,
      render: (level) => (
        <Badge
          count={level || 0}
          style={{ backgroundColor: level >= 3 ? '#ff4d4f' : level >= 2 ? '#faad14' : '#52c41a' }}
        />
      )
    },
    {
      title: 'Assigned To',
      dataIndex: 'assigned_to_name',
      key: 'assigned_to_name',
      width: 120,
      render: (text) => text || <Text type="secondary">Unassigned</Text>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={handleDateChange}
            allowClear={false}
            presets={[
              { label: 'Last 7 Days', value: [dayjs().subtract(7, 'day'), dayjs()] },
              { label: 'Last 30 Days', value: [dayjs().subtract(30, 'day'), dayjs()] },
              { label: 'Last 90 Days', value: [dayjs().subtract(90, 'day'), dayjs()] },
              { label: 'This Month', value: [dayjs().startOf('month'), dayjs()] },
              { label: 'Last Month', value: [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')] }
            ]}
          />
        </Space>
        <Button
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={handleRefresh}
          loading={refreshing}
        >
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tickets (Period)"
              value={metrics.total_tickets || 0}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="SLA Compliance Rate"
              value={complianceRate}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: complianceRate >= 90 ? '#52c41a' : complianceRate >= 75 ? '#faad14' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Breached Tickets"
              value={metrics.breached_count || 0}
              prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
              suffix={<Text type="secondary" style={{ fontSize: '14px' }}>({breachRate}%)</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Resolution Time"
              value={slaService.formatDuration(metrics.avg_resolution_minutes || 0)}
              prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Status Breakdown */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={<Space><ClockCircleOutlined /> Current SLA Status Distribution</Space>}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="On Track"
                  value={metrics.on_track_count || 0}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Warning"
                  value={metrics.warning_count || 0}
                  valueStyle={{ color: '#faad14' }}
                  prefix={<WarningOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Critical"
                  value={metrics.critical_count || 0}
                  valueStyle={{ color: '#fa8c16' }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Paused"
                  value={metrics.paused_count || 0}
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<PauseCircleOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<Space><BellOutlined /> Notification Summary</Space>}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Sent"
                  value={notificationStats.sent || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Pending"
                  value={notificationStats.pending || 0}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Failed"
                  value={notificationStats.failed || 0}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Alerts Section */}
      {(approachingBreach.length > 0 || breachedTickets.length > 0) && (
        <Row gutter={[16, 16]}>
          {/* Approaching Breach */}
          {approachingBreach.length > 0 && (
            <Col span={24}>
              <Card
                title={
                  <Space>
                    <WarningOutlined style={{ color: '#faad14' }} />
                    <span>Tickets Approaching Breach</span>
                    <Badge count={approachingBreach.length} style={{ backgroundColor: '#faad14' }} />
                  </Space>
                }
              >
                <Alert
                  type="warning"
                  message={`${approachingBreach.length} ticket(s) are approaching their SLA deadline within the next hour`}
                  style={{ marginBottom: 16 }}
                  showIcon
                />
                <Table
                  columns={approachingBreachColumns}
                  dataSource={approachingBreach}
                  rowKey="ticket_id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 600 }}
                />
              </Card>
            </Col>
          )}

          {/* Breached Tickets */}
          {breachedTickets.length > 0 && (
            <Col span={24}>
              <Card
                title={
                  <Space>
                    <FireOutlined style={{ color: '#ff4d4f' }} />
                    <span>Breached Tickets (Active)</span>
                    <Badge count={breachedTickets.length} style={{ backgroundColor: '#ff4d4f' }} />
                  </Space>
                }
              >
                <Alert
                  type="error"
                  message={`${breachedTickets.length} active ticket(s) have breached their SLA deadline`}
                  style={{ marginBottom: 16 }}
                  showIcon
                />
                <Table
                  columns={breachedColumns}
                  dataSource={breachedTickets}
                  rowKey="ticket_id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 600 }}
                />
              </Card>
            </Col>
          )}
        </Row>
      )}

      {/* No Issues */}
      {approachingBreach.length === 0 && breachedTickets.length === 0 && (
        <Card>
          <Alert
            type="success"
            message="All Clear"
            description="No tickets are currently approaching breach or breached. SLA compliance is on track!"
            showIcon
            icon={<CheckCircleOutlined />}
          />
        </Card>
      )}
    </div>
  );
};

export default SlaDashboard;
