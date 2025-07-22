# User Review MCP Server

A Model Context Protocol (MCP) server that provides critical code review feedback to ensure high-quality implementations.

## Installation

```bash
bun install
bun run build
```

## Usage

Add to claude_desktop_config.json:

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

## Purpose

Provides 55 critical reviews to ensure:
- Real implementations (no stubs)
- Real runtime tests (no mocks)
- Fail-fast (no try-catch)
- Bun only (no npm/jest/vitest)
- Full E2E test coverage
