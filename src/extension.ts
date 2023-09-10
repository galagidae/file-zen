import {
  commands,
  ExtensionContext,
  InputBoxOptions,
  l10n,
  window,
  workspace,
  Uri,
} from 'vscode';
import createFileList from './fileList';
import createGroupList from './groupList';
import getDataStore, { DEFAULT_GROUP } from './dataStore';
import { ZenFile } from './types';
import { stat } from 'fs';

export function activate(context: ExtensionContext) {
  const store = getDataStore(context);
  const fileList = createFileList(store);
  const groupList = createGroupList(store);

  const fileView = window.createTreeView('fileZen.views.fileList', {
    treeDataProvider: fileList,
    showCollapseAll: true,
  });
  const groupView = window.createTreeView('fileZen.views.groupList', {
    treeDataProvider: groupList,
    showCollapseAll: true,
  });

  const selectActiveGroup = () => {
    const group = store.getCurrentGroup();
    const title = group.label === DEFAULT_GROUP ? l10n.t('Files') : group.label;

    if (group.label !== DEFAULT_GROUP) {
      groupView.reveal(group);
    }
    fileView.title = title;
  };

  selectActiveGroup();

  const sub = (disposable: { dispose: () => any }) =>
    context.subscriptions.push(disposable);

  // Views
  sub(fileView);
  sub(groupView);

  // File change events
  sub(
    workspace.onWillDeleteFiles(({ files }) => {
      files.forEach((f) => {
        stat(f.path, (err, stats) => {
          let uri = f.toString();
          if (!err) {
            if (!stats.isDirectory()) {
              store.removeFileFromAll(uri);
            } else {
              uri = uri.endsWith('/') ? uri : uri + '/';
              store.removeFileFromAllInDir(uri);
            }
            fileList.refresh();
          }
        });
      });
    })
  );
  sub(
    workspace.onWillRenameFiles(({ files }) => {
      files.forEach((f) => {
        stat(f.oldUri.path, (err, stats) => {
          let oldUri = f.oldUri.toString();
          let newUri = f.newUri.toString();
          if (!err) {
            if (!stats.isDirectory()) {
              store.renamePathForAll(oldUri, newUri);
            } else {
              oldUri = oldUri.endsWith('/') ? oldUri : oldUri + '/';
              newUri = newUri.endsWith('/') ? newUri : newUri + '/';
              store.renamePathsInDir(oldUri, newUri);
            }
            fileList.refresh();
          }
        });
      });
    })
  );

  sub(
    commands.registerCommand('fileZen.commands.toggle', () => {
      if (!window.activeTextEditor) {
        return;
      }

      const { scheme } = window.activeTextEditor.document.uri;
      if (scheme === 'git' || scheme === 'search-editor') {
        return;
      }

      const uri = window.activeTextEditor.document.uri.toString();

      if (store.getCurrentGroup().files.find(({ uri: u }) => u === uri)) {
        store.removeFile(uri);
      } else {
        store.addFile(uri);
      }
      fileList.refresh();
    })
  );
  sub(
    commands.registerCommand('fileZen.commands.add', (uri: Uri) => {
      if (uri.scheme === 'git' || uri.scheme === 'search-editor') {
        return;
      }

      store.addFile(uri.toString());
      fileList.refresh();
    })
  );
  sub(
    commands.registerCommand('fileZen.commands.open', (uri) => {
      commands.executeCommand('vscode.open', Uri.parse(uri), {
        preview: false,
      });
    })
  );
  sub(
    commands.registerCommand('fileZen.commands.remove', (uri: Uri) => {
      store.removeFile(uri.toString());
      fileList.refresh();
    })
  );
  sub(
    commands.registerCommand(
      'fileZen.commands.removeInView',
      (file: ZenFile) => {
        store.removeFile(file.uri);
        fileList.refresh();
      }
    )
  );
  sub(
    commands.registerCommand('fileZen.commands.editLabel', ({ uri, label }) => {
      const options: InputBoxOptions = {
        prompt: l10n.t('File Label'),
        placeHolder: l10n.t('Enter a label'),
        value: label,
      };
      window.showInputBox(options).then((newLabel) => {
        if (newLabel === undefined || newLabel.trim() === '') {
          return;
        }

        store.editFileLabel(uri, newLabel);
        fileList.refresh();
      });
    })
  );
  sub(
    commands.registerCommand('fileZen.commands.newGroup', () => {
      const options: InputBoxOptions = {
        prompt: l10n.t('Group Name'),
        placeHolder: l10n.t('Enter a name'),
        value: l10n.t('Group Name'),
      };
      window.showInputBox(options).then((newLabel) => {
        if (newLabel === undefined || newLabel.trim() === '') {
          return;
        }

        store.saveGroup(newLabel);
        groupList.refresh();
        fileList.refresh();
        selectActiveGroup();
      });
    })
  );
  sub(
    commands.registerCommand('fileZen.commands.editGroupLabel', ({ label }) => {
      const options: InputBoxOptions = {
        prompt: l10n.t('Group Name'),
        placeHolder: l10n.t('Enter a name'),
        value: label,
      };
      window.showInputBox(options).then((newLabel) => {
        if (newLabel === undefined || newLabel.trim() === '') {
          return;
        }

        store.renameGroup(label, newLabel);
        groupList.refresh();
        selectActiveGroup();
      });
    })
  );
  sub(
    commands.registerCommand('fileZen.commands.deleteGroup', ({ label }) => {
      store.deleteGroup(label);
      groupList.refresh();
      fileList.refresh();
      selectActiveGroup();
    })
  );
  sub(
    commands.registerCommand('fileZen.commands.loadGroup', (label) => {
      if (store.setActiveGroup(label)) {
        fileList.refresh();
        selectActiveGroup();
      }
    })
  );
  sub(
    commands.registerCommand('fileZen.commands.openAll', () => {
      store.getCurrentGroup().files.forEach(({ uri }) =>
        commands.executeCommand('vscode.open', Uri.parse(uri), {
          preview: false,
        })
      );
    })
  );
}

export function deactivate() {}
