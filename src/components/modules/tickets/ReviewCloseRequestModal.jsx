import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Card, Row, Col, message, Tag, Alert, Button, Space, Divider, Select, InputNumber, Switch, Checkbox, List, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined, ClockCircleOutlined, ToolOutlined, LaptopOutlined } from '@ant-design/icons';
import ticketService from '../../../services/ticket';
import repairHistoryService from '../../../services/repairHistory';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const ReviewCloseRequestModal = ({ visible, closeRequest, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(null); // 'approved' or 'rejected'
  const [linkedAssets, setLinkedAssets] = useState([]);
  const [faultTypes, setFaultTypes] = useState([]);
  const [recordRepairs, setRecordRepairs] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [repairData, setRepairData] = useState({});

  useEffect(() => {
    if (visible && closeRequest) {
      form.resetFields();
      setAction(null);
      setRecordRepairs(false);
      setSelectedAssets([]);
      setRepairData({});
      fetchLinkedAssets();
      fetchFaultTypes();
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
      // Initialize repair data for this asset
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

    console.log('Submitting review:', {
      close_request_id: closeRequest.close_request_id,
      action,
      review_notes: values.review_notes
    });

    setLoading(true);
    try {
      // First, review the close request
      await ticketService.reviewCloseRequest(
        closeRequest.close_request_id,
        action,
        values.review_notes || null
      );

      // If approved and repair records should be created, create them
      if (action === 'approved' && recordRepairs && selectedAssets.length > 0) {
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
      console.error('Error response:', error.response);
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

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <CheckCircleOutlined style={{ color: '#1890ff' }} />
          <span>Review Close Request</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>
            Cancel
          </Button>
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
      width={700}
      destroyOnClose
    >
      {/* Info Alert */}
      <Alert
        message="Review Engineer's Close Request"
        description="Approve to close the ticket or reject to send it back to the engineer with feedback."
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

          {/* Created For */}
          <div>
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
          </div>

          {/* Engineer */}
          <div>
            <div className="text-xs text-gray-500 mb-1">
              <UserOutlined /> Engineer
            </div>
            <div className="font-medium">{closeRequest.engineer_name}</div>
            <div className="text-xs text-gray-500">{closeRequest.engineer_email}</div>
          </div>
        </div>
      </Card>

      {/* Engineer's Resolution Notes */}
      <Card
        size="small"
        title="Engineer's Resolution Notes"
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
            rows={4}
            placeholder="Provide feedback to the engineer...

For Approval (optional):
- Good work! Ticket resolved satisfactorily.

For Rejection (required):
- Please provide more details about the testing performed
- The issue was not fully resolved, please check X, Y, Z"
            maxLength={1000}
            showCount
          />
        </Form.Item>
      </Form>

      {/* Record Repair History Section */}
      {linkedAssets.length > 0 && (
        <Card
          size="small"
          title={
            <Space>
              <ToolOutlined />
              <span>Record Repair History</span>
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
              Enable to record repair entries for linked assets when approving this ticket
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
                        {asset.is_component_of_linked && asset.parent_asset_tag && (
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            (of {asset.parent_asset_tag})
                          </Text>
                        )}
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
                              <div className="text-xs text-gray-500 mb-1">Parts Cost ($)</div>
                              <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                precision={2}
                                value={repairData[asset.asset_id]?.parts_cost || 0}
                                onChange={(val) => handleRepairDataChange(asset.asset_id, 'parts_cost', val || 0)}
                              />
                            </Col>
                            <Col span={8}>
                              <div className="text-xs text-gray-500 mb-1">Labor Cost ($)</div>
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

      {/* Warning for Actions */}
      {action === 'approved' && (
        <Alert
          message="Approve & Close"
          description="The ticket will be permanently closed and marked as resolved."
          type="success"
          showIcon
          className="mt-2"
        />
      )}
      {action === 'rejected' && (
        <Alert
          message="Reject Request"
          description="The ticket will return to 'In Progress' status and the engineer will be notified with your feedback."
          type="warning"
          showIcon
          className="mt-2"
        />
      )}
    </Modal>
  );
};

export default ReviewCloseRequestModal;
