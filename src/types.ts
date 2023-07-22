import { Command } from 'vscode';

export interface ZenFile {
  uri: string;
  label: string;
  command: Command;
}

export interface DataStore {
  add: (uri: string) => void;
  remove: (uri: string) => void;
  editLabel: (uri: string, label: string) => void;
  getItems: () => ZenFile[];
}
