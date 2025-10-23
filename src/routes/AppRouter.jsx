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
import BoardMaster from '../components/modules/masters/boards/BoardMaster'
import TemplateManager from '../components/modules/masters/componentFieldTemplates/TemplateManager'

import AssetInventory from "../components/modules/assets/AssetInventory"
import AssetMovement from "../pages/AssetMovement"
import TicketDashboard from "../pages/TicketDashboard"

// Standby Assets Components
import StandbyPool from "../pages/StandbyPool"
import StandbyAssignments from "../pages/StandbyAssignments"

// Requisition Components
import MyRequisitions from "../pages/MyRequisitions"
import AllRequisitions from "../pages/AllRequisitions"
import NewRequisition from "../pages/NewRequisition"
import RequisitionDetails from "../pages/RequisitionDetails"
import DepartmentHeadApprovals from "../pages/DepartmentHeadApprovals"
import ITHeadApprovals from "../pages/ITHeadApprovals"
import AssetAssignment from "../pages/AssetAssignment"
import DeliveryManagement from "../pages/DeliveryManagement"
import EngineerDeliveries from "../pages/EngineerDeliveries"

// Permission Control Component
import SuperAdminPermissions from '../pages/SuperAdminPermissions'

// Reconciliation Components
import ReconciliationList from '../components/modules/reconciliation/ReconciliationList'
import ReconciliationAssets from '../components/modules/reconciliation/ReconciliationAssets'

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
            <Route path="masters/boards" element={<BoardMaster />} />
            <Route path="masters/oem" element={<OEMList />} />
            <Route path="masters/products" element={<ProductMaster />} />
            <Route path="masters/locations" element={<LocationMaster />} />
          </>
        )}

        {/* Asset Management Routes */}
        {['it_head', 'coordinator', 'admin', 'superadmin', 'department_coordinator'].includes(user?.role) && (
          <>
            <Route path="assets/inventory" element={<AssetInventory />} />
            {['coordinator', 'admin', 'superadmin', 'department_coordinator'].includes(user?.role) && (
              <>
                <Route path="assets/assignment" element={<div>Asset Assignment (To be implemented)</div>} />
                <Route path="assets/movement" element={<AssetMovement />} />
                <Route path="assets/requisitions" element={<div>Asset Requisitions (To be implemented)</div>} />
                <Route path="standby/pool" element={<StandbyPool />} />
                <Route path="standby/assignments" element={<StandbyAssignments />} />
              </>
            )}
          </>
        )}


        {/* Employee Routes */}
        <Route path="my-assets" element={<div>My Assets (To be implemented)</div>} />

        {/* Requisition Routes - Available to all employees */}
        <Route path="requisitions/my-requisitions" element={<MyRequisitions />} />
        <Route path="requisitions/new" element={<NewRequisition />} />
        <Route path="requisitions/details/:id" element={<RequisitionDetails />} />
        <Route path="requisitions/:id" element={<RequisitionDetails />} />

        {/* All Requisitions - For coordinators, dept heads, IT heads */}
        {['it_head', 'coordinator', 'department_head', 'admin', 'superadmin'].includes(user?.role) && (
          <Route path="requisitions/all-requisitions" element={<AllRequisitions />} />
        )}

        {/* Department Head Approval Routes */}
        {['department_head', 'department_coordinator', 'admin', 'superadmin'].includes(user?.role) && (
          <Route path="approvals/department-head" element={<DepartmentHeadApprovals />} />
        )}

        {/* IT Head Approval Routes - IT Head only */}
        {['it_head', 'admin', 'superadmin'].includes(user?.role) && (
          <Route path="approvals/it-head" element={<ITHeadApprovals />} />
        )}

        {/* Coordinator Routes - Asset assignment and delivery management */}
        {['coordinator', 'admin', 'superadmin'].includes(user?.role) && (
          <>
            <Route path="assignments/asset-assignment" element={<AssetAssignment />} />
            <Route path="deliveries/management" element={<DeliveryManagement />} />
          </>
        )}

        {/* Engineer Delivery Routes */}
        {user?.role === 'engineer' && (
          <Route path="deliveries/my-deliveries" element={<EngineerDeliveries />} />
        )}

        {/* Ticket Routes */}
        {['it_head', 'coordinator', 'department_coordinator', 'admin', 'superadmin'].includes(user?.role) && (
          <Route path="tickets" element={<TicketDashboard />} />
        )}

        {/* Reports Routes */}
        <Route path="reports/dashboard" element={<div>Reports Dashboard (To be implemented)</div>} />
        <Route path="reports/assets" element={<div>Asset Reports (To be implemented)</div>} />
        <Route path="reports/tickets" element={<div>Ticket Reports (To be implemented)</div>} />

        {/* Reconciliation Routes - Admin, Superadmin, Engineer */}
        {['admin', 'superadmin', 'engineer'].includes(user?.role) && (
          <>
            <Route path="reconciliation" element={<ReconciliationList />} />
            <Route path="reconciliation/:id/assets" element={<ReconciliationAssets />} />
          </>
        )}

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