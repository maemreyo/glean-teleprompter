/**
 * Virtual Scroller Utility
 *
 * Implements virtual scrolling for long-form content to maintain
 * smooth 30fps+ performance with 10,000+ word teleprompter scripts.
 *
 * @feature 012-standalone-story
 */

export interface VirtualScrollItem {
  id: string;
  content: string;
  type: 'paragraph' | 'heading' | 'list';
}

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number;
}

export interface VirtualScrollState {
  visibleItems: VirtualScrollItem[];
  startIndex: number;
  endIndex: number;
  offsetY: number;
  totalHeight: number;
}

/**
 * Minimum paragraph count to enable virtual scrolling
 * Below this threshold, render all content for simplicity
 */
export const VIRTUAL_SCROLL_THRESHOLD = 50;

/**
 * Default overscan amount (number of items to render outside viewport)
 * Provides smoother scrolling by pre-rendering items
 */
export const DEFAULT_OVERSCAN = 5;

/**
 * Calculate which items should be visible based on scroll position
 *
 * @param items - All items in the list
 * @param scrollTop - Current scroll position in pixels
 * @param config - Virtual scroll configuration
 * @returns State with visible items and positioning info
 */
export function calculateVisibleItems(
  items: VirtualScrollItem[],
  scrollTop: number,
  config: VirtualScrollConfig
): VirtualScrollState {
  const { itemHeight, containerHeight, overscan = DEFAULT_OVERSCAN } = config;

  const totalHeight = items.length * itemHeight;

  // Calculate visible range
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / itemHeight) - overscan
  );

  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    totalHeight,
  };
}

/**
 * Split teleprompter content into virtual scroll items
 *
 * @param content - Raw teleprompter text content
 * @param itemHeight - Height of each rendered item in pixels
 * @returns Array of virtual scroll items
 */
export function parseContentToItems(
  content: string,
  itemHeight: number = 60
): VirtualScrollItem[] {
  // Split content by double newlines to identify paragraphs
  const paragraphs = content.split(/\n\n+/);

  return paragraphs
    .filter(p => p.trim().length > 0)
    .map((para, index) => ({
      id: `para-${index}`,
      content: para.trim(),
      type: 'paragraph' as const,
    }));
}

/**
 * Check if virtual scrolling should be enabled based on content
 *
 * @param content - Teleprompter text content
 * @returns True if virtual scrolling is recommended
 */
export function shouldEnableVirtualScroll(content: string): boolean {
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  return paragraphs.length >= VIRTUAL_SCROLL_THRESHOLD;
}

/**
 * Estimate scroll height for virtual scrolling
 *
 * @param items - All items in the list
 * @param itemHeight - Height of each item
 * @returns Total scroll height in pixels
 */
export function calculateTotalScrollHeight(
  items: VirtualScrollItem[],
  itemHeight: number
): number {
  return items.length * itemHeight;
}

/**
 * Calculate item height based on font size and content
 *
 * @param fontSize - Font size in pixels
 * @param lineCount - Number of lines in the item
 * @returns Estimated item height in pixels
 */
export function estimateItemHeight(
  fontSize: number,
  lineCount: number = 1
): number {
  const lineHeight = fontSize * 1.6; // 1.6 line-height from styles
  const padding = 32; // px-8 py-12 = 16px + 16px padding
  return Math.ceil(lineHeight * lineCount + padding);
}

/**
 * Calculate estimated line count for a paragraph
 *
 * @param content - Paragraph text content
 * @param fontSize - Font size in pixels
 * @param containerWidth - Width of the container in pixels
 * @returns Estimated number of lines
 */
export function estimateLineCount(
  content: string,
  fontSize: number,
  containerWidth: number
): number {
  // Estimate average character width (varies by font, using conservative estimate)
  const avgCharWidth = fontSize * 0.6;
  const charsPerLine = Math.floor(containerWidth / avgCharWidth);
  const words = content.split(/\s+/);
  
  let currentLineLength = 0;
  let lineCount = 1;

  for (const word of words) {
    if (currentLineLength + word.length + 1 > charsPerLine) {
      lineCount++;
      currentLineLength = word.length + 1;
    } else {
      currentLineLength += word.length + 1;
    }
  }

  return lineCount;
}

/**
 * Rebuild virtual scroll items when font size changes
 *
 * @param content - Original content string
 * @param fontSize - New font size
 * @param containerWidth - Container width
 * @returns Array of items with updated heights
 */
export function rebuildItemsWithFontSize(
  content: string,
  fontSize: number,
  containerWidth: number
): { items: VirtualScrollItem[]; itemHeight: number } {
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  const items: VirtualScrollItem[] = [];
  let totalHeight = 0;

  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i].trim();
    const lineCount = estimateLineCount(para, fontSize, containerWidth);
    const itemHeight = estimateItemHeight(fontSize, lineCount);
    
    items.push({
      id: `para-${i}`,
      content: para,
      type: 'paragraph',
    });

    totalHeight += itemHeight;
  }

  // Use average height for uniform sizing (simplifies calculations)
  const avgItemHeight = Math.ceil(totalHeight / items.length);

  return { items, itemHeight: avgItemHeight };
}
