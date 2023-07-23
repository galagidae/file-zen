import { Command } from 'vscode';

export interface ZenFile {
  uri: string;
  label: string;
}

export interface ZenFileTreeItem extends ZenFile {
  command: Command;
}

export interface ZenGroup {
  label: string;
  files: ZenFile[];
}

export interface DataStore {
  addFile: (uri: string) => void;
  removeFile: (uri: string) => void;
  editFileLabel: (uri: string, label: string) => void;
  getFiles: () => ZenFile[];
  getGroups: () => ZenGroup[];
  saveGroup: (label: string) => ZenGroup;
  renameGroup: (oldLabel: string, newLabel: string) => void;
  deleteGroup: (label: string) => ZenGroup;
  setActiveGroup: (label: string) => boolean;
  getCurrentGroup: () => ZenGroup;
}