import * as vscode from 'vscode';
import { Decorator } from './decorator';

/**
 * Activates the markdown inline preview extension.
 * 
 * This function is called by VS Code when the extension is activated (typically
 * when a markdown file is opened). It sets up event listeners for:
 * - Active editor changes
 * - Text selection changes
 * - Document content changes
 * 
 * All event subscriptions are registered with the extension context for proper
 * cleanup when the extension is deactivated.
 * 
 * @param {vscode.ExtensionContext} context - The extension context provided by VS Code
 * 
 * @example
 * // Called automatically by VS Code when extension is activated
 * activate(context);
 */
export function activate(context: vscode.ExtensionContext) {
  const decorator = new Decorator();
  decorator.setActiveEditor(vscode.window.activeTextEditor);

  const changeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(() => {
    decorator.setActiveEditor(vscode.window.activeTextEditor);
  });
  
  const changeTextEditorSelection = vscode.window.onDidChangeTextEditorSelection(() => {
    decorator.updateDecorationsForSelection();
  });

  const changeDocument = vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document === vscode.window.activeTextEditor?.document) {
      decorator.updateDecorationsFromChange(event);
    }
  });

  context.subscriptions.push(changeActiveTextEditor);
  context.subscriptions.push(changeTextEditorSelection);
  context.subscriptions.push(changeDocument);
  context.subscriptions.push({ dispose: () => decorator.dispose() });
}

/**
 * Deactivates the markdown inline preview extension.
 * 
 * This function is called by VS Code when the extension is deactivated.
 * It properly disposes of all event subscriptions and cleans up resources.
 * 
 * @param {vscode.ExtensionContext} context - The extension context provided by VS Code
 * 
 * @example
 * // Called automatically by VS Code when extension is deactivated
 * deactivate(context);
 */
export function deactivate(context: vscode.ExtensionContext) {
  context.subscriptions.forEach((subscription) => subscription.dispose());
}
