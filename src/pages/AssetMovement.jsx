import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Statistic,
  Timeline,
  Modal,
  Typography,
  Spin,
  Empty,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  HistoryOutlined,
  UserOutlined,
  EnvironmentOutlined,
  SwapOutlined,
  ClockCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNotification } from '../hooks/useNotification';
import apiClient from '../utils/apiClient';

dayjs.extend(relativeTime);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const AssetMovement = () => {
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({
    assetTag: '',
    movementType: undefined,
    dateRange: null
  });
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [timelineVisible, setTimelineVisible] = useState(false);
  const [assetHistory, setAssetHistory] = useState([]);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchMovements();
    fetchStatistics();
  }, [pagination.current, pagination.pageSize]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/asset-movements/recent', {
        params: {
          limit: pagination.pageSize,
          offset: (pagination.current - 1) * pagination.pageSize
        }
      });

      if (response.data.success) {
        const movements = response.data.data || [];
        console.log('Asset movements received:', movements);
        setMovements(movements);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.count || movements.length
        }));
      }
    } catch (error) {
      showError('Failed to fetch asset movements');
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await apiClient.get('/asset-movements/statistics');
      if (response.data.success) {
        console.log('Movement statistics received:', response.data.data);
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      showError('Failed to fetch movement statistics');
    }
  };

  const fetchAssetHistory = async (assetId) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/asset-movements/asset/${assetId}`);
      if (response.data.success) {
        setAssetHistory(response.data.data);
        setTimelineVisible(true);
      }
    } catch (error) {
      showError('Failed to fetch asset history');
      console.error('Error fetching asset history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = (record) => {
    setSelectedAsset(record);
    fetchAssetHistory(record.asset_id);
  };

  const getMovementTypeColor = (type) => {
    const colors = {
      assigned: 'blue',
      transferred: 'orange',
      returned: 'green',
      relocated: 'purple',
      unassigned: 'red',
      available: 'default'
    };
    return colors[type] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'success',
      available: 'default',
      maintenance: 'warning',
      retired: 'error',
      lost: 'error',
      damaged: 'warning'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Date & Time',
      dataIndex: 'movement_date',
      key: 'movement_date',
      width: 180,
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text strong>{dayjs(date).format('DD MMM YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).format('HH:mm:ss')}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(date).fromNow()}
          </Text>
        </Space>
      ),
      sorter: (a, b) => dayjs(a.movement_date).unix() - dayjs(b.movement_date).unix(),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Asset Tag',
      dataIndex: 'asset_tag',
      key: 'asset_tag',
      width: 130,
      render: (text, record) => (
        <Space>
          <Tag color="blue">{text}</Tag>
          <Tooltip title="View full history">
            <Button
              type="link"
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
            />
          </Tooltip>
        </Space>
      )
    },
    {
      title: 'Movement Type',
      dataIndex: 'movement_type',
      key: 'movement_type',
      width: 130,
      render: (type) => (
        <Tag color={getMovementTypeColor(type)} icon={<SwapOutlined />}>
          {type?.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Assigned', value: 'assigned' },
        { text: 'Transferred', value: 'transferred' },
        { text: 'Returned', value: 'returned' },
        { text: 'Relocated', value: 'relocated' },
        { text: 'Unassigned', value: 'unassigned' }
      ],
      onFilter: (value, record) => record.movement_type === value
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
      )
    },
    {
      title: 'From',
      key: 'from',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.previous_user_name && (
            <Text type="secondary">
              <UserOutlined /> {record.previous_user_name}
            </Text>
          )}
          {record.previous_location_name && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              <EnvironmentOutlined /> {record.previous_location_name}
            </Text>
          )}
          {!record.previous_user_name && !record.previous_location_name && (
            <Text type="secondary">—</Text>
          )}
        </Space>
      )
    },
    {
      title: 'To',
      key: 'to',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          {record.assigned_to_name && (
            <Text strong>
              <UserOutlined /> {record.assigned_to_name}
            </Text>
          )}
          {record.location_name && (
            <Text style={{ fontSize: 12 }}>
              <EnvironmentOutlined /> {record.location_name}
            </Text>
          )}
          {!record.assigned_to_name && !record.location_name && (
            <Text type="secondary">Unassigned</Text>
          )}
        </Space>
      )
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text type="secondary">{text || '—'}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Performed By',
      dataIndex: 'performed_by_name',
      key: 'performed_by_name',
      width: 150,
      render: (name) => (
        <Text>
          <UserOutlined /> {name}
        </Text>
      )
    }
  ];

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>
          <SwapOutlined /> Asset Movement Tracking
        </Title>
        <Text type="secondary">
          Track and monitor all asset assignments, transfers, and location changes
        </Text>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Movements"
                value={statistics.total_movements}
                prefix={<SwapOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Assignments"
                value={statistics.assignments}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Transfers"
                value={statistics.transfers}
                prefix={<SwapOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Returns"
                value={statistics.returns}
                prefix={<HistoryOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by asset tag"
              prefix={<SearchOutlined />}
              value={filters.assetTag}
              onChange={(e) => setFilters({ ...filters, assetTag: e.target.value })}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by movement type"
              style={{ width: '100%' }}
              value={filters.movementType}
              onChange={(value) => setFilters({ ...filters, movementType: value })}
              allowClear
            >
              <Option value="assigned">Assigned</Option>
              <Option value="transferred">Transferred</Option>
              <Option value="returned">Returned</Option>
              <Option value="relocated">Relocated</Option>
              <Option value="unassigned">Unassigned</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
          </Col>
        </Row>
      </Card>

      {/* Movements Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={movements}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Asset History Timeline Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <span>Asset Movement History</span>
            {selectedAsset && <Tag color="blue">{selectedAsset.asset_tag}</Tag>}
          </Space>
        }
        open={timelineVisible}
        onCancel={() => setTimelineVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTimelineVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        <Spin spinning={loading}>
          {assetHistory.length > 0 ? (
            <Timeline mode="left" style={{ marginTop: 20 }}>
              {assetHistory.map((movement) => (
                <Timeline.Item
                  key={movement.id}
                  color={getMovementTypeColor(movement.movement_type)}
                  label={
                    <Space direction="vertical" size={0}>
                      <Text strong>{dayjs(movement.movement_date).format('DD MMM YYYY')}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(movement.movement_date).format('HH:mm')}
                      </Text>
                    </Space>
                  }
                >
                  <Card size="small" style={{ marginBottom: 8 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Tag color={getMovementTypeColor(movement.movement_type)}>
                          {movement.movement_type?.toUpperCase()}
                        </Tag>
                        <Tag color={getStatusColor(movement.status)}>
                          {movement.status?.toUpperCase()}
                        </Tag>
                      </Space>

                      {movement.assigned_to_name && (
                        <Text>
                          <UserOutlined /> <strong>Assigned to:</strong> {movement.assigned_to_name}
                        </Text>
                      )}

                      {movement.location_name && (
                        <Text>
                          <EnvironmentOutlined /> <strong>Location:</strong> {movement.location_name}
                        </Text>
                      )}

                      {movement.previous_user_name && (
                        <Text type="secondary">
                          <strong>From:</strong> {movement.previous_user_name}
                        </Text>
                      )}

                      {movement.reason && (
                        <Text type="secondary">
                          <strong>Reason:</strong> {movement.reason}
                        </Text>
                      )}

                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined /> Performed by: {movement.performed_by_name}
                      </Text>
                    </Space>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          ) : (
            <Empty description="No movement history found" />
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default AssetMovement;
