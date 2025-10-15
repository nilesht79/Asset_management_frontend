import React, { useState, useEffect } from 'react';
import { Input, Progress, Space, Typography, Tooltip } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, InfoCircleOutlined } from '@ant-design/icons';
import { checkPasswordStrength, getPasswordRequirements } from '../../utils/passwordStrength';

const { Text } = Typography;

/**
 * Password Input Component with Real-time Strength Indicator
 * @param {Object} props - Component props
 * @param {string} props.value - Password value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.showStrength - Show strength indicator (default: true)
 * @param {boolean} props.showRequirements - Show requirements list (default: false)
 */
const PasswordInput = ({
  value,
  onChange,
  placeholder = 'Enter password',
  showStrength = true,
  showRequirements = false,
  ...rest
}) => {
  const [strength, setStrength] = useState(null);

  useEffect(() => {
    if (value) {
      const strengthData = checkPasswordStrength(value);
      setStrength(strengthData);
    } else {
      setStrength(null);
    }
  }, [value]);

  const requirements = getPasswordRequirements();

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input.Password
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        {...rest}
      />

      {showStrength && strength && value && (
        <div style={{ marginTop: '-4px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Progress
                percent={strength.percentage}
                strokeColor={strength.color}
                showInfo={false}
                size="small"
                style={{ flex: 1, marginBottom: 0 }}
              />
              <Text
                style={{
                  fontSize: '12px',
                  color: strength.color,
                  fontWeight: 500,
                  minWidth: '60px'
                }}
              >
                {strength.label}
              </Text>
            </div>

            {strength.feedback.length > 0 && (
              <div style={{ marginTop: '4px' }}>
                {strength.feedback.map((item, index) => (
                  <Text
                    key={index}
                    type="secondary"
                    style={{
                      fontSize: '11px',
                      display: 'block',
                      lineHeight: '16px'
                    }}
                  >
                    • {item}
                  </Text>
                ))}
              </div>
            )}
          </Space>
        </div>
      )}

      {showRequirements && (
        <div
          style={{
            background: '#f5f5f5',
            padding: '8px 12px',
            borderRadius: '4px',
            marginTop: '4px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <InfoCircleOutlined style={{ fontSize: '12px', marginRight: '6px', color: '#1890ff' }} />
            <Text style={{ fontSize: '12px', fontWeight: 500 }}>Password Requirements:</Text>
          </div>
          {requirements.map((req, index) => {
            // Map requirement index to correct criteria key
            const criteriaKeys = ['length', 'lowercase', 'uppercase', 'number', 'special'];
            const isMet = strength && strength.criteria[criteriaKeys[index]];
            return (
              <Text
                key={index}
                style={{
                  fontSize: '11px',
                  display: 'block',
                  lineHeight: '18px',
                  color: isMet ? '#52c41a' : '#8c8c8c',
                  textDecoration: isMet ? 'line-through' : 'none'
                }}
              >
                {isMet ? '✓' : '○'} {req}
              </Text>
            );
          })}
        </div>
      )}
    </Space>
  );
};

export default PasswordInput;
