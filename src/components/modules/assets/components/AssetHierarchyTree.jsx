import { useEffect } from 'react'
import {
  Card,
  Tree,
  Alert,
  Spin,
  Empty,
  Tag,
  Space,
  Typography,
  Tooltip
} from 'antd'
import {
  ApiOutlined,
  DesktopOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAssetHierarchy,
  selectAssetHierarchy
} from '../../../../store/slices/assetSlice'
import dayjs from 'dayjs'

const { Text } = Typography

const AssetHierarchyTree = ({ assetId }) => {
  const dispatch = useDispatch()
  const { data: hierarchy, loading, error } = useSelector(selectAssetHierarchy)

  // Fetch hierarchy on mount
  useEffect(() => {
    if (assetId) {
      dispatch(fetchAssetHierarchy(assetId))
    }
  }, [dispatch, assetId])

  // Convert flat hierarchy to tree structure
  const convertToTreeData = (hierarchyData) => {
    if (!hierarchyData || hierarchyData.length === 0) return []

    // Group by parent_asset_id
    const nodeMap = {}
    const rootNodes = []

    // First pass: create all nodes
    hierarchyData.forEach(item => {
      nodeMap[item.id] = {
        key: item.id,
        title: renderNodeTitle(item),
        children: [],
        ...item
      }
    })

    // Second pass: build tree structure
    hierarchyData.forEach(item => {
      const node = nodeMap[item.id]
      if (item.parent_asset_id && nodeMap[item.parent_asset_id]) {
        nodeMap[item.parent_asset_id].children.push(node)
      } else {
        rootNodes.push(node)
      }
    })

    return rootNodes
  }

  // Render node title with asset info
  const renderNodeTitle = (item) => {
    const isInstalled = item.installation_status === 'installed'
    const isRemoved = item.installation_status === 'removed'

    return (
      <div className="flex items-center gap-2 py-1">
        {/* Asset Icon */}
        <div>
          {item.level === 0 ? (
            <DesktopOutlined className="text-blue-600" />
          ) : (
            <ApiOutlined className="text-green-600" />
          )}
        </div>

        {/* Asset Info */}
        <div className="flex-1">
          <Space size="small">
            <Text strong>{item.asset_tag}</Text>
            <Text type="secondary">-</Text>
            <Text>{item.product_name || 'Unknown Product'}</Text>
          </Space>

          {item.serial_number && (
            <div className="text-xs text-gray-500 mt-0.5">
              SN: {item.serial_number}
            </div>
          )}
        </div>

        {/* Status Tags */}
        <Space size="small">
          {/* Asset Type Tag */}
          <Tag color={item.level === 0 ? 'blue' : 'green'}>
            {item.level === 0 ? 'Parent' : 'Component'}
          </Tag>

          {/* Installation Status */}
          {item.level > 0 && (
            <>
              {isInstalled && (
                <Tooltip title={`Installed on ${dayjs(item.installation_date).format('MMM DD, YYYY')}`}>
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    Installed
                  </Tag>
                </Tooltip>
              )}
              {isRemoved && (
                <Tooltip title={`Removed on ${dayjs(item.removal_date).format('MMM DD, YYYY')}`}>
                  <Tag color="default" icon={<ClockCircleOutlined />}>
                    Removed
                  </Tag>
                </Tooltip>
              )}
            </>
          )}

          {/* Level Badge */}
          <Tooltip title={`Hierarchy Level: ${item.level}`}>
            <Tag color="purple">L{item.level}</Tag>
          </Tooltip>
        </Space>
      </div>
    )
  }

  // Show loading state
  if (loading && !hierarchy) {
    return (
      <Card>
        <div className="flex justify-center items-center py-12">
          <Spin size="large" tip="Loading hierarchy..." />
        </div>
      </Card>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <Alert
          message="Error Loading Hierarchy"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    )
  }

  // Convert hierarchy to tree data
  const treeData = convertToTreeData(hierarchy)

  return (
    <Card
      title={
        <Space>
          <ApiOutlined className="text-blue-600" />
          <span>Asset Hierarchy</span>
        </Space>
      }
      loading={loading}
    >
      {treeData.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No hierarchy data available"
        />
      ) : (
        <>
          <Alert
            message={
              <Space>
                <Text type="secondary" className="text-sm">
                  This tree shows the complete hierarchy of this asset and its components.
                  Parent assets are shown with <DesktopOutlined className="text-blue-600" />,
                  components with <ApiOutlined className="text-green-600" />.
                </Text>
              </Space>
            }
            type="info"
            showIcon={false}
            className="mb-4"
          />

          <Tree
            treeData={treeData}
            defaultExpandAll
            showLine={{
              showLeafIcon: false
            }}
            showIcon={false}
            selectable={false}
            className="hierarchy-tree"
            style={{
              fontSize: '14px'
            }}
          />

          {/* Hierarchy Statistics */}
          {hierarchy && hierarchy.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <Space split={<div className="h-4 w-px bg-gray-300" />} size="large">
                <div>
                  <Text type="secondary" className="text-xs block">Total Assets</Text>
                  <Text strong className="text-lg">{hierarchy.length}</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs block">Components</Text>
                  <Text strong className="text-lg">
                    {hierarchy.filter(item => item.level > 0).length}
                  </Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs block">Installed</Text>
                  <Text strong className="text-lg text-green-600">
                    {hierarchy.filter(item => item.installation_status === 'installed').length}
                  </Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs block">Max Depth</Text>
                  <Text strong className="text-lg">
                    {Math.max(...hierarchy.map(item => item.level), 0)}
                  </Text>
                </div>
              </Space>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .hierarchy-tree :global(.ant-tree-node-content-wrapper) {
          width: 100%;
        }
      `}</style>
    </Card>
  )
}

export default AssetHierarchyTree
