import React, { useState, useEffect } from 'react';
import {
  Tag,
  Tooltip,
  Progress,
  Space,
  Typography,
  Popover,
  Spin,
  Badge
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  PauseCircleOutlined,
  FireOutlined
} from '@ant-design/icons';
import slaService from '../../../services/sla';

const { Text } = Typography;

/**
 * SlaStatusBadge Component
 * Displays SLA status for a ticket with optional detailed view
 */
const SlaStatusBadge = ({
  ticketId,
  slaData = null, // Pre-fetched SLA data (optional)
  showProgress = false,
  showDetails = false,
  size = 'default', // 'small', 'default', 'large'
  compact = false
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(slaData);

  useEffect(() => {
    if (!slaData && ticketId) {
      fetchSlaData();
    }
  }, [ticketId, slaData]);

  const fetchSlaData = async () => {
    setLoading(true);
    try {
      const response = await slaService.getTicketSlaTracking(ticketId);
      const trackingData = response.data?.data?.tracking;
      if (trackingData) {
        setData({
          status: trackingData.sla_status,
          elapsed_minutes: trackingData.elapsed_business_minutes,
          remaining_minutes: trackingData.max_tat_minutes - trackingData.elapsed_business_minutes,
          percent_used: slaService.calculatePercentage(
            trackingData.elapsed_business_minutes,
            trackingData.max_tat_minutes
          ),
          is_paused: trackingData.is_paused,
          rule_name: trackingData.rule_name,
          min_tat: trackingData.min_tat_minutes,
          avg_tat: trackingData.avg_tat_minutes,
          max_tat: trackingData.max_tat_minutes
        });
      }
    } catch (error) {
      console.error('Failed to fetch SLA data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spin size="small" />;
  }

  if (!data) {
    return (
      <Tag color="default" style={size === 'small' ? { fontSize: '10px' } : {}}>
        No SLA
      </Tag>
    );
  }

  const getStatusIcon = () => {
    if (data.is_paused) return <PauseCircleOutlined />;

    switch (data.status) {
      case 'on_track':
        return <CheckCircleOutlined />;
      case 'warning':
        return <ClockCircleOutlined />;
      case 'critical':
        return <ExclamationCircleOutlined />;
      case 'breached':
        return <FireOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getStatusColor = () => {
    if (data.is_paused) return 'blue';
    return slaService.getStatusColor(data.status);
  };

  const getProgressColor = () => {
    if (data.is_paused) return '#1890ff';
    return slaService.getZoneColor(data.percent_used);
  };

  const formatTime = (minutes) => {
    if (minutes == null) return '-';
    const isNegative = minutes < 0;
    const formatted = slaService.formatDuration(Math.abs(minutes));
    return isNegative ? `-${formatted}` : formatted;
  };

  const renderCompactBadge = () => (
    <Tag
      color={getStatusColor()}
      icon={getStatusIcon()}
      style={{
        fontSize: size === 'small' ? '10px' : '12px',
        padding: size === 'small' ? '0 4px' : '0 7px'
      }}
    >
      {data.is_paused ? 'Paused' : slaService.getStatusDisplayName(data.status)}
    </Tag>
  );

  const renderDetailedContent = () => (
    <div style={{ width: 250 }}>
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">Status:</Text>
          <Tag color={getStatusColor()} icon={getStatusIcon()}>
            {data.is_paused ? 'Paused' : slaService.getStatusDisplayName(data.status)}
          </Tag>
        </div>

        {/* Progress */}
        <div>
          <Text type="secondary" style={{ fontSize: '12px' }}>Progress:</Text>
          <Progress
            percent={Math.min(100, data.percent_used)}
            strokeColor={getProgressColor()}
            size="small"
            format={() => `${data.percent_used}%`}
          />
        </div>

        {/* Time Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>Elapsed:</Text>
          <Text style={{ fontSize: '12px' }}>{formatTime(data.elapsed_minutes)}</Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {data.remaining_minutes >= 0 ? 'Remaining:' : 'Overdue:'}
          </Text>
          <Text
            type={data.remaining_minutes < 0 ? 'danger' : undefined}
            style={{ fontSize: '12px' }}
          >
            {formatTime(data.remaining_minutes)}
          </Text>
        </div>

        {/* TAT Thresholds */}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 4 }}>
          <Text type="secondary" style={{ fontSize: '11px' }}>TAT Thresholds:</Text>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: '11px', color: '#52c41a' }}>
              Min: {formatTime(data.min_tat)}
            </Text>
            <Text style={{ fontSize: '11px', color: '#faad14' }}>
              Avg: {formatTime(data.avg_tat)}
            </Text>
            <Text style={{ fontSize: '11px', color: '#ff4d4f' }}>
              Max: {formatTime(data.max_tat)}
            </Text>
          </div>
        </div>

        {/* Rule Name */}
        {data.rule_name && (
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8 }}>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              SLA Rule: {data.rule_name}
            </Text>
          </div>
        )}
      </Space>
    </div>
  );

  // Simple compact view
  if (compact) {
    return (
      <Tooltip title={`SLA: ${slaService.getStatusDisplayName(data.status)} - ${formatTime(data.remaining_minutes)} remaining`}>
        {renderCompactBadge()}
      </Tooltip>
    );
  }

  // With progress bar
  if (showProgress && !showDetails) {
    return (
      <Space direction="vertical" size={0} style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {renderCompactBadge()}
          <Text type="secondary" style={{ fontSize: '11px' }}>
            {formatTime(data.remaining_minutes)} left
          </Text>
        </div>
        <Progress
          percent={Math.min(100, data.percent_used)}
          strokeColor={getProgressColor()}
          size="small"
          showInfo={false}
          style={{ marginTop: 4 }}
        />
      </Space>
    );
  }

  // With popover details
  if (showDetails) {
    return (
      <Popover
        content={renderDetailedContent()}
        title={
          <Space>
            <ClockCircleOutlined />
            <span>SLA Details</span>
          </Space>
        }
        trigger="hover"
        placement="bottom"
      >
        <Space style={{ cursor: 'pointer' }}>
          {renderCompactBadge()}
          {showProgress && (
            <Progress
              type="circle"
              percent={Math.min(100, data.percent_used)}
              strokeColor={getProgressColor()}
              width={24}
              format={() => ''}
            />
          )}
        </Space>
      </Popover>
    );
  }

  // Default - just the badge
  return renderCompactBadge();
};

/**
 * SlaStatusIndicator - Minimal indicator for table columns
 */
export const SlaStatusIndicator = ({ status, isPaused, size = 'small' }) => {
  const getColor = () => {
    if (isPaused) return 'blue';
    return slaService.getStatusColor(status);
  };

  const getIcon = () => {
    if (isPaused) return <PauseCircleOutlined />;
    switch (status) {
      case 'on_track': return <CheckCircleOutlined />;
      case 'warning': return <WarningOutlined />;
      case 'critical': return <ExclamationCircleOutlined />;
      case 'breached': return <FireOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  return (
    <Badge
      status={status === 'breached' ? 'error' : status === 'critical' ? 'warning' : status === 'warning' ? 'processing' : 'success'}
      text={
        <Tag color={getColor()} icon={getIcon()} style={{ fontSize: size === 'small' ? '10px' : '12px' }}>
          {isPaused ? 'Paused' : slaService.getStatusDisplayName(status)}
        </Tag>
      }
    />
  );
};

/**
 * SlaProgressBar - Standalone progress bar
 */
export const SlaProgressBar = ({ elapsed, max, status, isPaused, showText = true }) => {
  const percent = slaService.calculatePercentage(elapsed, max);
  const remaining = max - elapsed;

  const getColor = () => {
    if (isPaused) return '#1890ff';
    return slaService.getZoneColor(percent);
  };

  return (
    <Space direction="vertical" size={0} style={{ width: '100%' }}>
      <Progress
        percent={Math.min(100, percent)}
        strokeColor={getColor()}
        size="small"
        showInfo={showText}
        format={() => `${percent}%`}
      />
      {showText && (
        <Text type="secondary" style={{ fontSize: '11px' }}>
          {remaining >= 0
            ? `${slaService.formatDuration(remaining)} remaining`
            : `${slaService.formatDuration(Math.abs(remaining))} overdue`}
        </Text>
      )}
    </Space>
  );
};

export default SlaStatusBadge;
