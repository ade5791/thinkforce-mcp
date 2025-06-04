import { FastMCP } from 'fastmcp';
import { instagramTools } from './tools/instagramTools';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const server = new FastMCP({
    name: 'Instagram MCP',
    version: '0.1.0'
  });

  for (const tool of instagramTools) {
    server.addTool(tool);
  }

  server.start();
}

main().catch(err => {
  console.error('Failed to start server:', err);
});
