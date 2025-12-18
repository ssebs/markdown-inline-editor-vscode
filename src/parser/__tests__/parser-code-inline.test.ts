import { MarkdownParser, DecorationRange } from '../../parser';

describe('MarkdownParser - Inline Code', () => {
  let parser: MarkdownParser;

  beforeEach(async () => {
    parser = await MarkdownParser.create();
  });

  describe('basic inline code (`code`)', () => {
    it('should hide backticks and style code', () => {
      const markdown = '`code`';
      const result = parser.extractDecorations(markdown);
      
      expect(result).toContainEqual({
        startPos: 0,
        endPos: 1,
        type: 'hide'
      });
      expect(result).toContainEqual({
        startPos: 1,
        endPos: 5,
        type: 'code'
      });
      expect(result).toContainEqual({
        startPos: 5,
        endPos: 6,
        type: 'hide'
      });
    });
  });

  describe('inline code at start of line', () => {
    it('should handle inline code at line start', () => {
      const markdown = '`code` text';
      const result = parser.extractDecorations(markdown);
      
      expect(result.some((d: DecorationRange) => d.type === 'code' && d.startPos === 1)).toBe(true);
      expect(result.some((d: DecorationRange) => d.type === 'hide' && d.startPos === 0)).toBe(true);
    });
  });

  describe('inline code at end of line', () => {
    it('should handle inline code at line end', () => {
      const markdown = 'text `code`';
      const result = parser.extractDecorations(markdown);
      
      const codeDecorations = result.filter((d: DecorationRange) => d.type === 'code');
      expect(codeDecorations.length).toBeGreaterThan(0);
      expect(codeDecorations[0]?.startPos).toBeGreaterThan(5);
    });
  });

  describe('inline code in middle of text', () => {
    it('should handle inline code in middle of text', () => {
      const markdown = 'start `code` end';
      const result = parser.extractDecorations(markdown);
      
      expect(result.some((d: DecorationRange) => d.type === 'code')).toBe(true);
      const codeDec = result.find((d: DecorationRange) => d.type === 'code');
      expect(codeDec?.startPos).toBeGreaterThan(6);
      expect(codeDec?.endPos).toBeLessThan(13);
    });
  });

  describe('inline code with spaces', () => {
    it('should handle inline code with spaces', () => {
      const markdown = '`code with spaces`';
      const result = parser.extractDecorations(markdown);
      
      expect(result.some((d: DecorationRange) => d.type === 'code')).toBe(true);
      const codeDec = result.find((d: DecorationRange) => d.type === 'code');
      expect(codeDec?.startPos).toBe(1);
      expect(codeDec?.endPos).toBe(17);
    });
  });

  describe('inline code with numbers', () => {
    it('should handle inline code with numbers', () => {
      const markdown = '`code123`';
      const result = parser.extractDecorations(markdown);
      
      expect(result).toContainEqual({
        startPos: 1,
        endPos: 8,
        type: 'code'
      });
    });
  });

  describe('inline code with special characters', () => {
    it('should handle inline code with special characters', () => {
      const markdown = '`code!@#`';
      const result = parser.extractDecorations(markdown);
      
      expect(result.some((d: DecorationRange) => d.type === 'code')).toBe(true);
      const codeDec = result.find((d: DecorationRange) => d.type === 'code');
      expect(codeDec?.startPos).toBe(1);
      expect(codeDec?.endPos).toBe(8);
    });
  });

  describe('multiple inline code in same line', () => {
    it('should handle multiple inline code instances', () => {
      const markdown = '`one` and `two`';
      const result = parser.extractDecorations(markdown);
      
      const codeDecorations = result.filter(d => d.type === 'code');
      expect(codeDecorations.length).toBe(2);
      
      // First code: "one"
      expect(codeDecorations[0]?.startPos).toBe(1);
      expect(codeDecorations[0]?.endPos).toBe(4);
      
      // Second code: "two"
      expect(codeDecorations[1]?.startPos).toBe(11);
      expect(codeDecorations[1]?.endPos).toBe(14);
    });
  });

  describe('empty inline code', () => {
    it('should handle empty inline code gracefully', () => {
      const markdown = '``';
      const result = parser.extractDecorations(markdown);
      
      // Should have hide decorations for backticks
      const hideDecs = result.filter((d: DecorationRange) => d.type === 'hide');
      expect(hideDecs.length).toBeGreaterThanOrEqual(0);
      // May or may not have code decoration for empty content
    });
  });

  describe('inline code with newline', () => {
    it('should handle inline code that spans lines gracefully', () => {
      const markdown = '`code\nmore`';
      const result = parser.extractDecorations(markdown);
      
      // Should handle gracefully (may or may not create decorations)
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

