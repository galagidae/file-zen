import * as vscode from 'vscode';
import createFileList from './fileList';
import createGroupList from './groupList';
import getDataStore from './dataStore';

export function activate(context: vscode.ExtensionContext) {
  const store = getDataStore(context);
  const fileList = createFileList(store);
  const groupList = createGroupList(store);

  const fileView = vscode.window.createTreeView('fileZen.views.fileList', {
    treeDataProvider: fileList,
    showCollapseAll: true,
  });
  const groupView = vscode.window.createTreeView('fileZen.views.groupList', {
    treeDataProvider: groupList,
    showCollapseAll: true,
  });
  context.subscriptions.push(fileView);
  context.subscriptions.push(groupView);

  context.subscriptions.push(
    vscode.commands.registerCommand('fileZen.commands.add', () => {
      if (!vscode.window.activeTextEditor) {
        return;
      }

      store.addFile(vscode.window.activeTextEditor.document.uri.toString());
      fileList.refresh();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('fileZen.commands.open', (uri) => {
      vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(uri));
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('fileZen.commands.remove', ({ uri }) => {
      store.removeFile(uri);
      fileList.refresh();
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

          store.editFileLabel(uri, newLabel);
          fileList.refresh();
        });
      }
    )
  );
}

export function deactivate() {}
