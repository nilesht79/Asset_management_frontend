/**
 * useResponsive Hook
 * Detects current screen breakpoint and provides responsive utilities
 */

import { useState, useEffect } from 'react';
import { Grid } from 'antd';

const { useBreakpoint } = Grid;

const useResponsive = () => {
  const screens = useBreakpoint();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Mobile: < 768px
    setIsMobile(!screens.md);

    // Tablet: 768px - 1199px
    setIsTablet(screens.md && !screens.lg);

    // Desktop: >= 1200px
    setIsDesktop(screens.xl);
  }, [screens]);

  return {
    screens,
    isMobile,
    isTablet,
    isDesktop,
    // Utility for getting column span based on screen size
    getColSpan: (xs = 24, sm = 12, md = 8, lg = 6, xl = 6) => ({
      xs,
      sm,
      md,
      lg,
      xl
    })
  };
};

export default useResponsive;
