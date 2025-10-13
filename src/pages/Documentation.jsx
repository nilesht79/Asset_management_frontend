import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Typography, Row, Col, Card, Divider } from 'antd'
import { ArrowLeftOutlined, BookOutlined, SafetyOutlined, TeamOutlined, SettingOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <header className="relative bg-white/95 backdrop-blur-md shadow-2xl border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300">
                  <Text className="text-white font-bold text-xl">P</Text>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <Text className="text-2xl font-black text-gray-900 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  PolePlus Documentation
                </Text>
                <br />
                <Text className="text-sm font-medium text-gray-600 tracking-wide">
                  ENTERPRISE KNOWLEDGE BASE
                </Text>
              </div>
            </div>
            <Link to="/">
              <Button 
                icon={<ArrowLeftOutlined />}
                size="large"
                className="h-12 px-6 bg-gradient-to-r from-red-600 to-red-700 border-0 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600'
                }}
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-red-700 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <BookOutlined className="text-5xl text-white" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
            </div>
          </div>
          
          <Title 
            level={1} 
            className="text-5xl md:text-6xl font-black mb-8"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fecaca 50%, #ffffff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(220, 38, 38, 0.3)'
            }}
          >
            System Documentation
          </Title>
          
          <Paragraph className="text-2xl text-red-100 max-w-4xl mx-auto leading-relaxed font-light">
            Comprehensive <span className="text-red-300 font-semibold">enterprise guide</span> to mastering 
            PolePlus Asset Management and <span className="text-red-300 font-semibold">unlocking full potential</span>
          </Paragraph>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} md={12}>
            <Card 
              className="h-full border-0 shadow-2xl hover:shadow-red-500/20 transform hover:scale-105 transition-all duration-500 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254, 202, 202, 0.2) 100%)',
                borderRadius: '24px',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}
              title={
                <div className="flex items-center space-x-3 p-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <TeamOutlined className="text-xl text-white" />
                  </div>
                  <Text className="text-xl font-bold text-gray-900">User Roles & Access</Text>
                </div>
              }
            >
              <Paragraph className="mb-4">
                PolePlus uses a 7-tier role-based access control system:
              </Paragraph>
              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div><Text className="font-bold text-red-700">Employee:</Text> <Text className="text-gray-700">View assigned assets, create requisitions and tickets</Text></div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div><Text className="font-bold text-red-700">Coordinator:</Text> <Text className="text-gray-700">Manage asset assignments and process requests</Text></div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div><Text className="font-bold text-red-700">Engineer:</Text> <Text className="text-gray-700">Handle support tickets and maintenance</Text></div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div><Text className="font-bold text-red-700">Department Head:</Text> <Text className="text-gray-700">Approve requisitions and view reports</Text></div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div><Text className="font-bold text-red-700">Department Coordinator:</Text> <Text className="text-gray-700">Coordinate department resources</Text></div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div><Text className="font-bold text-red-700">Admin:</Text> <Text className="text-gray-700">System administration and user management</Text></div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div><Text className="font-bold text-red-700">Super Admin:</Text> <Text className="text-gray-700">Complete system control</Text></div>
                  </div>
                </div>
              </div>
              <Paragraph>
                <Text type="secondary">
                  Role-specific access URLs are provided by IT department for security purposes.
                </Text>
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card 
              className="h-full border-0 shadow-2xl hover:shadow-red-500/20 transform hover:scale-105 transition-all duration-500 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254, 202, 202, 0.2) 100%)',
                borderRadius: '24px',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}
              title={
                <div className="flex items-center space-x-3 p-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                    <SafetyOutlined className="text-xl text-white" />
                  </div>
                  <Text className="text-xl font-bold text-gray-900">Security Guidelines</Text>
                </div>
              }
            >
              <Paragraph className="mb-4">
                Security best practices for system users:
              </Paragraph>
              <div className="grid grid-cols-1 gap-3 mb-6">
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <Text className="text-gray-700 font-medium">Use strong, unique passwords</Text>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <Text className="text-gray-700 font-medium">Never share login credentials</Text>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <Text className="text-gray-700 font-medium">Log out when session is complete</Text>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <Text className="text-gray-700 font-medium">Report suspicious activities immediately</Text>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <Text className="text-gray-700 font-medium">Access only assigned role-specific URLs</Text>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <Text className="text-gray-700 font-medium">Keep browser and system updated</Text>
                </div>
              </div>
              <Paragraph>
                <Text type="secondary">
                  All activities are logged for security and compliance purposes.
                </Text>
              </Paragraph>
            </Card>
          </Col>

          <Col xs={24}>
            <Card 
              className="border-0 shadow-2xl hover:shadow-red-500/20 transition-all duration-500 backdrop-blur-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(254, 202, 202, 0.2) 100%)',
                borderRadius: '24px',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}
              title={
                <div className="flex items-center space-x-3 p-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
                    <SettingOutlined className="text-xl text-white" />
                  </div>
                  <Text className="text-xl font-bold text-gray-900">System Features</Text>
                </div>
              }
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                  <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100">
                    <Title level={5} className="text-red-700 font-bold mb-4">Asset Management</Title>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">Complete asset lifecycle tracking</Text>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">Automated maintenance scheduling</Text>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">Warranty and EOL management</Text>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">Asset assignment workflows</Text>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">Physical verification tools</Text>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100">
                    <Title level={5} className="text-red-700 font-bold mb-4">Ticketing System</Title>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">Multi-channel ticket creation</Text>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">SLA-based automatic escalation</Text>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">Engineer skill-based assignment</Text>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">Knowledge base integration</Text>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">Customer satisfaction tracking</Text>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={8}>
                  <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100">
                    <Title level={5} className="text-red-700 font-bold mb-4">Analytics & Reporting</Title>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">Real-time dashboards</Text>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">Custom report builder</Text>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">SLA compliance monitoring</Text>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">Performance analytics</Text>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <Text className="text-gray-700">Automated report delivery</Text>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <div className="my-16 h-px bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>

        <div className="text-center p-12 bg-white/5 backdrop-blur-sm rounded-3xl border border-red-200/30">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
              <SafetyOutlined className="text-2xl text-white" />
            </div>
          </div>
          
          <Title 
            level={3} 
            className="text-3xl font-bold mb-6"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fecaca 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Need Assistance?
          </Title>
          
          <Paragraph className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            Our enterprise support team is available to help with account setup, 
            role assignments, and <span className="text-red-300 font-semibold">technical guidance</span>.
          </Paragraph>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 mx-auto bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                <TeamOutlined className="text-xl text-blue-400" />
              </div>
              <Text className="text-white font-bold text-lg block mb-2">IT Help Desk</Text>
              <Text className="text-red-200">Internal Extension 2100</Text>
            </div>
            
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 mx-auto bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <Text className="text-white font-bold text-lg block mb-2">System Status</Text>
              <Text className="text-green-400 font-semibold">All Services Operational</Text>
            </div>
            
            <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="w-12 h-12 mx-auto bg-red-600/20 rounded-lg flex items-center justify-center mb-4">
                <SafetyOutlined className="text-xl text-red-400" />
              </div>
              <Text className="text-white font-bold text-lg block mb-2">Emergency Support</Text>
              <Text className="text-red-200">24/7 Available</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Documentation