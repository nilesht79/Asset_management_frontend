import { useEffect, useState, useMemo, useRef } from 'react';
import { Modal, Form, Input, Select, Row, Col, Card, Typography, Tag, Divider, message, Alert, Space, Badge } from 'antd';
import { WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { reconcileAsset, selectReconciliationLoading } from '../../../store/slices/reconciliationSlice';
import { fetchUsers, selectUsers } from '../../../store/slices/userSlice';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const ReconcileAssetModal = ({ visible, asset, reconciliationId, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const loading = useSelector(selectReconciliationLoading);
  const usersState = useSelector(selectUsers);
  const users = usersState?.data || [];
  const usersLoading = usersState?.loading || false;

  const [detectedDiscrepancies, setDetectedDiscrepancies] = useState([]);
  const initializedAssetIdRef = useRef(null);
  const usersFetchedRef = useRef(false);
  const previousVisibleRef = useRef(false);

  // Fetch users only once on component mount
  useEffect(() => {
    if (!usersFetchedRef.current) {
      dispatch(fetchUsers({ page: 1, limit: 1000, status: 'active' }));
      usersFetchedRef.current = true;
    }
  }, [dispatch]);

  // Initialize form ONLY when modal transitions from closed to open
  useEffect(() => {
    const wasVisible = previousVisibleRef.current;
    const isNowVisible = visible;

    // Modal just opened (false → true transition)
    if (!wasVisible && isNowVisible && asset) {
      const currentAssetId = asset.id;

      // Only initialize if this is a different asset
      if (currentAssetId !== initializedAssetIdRef.current) {
        form.setFieldsValue({
          physical_location: asset.location_name || '',
          physical_condition: asset.condition_status || '',
          physical_assigned_to: asset.assigned_to || null,
          physical_serial_number: asset.serial_number || '',
          physical_status: asset.status || '',
          reconciliation_status: 'verified',
          discrepancy_notes: ''
        });

        setDetectedDiscrepancies([]);
        initializedAssetIdRef.current = currentAssetId;
      }
    }

    // Modal just closed (true → false transition)
    if (wasVisible && !isNowVisible) {
      initializedAssetIdRef.current = null;
    }

    // Update ref for next render
    previousVisibleRef.current = visible;
  }, [visible, asset, form]);

  // Get severity info
  const getSeverityConfig = (severity) => {
    const configs = {
      critical: { color: 'red', icon: <ExclamationCircleOutlined />, label: 'Critical' },
      major: { color: 'orange', icon: <WarningOutlined />, label: 'Major' },
      minor: { color: 'blue', icon: <InfoCircleOutlined />, label: 'Minor' }
    };
    return configs[severity] || configs.minor;
  };

  // Real-time discrepancy detection
  const detectDiscrepancies = (changedValues, allValues) => {
    const discrepancies = [];

    // Location discrepancy
    if (allValues.physical_location && asset.location_name) {
      const systemLoc = (asset.location_name || '').trim().toLowerCase();
      const physicalLoc = (allValues.physical_location || '').trim().toLowerCase();
      if (systemLoc && physicalLoc && systemLoc !== physicalLoc) {
        discrepancies.push({
          field_name: 'location',
          field_display_name: 'Location',
          system_value: asset.location_name,
          physical_value: allValues.physical_location,
          discrepancy_type: 'location_mismatch',
          severity: 'major'
        });
      }
    }

    // Condition discrepancy
    if (allValues.physical_condition && asset.condition_status) {
      const systemCond = (asset.condition_status || '').trim().toLowerCase();
      const physicalCond = (allValues.physical_condition || '').trim().toLowerCase();
      if (systemCond && physicalCond && systemCond !== physicalCond) {
        discrepancies.push({
          field_name: 'condition',
          field_display_name: 'Condition',
          system_value: asset.condition_status,
          physical_value: allValues.physical_condition,
          discrepancy_type: 'condition_changed',
          severity: 'critical'
        });
      }
    }

    // Assignment discrepancy
    if (allValues.physical_assigned_to && asset.assigned_to) {
      if (allValues.physical_assigned_to !== asset.assigned_to) {
        // Find users by checking both user_id and id fields
        const systemUser = users.find(u => (u.user_id || u.id) === asset.assigned_to);
        const physicalUser = users.find(u => (u.user_id || u.id) === allValues.physical_assigned_to);

        // Get user names
        const systemUserName = systemUser
          ? `${systemUser.firstName || ''} ${systemUser.lastName || ''}`.trim()
          : asset.assigned_user_name || 'Unknown';

        const physicalUserName = physicalUser
          ? `${physicalUser.firstName || ''} ${physicalUser.lastName || ''}`.trim()
          : 'Unknown';

        discrepancies.push({
          field_name: 'assigned_to',
          field_display_name: 'Assigned To',
          system_value: systemUserName,
          physical_value: physicalUserName,
          discrepancy_type: 'assignment_mismatch',
          severity: 'major'
        });
      }
    }

    // Serial number discrepancy
    if (allValues.physical_serial_number && asset.serial_number) {
      const systemSerial = (asset.serial_number || '').trim().toLowerCase();
      const physicalSerial = (allValues.physical_serial_number || '').trim().toLowerCase();
      if (systemSerial && physicalSerial && systemSerial !== physicalSerial) {
        discrepancies.push({
          field_name: 'serial_number',
          field_display_name: 'Serial Number',
          system_value: asset.serial_number,
          physical_value: allValues.physical_serial_number,
          discrepancy_type: 'serial_number_mismatch',
          severity: 'critical'
        });
      }
    }

    // Status discrepancy
    if (allValues.physical_status && asset.status) {
      const systemStatus = (asset.status || '').trim().toLowerCase();
      const physicalStatus = (allValues.physical_status || '').trim().toLowerCase();
      if (systemStatus && physicalStatus && systemStatus !== physicalStatus) {
        discrepancies.push({
          field_name: 'status',
          field_display_name: 'Status',
          system_value: asset.status,
          physical_value: allValues.physical_status,
          discrepancy_type: 'status_mismatch',
          severity: 'major'
        });
      }
    }

    setDetectedDiscrepancies(discrepancies);
  };

  // Handle form value changes for real-time detection
  const handleFormChange = (changedValues, allValues) => {
    detectDiscrepancies(changedValues, allValues);
  };

  // User options for dropdown
  const userOptions = useMemo(() => {
    if (!users || users.length === 0) {
      return [];
    }

    // Remove duplicates using the correct ID field (user_id or id)
    const uniqueUsersMap = new Map();
    users.forEach(user => {
      const userId = user.user_id || user.id;
      if (userId && !uniqueUsersMap.has(userId)) {
        uniqueUsersMap.set(userId, user);
      }
    });

    // Convert to options array
    const options = Array.from(uniqueUsersMap.values()).map(user => ({
      value: user.user_id || user.id,
      label: `${user.firstName || ''} ${user.lastName || ''} (${user.email})`.trim(),
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim()
    }));

    // Sort alphabetically by name
    options.sort((a, b) => a.name.localeCompare(b.name));

    // Ensure current assigned user is in the list
    if (asset?.assigned_to && !options.find(opt => opt.value === asset.assigned_to)) {
      options.unshift({
        value: asset.assigned_to,
        label: `${asset.assigned_user_name || 'Current User'} (Current)`,
        name: asset.assigned_user_name || 'Current User'
      });
    }

    return options;
  }, [users, asset?.assigned_to, asset?.assigned_user_name]);

  const handleSubmit = async (values) => {
    try {
      // Send all physical verification fields to backend
      const submitData = {
        reconciliation_status: values.reconciliation_status,
        physical_location: values.physical_location || null,
        physical_condition: values.physical_condition || null,
        physical_assigned_to: values.physical_assigned_to || null,
        physical_serial_number: values.physical_serial_number || null,
        physical_status: values.physical_status || null,
        discrepancy_notes: values.discrepancy_notes || null
      };

      await dispatch(reconcileAsset({
        reconciliationId,
        assetId: asset.id,
        data: submitData
      })).unwrap();

      const discrepancyCount = detectedDiscrepancies.length;
      if (discrepancyCount > 0) {
        message.success(`Asset reconciled successfully with ${discrepancyCount} discrepancy(ies) detected`);
      } else {
        message.success('Asset reconciled successfully');
      }

      form.resetFields();
      setDetectedDiscrepancies([]);
      onSuccess();
    } catch (error) {
      message.error(error || 'Failed to reconcile asset');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setDetectedDiscrepancies([]);
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <span>Reconcile Asset - Physical Verification</span>
          {detectedDiscrepancies.length > 0 && (
            <Badge count={detectedDiscrepancies.length} style={{ backgroundColor: '#faad14' }} />
          )}
        </Space>
      }
      open={visible}
      onOk={form.submit}
      onCancel={handleCancel}
      okText="Confirm Reconciliation"
      cancelText="Cancel"
      confirmLoading={loading}
      width={1000}
      maskClosable={false}
    >
      <div style={{ marginTop: '20px' }}>
        {/* System Data (Read-only) */}
        <Card
          title={
            <span>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
              System Data (Expected)
            </span>
          }
          size="small"
          style={{ marginBottom: 20, backgroundColor: '#f6ffed' }}
        >
          <Row gutter={[16, 8]}>
            <Col span={8}>
              <Text type="secondary">Asset Tag:</Text>
              <div className="font-mono font-semibold">{asset.asset_tag}</div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Serial Number:</Text>
              <div className="font-mono">{asset.serial_number || 'N/A'}</div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Status:</Text>
              <div><Tag color="blue">{asset.status}</Tag></div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Product:</Text>
              <div className="font-semibold">{asset.product_name}</div>
              <div className="text-xs text-gray-500">{asset.product_model}</div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Category:</Text>
              <div>{asset.category_name || 'N/A'}</div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Location:</Text>
              <div>{asset.location_name || 'N/A'}</div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Assigned To:</Text>
              <div>{asset.assigned_user_name || 'Unassigned'}</div>
            </Col>
            <Col span={8}>
              <Text type="secondary">Condition:</Text>
              <div>{asset.condition_status || 'N/A'}</div>
            </Col>
          </Row>
        </Card>

        {/* Detected Discrepancies Alert */}
        {detectedDiscrepancies.length > 0 && (
          <Alert
            type="warning"
            message={
              <Space>
                <WarningOutlined />
                <strong>{detectedDiscrepancies.length} Discrepancy(ies) Detected</strong>
              </Space>
            }
            description={
              <div style={{ marginTop: 8 }}>
                {detectedDiscrepancies.map((disc, idx) => {
                  const severityConfig = getSeverityConfig(disc.severity);
                  return (
                    <div key={idx} style={{ marginBottom: 8, padding: '8px', backgroundColor: '#fff', borderRadius: 4, border: '1px solid #ffd591' }}>
                      <Space direction="vertical" size={2} style={{ width: '100%' }}>
                        <Space>
                          <Tag color={severityConfig.color} icon={severityConfig.icon}>
                            {severityConfig.label}
                          </Tag>
                          <Text strong>{disc.field_display_name}</Text>
                        </Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          System: <Text code>{disc.system_value || 'N/A'}</Text> → Physical: <Text code style={{ color: '#fa8c16' }}>{disc.physical_value || 'N/A'}</Text>
                        </Text>
                      </Space>
                    </div>
                  );
                })}
              </div>
            }
            style={{ marginBottom: 20 }}
            showIcon
          />
        )}

        <Divider>Physical Verification (Enter Actual Values)</Divider>

        {/* Physical Verification Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleFormChange}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <Space>
                    <span>Physical Location</span>
                    {detectedDiscrepancies.find(d => d.field_name === 'location') && (
                      <Tag color="orange" icon={<WarningOutlined />}>Discrepancy</Tag>
                    )}
                  </Space>
                }
                name="physical_location"
                tooltip="Enter the actual physical location where you found this asset"
              >
                <Input
                  placeholder="Enter physical location"
                  style={detectedDiscrepancies.find(d => d.field_name === 'location') ? { borderColor: '#faad14', borderWidth: 2 } : {}}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <Space>
                    <span>Physical Condition</span>
                    {detectedDiscrepancies.find(d => d.field_name === 'condition') && (
                      <Tag color="red" icon={<ExclamationCircleOutlined />}>Critical</Tag>
                    )}
                  </Space>
                }
                name="physical_condition"
                tooltip="Enter the actual physical condition of the asset"
              >
                <Select
                  placeholder="Select physical condition"
                  style={detectedDiscrepancies.find(d => d.field_name === 'condition') ? { borderColor: '#ff4d4f' } : {}}
                >
                  <Option value="working">Working</Option>
                  <Option value="needs_repair">Needs Repair</Option>
                  <Option value="under_maintenance">Under Maintenance</Option>
                  <Option value="damaged">Damaged</Option>
                  <Option value="obsolete">Obsolete</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <Space>
                    <span>Physical Assigned To</span>
                    {detectedDiscrepancies.find(d => d.field_name === 'assigned_to') && (
                      <Tag color="orange" icon={<WarningOutlined />}>Discrepancy</Tag>
                    )}
                  </Space>
                }
                name="physical_assigned_to"
                tooltip="Select who is actually using this asset"
              >
                <Select
                  placeholder="Select physical assigned user"
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                  loading={usersLoading}
                  style={detectedDiscrepancies.find(d => d.field_name === 'assigned_to') ? { borderColor: '#faad14' } : {}}
                >
                  {userOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <Space>
                    <span>Physical Serial Number</span>
                    {detectedDiscrepancies.find(d => d.field_name === 'serial_number') && (
                      <Tag color="red" icon={<ExclamationCircleOutlined />}>Critical</Tag>
                    )}
                  </Space>
                }
                name="physical_serial_number"
                tooltip="Enter the actual serial number found on the asset"
              >
                <Input
                  placeholder="Enter physical serial number"
                  style={detectedDiscrepancies.find(d => d.field_name === 'serial_number') ? { borderColor: '#ff4d4f', borderWidth: 2 } : {}}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <Space>
                    <span>Physical Status</span>
                    {detectedDiscrepancies.find(d => d.field_name === 'status') && (
                      <Tag color="orange" icon={<WarningOutlined />}>Discrepancy</Tag>
                    )}
                  </Space>
                }
                name="physical_status"
                tooltip="Select the actual status of the asset"
              >
                <Select
                  placeholder="Select physical status"
                  style={detectedDiscrepancies.find(d => d.field_name === 'status') ? { borderColor: '#faad14' } : {}}
                >
                  <Option value="assigned">Assigned</Option>
                  <Option value="available">Available</Option>
                  <Option value="in_transit">In Transit</Option>
                  <Option value="under_maintenance">Under Maintenance</Option>
                  <Option value="retired">Retired</Option>
                  <Option value="lost">Lost</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Reconciliation Status"
                name="reconciliation_status"
                rules={[{ required: true, message: 'Please select reconciliation status' }]}
                tooltip="Overall status after physical verification"
              >
                <Select placeholder="Select reconciliation status">
                  <Option value="verified">
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> Verified - All Match
                  </Option>
                  <Option value="discrepancy">
                    <WarningOutlined style={{ color: '#faad14' }} /> Discrepancy - Found Differences
                  </Option>
                  <Option value="missing">
                    <WarningOutlined style={{ color: '#ff4d4f' }} /> Missing - Asset Not Found
                  </Option>
                  <Option value="damaged">
                    <WarningOutlined style={{ color: '#ff7a45' }} /> Damaged - Physical Damage
                  </Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Discrepancy Notes"
                name="discrepancy_notes"
                rules={[
                  { max: 5000, message: 'Notes must not exceed 5000 characters' }
                ]}
                extra="Describe any discrepancies, damage, or issues found during physical verification"
              >
                <TextArea
                  rows={4}
                  placeholder="Enter any notes about discrepancies or issues found during physical verification..."
                  showCount
                  maxLength={5000}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>

        <div className="mt-4 p-3 bg-blue-50 rounded">
          <Text className="text-sm text-gray-700">
            <InfoCircleOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <strong>Note:</strong> This will mark the asset as reconciled.
            {detectedDiscrepancies.length > 0 && (
              <span style={{ color: '#fa8c16' }}> {detectedDiscrepancies.length} discrepancy(ies) will be automatically recorded for resolution.</span>
            )}
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ReconcileAssetModal;
