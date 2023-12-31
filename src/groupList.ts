import { TreeDataProvider, EventEmitter } from 'vscode';
import { DataStore, ZenGroup } from './types';
import { DEFAULT_GROUP } from './dataStore';

const createGroupList = (
  store: DataStore
): TreeDataProvider<ZenGroup> & { refresh: () => void } => {
  const changeEmitter = new EventEmitter<
    void | ZenGroup | ZenGroup[] | null | undefined
  >();

  const onDidChangeTreeData: TreeDataProvider<ZenGroup>['onDidChangeTreeData'] =
    changeEmitter.event;

  const refresh = () => changeEmitter.fire();

  return {
    getChildren: (element?: ZenGroup): ZenGroup[] => {
      if (!element) {
        return store
          .getGroups()
          .filter((g) => g.label !== DEFAULT_GROUP)
          .map((g) => ({
            ...g,
            command: {
              command: 'fileZen.commands.loadGroup',
              title: '',
              arguments: [g.label],
            },
          }));
      }
      return [];
    },
    getTreeItem: (element: ZenGroup): ZenGroup => element,
    getParent: (): ZenGroup | undefined => undefined,
    onDidChangeTreeData,
    refresh,
  };
};

export default createGroupList;
