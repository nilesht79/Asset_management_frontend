import React from 'react'
import { Modal as AntModal } from 'antd'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const Modal = ({
  children,
  title,
  open = false,
  onOk,
  onCancel,
  okText = 'OK',
  cancelText = 'Cancel',
  confirmLoading = false,
  width = 520,
  centered = false,
  closable = true,
  maskClosable = true,
  keyboard = true,
  okType = 'primary',
  cancelButtonProps,
  okButtonProps,
  destroyOnClose = false,
  forceRender = false,
  getContainer,
  mask = true,
  maskStyle,
  style,
  wrapClassName,
  className,
  footer,
  afterClose,
  bodyStyle,
  modalRender,
  focusTriggerAfterClose = true,
  zIndex,
  ...rest
}) => {
  const modalClass = classNames('custom-modal', className)

  return (
    <AntModal
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={confirmLoading}
      width={width}
      centered={centered}
      closable={closable}
      maskClosable={maskClosable}
      keyboard={keyboard}
      okType={okType}
      cancelButtonProps={cancelButtonProps}
      okButtonProps={okButtonProps}
      destroyOnClose={destroyOnClose}
      forceRender={forceRender}
      getContainer={getContainer}
      mask={mask}
      maskStyle={maskStyle}
      style={style}
      wrapClassName={wrapClassName}
      className={modalClass}
      footer={footer}
      afterClose={afterClose}
      bodyStyle={bodyStyle}
      modalRender={modalRender}
      focusTriggerAfterClose={focusTriggerAfterClose}
      zIndex={zIndex}
      {...rest}
    >
      {children}
    </AntModal>
  )
}

Modal.propTypes = {
  children: PropTypes.node,
  title: PropTypes.node,
  open: PropTypes.bool,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmLoading: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  centered: PropTypes.bool,
  closable: PropTypes.bool,
  maskClosable: PropTypes.bool,
  keyboard: PropTypes.bool,
  okType: PropTypes.string,
  cancelButtonProps: PropTypes.object,
  okButtonProps: PropTypes.object,
  destroyOnClose: PropTypes.bool,
  forceRender: PropTypes.bool,
  getContainer: PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
  mask: PropTypes.bool,
  maskStyle: PropTypes.object,
  style: PropTypes.object,
  wrapClassName: PropTypes.string,
  className: PropTypes.string,
  footer: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
  afterClose: PropTypes.func,
  bodyStyle: PropTypes.object,
  modalRender: PropTypes.func,
  focusTriggerAfterClose: PropTypes.bool,
  zIndex: PropTypes.number
}

Modal.confirm = AntModal.confirm
Modal.info = AntModal.info
Modal.success = AntModal.success
Modal.error = AntModal.error
Modal.warning = AntModal.warning
Modal.warn = AntModal.warn
Modal.destroyAll = AntModal.destroyAll
Modal.useModal = AntModal.useModal

export default Modal