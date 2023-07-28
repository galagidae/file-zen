import { commands, TreeDataProvider, EventEmitter, Uri } from 'vscode';
import { DataStore, ZenFile } from './types';

const createFileList = (
  store: DataStore
): TreeDataProvider<ZenFile> & { refresh: () => void } => {
  const changeEmitter = new EventEmitter<
    void | ZenFile | ZenFile[] | null | undefined
  >();

  const onDidChangeTreeData: TreeDataProvider<ZenFile>['onDidChangeTreeData'] =
    changeEmitter.event;

  const updateListContext = () => {
    commands.executeCommand(
      'setContext',
      'fileZen.filesEmpty',
      store.getCurrentGroup().files.length > 0
    );
    commands.executeCommand(
      'setContext',
      'fileZen.fileUris',
      store.getCurrentGroup().files.map(({ uri }) => Uri.parse(uri))
    );
  };

  const refresh = () => {
    changeEmitter.fire();
    updateListContext();
  };

  updateListContext();

  return {
    getChildren: (element?: ZenFile): ZenFile[] => {
      if (!element) {
        return store.getFiles().map((f) => ({
          ...f,
          command: {
            command: 'fileZen.commands.open',
            title: '',
            arguments: [f.uri],
          },
        }));
      }
      return [];
    },
    getTreeItem: (element: ZenFile): ZenFile => element,
    getParent: (ele: ZenFile): ZenFile | undefined => undefined,
    onDidChangeTreeData,
    refresh,
  };
};

export default createFileList;
