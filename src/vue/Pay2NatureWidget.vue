<template>
  <div :id="effectiveContainerId" ref="containerRef" :class="className" :style="style"></div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch, type WatchStopHandle } from 'vue';
import { Pay2NatureWidget, Pay2NatureWidgetOptions, ContributionData } from '../core/Pay2NatureWidget';

// Module-level counter for generating unique fallback container IDs across
// multiple `<Pay2NatureWidget>` instances on the same page.
let p2nInstanceCounter = 0;

export default defineComponent({
  name: 'Pay2NatureWidget',
  props: {
    widgetToken: {
      type: String,
      required: true,
    },
    baseUrl: {
      type: String,
      required: true,
    },
    /**
     * Container element id. If omitted, a unique id is generated automatically
     * so multiple instances on the same page do not collide.
     */
    containerId: {
      type: String,
      default: undefined,
    },
    onContribution: {
      type: Function as () => (data: ContributionData) => void,
      default: undefined,
    },
    onToggle: {
      type: Function as () => (isEnabled: boolean) => void,
      default: undefined,
    },
    onError: {
      type: Function as () => (error: Error) => void,
      default: undefined,
    },
    className: {
      type: String,
      default: '',
    },
    style: {
      type: [String, Object] as unknown as () => string | Record<string, string | number>,
      default: () => ({}),
    },
  },
  emits: ['contribution', 'error', 'toggle'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    const fallbackContainerId = `pay2nature-widget-${++p2nInstanceCounter}`;
    const effectiveContainerId = computed(() => props.containerId ?? fallbackContainerId);
    let widgetInstance: Pay2NatureWidget | null = null;
    const watchStops: WatchStopHandle[] = [];

    const initializeWidget = () => {
      if (!containerRef.value) return;

      const options: Pay2NatureWidgetOptions = {
        widgetToken: props.widgetToken,
        baseUrl: props.baseUrl,
        container: containerRef.value,
        onContribution: (data) => {
          props.onContribution?.(data);
          emit('contribution', data);
        },
        onError: (error) => {
          props.onError?.(error);
          emit('error', error);
        },
        onToggle: (isEnabled) => {
          props.onToggle?.(isEnabled);
          emit('toggle', isEnabled);
        },
      };

      widgetInstance = new Pay2NatureWidget(options);
    };

    const reinitialize = () => {
      if (widgetInstance) {
        widgetInstance.destroy();
        widgetInstance = null;
      }
      initializeWidget();
    };

    onMounted(() => {
      initializeWidget();
      // Watch each prop separately to avoid the new-array-each-tick inefficiency
      // and to allow per-prop cleanup on unmount.
      watchStops.push(watch(() => props.widgetToken, reinitialize));
      watchStops.push(watch(() => props.baseUrl, reinitialize));
    });

    onBeforeUnmount(() => {
      for (const stop of watchStops) stop();
      watchStops.length = 0;
      if (widgetInstance) {
        widgetInstance.destroy();
        widgetInstance = null;
      }
    });

    return {
      containerRef,
      effectiveContainerId,
    };
  },
});
</script>

