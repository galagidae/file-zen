import { TreeDataProvider, EventEmitter } from 'vscode';
import { DataStore, ZenFile } from './types';

const fileList = (
  store: DataStore
): TreeDataProvider<ZenFile> & { refresh: () => void } => {
  const changeEmitter = new EventEmitter<
    void | ZenFile | ZenFile[] | null | undefined
  >();

  const onDidChangeTreeData: TreeDataProvider<ZenFile>['onDidChangeTreeData'] =
    changeEmitter.event;

  const refresh = () => changeEmitter.fire();

  return {
    getChildren: (element?: ZenFile): ZenFile[] => {
      if (!element) {
        return store.getItems().map((f) => ({
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

export default fileList;
