import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button, Typography, Row, Col, Card, Statistic, Timeline, Badge, Progress } from 'antd'
import {
  LoginOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  BarChartOutlined,
  CloudServerOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  RightOutlined,
  TrophyOutlined,
  InsuranceOutlined,
  DashboardOutlined,
  ToolOutlined,
  FileTextOutlined,
  AlertOutlined,
  MonitorOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  LineChartOutlined,
  ExportOutlined,
  ApiOutlined,
  BellOutlined,
  SearchOutlined,
  FilterOutlined,
  ScheduleOutlined,
  AuditOutlined,
  ContainerOutlined,
  ProfileOutlined,
  DeploymentUnitOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
  RobotOutlined,
  WarningOutlined,
  ReloadOutlined
} from '@ant-design/icons'

const { Title, Paragraph } = Typography

const Landing = () => {
  const [stats, setStats] = useState({
    totalAssets: 0,
    departments: 0,
    activeUsers: 0,
    uptime: 0,
    ticketsResolved: 0,
    slaCompliance: 0,
    automatedWorkflows: 0,
    reportTypes: 0
  })

  const [visibleSections, setVisibleSections] = useState({})
  const sectionRefs = useRef({})

  // Animate counters on load
  useEffect(() => {
    const targetStats = {
      totalAssets: 25000,
      departments: 85,
      activeUsers: 2400,
      uptime: 99.9,
      ticketsResolved: 15600,
      slaCompliance: 98.7,
      automatedWorkflows: 120,
      reportTypes: 45
    }

    const animateCounters = () => {
      const duration = 2000
      const steps = 60
      const stepDuration = duration / steps

      Object.keys(targetStats).forEach(key => {
        const target = targetStats[key]
        const isDecimal = target % 1 !== 0

        for (let i = 0; i <= steps; i++) {
          setTimeout(() => {
            const progress = i / steps
            const easedProgress = 1 - Math.pow(1 - progress, 3)
            const currentValue = isDecimal ?
              (target * easedProgress).toFixed(1) :
              Math.floor(target * easedProgress)

            setStats(prev => ({
              ...prev,
              [key]: parseFloat(currentValue)
            }))
          }, i * stepDuration)
        }
      })
    }

    const timer = setTimeout(animateCounters, 500)
    return () => clearTimeout(timer)
  }, [])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisibleSections(prev => ({
            ...prev,
            [entry.target.id]: true
          }))
        }
      })
    }, observerOptions)

    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  const setRef = (id) => (ref) => {
    sectionRefs.current[id] = ref
  }

  const isVisible = (sectionId) => visibleSections[sectionId]

  const coreModules = [
    {
      icon: <DatabaseOutlined />,
      title: 'Asset Lifecycle Management',
      description: 'Complete end-to-end asset tracking from procurement to disposal with comprehensive CRUD operations, category management, and real-time status monitoring',
      features: ['Asset Registration & Categorization', 'OEM & Product Master Management', 'Location-based Asset Tracking', 'Maintenance Scheduling'],
      metrics: '25K+ Assets Managed',
      color: '#E30613'
    },
    {
      icon: <AlertOutlined />,
      title: 'SLA-Driven Ticketing System',
      description: 'Multi-tier escalation framework with automated SLA monitoring, priority-based routing, and comprehensive approval workflows',
      features: ['4-Tier Priority System', 'Auto-escalation Engine', 'Department-wise Routing', 'Real-time SLA Tracking'],
      metrics: '98.7% SLA Compliance',
      color: '#E30613'
    },
    {
      icon: <RobotOutlined />,
      title: 'Automated Workflow Engine',
      description: 'Configurable business process automation with approval chains, notification systems, and role-based task assignment',
      features: ['Multi-stage Approvals', 'Automated Notifications', 'Role-based Task Routing', 'Process Templates'],
      metrics: '120+ Active Workflows',
      color: '#E30613'
    },
    {
      icon: <LineChartOutlined />,
      title: 'Advanced Reporting & Analytics',
      description: 'Comprehensive reporting suite with 45+ pre-built reports, custom query builder, and real-time dashboard visualization',
      features: ['Custom Report Builder', 'Scheduled Report Delivery', 'Executive Dashboards', 'Data Export Capabilities'],
      metrics: '45+ Report Types',
      color: '#E30613'
    }
  ]

  const systemCapabilities = [
    {
      category: 'Master Data Management',
      icon: <SettingOutlined />,
      capabilities: [
        'OEM & Manufacturer Registry',
        'Product & Category Hierarchies',
        'Location & Department Mapping',
        'User Role & Permission Management',
        'Vendor & Supplier Database'
      ]
    },
    {
      category: 'Asset Operations',
      icon: <ToolOutlined />,
      capabilities: [
        'Asset Registration & Tagging',
        'Condition Monitoring',
        'Maintenance Scheduling',
        'Transfer & Disposal Workflows',
        'Audit Trail Management'
      ]
    },
    {
      category: 'Ticket Management',
      icon: <BellOutlined />,
      capabilities: [
        'Incident Reporting System',
        'Priority-based Classification',
        'Auto-assignment Rules',
        'Escalation Management',
        'Resolution Tracking'
      ]
    },
    {
      category: 'System Administration',
      icon: <SecurityScanOutlined />,
      capabilities: [
        'User Access Control',
        'System Configuration',
        'Audit Log Management',
        'Backup & Recovery',
        'Performance Monitoring'
      ]
    }
  ]

  const workflowSteps = [
    {
      title: 'Asset Requisition',
      description: 'Automated requisition workflow with multi-level approval chains',
      icon: <ContainerOutlined />,
      status: 'process'
    },
    {
      title: 'Procurement Processing',
      description: 'Vendor evaluation, purchase order generation, and delivery tracking',
      icon: <ProfileOutlined />,
      status: 'process'
    },
    {
      title: 'Asset Registration',
      description: 'Comprehensive asset onboarding with tagging and categorization',
      icon: <DatabaseOutlined />,
      status: 'process'
    },
    {
      title: 'Deployment & Monitoring',
      description: 'Location assignment, condition monitoring, and performance tracking',
      icon: <MonitorOutlined />,
      status: 'process'
    },
    {
      title: 'Maintenance & Support',
      description: 'Preventive maintenance scheduling and incident management',
      icon: <ToolOutlined />,
      status: 'process'
    },
    {
      title: 'Disposal Management',
      description: 'End-of-life processing with compliance and documentation',
      icon: <ReloadOutlined />,
      status: 'wait'
    }
  ]

  const reportingModules = [
    {
      title: 'Asset Reports',
      count: '15+',
      description: 'Comprehensive asset analytics including utilization, depreciation, and lifecycle reports',
      icon: <BarChartOutlined />
    },
    {
      title: 'Department Reports',
      count: '12+',
      description: 'Department-wise asset allocation, budget utilization, and performance metrics',
      icon: <TeamOutlined />
    },
    {
      title: 'SLA Reports',
      count: '8+',
      description: 'Service level agreement tracking, compliance metrics, and escalation analysis',
      icon: <ClockCircleOutlined />
    },
    {
      title: 'Custom Reports',
      count: '10+',
      description: 'Flexible report builder with custom parameters and automated scheduling',
      icon: <FilterOutlined />
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <img
                  src="/logo.png"
                  alt="PolePlus Logo"
                  className="h-12 w-auto"
                />
                <div className="border-l border-gray-200 pl-4">
                  <div className="text-2xl font-bold" style={{ color: '#E30613' }}>
                    PolePlus
                  </div>
                  <div className="text-sm text-gray-600 font-medium tracking-wide">
                    Enterprise level IT Services Management (ITSM) platform
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#E30613' }}></div>
                  <span>System Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge status="success" />
                  <span>{stats.uptime}% Uptime</span>
                </div>
              </div>

              <Link to="/login">
                <Button
                  type="primary"
                  icon={<LoginOutlined />}
                  size="large"
                  className="h-12 px-8 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  style={{
                    backgroundColor: '#E30613',
                    borderColor: '#E30613',
                    borderRadius: '8px'
                  }}
                >
                  Access Platform
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="hero"
        ref={setRef('hero')}
        className={`relative py-32 bg-gradient-to-br from-gray-50 to-white overflow-hidden transition-all duration-1000 ${
          isVisible('hero') ? 'animate-fadeIn' : 'opacity-0'
        }`}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div
            className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-8 animate-pulse"
            style={{ backgroundColor: '#E30613' }}
          ></div>
          <div
            className="absolute bottom-20 left-10 w-64 h-64 rounded-full opacity-5 animate-bounce"
            style={{ backgroundColor: '#E30613', animationDuration: '4s' }}
          ></div>

          {/* Dynamic Swoosh inspired by logo */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 800">
            <path
              d="M0,300 C300,200 600,400 1200,250 L1200,350 C900,500 600,300 0,400 Z"
              fill="#E30613"
              fillOpacity="0.04"
              className="animate-pulse"
            />
            <path
              d="M0,350 C400,250 700,450 1200,300 L1200,400 C800,550 500,350 0,450 Z"
              fill="#E30613"
              fillOpacity="0.02"
              className="animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Title
              level={1}
              className={`text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight transition-all duration-1000 delay-300 ${
                isVisible('hero') ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
              }`}
            >
              Enterprise level IT Services Management
              <br />
              <span style={{ color: '#E30613' }}>Platform</span>
            </Title>

            <Paragraph className={`text-2xl text-gray-600 max-w-5xl mx-auto mb-16 leading-relaxed transition-all duration-1000 delay-500 ${
              isVisible('hero') ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
            }`}>
              A unified platform for IT helpdesk management, asset tracking, and  SLA monitoring—designed to improve service efficiency
            </Paragraph>

            <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 transition-all duration-1000 delay-700 ${
              isVisible('hero') ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
            }`}>
              <Link to="/login">
                <Button
                  type="primary"
                  size="large"
                  icon={<RightOutlined />}
                  className="h-16 px-12 text-xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
                  style={{
                    backgroundColor: '#E30613',
                    borderColor: '#E30613',
                    borderRadius: '12px'
                  }}
                >
                  Launch Platform
                </Button>
              </Link>
              <Button
                size="large"
                icon={<FileTextOutlined />}
                className="h-16 px-10 text-lg font-medium border-2 hover:border-red-600 hover:text-red-600 transition-all duration-300"
                style={{
                  borderColor: '#E30613',
                  color: '#E30613',
                  borderRadius: '12px'
                }}
              >
                View Documentation
              </Button>
            </div>
          </div>

          {/* Enhanced Live Statistics */}
          <div className={`bg-white rounded-3xl shadow-2xl p-10 mb-20 border border-gray-100 backdrop-blur-sm transition-all duration-1000 delay-1000 ${
            isVisible('hero') ? 'transform translate-y-0 opacity-100' : 'transform translate-y-12 opacity-0'
          }`}>
            <Title level={3} className="text-center mb-8 text-gray-800">
              Platform Performance Metrics
            </Title>
            <Row gutter={[48, 48]} className="text-center">
              <Col xs={12} md={6}>
                <Statistic
                  title={<span className="text-gray-600 font-semibold text-base">Total AUM</span>}
                  value={stats.totalAssets}
                  valueStyle={{ color: '#E30613', fontSize: '3rem', fontWeight: 'bold' }}
                  prefix={<DatabaseOutlined />}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title={<span className="text-gray-600 font-semibold text-base">Active Departments</span>}
                  value={stats.departments}
                  valueStyle={{ color: '#E30613', fontSize: '3rem', fontWeight: 'bold' }}
                  prefix={<TeamOutlined />}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title={<span className="text-gray-600 font-semibold text-base">System Users</span>}
                  value={stats.activeUsers}
                  valueStyle={{ color: '#E30613', fontSize: '3rem', fontWeight: 'bold' }}
                  prefix={<UserOutlined />}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic
                  title={<span className="text-gray-600 font-semibold text-base">System Uptime</span>}
                  value={stats.uptime}
                  suffix="%"
                  valueStyle={{ color: '#E30613', fontSize: '3rem', fontWeight: 'bold' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
            </Row>

            <div className="mt-12 pt-8 border-t border-gray-100">
              <Row gutter={[48, 32]} className="text-center">
                <Col xs={12} md={6}>
                  <Statistic
                    title={<span className="text-gray-600 font-medium">Tickets Resolved</span>}
                    value={stats.ticketsResolved}
                    valueStyle={{ color: '#52c41a', fontSize: '1.8rem', fontWeight: '600' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Statistic
                    title={<span className="text-gray-600 font-medium">SLA Compliance</span>}
                    value={stats.slaCompliance}
                    suffix="%"
                    valueStyle={{ color: '#1890ff', fontSize: '1.8rem', fontWeight: '600' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Statistic
                    title={<span className="text-gray-600 font-medium">Active Workflows</span>}
                    value={stats.automatedWorkflows}
                    valueStyle={{ color: '#722ed1', fontSize: '1.8rem', fontWeight: '600' }}
                    prefix={<SyncOutlined />}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <Statistic
                    title={<span className="text-gray-600 font-medium">Report Types</span>}
                    value={stats.reportTypes}
                    suffix="+"
                    valueStyle={{ color: '#fa8c16', fontSize: '1.8rem', fontWeight: '600' }}
                    prefix={<BarChartOutlined />}
                  />
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules Section */}
      <section
        id="modules"
        ref={setRef('modules')}
        className="py-32 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-24 transition-all duration-1000 ${
            isVisible('modules') ? 'transform translate-y-0 opacity-100' : 'transform translate-y-12 opacity-0'
          }`}>
            <Title level={2} className="text-5xl font-bold text-gray-900 mb-8">
              Core <span style={{ color: '#E30613' }}>System Modules</span>
            </Title>
            <Paragraph className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Four comprehensive modules designed for enterprise-scale asset management operations
            </Paragraph>
          </div>

          <Row gutter={[40, 40]}>
            {coreModules.map((module, index) => (
              <Col key={index} xs={24} md={12}>
                <Card
                  className={`h-full hover:shadow-2xl transition-all duration-500 border border-gray-100 group transform hover:scale-105 ${
                    isVisible('modules') ? 'animate-slideInUp opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    borderRadius: '20px',
                    animationDelay: `${index * 200}ms`,
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'
                  }}
                >
                  <div className="p-8">
                    <div className="flex items-start space-x-8">
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg"
                        style={{ backgroundColor: module.color }}
                      >
                        {React.cloneElement(module.icon, {
                          className: "text-3xl text-white"
                        })}
                      </div>
                      <div className="flex-1">
                        <Title level={3} className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition-colors duration-300">
                          {module.title}
                        </Title>
                        <Paragraph className="text-gray-600 mb-6 text-base leading-relaxed">
                          {module.description}
                        </Paragraph>
                        <div className="mb-6">
                          {module.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-3 mb-2">
                              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <div
                          className="text-sm font-bold px-4 py-2 rounded-full inline-block shadow-sm"
                          style={{ backgroundColor: '#E30613', color: 'white' }}
                        >
                          {module.metrics}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* System Capabilities Grid */}
      <section
        id="capabilities"
        ref={setRef('capabilities')}
        className="py-32 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-24 transition-all duration-1000 ${
            isVisible('capabilities') ? 'transform translate-y-0 opacity-100' : 'transform translate-y-12 opacity-0'
          }`}>
            <Title level={2} className="text-5xl font-bold text-gray-900 mb-8">
              System <span style={{ color: '#E30613' }}>Capabilities</span>
            </Title>
            <Paragraph className="text-2xl text-gray-600 max-w-4xl mx-auto">
              Comprehensive feature set covering all aspects of enterprise asset management
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {systemCapabilities.map((category, index) => (
              <Col key={index} xs={24} md={12}>
                <div className={`bg-white rounded-2xl p-8 h-full shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 group ${
                  isVisible('capabilities') ? 'animate-slideInUp opacity-100' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="flex items-center space-x-4 mb-6">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: '#E30613' }}
                    >
                      {React.cloneElement(category.icon, {
                        className: "text-2xl text-white"
                      })}
                    </div>
                    <Title level={3} className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                      {category.category}
                    </Title>
                  </div>

                  <div className="space-y-3">
                    {category.capabilities.map((capability, idx) => (
                      <div key={idx} className="flex items-center space-x-3 group-hover:transform group-hover:translate-x-2 transition-transform duration-300">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-gray-700 text-sm font-medium">{capability}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Workflow Timeline */}
      <section
        id="workflow"
        ref={setRef('workflow')}
        className="py-32 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-20 transition-all duration-1000 ${
            isVisible('workflow') ? 'transform translate-y-0 opacity-100' : 'transform translate-y-12 opacity-0'
          }`}>
            <Title level={2} className="text-5xl font-bold text-gray-900 mb-8">
              Asset Lifecycle <span style={{ color: '#E30613' }}>Workflow</span>
            </Title>
            <Paragraph className="text-2xl text-gray-600 max-w-4xl mx-auto">
              End-to-end automated workflow management from requisition to disposal
            </Paragraph>
          </div>

          <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${
            isVisible('workflow') ? 'transform translate-y-0 opacity-100' : 'transform translate-y-12 opacity-0'
          }`}>
            <Timeline
              mode="alternate"
              items={workflowSteps.map((step, index) => ({
                dot: React.cloneElement(step.icon, {
                  style: {
                    fontSize: '20px',
                    color: '#E30613',
                    backgroundColor: '#fff',
                    padding: '12px',
                    borderRadius: '50%',
                    border: `3px solid #E30613`
                  }
                }),
                children: (
                  <div className={`p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ${
                    isVisible('workflow') ? 'animate-slideInUp' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 200}ms` }}>
                    <Title level={4} className="text-lg font-bold text-gray-900 mb-3">
                      {step.title}
                    </Title>
                    <Paragraph className="text-gray-600 mb-0">
                      {step.description}
                    </Paragraph>
                  </div>
                ),
                color: '#E30613'
              }))}
            />
          </div>
        </div>
      </section>

      {/* Advanced Reporting Section */}
      <section
        id="reporting"
        ref={setRef('reporting')}
        className="py-32 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-20 transition-all duration-1000 ${
            isVisible('reporting') ? 'transform translate-y-0 opacity-100' : 'transform translate-y-12 opacity-0'
          }`}>
            <Title level={2} className="text-5xl font-bold text-gray-900 mb-8">
              Advanced <span style={{ color: '#E30613' }}>Reporting Suite</span>
            </Title>
            <Paragraph className="text-2xl text-gray-600 max-w-4xl mx-auto">
              45+ comprehensive reports with real-time analytics and automated delivery
            </Paragraph>
          </div>

          <Row gutter={[32, 32]} className="mb-16">
            {reportingModules.map((report, index) => (
              <Col key={index} xs={24} sm={12} lg={6}>
                <Card
                  className={`text-center h-full hover:shadow-xl transition-all duration-500 border border-gray-100 group ${
                    isVisible('reporting') ? 'animate-slideInUp opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    borderRadius: '16px',
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="p-6">
                    <div
                      className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
                      style={{ backgroundColor: '#E30613' }}
                    >
                      {React.cloneElement(report.icon, {
                        className: "text-2xl text-white"
                      })}
                    </div>

                    <div
                      className="text-3xl font-bold mb-2"
                      style={{ color: '#E30613' }}
                    >
                      {report.count}
                    </div>

                    <Title level={4} className="text-lg font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">
                      {report.title}
                    </Title>

                    <Paragraph className="text-gray-600 text-sm leading-relaxed">
                      {report.description}
                    </Paragraph>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <div className={`bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-1000 delay-500 ${
            isVisible('reporting') ? 'transform translate-y-0 opacity-100' : 'transform translate-y-12 opacity-0'
          }`}>
            <Row gutter={[48, 24]} align="middle">
              <Col xs={24} md={8} className="text-center">
                <div className="space-y-4">
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#E30613' }}>
                      Real-time
                    </div>
                    <div className="text-gray-600">Data Processing</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#E30613' }}>
                      Automated
                    </div>
                    <div className="text-gray-600">Report Delivery</div>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={8} className="text-center">
                <Progress
                  type="circle"
                  percent={98}
                  strokeColor="#E30613"
                  size={120}
                  format={() => (
                    <div>
                      <div className="text-2xl font-bold" style={{ color: '#E30613' }}>98%</div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                  )}
                />
              </Col>
              <Col xs={24} md={8} className="text-center">
                <div className="space-y-4">
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#E30613' }}>
                      Custom
                    </div>
                    <div className="text-gray-600">Query Builder</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-2" style={{ color: '#E30613' }}>
                      Multiple
                    </div>
                    <div className="text-gray-600">Export Formats</div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        ref={setRef('cta')}
        className="py-32 bg-white relative overflow-hidden"
      >
        {/* Background pattern */}
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 400">
            <path
              d="M0,150 C400,100 800,200 1200,150 L1200,400 L0,400 Z"
              fill="#E30613"
              fillOpacity="0.03"
            />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className={`transition-all duration-1000 ${
            isVisible('cta') ? 'transform translate-y-0 opacity-100' : 'transform translate-y-12 opacity-0'
          }`}>
            <Title level={2} className="text-5xl font-bold text-gray-900 mb-8">
              Ready to Transform Your
              <span style={{ color: '#E30613' }}> Asset Operations?</span>
            </Title>

            <Paragraph className="text-2xl text-gray-600 mb-16 leading-relaxed">
              Access your organization's comprehensive asset management platform and
              drive operational excellence with enterprise-grade workflows and analytics.
            </Paragraph>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/login">
                <Button
                  type="primary"
                  size="large"
                  icon={<RightOutlined />}
                  className="h-18 px-16 text-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
                  style={{
                    backgroundColor: '#E30613',
                    borderColor: '#E30613',
                    borderRadius: '15px'
                  }}
                >
                  Launch Platform
                </Button>
              </Link>
              <Button
                size="large"
                icon={<ExportOutlined />}
                className="h-18 px-12 text-xl font-semibold border-2 hover:bg-red-50 transition-all duration-300"
                style={{
                  borderColor: '#E30613',
                  color: '#E30613',
                  borderRadius: '15px'
                }}
              >
                Request Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-100 text-gray-800 py-20 border-t-4 border-red-600" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src="/logo.png"
                  alt="PolePlus Logo"
                  className="h-12 w-auto"
                />
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#E30613' }}>
                    PolePlus
                  </div>
                  <div className="text-gray-400">
                    Enterprise level IT Services Management (ITSM) platform
                  </div>
                </div>
              </div>
              <Paragraph className="text-gray-600 leading-relaxed max-w-md">
                Streamline IT service delivery with SLA-driven ticketing,
                automated workflows, and enterprise-grade reporting capabilities.
              </Paragraph>
            </div>

            <div>
              <Title level={4} className="text-gray-800 mb-4">Platform Features</Title>
              <ul className="space-y-2 text-gray-600">
                <li>Asset Lifecycle Management</li>
                <li>SLA-Driven Ticketing</li>
                <li>Workflow Automation</li>
                <li>Advanced Reporting</li>
                <li>Role-Based Access Control</li>
              </ul>
            </div>

            <div>
              <Title level={4} className="text-gray-800 mb-4">System Status</Title>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span>All Systems Operational</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span>99.9% Uptime SLA</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span>24/7 Monitoring Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-center items-center">
            <div className="text-gray-500 mb-4 md:mb-0">
              © 2024 PolePlus Unified ITSM Platform. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }

        .animate-slideInUp {
          animation: slideInUp 0.8s ease-out forwards;
        }

        .group:hover .group-hover\\:animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  )
}

export default Landing