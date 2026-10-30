
import { useEffect, useRef } from 'react'
import { Modal } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'

const WARNING_TIME = 2 * 60 * 1000

const ROLE_IDLE_TIMEOUTS = {
  superadmin: 15 * 60 * 1000,
  admin: 15 * 60 * 1000,
  it_head: 20 * 60 * 1000,
  department_head: 20 * 60 * 1000,
  coordinator: 20 * 60 * 1000,
  department_coordinator: 20 * 60 * 1000,
  engineer: 30 * 60 * 1000,
  employee: 30 * 60 * 1000,
}

export default function SessionTimeout() {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector(state => state.auth)

  const warningTimer = useRef(null)
  const logoutTimer = useRef(null)
  const warningModal = useRef(null)
  const lastActivity = useRef(0)
  const loggingOut = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return
    }

    const role = String(user.role || '').trim().toLowerCase()
    const idleTimeout = ROLE_IDLE_TIMEOUTS[role]

    if (!idleTimeout) {
      console.error('Unknown role for idle timeout:', role)
      return
    }

    const warningDelay = idleTimeout - WARNING_TIME

    loggingOut.current = false

    const clearTimers = () => {
      clearTimeout(warningTimer.current)
      clearTimeout(logoutTimer.current)
    }

    const closeWarning = () => {
      if (warningModal.current) {
        warningModal.current.destroy()
        warningModal.current = null
      }
    }

    const endSession = async () => {
      if (loggingOut.current) return

      loggingOut.current = true
      clearTimers()
      closeWarning()

      try {
        await dispatch(logout())
      } finally {
        window.location.replace('/login')
      }
    }

    function resetTimer() {
      if (loggingOut.current) return

      clearTimers()
      closeWarning()

      lastActivity.current = Date.now()

      warningTimer.current = setTimeout(showWarning, warningDelay)
      logoutTimer.current = setTimeout(endSession, idleTimeout)
    }

    function showWarning() {
      if (loggingOut.current) return

      warningModal.current = Modal.confirm({
        title: 'Session Expiring',
        content: 'Your session will expire in 2 minutes due to inactivity.',
        okText: 'Stay Logged In',
        cancelText: 'Log Out Now',
        closable: false,
        maskClosable: false,
        keyboard: false,
        onOk: () => {
          warningModal.current = null
          resetTimer()
        },
        onCancel: () => {
          warningModal.current = null
          endSession()
        },
      })
    }

    const handleActivity = () => {
      const now = Date.now()

      // Throttle frequent mouse movement events.
      if (now - lastActivity.current < 1000) return

      resetTimer()
    }

    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'pointerdown',
    ]

    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    resetTimer()

    return () => {
      clearTimers()
      closeWarning()

      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [dispatch, isAuthenticated, user?.role])

  return null
}
