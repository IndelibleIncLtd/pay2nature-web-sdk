/**
 * React Component Wrapper for Pay2Nature Widget
 */

import React, { useEffect, useRef } from 'react';
import { Pay2NatureWidget, Pay2NatureWidgetOptions, ContributionData } from '../core/Pay2NatureWidget';

export interface Pay2NatureWidgetProps {
  widgetToken: string;
  baseUrl: string;
  /**
   * Container element id. If omitted, a unique id is generated automatically
   * so multiple `<Pay2NatureWidgetComponent>` instances on the same page do
   * not collide. Override only when you need a stable selector for your own
   * styling or testing hooks.
   */
  containerId?: string;
  onContribution?: (data: ContributionData) => void;
  onToggle?: (isEnabled: boolean) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

// Module-level counter for generating unique fallback container IDs.
// Works in React 16.8+ (cannot use React 18's useId because the SDK supports older versions).
let p2nInstanceCounter = 0;

export const Pay2NatureWidgetComponent: React.FC<Pay2NatureWidgetProps> = ({
  widgetToken,
  baseUrl,
  containerId,
  onContribution,
  onToggle,
  onError,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackIdRef = useRef<string | null>(null);
  if (fallbackIdRef.current === null) {
    fallbackIdRef.current = `pay2nature-widget-${++p2nInstanceCounter}`;
  }
  const effectiveContainerId = containerId ?? fallbackIdRef.current;
  const widgetInstanceRef = useRef<Pay2NatureWidget | null>(null);
  const callbacksRef = useRef({ onContribution, onToggle, onError });

  // Update callbacks ref when they change (without causing re-initialization)
  useEffect(() => {
    callbacksRef.current = { onContribution, onToggle, onError };
  }, [onContribution, onToggle, onError]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing instance if it exists
    if (widgetInstanceRef.current) {
      widgetInstanceRef.current.destroy();
      widgetInstanceRef.current = null;
    }

    const options: Pay2NatureWidgetOptions = {
      widgetToken,
      baseUrl,
      container: containerRef.current,
      onContribution: (data) => callbacksRef.current.onContribution?.(data),
      onToggle: (isEnabled) => callbacksRef.current.onToggle?.(isEnabled),
      onError: (error) => callbacksRef.current.onError?.(error),
    };

    widgetInstanceRef.current = new Pay2NatureWidget(options);

    return () => {
      if (widgetInstanceRef.current) {
        widgetInstanceRef.current.destroy();
        widgetInstanceRef.current = null;
      }
    };
  }, [widgetToken, baseUrl]); // Only re-initialize when token or baseUrl changes

  return (
    <div
      id={effectiveContainerId}
      ref={containerRef}
      className={className}
      style={style}
    />
  );
};

Pay2NatureWidgetComponent.displayName = 'Pay2NatureWidgetComponent';

export default Pay2NatureWidgetComponent;

