import * as vscode from 'vscode';
import createFileList from './fileList';
import createGroupList from './groupList';
import getDataStore, { DEFAULT_GROUP } from './dataStore';
import { ZenFile } from './types';

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

  const selectActiveGroup = () => {
    const group = store.getCurrentGroup();
    const title =
      group.label === DEFAULT_GROUP ? vscode.l10n.t('Files') : group.label;

    if (group.label !== DEFAULT_GROUP) {
      groupView.reveal(group);
    }
    fileView.title = title;
  };

  selectActiveGroup();

  context.subscriptions.push(fileView);
  context.subscriptions.push(groupView);

  context.subscriptions.push(
    vscode.commands.registerCommand('fileZen.commands.toggle', () => {
      if (!vscode.window.activeTextEditor) {
        return;
      }

      const { scheme } = vscode.window.activeTextEditor.document.uri;
      if (scheme === 'git' || scheme === 'search-editor') {
        return;
      }

      const uri = vscode.window.activeTextEditor.document.uri.toString();

      if (store.getCurrentGroup().files.find(({ uri: u }) => u === uri)) {
        store.removeFile(uri);
      } else {
        store.addFile(uri);
      }
      fileList.refresh();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'fileZen.commands.add',
      (uri: vscode.Uri) => {
        if (uri.scheme === 'git' || uri.scheme === 'search-editor') {
          return;
        }

        store.addFile(uri.toString());
        fileList.refresh();
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('fileZen.commands.open', (uri) => {
      vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(uri), {
        preview: false,
      });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'fileZen.commands.remove',
      (file: ZenFile | vscode.Uri) => {
        const uri = 'uri' in file ? file.uri : file.toString();
        store.removeFile(uri);
        fileList.refresh();
      }
    )
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
  context.subscriptions.push(
    vscode.commands.registerCommand('fileZen.commands.newGroup', () => {
      const options: vscode.InputBoxOptions = {
        prompt: vscode.l10n.t('Group Name'),
        placeHolder: vscode.l10n.t('Enter a name'),
        value: vscode.l10n.t('Group Name'),
      };
      vscode.window.showInputBox(options).then((newLabel) => {
        if (newLabel === undefined || newLabel.trim() === '') {
          return;
        }

        const current = store.saveGroup(newLabel);
        groupList.refresh();
        fileList.refresh();
        selectActiveGroup();
      });
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'fileZen.commands.editGroupLabel',
      ({ label }) => {
        const options: vscode.InputBoxOptions = {
          prompt: vscode.l10n.t('Group Name'),
          placeHolder: vscode.l10n.t('Enter a name'),
          value: label,
        };
        vscode.window.showInputBox(options).then((newLabel) => {
          if (newLabel === undefined || newLabel.trim() === '') {
            return;
          }

          store.renameGroup(label, newLabel);
          groupList.refresh();
          selectActiveGroup();
        });
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'fileZen.commands.deleteGroup',
      ({ label }) => {
        const current = store.deleteGroup(label);
        groupList.refresh();
        fileList.refresh();
        selectActiveGroup();
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('fileZen.commands.loadGroup', (label) => {
      if (store.setActiveGroup(label)) {
        fileList.refresh();
        selectActiveGroup();
      }
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('fileZen.commands.openAll', () => {
      store.getCurrentGroup().files.forEach(({ uri }) =>
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(uri), {
          preview: false,
        })
      );
    })
  );
}

export function deactivate() {}
