/**
 * BackupManagement Page
 * Comprehensive backup management for superadmin
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Select,
  message,
  Tabs,
  Typography,
  Tooltip,
  Badge,
  Progress,
  List,
  Modal,
  Input,
  Spin,
  Empty,
  Alert,
  Descriptions,
  Divider,
  Result
} from 'antd';
import {
  ReloadOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  FileProtectOutlined,
  SafetyOutlined,
  SyncOutlined,
  HistoryOutlined,
  CloudServerOutlined,
  HddOutlined,
  ThunderboltOutlined,
  ScheduleOutlined,
  ToolOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import backupService from '../services/backup';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const BackupManagement = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('status');

  // Status state
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilters, setHistoryFilters] = useState({
    database: '',
    type: ''
  });

  // Config state
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(false);

  // Backup operations state
  const [backupInProgress, setBackupInProgress] = useState({
    full: false,
    differential: false,
    transactionLog: false,
    cleanup: false
  });

  // Restore modal state
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [restoreData, setRestoreData] = useState({ database: '', backupPath: '' });
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const [restoreLoading, setRestoreLoading] = useState(false);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'status') {
      fetchStatus();
    } else if (activeTab === 'history') {
      fetchHistory();
    } else if (activeTab === 'config') {
      fetchConfig();
    }
  }, [activeTab]);

  // Fetch backup status
  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const response = await backupService.getStatus();
      const data = response.data?.data || response.data;
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch backup status:', error);
      message.error('Failed to load backup status');
    } finally {
      setStatusLoading(false);
    }
  };

  // Fetch backup history
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const params = { ...historyFilters, limit: 100 };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await backupService.getHistory(params);
      const data = response.data?.data || response.data || [];
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch backup history:', error);
      message.error('Failed to load backup history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch backup config
  const fetchConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await backupService.getConfig();
      const data = response.data?.data || response.data;
      setConfig(data);
    } catch (error) {
      console.error('Failed to fetch backup config:', error);
      message.error('Failed to load backup configuration');
    } finally {
      setConfigLoading(false);
    }
  };

  // Trigger backup
  const handleTriggerBackup = async (type, database = null) => {
    const typeLabels = {
      full: 'Full Backup',
      differential: 'Differential Backup',
      transactionLog: 'Transaction Log Backup'
    };

    confirm({
      title: `Trigger ${typeLabels[type]}?`,
      icon: <ExclamationCircleOutlined />,
      content: database
        ? `This will create a ${type} backup for ${database}.`
        : `This will create a ${type} backup for all databases.`,
      okText: 'Start Backup',
      cancelText: 'Cancel',
      onOk: async () => {
        setBackupInProgress(prev => ({ ...prev, [type]: true }));
        try {
          let result;
          switch (type) {
            case 'full':
              result = await backupService.triggerFullBackup(database);
              break;
            case 'differential':
              result = await backupService.triggerDifferentialBackup(database);
              break;
            case 'transactionLog':
              result = await backupService.triggerTransactionLogBackup(database);
              break;
            default:
              throw new Error('Unknown backup type');
          }

          message.success(result.data?.message || `${typeLabels[type]} completed successfully`);
          fetchStatus();
          if (activeTab === 'history') fetchHistory();
        } catch (error) {
          console.error(`${type} backup failed:`, error);
          message.error(error.response?.data?.message || `${typeLabels[type]} failed`);
        } finally {
          setBackupInProgress(prev => ({ ...prev, [type]: false }));
        }
      }
    });
  };

  // Trigger cleanup
  const handleTriggerCleanup = async () => {
    confirm({
      title: 'Run Backup Cleanup?',
      icon: <DeleteOutlined />,
      content: 'This will delete old backup files based on the retention policy.',
      okText: 'Run Cleanup',
      cancelText: 'Cancel',
      onOk: async () => {
        setBackupInProgress(prev => ({ ...prev, cleanup: true }));
        try {
          const result = await backupService.triggerCleanup();
          const data = result.data?.data || result.data;
          message.success(`Cleanup completed: ${data.deleted?.length || 0} files deleted`);
          fetchHistory();
        } catch (error) {
          console.error('Cleanup failed:', error);
          message.error('Backup cleanup failed');
        } finally {
          setBackupInProgress(prev => ({ ...prev, cleanup: false }));
        }
      }
    });
  };

  // Handle restore
  const handleRestore = async () => {
    if (restoreConfirmText !== 'RESTORE') {
      message.error('Please type RESTORE to confirm');
      return;
    }

    setRestoreLoading(true);
    try {
      await backupService.restoreDatabase(restoreData.database, restoreData.backupPath);
      message.success('Database restored successfully');
      setRestoreModalVisible(false);
      setRestoreData({ database: '', backupPath: '' });
      setRestoreConfirmText('');
    } catch (error) {
      console.error('Restore failed:', error);
      message.error(error.response?.data?.message || 'Database restore failed');
    } finally {
      setRestoreLoading(false);
    }
  };

  // Get health status icon
  const getHealthIcon = (healthStatus) => {
    switch (healthStatus) {
      case 'healthy':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 48 }} />;
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14', fontSize: 48 }} />;
      case 'critical':
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 48 }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: '#d9d9d9', fontSize: 48 }} />;
    }
  };

  // Render Status Tab
  const renderStatusTab = () => (
    <Spin spinning={statusLoading}>
      {status ? (
        <div className="space-y-6">
          {/* Health Overview */}
          <Card>
            <Row gutter={24} align="middle">
              <Col>
                {getHealthIcon(status.healthStatus)}
              </Col>
              <Col flex="auto">
                <Title level={3} className="!mb-1">
                  Backup System Status:{' '}
                  <Tag color={backupService.getHealthStatusColor(status.healthStatus)} style={{ fontSize: 16 }}>
                    {status.healthStatus?.toUpperCase()}
                  </Tag>
                </Title>
                <Text type="secondary">
                  {status.healthStatus === 'healthy' && 'All databases are backed up according to schedule.'}
                  {status.healthStatus === 'warning' && 'Some databases may need attention. Check last backup times.'}
                  {status.healthStatus === 'critical' && 'Critical: Some databases have no recent backups!'}
                </Text>
              </Col>
              <Col>
                <Button icon={<ReloadOutlined />} onClick={fetchStatus}>
                  Refresh
                </Button>
              </Col>
            </Row>
          </Card>

          {/* Database Status Cards */}
          <Row gutter={[16, 16]}>
            {status.databases?.map((db, index) => (
              <Col xs={24} md={12} key={index}>
                <Card
                  title={
                    <Space>
                      <DatabaseOutlined />
                      <span>{db.name}</span>
                      {db.warning && <Tag color="red">Warning</Tag>}
                    </Space>
                  }
                  size="small"
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Last Full Backup">
                      {db.lastFullBackup ? (
                        <Tooltip title={dayjs(db.lastFullBackup).format('YYYY-MM-DD HH:mm:ss')}>
                          <Text type={dayjs(db.lastFullBackup).isBefore(dayjs().subtract(2, 'day')) ? 'danger' : 'success'}>
                            {dayjs(db.lastFullBackup).fromNow()}
                          </Text>
                        </Tooltip>
                      ) : (
                        <Text type="danger">Never</Text>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Differential">
                      {db.lastDiffBackup ? (
                        <Tooltip title={dayjs(db.lastDiffBackup).format('YYYY-MM-DD HH:mm:ss')}>
                          <Text>{dayjs(db.lastDiffBackup).fromNow()}</Text>
                        </Tooltip>
                      ) : (
                        <Text type="secondary">-</Text>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Last Log Backup">
                      {db.lastLogBackup ? (
                        <Tooltip title={dayjs(db.lastLogBackup).format('YYYY-MM-DD HH:mm:ss')}>
                          <Text>{dayjs(db.lastLogBackup).fromNow()}</Text>
                        </Tooltip>
                      ) : (
                        <Text type="secondary">-</Text>
                      )}
                    </Descriptions.Item>
                    {db.totalSize && (
                      <Descriptions.Item label="Total Backup Size (30d)">
                        {backupService.formatBytes(db.totalSize)}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Quick Actions */}
          <Card title="Quick Actions" size="small">
            <Space wrap>
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                loading={backupInProgress.full}
                onClick={() => handleTriggerBackup('full')}
              >
                Run Full Backup
              </Button>
              <Button
                icon={<SyncOutlined />}
                loading={backupInProgress.differential}
                onClick={() => handleTriggerBackup('differential')}
              >
                Run Differential Backup
              </Button>
              <Button
                icon={<FileProtectOutlined />}
                loading={backupInProgress.transactionLog}
                onClick={() => handleTriggerBackup('transactionLog')}
              >
                Run Log Backup
              </Button>
              <Divider type="vertical" />
              <Button
                icon={<DeleteOutlined />}
                loading={backupInProgress.cleanup}
                onClick={handleTriggerCleanup}
              >
                Run Cleanup
              </Button>
            </Space>
          </Card>
        </div>
      ) : (
        <Empty description="Unable to load backup status" />
      )}
    </Spin>
  );

  // History table columns
  const historyColumns = [
    {
      title: 'Date',
      dataIndex: 'backup_start_date',
      key: 'backup_start_date',
      width: 180,
      render: (date) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          {dayjs(date).format('MMM DD, YYYY HH:mm')}
        </Tooltip>
      )
    },
    {
      title: 'Database',
      dataIndex: 'database_name',
      key: 'database_name',
      width: 150
    },
    {
      title: 'Type',
      dataIndex: 'backup_type',
      key: 'backup_type',
      width: 120,
      render: (type) => (
        <Tag color={backupService.getBackupTypeColor(type)}>{type}</Tag>
      )
    },
    {
      title: 'Size',
      dataIndex: 'backup_size',
      key: 'backup_size',
      width: 100,
      align: 'right',
      render: (size) => backupService.formatBytes(size)
    },
    {
      title: 'Compressed',
      dataIndex: 'compressed_backup_size',
      key: 'compressed_backup_size',
      width: 100,
      align: 'right',
      render: (size, record) => {
        if (!size) return '-';
        const ratio = ((1 - size / record.backup_size) * 100).toFixed(1);
        return (
          <Tooltip title={`${ratio}% compression`}>
            {backupService.formatBytes(size)}
          </Tooltip>
        );
      }
    },
    {
      title: 'Duration',
      dataIndex: 'duration_seconds',
      key: 'duration_seconds',
      width: 90,
      align: 'right',
      render: (sec) => sec ? `${sec}s` : '-'
    },
    {
      title: 'Status',
      dataIndex: 'is_damaged',
      key: 'is_damaged',
      width: 90,
      align: 'center',
      render: (isDamaged) => (
        isDamaged ?
          <Tag color="red" icon={<CloseCircleOutlined />}>Damaged</Tag> :
          <Tag color="green" icon={<CheckCircleOutlined />}>OK</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Restore from this backup">
            <Button
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => {
                setRestoreData({
                  database: record.database_name,
                  backupPath: record.physical_device_name
                });
                setRestoreModalVisible(true);
              }}
              danger
            >
              Restore
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  // Render History Tab
  const renderHistoryTab = () => (
    <div className="space-y-4">
      {/* Filters */}
      <Card size="small">
        <Space wrap>
          <Select
            placeholder="Database"
            allowClear
            style={{ width: 180 }}
            value={historyFilters.database || undefined}
            onChange={(value) => setHistoryFilters(prev => ({ ...prev, database: value }))}
          >
            <Option value="asset_management">asset_management</Option>
            <Option value="audit_logs">audit_logs</Option>
          </Select>

          <Select
            placeholder="Backup Type"
            allowClear
            style={{ width: 150 }}
            value={historyFilters.type || undefined}
            onChange={(value) => setHistoryFilters(prev => ({ ...prev, type: value }))}
          >
            <Option value="full">Full</Option>
            <Option value="differential">Differential</Option>
            <Option value="transactionLog">Transaction Log</Option>
          </Select>

          <Button icon={<ReloadOutlined />} onClick={fetchHistory}>
            Refresh
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={historyColumns}
          dataSource={history}
          rowKey={(record) => `${record.database_name}-${record.backup_start_date}`}
          loading={historyLoading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 1100 }}
          size="small"
        />
      </Card>
    </div>
  );

  // Render Manual Backup Tab
  const renderManualBackupTab = () => (
    <div className="space-y-6">
      <Alert
        message="Manual Backup Operations"
        description="Use these controls to manually trigger backup operations. Automated backups run according to the configured schedule."
        type="info"
        showIcon
      />

      <Row gutter={[16, 16]}>
        {/* Full Backup */}
        <Col xs={24} md={12} lg={8}>
          <Card
            title={
              <Space>
                <CloudUploadOutlined style={{ color: '#1890ff' }} />
                <span>Full Backup</span>
              </Space>
            }
          >
            <Paragraph type="secondary">
              Creates a complete backup of all database files. This is the foundation for all other backup types.
            </Paragraph>
            <div className="mt-4">
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={backupInProgress.full}
                onClick={() => handleTriggerBackup('full')}
                block
              >
                Start Full Backup
              </Button>
            </div>
          </Card>
        </Col>

        {/* Differential Backup */}
        <Col xs={24} md={12} lg={8}>
          <Card
            title={
              <Space>
                <SyncOutlined style={{ color: '#13c2c2' }} />
                <span>Differential Backup</span>
              </Space>
            }
          >
            <Paragraph type="secondary">
              Backs up only data changed since the last full backup. Smaller and faster than full backups.
            </Paragraph>
            <div className="mt-4">
              <Button
                icon={<PlayCircleOutlined />}
                loading={backupInProgress.differential}
                onClick={() => handleTriggerBackup('differential')}
                block
              >
                Start Differential Backup
              </Button>
            </div>
          </Card>
        </Col>

        {/* Transaction Log Backup */}
        <Col xs={24} md={12} lg={8}>
          <Card
            title={
              <Space>
                <FileProtectOutlined style={{ color: '#722ed1' }} />
                <span>Transaction Log</span>
              </Space>
            }
          >
            <Paragraph type="secondary">
              Backs up the transaction log for point-in-time recovery. Requires FULL recovery model.
            </Paragraph>
            <div className="mt-4">
              <Button
                icon={<PlayCircleOutlined />}
                loading={backupInProgress.transactionLog}
                onClick={() => handleTriggerBackup('transactionLog')}
                block
              >
                Start Log Backup
              </Button>
            </div>
          </Card>
        </Col>

        {/* Cleanup */}
        <Col xs={24} md={12} lg={8}>
          <Card
            title={
              <Space>
                <DeleteOutlined style={{ color: '#fa8c16' }} />
                <span>Cleanup Old Backups</span>
              </Space>
            }
          >
            <Paragraph type="secondary">
              Removes old backup files based on the retention policy to free up storage space.
            </Paragraph>
            <div className="mt-4">
              <Button
                icon={<DeleteOutlined />}
                loading={backupInProgress.cleanup}
                onClick={handleTriggerCleanup}
                block
              >
                Run Cleanup
              </Button>
            </div>
          </Card>
        </Col>

        {/* Restore */}
        <Col xs={24} md={12} lg={8}>
          <Card
            title={
              <Space>
                <HistoryOutlined style={{ color: '#f5222d' }} />
                <span>Restore Database</span>
              </Space>
            }
          >
            <Paragraph type="secondary">
              Restore a database from a backup file. This will overwrite existing data.
            </Paragraph>
            <div className="mt-4">
              <Button
                danger
                icon={<HistoryOutlined />}
                onClick={() => setRestoreModalVisible(true)}
                block
              >
                Restore from Backup
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Render Configuration Tab
  const renderConfigTab = () => (
    <Spin spinning={configLoading}>
      {config ? (
        <div className="space-y-6">
          {/* Schedule */}
          <Card
            title={
              <Space>
                <ScheduleOutlined />
                <span>Backup Schedule</span>
              </Space>
            }
            size="small"
          >
            <Descriptions column={{ xs: 1, md: 2 }} bordered size="small">
              <Descriptions.Item label="Full Backup">
                <Tag color="blue">{backupService.parseCronExpression(config.schedule?.full)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Differential Backup">
                <Tag color="cyan">{backupService.parseCronExpression(config.schedule?.differential)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Transaction Log">
                <Tag color="purple">{backupService.parseCronExpression(config.schedule?.transactionLog)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cleanup Job">
                <Tag color="orange">{backupService.parseCronExpression(config.schedule?.cleanup)}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Databases */}
          <Card
            title={
              <Space>
                <DatabaseOutlined />
                <span>Databases</span>
              </Space>
            }
            size="small"
          >
            <List
              dataSource={config.databases || []}
              renderItem={(db) => (
                <List.Item>
                  <Space>
                    <HddOutlined />
                    <Text strong>{db.name}</Text>
                    <Tag>{db.type}</Tag>
                    <Tag color="blue">Priority: {db.priority}</Tag>
                  </Space>
                </List.Item>
              )}
            />
          </Card>

          {/* Retention Policy */}
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Retention Policy</span>
              </Space>
            }
            size="small"
          >
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Title level={5}>Local Storage</Title>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Full Backups">
                    {config.retention?.local?.full || 7} days
                  </Descriptions.Item>
                  <Descriptions.Item label="Differential Backups">
                    {config.retention?.local?.differential || 3} days
                  </Descriptions.Item>
                  <Descriptions.Item label="Transaction Logs">
                    {config.retention?.local?.transactionLog || 2} days
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col xs={24} md={12}>
                <Title level={5}>Cloud Storage</Title>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Full Backups">
                    {config.retention?.cloud?.full || 30} days
                  </Descriptions.Item>
                  <Descriptions.Item label="Differential Backups">
                    {config.retention?.cloud?.differential || 14} days
                  </Descriptions.Item>
                  <Descriptions.Item label="Transaction Logs">
                    {config.retention?.cloud?.transactionLog || 7} days
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>

          {/* Settings */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic
                  title="Compression"
                  value={config.compression?.enabled ? 'Enabled' : 'Disabled'}
                  valueStyle={{ color: config.compression?.enabled ? '#52c41a' : '#ff4d4f' }}
                  prefix={<ThunderboltOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic
                  title="Verification"
                  value={config.verification?.enabled ? 'Enabled' : 'Disabled'}
                  valueStyle={{ color: config.verification?.enabled ? '#52c41a' : '#ff4d4f' }}
                  prefix={<SafetyOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic
                  title="Cloud Backup"
                  value={config.cloudEnabled ? 'Enabled' : 'Disabled'}
                  valueStyle={{ color: config.cloudEnabled ? '#52c41a' : '#ff4d4f' }}
                  prefix={<CloudServerOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Notifications */}
          <Card
            title={
              <Space>
                <ToolOutlined />
                <span>Notifications</span>
              </Space>
            }
            size="small"
          >
            <Descriptions column={{ xs: 1, md: 3 }} size="small">
              <Descriptions.Item label="Enabled">
                <Tag color={config.notifications?.enabled ? 'green' : 'red'}>
                  {config.notifications?.enabled ? 'Yes' : 'No'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="On Success">
                <Tag color={config.notifications?.onSuccess ? 'green' : 'default'}>
                  {config.notifications?.onSuccess ? 'Yes' : 'No'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="On Failure">
                <Tag color={config.notifications?.onFailure ? 'green' : 'default'}>
                  {config.notifications?.onFailure ? 'Yes' : 'No'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Recipients">
                {config.notifications?.recipientCount || 0} configured
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      ) : (
        <Empty description="Unable to load configuration" />
      )}
    </Spin>
  );

  // Tab items
  const tabItems = [
    {
      key: 'status',
      label: (
        <span>
          <SafetyOutlined />
          Status
        </span>
      ),
      children: renderStatusTab()
    },
    {
      key: 'history',
      label: (
        <span>
          <HistoryOutlined />
          Backup History
        </span>
      ),
      children: renderHistoryTab()
    },
    {
      key: 'manual',
      label: (
        <span>
          <PlayCircleOutlined />
          Manual Backup
        </span>
      ),
      children: renderManualBackupTab()
    },
    {
      key: 'config',
      label: (
        <span>
          <SettingOutlined />
          Configuration
        </span>
      ),
      children: renderConfigTab()
    }
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">
            <DatabaseOutlined className="mr-2" />
            Backup Management
          </Title>
          <Text type="secondary">
            Database backup, restore, and disaster recovery operations
          </Text>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />

      {/* Restore Modal */}
      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: '#ff4d4f' }} />
            <span>Restore Database</span>
          </Space>
        }
        open={restoreModalVisible}
        onCancel={() => {
          setRestoreModalVisible(false);
          setRestoreData({ database: '', backupPath: '' });
          setRestoreConfirmText('');
        }}
        footer={[
          <Button key="cancel" onClick={() => setRestoreModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="restore"
            type="primary"
            danger
            loading={restoreLoading}
            disabled={restoreConfirmText !== 'RESTORE'}
            onClick={handleRestore}
          >
            Restore Database
          </Button>
        ]}
      >
        <Alert
          message="Warning: This will overwrite existing data!"
          description="Restoring a database will replace all current data with data from the backup. This action cannot be undone."
          type="error"
          showIcon
          className="mb-4"
        />

        <div className="space-y-4">
          <div>
            <Text strong>Database:</Text>
            <Input
              value={restoreData.database}
              onChange={(e) => setRestoreData(prev => ({ ...prev, database: e.target.value }))}
              placeholder="Enter database name"
              className="mt-1"
            />
          </div>

          <div>
            <Text strong>Backup File Path:</Text>
            <Input
              value={restoreData.backupPath}
              onChange={(e) => setRestoreData(prev => ({ ...prev, backupPath: e.target.value }))}
              placeholder="Enter full path to backup file"
              className="mt-1"
            />
          </div>

          <Divider />

          <div>
            <Text strong>Type RESTORE to confirm:</Text>
            <Input
              value={restoreConfirmText}
              onChange={(e) => setRestoreConfirmText(e.target.value)}
              placeholder="Type RESTORE"
              className="mt-1"
              status={restoreConfirmText && restoreConfirmText !== 'RESTORE' ? 'error' : ''}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BackupManagement;
