import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Spin,
  Empty,
  Statistic,
  Row,
  Col,
  Timeline,
  Tooltip,
  Button,
  Modal,
  Descriptions,
  Badge
} from 'antd';
import {
  ToolOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import repairHistoryService from '../../../services/repairHistory';

const { Text, Title } = Typography;

/**
 * AssetRepairHistory Component
 * Shows repair history and statistics for an asset
 */
const AssetRepairHistory = ({ assetId, assetTag, viewMode = 'table' }) => {
  const [loading, setLoading] = useState(false);
  const [repairs, setRepairs] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    if (assetId) {
      fetchRepairHistory();
      fetchRepairStats();
    }
  }, [assetId, pagination.page]);

  const fetchRepairHistory = async () => {
    setLoading(true);
    try {
      const response = await repairHistoryService.getAssetRepairHistory(assetId, {
        page: pagination.page,
        limit: pagination.limit
      });
      const data = response.data?.data || response.data;
      setRepairs(data.repairs || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0
      }));
    } catch (error) {
      console.error('Failed to fetch repair history:', error);
      setRepairs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRepairStats = async () => {
    try {
      const response = await repairHistoryService.getAssetRepairStats(assetId);
      const data = response.data?.data || response.data;
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch repair stats:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'gold',
      in_progress: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  const getFaultCategoryColor = (category) => {
    const colors = {
      Hardware: 'red',
      Software: 'blue',
      Network: 'cyan',
      Electrical: 'orange',
      Mechanical: 'purple',
      Other: 'default'
    };
    return colors[category] || 'default';
  };

  const showRepairDetail = (repair) => {
    setSelectedRepair(repair);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'repair_date',
      key: 'repair_date',
      width: 95,
      render: (date) => (
        <Text style={{ fontSize: '11px' }}>{repairHistoryService.formatDate(date)}</Text>
      )
    },
    {
      title: 'Asset',
      key: 'asset',
      width: 140,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space size="small" wrap={false}>
            {record.is_component_repair ? (
              <Tag color="cyan" style={{ fontSize: '9px', padding: '0 4px' }}>COMP</Tag>
            ) : null}
            <Text strong style={{ fontSize: '11px' }}>
              {record.component_asset_tag || 'Main Asset'}
            </Text>
          </Space>
          {record.is_component_repair && record.parent_asset_tag && (
            <Text type="secondary" style={{ fontSize: '10px' }}>
              (of {record.parent_asset_tag})
            </Text>
          )}
        </Space>
      )
    },
    {
      title: 'Fault',
      dataIndex: 'fault_type_name',
      key: 'fault_type_name',
      width: 120,
      ellipsis: true,
      render: (name, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '11px' }} ellipsis={{ tooltip: name }}>
            {name || 'Not Specified'}
          </Text>
          {record.fault_category && (
            <Tag color={getFaultCategoryColor(record.fault_category)} style={{ fontSize: '9px', padding: '0 4px' }}>
              {record.fault_category}
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Description',
      dataIndex: 'fault_description',
      key: 'fault_description',
      ellipsis: { showTitle: false },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <Text style={{ fontSize: '11px' }}>{text || '-'}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Status',
      dataIndex: 'repair_status',
      key: 'repair_status',
      width: 85,
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ fontSize: '9px', padding: '0 4px' }}>
          {repairHistoryService.getStatusDisplayName(status)}
        </Tag>
      )
    },
    {
      title: 'Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
      width: 90,
      render: (cost) => (
        <Text style={{ fontSize: '11px' }}>{repairHistoryService.formatCurrency(cost)}</Text>
      )
    },
    {
      title: 'Ticket',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      width: 95,
      render: (number) =>
        number ? (
          <Tag color="blue" style={{ fontSize: '9px', padding: '0 4px' }}>{number}</Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: '10px' }}>Manual</Text>
        )
    },
    {
      title: '',
      key: 'action',
      width: 40,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => showRepairDetail(record)}
          size="small"
        />
      )
    }
  ];

  const renderStatsSummary = () => {
    if (!stats?.summary) return null;

    const { summary, faultBreakdown } = stats;

    return (
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Total Repairs"
              value={summary.total_repairs || 0}
              prefix={<ToolOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Total Cost"
              value={summary.total_repair_cost || 0}
              prefix={<DollarOutlined />}
              precision={2}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Days Since Purchase"
              value={summary.days_since_purchase || 0}
              prefix={<ClockCircleOutlined />}
            />
          </Col>
          <Col span={6}>
            <Space direction="vertical" size={0}>
              <Text type="secondary" style={{ fontSize: '12px' }}>Warranty Status</Text>
              {summary.under_warranty ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>Under Warranty</Tag>
              ) : (
                <Tag color="default">Out of Warranty</Tag>
              )}
              {summary.active_flags > 0 && (
                <Tag color="red" icon={<WarningOutlined />}>
                  {summary.active_flags} Active Flag{summary.active_flags > 1 ? 's' : ''}
                </Tag>
              )}
            </Space>
          </Col>
        </Row>

        {faultBreakdown && faultBreakdown.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text strong>Fault Breakdown:</Text>
            <div style={{ marginTop: 8 }}>
              {faultBreakdown.map((fault, index) => (
                <Tag key={index} style={{ marginBottom: 4 }}>
                  {fault.fault_type || 'Unknown'}: {fault.occurrence_count}x
                  ({repairHistoryService.formatCurrency(fault.cost_for_fault_type)})
                </Tag>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderTimelineView = () => (
    <Timeline mode="left">
      {repairs.map((repair) => (
        <Timeline.Item
          key={repair.repair_id}
          color={getStatusColor(repair.repair_status)}
          label={repairHistoryService.formatDate(repair.repair_date)}
        >
          <Card
            size="small"
            hoverable
            onClick={() => showRepairDetail(repair)}
            style={{ cursor: 'pointer', marginLeft: repair.is_component_repair ? 16 : 0 }}
          >
            <Space direction="vertical" size={0}>
              <Space>
                {repair.is_component_repair && (
                  <Tag color="cyan" style={{ fontSize: '10px' }}>COMPONENT</Tag>
                )}
                <Text strong>{repair.fault_type_name || 'Repair'}</Text>
                {repair.fault_category && (
                  <Tag color={getFaultCategoryColor(repair.fault_category)} style={{ fontSize: '10px' }}>
                    {repair.fault_category}
                  </Tag>
                )}
                <Tag color={getStatusColor(repair.repair_status)}>
                  {repairHistoryService.getStatusDisplayName(repair.repair_status)}
                </Tag>
              </Space>
              {repair.is_component_repair && repair.component_asset_tag && (
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  {repair.component_asset_tag} (of {repair.parent_asset_tag})
                </Text>
              )}
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {repair.fault_description?.substring(0, 100)}
                {repair.fault_description?.length > 100 ? '...' : ''}
              </Text>
              <Space style={{ marginTop: 4 }}>
                {repair.total_cost > 0 && (
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    Cost: {repairHistoryService.formatCurrency(repair.total_cost)}
                  </Text>
                )}
                {repair.engineer_name && (
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    Engineer: {repair.engineer_name}
                  </Text>
                )}
                {repair.ticket_number && (
                  <Tag color="blue" style={{ fontSize: '10px' }}>
                    {repair.ticket_number}
                  </Tag>
                )}
              </Space>
            </Space>
          </Card>
        </Timeline.Item>
      ))}
    </Timeline>
  );

  if (loading && repairs.length === 0) {
    return (
      <Card size="small">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin tip="Loading repair history..." />
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span>Repair History</span>
            {assetTag && <Tag>{assetTag}</Tag>}
            <Badge count={pagination.total} style={{ backgroundColor: '#1890ff' }} />
          </Space>
        }
        size="small"
      >
        {renderStatsSummary()}

        {repairs.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No repair history for this asset"
          />
        ) : viewMode === 'timeline' ? (
          renderTimelineView()
        ) : (
          <Table
            columns={columns}
            dataSource={repairs}
            rowKey="repair_id"
            size="small"
            loading={loading}
            tableLayout="fixed"
            scroll={{ x: 'max-content' }}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: false,
              size: 'small',
              showTotal: (total) => `${total} repairs`
            }}
            onChange={(pag) => setPagination(prev => ({ ...prev, page: pag.current }))}
          />
        )}
      </Card>

      {/* Repair Detail Modal */}
      <Modal
        title="Repair Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedRepair && (
          <Descriptions bordered column={2} size="small">
            {selectedRepair.is_component_repair && (
              <Descriptions.Item label="Component Repair" span={2}>
                <Space>
                  <Tag color="cyan">COMPONENT</Tag>
                  <Text strong>{selectedRepair.component_asset_tag}</Text>
                  {selectedRepair.component_product_name && (
                    <Text type="secondary">({selectedRepair.component_product_name})</Text>
                  )}
                </Space>
              </Descriptions.Item>
            )}
            {selectedRepair.is_component_repair && selectedRepair.parent_asset_tag && (
              <Descriptions.Item label="Parent Asset" span={2}>
                <Space>
                  <Tag color="blue">PARENT</Tag>
                  <Text strong>{selectedRepair.parent_asset_tag}</Text>
                  {selectedRepair.parent_product_name && (
                    <Text type="secondary">({selectedRepair.parent_product_name})</Text>
                  )}
                </Space>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Repair Date" span={1}>
              {repairHistoryService.formatDate(selectedRepair.repair_date)}
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={1}>
              <Tag color={getStatusColor(selectedRepair.repair_status)}>
                {repairHistoryService.getStatusDisplayName(selectedRepair.repair_status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Fault Type" span={1}>
              {selectedRepair.fault_type_name || 'Not Specified'}
            </Descriptions.Item>
            <Descriptions.Item label="Category" span={1}>
              {selectedRepair.fault_category && (
                <Tag color={getFaultCategoryColor(selectedRepair.fault_category)}>
                  {selectedRepair.fault_category}
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Fault Description" span={2}>
              {selectedRepair.fault_description}
            </Descriptions.Item>
            <Descriptions.Item label="Resolution" span={2}>
              {selectedRepair.resolution || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Parts Cost" span={1}>
              {repairHistoryService.formatCurrency(selectedRepair.parts_cost)}
            </Descriptions.Item>
            <Descriptions.Item label="Labor Cost" span={1}>
              {repairHistoryService.formatCurrency(selectedRepair.labor_cost)}
            </Descriptions.Item>
            <Descriptions.Item label="Total Cost" span={1}>
              <Text strong>
                {repairHistoryService.formatCurrency(selectedRepair.total_cost)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Labor Hours" span={1}>
              {selectedRepair.labor_hours || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Engineer" span={1}>
              {selectedRepair.engineer_name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Related Ticket" span={1}>
              {selectedRepair.ticket_number ? (
                <Tag color="blue">{selectedRepair.ticket_number}</Tag>
              ) : (
                'Manual Entry'
              )}
            </Descriptions.Item>
            {selectedRepair.parts_replaced && (
              <Descriptions.Item label="Parts Replaced" span={2}>
                {selectedRepair.parts_replaced}
              </Descriptions.Item>
            )}
            {selectedRepair.is_external_repair && (
              <>
                <Descriptions.Item label="External Repair" span={1}>
                  <Tag color="purple">External</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Vendor" span={1}>
                  {selectedRepair.vendor_name || 'N/A'}
                </Descriptions.Item>
              </>
            )}
            {selectedRepair.warranty_claim && (
              <Descriptions.Item label="Warranty Claim" span={2}>
                <Tag color="green">Warranty Claim</Tag>
                {selectedRepair.warranty_claim_reference && (
                  <Text> - Ref: {selectedRepair.warranty_claim_reference}</Text>
                )}
              </Descriptions.Item>
            )}
            {selectedRepair.notes && (
              <Descriptions.Item label="Notes" span={2}>
                {selectedRepair.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AssetRepairHistory;
