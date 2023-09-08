import { ExtensionContext } from 'vscode';
import { DataStore, ZenGroup } from './types';

export const DEFAULT_GROUP = '___default___';
const GROUPS_KEY = 'fileZenGroups';
const CURRENT_KEY = 'fileZenCurrent';
const defaultGroup = { label: DEFAULT_GROUP, files: [] };

const getDataStore = (context: ExtensionContext): DataStore => {
  let groups = context.workspaceState.get<ZenGroup[]>(GROUPS_KEY, [
    defaultGroup,
  ]);
  if (groups.length === 0) {
    groups.push(defaultGroup);
  }

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

  const sortFiles = () =>
    currentGroup.files.sort(({ label: a }, { label: b }) =>
      a.toLowerCase() < b.toLowerCase()
        ? -1
        : a.toLowerCase() === b.toLowerCase()
        ? 0
        : 1
    );

  const sortGroups = () =>
    groups.sort(({ label: a }, { label: b }) =>
      a.toLowerCase() < b.toLowerCase()
        ? -1
        : a.toLowerCase() === b.toLowerCase()
        ? 0
        : 1
    );

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
    sortFiles();
    save();
  };

  const removeFile = (uri: string) => {
    currentGroup.files = currentGroup.files.filter((i) => i.uri !== uri);
    save();
  };

  const removeFileFromAll = (uri: string) => {
    let modified = false;
    groups.forEach((g) => {
      g.files = g.files.filter((i) => {
        const keep = i.uri !== uri;
        if (!keep) {
          modified = true;
        }
        return keep;
      });
    });
    if (modified) {
      save();
    }
  };

  const removeFileFromAllInDir = (dirUri: string) => {
    let modified = false;
    groups.forEach((g) => {
      g.files = g.files.filter((i) => {
        const keep = !i.uri.startsWith(dirUri);
        if (!keep) {
          modified = true;
        }
        return keep;
      });
    });
    if (modified) {
      save();
    }
  };

  const editFileLabel = (uri: string, label: string) => {
    const file = currentGroup.files.find((i) => i.uri === uri);
    if (!file) {
      return;
    }

    file.label = label;
    sortFiles();
    save();
  };

  const saveGroup = (label: string) => {
    if (currentGroup.label === DEFAULT_GROUP) {
      currentGroup.label = label;
      save();
    } else if (
      label !== DEFAULT_GROUP &&
      !groups.find(({ label: l }) => l === label)
    ) {
      const newGroup = {
        label,
        files:
          currentGroup.label === DEFAULT_GROUP
            ? currentGroup.files.map((f) => ({ ...f }))
            : [],
      };
      groups.push(newGroup);
      currentGroup = newGroup;
      sortGroups();
      save();
    }
    return currentGroup;
  };

  const renameGroup = (oldLabel: string, newLabel: string) => {
    const found = groups.find(({ label }) => label === oldLabel);
    if (!found || oldLabel === DEFAULT_GROUP || newLabel === DEFAULT_GROUP) {
      return;
    }

    found.label = newLabel;
    if (found === currentGroup) {
      context.workspaceState.update(CURRENT_KEY, currentGroup.label);
    }
    sortGroups();
    save();
  };

  const deleteGroup = (label: string) => {
    const found = groups.find(({ label: l }) => l === label);
    if (!found || label === DEFAULT_GROUP) {
      return currentGroup;
    }

    if (groups.length === 1) {
      found.label = DEFAULT_GROUP;
      found.files = [];
      context.workspaceState.update(CURRENT_KEY, found.label);
    } else {
      groups = groups.filter(({ label: l }) => l !== label);
      if (currentGroup.label === label) {
        currentGroup = groups[0];
        context.workspaceState.update(CURRENT_KEY, currentGroup.label);
      }
    }
    save();
    return currentGroup;
  };

  const setActiveGroup = (label: string) => {
    const found = groups.find(({ label: l }) => l === label);

    if (found && found.label !== currentGroup.label) {
      currentGroup = found;
      context.workspaceState.update(CURRENT_KEY, currentGroup.label);
      return true;
    }

    return false;
  };

  const getCurrentGroup = () => currentGroup;

  return {
    addFile,
    removeFile,
    removeFileFromAll,
    removeFileFromAllInDir,
    editFileLabel,
    getFiles: () => currentGroup.files,
    getGroups: () => groups,
    saveGroup,
    renameGroup,
    deleteGroup,
    setActiveGroup,
    getCurrentGroup,
  };
};

export default getDataStore;
