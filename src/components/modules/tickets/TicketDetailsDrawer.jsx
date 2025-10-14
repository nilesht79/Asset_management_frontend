import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Card,
  Tag,
  Row,
  Col,
  Descriptions,
  Timeline,
  Input,
  Button,
  Avatar,
  Divider,
  message,
  Empty,
  Spin
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  SendOutlined,
  CommentOutlined
} from '@ant-design/icons';
import ticketService from '../../../services/ticket';
import { useSelector } from 'react-redux';

const { TextArea } = Input;

const TicketDetailsDrawer = ({ visible, ticket, onClose, onUpdate }) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (visible && ticket) {
      fetchComments();
    }
  }, [visible, ticket]);

  const fetchComments = async () => {
    if (!ticket) return;

    setLoadingComments(true);
    try {
      const response = await ticketService.getComments(ticket.ticket_id);
      const data = response.data.data || response.data;
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !ticket) return;

    setSubmittingComment(true);
    try {
      await ticketService.addComment(ticket.ticket_id, {
        comment_text: newComment,
        is_internal: false
      });
      setNewComment('');
      await fetchComments();
      message.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      message.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!ticket) return null;

  return (
    <Drawer
      title="Ticket Details"
      placement="right"
      onClose={onClose}
      open={visible}
      width={700}
      destroyOnClose
    >
      <div className="space-y-4">
        {/* Ticket Header */}
        <Card size="small">
          <div className="flex justify-between items-start mb-3">
            <div>
              <Tag color="blue" className="text-base px-3 py-1">
                {ticket.ticket_number}
              </Tag>
              <div className="mt-2 flex gap-2">
                <Tag color={ticketService.getStatusColor(ticket.status)}>
                  {ticketService.getStatusDisplayName(ticket.status)}
                </Tag>
                <Tag color={ticketService.getPriorityColor(ticket.priority)}>
                  {ticketService.getPriorityDisplayName(ticket.priority)}
                </Tag>
                {ticket.category && (
                  <Tag>{ticket.category}</Tag>
                )}
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>
                <ClockCircleOutlined /> Created
              </div>
              <div>{ticketService.formatDate(ticket.created_at)}</div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-2">{ticket.title}</h3>
          <p className="text-gray-700">{ticket.description}</p>
        </Card>

        {/* Ticket Information */}
        <Card title="Ticket Information" size="small">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Created For">
              <div className="flex items-center space-x-2">
                <Avatar size="small" icon={<UserOutlined />} />
                <div>
                  <div className="font-medium">{ticket.created_by_user_name}</div>
                  <div className="text-xs text-gray-500">
                    {ticket.created_by_user_email}
                  </div>
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Created By">
              <div className="flex items-center space-x-2">
                <Avatar size="small" icon={<UserOutlined />} />
                <div>
                  <div className="font-medium">{ticket.coordinator_name}</div>
                  <div className="text-xs text-gray-500">
                    {ticket.coordinator_email}
                  </div>
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Assigned To">
              {ticket.engineer_name ? (
                <div className="flex items-center space-x-2">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <div>
                    <div className="font-medium">{ticket.engineer_name}</div>
                    <div className="text-xs text-gray-500">
                      {ticket.engineer_email}
                    </div>
                  </div>
                </div>
              ) : (
                <Tag color="default">Unassigned</Tag>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Department">
              {ticket.department_name || 'N/A'}
            </Descriptions.Item>

            <Descriptions.Item label="Location">
              {ticket.location_name || 'N/A'}
            </Descriptions.Item>

            {ticket.due_date && (
              <Descriptions.Item label="Due Date">
                {ticketService.formatDate(ticket.due_date)}
              </Descriptions.Item>
            )}

            {ticket.resolved_at && (
              <Descriptions.Item label="Resolved At">
                {ticketService.formatDate(ticket.resolved_at)}
              </Descriptions.Item>
            )}

            {ticket.closed_at && (
              <Descriptions.Item label="Closed At">
                {ticketService.formatDate(ticket.closed_at)}
              </Descriptions.Item>
            )}

            {ticket.resolution_notes && (
              <Descriptions.Item label="Resolution Notes">
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  {ticket.resolution_notes}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Comments Section */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <CommentOutlined />
              <span>Comments & Activity</span>
              <Tag>{comments.length}</Tag>
            </div>
          }
          size="small"
        >
          {loadingComments ? (
            <div className="text-center py-4">
              <Spin />
            </div>
          ) : comments.length > 0 ? (
            <Timeline
              items={comments.map((comment) => ({
                children: (
                  <div key={comment.comment_id}>
                    <div className="flex items-start space-x-2">
                      <Avatar size="small" icon={<UserOutlined />} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{comment.user_name}</span>
                          <Tag size="small" color="blue">
                            {comment.user_role}
                          </Tag>
                          <span className="text-xs text-gray-500">
                            {ticketService.formatRelativeTime(comment.created_at)}
                          </span>
                        </div>
                        <div className="mt-1 text-gray-700">
                          {comment.comment_text}
                        </div>
                        {comment.is_internal && (
                          <Tag size="small" color="orange" className="mt-1">
                            Internal Note
                          </Tag>
                        )}
                      </div>
                    </div>
                  </div>
                ),
                color: comment.is_internal ? 'orange' : 'blue'
              }))}
            />
          ) : (
            <Empty
              description="No comments yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}

          <Divider />

          {/* Add Comment */}
          {ticket.status !== 'closed' && (
            <div className="space-y-2">
              <TextArea
                rows={3}
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={500}
              />
              <div className="flex justify-end">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleAddComment}
                  loading={submittingComment}
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </Button>
              </div>
            </div>
          )}

          {ticket.status === 'closed' && (
            <div className="text-center text-gray-500 text-sm py-2">
              This ticket is closed. Comments are disabled.
            </div>
          )}
        </Card>
      </div>
    </Drawer>
  );
};

export default TicketDetailsDrawer;
