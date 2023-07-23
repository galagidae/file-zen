import { ExtensionContext } from 'vscode';
import { DataStore, ZenFile, ZenGroup } from './types';

export const DEFAULT_GROUP = '___default___';
const GROUPS_KEY = 'fileZenGroups';
const CURRENT_KEY = 'fileZenCurrent';

const getDataStore = (context: ExtensionContext): DataStore => {
  let groups = context.workspaceState.get<ZenGroup[]>(GROUPS_KEY, [
    { label: DEFAULT_GROUP, files: [] },
  ]);

  let currentGroup = (() => {
    const currentLabel = context.workspaceState.get<string>(
      CURRENT_KEY,
      DEFAULT_GROUP
    );
    const found = groups.find(({ label }) => label === currentLabel);

    if (!found) {
      const group = groups[0];
      context.workspaceState.update(CURRENT_KEY, group.label);
      return group;
    }
    return found;
  })();

  const save = () => context.workspaceState.update(GROUPS_KEY, groups);

  const addFile = (uri: string) => {
    if (currentGroup.files.some((i) => i.uri === uri)) {
      return;
    }

    currentGroup.files = [
      ...currentGroup.files,
      {
        label: uri.substring(uri.lastIndexOf('/') + 1),
        uri: uri,
      },
    ];
    save();
  };

  const removeFile = (uri: string) => {
    currentGroup.files = currentGroup.files.filter((i) => i.uri !== uri);
    save();
  };

  const editFileLabel = (uri: string, label: string) => {
    const file = currentGroup.files.find((i) => i.uri === uri);
    if (!file) {
      return;
    }

    file.label = label;
    save();
  };

  return {
    addFile,
    removeFile,
    editFileLabel,
    getFiles: () => currentGroup.files,
    getGroups: () => groups,
  };
};

export default getDataStore;
