import React, { forwardRef } from 'react'
import { Input as AntInput, Form } from 'antd'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const { TextArea, Search, Password } = AntInput

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  size = 'middle',
  disabled = false,
  readOnly = false,
  allowClear = false,
  maxLength,
  showCount = false,
  prefix,
  suffix,
  addonBefore,
  addonAfter,
  className,
  inputClassName,
  error,
  required = false,
  rules = [],
  tooltip,
  help,
  validateStatus,
  hasFeedback = false,
  onChange,
  onBlur,
  onFocus,
  onPressEnter,
  ...rest
}, ref) => {
  const inputClass = classNames(
    'custom-input',
    {
      'input-error': error || validateStatus === 'error',
      'input-warning': validateStatus === 'warning',
      'input-success': validateStatus === 'success',
      'input-validating': validateStatus === 'validating'
    },
    inputClassName
  )

  const formItemClass = classNames('custom-form-item', className)

  const finalRules = [
    ...(required ? [{ required: true, message: `${label || name} is required` }] : []),
    ...rules
  ]

  const renderInput = () => {
    const commonProps = {
      ref,
      placeholder,
      value,
      defaultValue,
      size,
      disabled,
      readOnly,
      allowClear,
      maxLength,
      showCount,
      prefix,
      suffix,
      addonBefore,
      addonAfter,
      className: inputClass,
      onChange,
      onBlur,
      onFocus,
      onPressEnter,
      ...rest
    }

    switch (type) {
      case 'textarea':
        return <TextArea {...commonProps} />
      case 'search':
        return <Search {...commonProps} />
      case 'password':
        return <Password {...commonProps} />
      default:
        return <AntInput {...commonProps} />
    }
  }

  if (label || name) {
    return (
      <Form.Item
        label={label}
        name={name}
        rules={finalRules}
        tooltip={tooltip}
        help={help || error}
        validateStatus={validateStatus || (error ? 'error' : undefined)}
        hasFeedback={hasFeedback}
        className={formItemClass}
      >
        {renderInput()}
      </Form.Item>
    )
  }

  return renderInput()
})

Input.displayName = 'Input'

Input.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.oneOf(['text', 'textarea', 'search', 'password', 'email', 'number', 'tel', 'url']),
  placeholder: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  size: PropTypes.oneOf(['large', 'middle', 'small']),
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  allowClear: PropTypes.bool,
  maxLength: PropTypes.number,
  showCount: PropTypes.bool,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  addonBefore: PropTypes.node,
  addonAfter: PropTypes.node,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  rules: PropTypes.array,
  tooltip: PropTypes.string,
  help: PropTypes.string,
  validateStatus: PropTypes.oneOf(['success', 'warning', 'error', 'validating']),
  hasFeedback: PropTypes.bool,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  onPressEnter: PropTypes.func
}

export default Input