'use client';

import { useEffect, useRef, useCallback } from 'react';
import { SecurityEventType } from '@/types';

interface SecurityProviderProps {
  children: React.ReactNode;
  enableAntiCopy?: boolean;
  sessionId?: string;
  onSecurityEvent?: (event: SecurityEventType, data?: any) => void;
}

export function SecurityProvider({ 
  children, 
  enableAntiCopy = true, 
  sessionId,
  onSecurityEvent 
}: SecurityProviderProps) {
  const originalTitle = useRef(typeof document !== 'undefined' ? document.title : '');
  const focusTimer = useRef<NodeJS.Timeout>();
  const visibilityTimer = useRef<NodeJS.Timeout>();

  const logSecurityEvent = useCallback((eventType: SecurityEventType, data?: any) => {
    console.warn(`Security Event: ${eventType}`, data);
    onSecurityEvent?.(eventType, data);

    // Send event to backend if sessionId is provided
    if (sessionId && typeof window !== 'undefined') {
      fetch(`/api/v1/quizzes/sessions/${sessionId}/security-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          eventType,
          data,
          timestamp: new Date().toISOString(),
        }),
      }).catch(error => {
        console.error('Failed to log security event:', error);
      });
    }
  }, [sessionId, onSecurityEvent]);

  // Prevent text selection
  useEffect(() => {
    if (!enableAntiCopy || typeof document === 'undefined') return;

    const preventSelection = (e: Event) => {
      e.preventDefault();
      logSecurityEvent(SecurityEventType.SELECT_TEXT_ATTEMPT);
      return false;
    };

    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logSecurityEvent(SecurityEventType.COPY_ATTEMPT);
      return false;
    };

    const preventPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logSecurityEvent(SecurityEventType.PASTE_ATTEMPT);
      return false;
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logSecurityEvent(SecurityEventType.RIGHT_CLICK_ATTEMPT);
      return false;
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // Prevent common copy/paste shortcuts
      if ((e.ctrlKey || e.metaKey) && 
          (e.key === 'c' || e.key === 'v' || e.key === 'x' || 
           e.key === 'a' || e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        logSecurityEvent(SecurityEventType.KEYBOARD_SHORTCUT, { key: e.key });
        return false;
      }

      // Prevent F12 (developer tools)
      if (e.key === 'F12') {
        e.preventDefault();
        logSecurityEvent(SecurityEventType.DEV_TOOLS_DETECTED);
        return false;
      }

      // Prevent Ctrl+Shift+I (developer tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        logSecurityEvent(SecurityEventType.DEV_TOOLS_DETECTED);
        return false;
      }
    };

    const preventPrint = () => {
      logSecurityEvent(SecurityEventType.PRINT_ATTEMPT);
      return false;
    };

    // Add event listeners
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('paste', preventPaste);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyboardShortcuts);
    window.addEventListener('beforeprint', preventPrint);

    // Prevent drag and drop
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });

    // Prevent text selection in CSS
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      input, textarea {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup event listeners
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('paste', preventPaste);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
      window.removeEventListener('beforeprint', preventPrint);
      document.head.removeChild(style);
    };
  }, [enableAntiCopy, logSecurityEvent]);

  // Monitor tab switching and window focus
  useEffect(() => {
    if (!enableAntiCopy || typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logSecurityEvent(SecurityEventType.TAB_SWITCH);
        visibilityTimer.current = setTimeout(() => {
          logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
            message: 'Tab switched for extended time'
          });
        }, 5000); // Log suspicious activity if tab is hidden for more than 5 seconds
      } else {
        if (visibilityTimer.current) {
          clearTimeout(visibilityTimer.current);
        }
      }
    };

    const handleWindowBlur = () => {
      logSecurityEvent(SecurityEventType.WINDOW_BLUR);
      focusTimer.current = setTimeout(() => {
        logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          message: 'Window lost focus for extended time'
        });
      }, 3000); // Log suspicious activity if window loses focus for more than 3 seconds
    };

    const handleWindowFocus = () => {
      if (focusTimer.current) {
        clearTimeout(focusTimer.current);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      if (visibilityTimer.current) {
        clearTimeout(visibilityTimer.current);
      }
      if (focusTimer.current) {
        clearTimeout(focusTimer.current);
      }
    };
  }, [enableAntiCopy, logSecurityEvent]);

  // Monitor developer tools
  useEffect(() => {
    if (!enableAntiCopy || typeof window === 'undefined') return;

    let devtools = { open: false, orientation: undefined };
    const threshold = 160;

    const checkDevTools = () => {
      if (window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          logSecurityEvent(SecurityEventType.DEV_TOOLS_DETECTED, {
            message: 'Developer tools opened'
          });
        }
      } else {
        devtools.open = false;
      }
    };

    const interval = setInterval(checkDevTools, 1000);

    // Also check on resize
    window.addEventListener('resize', checkDevTools);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', checkDevTools);
    };
  }, [enableAntiCopy, logSecurityEvent]);

  // Monitor screenshot attempts
  useEffect(() => {
    if (!enableAntiCopy || typeof window === 'undefined') return;

    const handleScreenshot = (e: KeyboardEvent) => {
      // Check for common screenshot shortcuts
      if ((e.ctrlKey && e.shiftKey && e.key === 'S') || // Ctrl+Shift+S (Chrome)
          (e.metaKey && e.shiftKey && e.key === '4') || // Cmd+Shift+4 (Mac)
          (e.metaKey && e.shiftKey && e.key === '5')) { // Cmd+Shift+5 (Mac)
        e.preventDefault();
        logSecurityEvent(SecurityEventType.SCREENSHOT_ATTEMPT);
        return false;
      }
    };

    window.addEventListener('keydown', handleScreenshot);

    return () => {
      window.removeEventListener('keydown', handleScreenshot);
    };
  }, [enableAntiCopy, logSecurityEvent]);

  return <>{children}</>;
}
