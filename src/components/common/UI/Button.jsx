import React from 'react'
import { Button as AntButton } from 'antd'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const Button = ({
  children,
  type = 'default',
  size = 'middle',
  variant = 'solid',
  danger = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'start',
  block = false,
  ghost = false,
  className,
  onClick,
  htmlType = 'button',
  ...rest
}) => {
  const buttonClass = classNames(
    'custom-button',
    {
      [`button-${variant}`]: variant,
      'button-danger': danger && !type.includes('danger'),
      'button-block': block,
      'button-ghost': ghost
    },
    className
  )

  return (
    <AntButton
      type={type}
      size={size}
      danger={danger}
      loading={loading}
      disabled={disabled}
      icon={icon}
      iconPosition={iconPosition}
      block={block}
      ghost={ghost}
      className={buttonClass}
      onClick={onClick}
      htmlType={htmlType}
      {...rest}
    >
      {children}
    </AntButton>
  )
}

Button.propTypes = {
  children: PropTypes.node,
  type: PropTypes.oneOf(['primary', 'default', 'dashed', 'link', 'text']),
  size: PropTypes.oneOf(['large', 'middle', 'small']),
  variant: PropTypes.oneOf(['solid', 'outlined', 'filled']),
  danger: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['start', 'end']),
  block: PropTypes.bool,
  ghost: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  htmlType: PropTypes.oneOf(['button', 'submit', 'reset'])
}

export default Button