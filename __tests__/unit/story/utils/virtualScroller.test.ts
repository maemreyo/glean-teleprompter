/**
 * Virtual Scroller Tests
 *
 * Unit tests for virtual scrolling utility functions.
 * Tests cover T086 virtual scrolling implementation.
 *
 * @feature 012-standalone-story
 */

import {
  calculateVisibleItems,
  parseContentToItems,
  shouldEnableVirtualScroll,
  calculateTotalScrollHeight,
  estimateItemHeight,
  estimateLineCount,
  rebuildItemsWithFontSize,
  VIRTUAL_SCROLL_THRESHOLD,
} from '@/lib/story/utils/virtualScroller';

describe('Virtual Scroller Utils', () => {
  describe('parseContentToItems', () => {
    it('should split content into paragraphs by double newlines', () => {
      const content = 'First paragraph\n\nSecond paragraph\n\nThird paragraph';
      const items = parseContentToItems(content);

      expect(items).toHaveLength(3);
      expect(items[0].content).toBe('First paragraph');
      expect(items[1].content).toBe('Second paragraph');
      expect(items[2].content).toBe('Third paragraph');
    });

    it('should filter out empty paragraphs', () => {
      const content = 'First\n\n\nSecond\n\n   \nThird';
      const items = parseContentToItems(content);

      expect(items).toHaveLength(3);
      expect(items[0].content).toBe('First');
      expect(items[1].content).toBe('Second');
      expect(items[2].content).toBe('Third');
    });

    it('should trim whitespace from paragraphs', () => {
      const content = '  First paragraph  \n\n  Second paragraph  ';
      const items = parseContentToItems(content);

      expect(items[0].content).toBe('First paragraph');
      expect(items[1].content).toBe('Second paragraph');
    });

    it('should generate unique IDs for each item', () => {
      const content = 'First\n\nSecond\n\nThird';
      const items = parseContentToItems(content);

      expect(items[0].id).toBe('para-0');
      expect(items[1].id).toBe('para-1');
      expect(items[2].id).toBe('para-2');
    });

    it('should mark all items as paragraph type', () => {
      const content = 'First\n\nSecond';
      const items = parseContentToItems(content);

      expect(items.every(item => item.type === 'paragraph')).toBe(true);
    });
  });

  describe('shouldEnableVirtualScroll', () => {
    it('should return true when content has 50+ paragraphs', () => {
      const content = Array(51).fill('Paragraph').join('\n\n');
      expect(shouldEnableVirtualScroll(content)).toBe(true);
    });

    it('should return false when content has fewer than 50 paragraphs', () => {
      const content = Array(49).fill('Paragraph').join('\n\n');
      expect(shouldEnableVirtualScroll(content)).toBe(false);
    });

    it('should return true when content has exactly 50 paragraphs', () => {
      const content = Array(50).fill('Paragraph').join('\n\n');
      expect(shouldEnableVirtualScroll(content)).toBe(true);
    });

    it('should return false for empty content', () => {
      expect(shouldEnableVirtualScroll('')).toBe(false);
    });

    it('should return false for single paragraph', () => {
      expect(shouldEnableVirtualScroll('Single paragraph')).toBe(false);
    });
  });

  describe('calculateVisibleItems', () => {
    const mockItems = Array.from({ length: 100 }, (_, i) => ({
      id: `item-${i}`,
      content: `Item ${i}`,
      type: 'paragraph' as const,
    }));

    it('should calculate visible range based on scroll position', () => {
      const config = {
        itemHeight: 60,
        containerHeight: 600,
        overscan: 5,
      };

      const result = calculateVisibleItems(mockItems, 300, config);

      expect(result.startIndex).toBeGreaterThanOrEqual(0);
      expect(result.endIndex).toBeLessThan(mockItems.length);
      expect(result.totalHeight).toBe(100 * 60);
    });

    it('should apply overscan to visible range', () => {
      const config = {
        itemHeight: 60,
        containerHeight: 600,
        overscan: 5,
      };

      const result = calculateVisibleItems(mockItems, 600, config);

      // With 600px height and 60px items, exactly 10 items fit
      // With overscan of 5, should show 5 items before and 5 after
      const visibleCount = result.endIndex - result.startIndex + 1;
      expect(visibleCount).toBeGreaterThan(10); // overscan adds extra items
    });

    it('should calculate correct offsetY for positioning', () => {
      const config = {
        itemHeight: 60,
        containerHeight: 600,
        overscan: 5,
      };

      const result = calculateVisibleItems(mockItems, 300, config);

      expect(result.offsetY).toBe(result.startIndex * 60);
    });

    it('should handle scroll position at 0', () => {
      const config = {
        itemHeight: 60,
        containerHeight: 600,
        overscan: 5,
      };

      const result = calculateVisibleItems(mockItems, 0, config);

      expect(result.startIndex).toBe(0); // First item visible
      expect(result.offsetY).toBe(0); // No offset
    });

    it('should handle scroll position at bottom', () => {
      const config = {
        itemHeight: 60,
        containerHeight: 600,
        overscan: 5,
      };

      const maxScroll = 100 * 60 - 600;
      const result = calculateVisibleItems(mockItems, maxScroll, config);

      expect(result.endIndex).toBe(99); // Last item
    });
  });

  describe('calculateTotalScrollHeight', () => {
    it('should calculate total height from item count', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        content: `Item ${i}`,
        type: 'paragraph' as const,
      }));

      const height = calculateTotalScrollHeight(items, 60);
      expect(height).toBe(6000); // 100 * 60
    });

    it('should return 0 for empty items', () => {
      const height = calculateTotalScrollHeight([], 60);
      expect(height).toBe(0);
    });
  });

  describe('estimateItemHeight', () => {
    it('should calculate height based on font size and line count', () => {
      const height = estimateItemHeight(28, 2);
      const expected = 28 * 1.6 * 2 + 32; // fontSize * lineHeight * lines + padding
      expect(height).toBe(Math.ceil(expected));
    });

    it('should calculate height for single line', () => {
      const height = estimateItemHeight(28, 1);
      const expected = 28 * 1.6 * 1 + 32;
      expect(height).toBe(Math.ceil(expected));
    });

    it('should calculate height for multiple lines', () => {
      const height1 = estimateItemHeight(28, 3);
      const height2 = estimateItemHeight(28, 5);
      expect(height2).toBeGreaterThan(height1);
    });
  });

  describe('estimateLineCount', () => {
    it('should estimate lines for short text', () => {
      const lines = estimateLineCount('Short text', 28, 375);
      expect(lines).toBe(1);
    });

    it('should estimate lines for long text', () => {
      const longText = 'This is a very long text that spans multiple lines ';
      const lines = estimateLineCount(longText.repeat(10), 28, 375);
      expect(lines).toBeGreaterThan(1);
    });

    it('should account for container width', () => {
      const text = 'Some text that might wrap';
      const narrowLines = estimateLineCount(text, 28, 200);
      const wideLines = estimateLineCount(text, 28, 600);
      expect(narrowLines).toBeGreaterThanOrEqual(wideLines);
    });

    it('should handle empty string', () => {
      const lines = estimateLineCount('', 28, 375);
      expect(lines).toBe(1);
    });

    it('should account for font size', () => {
      const text = 'Text that wraps differently at different sizes';
      const smallFontLines = estimateLineCount(text.repeat(5), 16, 375);
      const largeFontLines = estimateLineCount(text.repeat(5), 32, 375);
      expect(largeFontLines).toBeGreaterThan(smallFontLines);
    });
  });

  describe('rebuildItemsWithFontSize', () => {
    const sampleContent = 'Paragraph one\n\nParagraph two\n\nParagraph three';

    it('should rebuild items with estimated heights', () => {
      const result = rebuildItemsWithFontSize(sampleContent, 28, 375);

      expect(result.items).toHaveLength(3);
      expect(result.itemHeight).toBeGreaterThan(0);
    });

    it('should calculate different heights for different font sizes', () => {
      const result28 = rebuildItemsWithFontSize(sampleContent, 28, 375);
      const result36 = rebuildItemsWithFontSize(sampleContent, 36, 375);

      expect(result36.itemHeight).toBeGreaterThan(result28.itemHeight);
    });

    it('should maintain item count across rebuilds', () => {
      const result1 = rebuildItemsWithFontSize(sampleContent, 28, 375);
      const result2 = rebuildItemsWithFontSize(sampleContent, 36, 375);

      expect(result1.items).toHaveLength(result2.items.length);
    });

    it('should preserve content in rebuilt items', () => {
      const result = rebuildItemsWithFontSize(sampleContent, 28, 375);

      expect(result.items[0].content).toBe('Paragraph one');
      expect(result.items[1].content).toBe('Paragraph two');
      expect(result.items[2].content).toBe('Paragraph three');
    });
  });

  describe('VIRTUAL_SCROLL_THRESHOLD', () => {
    it('should be set to 50 paragraphs', () => {
      expect(VIRTUAL_SCROLL_THRESHOLD).toBe(50);
    });
  });
});
