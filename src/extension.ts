import * as vscode from 'vscode';
import fileList from './fileList';

export function activate(context: vscode.ExtensionContext) {
  const list = fileList();

  const view = vscode.window.createTreeView('zen-files', {
    treeDataProvider: list,
    showCollapseAll: true,
  });
  context.subscriptions.push(view);

  context.subscriptions.push(
    vscode.commands.registerCommand('commands.toggle', () => {
      if (!vscode.window.activeTextEditor) {
        return;
      }

      list.add(vscode.window.activeTextEditor.document.uri.toString());
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('filezen.open', (uri) =>
      vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(uri))
    )
  );
}

export function deactivate() {}
