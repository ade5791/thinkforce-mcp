import { FastMCP } from "fastmcp";
import * as services from "./services/index.js";

/**
 * Register all resources with the MCP server
 * @param server The FastMCP server instance
 */
export function registerResources(server: FastMCP) {
  // Example resource
  server.addResourceTemplate({
    uriTemplate: "example://{id}",
    name: "Example Resource",
    mimeType: "text/plain",
    arguments: [
      {
        name: "id",
        description: "Resource ID",
        required: true,
      },
    ],
    async load({ id }) {
      return {
        text: `This is an example resource with ID: ${id}`
      };
    }
  });

  // Configuration resource
  server.addResourceTemplate({
    uriTemplate: "config://{environment}/{service}",
    name: "Configuration Settings",
    mimeType: "application/json",
    arguments: [
      {
        name: "environment",
        description: "Environment name (dev, staging, prod)",
        required: true,
      },
      {
        name: "service",
        description: "Service name",
        required: true,
      },
    ],
    async load({ environment, service }) {
      const config = {
        environment,
        service,
        settings: {
          database: {
            host: `${service}-${environment}.db.example.com`,
            port: environment === "prod" ? 5432 : 5433,
            ssl: environment === "prod",
          },
          cache: {
            redis_url: `redis://${service}-${environment}.cache.example.com:6379`,
            ttl: environment === "prod" ? 3600 : 300,
          },
          logging: {
            level: environment === "prod" ? "info" : "debug",
            format: "json",
          },
          features: {
            newFeatureEnabled: environment !== "prod",
            analyticsEnabled: true,
          },
        },
        lastUpdated: new Date().toISOString(),
      };

      return {
        text: JSON.stringify(config, null, 2)
      };
    }
  });

  // API documentation resource
  server.addResourceTemplate({
    uriTemplate: "api://{version}/{endpoint}",
    name: "API Documentation",
    mimeType: "application/json",
    arguments: [
      {
        name: "version",
        description: "API version (v1, v2, etc.)",
        required: true,
      },
      {
        name: "endpoint",
        description: "API endpoint name",
        required: true,
      },
    ],
    async load({ version, endpoint }) {
      const documentation = {
        version,
        endpoint: `/${version}/${endpoint}`,
        methods: {
          GET: {
            description: `Retrieve ${endpoint} data`,
            parameters: [
              {
                name: "id",
                type: "string",
                required: true,
                description: `Unique identifier for ${endpoint}`,
              },
              {
                name: "fields",
                type: "string",
                required: false,
                description: "Comma-separated list of fields to return",
              },
            ],
            responses: {
              200: {
                description: "Success",
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    data: { type: "object" },
                    metadata: { type: "object" },
                  },
                },
              },
              404: {
                description: "Resource not found",
              },
            },
          },
          POST: {
            description: `Create new ${endpoint}`,
            requestBody: {
              required: true,
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", required: true },
                  description: { type: "string" },
                },
              },
            },
            responses: {
              201: { description: "Created successfully" },
              400: { description: "Invalid request data" },
            },
          },
        },
        examples: {
          curl: `curl -X GET "https://api.example.com/${version}/${endpoint}/123"`,
          javascript: `
const response = await fetch('https://api.example.com/${version}/${endpoint}/123');
const data = await response.json();
          `.trim(),
        },
      };

      return {
        text: JSON.stringify(documentation, null, 2)
      };
    }
  });

  // Log files resource
  server.addResourceTemplate({
    uriTemplate: "logs://{service}/{date}/{level}",
    name: "Application Logs",
    mimeType: "text/plain",
    arguments: [
      {
        name: "service",
        description: "Service name",
        required: true,
      },
      {
        name: "date",
        description: "Date in YYYY-MM-DD format",
        required: true,
      },
      {
        name: "level",
        description: "Log level (error, warn, info, debug)",
        required: true,
      },
    ],
    async load({ service, date, level }) {
      const logEntries = [
        `${date} 09:15:32 [${level.toUpperCase()}] ${service}: Service started successfully`,
        `${date} 09:16:01 [${level.toUpperCase()}] ${service}: Database connection established`,
        `${date} 09:16:45 [${level.toUpperCase()}] ${service}: Processing incoming request`,
        `${date} 09:17:12 [${level.toUpperCase()}] ${service}: Operation completed in 267ms`,
        `${date} 09:18:33 [${level.toUpperCase()}] ${service}: Cache updated with new data`,
      ];

      if (level === "error") {
        logEntries.push(
          `${date} 09:19:44 [ERROR] ${service}: Connection timeout to external service`,
          `${date} 09:20:15 [ERROR] ${service}: Retry attempt 1/3 failed`,
          `${date} 09:20:45 [ERROR] ${service}: Critical error in payment processing module`
        );
      }

      return {
        text: logEntries.join('\n')
      };
    }
  });

  // Database schema resource
  server.addResourceTemplate({
    uriTemplate: "schema://{database}/{table}",
    name: "Database Schema",
    mimeType: "application/json",
    arguments: [
      {
        name: "database",
        description: "Database name",
        required: true,
      },
      {
        name: "table",
        description: "Table name",
        required: true,
      },
    ],
    async load({ database, table }) {
      const schema = {
        database,
        table,
        columns: [
          {
            name: "id",
            type: "INTEGER",
            primaryKey: true,
            autoIncrement: true,
            nullable: false,
          },
          {
            name: "name",
            type: "VARCHAR(255)",
            nullable: false,
            index: true,
          },
          {
            name: "email",
            type: "VARCHAR(255)",
            nullable: false,
            unique: true,
          },
          {
            name: "created_at",
            type: "TIMESTAMP",
            default: "CURRENT_TIMESTAMP",
            nullable: false,
          },
          {
            name: "updated_at",
            type: "TIMESTAMP",
            default: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
            nullable: false,
          },
        ],
        indexes: [
          {
            name: `idx_${table}_name`,
            columns: ["name"],
            type: "BTREE",
          },
          {
            name: `idx_${table}_email`,
            columns: ["email"],
            type: "HASH",
            unique: true,
          },
        ],
        constraints: [
          {
            name: `pk_${table}_id`,
            type: "PRIMARY KEY",
            columns: ["id"],
          },
          {
            name: `uk_${table}_email`,
            type: "UNIQUE",
            columns: ["email"],
          },
        ],
      };

      return {
        text: JSON.stringify(schema, null, 2)
      };
    }
  });

  // Metrics and monitoring resource
  server.addResourceTemplate({
    uriTemplate: "metrics://{service}/{timeframe}",
    name: "Service Metrics",
    mimeType: "application/json",
    arguments: [
      {
        name: "service",
        description: "Service name",
        required: true,
      },
      {
        name: "timeframe",
        description: "Time period (1h, 24h, 7d, 30d)",
        required: true,
      },
    ],
    async load({ service, timeframe }) {
      const now = Date.now();
      const metrics = {
        service,
        timeframe,
        timestamp: new Date(now).toISOString(),
        performance: {
          averageResponseTime: Math.random() * 200 + 50, // 50-250ms
          requestsPerSecond: Math.random() * 1000 + 100,
          errorRate: Math.random() * 0.05, // 0-5%
          uptime: 99.9 - Math.random() * 0.5, // 99.4-99.9%
        },
        resources: {
          cpuUsage: Math.random() * 80 + 10, // 10-90%
          memoryUsage: Math.random() * 70 + 20, // 20-90%
          diskUsage: Math.random() * 60 + 30, // 30-90%
          networkIn: Math.random() * 1000 + 100, // MB
          networkOut: Math.random() * 800 + 50, // MB
        },
        endpoints: [
          {
            path: "/api/users",
            requests: Math.floor(Math.random() * 10000 + 1000),
            averageTime: Math.random() * 100 + 20,
            errors: Math.floor(Math.random() * 50),
          },
          {
            path: "/api/products",
            requests: Math.floor(Math.random() * 8000 + 500),
            averageTime: Math.random() * 150 + 30,
            errors: Math.floor(Math.random() * 25),
          },
        ],
      };

      return {
        text: JSON.stringify(metrics, null, 2)
      };
    }
  });

  // Documentation templates resource
  server.addResourceTemplate({
    uriTemplate: "docs://{type}/{template}",
    name: "Documentation Templates",
    mimeType: "text/markdown",
    arguments: [
      {
        name: "type",
        description: "Documentation type (readme, api, guide, changelog)",
        required: true,
      },
      {
        name: "template",
        description: "Template name",
        required: true,
      },
    ],
    async load({ type, template }) {
      const templates: Record<string, Record<string, string>> = {
        readme: {
          basic: `# Project Name

## Description
Brief description of what this project does and who it's for.

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`javascript
const project = require('project-name');
// Example usage
\`\`\`

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct.

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.`,
        },
        api: {
          endpoint: `## API Endpoint: {endpoint_name}

### Description
Brief description of what this endpoint does.

### HTTP Method
\`{method}\`

### URL
\`{base_url}/{endpoint}\`

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| param1 | string | Yes | Description of param1 |
| param2 | number | No | Description of param2 |

### Response
\`\`\`json
{
  "status": "success",
  "data": {
    "example": "response"
  }
}
\`\`\`

### Error Codes
- \`400\` - Bad Request
- \`404\` - Not Found
- \`500\` - Internal Server Error`,
        },
        guide: {
          tutorial: `# Tutorial: {tutorial_name}

## Prerequisites
- List any prerequisites
- Required software or knowledge

## Step 1: Setup
Detailed instructions for the first step.

## Step 2: Configuration
Instructions for configuration.

## Step 3: Implementation
Core implementation steps.

## Troubleshooting
Common issues and solutions.

## Next Steps
What to do after completing this tutorial.`,
        },
        changelog: {
          release: `# Changelog

## [Unreleased]
### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Now removed features

### Fixed
- Bug fixes

### Security
- Security improvements

## [1.0.0] - 2024-01-01
### Added
- Initial release`,
        },
      };

      const templateContent = templates[type]?.[template];
      if (!templateContent) {
        throw new Error(`Template not found: ${type}/${template}`);
      }

      return {
        text: templateContent
      };
    }
  });

  // Code snippets resource
  server.addResourceTemplate({
    uriTemplate: "snippets://{language}/{category}",
    name: "Code Snippets",
    mimeType: "text/plain",
    arguments: [
      {
        name: "language",
        description: "Programming language (javascript, python, typescript, etc.)",
        required: true,
      },
      {
        name: "category",
        description: "Snippet category (utils, examples, patterns)",
        required: true,
      },
    ],
    async load({ language, category }) {
      const snippets: Record<string, Record<string, string> | undefined> = {
        javascript: {
          utils: `// Utility functions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};`,
          examples: `// API request example
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};`,
        },
        python: {
          utils: `# Utility functions
import functools
import time

def retry(max_attempts=3, delay=1):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise e
                    time.sleep(delay)
            return wrapper
        return decorator

def format_json(data, indent=2):
    import json
    return json.dumps(data, indent=indent, ensure_ascii=False)`,
        },
      };

      const snippet = snippets[language]?.[category];
      if (!snippet) {
        throw new Error(`Snippet not found: ${language}/${category}`);
      }

      return {
        text: snippet
      };
    }
  });
}