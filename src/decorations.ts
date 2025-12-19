import { window, ThemeColor } from 'vscode';

/**
 * Creates a decoration type for hiding markdown syntax.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type that hides text
 */
export function HideDecorationType() {
  return window.createTextEditorDecorationType({
    // Hide the item
    textDecoration: 'none; display: none;',
    // This forces the editor to re-layout following text correctly
    after: {
      contentText: '',
    },
  });
}

/**
 * Creates a decoration type for bold text styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for bold text
 */
export function BoldDecorationType() {
  return window.createTextEditorDecorationType({
    fontWeight: 'bold',
  });
}

/**
 * Creates a decoration type for italic text styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for italic text
 */
export function ItalicDecorationType() {
  return window.createTextEditorDecorationType({
    fontStyle: 'italic',
  });
}

/**
 * Creates a decoration type for bold+italic text styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for bold+italic text
 */
export function BoldItalicDecorationType() {
  return window.createTextEditorDecorationType({
    fontWeight: 'bold',
    fontStyle: 'italic',
  });
}

/**
 * Creates a decoration type for strikethrough text styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for strikethrough text
 */
export function StrikethroughDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'line-through',
  });
}

/**
 * Creates a decoration type for inline code styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for inline code
 */
export function CodeDecorationType() {
  return window.createTextEditorDecorationType({
    backgroundColor: new ThemeColor('textCodeBlock.background'),
    borderRadius: '3px',
  });
}

/**
 * Creates a decoration type for heading styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for headings
 */
export function HeadingDecorationType() {
  return window.createTextEditorDecorationType({
    fontWeight: 'bold',
  });
}

/**
 * Creates a decoration type for heading 1 styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for heading 1
 */
export function Heading1DecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; font-size: 200%;',
    fontWeight: 'bold',
  });
}

/**
 * Creates a decoration type for heading 2 styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for heading 2
 */
export function Heading2DecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; font-size: 150%;',
    fontWeight: 'bold',
  });
}

/**
 * Creates a decoration type for heading 3 styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for heading 3
 */
export function Heading3DecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; font-size: 110%;',
    fontWeight: 'bold',
  });
}

/**
 * Creates a decoration type for heading 4 styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for heading 4
 */
export function Heading4DecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; font-size: 100%;',
    color: new ThemeColor('descriptionForeground'),
  });
}

/**
 * Creates a decoration type for heading 5 styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for heading 5
 */
export function Heading5DecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; font-size: 90%;',
    color: new ThemeColor('descriptionForeground'),
  });
}

/**
 * Creates a decoration type for heading 6 styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for heading 6
 */
export function Heading6DecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; font-size: 80%;',
    color: new ThemeColor('descriptionForeground'),
  });
}

/**
 * Creates a decoration type for link styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for links
 */
export function LinkDecorationType() {
  return window.createTextEditorDecorationType({
    color: new ThemeColor('textLink.foreground'),
    textDecoration: 'underline',
  });
}

/**
 * Creates a decoration type for image styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for images
 */
export function ImageDecorationType() {
  return window.createTextEditorDecorationType({
    color: new ThemeColor('textLink.foreground'),
  });
}

/**
 * Creates a decoration type for blockquote marker styling.
 * 
 * Replaces '>' characters with a vertical blue bar.
 * Nested blockquotes automatically show multiple bars (one per '>').
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for blockquote markers
 */
export function BlockquoteDecorationType() {
  // Hide the '>' character and replace it with a vertical bar
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Properly hide the original '>' character
    before: {
      contentText: '│',
      color: new ThemeColor('textLink.foreground'),
      fontWeight: 'bold',
    },
  });
}

/**
 * Creates a decoration type for blockquote content styling.
 * 
 * Uses regular text color for readability.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for blockquote content
 */
export function BlockquoteContentDecorationType() {
  return window.createTextEditorDecorationType({
    // No color specified - uses regular text color for readability
  });
}

/**
 * Creates a decoration type for list item styling.
 * 
 * Replaces list markers (-, *, +) with a bullet point (•).
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for list items
 */
export function ListItemDecorationType() {
  // Hide the list marker and replace it with a bullet point
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Properly hide the original marker
    before: {
      contentText: '• ',
      // No color specified - uses regular text color
    },
  });
}

/**
 * Creates a decoration type for horizontal rules (thematic breaks).
 * 
 * Replaces ---, ***, or ___ with a visual horizontal line that spans the full editor width.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for horizontal rules
 */
export function HorizontalRuleDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; display: none;', // Hide the original text
    after: {
      contentText: '─'.repeat(200), // Very long horizontal line
      color: new ThemeColor('editorWidget.border'),
    },
    isWholeLine: true,
  });
}
