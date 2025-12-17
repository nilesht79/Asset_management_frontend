import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Card,
  Row,
  Col,
  message,
  Tag,
  Alert,
  Button,
  Space,
  Divider,
  Select,
  InputNumber,
  Switch,
  Checkbox,
  List,
  Typography,
  Descriptions
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  SwapOutlined,
  LaptopOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import ticketService from '../../../services/ticket';
import repairHistoryService from '../../../services/repairHistory';
import serviceReportService from '../../../services/serviceReport';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const ReviewCloseRequestModal = ({ visible, closeRequest, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(null);
  const [linkedAssets, setLinkedAssets] = useState([]);
  const [faultTypes, setFaultTypes] = useState([]);
  const [recordRepairs, setRecordRepairs] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [repairData, setRepairData] = useState({});

  // Check if this is a repair/replace ticket with service report
  const hasServiceReport = closeRequest?.service_report_id;
  const isRepair = closeRequest?.ticket_service_type === 'repair' || closeRequest?.service_report_type === 'repair';
  const isReplace = closeRequest?.ticket_service_type === 'replace' || closeRequest?.service_report_type === 'replace';

  useEffect(() => {
    if (visible && closeRequest) {
      form.resetFields();
      setAction(null);
      setRecordRepairs(false);
      setSelectedAssets([]);
      setRepairData({});
      fetchLinkedAssets();

      // Only fetch fault types if no service report (manual repair history entry)
      if (!hasServiceReport) {
        fetchFaultTypes();
      }
    }
  }, [visible, closeRequest]);

  const fetchLinkedAssets = async () => {
    if (!closeRequest?.ticket_id) return;
    try {
      const response = await ticketService.getTicketAssets(closeRequest.ticket_id);
      const data = response.data?.data || response.data;
      setLinkedAssets(data.assets || []);
    } catch (error) {
      console.error('Failed to fetch linked assets:', error);
    }
  };

  const fetchFaultTypes = async () => {
    try {
      const response = await repairHistoryService.getFaultTypes();
      const data = response.data?.data || response.data;
      const faultTypesData = data?.fault_types || data?.faultTypes || data;
      setFaultTypes(Array.isArray(faultTypesData) ? faultTypesData : []);
    } catch (error) {
      console.error('Failed to fetch fault types:', error);
      setFaultTypes([]);
    }
  };

  const handleAssetSelect = (assetId, checked) => {
    if (checked) {
      setSelectedAssets([...selectedAssets, assetId]);
      setRepairData(prev => ({
        ...prev,
        [assetId]: {
          fault_type_id: null,
          fault_description: closeRequest?.request_notes || '',
          resolution: '',
          parts_cost: 0,
          labor_cost: 0,
          labor_hours: 0,
          parts_replaced: '',
          warranty_claim: false
        }
      }));
    } else {
      setSelectedAssets(selectedAssets.filter(id => id !== assetId));
      setRepairData(prev => {
        const newData = { ...prev };
        delete newData[assetId];
        return newData;
      });
    }
  };

  const handleRepairDataChange = (assetId, field, value) => {
    setRepairData(prev => ({
      ...prev,
      [assetId]: {
        ...prev[assetId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (values) => {
    if (!closeRequest || !action) {
      console.error('Missing closeRequest or action:', { closeRequest, action });
      return;
    }

    if (!closeRequest.close_request_id) {
      console.error('Missing close_request_id in closeRequest:', closeRequest);
      message.error('Invalid close request data. Please refresh and try again.');
      return;
    }

    setLoading(true);
    try {
      // Review the close request - backend will handle service report finalization
      await ticketService.reviewCloseRequest(
        closeRequest.close_request_id,
        action,
        values.review_notes || null
      );

      // If approved and NO service report, allow manual repair recording (for general tickets)
      if (action === 'approved' && !hasServiceReport && recordRepairs && selectedAssets.length > 0) {
        const repairPromises = selectedAssets.map(assetId => {
          const assetRepair = repairData[assetId];
          if (!assetRepair) return null;

          return repairHistoryService.createRepairEntry({
            asset_id: assetId,
            ticket_id: closeRequest.ticket_id,
            fault_type_id: assetRepair.fault_type_id,
            fault_description: assetRepair.fault_description,
            resolution: assetRepair.resolution || closeRequest.request_notes,
            repair_status: 'completed',
            repair_date: new Date().toISOString(),
            parts_cost: assetRepair.parts_cost || 0,
            labor_cost: assetRepair.labor_cost || 0,
            labor_hours: assetRepair.labor_hours || 0,
            parts_replaced: assetRepair.parts_replaced,
            warranty_claim: assetRepair.warranty_claim || false,
            notes: `Created from ticket ${closeRequest.ticket_number} closure`
          }).catch(err => {
            console.error('Failed to create repair entry for asset:', assetId, err);
            return null;
          });
        }).filter(Boolean);

        const results = await Promise.all(repairPromises);
        const successCount = results.filter(r => r !== null).length;
        if (successCount > 0) {
          message.info(`${successCount} repair record(s) created`);
        }
      }

      form.resetFields();
      setAction(null);
      setRecordRepairs(false);
      setSelectedAssets([]);
      setRepairData({});
      onSuccess(action);
    } catch (error) {
      console.error('Failed to review close request:', error);
      message.error(
        error.response?.data?.message || 'Failed to review close request'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setAction('approved');
    form.submit();
  };

  const handleReject = () => {
    if (!form.getFieldValue('review_notes')) {
      message.warning('Please provide feedback when rejecting a close request');
      return;
    }
    setAction('rejected');
    form.submit();
  };

  if (!closeRequest) return null;

  const calculateDuration = () => {
    if (!closeRequest.created_at) return 'N/A';
    const created = new Date(closeRequest.created_at);
    const now = new Date();
    const diffMs = now - created;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  };

  const formatCurrency = (value) => {
    return `₹${(value || 0).toFixed(2)}`;
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <CheckCircleOutlined style={{ color: '#1890ff' }} />
          <span>Review Close Request</span>
          {hasServiceReport && (
            <Tag color={isRepair ? 'orange' : 'purple'}>
              {isRepair ? 'REPAIR' : 'REPLACEMENT'}
            </Tag>
          )}
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={handleReject}
            loading={loading && action === 'rejected'}
          >
            Reject
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleApprove}
            loading={loading && action === 'approved'}
          >
            Approve & Close Ticket
          </Button>
        </Space>
      }
      width={hasServiceReport ? 850 : 700}
      destroyOnClose
    >
      {/* Info Alert */}
      <Alert
        message="Review Engineer's Close Request"
        description={
          hasServiceReport
            ? `This ${isRepair ? 'repair' : 'replacement'} service report was prepared by the engineer. Review the details and approve to close the ticket${isRepair ? ' (repair history will be auto-recorded)' : ''}.`
            : "Approve to close the ticket or reject to send it back to the engineer with feedback."
        }
        type="info"
        showIcon
        className="mb-4"
      />

      {/* Ticket Info */}
      <Card size="small" className="mb-4" style={{ backgroundColor: '#f0f5ff', borderColor: '#adc6ff' }}>
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold">Ticket:</span>{' '}
              <Tag color="blue">{closeRequest.ticket_number}</Tag>
              {closeRequest.ticket_service_type && (
                <Tag color={serviceReportService.getServiceTypeColor(closeRequest.ticket_service_type)}>
                  {serviceReportService.getServiceTypeDisplayName(closeRequest.ticket_service_type)}
                </Tag>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                <ClockCircleOutlined /> Requested
              </div>
              <div className="font-semibold">{calculateDuration()}</div>
            </div>
          </div>

          <div>
            <span className="font-semibold">Title:</span> {closeRequest.ticket_title}
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <div className="text-xs text-gray-500">Priority</div>
              <Tag color={ticketService.getPriorityColor(closeRequest.ticket_priority)}>
                {ticketService.getPriorityDisplayName(closeRequest.ticket_priority).toUpperCase()}
              </Tag>
            </Col>
            <Col span={8}>
              <div className="text-xs text-gray-500">Department</div>
              <div className="font-medium">{closeRequest.department_name || 'N/A'}</div>
            </Col>
            <Col span={8}>
              <div className="text-xs text-gray-500">Location</div>
              <div className="font-medium">{closeRequest.location_name || 'N/A'}</div>
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0' }} />

          <Row gutter={16}>
            <Col span={12}>
              <div className="text-xs text-gray-500 mb-1">Created For</div>
              {closeRequest.guest_name ? (
                <div className="flex items-center space-x-2">
                  <Tag color="purple">GUEST</Tag>
                  <div>
                    <div className="font-medium">{closeRequest.guest_name}</div>
                    <div className="text-xs text-gray-500">{closeRequest.guest_email}</div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium">{closeRequest.created_by_user_name}</div>
                  <div className="text-xs text-gray-500">{closeRequest.created_by_user_email}</div>
                </div>
              )}
            </Col>
            <Col span={12}>
              <div className="text-xs text-gray-500 mb-1">
                <UserOutlined /> Engineer
              </div>
              <div className="font-medium">{closeRequest.engineer_name}</div>
              <div className="text-xs text-gray-500">{closeRequest.engineer_email}</div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Service Report Section - When available */}
      {hasServiceReport && (
        <Card
          size="small"
          title={
            <Space>
              {isRepair ? <ToolOutlined style={{ color: '#fa8c16' }} /> : <SwapOutlined style={{ color: '#722ed1' }} />}
              <span>Service Report: {closeRequest.service_report_number}</span>
              <Tag color={closeRequest.service_report_status === 'draft' ? 'gold' : 'green'}>
                {closeRequest.service_report_status?.toUpperCase()}
              </Tag>
            </Space>
          }
          className="mb-4"
          headStyle={{ backgroundColor: isRepair ? '#fff7e6' : '#f9f0ff' }}
        >
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="Diagnosis" span={2}>
              <div className="whitespace-pre-wrap">{closeRequest.service_report_diagnosis || 'N/A'}</div>
            </Descriptions.Item>
            <Descriptions.Item label="Work Performed" span={2}>
              <div className="whitespace-pre-wrap">{closeRequest.service_report_work_performed || 'N/A'}</div>
            </Descriptions.Item>
            {isRepair && (
              <>
                <Descriptions.Item label="Fault Type" span={2}>
                  {closeRequest.fault_type_name ? (
                    <Tag color="volcano">
                      {closeRequest.fault_type_category ? `[${closeRequest.fault_type_category}] ` : ''}
                      {closeRequest.fault_type_name}
                    </Tag>
                  ) : (
                    <Text type="secondary">Not specified</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Condition Before">
                  <Tag color={serviceReportService.getConditionColor(closeRequest.condition_before)}>
                    {serviceReportService.getConditionDisplayName(closeRequest.condition_before)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Condition After">
                  <Tag color={serviceReportService.getConditionColor(closeRequest.condition_after)}>
                    {serviceReportService.getConditionDisplayName(closeRequest.condition_after)}
                  </Tag>
                </Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="Parts Cost">
              {formatCurrency(closeRequest.total_parts_cost)}
            </Descriptions.Item>
            <Descriptions.Item label="Labor Cost">
              {formatCurrency(closeRequest.labor_cost)}
            </Descriptions.Item>
            <Descriptions.Item label="Total Cost" span={2}>
              <Text strong>{formatCurrency((closeRequest.total_parts_cost || 0) + (closeRequest.labor_cost || 0))}</Text>
            </Descriptions.Item>
            {closeRequest.service_report_notes && (
              <Descriptions.Item label="Engineer Notes" span={2}>
                {closeRequest.service_report_notes}
              </Descriptions.Item>
            )}
          </Descriptions>

          {isRepair && (
            <Alert
              message="Repair History"
              description="Repair history will be automatically recorded for the serviced asset when you approve this request."
              type="info"
              showIcon
              className="mt-3"
            />
          )}
        </Card>
      )}

      {/* Engineer's Resolution Notes */}
      <Card
        size="small"
        title={
          <Space>
            <FileTextOutlined />
            <span>Engineer's Resolution Notes</span>
          </Space>
        }
        className="mb-4"
        headStyle={{ backgroundColor: '#e6f7ff', fontWeight: 600 }}
      >
        <div className="whitespace-pre-wrap text-gray-700">
          {closeRequest.request_notes}
        </div>
      </Card>

      {/* Linked Assets Section */}
      {linkedAssets.length > 0 && (
        <Card
          size="small"
          title={
            <Space>
              <LaptopOutlined />
              <span>Linked Assets</span>
              <Tag>{linkedAssets.length}</Tag>
            </Space>
          }
          className="mb-4"
        >
          <List
            size="small"
            dataSource={linkedAssets}
            renderItem={(asset) => (
              <List.Item style={{ paddingLeft: asset.is_component_of_linked ? 24 : 0 }}>
                <Space>
                  <LaptopOutlined style={{ color: asset.is_component_of_linked ? '#13c2c2' : '#1890ff' }} />
                  {asset.is_component_of_linked ? (
                    <Tag color="cyan" style={{ fontSize: '10px' }}>COMPONENT</Tag>
                  ) : asset.asset_type === 'parent' ? (
                    <Tag color="blue" style={{ fontSize: '10px' }}>PARENT</Tag>
                  ) : null}
                  <Text strong>{asset.asset_tag}</Text>
                  <Text type="secondary">{asset.product_name}</Text>
                  {asset.is_component_of_linked && asset.parent_asset_tag && (
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      (of {asset.parent_asset_tag})
                    </Text>
                  )}
                  <Tag>{asset.asset_status}</Tag>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Coordinator Review Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="review_notes"
          label="Your Review / Feedback (Optional for approval, Required for rejection)"
          rules={[
            {
              validator: (_, value) => {
                if (action === 'rejected' && !value) {
                  return Promise.reject('Feedback is required when rejecting');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Provide feedback to the engineer..."
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>

      {/* Manual Repair History Section - Only when NO service report */}
      {!hasServiceReport && linkedAssets.length > 0 && (
        <Card
          size="small"
          title={
            <Space>
              <ToolOutlined />
              <span>Record Repair History (Optional)</span>
              <Switch
                checked={recordRepairs}
                onChange={setRecordRepairs}
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Space>
          }
          className="mb-4"
          style={{ backgroundColor: recordRepairs ? '#f6ffed' : '#fafafa' }}
        >
          {!recordRepairs ? (
            <Text type="secondary">
              Enable to manually record repair entries for linked assets when approving this ticket
            </Text>
          ) : (
            <div>
              <Alert
                message="Select assets that were repaired/serviced"
                type="info"
                showIcon
                className="mb-3"
              />

              {linkedAssets.map((asset) => (
                <Card
                  key={asset.asset_id}
                  size="small"
                  className="mb-2"
                  style={{
                    backgroundColor: selectedAssets.includes(asset.asset_id) ? '#e6f7ff' : '#fff',
                    borderColor: selectedAssets.includes(asset.asset_id) ? '#1890ff' : '#d9d9d9',
                    marginLeft: asset.is_component_of_linked ? 24 : 0
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedAssets.includes(asset.asset_id)}
                      onChange={(e) => handleAssetSelect(asset.asset_id, e.target.checked)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {asset.is_component_of_linked ? (
                          <Tag color="cyan" style={{ fontSize: '10px' }}>COMPONENT</Tag>
                        ) : asset.asset_type === 'parent' ? (
                          <Tag color="blue" style={{ fontSize: '10px' }}>PARENT</Tag>
                        ) : null}
                        <Text strong>{asset.asset_tag}</Text>
                        <Text type="secondary">{asset.product_name}</Text>
                      </div>

                      {selectedAssets.includes(asset.asset_id) && (
                        <div className="space-y-3 mt-3 pt-3 border-t">
                          <Row gutter={16}>
                            <Col span={12}>
                              <div className="text-xs text-gray-500 mb-1">Fault Type</div>
                              <Select
                                style={{ width: '100%' }}
                                placeholder="Select fault type"
                                value={repairData[asset.asset_id]?.fault_type_id}
                                onChange={(val) => handleRepairDataChange(asset.asset_id, 'fault_type_id', val)}
                                allowClear
                              >
                                {faultTypes.map((ft) => (
                                  <Option key={ft.fault_type_id} value={ft.fault_type_id}>
                                    {ft.name} ({ft.category})
                                  </Option>
                                ))}
                              </Select>
                            </Col>
                            <Col span={12}>
                              <div className="text-xs text-gray-500 mb-1">Warranty Claim</div>
                              <Switch
                                checked={repairData[asset.asset_id]?.warranty_claim || false}
                                onChange={(val) => handleRepairDataChange(asset.asset_id, 'warranty_claim', val)}
                              />
                            </Col>
                          </Row>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">Resolution Details</div>
                            <TextArea
                              rows={2}
                              placeholder="Describe what was done..."
                              value={repairData[asset.asset_id]?.resolution || ''}
                              onChange={(e) => handleRepairDataChange(asset.asset_id, 'resolution', e.target.value)}
                            />
                          </div>

                          <Row gutter={16}>
                            <Col span={8}>
                              <div className="text-xs text-gray-500 mb-1">Parts Cost (₹)</div>
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                precision={2}
                                value={repairData[asset.asset_id]?.parts_cost || 0}
                                onChange={(val) => handleRepairDataChange(asset.asset_id, 'parts_cost', val || 0)}
                              />
                            </Col>
                            <Col span={8}>
                              <div className="text-xs text-gray-500 mb-1">Labor Cost (₹)</div>
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                precision={2}
                                value={repairData[asset.asset_id]?.labor_cost || 0}
                                onChange={(val) => handleRepairDataChange(asset.asset_id, 'labor_cost', val || 0)}
                              />
                            </Col>
                            <Col span={8}>
                              <div className="text-xs text-gray-500 mb-1">Labor Hours</div>
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                precision={1}
                                value={repairData[asset.asset_id]?.labor_hours || 0}
                                onChange={(val) => handleRepairDataChange(asset.asset_id, 'labor_hours', val || 0)}
                              />
                            </Col>
                          </Row>

                          <div>
                            <div className="text-xs text-gray-500 mb-1">Parts Replaced (if any)</div>
                            <Input
                              placeholder="e.g., RAM module, Hard drive"
                              value={repairData[asset.asset_id]?.parts_replaced || ''}
                              onChange={(e) => handleRepairDataChange(asset.asset_id, 'parts_replaced', e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {selectedAssets.length > 0 && (
                <Alert
                  message={`${selectedAssets.length} asset(s) selected for repair record`}
                  type="success"
                  showIcon
                  className="mt-2"
                />
              )}
            </div>
          )}
        </Card>
      )}
    </Modal>
  );
};

export default ReviewCloseRequestModal;
