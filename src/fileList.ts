import { Command, TreeDataProvider, EventEmitter } from 'vscode';

interface ZenFile {
  uri: string;
  label: string;
  command: Command;
}

const fileList = (): TreeDataProvider<ZenFile> & {
  add: (uri: string) => void;
} => {
  const items: ZenFile[] = [];

  const changeEmitter = new EventEmitter<
    void | ZenFile | ZenFile[] | null | undefined
  >();

  const onDidChangeTreeData: TreeDataProvider<ZenFile>['onDidChangeTreeData'] =
    changeEmitter.event;

  const add = (uri: string) => {
    items.push({
      command: {
        command: 'filezen.open',
        title: '',
        arguments: [uri],
      },

      label: uri.substring(uri.lastIndexOf('/') + 1),
      uri: uri,
    });
    changeEmitter.fire();
  };

  return {
    getChildren: (element?: ZenFile): ZenFile[] => {
      if (!element) {
        return items;
      }
      return [];
    },
    getTreeItem: (element: ZenFile): ZenFile => element,
    getParent: (ele: ZenFile): ZenFile | undefined => undefined,
    add,
    onDidChangeTreeData,
  };
};

export default fileList;
