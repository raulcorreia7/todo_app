# fd — Fast File Finder (Rust-based)

## Overview
- Fast and user-friendly alternative to `find`
- Respects `.gitignore` and hidden file settings by default
- Designed to work well with other tools like `rg` and `xargs`

## Common Usage

```bash
fd pattern                 # Find files matching 'pattern'
fd -e rs                  # Files with .rs extension
fd --hidden               # Include hidden files
fd -x rg TODO {}          # Find and search TODOs in results
fd -t d                   # List only directories
fd -d 1                   # Limit directory depth to 1
```

## Flags

| Flag           | Description                            |
|----------------|----------------------------------------|
| `-e EXT`       | Filter files by extension              |
| `-t [f|d|l]`   | Filter type: file, directory, symlink  |
| `-x CMD`       | Execute command for each result        |
| `--hidden`     | Include hidden files                   |
| `-d N`         | Limit directory traversal depth        |
