import * as React from 'react';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface ConfirmTooltipProps {
  message: string;
  onConfirm: () => void;
  children: React.ReactElement;
  placement?: Placement;
}

const TOOLTIP_W = 160;
const TOOLTIP_H = 90;
const GAP = 4;

function getFlippedPlacement(preferred: Placement, anchor: DOMRect): Placement {
  const { innerWidth, innerHeight } = window;
  const spaceRight = innerWidth - anchor.right;
  const spaceLeft = anchor.left;
  const spaceBottom = innerHeight - anchor.bottom;
  const spaceTop = anchor.top;

  if (preferred === 'right') return spaceRight >= TOOLTIP_W + GAP ? 'right' : 'left';
  if (preferred === 'left') return spaceLeft >= TOOLTIP_W + GAP ? 'left' : 'right';
  if (preferred === 'bottom') return spaceBottom >= TOOLTIP_H + GAP ? 'bottom' : 'top';
  if (preferred === 'top') return spaceTop >= TOOLTIP_H + GAP ? 'top' : 'bottom';
  return preferred;
}

function getTooltipStyle(anchor: DOMRect, p: Placement): React.CSSProperties {
  const ax = anchor.left + anchor.width / 2;
  const ay = anchor.top + anchor.height / 2;
  if (p === 'top') return { left: ax, top: anchor.top, transform: 'translate(-50%, calc(-100% - 4px))' };
  if (p === 'bottom') return { left: ax, top: anchor.bottom, transform: 'translate(-50%, 4px)' };
  if (p === 'left') return { left: anchor.left, top: ay, transform: 'translate(calc(-100% - 4px), -50%)' };
  return { left: anchor.right, top: ay, transform: 'translate(4px, -50%)' };
}

export function ConfirmTooltip({ message, onConfirm, children, placement = 'top' }: ConfirmTooltipProps) {
  const [open, setOpen] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const p = getFlippedPlacement(placement, rect);
    setTooltipStyle(getTooltipStyle(rect, p));
  }, [open, placement]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || tooltipRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const handleCancel = () => setOpen(false);

  const child = children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
  const originalOnClick = child.props.onClick;

  const tooltipEl = open ? (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] min-w-[140px] py-2 px-3 bg-slate-800 text-white text-sm rounded-lg shadow-lg"
      style={tooltipStyle}
      role="tooltip"
    >
      <p className="mb-2 text-xs">{message}</p>
      <div className="flex gap-1.5 justify-end">
        <button type="button" onClick={handleCancel} className="px-2 py-1 text-xs rounded bg-slate-600 hover:bg-slate-500">
          Cancel
        </button>
        <button type="button" onClick={handleConfirm} className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-500">
          Remove
        </button>
      </div>
    </div>
  ) : null;

  return (
    <span className="inline-block" ref={anchorRef} onClick={e => e.stopPropagation()}>
      {React.cloneElement(child, {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          if (open) return;
          setOpen(true);
          originalOnClick?.(e);
        },
      })}
      {open && createPortal(tooltipEl, document.body)}
    </span>
  );
}
