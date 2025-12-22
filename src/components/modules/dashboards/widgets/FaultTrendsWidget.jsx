import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  List,
  Tag,
  Space,
  Spin,
  Empty,
  Badge,
  Progress,
  Tooltip,
  Button
} from 'antd';
import {
  WarningOutlined,
  ToolOutlined,
  ExclamationCircleOutlined,
  AlertOutlined,
  RightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import faultAnalysisService from '../../../../services/faultAnalysis';

const { Text, Title } = Typography;

// Theme colors
const THEME = {
  primary: '#2563eb',
  success: '#16a34a',
  warning: '#ea580c',
  danger: '#dc2626',
  info: '#0ea5e9',
  purple: '#9333ea',
  gray: '#6b7280',
  dark: '#1f2937',
  border: '#e5e7eb',
  shadow: 'rgba(0, 0, 0, 0.1)'
};

/**
 * FaultTrendsWidget - Dashboard widget showing fault analysis summary
 * Can be added to Admin, Coordinator, or IT Head dashboards
 */
const FaultTrendsWidget = ({ compact = false }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeFlags, setActiveFlags] = useState([]);
  const [problematicAssets, setProblematicAssets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadFaultData();
  }, []);

  const loadFaultData = async () => {
    setLoading(true);
    try {
      const [statsResponse, flagsResponse, problematicResponse] = await Promise.all([
        faultAnalysisService.getFlagStats().catch(() => ({ data: { data: null } })),
        faultAnalysisService.getActiveFlags({ limit: 5 }).catch(() => ({ data: { data: { flags: [] } } })),
        faultAnalysisService.getProblematicAssetsReport().catch(() => ({ data: { data: { report: [] } } }))
      ]);

      setStats(statsResponse.data?.data || null);
      setActiveFlags(flagsResponse.data?.data?.flags || []);
      setProblematicAssets(problematicResponse.data?.data?.report || []);
    } catch (error) {
      console.error('Failed to load fault data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFlagTypeColor = (type) => {
    const colors = {
      recurring_asset: THEME.danger,
      recurring_model: THEME.warning,
      high_repair_cost: THEME.purple,
      frequent_same_fault: THEME.info,
      manual: THEME.gray
    };
    return colors[type] || THEME.gray;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'red',
      high: 'orange',
      medium: 'gold',
      low: 'blue'
    };
    return colors[severity] || 'default';
  };

  const formatFlagType = (type) => {
    const names = {
      recurring_asset: 'Recurring Asset',
      recurring_model: 'Model Issue',
      high_repair_cost: 'High Cost',
      frequent_same_fault: 'Same Fault',
      manual: 'Manual Flag'
    };
    return names[type] || type;
  };

  // Chart for fault category distribution
  const getFaultCategoryChartConfig = () => {
    if (!stats?.flagsByType) return {};

    const data = stats.flagsByType.map(item => ({
      name: formatFlagType(item.flag_type),
      value: item.count
    }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: THEME.border,
        borderWidth: 1,
        textStyle: { color: THEME.dark }
      },
      series: [{
        type: 'pie',
        radius: compact ? ['35%', '60%'] : ['40%', '70%'],
        center: ['50%', '50%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: !compact,
          formatter: '{b}',
          fontSize: 11
        },
        itemStyle: {
          color: (params) => {
            const colors = [THEME.danger, THEME.warning, THEME.purple, THEME.info, THEME.gray];
            return colors[params.dataIndex % colors.length];
          }
        }
      }]
    };
  };

  if (loading) {
    return (
      <Card style={{ borderRadius: '12px', border: 'none', boxShadow: `0 4px 12px ${THEME.shadow}` }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin tip="Loading fault analysis..." />
        </div>
      </Card>
    );
  }

  // Compact version for smaller dashboard space
  if (compact) {
    return (
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <WarningOutlined style={{ color: THEME.danger }} />
              <span style={{ fontWeight: 600 }}>Fault Alerts</span>
              {stats?.totalActive > 0 && (
                <Badge count={stats.totalActive} style={{ backgroundColor: THEME.danger }} />
              )}
            </Space>
            <Button
              type="link"
              size="small"
              icon={<RightOutlined />}
              onClick={() => navigate('/fault-analysis')}
            >
              View All
            </Button>
          </div>
        }
        size="small"
        style={{ borderRadius: '12px', border: 'none', boxShadow: `0 4px 12px ${THEME.shadow}` }}
      >
        <Row gutter={[8, 8]}>
          <Col span={8}>
            <Statistic
              title={<Text style={{ fontSize: '11px' }}>Active Flags</Text>}
              value={stats?.totalActive || 0}
              valueStyle={{ color: THEME.danger, fontSize: '20px' }}
              prefix={<AlertOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title={<Text style={{ fontSize: '11px' }}>Critical</Text>}
              value={stats?.flagsBySeverity?.find(s => s.severity === 'critical')?.count || 0}
              valueStyle={{ color: THEME.danger, fontSize: '20px' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title={<Text style={{ fontSize: '11px' }}>Resolved</Text>}
              value={stats?.totalResolved || 0}
              valueStyle={{ color: THEME.success, fontSize: '20px' }}
              prefix={<CheckCircleOutlined />}
            />
          </Col>
        </Row>

        {activeFlags.length > 0 && (
          <List
            size="small"
            style={{ marginTop: 12 }}
            dataSource={activeFlags.slice(0, 3)}
            renderItem={(flag) => (
              <List.Item style={{ padding: '8px 0', borderBottom: `1px solid ${THEME.border}` }}>
                <Space size={4}>
                  <Badge color={getFlagTypeColor(flag.flag_type)} />
                  <Text ellipsis style={{ maxWidth: 150, fontSize: '12px' }}>
                    {flag.asset_tag || flag.product_name}
                  </Text>
                  <Tag color={getSeverityColor(flag.severity)} style={{ fontSize: '10px' }}>
                    {flag.severity}
                  </Tag>
                </Space>
              </List.Item>
            )}
          />
        )}
      </Card>
    );
  }

  // Full version for main dashboard area
  return (
    <Row gutter={[24, 24]}>
      {/* Summary Stats Row */}
      <Col span={24}>
        <Card
          title={
            <div style={{
              display: 'flex',
              alignItems: 'center',
              paddingBottom: '12px',
              borderBottom: `1px solid ${THEME.border}`
            }}>
              <WarningOutlined style={{ marginRight: '8px', color: THEME.danger, fontSize: '16px' }} />
              <span style={{ fontSize: '16px', fontWeight: 600, color: THEME.dark }}>
                Fault Analysis Overview
              </span>
              <Tag
                color={THEME.danger}
                style={{ fontSize: '11px', fontWeight: 500, marginLeft: '12px', cursor: 'pointer' }}
                onClick={() => navigate('/fault-analysis')}
              >
                VIEW DETAILS
              </Tag>
            </div>
          }
          style={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: `0 4px 12px ${THEME.shadow}`
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Statistic
                  title={<span style={{ fontSize: '13px', color: THEME.gray }}>Active Flags</span>}
                  value={stats?.totalActive || 0}
                  valueStyle={{ color: THEME.danger, fontSize: '32px', fontWeight: 600 }}
                  prefix={<AlertOutlined />}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Statistic
                  title={<span style={{ fontSize: '13px', color: THEME.gray }}>Critical Issues</span>}
                  value={stats?.flagsBySeverity?.find(s => s.severity === 'critical')?.count || 0}
                  valueStyle={{ color: THEME.danger, fontSize: '32px', fontWeight: 600 }}
                  prefix={<ExclamationCircleOutlined />}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Statistic
                  title={<span style={{ fontSize: '13px', color: THEME.gray }}>Resolved (30d)</span>}
                  value={stats?.totalResolved || 0}
                  valueStyle={{ color: THEME.success, fontSize: '32px', fontWeight: 600 }}
                  prefix={<CheckCircleOutlined />}
                />
              </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ textAlign: 'center', padding: '12px' }}>
                <Statistic
                  title={<span style={{ fontSize: '13px', color: THEME.gray }}>Problematic Assets</span>}
                  value={problematicAssets?.length || 0}
                  valueStyle={{ color: THEME.warning, fontSize: '32px', fontWeight: 600 }}
                  prefix={<ToolOutlined />}
                />
              </div>
            </Col>
          </Row>
        </Card>
      </Col>

      {/* Charts and Lists Row */}
      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <AlertOutlined style={{ color: THEME.danger }} />
              <span style={{ fontWeight: 600 }}>Flag Distribution</span>
            </Space>
          }
          style={{ borderRadius: '12px', border: 'none', boxShadow: `0 4px 12px ${THEME.shadow}`, height: '100%' }}
        >
          {stats?.flagsByType && stats.flagsByType.length > 0 ? (
            <ReactECharts
              option={getFaultCategoryChartConfig()}
              style={{ height: '250px', width: '100%' }}
              opts={{ renderer: 'svg' }}
            />
          ) : (
            <Empty description="No flag data available" />
          )}
        </Card>
      </Col>

      <Col xs={24} lg={12}>
        <Card
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: THEME.warning }} />
              <span style={{ fontWeight: 600 }}>Active Flags</span>
              <Badge count={activeFlags.length} style={{ backgroundColor: THEME.danger }} />
            </Space>
          }
          style={{ borderRadius: '12px', border: 'none', boxShadow: `0 4px 12px ${THEME.shadow}`, height: '100%' }}
          bodyStyle={{ padding: 0 }}
        >
          {activeFlags.length > 0 ? (
            <List
              dataSource={activeFlags}
              style={{ maxHeight: '280px', overflow: 'auto' }}
              renderItem={(flag, index) => (
                <List.Item
                  style={{
                    padding: '12px 16px',
                    borderBottom: index < activeFlags.length - 1 ? `1px solid ${THEME.border}` : 'none'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: `${getFlagTypeColor(flag.flag_type)}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${getFlagTypeColor(flag.flag_type)}30`
                      }}>
                        <WarningOutlined style={{ color: getFlagTypeColor(flag.flag_type) }} />
                      </div>
                    }
                    title={
                      <Space size={4}>
                        <Text strong style={{ fontSize: '13px' }}>
                          {flag.asset_tag || flag.product_name || 'Unknown'}
                        </Text>
                        <Tag color={getSeverityColor(flag.severity)} style={{ fontSize: '10px' }}>
                          {flag.severity}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {formatFlagType(flag.flag_type)} - {flag.reason?.substring(0, 50)}...
                        </Text>
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          <ClockCircleOutlined /> {new Date(flag.created_at).toLocaleDateString()}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: THEME.success }}>
                    <CheckCircleOutlined /> No active fault flags
                  </span>
                }
              />
            </div>
          )}
        </Card>
      </Col>

      {/* Problematic Assets */}
      {problematicAssets.length > 0 && (
        <Col span={24}>
          <Card
            title={
              <Space>
                <ToolOutlined style={{ color: THEME.warning }} />
                <span style={{ fontWeight: 600 }}>Problematic Assets</span>
                <Tag color="orange">Requires Attention</Tag>
              </Space>
            }
            style={{ borderRadius: '12px', border: 'none', boxShadow: `0 4px 12px ${THEME.shadow}` }}
          >
            <Row gutter={[16, 16]}>
              {problematicAssets.slice(0, 4).map((asset, index) => (
                <Col xs={24} sm={12} md={6} key={asset.asset_id || index}>
                  <Card
                    size="small"
                    style={{
                      borderRadius: '8px',
                      border: `1px solid ${THEME.border}`,
                      background: '#fef3c7'
                    }}
                  >
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Text strong>{asset.asset_tag}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {asset.product_name}
                      </Text>
                      <Space>
                        <Tag color="red" style={{ fontSize: '10px' }}>
                          {asset.total_repairs || asset.fault_count || 0} repairs
                        </Tag>
                        {asset.total_cost && (
                          <Tag color="purple" style={{ fontSize: '10px' }}>
                            Rs. {parseFloat(asset.total_cost).toLocaleString()}
                          </Tag>
                        )}
                      </Space>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      )}
    </Row>
  );
};

export default FaultTrendsWidget;
