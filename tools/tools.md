# Available Tools for Agentic Workflows

This directory contains small standalone tool descriptions for agentic/autonomous systems. Agents can load these to know which tools are available.

## General Rules

- Prefer breaking down actions into small CLI steps.
- Avoid overloading single commands with too many responsibilities.
- Simpler commands gather more information reliably and reduce syntax errors.
- Use `gsed` on macOS if available; fallback to `sed`.
- Prefer GNU coreutils when available.
- Try `ripgrep`, then `grep` if not enough.

## Tools List

- [x] [`ripgrep`](ripgrep.md) — High-performance recursive text/regex search CLI  
  Rules of Use:
  - Break down CLI tool usage into multiple small steps
  - Try to use CLI tools to find as much information as possibleI s

- [ ] [`fd`](fd.md) — Fast file-finder (alternative to `find`)  
  Rules of Use:
  - Use to scope files before running heavier operations
  - Chain with grep-style tools or filters for file selection

- [ ] [`sd`](sd.md) — Intuitive search and replace (alternative to `sed`)  
  Rules of Use:
  - Use for straightforward pattern replacements
  - Prefer `gsed` if available on macOS, fallback to `sed`
  - Prefer GNU coreutils when available