import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Tag,
  Descriptions,
  Row,
  Col,
  Spin,
  Alert,
  Modal,
  Form,
  Input,
  message,
  Divider,
  Typography,
  Empty
} from 'antd';
import {
  ArrowLeftOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
// import {
//   fetchRequisitionById,
//   cancelRequisition,
//   confirmDelivery,
//   clearCurrentRequisition
// } from '../store/slices/requisitionSlice';
import {
  fetchRequisitionById,
  cancelRequisition,
  confirmDelivery,
  clearCurrentRequisition,
  addRequisitionRemark
} from '../store/slices/requisitionSlice';
import RequisitionTimeline from '../components/requisitions/RequisitionTimeline';
import { formatDateOnly, formatDateTime } from '../utils/dateUtils';
import './RequisitionDetails.css';

const { TextArea } = Input;
const { Title, Text } = Typography;

const RequisitionDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cancelForm] = Form.useForm();

  const { currentRequisition: requisition, loading } = useSelector((state) => state.requisitions);
  const { user } = useSelector((state) => state.auth);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Remark states
const [remarkText, setRemarkText] = useState('');
const [remarkLoading, setRemarkLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchRequisitionById(id));
    }

    return () => {
      dispatch(clearCurrentRequisition());
    };
  }, [id, dispatch]);

  // Status configuration
  const statusConfig = {
    pending_dept_head: { label: 'Pending Department Head', color: 'orange', icon: <ClockCircleOutlined /> },
    approved_by_dept_head: { label: 'Approved by Dept Head', color: 'blue', icon: <CheckCircleOutlined /> },
    rejected_by_dept_head: { label: 'Rejected by Dept Head', color: 'red', icon: <CloseCircleOutlined /> },
    pending_it_head: { label: 'Pending IT Head', color: 'orange', icon: <ClockCircleOutlined /> },
    approved_by_it_head: { label: 'Approved by IT Head', color: 'blue', icon: <CheckCircleOutlined /> },
    rejected_by_it_head: { label: 'Rejected by IT Head', color: 'red', icon: <CloseCircleOutlined /> },
    pending_assignment: { label: 'Pending Assignment', color: 'purple', icon: <ClockCircleOutlined /> },
    assigned: { label: 'Asset Assigned', color: 'cyan', icon: <CheckCircleOutlined /> },
    pending_verification: { label: 'Pending Verification', color: 'gold', icon: <WarningOutlined /> },
    delivered: { label: 'Delivered', color: 'lime', icon: <CheckCircleOutlined /> },
    completed: { label: 'Completed', color: 'green', icon: <CheckCircleOutlined /> },
    cancelled: { label: 'Cancelled', color: 'default', icon: <StopOutlined /> }
  };

  const urgencyConfig = {
    low: { label: 'Low', color: 'green' },
    medium: { label: 'Medium', color: 'blue' },
    high: { label: 'High', color: 'orange' },
    critical: { label: 'Critical', color: 'red' }
  };

  // Employees can cancel only while pending dept head review
  // Once dept head approves and sends to IT head, cancellation is not allowed
  const canCancel = requisition && ['pending_dept_head'].includes(requisition.status);

  const handleBack = () => {
    // Role-based navigation
    // Coordinators, IT heads, and department heads go to "All Requisitions"
    // Regular employees go to "My Requisitions"
    if (['coordinator', 'it_head', 'department_head', 'admin', 'superadmin'].includes(user?.role)) {
      navigate('/requisitions/all-requisitions');
    } else {
      navigate('/requisitions/my-requisitions');
    }
  };

  const handleCancelClick = () => {
    setCancelModalVisible(true);
    cancelForm.resetFields();
  };

  const handleCancelSubmit = async () => {
    try {
      const values = await cancelForm.validateFields();
      setCancelLoading(true);

      await dispatch(cancelRequisition({
        id: requisition.requisition_id,
        cancellation_reason: values.cancellation_reason
      })).unwrap();

      message.success('Requisition cancelled successfully');
      setCancelModalVisible(false);
      cancelForm.resetFields();

      // Reload requisition details
      dispatch(fetchRequisitionById(id));
    } catch (error) {
      message.error(error.message || 'Failed to cancel requisition');
    } finally {
      setCancelLoading(false);
    }
  };

  
const handleRemarkSubmit = async () => {
  const remark = remarkText.trim();

  if (!remark) {
    message.warning('Please enter a remark');
    return;
  }

  if (remark.length > 2000) {
    message.warning('Remark cannot exceed 2000 characters');
    return;
  }

  try {
    setRemarkLoading(true);

    await dispatch(
      addRequisitionRemark({
        id: requisition.requisition_id,
        comments: remark
      })
    ).unwrap();

    message.success('Remark submitted successfully');

    setRemarkText('');

    // Refresh requisition and approval history
    await dispatch(fetchRequisitionById(id)).unwrap();

  } catch (error) {
    message.error(
      error?.message || 'Failed to submit remark'
    );
  } finally {
    setRemarkLoading(false);
  }
};


  const handleConfirmDelivery = async () => {
    Modal.confirm({
      title: 'Confirm Delivery',
      icon: <CheckCircleOutlined />,
      content: 'Please confirm that you have received the asset and it is in good condition.',
      okText: 'Confirm Receipt',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(confirmDelivery(requisition.requisition_id)).unwrap();
          message.success('Delivery confirmed successfully');
          dispatch(fetchRequisitionById(id));
        } catch (error) {
          message.error(error.message || 'Failed to confirm delivery');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="requisition-details-page">
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="Loading requisition details..." />
        </div>
      </div>
    );
  }

  if (!requisition) {
    return (
      <div className="requisition-details-page">
        <Card>
          <Empty
            description="Requisition not found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={handleBack}>
              Back to My Requisitions
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  const status = statusConfig[requisition.status] || statusConfig.pending_dept_head;
  const urgency = urgencyConfig[requisition.urgency] || urgencyConfig.medium;

  return (
    <div className="requisition-details-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Back
            </Button>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {requisition.requisition_number}
              </Title>
              <Space style={{ marginTop: 8 }}>
                <Tag icon={status.icon} color={status.color}>
                  {status.label}
                </Tag>
                <Tag color={urgency.color}>
                  {urgency.color === 'red' && <WarningOutlined />} {urgency.label} Priority
                </Tag>
              </Space>
            </div>
          </Space>
        </div>

        {canCancel && (
          <Button
            danger
            icon={<StopOutlined />}
            onClick={handleCancelClick}
          >
            Cancel Requisition
          </Button>
        )}

        {requisition.status === 'delivered' && !requisition.confirmed_by_employee && (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleConfirmDelivery}
          >
            Confirm Delivery
          </Button>
        )}
      </div>

      <Row gutter={[16, 16]}>
        {/* Left Column - Details */}
        <Col xs={24} lg={14}>
          {/* Rejection/Cancellation Alert */}
          {(requisition.status === 'rejected_by_dept_head' || requisition.status === 'rejected_by_it_head') && (
            <Alert
              message={`Rejected by ${requisition.status === 'rejected_by_dept_head' ? 'Department Head' : 'IT Head'}`}
              description={
                requisition.status === 'rejected_by_dept_head'
                  ? requisition.dept_head_comments
                  : requisition.it_head_comments
              }
              type="error"
              showIcon
              icon={<CloseCircleOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          {requisition.status === 'cancelled' && requisition.cancellation_reason && (
            <Alert
              message="Requisition Cancelled"
              description={requisition.cancellation_reason}
              type="warning"
              showIcon
              icon={<StopOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Basic Information */}
          <Card title="Requisition Information" style={{ marginBottom: 16 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Requisition Number">
                <Text strong>{requisition.requisition_number}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag icon={status.icon} color={status.color}>
                  {status.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Urgency">
                <Tag color={urgency.color}>
                  {urgency.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Requester">
                {requisition.requester_name || 'Unknown User'}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {requisition.department_name}
              </Descriptions.Item>
              <Descriptions.Item label="Created On">
                {formatDateTime(requisition.created_at)}
              </Descriptions.Item>
              {requisition.required_by_date && (
                <Descriptions.Item label="Required By">
                  <Text strong>{formatDateOnly(requisition.required_by_date)}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Asset Details */}
          <Card title="Asset Details" style={{ marginBottom: 16 }}>
            <Descriptions column={1} bordered size="small">
              {requisition.category_name && (
                <Descriptions.Item label="Category">
                  {requisition.category_name}
                </Descriptions.Item>
              )}
              {requisition.subcategory_name && (
                <Descriptions.Item label="Subcategory">
                  {requisition.subcategory_name}
                </Descriptions.Item>
              )}
              {requisition.product_name && (
                <Descriptions.Item label="Requested Product">
                  {requisition.product_name}
                  {requisition.product_model && ` - ${requisition.product_model}`}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Quantity">
                {requisition.quantity}
              </Descriptions.Item>
              {requisition.specifications && (
                <Descriptions.Item label="Specifications">
                  {requisition.specifications}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Purpose & Justification */}
          {/* <Card title="Purpose & Justification" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Purpose:</Text>
              <div style={{ marginTop: 8 }}>
                <Text>{requisition.purpose}</Text>
              </div>
            </div>
            <Divider />
            <div>
              <Text strong>Justification:</Text>
              <div style={{ marginTop: 8 }}>
                <Text>{requisition.justification}</Text>
              </div>
            </div>
          </Card> */}

          
{/* Remarks */}
<Card title="Remarks" style={{ marginBottom: 16 }}>

  {(() => {
    const remark = (requisition.approval_history || [])
      .find(item => item.action === 'remark_added');

    const allowedRoles = [
      'admin',
      'superadmin',
      'coordinator',
      'department_coordinator'
    ];

    const canAddRemark = allowedRoles.includes(
      String(user?.role || '').toLowerCase()
    );

    if (remark) {
      return (
        <div>
          <Tag color="success">Remark Submitted</Tag>

          <div style={{
            marginTop: 16,
            padding: 16,
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 8
          }}>
            <Space
              direction="vertical"
              size={8}
              style={{ width: '100%' }}
            >
              <Text strong>
                {remark.approver_name || 'Unknown User'}
              </Text>

              <Text type="secondary">
                {remark.approver_role}
              </Text>

              <Text style={{ whiteSpace: 'pre-wrap' }}>
                {remark.comments}
              </Text>

              <Text type="secondary" style={{ fontSize: 12 }}>
                {remark.action_timestamp
                  ? formatDateTime(remark.action_timestamp)
                  : ''}
              </Text>
            </Space>
          </div>
        </div>
      );
    }

    if (!canAddRemark) {
      return (
        <Empty
          description="No remark submitted yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <div>
        <Text type="secondary">
          Add your remark for this requisition.
        </Text>

        <TextArea
          rows={4}
          maxLength={2000}
          showCount
          value={remarkText}
          onChange={(e) => setRemarkText(e.target.value)}
          placeholder="Enter your remark here..."
          style={{ marginTop: 12 }}
          disabled={remarkLoading}
        />

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: 16
        }}>
          <Button
            type="primary"
            loading={remarkLoading}
            onClick={handleRemarkSubmit}
            disabled={!remarkText.trim()}
          >
            Submit Remark
          </Button>
        </div>
      </div>
    );
  })()}

</Card>


          {/* Assigned Asset (if available) */}
          {requisition.assigned_asset_tag && (
            <Card title="Assigned Asset" style={{ marginBottom: 16 }}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Asset Tag">
                  <Tag color="blue">{requisition.assigned_asset_tag}</Tag>
                </Descriptions.Item>
                {requisition.assigned_coordinator_id && (
                  <Descriptions.Item label="Assigned By">
                    Coordinator
                  </Descriptions.Item>
                )}
                {requisition.assignment_date && (
                  <Descriptions.Item label="Assignment Date">
                    {formatDateTime(requisition.assignment_date)}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>

        {/* Right Column - Timeline */}
        <Col xs={24} lg={10}>
          <Card title="Approval Timeline" className="timeline-card">
            <RequisitionTimeline
              requisition={requisition}
              approvalHistory={requisition.approval_history || []}
            />
          </Card>
        </Col>
      </Row>

      {/* Cancel Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            Cancel Requisition
          </Space>
        }
        open={cancelModalVisible}
        onCancel={() => {
          setCancelModalVisible(false);
          cancelForm.resetFields();
        }}
        onOk={handleCancelSubmit}
        confirmLoading={cancelLoading}
        okText="Cancel Requisition"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to cancel requisition{' '}
          <Tag color="blue">{requisition.requisition_number}</Tag>?
        </p>

        <Form form={cancelForm} layout="vertical">
          <Form.Item
            name="cancellation_reason"
            label="Cancellation Reason"
            rules={[
              { required: true, message: 'Please provide a reason for cancellation' },
              { min: 10, message: 'Reason must be at least 10 characters' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Please explain why you are cancelling this requisition..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RequisitionDetails;
