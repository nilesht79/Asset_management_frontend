    if (pathname.startsWith('/masters')) {
      keys.push('masters')
    }
    if (pathname.startsWith('/assets') ||
        pathname.startsWith('/standby')) {
      keys.push('assets')
    }
    // Auto-open Asset Requisitions submenu for requisition-related routes
    if (pathname.startsWith('/assignments/asset-assignment') ||
        pathname.startsWith('/deliveries/management') ||
        pathname.startsWith('/requisitions/all-requisitions')) {
      keys.push('asset-requisitions')
    }
    if (pathname.startsWith('/tickets')) {
      keys.push('tickets')
    }
    if (pathname.startsWith('/reports')) {
      keys.push('reports')
    }
    if (pathname.startsWith('/department')) {
      keys.push('department')
    }
    if (pathname.startsWith('/settings')) {
      keys.push('settings')
    }
    if (pathname.startsWith('/consumables')) {
      keys.push('consumables')
    }
    if (pathname.startsWith('/fault-analysis') ||
        pathname.startsWith('/admin/fault-types')) {
      keys.push('fault-analysis')
    }

    return keys
  }

  const handleOpenChange = (keys) => {
    setOpenKeys(keys)
  }

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="shadow-lg transition-all duration-300 themed-sidebar"
      style={{
        background: `linear-gradient(180deg, ${theme.sidebar.bg} 0%, ${theme.sidebar.hover} 100%)`,
        borderRight: `1px solid rgba(255, 255, 255, 0.12)`,
        boxShadow: `2px 0 8px rgba(0, 0, 0, 0.1)`
      }}
      width={280}
      collapsedWidth={80}
    >
      {/* Logo and Brand */}
      <div className="h-20 flex items-center justify-center px-4 border-b-2 border-opacity-30"
           style={{ borderBottomColor: theme.sidebar.active }}>
        {collapsed ? (
          <div className="flex items-center justify-center">
            <img
              src="/logo_cidco.png"
              alt="PolePlus"
              className="h-10 w-auto object-contain"
            />
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <img
              src="/logo_cidco.png"
              alt="PolePlus"
              className="h-10 w-auto object-contain"
            />
            <div>
              <div className="text-white font-bold text-lg leading-none">
                PolePlus
              </div>
              <div className="text-xs opacity-75 leading-none mt-1"
                   style={{ color: theme.sidebar.icon }}>
                Unified ITSM Platform
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-hidden">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={getMenuItems()}
          onClick={handleMenuClick}
          className="border-none sidebar-menu"
          style={{
            backgroundColor: 'transparent',
            '--sidebar-bg': theme.sidebar.bg,
            '--sidebar-hover': theme.sidebar.hover,
            '--sidebar-active': theme.sidebar.active,
            '--sidebar-text': theme.sidebar.text,
            '--sidebar-icon': theme.sidebar.icon,
            '--accent-color': theme.accent
          }}
        />
      </div>
    </Sider>
  )
}

export default Sidebar
