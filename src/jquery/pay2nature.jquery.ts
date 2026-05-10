/**
 * jQuery Plugin Wrapper for Pay2Nature Widget
 */

import { Pay2NatureWidget, Pay2NatureWidgetOptions } from '../core/Pay2NatureWidget';

type JQueryStatic = {
  fn: Record<string, unknown>;
  (selector: HTMLElement): JQuery;
};

declare global {
  // Minimal local JQuery declaration so the plugin compiles without taking a
  // dependency on @types/jquery. Users with @types/jquery installed will get
  // their richer typings via TypeScript declaration merging.
  interface JQuery {
    pay2nature(options: Pay2NatureWidgetOptions): JQuery;
    pay2nature(method: 'destroy'): JQuery;
    each(callback: (this: HTMLElement, index: number, element: HTMLElement) => void): JQuery;
    data(key: string): unknown;
    data(key: string, value: unknown): JQuery;
    removeData(key: string): JQuery;
  }
}

(function ($: JQueryStatic | false | undefined) {
  'use strict';

  // Fail fast (and loudly) if jQuery is not loaded.
  if (!$ || !$.fn) {
    if (typeof console !== 'undefined') {
      console.warn(
        'Pay2Nature jQuery plugin: jQuery is not available. The plugin will not be registered.'
      );
    }
    return;
  }

  const PLUGIN_NAME = 'pay2nature';
  const DATA_KEY = `plugin_${PLUGIN_NAME}`;

  interface Pay2NaturePluginData {
    instance: Pay2NatureWidget;
  }

  ($.fn as Record<string, unknown>)[PLUGIN_NAME] = function (
    this: JQuery,
    optionsOrMethod: Pay2NatureWidgetOptions | string
  ): JQuery {
    return this.each(function (this: HTMLElement) {
      const $element = $(this);
      const data = $element.data(DATA_KEY) as Pay2NaturePluginData | undefined;

      // Handle method calls
      if (typeof optionsOrMethod === 'string') {
        const method = optionsOrMethod;
        if (method === 'destroy') {
          if (data && data.instance) {
            data.instance.destroy();
            $element.removeData(DATA_KEY);
          }
        }
        return;
      }

      // Handle initialization
      const options = optionsOrMethod as Pay2NatureWidgetOptions;

      // Destroy existing instance if any
      if (data && data.instance) {
        data.instance.destroy();
      }

      // Create new instance
      const instance = new Pay2NatureWidget({
        ...options,
        container: this,
      });

      // Store instance
      $element.data(DATA_KEY, { instance });
    });
  };
})(typeof window !== 'undefined' ? ((window as unknown as { jQuery?: JQueryStatic }).jQuery as JQueryStatic | undefined) : undefined);

