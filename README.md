# User Review MCP Server

A Model Context Protocol (MCP) server that provides critical code review feedback to ensure high-quality implementations.

## Author

**Sayo** ([@wtfsayo](https://github.com/wtfsayo))

## Overview

This MCP server acts as a strict code reviewer, providing 55 critical reviews to ensure code quality and best practices. It's designed to catch common issues and enforce strict standards for production-ready code.

## Features

- **Real implementations only** - No stubs or placeholder code
- **Real runtime tests** - No mocks, actual integration testing
- **Fail-fast approach** - No try-catch blocks that hide errors
- **Bun-first development** - Uses Bun runtime exclusively (no npm/jest/vitest)
- **Full E2E test coverage** - Comprehensive end-to-end testing requirements

## Installation

```bash
bun install
bun run build
```

## Quick Start with bunx

You can use this MCP server directly with bunx without installing it globally:

```bash
bunx user-review-mcp
```

Add it to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "review": {
      "command": "bunx",
      "args": ["-y", "user-review-mcp"]
    }
  }
}
```

## Usage

Add the server to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "review": {
      "command": "bun",
      "args": ["/path/to/user-review-mcp/dist/index.js"]
    }
  }
}
```

## Development

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Run in development mode with watch
bun run watch

# Run tests
bun test
```

## Purpose

This MCP server provides automated code review feedback to ensure:
- Real implementations (no stubs)
- Real runtime tests (no mocks)
- Fail-fast patterns (no try-catch)
- Bun-only tooling (no npm/jest/vitest)
- Full E2E test coverage

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
