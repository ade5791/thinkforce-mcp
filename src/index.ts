<<<<<<< HEAD
import { FastMCP } from "fastmcp";
import startServer from "./server/server.js";

// Start the server
async function main() {
  try {
    const server = await startServer();
    
    server.start({
      transportType: "stdio",
    });
    
    console.error("MCP Server running on stdio");
  } catch (error) {
    console.error("Error starting MCP server:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
}); 
=======
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
>>>>>>> 562236e6f418293ea8f964bcc9c70dc7809895cc
