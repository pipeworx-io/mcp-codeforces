# mcp-codeforces

Codeforces MCP — public read API.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 673+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `user` | User profile(s) by handle (up to 10000 semicolon-separated). |
| `user_rating` | Full rating history for a user. |
| `user_status` | Recent submissions for a user. |
| `contest_list` | All contests. Pass gym=true for gym contests. |
| `contest_standings` | Standings (and problem list) for a contest. Optionally filter by handles. |
| `problemset` | Problemset + per-problem submission counts. Optional tag filter. |
| `recent_actions` | Recent global actions feed. |
| `blog_entry_view` | Full blog entry by id. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "codeforces": {
      "url": "https://gateway.pipeworx.io/codeforces/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 673+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Codeforces data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
