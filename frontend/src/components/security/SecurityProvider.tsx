'use client';

import { useEffect, useRef, useCallback } from 'react';
// Define SecurityEventType locally to avoid import issues
type SecurityEventType = 
  | 'COPY_ATTEMPT'
  | 'PASTE_ATTEMPT'
  | 'RIGHT_CLICK'
  | 'TAB_SWITCH'
  | 'SCREENSHOT_ATTEMPT'
  | 'DEV_TOOLS_OPEN'
  | 'KEYBOARD_SHORTCUT'
  | 'FULLSCREEN_EXIT'
  | 'FOCUS_LOST';

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
      logSecurityEvent('COPY_ATTEMPT');
      return false;
    };

    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logSecurityEvent('COPY_ATTEMPT');
      return false;
    };

    const preventPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logSecurityEvent('PASTE_ATTEMPT');
      return false;
    };

    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logSecurityEvent('RIGHT_CLICK');
      return false;
    };

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // Prevent common copy/paste shortcuts
      if ((e.ctrlKey || e.metaKey) && 
          (e.key === 'c' || e.key === 'v' || e.key === 'x' || 
           e.key === 'a' || e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        logSecurityEvent('KEYBOARD_SHORTCUT', { key: e.key });
        return false;
      }

      // Prevent F12 (developer tools)
      if (e.key === 'F12') {
        e.preventDefault();
        logSecurityEvent('DEV_TOOLS_OPEN');
        return false;
      }

      // Prevent Ctrl+Shift+I (developer tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        logSecurityEvent('DEV_TOOLS_OPEN');
        return false;
      }
    };

    const preventPrint = () => {
      logSecurityEvent('SCREENSHOT_ATTEMPT');
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
        logSecurityEvent('TAB_SWITCH');
        visibilityTimer.current = setTimeout(() => {
          logSecurityEvent('TAB_SWITCH', {
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
      logSecurityEvent('FOCUS_LOST');
      focusTimer.current = setTimeout(() => {
        logSecurityEvent('FOCUS_LOST', {
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
          logSecurityEvent('DEV_TOOLS_OPEN', {
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
        logSecurityEvent('SCREENSHOT_ATTEMPT');
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
