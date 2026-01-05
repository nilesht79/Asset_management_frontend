import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Steps,
  Space,
  message,
  Row,
  Col,
  Radio,
  InputNumber,
  Alert,
  Divider,
  Typography
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { createRequisition } from '../store/slices/requisitionSlice';
import { fetchCategories, fetchSubcategoriesByParent, clearSubcategoriesByParent } from '../store/slices/masterSlice';
import './NewRequisition.css';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const NewRequisition = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const master = useSelector((state) => state.master || {});
  const categories = master.categories?.data || [];
  const subcategories = master.subcategoriesByParent?.data || [];
  const subcategoriesLoading = master.subcategoriesByParent?.loading || false;

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});

  // Load parent categories on mount (Hardware/Software)
  useEffect(() => {
    dispatch(fetchCategories({ limit: 1000 }));
    // Clear subcategories when component unmounts
    return () => {
      dispatch(clearSubcategoriesByParent());
    };
  }, [dispatch]);

  const steps = [
    {
      title: 'Asset Details',
      description: 'What do you need?'
    },
    {
      title: 'Justification',
      description: 'Why do you need it?'
    },
    {
      title: 'Review & Submit',
      description: 'Confirm details'
    }
  ];

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      setFormData({ ...formData, ...values });
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const finalData = { ...formData, ...values };

      setLoading(true);

      // Format date
      if (finalData.required_by_date) {
        finalData.required_by_date = finalData.required_by_date.format('YYYY-MM-DD');
      }

      await dispatch(createRequisition(finalData)).unwrap();

      message.success('Requisition created successfully');
      navigate('/requisitions/my-requisitions');
    } catch (error) {
      message.error(error.message || 'Failed to create requisition');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/requisitions/my-requisitions');
  };

  // Step 1: Asset Details
  const renderStep1 = () => (
    <div className="form-step">
      <Title level={4}>Asset Information</Title>
      <Text type="secondary">Specify the asset you need</Text>
      <Divider />

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="asset_category_id"
            label="Asset Category"
            rules={[{ required: true, message: 'Please select asset category' }]}
          >
            <Select
              placeholder="Select category (Hardware/Software)"
              allowClear
              onChange={(value) => {
                setFormData({ ...formData, asset_category_id: value });
                // Clear subcategory when category changes
                form.setFieldsValue({ product_type_id: undefined });
                dispatch(clearSubcategoriesByParent());
                // Fetch subcategories for selected category
                if (value) {
                  dispatch(fetchSubcategoriesByParent(value));
                }
              }}
              showSearch
              optionFilterProp="children"
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="product_type_id"
            label="Asset Subcategory"
            rules={[{ required: true, message: 'Please select subcategory' }]}
          >
            <Select
              placeholder={formData.asset_category_id ? "Select subcategory" : "Select category first"}
              allowClear
              disabled={!formData.asset_category_id}
              loading={subcategoriesLoading}
              onChange={(value) => {
                setFormData({ ...formData, product_type_id: value });
              }}
              showSearch
              optionFilterProp="children"
            >
              {subcategories.map((subcat) => (
                <Option key={subcat.id} value={subcat.id}>
                  {subcat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
            initialValue={1}
          >
            <InputNumber
              min={1}
              max={100}
              style={{ width: '100%' }}
              placeholder="Enter quantity"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="urgency"
            label="Urgency Level"
            rules={[{ required: true, message: 'Please select urgency level' }]}
            initialValue="medium"
          >
            <Radio.Group>
              <Radio.Button value="low">Low</Radio.Button>
              <Radio.Button value="medium">Medium</Radio.Button>
              <Radio.Button value="high">High</Radio.Button>
              <Radio.Button value="critical">Critical</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            name="required_by_date"
            label="Required By Date (Optional)"
            help="When do you need this asset?"
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current < moment().startOf('day')}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="specifications"
        label="Additional Specifications (Optional)"
        help="Any specific requirements or preferences"
      >
        <TextArea
          rows={4}
          placeholder="E.g., RAM requirements, storage capacity, screen size, etc."
        />
      </Form.Item>
    </div>
  );

  // Step 2: Justification
  const renderStep2 = () => (
    <div className="form-step">
      <Title level={4}>Justification & Purpose</Title>
      <Text type="secondary">Explain why you need this asset</Text>
      <Divider />

      <Form.Item
        name="purpose"
        label="Purpose (Optional)"
        rules={[
          { max: 500, message: 'Purpose must not exceed 500 characters' }
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Briefly describe what you will use this asset for..."
          showCount
          maxLength={500}
        />
      </Form.Item>

      <Form.Item
        name="justification"
        label="Business Justification (Optional)"
        rules={[
          { max: 1000, message: 'Justification must not exceed 1000 characters' }
        ]}
        help="Explain how this asset will benefit your work and the organization"
      >
        <TextArea
          rows={6}
          placeholder="Provide detailed justification including:\n- How this asset will improve your productivity\n- Business impact and value\n- Why existing resources are insufficient\n- Any project or deadline dependencies"
          showCount
          maxLength={1000}
        />
      </Form.Item>

      <Alert
        message="Approval Process"
        description="Your requisition will be reviewed by your Department Head, followed by IT Head approval. Providing clear justification helps expedite the approval process."
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </div>
  );

  // Step 3: Review
  const renderStep3 = () => {
    const allData = { ...formData, ...form.getFieldsValue() };

    const selectedCategory = categories.find(c => c.id === allData.asset_category_id);
    const selectedSubcategory = subcategories.find(sc => sc.id === allData.product_type_id);

    const urgencyColors = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
      critical: 'red'
    };

    return (
      <div className="form-step">
        <Title level={4}>Review Your Requisition</Title>
        <Text type="secondary">Please review all details before submitting</Text>
        <Divider />

        <Card title="Asset Details" className="review-section">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text type="secondary">Category:</Text>
              <div><Text strong>{selectedCategory?.name || 'N/A'}</Text></div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Subcategory:</Text>
              <div><Text strong>{selectedSubcategory?.name || 'N/A'}</Text></div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Quantity:</Text>
              <div><Text strong>{allData.quantity || 1}</Text></div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Urgency:</Text>
              <div>
                <span
                  className="urgency-badge"
                  style={{
                    backgroundColor: urgencyColors[allData.urgency],
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'capitalize'
                  }}
                >
                  {allData.urgency}
                </span>
              </div>
            </Col>
            <Col span={12}>
              <Text type="secondary">Required By:</Text>
              <div>
                <Text strong>
                  {allData.required_by_date
                    ? allData.required_by_date.format('YYYY-MM-DD')
                    : 'Not specified'}
                </Text>
              </div>
            </Col>
            {allData.specifications && (
              <Col span={24}>
                <Text type="secondary">Specifications:</Text>
                <div><Text>{allData.specifications}</Text></div>
              </Col>
            )}
          </Row>
        </Card>

        {(allData.purpose || allData.justification) && (
          <Card title="Purpose & Justification" className="review-section" style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              {allData.purpose && (
                <Col span={24}>
                  <Text type="secondary">Purpose:</Text>
                  <div><Text>{allData.purpose}</Text></div>
                </Col>
              )}
              {allData.justification && (
                <Col span={24}>
                  <Text type="secondary">Justification:</Text>
                  <div><Text>{allData.justification}</Text></div>
                </Col>
              )}
            </Row>
          </Card>
        )}

        <Alert
          message="Ready to Submit"
          description="Once submitted, your requisition will be sent to your Department Head for approval. You will be notified of any updates."
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginTop: 16 }}
        />
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <div className="new-requisition-page">
      <div className="page-header">
        <div>
          <h2>New Asset Requisition</h2>
          <p className="page-description">Request a new asset for your work</p>
        </div>
      </div>

      <Card>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            quantity: 1,
            urgency: 'medium'
          }}
        >
          {renderStepContent()}

          <Divider />

          <div className="form-actions">
            <Space>
              <Button onClick={handleCancel}>
                Cancel
              </Button>

              {currentStep > 0 && (
                <Button icon={<ArrowLeftOutlined />} onClick={handlePrevious}>
                  Previous
                </Button>
              )}

              {currentStep < steps.length - 1 && (
                <Button type="primary" icon={<ArrowRightOutlined />} onClick={handleNext}>
                  Next
                </Button>
              )}

              {currentStep === steps.length - 1 && (
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                >
                  Submit Requisition
                </Button>
              )}
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default NewRequisition;
