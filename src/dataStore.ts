import { Command, ExtensionContext } from 'vscode';
import { DataStore, ZenFile } from './types';

const getDataStore = (context: ExtensionContext): DataStore => {
  let items: ZenFile[] =
    context.workspaceState.get<ZenFile[]>('fileZenItems') ?? [];

  const add = (uri: string) => {
    if (items.some((i) => i.uri === uri)) {
      return;
    }

    items = [
      ...items,
      {
        command: {
          command: 'fileZen.commands.open',
          title: '',
          arguments: [uri],
        },

        label: uri.substring(uri.lastIndexOf('/') + 1),
        uri: uri,
      },
    ];
    context.workspaceState.update('fileZenItems', items);
  };

  const remove = (uri: string) => {
    items = items.filter((i) => i.uri !== uri);
    context.workspaceState.update('fileZenItems', items);
  };

  const editLabel = (uri: string, label: string) => {
    const item = items.find((i) => i.uri === uri);
    if (!item) {
      return;
    }

    item.label = label;
    context.workspaceState.update('fileZenItems', items);
  };

  return {
    add,
    remove,
    editLabel,
    getItems: () => items,
  };
};

export default getDataStore;
