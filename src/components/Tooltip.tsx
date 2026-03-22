import { cloneElement, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  text: string;
  placement?: 'top' | 'bottom';
  children: React.ReactElement;
}

const SHOW_DELAY_MS = 250;
const HIDE_DELAY_MS = 80;

export function Tooltip({ text, placement = 'top', children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [delayedVisible, setDelayedVisible] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({ left: -9999, top: -9999 });
  const [viewportSize, setViewportSize] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onResize = () => setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scheduleShow = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    showTimerRef.current = setTimeout(() => {
      setVisible(true);
      showTimerRef.current = null;
    }, SHOW_DELAY_MS);
  };

  const scheduleHide = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      setDelayedVisible(false);
      hideTimerRef.current = null;
    }, HIDE_DELAY_MS);
  };

  useEffect(() => {
    if (visible) setDelayedVisible(true);
  }, [visible]);

  useLayoutEffect(() => {
    if (!delayedVisible || !anchorRef.current || !tooltipRef.current) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const tooltipEl = tooltipRef.current;
    const ttWidth = tooltipEl.offsetWidth;
    const ttHeight = tooltipEl.offsetHeight;
    const gap = 8;
    const centerX = anchorRect.left + anchorRect.width / 2;
    let left = centerX - ttWidth / 2;
    let top: number;
    if (placement === 'top') {
      top = anchorRect.top - ttHeight - gap;
    } else {
      top = anchorRect.bottom + gap;
    }
    left = Math.max(8, Math.min(viewportSize.w - ttWidth - 8, left));
    top = Math.max(8, Math.min(viewportSize.h - ttHeight - 8, top));
    setStyle({ left, top });
  }, [delayedVisible, placement, viewportSize]);

  useEffect(() => {
    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const tooltipEl = delayedVisible ? (
    <div
      ref={tooltipRef}
      role="tooltip"
      className="fixed z-[99999] px-3.5 py-2.5 text-sm font-medium text-slate-100 bg-slate-900/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-700/50 whitespace-nowrap pointer-events-none select-none animate-tooltip"
      style={style}
    >
      {text}
      <span
        className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/95 rotate-45"
        style={
          placement === 'top'
            ? { bottom: -5, borderBottom: '1px solid rgb(51 65 85 / 0.5)', borderRight: '1px solid rgb(51 65 85 / 0.5)' }
            : { top: -5, borderTop: '1px solid rgb(51 65 85 / 0.5)', borderLeft: '1px solid rgb(51 65 85 / 0.5)' }
        }
      />
    </div>
  ) : null;

  const childWithTitle = cloneElement(children, { title: text });

  return (
    <span
      ref={anchorRef}
      className="inline-flex"
      onMouseEnter={scheduleShow}
      onMouseLeave={scheduleHide}
    >
      {childWithTitle}
      {tooltipEl && createPortal(tooltipEl, document.body)}
    </span>
  );
}
