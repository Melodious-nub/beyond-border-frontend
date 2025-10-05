import { Injectable } from '@angular/core';

export interface VirtualScrollItem {
  id: string | number;
  height: number;
  data: any;
}

export interface VirtualScrollConfig {
  containerHeight: number;
  itemHeight: number;
  bufferSize: number;
}

export interface VirtualScrollState {
  startIndex: number;
  endIndex: number;
  visibleItems: VirtualScrollItem[];
  totalHeight: number;
  offsetY: number;
}

/**
 * Virtual scrolling service for performance optimization
 * when dealing with large lists
 */
@Injectable({
  providedIn: 'root'
})
export class VirtualScrollService {
  /**
   * Calculate virtual scroll state
   */
  calculateVirtualScroll(
    items: VirtualScrollItem[],
    scrollTop: number,
    config: VirtualScrollConfig
  ): VirtualScrollState {
    const { containerHeight, itemHeight, bufferSize } = config;
    
    // Calculate visible range
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
    );

    // Get visible items
    const visibleItems = items.slice(startIndex, endIndex + 1);

    // Calculate total height and offset
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    return {
      startIndex,
      endIndex,
      visibleItems,
      totalHeight,
      offsetY
    };
  }

  /**
   * Create virtual scroll items from data
   */
  createVirtualScrollItems<T>(
    data: T[],
    itemHeight: number = 50,
    idField: keyof T = 'id' as keyof T
  ): VirtualScrollItem[] {
    return data.map((item, index) => ({
      id: (item[idField] as string | number) || index,
      height: itemHeight,
      data: item
    }));
  }

  /**
   * Optimize scroll performance with throttling
   */
  createOptimizedScrollHandler(
    callback: (scrollTop: number) => void,
    throttleMs: number = 16
  ): (event: Event) => void {
    let ticking = false;

    return (event: Event) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const target = event.target as HTMLElement;
          callback(target.scrollTop);
          ticking = false;
        });
        ticking = true;
      }
    };
  }
}
