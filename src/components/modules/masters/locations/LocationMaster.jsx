import React, { useState } from 'react'
import { Tabs } from 'antd'
import { 
  EnvironmentOutlined, 
  BranchesOutlined, 
  BankOutlined 
} from '@ant-design/icons'
import LocationMain from './LocationMain'
import LocationTypeMaster from './LocationTypeMaster'
import ClientMaster from './ClientMaster'

const LocationMaster = () => {
  const [activeTab, setActiveTab] = useState('location')

  const tabItems = [
    {
      key: 'location',
      label: (
        <span>
          <EnvironmentOutlined />
          Location Master
        </span>
      ),
      children: <LocationMain />
    },
    {
      key: 'client',
      label: (
        <span>
          <BankOutlined />
          Client Master
        </span>
      ),
      children: <ClientMaster />
    },
    {
      key: 'location-type',
      label: (
        <span>
          <BranchesOutlined />
          Location Type Master
        </span>
      ),
      children: <LocationTypeMaster />
    }
  ]

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '24px',
        borderBottom: '1px solid #f0f0f0',
        paddingBottom: '16px'
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Location Master</h2>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
          Dashboard {'>'} Master {'>'} Location Master
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        tabPosition="top"
        style={{
          '.ant-tabs-tab': {
            padding: '12px 24px'
          }
        }}
      />
    </div>
  )
}

export default LocationMaster