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
  Spin,
  Modal
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  SendOutlined,
  CommentOutlined,
  LinkOutlined,
  EditOutlined
} from '@ant-design/icons';
import ticketService from '../../../services/ticket';
import { useSelector } from 'react-redux';
import LinkedAssets from './LinkedAssets';
import LinkedSoftware from './LinkedSoftware';
import EditTicketModal from './EditTicketModal';
import AssetRepairHistory from '../assets/AssetRepairHistory';
import { SlaStatusBadge } from '../sla';

const { TextArea } = Input;

const TicketDetailsDrawer = ({ visible, ticket, onClose, onUpdate }) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [closeRequestHistory, setCloseRequestHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [repairHistoryModal, setRepairHistoryModal] = useState({ visible: false, assetId: null, assetTag: null });
  const [editModalVisible, setEditModalVisible] = useState(false);

  const { user: currentUser } = useSelector((state) => state.auth);

  // Check if user can edit linked assets (coordinators, admins, or assigned engineer)
  const canEditLinkedAssets = currentUser && (
    currentUser.role === 'admin' ||
    currentUser.role === 'coordinator' ||
    (currentUser.role === 'engineer' && ticket?.assigned_to_engineer_id === currentUser.user_id)
  ) && ticket?.status !== 'closed';

  // Check if user can edit ticket (coordinators and admins only, not closed tickets)
  const canEditTicket = currentUser && (
    ['coordinator', 'admin', 'superadmin', 'it_head', 'department_coordinator'].includes(currentUser.role)
  ) && ticket?.status !== 'closed' && ticket?.status !== 'cancelled';

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    if (onUpdate) {
      onUpdate();
    }
    message.success('Ticket updated successfully');
  };

  useEffect(() => {
    if (visible && ticket) {
      fetchComments();
      fetchCloseRequestHistory();
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

  const fetchCloseRequestHistory = async () => {
    if (!ticket) return;

    setLoadingHistory(true);
    try {
      const response = await ticketService.getCloseRequestHistory(ticket.ticket_id);
      const data = response.data.data || response.data;
      setCloseRequestHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch close request history:', error);
    } finally {
      setLoadingHistory(false);
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

  const handleViewRepairHistory = (assetId, assetTag) => {
    setRepairHistoryModal({ visible: true, assetId, assetTag });
  };

  const handleCloseRepairHistory = () => {
    setRepairHistoryModal({ visible: false, assetId: null, assetTag: null });
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
      extra={
        canEditTicket && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setEditModalVisible(true)}
          >
            Edit Ticket
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {/* Ticket Header */}
        <Card size="small">
          <div className="flex justify-between items-start mb-3">
            <div>
              <Tag color="blue" className="text-base px-3 py-1">
                {ticket.ticket_number}
              </Tag>
              <div className="mt-2 flex gap-2 flex-wrap">
                <Tag color={ticketService.getStatusColor(ticket.status)}>
                  {ticketService.getStatusDisplayName(ticket.status)}
                </Tag>
                <Tag color={ticketService.getPriorityColor(ticket.priority)}>
                  {ticketService.getPriorityDisplayName(ticket.priority)}
                </Tag>
                {ticket.category && (
                  <Tag>{ticket.category}</Tag>
                )}
                {ticket.status !== 'closed' && ticket.status !== 'cancelled' && (
                  <SlaStatusBadge ticketId={ticket.ticket_id} compact />
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

        {/* SLA Status - Show for all tickets (active and closed) */}
        <Card
          title={
            <div className="flex items-center space-x-2">
              <ClockCircleOutlined />
              <span>SLA Status</span>
              {(ticket.status === 'closed' || ticket.status === 'cancelled') && (
                <Tag color="default" style={{ marginLeft: 8 }}>Final</Tag>
              )}
            </div>
          }
          size="small"
        >
          <SlaStatusBadge
            ticketId={ticket.ticket_id}
            inline
          />
        </Card>

        {/* Ticket Information */}
        <Card title="Ticket Information" size="small">
          <Descriptions column={1} size="small">
            {ticket.is_guest ? (
              <>
                <Descriptions.Item label="Ticket Type">
                  <Tag color="purple" icon={<UserOutlined />}>GUEST TICKET</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Guest Name">
                  <div className="font-medium">{ticket.guest_name}</div>
                </Descriptions.Item>

                <Descriptions.Item label="Guest Email">
                  <div className="text-blue-600">{ticket.guest_email}</div>
                </Descriptions.Item>

                <Descriptions.Item label="Guest Phone">
                  {ticket.guest_phone || 'N/A'}
                </Descriptions.Item>

                <Descriptions.Item label="Created By">
                  <div className="flex items-center space-x-2">
                    <Avatar size="small" icon={<UserOutlined />} />
                    <div>
                      <div className="font-medium">{ticket.coordinator_name || 'System'}</div>
                      <div className="text-xs text-gray-500">
                        {ticket.coordinator_email || 'N/A'}
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
              </>
            ) : (
              <>
                <Descriptions.Item label="Created For">
                  <div className="flex items-center space-x-2">
                    <Avatar size="small" icon={<UserOutlined />} />
                    <div>
                      <div className="font-medium">{ticket.created_by_user_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">
                        {ticket.created_by_user_email || ''}
                      </div>
                    </div>
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Created By">
                  <div className="flex items-center space-x-2">
                    <Avatar size="small" icon={<UserOutlined />} />
                    <div>
                      <div className="font-medium">
                        {ticket.coordinator_name || ticket.created_by_user_name || 'Self'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ticket.coordinator_email || (ticket.coordinator_name ? '' : ticket.created_by_user_email) || ''}
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
              </>
            )}

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

        {/* Linked Assets Section - Show for Hardware category or when no category */}
        {(!ticket.category || ticket.category === 'Hardware') && (
          <LinkedAssets
            ticketId={ticket.ticket_id}
            canEdit={canEditLinkedAssets}
            showRepairHistory={true}
            onViewRepairHistory={(assetId) => {
              // Find the asset tag from the linked assets if available
              handleViewRepairHistory(assetId, null);
            }}
          />
        )}

        {/* Linked Software Section - Show for Software category */}
        {ticket.category === 'Software' && (
          <LinkedSoftware
            ticketId={ticket.ticket_id}
            canEdit={canEditLinkedAssets}
          />
        )}

        {/* Close Request History Section */}
        {closeRequestHistory.length > 0 && (
          <Card
            title={
              <div className="flex items-center space-x-2">
                <SendOutlined />
                <span>Close Request History</span>
                <Tag>{closeRequestHistory.length}</Tag>
              </div>
            }
            size="small"
          >
            {loadingHistory ? (
              <div className="text-center py-4">
                <Spin />
              </div>
            ) : (
              <Timeline
                items={closeRequestHistory.map((request) => ({
                  children: (
                    <div key={request.close_request_id}>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Avatar size="small" icon={<UserOutlined />} />
                          <div>
                            <span className="font-medium">{request.engineer_name}</span>
                            <Tag size="small" color="blue" className="ml-2">
                              Engineer
                            </Tag>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <div className="text-xs text-gray-500 mb-1">Resolution Notes:</div>
                          <div className="text-gray-700">{request.request_notes}</div>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-500">Status:</span>
                          <Tag
                            color={
                              request.request_status === 'approved'
                                ? 'green'
                                : request.request_status === 'rejected'
                                  ? 'red'
                                  : 'gold'
                            }
                          >
                            {request.request_status.toUpperCase()}
                          </Tag>
                          <span className="text-xs text-gray-400">
                            {ticketService.formatRelativeTime(request.created_at)}
                          </span>
                        </div>

                        {request.request_status !== 'pending' && (
                          <div className="mt-2 pl-4 border-l-2 border-gray-300">
                            <div className="flex items-center space-x-2 mb-2">
                              <Avatar size="small" icon={<UserOutlined />} />
                              <div>
                                <span className="font-medium">{request.coordinator_name}</span>
                                <Tag size="small" color="purple" className="ml-2">
                                  Coordinator
                                </Tag>
                              </div>
                            </div>

                            {request.review_notes && (
                              <div className={`p-3 rounded border ${
                                request.request_status === 'approved'
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-red-50 border-red-200'
                              }`}>
                                <div className="text-xs text-gray-500 mb-1">Coordinator Feedback:</div>
                                <div className="text-gray-700">{request.review_notes}</div>
                              </div>
                            )}

                            <div className="text-xs text-gray-400 mt-2">
                              Reviewed {ticketService.formatRelativeTime(request.reviewed_at)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                  color: request.request_status === 'approved'
                    ? 'green'
                    : request.request_status === 'rejected'
                      ? 'red'
                      : 'blue'
                }))}
              />
            )}
          </Card>
        )}

        {/* Pending Close Request Alert */}
        {ticket.status === 'pending_closure' && (
          <Card size="small" className="bg-cyan-50 border-cyan-200">
            <div className="flex items-center space-x-2">
              <ClockCircleOutlined className="text-cyan-600 text-lg" />
              <div>
                <div className="font-semibold text-cyan-900">Close Request Pending</div>
                <div className="text-sm text-cyan-700">
                  This ticket has a pending close request awaiting coordinator approval
                </div>
              </div>
            </div>
          </Card>
        )}

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

      {/* Asset Repair History Modal */}
      <Modal
        title="Asset Repair History"
        open={repairHistoryModal.visible}
        onCancel={handleCloseRepairHistory}
        footer={null}
        width={950}
        destroyOnClose
        zIndex={1100}
      >
        {repairHistoryModal.visible && repairHistoryModal.assetId ? (
          <AssetRepairHistory
            assetId={repairHistoryModal.assetId}
            assetTag={repairHistoryModal.assetTag}
            viewMode="table"
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin tip="Loading..." />
          </div>
        )}
      </Modal>

      {/* Edit Ticket Modal */}
      <EditTicketModal
        visible={editModalVisible}
        ticket={ticket}
        onClose={() => setEditModalVisible(false)}
        onSuccess={handleEditSuccess}
        currentUser={currentUser}
      />
    </Drawer>
  );
};

export default TicketDetailsDrawer;
