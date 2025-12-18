import { ThemeColor, window } from 'vscode';

/**
 * Creates a decoration type for hiding markdown syntax markers.
 * 
 * This decoration type is used to hide markdown syntax characters like
 * `#`, `**`, `*`, `~~`, `` ` ``, etc. so they don't appear in the editor.
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
 * @returns {vscode.TextEditorDecorationType} A decoration type that applies bold font weight
 */
export function BoldDecorationType() {
  return window.createTextEditorDecorationType({
    fontWeight: 'bold',
  });
}

/**
 * Creates a decoration type for italic text styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type that applies italic font style
 */
export function ItalicDecorationType() {
  return window.createTextEditorDecorationType({
    fontStyle: 'italic',
  });
}

/**
 * Creates a decoration type for bold and italic text styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type that applies both bold and italic styling
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
 * @returns {vscode.TextEditorDecorationType} A decoration type that applies strikethrough text decoration
 */
export function StrikethroughDecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'line-through',
  });
}

/**
 * Creates a decoration type for inline code styling.
 * 
 * Applies a background color, border, and border radius to make code
 * stand out from regular text.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type that styles code with background and border
 */
export function CodeDecorationType() {
  return window.createTextEditorDecorationType({
    backgroundColor: new ThemeColor('editor.background'),
    border: '1px solid',
    borderColor: new ThemeColor('editorWidget.border'),
    borderRadius: '3px',
  });
}

/**
 * Creates a decoration type for generic heading styling (levels 4-6).
 * 
 * Uses bold font weight with foreground color. This is the default
 * styling for headings that don't have specific level styling.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for generic headings
 */
export function HeadingDecorationType() {
  return window.createTextEditorDecorationType({
    color: new ThemeColor('foreground'),
    fontWeight: 'bold',
  });
}

/**
 * Creates a decoration type for level 1 heading styling.
 * 
 * Applies large font size (200%) and bold weight to make H1 headings prominent.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for H1 headings
 */
export function Heading1DecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; font-size: 200%;',
    fontWeight: 'bold',
  });
}

/**
 * Creates a decoration type for level 2 heading styling.
 * 
 * Applies large font size (150%) and bold weight for H2 headings.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for H2 headings
 */
export function Heading2DecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; font-size: 150%;',
    fontWeight: 'bold',
  });
}

/**
 * Creates a decoration type for level 3 heading styling.
 * 
 * Applies slightly larger font size (110%) and bold weight for H3 headings.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for H3 headings
 */
export function Heading3DecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; font-size: 110%;',
    fontWeight: 'bold',
  });
}

/**
 * Creates a decoration type for level 4 heading styling.
 * 
 * Uses normal font size (100%) with description foreground color for H4 headings.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for H4 headings
 */
export function Heading4DecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; font-size: 100%;',
    color: new ThemeColor('descriptionForeground'),
  });
}

/**
 * Creates a decoration type for level 5 heading styling.
 * 
 * Uses smaller font size (90%) with description foreground color for H5 headings.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for H5 headings
 */
export function Heading5DecorationType() {
  return window.createTextEditorDecorationType({
    textDecoration: 'none; font-size: 90%;',
    color: new ThemeColor('descriptionForeground'),
  });
}

/**
 * Creates a decoration type for level 6 heading styling.
 * 
 * Uses smallest font size (80%) with description foreground color for H6 headings.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for H6 headings
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
 * Applies link foreground color and underline to make links visually distinct.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for markdown links
 */
export function LinkDecorationType() {
  return window.createTextEditorDecorationType({
    color: new ThemeColor('textLink.foreground'),
    textDecoration: 'underline',
  });
}

/**
 * Creates a decoration type for image alt text styling.
 * 
 * Applies link foreground color and italic style to image alt text.
 * 
 * @returns {vscode.TextEditorDecorationType} A decoration type for image alt text
 */
export function ImageDecorationType() {
  return window.createTextEditorDecorationType({
    color: new ThemeColor('textLink.foreground'),
    fontStyle: 'italic',
  });
}
