import React from 'react'
import { Form, Card, Space, Divider } from 'antd'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Button from './Button'
import LoadingSpinner from './LoadingSpinner'

const FormWrapper = ({
  children,
  title,
  subtitle,
  onFinish,
  onFinishFailed,
  form,
  layout = 'vertical',
  size = 'default',
  disabled = false,
  loading = false,
  initialValues,
  preserve = true,
  requiredMark = true,
  colon = true,
  hideRequiredMark = false,
  scrollToFirstError = true,
  validateTrigger = 'onChange',
  className,
  cardClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  showFooter = true,
  submitText = 'Submit',
  cancelText = 'Cancel',
  submitButtonProps = {},
  cancelButtonProps = {},
  onCancel,
  showCancel = false,
  footerAlign = 'right',
  footerExtra,
  bordered = true,
  ...rest
}) => {
  const formClass = classNames('form-wrapper', className)
  const cardClass = classNames('form-card', cardClassName)
  const headerClass = classNames('form-header', headerClassName)
  const bodyClass = classNames('form-body', bodyClassName)
  const footerClass = classNames('form-footer', footerClassName)

  const handleFinish = (values) => {
    if (onFinish) {
      onFinish(values)
    }
  }

  const handleFinishFailed = (errorInfo) => {
    if (onFinishFailed) {
      onFinishFailed(errorInfo)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  const renderHeader = () => {
    if (!title && !subtitle) return null

    return (
      <div className={headerClass}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600 mb-0">
            {subtitle}
          </p>
        )}
      </div>
    )
  }

  const renderFooter = () => {
    if (!showFooter) return null

    return (
      <>
        <Divider className="mt-6 mb-4" />
        <div className={classNames(
          'flex',
          {
            'justify-end': footerAlign === 'right',
            'justify-start': footerAlign === 'left',
            'justify-center': footerAlign === 'center',
            'justify-between': footerAlign === 'between'
          },
          footerClass
        )}>
          <Space>
            {footerExtra}
            {showCancel && (
              <Button
                onClick={handleCancel}
                disabled={loading}
                {...cancelButtonProps}
              >
                {cancelText}
              </Button>
            )}
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={disabled}
              {...submitButtonProps}
            >
              {submitText}
            </Button>
          </Space>
        </div>
      </>
    )
  }

  const formContent = (
    <Form
      form={form}
      layout={layout}
      size={size}
      disabled={disabled || loading}
      initialValues={initialValues}
      onFinish={handleFinish}
      onFinishFailed={handleFinishFailed}
      preserve={preserve}
      requiredMark={requiredMark && !hideRequiredMark}
      colon={colon}
      scrollToFirstError={scrollToFirstError}
      validateTrigger={validateTrigger}
      className={formClass}
      {...rest}
    >
      <LoadingSpinner spinning={loading}>
        <div className={bodyClass}>
          {children}
        </div>
        {renderFooter()}
      </LoadingSpinner>
    </Form>
  )

  if (bordered) {
    return (
      <Card className={cardClass} bordered>
        {renderHeader()}
        {formContent}
      </Card>
    )
  }

  return (
    <div className={cardClass}>
      {renderHeader()}
      {formContent}
    </div>
  )
}

FormWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onFinish: PropTypes.func,
  onFinishFailed: PropTypes.func,
  form: PropTypes.object,
  layout: PropTypes.oneOf(['horizontal', 'vertical', 'inline']),
  size: PropTypes.oneOf(['small', 'default', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  initialValues: PropTypes.object,
  preserve: PropTypes.bool,
  requiredMark: PropTypes.bool,
  colon: PropTypes.bool,
  hideRequiredMark: PropTypes.bool,
  scrollToFirstError: PropTypes.bool,
  validateTrigger: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]),
  className: PropTypes.string,
  cardClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  showFooter: PropTypes.bool,
  submitText: PropTypes.string,
  cancelText: PropTypes.string,
  submitButtonProps: PropTypes.object,
  cancelButtonProps: PropTypes.object,
  onCancel: PropTypes.func,
  showCancel: PropTypes.bool,
  footerAlign: PropTypes.oneOf(['left', 'center', 'right', 'between']),
  footerExtra: PropTypes.node,
  bordered: PropTypes.bool
}

export default FormWrapper