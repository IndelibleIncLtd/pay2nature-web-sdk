/**
 * React Component Wrapper for Pay2Nature Widget
 */

import React, { useEffect, useRef } from 'react';
import { Pay2NatureWidget, Pay2NatureWidgetOptions, ContributionData } from '../core/Pay2NatureWidget';

export interface Pay2NatureWidgetProps {
  widgetToken: string;
  baseUrl: string;
  containerId?: string;
  onContribution?: (data: ContributionData) => void;
  onToggle?: (isEnabled: boolean) => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Pay2NatureWidgetComponent: React.FC<Pay2NatureWidgetProps> = ({
  widgetToken,
  baseUrl,
  containerId = 'pay2nature-widget',
  onContribution,
  onToggle,
  onError,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetInstanceRef = useRef<Pay2NatureWidget | null>(null);
  const callbacksRef = useRef({ onContribution, onToggle, onError });

  // Update callbacks ref when they change (without causing re-initialization)
  useEffect(() => {
    callbacksRef.current = { onContribution, onToggle, onError };
  }, [onContribution, onToggle, onError]);

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;

    // Destroy existing instance if it exists
    if (widgetInstanceRef.current) {
      widgetInstanceRef.current.destroy();
      widgetInstanceRef.current = null;
    }

    // Small delay to ensure cleanup is complete (helps with React StrictMode)
    const initWidget = () => {
      if (!isMounted || !containerRef.current) return;

      // Create wrapper functions that use the latest callbacks from ref
      const options: Pay2NatureWidgetOptions = {
        widgetToken,
        baseUrl,
        container: containerRef.current,
        onContribution: (data) => callbacksRef.current.onContribution?.(data),
        onToggle: (isEnabled) => callbacksRef.current.onToggle?.(isEnabled),
        onError: (error) => callbacksRef.current.onError?.(error),
      };

      widgetInstanceRef.current = new Pay2NatureWidget(options);
    };

    // Use requestAnimationFrame to ensure DOM is ready and avoid race conditions
    requestAnimationFrame(initWidget);

    return () => {
      isMounted = false;
      if (widgetInstanceRef.current) {
        widgetInstanceRef.current.destroy();
        widgetInstanceRef.current = null;
      }
    };
  }, [widgetToken, baseUrl]); // Only re-initialize when token or baseUrl changes

  return (
    <div
      id={containerId}
      ref={containerRef}
      className={className}
      style={style}
    />
  );
};

export default Pay2NatureWidgetComponent;

