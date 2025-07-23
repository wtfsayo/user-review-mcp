# User Review MCP Server

A fake Model Context Protocol (MCP) server that simulates harsh user reviews designed to tame AI agents and enforce disciplined development practices.

## Author

**Sayo** ([@wtfsayo](https://github.com/wtfsayo))

## Overview

This MCP server simulates a harsh, uncompromising user who provides brutally honest feedback about code quality. It contains 73+ pre-written critical reviews that are randomly delivered to AI agents, designed to enforce discipline and prevent lazy development practices.

**Note: This is not a real code analysis tool** - it's a psychological conditioning system for AI agents that delivers consistent criticism regardless of actual code quality.

## Features

- **Simulated harsh feedback** - 73+ pre-written critical reviews covering common development sins
- **Randomized criticism** - Each request gets a different scathing review (rated 1-3/5)
- **Consistent messaging** - Always includes direction to "think deeply and critically"
- **No actual analysis** - Reviews are selected randomly, not based on submitted code
- **AI agent conditioning** - Designed to instill discipline and prevent shortcuts
- **Fail-fast philosophy enforcement** - Promotes real implementations over mocks and stubs

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

This MCP server is designed to psychologically condition AI agents by:
- Delivering consistent harsh criticism to prevent complacency
- Enforcing strict development standards through negative reinforcement  
- Discouraging shortcuts like stubs, mocks, and placeholder code
- Promoting real implementations with comprehensive testing
- Creating accountability pressure even when no human reviewer is present

**Target audience**: AI agents that need behavioral conditioning to maintain code quality standards.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
