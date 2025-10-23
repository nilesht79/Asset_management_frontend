import { configureStore } from '@reduxjs/toolkit'

// Import slice reducers
import authSlice from './slices/authSlice'
import userSlice from './slices/userSlice'
import masterSlice from './slices/masterSlice'
import assetSlice from './slices/assetSlice'
import uiSlice from './slices/uiSlice'
import permissionControlSlice from './slices/permissionControlSlice'
import componentFieldTemplatesSlice from './slices/componentFieldTemplatesSlice'
import standbySlice from './slices/standbySlice'
import standbyAssignmentSlice from './slices/standbyAssignmentSlice'
import requisitionSlice from './slices/requisitionSlice'
import reconciliationSlice from './slices/reconciliationSlice'

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authSlice,
    user: userSlice,
    master: masterSlice,
    asset: assetSlice,
    ui: uiSlice,
    permissionControl: permissionControlSlice,
    componentFieldTemplates: componentFieldTemplatesSlice,
    standby: standbySlice,
    standbyAssignment: standbyAssignmentSlice,
    requisitions: requisitionSlice,
    reconciliation: reconciliationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

// For TypeScript users, these types would be:
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch

export default store