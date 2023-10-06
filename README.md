# File Zen

File Zen is an extension that lets you create lists of related files to more easily navigate large projects. This allows you to focus on just the files that matter for a given task or feature without having to continually scroll through the Explorer tree.

## Features

### Adding Files

- Add or remove files to a list via editor context menus
- Toggle the currently open file using the Toggle keyboard shortcut
  - <kbd>Ctrl+Alt+N</kbd> (Windows)
  - <kbd>⌥⌘N</kbd> (Mac)
- Give the file a label for easier identification

![Add files to File Zen](market/01.gif)

### File Groups

- Add groups to keep separate lists of related files
- Easily switch between groups related to specific features or frequently accessed files

![Add related files to groups](market/02.gif)

### View Flexibility

Drag and drop File Zen views to different parts of the VS Code UI. This makes it easy to access your lists while working alongside the main Explorer view.

![File Zen in the panel](market/03.png)

![File Zen in the Explorer](market/04.png)

## Known Issues

- Needs more flexible sorting/ordering
- Need to add languages other than English

## Release Notes

### 1.1.0

- Adds file type icons to list items
- Removes files from lists when deleted from disk (via VS Code)
- Adjusts paths when files moved or renamed (via VS Code)
- Shows toast notification when toggling with keyboard shortcut
- Shows full path tooltip for list items

### 1.0.0

Initial release
