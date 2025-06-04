#!/usr/bin/env node

// Test script for MCP server tools
const SERVER_URL = 'http://localhost:3001';

async function testTool(toolName, params) {
  console.log(`\n🧪 Testing tool: ${toolName}`);
  console.log(`📋 Parameters:`, JSON.stringify(params, null, 2));
  
  try {
    const response = await fetch(`${SERVER_URL}/tools/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: toolName,
        arguments: params
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ Result:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return null;
  }
}

async function testPrompt(promptName, args) {
  console.log(`\n📝 Testing prompt: ${promptName}`);
  console.log(`📋 Arguments:`, JSON.stringify(args, null, 2));
  
  try {
    const response = await fetch(`${SERVER_URL}/prompts/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: promptName,
        arguments: args
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ Result:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return null;
  }
}

async function testResource(uri) {
  console.log(`\n🗂️ Testing resource: ${uri}`);
  
  try {
    const response = await fetch(`${SERVER_URL}/resources/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uri: uri
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ Result:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Error:`, error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('🚀 Starting MCP Server Tests...\n');

  // Test Tools
  console.log('=' .repeat(50));
  console.log('🔧 TESTING TOOLS');
  console.log('=' .repeat(50));

  await testTool('hello_world', { name: 'Alice' });
  await testTool('calculate', { operation: 'add', a: 15, b: 25 });
  await testTool('text_transform', { text: 'hello world', operation: 'capitalize' });
  await testTool('generate_data', { type: 'uuid', count: 2 });
  await testTool('datetime_utility', { operation: 'current' });
  await testTool('json_utility', { 
    operation: 'format', 
    json: '{"name":"John","age":30,"city":"New York"}' 
  });

  // Test Prompts
  console.log('\n' + '=' .repeat(50));
  console.log('📝 TESTING PROMPTS');
  console.log('=' .repeat(50));

  await testPrompt('greeting', { name: 'Bob' });
  await testPrompt('code_generator', { 
    language: 'JavaScript', 
    functionality: 'creates a simple calculator function' 
  });
  await testPrompt('explain_concept', { 
    concept: 'Machine Learning', 
    level: 'beginner' 
  });

  // Test Resources
  console.log('\n' + '=' .repeat(50));
  console.log('🗂️ TESTING RESOURCES');
  console.log('=' .repeat(50));

  await testResource('config://dev/api-service');
  await testResource('logs://web-server/2025-05-30/info');
  await testResource('metrics://api-service/24h');
  await testResource('docs://readme/basic');

  console.log('\n✨ All tests completed!');
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { testTool, testPrompt, testResource, runAllTests };