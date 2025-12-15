import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Card,
  Row,
  Col,
  message,
  Divider,
  Table,
  Button,
  InputNumber,
  Tag,
  Alert,
  Space,
  Typography
} from 'antd';
import {
  ToolOutlined,
  SwapOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined
} from '@ant-design/icons';
import serviceReportService from '../../../services/serviceReport';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const ServiceReportModal = ({
  visible,
  ticket,
  linkedAssets = [],
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [availableParts, setAvailableParts] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [selectedParts, setSelectedParts] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);

  const serviceType = ticket?.service_type;
  const isRepair = serviceType === 'repair';
  const isReplace = serviceType === 'replace';

  useEffect(() => {
    if (visible && ticket) {
      form.resetFields();
      setSelectedParts([]);

      // Pre-select the first linked asset as the main asset
      if (linkedAssets.length > 0) {
        form.setFieldsValue({ asset_id: linkedAssets[0].asset_id });
      }

      // Fetch available spare parts for repair service
      if (isRepair) {
        fetchAvailableParts();
      }

      // Fetch available replacement assets for replace service
      if (isReplace) {
        fetchAvailableAssets();
      }
    }
  }, [visible, ticket, linkedAssets]);

  const fetchAvailableParts = async () => {
    setLoadingParts(true);
    try {
      const response = await serviceReportService.getAvailableSpareParts();
      setAvailableParts(response.data?.data?.parts || []);
    } catch (error) {
      console.error('Failed to fetch spare parts:', error);
    } finally {
      setLoadingParts(false);
    }
  };

  const fetchAvailableAssets = async () => {
    setLoadingAssets(true);
    try {
      // For replacement, we need standalone/parent assets that are available
      const response = await serviceReportService.getAvailableReplacementAssets();
      setAvailableAssets(response.data?.data?.assets || []);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleAddPart = () => {
    setSelectedParts([
      ...selectedParts,
      {
        key: Date.now(),
        asset_id: null,
        quantity: 1,
        unit_cost: 0,
        notes: ''
      }
    ]);
  };

  const handleRemovePart = (key) => {
    setSelectedParts(selectedParts.filter(p => p.key !== key));
  };

  const handlePartChange = (key, field, value) => {
    setSelectedParts(selectedParts.map(p => {
      if (p.key === key) {
        const updated = { ...p, [field]: value };
        // Auto-fill cost from selected part
        if (field === 'asset_id' && value) {
          const part = availableParts.find(ap => ap.asset_id === value);
          if (part?.purchase_cost) {
            updated.unit_cost = part.purchase_cost;
          }
        }
        return updated;
      }
      return p;
    }));
  };

  const calculateTotalPartsCost = () => {
    return selectedParts.reduce((sum, p) => sum + (p.quantity * (p.unit_cost || 0)), 0);
  };

  const handleSubmit = async (values) => {
    if (!ticket) return;

    // Validate parts selection for repair
    if (isRepair && selectedParts.length > 0) {
      const invalidParts = selectedParts.filter(p => !p.asset_id);
      if (invalidParts.length > 0) {
        message.error('Please select all spare parts or remove empty entries');
        return;
      }
    }

    setLoading(true);
    try {
      const reportData = {
        ticket_id: ticket.ticket_id,
        service_type: serviceType,
        asset_id: values.asset_id,
        replacement_asset_id: isReplace ? values.replacement_asset_id : null,
        diagnosis: values.diagnosis,
        work_performed: values.work_performed,
        // Condition fields only for repair service
        condition_before: isRepair ? values.condition_before : null,
        condition_after: isRepair ? values.condition_after : null,
        total_parts_cost: calculateTotalPartsCost(),
        labor_cost: values.labor_cost || 0,
        engineer_notes: values.engineer_notes,
        parts_used: selectedParts.filter(p => p.asset_id).map(p => ({
          asset_id: p.asset_id,
          quantity: p.quantity,
          unit_cost: p.unit_cost,
          notes: p.notes
        }))
      };

      await serviceReportService.createReport(reportData);
      message.success('Service report created successfully');
      form.resetFields();
      setSelectedParts([]);
      onSuccess();
    } catch (error) {
      console.error('Failed to create service report:', error);
      message.error(
        error.response?.data?.message || 'Failed to create service report'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return null;

  const partsColumns = [
    {
      title: 'Spare Part',
      dataIndex: 'asset_id',
      key: 'asset_id',
      width: '40%',
      render: (value, record) => (
        <Select
          value={value}
          onChange={(v) => handlePartChange(record.key, 'asset_id', v)}
          placeholder="Select spare part"
          loading={loadingParts}
          showSearch
          optionFilterProp="children"
          style={{ width: '100%' }}
        >
          {availableParts
            .filter(p => !selectedParts.find(sp => sp.asset_id === p.asset_id && sp.key !== record.key))
            .map(p => (
              <Option key={p.asset_id} value={p.asset_id}>
                {p.product_name} - {p.asset_tag}
              </Option>
            ))}
        </Select>
      )
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '15%',
      render: (value, record) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(v) => handlePartChange(record.key, 'quantity', v)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Unit Cost',
      dataIndex: 'unit_cost',
      key: 'unit_cost',
      width: '20%',
      render: (value, record) => (
        <InputNumber
          min={0}
          precision={2}
          value={value}
          onChange={(v) => handlePartChange(record.key, 'unit_cost', v)}
          style={{ width: '100%' }}
          prefix="₹"
        />
      )
    },
    {
      title: 'Total',
      key: 'total',
      width: '15%',
      render: (_, record) => (
        <Text>₹{((record.quantity || 0) * (record.unit_cost || 0)).toFixed(2)}</Text>
      )
    },
    {
      title: '',
      key: 'action',
      width: '10%',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemovePart(record.key)}
        />
      )
    }
  ];

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          {isRepair ? (
            <ToolOutlined style={{ color: '#fa8c16' }} />
          ) : (
            <SwapOutlined style={{ color: '#722ed1' }} />
          )}
          <span>
            {isRepair ? 'Repair Service Report' : 'Replacement Service Report'}
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Create Report & Close Ticket"
      okButtonProps={{ icon: <SaveOutlined /> }}
      confirmLoading={loading}
      width={850}
      destroyOnClose
    >
      {/* Ticket Info */}
      <Alert
        message={`Ticket: ${ticket.ticket_number} - ${ticket.title}`}
        description={
          isRepair
            ? 'Document the repair work performed, spare parts used, and the condition of the asset after repair.'
            : 'Document the replacement, specify the new asset, and note any components transferred.'
        }
        type={isRepair ? 'warning' : 'info'}
        showIcon
        className="mb-4"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          condition_before: 'poor',
          condition_after: 'good'
        }}
      >
        {/* Asset Selection */}
        <Row gutter={16}>
          <Col span={isReplace ? 12 : 24}>
            <Form.Item
              name="asset_id"
              label="Asset Being Serviced"
              rules={[{ required: true, message: 'Please select the asset' }]}
            >
              <Select placeholder="Select asset" disabled={linkedAssets.length === 1}>
                {linkedAssets.map(asset => (
                  <Option key={asset.asset_id} value={asset.asset_id}>
                    {asset.product_name || 'Asset'} - {asset.asset_tag}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {isReplace && (
            <Col span={12}>
              <Form.Item
                name="replacement_asset_id"
                label="Replacement Asset"
                rules={[{ required: true, message: 'Please select replacement asset' }]}
              >
                <Select
                  placeholder="Select replacement asset"
                  loading={loadingAssets}
                  showSearch
                  optionFilterProp="children"
                >
                  {availableAssets.map(asset => (
                    <Option key={asset.asset_id} value={asset.asset_id}>
                      {asset.product_name} - {asset.asset_tag}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          )}
        </Row>

        {/* Diagnosis */}
        <Form.Item
          name="diagnosis"
          label="Diagnosis / Problem Found"
          rules={[
            { required: true, message: 'Please enter diagnosis' },
            { min: 10, message: 'Diagnosis must be at least 10 characters' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Describe the problem found during inspection..."
            maxLength={2000}
            showCount
          />
        </Form.Item>

        {/* Work Performed */}
        <Form.Item
          name="work_performed"
          label="Work Performed"
          rules={[
            { required: true, message: 'Please describe work performed' },
            { min: 10, message: 'Work description must be at least 10 characters' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Describe the repair/replacement work performed..."
            maxLength={2000}
            showCount
          />
        </Form.Item>

        {/* Condition Before/After - Only for Repair */}
        {isRepair && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="condition_before"
                label="Condition Before Service"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Select placeholder="Select condition">
                  <Option value="excellent">Excellent</Option>
                  <Option value="good">Good</Option>
                  <Option value="fair">Fair</Option>
                  <Option value="poor">Poor</Option>
                  <Option value="damaged">Damaged</Option>
                  <Option value="non_functional">Non-Functional</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="condition_after"
                label="Condition After Service"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Select placeholder="Select condition">
                  <Option value="excellent">Excellent</Option>
                  <Option value="good">Good</Option>
                  <Option value="fair">Fair</Option>
                  <Option value="new">New (Replaced)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Spare Parts Used - Only for Repair */}
        {isRepair && (
          <>
            <Divider>
              <ToolOutlined /> Spare Parts Used
            </Divider>

            <Card size="small" className="mb-4">
              <Table
                dataSource={selectedParts}
                columns={partsColumns}
                pagination={false}
                size="small"
                locale={{ emptyText: 'No spare parts added' }}
              />
              <Button
                type="dashed"
                onClick={handleAddPart}
                icon={<PlusOutlined />}
                style={{ width: '100%', marginTop: 8 }}
              >
                Add Spare Part
              </Button>

              {selectedParts.length > 0 && (
                <div style={{ textAlign: 'right', marginTop: 8 }}>
                  <Text strong>Total Parts Cost: ₹{calculateTotalPartsCost().toFixed(2)}</Text>
                </div>
              )}
            </Card>
          </>
        )}

        {/* Labor Cost */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="labor_cost"
              label="Labor Cost (Optional)"
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: '100%' }}
                prefix="₹"
                placeholder="0.00"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <div style={{ paddingTop: 30 }}>
              <Text type="secondary">
                Total Cost: ₹{(calculateTotalPartsCost() + (form.getFieldValue('labor_cost') || 0)).toFixed(2)}
              </Text>
            </div>
          </Col>
        </Row>

        {/* Engineer Notes */}
        <Form.Item
          name="engineer_notes"
          label="Additional Notes (Optional)"
        >
          <TextArea
            rows={2}
            placeholder="Any additional notes or recommendations..."
            maxLength={1000}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServiceReportModal;
