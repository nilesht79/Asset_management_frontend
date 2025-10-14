import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import MainLayout from '../components/common/Layout/MainLayout'
import Dashboard from '../pages/Dashboard'
import Users from '../pages/Users'
import NotFound from '../pages/NotFound'
import Unauthorized from '../pages/Unauthorized'

// Master Data Components
import OEMList from '../components/modules/masters/oem/OEMList'
import ProductMaster from '../components/modules/masters/products/ProductMaster'
import LocationMaster from '../components/modules/masters/locations/LocationMaster'
import DepartmentMaster from '../components/modules/masters/departments/DepartmentMaster'
import TemplateManager from '../components/modules/masters/componentFieldTemplates/TemplateManager'

import AssetInventory from "../components/modules/assets/AssetInventory"
import AssetMovement from "../pages/AssetMovement"
import TicketDashboard from "../pages/TicketDashboard"

// Permission Control Component
import SuperAdminPermissions from '../pages/SuperAdminPermissions'

const AppRouter = () => {
  const { user } = useSelector(state => state.auth)


  return (
    <Routes>

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* User Management Routes - Admin/Superadmin only */}
        {['admin', 'superadmin'].includes(user?.role) && (
          <>
            <Route path="users" element={<Users />} />
            <Route path="departments" element={<DepartmentMaster />} />
          </>
        )}

        {/* Master Data Routes - Admin/Superadmin only */}
        {['admin', 'superadmin'].includes(user?.role) && (
          <>
            <Route path="masters/oem" element={<OEMList />} />
            <Route path="masters/products" element={<ProductMaster />} />
            <Route path="masters/locations" element={<LocationMaster />} />
          </>
        )}

        {/* Asset Management Routes */}
        {['coordinator', 'admin', 'superadmin', 'department_coordinator'].includes(user?.role) && (
          <>
            <Route path="assets/inventory" element={<AssetInventory />} />
            <Route path="assets/assignment" element={<div>Asset Assignment (To be implemented)</div>} />
            <Route path="assets/movement" element={<AssetMovement />} />
            <Route path="assets/requisitions" element={<div>Asset Requisitions (To be implemented)</div>} />
          </>
        )}


        {/* Employee Routes */}
        <Route path="my-assets" element={<div>My Assets (To be implemented)</div>} />
        <Route path="requisitions" element={<div>My Requisitions (To be implemented)</div>} />

        {/* Ticket Routes */}
        {['coordinator', 'department_coordinator', 'admin', 'superadmin'].includes(user?.role) && (
          <Route path="tickets" element={<TicketDashboard />} />
        )}

        {/* Reports Routes */}
        <Route path="reports/dashboard" element={<div>Reports Dashboard (To be implemented)</div>} />
        <Route path="reports/assets" element={<div>Asset Reports (To be implemented)</div>} />
        <Route path="reports/tickets" element={<div>Ticket Reports (To be implemented)</div>} />

        {/* Settings - Superadmin only */}
        {user?.role === 'superadmin' && (
          <>
            <Route path="settings/permission-control" element={<SuperAdminPermissions />} />
            <Route path="settings/field-templates" element={<TemplateManager />} />
          </>
        )}

        {/* Error Routes */}
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default AppRouter