import React from 'react'
import { Pie } from '@ant-design/plots'
import { InfoCircleOutlined } from '@ant-design/icons'

/**
 * Location Distribution Pie Chart Component
 * Displays asset distribution across different locations
 */
const LocationPieChart = ({ data, title = 'Total Assets' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <InfoCircleOutlined className="text-2xl mb-2" />
        <div>No location data available</div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + (item.asset_count || item.count || 0), 0)

  const chartData = data.map((item, index) => ({
    location: item.location_name || item.location || item.name || 'Unknown',
    building: item.building || null,
    floor: item.floor || null,
    value: item.asset_count || item.count || 0,
    color: item.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`
  })).filter(item => item.value > 0)

  const config = {
    data: chartData,
    angleField: 'value',
    colorField: 'location',
    radius: 1.0,
    innerRadius: 0.75,
    height: 280,
    label: false,
    appendPadding: [10, 10, 30, 10],
    meta: {
      location: {
        alias: 'Location',
      },
      value: {
        alias: 'Assets',
        formatter: (val) => `${val}`,
      },
    },
    interactions: [{ type: 'element-active' }],
    legend: {
      position: 'bottom',
      layout: 'horizontal',
      itemName: {
        style: {
          fontSize: 11,
        },
      },
      maxRow: 3,
    },
    statistic: {
      title: {
        style: {
          fontSize: '14px',
          color: '#999',
        },
        content: title,
      },
      content: {
        style: {
          fontSize: '20px',
          fontWeight: 'bold',
        },
        content: total.toString(),
      },
    },
    color: chartData.map(item => item.color),
  }

  return (
    <div style={{ height: '360px', overflow: 'hidden' }}>
      <Pie {...config} />
    </div>
  )
}

export default LocationPieChart
