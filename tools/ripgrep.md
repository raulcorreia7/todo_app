# ripgrep (`rg`) — CLI Text Search Tool

## Overview
- Recursively searches directories for regex/text patterns
- Honors `.gitignore`, `.ignore`, `.rgignore`, skips hidden/binary files by default
- To override ignore rules and include everything, use `rg -uuu`

## Common Flags & Options

| Flag(s)                      | Description                               |
|-----------------------------|--------------------------------------------|
| `-i`                        | case-insensitive                           |
| `-w`                        | whole-word match only                      |
| `-v`                        | invert match (non-matching lines)          |
| `-l`                        | print filenames containing matches         |
| `-c`                        | count matches per file                     |
| `-B n`, `-A n`, `-C n`      | show context lines before/after/both       |
| `-g '<glob>'`               | include/exclude file paths via glob        |
| `--type <type>` / `--type-not <type>` | filter built-in file types       |
| `-r '<text>'` / `--replace '<text>'` | rewrite matches in output             |
| `-a` / `--binary`           | treat binary files as text                 |
| `--encoding=<NAME>` or `none` | override file encoding or raw bytes      |
| `-P`, `--pcre2`, `--engine=auto` | support backrefs/lookaround via PCRE2   |

## Usage Snippets
```bash
rg 'TODO' -C 2
rg 'import' --type py
rg 'error' -g '!node_modules/*' -l
rg 'foo(\d+)' -r 'bar$1' -o
rg -uuu DEBUG
rg --pre ./pdf2text.sh --pre-glob '*.pdf' 'summary' document.pdf
```

## Search & Replace Tips
- Use `-F` to search fixed strings (no regex).
- For nth or conditional replacement, combine `--passthru` with regex workaround, e.g.:
  ```bash
  rg --passthru -N 'blue' -r 'red'
  ```

## Performance Highlights
- Written in Rust; uses memory-mapped file I/O, parallel directory traversal for speed.
- Often outpaces `grep`, `ack`, `ag`, `git grep` across large codebases.
