import React from 'react'
import { Spin, Space } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const LoadingSpinner = ({
  size = 'default',
  tip,
  spinning = true,
  delay = 0,
  children,
  indicator,
  wrapperClassName,
  className,
  style,
  centered = false,
  overlay = false,
  ...rest
}) => {
  const spinnerClass = classNames(
    'loading-spinner',
    {
      'loading-spinner-centered': centered,
      'loading-spinner-overlay': overlay
    },
    className
  )

  const wrapperClass = classNames('loading-spinner-wrapper', wrapperClassName)

  const defaultIndicator = <LoadingOutlined style={{ fontSize: size === 'large' ? 24 : size === 'small' ? 14 : 20 }} spin />

  if (children) {
    return (
      <div className={wrapperClass}>
        <Spin
          size={size}
          tip={tip}
          spinning={spinning}
          delay={delay}
          indicator={indicator || defaultIndicator}
          className={spinnerClass}
          style={style}
          {...rest}
        >
          {children}
        </Spin>
      </div>
    )
  }

  if (centered) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <Space direction="vertical" align="center">
          <Spin
            size={size}
            indicator={indicator || defaultIndicator}
            className={spinnerClass}
            style={style}
            {...rest}
          />
          {tip && <span className="text-gray-600 mt-2">{tip}</span>}
        </Space>
      </div>
    )
  }

  return (
    <Spin
      size={size}
      tip={tip}
      spinning={spinning}
      delay={delay}
      indicator={indicator || defaultIndicator}
      className={spinnerClass}
      style={style}
      {...rest}
    />
  )
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'default', 'large']),
  tip: PropTypes.string,
  spinning: PropTypes.bool,
  delay: PropTypes.number,
  children: PropTypes.node,
  indicator: PropTypes.node,
  wrapperClassName: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  centered: PropTypes.bool,
  overlay: PropTypes.bool
}

export const FullPageLoader = ({ tip = 'Loading...', size = 'large' }) => (
  <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
    <LoadingSpinner centered size={size} tip={tip} />
  </div>
)

FullPageLoader.propTypes = {
  tip: PropTypes.string,
  size: PropTypes.oneOf(['small', 'default', 'large'])
}

export const InlineLoader = ({ tip, size = 'small' }) => (
  <div className="inline-flex items-center space-x-2">
    <LoadingSpinner size={size} />
    {tip && <span className="text-gray-600">{tip}</span>}
  </div>
)

InlineLoader.propTypes = {
  tip: PropTypes.string,
  size: PropTypes.oneOf(['small', 'default', 'large'])
}

export default LoadingSpinner