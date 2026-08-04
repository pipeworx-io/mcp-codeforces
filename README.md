# @pipeworx/codeforces

[Codeforces](https://codeforces.com) public read API MCP — competitive programming users, contests, problems, submissions. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `user(handles[])` — profile(s) by handle (up to 10k)
- `user_rating(handle)` — full rating history for a user
- `user_status(handle, count?)` — recent submissions for a user
- `contest_list(gym?)` — all contests (regular or gym)
- `contest_standings(contest_id, handles?, from?, count?)` — standings + problems for one contest
- `problemset(tags?, problemset_name?)` — problemset + recent submissions stats
- `recent_actions(max_count?)` — recent global actions feed
- `blog_entry_view(blog_id)` — full blog entry by id

## Data source

`https://codeforces.com/api/`

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
