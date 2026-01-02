/**
 * Reopen Ticket Modal
 * Allows coordinators to reopen a closed ticket within the configured time window
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Alert,
  Typography,
  Descriptions,
  Tag,
  Spin,
  Timeline,
  message
} from 'antd';
import {
  ReloadOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import ticketService from '../../../services/ticket';
import { formatDateTime } from '../../../utils/dateUtils';

const { TextArea } = Input;
const { Text, Title } = Typography;

const ReopenTicketModal = ({ visible, ticket, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [eligibility, setEligibility] = useState(null);
  const [reopenHistory, setReopenHistory] = useState([]);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (visible && ticket) {
      form.resetFields();
      checkReopenEligibility();
      fetchReopenHistory();
      fetchConfig();
    }
  }, [visible, ticket]);

  const checkReopenEligibility = async () => {
    setCheckingEligibility(true);
    try {
      const response = await ticketService.canReopenTicket(ticket.ticket_id);
      setEligibility(response.data?.data || response.data);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setEligibility({ canReopen: false, reason: 'Failed to check eligibility' });
    } finally {
      setCheckingEligibility(false);
    }
  };

  const fetchReopenHistory = async () => {
    try {
      const response = await ticketService.getReopenHistory(ticket.ticket_id);
      setReopenHistory(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching reopen history:', error);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await ticketService.getReopenConfig();
      setConfig(response.data?.data || response.data);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await ticketService.reopenTicket(ticket.ticket_id, values.reopen_reason);

      message.success('Ticket reopened successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error reopening ticket:', error);
      message.error(error.response?.data?.message || error.message || 'Failed to reopen ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <span>
          <ReloadOutlined className="mr-2" />
          Reopen Ticket
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
    >
      {checkingEligibility ? (
        <div className="text-center py-8">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">Checking reopen eligibility...</p>
        </div>
      ) : !eligibility?.canReopen ? (
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message="Cannot Reopen Ticket"
          description={eligibility?.reason || 'This ticket cannot be reopened.'}
          className="mb-4"
        />
      ) : (
        <>
          {/* Ticket Info */}
          <Descriptions size="small" bordered column={1} className="mb-4">
            <Descriptions.Item label="Ticket Number">
              <Text strong>{ticket?.ticket_number}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Title">
              {ticket?.title}
            </Descriptions.Item>
            <Descriptions.Item label="Closed At">
              {formatDateTime(ticket?.closed_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Times Reopened">
              <Tag color={ticket?.reopen_count > 0 ? 'orange' : 'green'}>
                {ticket?.reopen_count || 0} / {eligibility?.ticket?.max_reopen_count || config?.max_reopen_count || 3}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          {/* Eligibility Info */}
          <Alert
            type="info"
            showIcon
            icon={<ClockCircleOutlined />}
            message="Reopen Window"
            description={
              <div>
                <p>
                  <strong>{eligibility?.remainingReopens}</strong> reopen(s) remaining
                </p>
                <p>
                  <strong>{eligibility?.daysRemaining}</strong> day(s) left in reopen window
                </p>
              </div>
            }
            className="mb-4"
          />

          {/* Reopen History */}
          {reopenHistory.length > 0 && (
            <div className="mb-4">
              <Title level={5}>
                <HistoryOutlined className="mr-2" />
                Reopen History
              </Title>
              <Timeline
                items={reopenHistory.map((item, index) => ({
                  color: 'orange',
                  children: (
                    <div key={index}>
                      <Text strong>Reopen #{item.reopen_number}</Text>
                      <br />
                      <Text type="secondary" className="text-xs">
                        {formatDateTime(item.reopened_at)} by {item.reopened_by_name}
                      </Text>
                      <br />
                      <Text className="text-sm">{item.reopen_reason}</Text>
                    </div>
                  )
                }))}
              />
            </div>
          )}

          {/* Reopen Form */}
          <Form form={form} layout="vertical">
            <Form.Item
              name="reopen_reason"
              label="Reason for Reopening"
              rules={[
                {
                  required: config?.require_reopen_reason !== false,
                  message: 'Please provide a reason for reopening'
                },
                {
                  min: 10,
                  message: 'Reason must be at least 10 characters'
                }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Explain why this ticket needs to be reopened..."
                maxLength={1000}
                showCount
              />
            </Form.Item>

            <Alert
              type="warning"
              showIcon
              message="Important"
              description={
                <ul className="mb-0 pl-4">
                  <li>Reopening will set the ticket status back to &quot;In Progress&quot;</li>
                  <li>The assigned engineer will be notified</li>
                  {ticket?.service_type === 'repair' && (
                    <li>Service report will be set to draft for engineer to update</li>
                  )}
                </ul>
              }
              className="mb-4"
            />

            <div className="flex justify-end gap-2">
              <Button onClick={onClose}>Cancel</Button>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleSubmit}
                loading={loading}
              >
                Reopen Ticket
              </Button>
            </div>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default ReopenTicketModal;
