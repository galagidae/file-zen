import * as vscode from 'vscode';
import fileList from './fileList';
import getDataStore from './dataStore';

export function activate(context: vscode.ExtensionContext) {
  const store = getDataStore(context);
  const list = fileList(store);

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

      store.add(vscode.window.activeTextEditor.document.uri.toString());
      list.refresh();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('fileZen.commands.open', (uri) => {
      vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(uri));
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('fileZen.commands.remove', ({ uri }) => {
      store.remove(uri);
      list.refresh();
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

          store.editLabel(uri, newLabel);
          list.refresh();
        });
      }
    )
  );
}

export function deactivate() {}
