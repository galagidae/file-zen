import * as vscode from 'vscode';
import fileList from './fileList';

export function activate(context: vscode.ExtensionContext) {
  const list = fileList(context);

  const view = vscode.window.createTreeView('fileZen.views.fileList', {
    treeDataProvider: list,
    showCollapseAll: true,
  });
  context.subscriptions.push(view);

  context.subscriptions.push(
    vscode.commands.registerCommand('fileZen.commands.add', () => {
      if (!vscode.window.activeTextEditor) {
        return;
      }

      list.add(vscode.window.activeTextEditor.document.uri.toString());
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('fileZen.commands.open', (uri) => {
      vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(uri));
    })
  );
}

export function deactivate() {}
