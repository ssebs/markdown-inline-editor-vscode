import type { Root, Node, Strong, Emphasis, Heading, InlineCode, Code, Link, Image, Delete, Blockquote, List, ListItem, ThematicBreak } from 'mdast';
import { getRemarkProcessorSync, getRemarkProcessor } from './parser-remark';

/**
 * Represents a decoration range in the markdown document.
 * 
 * @interface DecorationRange
 * @property {number} startPos - Character position (0-based, inclusive)
 * @property {number} endPos - Character position (0-based, exclusive)
 * @property {DecorationType} type - The type of decoration to apply
 */
export interface DecorationRange {
  startPos: number;
  endPos: number;
  type: DecorationType;
  url?: string; // URL for link decorations (for clickable links)
  level?: number; // Nesting level for blockquotes
}

/**
 * Types of decorations that can be applied to markdown content.
 */
export type DecorationType =
  | 'hide'
  | 'bold'
  | 'italic'
  | 'boldItalic'
  | 'strikethrough'
  | 'code'
  | 'heading'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'heading6'
  | 'link'
  | 'image'
  | 'blockquote'
  | 'blockquoteContent'
  | 'listItem'
  | 'horizontalRule';

/**
 * Parser for extracting decoration ranges from markdown text.
 * 
 * Uses remark to parse markdown and extract positions for:
 * - Syntax markers (to hide)
 * - Content (to style with bold, italic, headings, etc.)
 * 
 * @class MarkdownParser
 * @example
 * // For sync usage (VS Code extension):
 * const parser = new MarkdownParser();
 * const decorations = parser.extractDecorations('# Heading\n**bold** text');
 * 
 * // For async usage (tests with ESM modules):
 * const parser = await MarkdownParser.create();
 * const decorations = parser.extractDecorations('# Heading\n**bold** text');
 */
export class MarkdownParser {
  private processor: any;
  private visit: any;

  constructor() {
    const { unified, remarkParse, remarkGfm, visit } = getRemarkProcessorSync();
    this.visit = visit;
    this.processor = unified()
      .use(remarkParse)
      .use(remarkGfm);
  }

  /**
   * Async factory method to create a MarkdownParser instance.
   * Uses dynamic imports to support ESM modules in test environments.
   * 
   * @returns {Promise<MarkdownParser>} A promise that resolves to a MarkdownParser instance
   */
  static async create(): Promise<MarkdownParser> {
    const parser = Object.create(MarkdownParser.prototype);
    const { unified, remarkParse, remarkGfm, visit } = await getRemarkProcessor();
    parser.visit = visit;
    parser.processor = unified()
      .use(remarkParse)
      .use(remarkGfm);
    return parser;
  }

  /**
   * Extracts decoration ranges from markdown text.
   * 
   * @param {string} text - The markdown text to parse
   * @returns {DecorationRange[]} Array of decoration ranges, sorted by startPos
   */
  extractDecorations(text: string): DecorationRange[] {
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Normalize line endings to \n for consistent position tracking
    const normalizedText = text.replace(/\r\n|\r/g, '\n');
    
    const decorations: DecorationRange[] = [];
    
    try {
      // Parse markdown into AST
      const ast = this.processor.parse(normalizedText) as Root;
      
      // Process AST nodes and extract decorations
      this.processAST(ast, normalizedText, decorations);
      
      // Handle edge cases: empty image alt text that remark doesn't parse as Image node
      this.handleEmptyImageAlt(normalizedText, decorations);
      
      // Sort decorations by start position
      decorations.sort((a, b) => a.startPos - b.startPos);
    } catch (error) {
      // Gracefully handle parse errors
      console.error('Error parsing markdown:', error);
    }

    return decorations;
  }

  /**
   * Processes the remark AST to extract decoration ranges.
   * 
   * @private
   * @param {Root} ast - The parsed AST root node
   * @param {string} text - The original markdown text
   * @param {DecorationRange[]} decorations - Array to accumulate decorations
   */
  private processAST(
    ast: Root,
    text: string,
    decorations: DecorationRange[]
  ): void {
    // Track ancestors during traversal
    const ancestors: Node[] = [];
    
    // Track processed blockquote positions to avoid duplicates from nested blockquotes
    const processedBlockquotePositions = new Set<number>();

    this.visit(ast, (node: Node, index: number | undefined, parent: Node | undefined) => {
      if (!node.position || node.position.start.offset === undefined || node.position.end.offset === undefined) {
        return;
      }

      // Build ancestor chain for nested formatting detection
      // Check immediate parent and see if we can find it in ancestors
      const currentAncestors: Node[] = [];
      if (parent) {
        currentAncestors.push(parent);
        // Try to find parent's ancestors by checking if parent is a child of any ancestor
        for (const ancestor of ancestors) {
          if (this.isNodeChildOf(ancestor, parent)) {
            currentAncestors.push(ancestor);
          }
        }
      }

      switch (node.type) {
        case 'heading':
          this.processHeading(node as Heading, text, decorations);
          break;

        case 'strong':
          this.processStrong(node as Strong, text, decorations, currentAncestors);
          break;

        case 'emphasis':
          this.processEmphasis(node as Emphasis, text, decorations, currentAncestors);
          break;

        case 'delete':
          this.processStrikethrough(node as Delete, text, decorations);
          break;

        case 'inlineCode':
          this.processInlineCode(node as InlineCode, text, decorations);
          break;

        case 'code':
          this.processCodeBlock(node as Code, text, decorations);
          break;

        case 'link':
          this.processLink(node as Link, text, decorations);
          break;

        case 'image':
          this.processImage(node as Image, text, decorations);
          break;

        case 'blockquote':
          this.processBlockquote(node as Blockquote, text, decorations, processedBlockquotePositions);
          break;

        case 'listItem':
          this.processListItem(node as ListItem, text, decorations);
          break;

        case 'thematicBreak':
          this.processThematicBreak(node as ThematicBreak, text, decorations);
          break;
      }
    });
  }

  /**
   * Processes a heading node.
   */
  private processHeading(
    node: Heading,
    text: string,
    decorations: DecorationRange[]
  ): void {
    if (!node.position || node.position.start.offset === undefined || node.position.end.offset === undefined) return;

    const start = node.position.start.offset;
    const end = node.position.end.offset;

    // Find the heading marker (#) by checking the source text
    let markerLength = 0;
    let pos = start;
    while (pos < end && text[pos] === '#') {
      markerLength++;
      pos++;
    }

    if (markerLength === 0) return;

    const level = markerLength;
    const headingType = `heading${level}` as DecorationType;

    // Find whitespace after marker
    const contentStart = start + markerLength;
    let whitespaceLength = 0;
    let posAfterMarker = contentStart;
    while (posAfterMarker < end && /\s/.test(text[posAfterMarker])) {
      whitespaceLength++;
      posAfterMarker++;
    }

    const hideEnd = contentStart + whitespaceLength;

    // Hide the marker AND the whitespace after it
    decorations.push({
      startPos: start,
      endPos: hideEnd,
      type: 'hide',
    });

    // Find content end (exclude trailing whitespace)
    let contentEnd = end;
    while (contentEnd > hideEnd && /\s/.test(text[contentEnd - 1])) {
      contentEnd--;
    }

    // Style the heading content (from after marker+whitespace to end of line)
    if (hideEnd < contentEnd) {
      // Add specific heading decoration
      decorations.push({
        startPos: hideEnd,
        endPos: contentEnd,
        type: headingType,
      });

      // Also add generic heading decoration
      decorations.push({
        startPos: hideEnd,
        endPos: contentEnd,
        type: 'heading',
      });
    }
  }

  /**
   * Processes a strong (bold) node.
   */
  private processStrong(
    node: Strong,
    text: string,
    decorations: DecorationRange[],
    ancestors: Node[]
  ): void {
    if (!node.position || node.position.start.offset === undefined || node.position.end.offset === undefined) return;

    const start = node.position.start.offset;
    const end = node.position.end.offset;

    // Determine marker type by checking source text
    const marker = this.getBoldMarker(text, start);
    if (!marker) return;

    const markerLength = marker.length;
    const contentStart = start + markerLength;
    const contentEnd = end - markerLength;

    // Hide opening marker
    decorations.push({
      startPos: start,
      endPos: start + markerLength,
      type: 'hide',
    });

    // Hide closing marker
    decorations.push({
      startPos: contentEnd,
      endPos: end,
      type: 'hide',
    });

    // Check if this is bold+italic (nested with emphasis)
    const isBoldItalic = ancestors.some(a => a.type === 'emphasis');

    // Process children for nested decorations
    if (node.children) {
      this.processChildren(node.children, text, decorations, contentStart);
    }

    // Add content decoration
    if (contentStart < contentEnd) {
      decorations.push({
        startPos: contentStart,
        endPos: contentEnd,
        type: isBoldItalic ? 'boldItalic' : 'bold',
      });
    }
  }

  /**
   * Processes an emphasis (italic) node.
   */
  private processEmphasis(
    node: Emphasis,
    text: string,
    decorations: DecorationRange[],
    ancestors: Node[]
  ): void {
    if (!node.position || node.position.start.offset === undefined || node.position.end.offset === undefined) return;

    const start = node.position.start.offset;
    const end = node.position.end.offset;

    // Determine marker type by checking source text
    const marker = this.getItalicMarker(text, start);
    if (!marker) return;

    const markerLength = marker.length;
    const contentStart = start + markerLength;
    const contentEnd = end - markerLength;

    // Check if this emphasis is nested inside a strong node
    // For ***text***, we have: strong(0-17) contains emphasis(1-16)
    // The strong node hides the outer **, the emphasis should hide the inner *
    // But we need to check if the emphasis markers are already covered by strong markers
    const parentStrong = ancestors.find(a => a.type === 'strong');
    if (parentStrong && parentStrong.position) {
      const strongStart = parentStrong.position.start.offset ?? -1;
      const strongEnd = parentStrong.position.end.offset ?? -1;
      
      // If emphasis start is right after strong start (e.g., *** where strong starts at 0, emphasis at 1)
      // and emphasis end is right before strong end, then the emphasis markers overlap with strong markers
      // In this case, we should still process emphasis but adjust what we hide
      if (start === strongStart + 2 && end === strongEnd - 2) {
        // This is ***text*** case - emphasis markers are the middle * in ***
        // The outer ** is already hidden by strong, so we don't need to hide the inner * markers
        // But we still need to apply the boldItalic decoration to the content
        // Actually, the strong node already applies boldItalic to the content, so we can skip
        return;
      }
    }

    // Hide opening marker
    decorations.push({
      startPos: start,
      endPos: start + markerLength,
      type: 'hide',
    });

    // Hide closing marker
    decorations.push({
      startPos: contentEnd,
      endPos: end,
      type: 'hide',
    });

    // Check if this is bold+italic (nested with strong)
    const isBoldItalic = ancestors.some(a => a.type === 'strong');

    // Process children for nested decorations
    if (node.children) {
      this.processChildren(node.children, text, decorations, contentStart);
    }

    // Add content decoration
    if (contentStart < contentEnd) {
      decorations.push({
        startPos: contentStart,
        endPos: contentEnd,
        type: isBoldItalic ? 'boldItalic' : 'italic',
      });
    }
  }

  /**
   * Processes a strikethrough (delete) node.
   */
  private processStrikethrough(
    node: Delete,
    text: string,
    decorations: DecorationRange[]
  ): void {
    if (!node.position || node.position.start.offset === undefined || node.position.end.offset === undefined) return;

    const start = node.position.start.offset;
    const end = node.position.end.offset;

    // Strikethrough uses ~~ markers
    const markerLength = 2;
    const contentStart = start + markerLength;
    const contentEnd = end - markerLength;

    // Hide opening marker
    decorations.push({
      startPos: start,
      endPos: start + markerLength,
      type: 'hide',
    });

    // Hide closing marker
    decorations.push({
      startPos: contentEnd,
      endPos: end,
      type: 'hide',
    });

    // Process children for nested decorations
    if (node.children) {
      this.processChildren(node.children, text, decorations, contentStart);
    }

    // Add strikethrough decoration
    if (contentStart < contentEnd) {
      decorations.push({
        startPos: contentStart,
        endPos: contentEnd,
        type: 'strikethrough',
      });
    }
  }

  /**
   * Processes an inline code node.
   */
  private processInlineCode(
    node: InlineCode,
    text: string,
    decorations: DecorationRange[]
  ): void {
    if (!node.position || node.position.start.offset === undefined || node.position.end.offset === undefined) return;

    const start = node.position.start.offset;
    const end = node.position.end.offset;

    // Count backticks at start
    let markerLength = 0;
    let pos = start;
    while (pos < end && text[pos] === '`') {
      markerLength++;
      pos++;
    }

    if (markerLength === 0) return;

    const contentStart = start + markerLength;
    const contentEnd = end - markerLength;

    // Hide opening marker
    decorations.push({
      startPos: start,
      endPos: start + markerLength,
      type: 'hide',
    });

    // Add code decoration
    if (contentStart < contentEnd) {
      decorations.push({
        startPos: contentStart,
        endPos: contentEnd,
        type: 'code',
      });
    }

    // Hide closing marker
    decorations.push({
      startPos: contentEnd,
      endPos: end,
      type: 'hide',
    });
  }

  /**
   * Processes a code block node.
   */
  private processCodeBlock(
    node: Code,
    text: string,
    decorations: DecorationRange[]
  ): void {
    if (!node.position || node.position.start.offset === undefined || node.position.end.offset === undefined) return;

    const start = node.position.start.offset;
    const end = node.position.end.offset;

    // Find opening fence (```)
    const fenceStart = text.indexOf('```', start);
    if (fenceStart === -1) return;

    // Find closing fence
    const closingFence = text.lastIndexOf('```', end);
    if (closingFence === -1 || closingFence <= fenceStart) return;

    // Add code decoration for content
    const contentStart = fenceStart + 3;
    // Skip language identifier if present (first line after fence)
    let codeStart = contentStart;
    let fenceEnd = fenceStart + 3;
    const firstLineEnd = text.indexOf('\n', codeStart);
    if (firstLineEnd !== -1 && firstLineEnd < closingFence) {
      // Language identifier is present - include it in the hidden fence
      fenceEnd = firstLineEnd;
      codeStart = firstLineEnd + 1;
    }

    // Hide opening fence (including language identifier if present)
    decorations.push({
      startPos: fenceStart,
      endPos: fenceEnd,
      type: 'hide',
    });

    if (codeStart < closingFence) {
      decorations.push({
        startPos: codeStart,
        endPos: closingFence,
        type: 'code',
      });
    }

    // Hide closing fence
    decorations.push({
      startPos: closingFence,
      endPos: closingFence + 3,
      type: 'hide',
    });
  }

  /**
   * Processes a link node.
   */
  private processLink(
    node: Link,
    text: string,
    decorations: DecorationRange[]
  ): void {
    if (!node.position || node.position.start.offset === undefined || node.position.end.offset === undefined) return;

    const start = node.position.start.offset;
    const end = node.position.end.offset;

    // Find opening bracket [
    const bracketStart = text.indexOf('[', start);
    if (bracketStart === -1) return;

    // Find closing bracket ]
    const bracketEnd = text.indexOf(']', bracketStart);
    if (bracketEnd === -1) return;

    // Hide opening bracket
    decorations.push({
      startPos: bracketStart,
      endPos: bracketStart + 1,
      type: 'hide',
    });

    // Add link decoration for text (between brackets)
    const contentStart = bracketStart + 1;
    if (contentStart < bracketEnd) {
      // Extract URL from the link node
      const url = node.url || '';
      
      decorations.push({
        startPos: contentStart,
        endPos: bracketEnd,
        type: 'link',
        url: url,
      });
    }

    // Hide closing bracket
    decorations.push({
      startPos: bracketEnd,
      endPos: bracketEnd + 1,
      type: 'hide',
    });

    // Find and hide URL part (url)
    const parenStart = text.indexOf('(', bracketEnd);
    if (parenStart !== -1 && parenStart === bracketEnd + 1) {
      // Hide opening parenthesis
      decorations.push({
        startPos: parenStart,
        endPos: parenStart + 1,
        type: 'hide',
      });

      const parenEnd = text.indexOf(')', parenStart + 1);
      if (parenEnd !== -1 && parenEnd <= end) {
        // Hide URL content between parentheses
        const urlStart = parenStart + 1;
        if (urlStart < parenEnd) {
          decorations.push({
            startPos: urlStart,
            endPos: parenEnd,
            type: 'hide',
          });
        }

        // Hide closing parenthesis
        decorations.push({
          startPos: parenEnd,
          endPos: parenEnd + 1,
          type: 'hide',
        });
      }
    }
  }

  /**
   * Processes an image node.
   */
  private processImage(
    node: Image,
    text: string,
    decorations: DecorationRange[]
  ): void {
    if (!node.position || node.position.start.offset === undefined || node.position.end.offset === undefined) return;

    const start = node.position.start.offset;
    const end = node.position.end.offset;

    // Find opening ![
    const exclamationStart = text.indexOf('![', start);
    if (exclamationStart === -1 || exclamationStart > start) return;

    // Hide ![
    decorations.push({
      startPos: exclamationStart,
      endPos: exclamationStart + 2,
      type: 'hide',
    });

    // Find alt text (between [ and ])
    const altStart = exclamationStart + 2;
    const bracketEnd = text.indexOf(']', altStart);
    if (bracketEnd === -1) {
      // Even if no closing bracket found, try to hide what we can
      // This handles edge cases like ![] without proper syntax
      return;
    }

    // Add image decoration for alt text (even if empty)
    if (altStart <= bracketEnd) {
      decorations.push({
        startPos: altStart,
        endPos: bracketEnd,
        type: 'image',
      });
    }

    // Hide closing bracket
    decorations.push({
      startPos: bracketEnd,
      endPos: bracketEnd + 1,
      type: 'hide',
    });

    // Find and hide URL part
    const parenStart = text.indexOf('(', bracketEnd);
    if (parenStart !== -1) {
      // Allow for optional space between ] and (
      if (parenStart === bracketEnd + 1 || (parenStart > bracketEnd + 1 && text.substring(bracketEnd + 1, parenStart).trim().length === 0)) {
        decorations.push({
          startPos: parenStart,
          endPos: parenStart + 1,
          type: 'hide',
        });

        const parenEnd = text.indexOf(')', parenStart + 1);
        if (parenEnd !== -1 && parenEnd < end) {
          decorations.push({
            startPos: parenEnd,
            endPos: parenEnd + 1,
            type: 'hide',
          });
        }
      }
    }
  }

  /**
   * Processes a blockquote node.
   * 
   * Replaces '>' characters with vertical bars for visual indication.
   * Nested blockquotes automatically show multiple bars (one per '>').
   * 
   * @param processedPositions - Set to track which positions have already been processed
   */
  private processBlockquote(
    node: Blockquote,
    text: string,
    decorations: DecorationRange[],
    processedPositions: Set<number>
  ): void {
    if (!node.position || node.position.start.offset === undefined || node.position.end.offset === undefined) return;

    const start = node.position.start.offset;
    const end = node.position.end.offset;

    // Apply text color to the entire blockquote content
    decorations.push({
      startPos: start,
      endPos: end,
      type: 'blockquoteContent',
    });

    // Find all '>' markers at the start of lines within this blockquote
    // Blockquotes can span multiple lines, each starting with '>'
    let pos = start;
    while (pos < end) {
      // Find line start (either document start or after newline)
      const lineStart = pos === 0 ? 0 : text.lastIndexOf('\n', pos - 1) + 1;
      
      // Find all '>' markers on this line (for nested blockquotes like "> > >")
      // We process all '>' markers that are at the start of the line or after whitespace/other '>'
      let searchStart = lineStart;
      const lineEnd = text.indexOf('\n', lineStart);
      const actualLineEnd = lineEnd === -1 ? end : Math.min(lineEnd, end);
      
      while (searchStart < actualLineEnd) {
        const gtIndex = text.indexOf('>', searchStart);
        if (gtIndex === -1 || gtIndex >= actualLineEnd) break;
        
        // Check if we've already processed this position (from a parent blockquote node)
        if (processedPositions.has(gtIndex)) {
          searchStart = gtIndex + 1;
          continue;
        }
        
        // Check if there's only whitespace and/or '>' before this '>'
        // This allows nested blockquotes like "> > >" where each '>' is valid
        const beforeGt = text.substring(lineStart, gtIndex);
        const isBlockquoteMarker = beforeGt.trim().length === 0 || /^[\s>]*$/.test(beforeGt);
        
        if (isBlockquoteMarker) {
          // Mark this position as processed
          processedPositions.add(gtIndex);
          
          // Replace only the '>' character with blockquote decoration (vertical bar)
          // Keep the space after it visible to maintain proper spacing
          decorations.push({
            startPos: gtIndex,
            endPos: gtIndex + 1,
            type: 'blockquote',
          });
          searchStart = gtIndex + 1;
        } else {
          // Not a blockquote marker, move past it
          searchStart = gtIndex + 1;
        }
      }
      
      // Move to next line
      const nextLine = text.indexOf('\n', pos);
      if (nextLine === -1 || nextLine >= end) break;
      pos = nextLine + 1;
    }
  }

  /**
   * Processes a list item node.
   * 
   * Replaces list markers (-, *, +) with a bullet point (•).
   */
  private processListItem(
    node: ListItem,
    text: string,
    decorations: DecorationRange[]
  ): void {
    if (!node.position || node.position.start.offset === undefined || node.position.end.offset === undefined) return;

    const start = node.position.start.offset;
    const end = node.position.end.offset;

    // Find the list marker at the start of the list item
    // Common markers: -, *, +
    let markerEnd = start;
    while (markerEnd < end && /[\s\-*+]/.test(text[markerEnd])) {
      if (text[markerEnd] === '-' || text[markerEnd] === '*' || text[markerEnd] === '+') {
        // Found the marker, now find where it ends (including following space)
        const markerStart = markerEnd;
        markerEnd++;
        
        // Check if there's a space after the marker
        if (markerEnd < end && text[markerEnd] === ' ') {
          markerEnd++;
        }
        
        // Replace the marker (and space) with a bullet decoration
        decorations.push({
          startPos: markerStart,
          endPos: markerEnd,
          type: 'listItem',
        });
        break;
      }
      markerEnd++;
    }
  }

  /**
   * Processes a thematic break (horizontal rule) node.
   * 
   * Replaces the text (---, ***, ___) with a visual horizontal line.
   */
  private processThematicBreak(
    node: ThematicBreak,
    text: string,
    decorations: DecorationRange[]
  ): void {
    if (!node.position || node.position.start.offset === undefined || node.position.end.offset === undefined) return;

    const start = node.position.start.offset;
    const end = node.position.end.offset;

    // Replace the entire horizontal rule text with a decoration
    decorations.push({
      startPos: start,
      endPos: end,
      type: 'horizontalRule',
    });
  }

  /**
   * Processes children nodes for nested decorations.
   */
  private processChildren(
    children: Node[],
    text: string,
    decorations: DecorationRange[],
    basePos: number
  ): void {
    // Children are already processed by the main visit() call
    // This method is kept for potential future use
  }

  /**
   * Handles empty image alt text that remark doesn't parse as an Image node.
   */
  private handleEmptyImageAlt(text: string, decorations: DecorationRange[]): void {
    // Find ![] patterns that weren't handled by processImage
    const regex = /!\[\]/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const pos = match.index;
      // Check if this position is already covered by a decoration
      const isCovered = decorations.some(d => d.startPos <= pos && d.endPos > pos);
      if (!isCovered) {
        // Add hide decorations for ![
        decorations.push({
          startPos: pos,
          endPos: pos + 2,
          type: 'hide',
        });
        // Add hide decoration for ]
        decorations.push({
          startPos: pos + 2,
          endPos: pos + 3,
          type: 'hide',
        });
      }
    }
  }

  /**
   * Gets the bold marker type (** or __) from source text.
   */
  private getBoldMarker(text: string, pos: number): string | null {
    if (pos + 2 <= text.length) {
      const marker = text.substring(pos, pos + 2);
      if (marker === '**' || marker === '__') {
        return marker;
      }
    }
    return null;
  }

  /**
   * Gets the italic marker type (* or _) from source text.
   */
  private getItalicMarker(text: string, pos: number): string | null {
    if (pos + 1 <= text.length) {
      const char = text[pos];
      if (char === '*' || char === '_') {
        return char;
      }
    }
    return null;
  }

  /**
   * Checks if a node is a child of another node (recursively).
   */
  private isNodeChildOf(parent: Node, child: Node): boolean {
    if (!('children' in parent)) {
      return false;
    }
    const parentWithChildren = parent as any;
    if (!parentWithChildren.children || !Array.isArray(parentWithChildren.children)) {
      return false;
    }
    return parentWithChildren.children.some((c: Node) => c === child || this.isNodeChildOf(c, child));
  }
}
