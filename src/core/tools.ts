import { FastMCP } from "fastmcp";
import { z } from "zod";
import * as services from "./services/index.js";
import { instagramTools } from "../tools/instagramTools.js";

/**
 * Register all tools with the MCP server
 * 
 * @param server The FastMCP server instance
 */
export function registerTools(server: FastMCP) {
  // Greeting tool
  server.addTool({
    name: "hello_world",
    description: "A simple hello world tool",
    parameters: z.object({
      name: z.string().describe("Name to greet")
    }),
    execute: async (params) => {
      const greeting = services.GreetingService.generateGreeting(params.name);
      return greeting;
    }
  });

  // Farewell tool
  server.addTool({
    name: "goodbye",
    description: "A simple goodbye tool",
    parameters: z.object({
      name: z.string().describe("Name to bid farewell to")
    }),
    execute: async (params) => {
      const farewell = services.GreetingService.generateFarewell(params.name);
      return farewell;
    }
  });

  // Math calculator tool
  server.addTool({
    name: "calculate",
    description: "Perform basic mathematical operations",
    parameters: z.object({
      operation: z.enum(["add", "subtract", "multiply", "divide", "power"]).describe("The mathematical operation to perform"),
      a: z.number().describe("First number"),
      b: z.number().describe("Second number")
    }),
    execute: async (params) => {
      const { operation, a, b } = params;
      let result: number;
      
      switch (operation) {
        case "add":
          result = a + b;
          break;
        case "subtract":
          result = a - b;
          break;
        case "multiply":
          result = a * b;
          break;
        case "divide":
          if (b === 0) throw new Error("Division by zero is not allowed");
          result = a / b;
          break;
        case "power":
          result = Math.pow(a, b);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
      
      return `${a} ${operation} ${b} = ${result}`;
    }
  });

  // Text processing tool
  server.addTool({
    name: "text_transform",
    description: "Transform text in various ways",
    parameters: z.object({
      text: z.string().describe("The text to transform"),
      operation: z.enum(["uppercase", "lowercase", "capitalize", "reverse", "word_count", "char_count"]).describe("The transformation operation")
    }),
    execute: async (params) => {
      const { text, operation } = params;
      
      switch (operation) {
        case "uppercase":
          return text.toUpperCase();
        case "lowercase":
          return text.toLowerCase();
        case "capitalize":
          return text.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ');
        case "reverse":
          return text.split('').reverse().join('');
        case "word_count":
          return `Word count: ${text.trim().split(/\s+/).length}`;
        case "char_count":
          return `Character count: ${text.length}`;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    }
  });

  // Random data generator tool
  server.addTool({
    name: "generate_data",
    description: "Generate random data for testing purposes",
    parameters: z.object({
      type: z.enum(["uuid", "password", "email", "phone", "color", "number"]).describe("Type of data to generate"),
      count: z.number().min(1).max(100).default(1).describe("Number of items to generate"),
      options: z.object({
        length: z.number().optional().describe("Length for password generation"),
        min: z.number().optional().describe("Minimum value for number generation"),
        max: z.number().optional().describe("Maximum value for number generation")
      }).optional()
    }),
    execute: async (params) => {
      const { type, count, options = {} } = params;
      const results: string[] = [];
      
      for (let i = 0; i < count; i++) {
        switch (type) {
          case "uuid":
            results.push(crypto.randomUUID());
            break;
          case "password":
            const length = options.length || 12;
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
            let password = '';
            for (let j = 0; j < length; j++) {
              password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            results.push(password);
            break;
          case "email":
            const domains = ['example.com', 'test.org', 'demo.net'];
            const username = Math.random().toString(36).substring(2, 8);
            const domain = domains[Math.floor(Math.random() * domains.length)];
            results.push(`${username}@${domain}`);
            break;
          case "phone":
            const phone = `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
            results.push(phone);
            break;
          case "color":
            const color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
            results.push(color);
            break;
          case "number":
            const min = options.min || 1;
            const max = options.max || 100;
            const number = Math.floor(Math.random() * (max - min + 1)) + min;
            results.push(number.toString());
            break;
        }
      }
      
      return count === 1 ? results[0] : results.join('\n');
    }
  });

  // Date and time utility tool
  server.addTool({
    name: "datetime_utility",
    description: "Work with dates and times",
    parameters: z.object({
      operation: z.enum(["current", "format", "add_days", "diff_days", "timezone_convert"]).describe("The datetime operation to perform"),
      date: z.string().optional().describe("ISO date string (for operations that need a date)"),
      format: z.string().optional().describe("Date format string"),
      days: z.number().optional().describe("Number of days to add"),
      target_date: z.string().optional().describe("Target date for comparison"),
      timezone: z.string().optional().describe("Target timezone")
    }),
    execute: async (params) => {
      const { operation, date, format, days, target_date, timezone } = params;
      
      switch (operation) {
        case "current":
          return new Date().toISOString();
        case "format":
          if (!date) throw new Error("Date parameter required for format operation");
          const d = new Date(date);
          return format ? d.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : d.toISOString();
        case "add_days":
          if (!date || days === undefined) throw new Error("Date and days parameters required");
          const addDate = new Date(date);
          addDate.setDate(addDate.getDate() + days);
          return addDate.toISOString();
        case "diff_days":
          if (!date || !target_date) throw new Error("Date and target_date parameters required");
          const date1 = new Date(date);
          const date2 = new Date(target_date);
          const diffTime = Math.abs(date2.getTime() - date1.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return `${diffDays} days`;
        case "timezone_convert":
          if (!date || !timezone) throw new Error("Date and timezone parameters required");
          const tzDate = new Date(date);
          return tzDate.toLocaleString('en-US', { timeZone: timezone });
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    }
  });

  // JSON utility tool
  server.addTool({
    name: "json_utility",
    description: "Work with JSON data",
    parameters: z.object({
      operation: z.enum(["validate", "format", "minify", "extract_keys", "extract_values"]).describe("The JSON operation to perform"),
      json: z.string().describe("JSON string to process"),
      key_path: z.string().optional().describe("Dot notation path for value extraction (e.g., 'user.name')")
    }),
    execute: async (params) => {
      const { operation, json, key_path } = params;
      
      try {
        const parsed = JSON.parse(json);
        
        switch (operation) {
          case "validate":
            return "Valid JSON";
          case "format":
            return JSON.stringify(parsed, null, 2);
          case "minify":
            return JSON.stringify(parsed);
          case "extract_keys":
            const extractKeys = (obj: any, prefix = ''): string[] => {
              let keys: string[] = [];
              for (const key in obj) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                keys.push(fullKey);
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                  keys = keys.concat(extractKeys(obj[key], fullKey));
                }
              }
              return keys;
            };
            return extractKeys(parsed);
          case "extract_values":
            if (!key_path) throw new Error("key_path required for extract_values operation");
            const keys = key_path.split('.');
            let value = parsed;
            for (const key of keys) {
              value = value[key];
              if (value === undefined) return null;
            }
            return value;
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }
      } catch (error: any) {
        if (operation === "validate") {
          return `Invalid JSON: ${error.message}`;
        }
        throw error;
      }
    }
  });

  // Register Instagram tools
  instagramTools.forEach(tool => {
    server.addTool(tool);
  });
}