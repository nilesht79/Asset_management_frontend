// Role-based theme system for dynamic UI theming
// Based on the PolePlus logo red color scheme and role hierarchy

export const ROLE_THEMES = {
  superadmin: {
    name: 'Superadmin',
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb', // Core blue
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gradient: 'from-blue-600 to-blue-700',
    accent: '#2563eb',
    sidebar: {
      bg: '#1e3a8a', // Deep blue
      hover: '#1e40af',
      active: '#1d4ed8',
      text: '#ffffff',
      icon: '#bfdbfe'
    },
    header: {
      bg: '#ffffff',
      border: '#2563eb',
      accent: '#2563eb'
    }
  },
  admin: {
    name: 'Admin',
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb', // Core blue
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gradient: 'from-blue-600 to-blue-700',
    accent: '#2563eb',
    sidebar: {
      bg: '#1e3a8a', // Deep blue
      hover: '#1e40af',
      active: '#1d4ed8',
      text: '#ffffff',
      icon: '#bfdbfe'
    },
    header: {
      bg: '#ffffff',
      border: '#2563eb',
      accent: '#2563eb'
    }
  },
  department_head: {
    name: 'Department Head',
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb', // Core blue
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gradient: 'from-blue-600 to-blue-700',
    accent: '#2563eb',
    sidebar: {
      bg: '#1e3a8a', // Deep blue
      hover: '#1e40af',
      active: '#1d4ed8',
      text: '#ffffff',
      icon: '#bfdbfe'
    },
    header: {
      bg: '#ffffff',
      border: '#2563eb',
      accent: '#2563eb'
    }
  },
  coordinator: {
    name: 'Coordinator',
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb', // Core blue
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gradient: 'from-blue-600 to-blue-700',
    accent: '#2563eb',
    sidebar: {
      bg: '#1e3a8a', // Deep blue
      hover: '#1e40af',
      active: '#1d4ed8',
      text: '#ffffff',
      icon: '#bfdbfe'
    },
    header: {
      bg: '#ffffff',
      border: '#2563eb',
      accent: '#2563eb'
    }
  },
  department_coordinator: {
    name: 'Department Coordinator',
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb', // Core blue
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gradient: 'from-blue-600 to-blue-700',
    accent: '#2563eb',
    sidebar: {
      bg: '#1e3a8a', // Deep blue
      hover: '#1e40af',
      active: '#1d4ed8',
      text: '#ffffff',
      icon: '#bfdbfe'
    },
    header: {
      bg: '#ffffff',
      border: '#2563eb',
      accent: '#2563eb'
    }
  },
  engineer: {
    name: 'Engineer',
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb', // Core blue
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gradient: 'from-blue-600 to-blue-700',
    accent: '#2563eb',
    sidebar: {
      bg: '#1e3a8a', // Deep blue
      hover: '#1e40af',
      active: '#1d4ed8',
      text: '#ffffff',
      icon: '#bfdbfe'
    },
    header: {
      bg: '#ffffff',
      border: '#2563eb',
      accent: '#2563eb'
    }
  },
  employee: {
    name: 'Employee',
    primary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569', // Core slate
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    gradient: 'from-slate-600 to-slate-700',
    accent: '#475569',
    sidebar: {
      bg: '#0f172a', // Deep slate
      hover: '#1e293b',
      active: '#334155',
      text: '#ffffff',
      icon: '#e2e8f0'
    },
    header: {
      bg: '#ffffff',
      border: '#475569',
      accent: '#475569'
    }
  }
}

// Get theme by role
export const getThemeByRole = (role) => {
  return ROLE_THEMES[role] || ROLE_THEMES.employee
}

// Get CSS variables for dynamic theming
export const getThemeCSSVars = (theme) => {
  return {
    '--primary-50': theme.primary[50],
    '--primary-100': theme.primary[100],
    '--primary-200': theme.primary[200],
    '--primary-300': theme.primary[300],
    '--primary-400': theme.primary[400],
    '--primary-500': theme.primary[500],
    '--primary-600': theme.primary[600],
    '--primary-700': theme.primary[700],
    '--primary-800': theme.primary[800],
    '--primary-900': theme.primary[900],
    '--accent-color': theme.accent,
    '--sidebar-bg': theme.sidebar.bg,
    '--sidebar-hover': theme.sidebar.hover,
    '--sidebar-active': theme.sidebar.active,
    '--sidebar-text': theme.sidebar.text,
    '--sidebar-icon': theme.sidebar.icon,
    '--header-bg': theme.header.bg,
    '--header-border': theme.header.border,
    '--header-accent': theme.header.accent,
  }
}

// Apply theme to document root
export const applyTheme = (role) => {
  const theme = getThemeByRole(role)
  const cssVars = getThemeCSSVars(theme)

  Object.entries(cssVars).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value)
  })

  // Set theme data attribute for CSS targeting
  document.documentElement.setAttribute('data-theme', role)

  return theme
}

// Theme context for React components
export const ThemeContext = {
  getTheme: getThemeByRole,
  apply: applyTheme,
  cssVars: getThemeCSSVars
}