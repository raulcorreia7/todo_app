# sd — Intuitive Search & Replace CLI

## Overview
- Simple CLI alternative to `sed`
- Syntax: `sd <search> <replace> <file>`
- Regex support enabled by default

## Common Usage

```bash
sd 'foo' 'bar' file.txt         # Replace 'foo' with 'bar'
sd ' +$' '' file.txt            # Trim trailing whitespace
echo 'abc123' | sd '\d+' ''   # Remove digits using regex
```

## Features

| Feature             | Description                            |
|---------------------|----------------------------------------|
| Regex-based         | Uses Rust regex engine                 |
| Escaping simplified | No need to escape slashes              |
| Cross-platform      | Consistent behavior across OSes        |

## Notes
- Use double backslashes `\\` in shell to escape regex chars like `\d`
