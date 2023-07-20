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
  context.subscriptions.push(
    vscode.commands.registerCommand('fileZen.commands.remove', ({ uri }) => {
      list.remove(uri);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'fileZen.commands.editLabel',
      ({ uri, label }) => {
        const options: vscode.InputBoxOptions = {
          prompt: vscode.l10n.t('File Label'),
          placeHolder: vscode.l10n.t('Enter a label'),
          value: label,
        };
        vscode.window.showInputBox(options).then((newLabel) => {
          if (newLabel === undefined || newLabel.trim() === '') {
            return;
          }

          list.editLabel(uri, newLabel);
        });
      }
    )
  );
}

export function deactivate() {}
