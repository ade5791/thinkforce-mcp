import { FastMCP } from "fastmcp";
import { z } from "zod";

/**
 * Register all prompts with the MCP server
 * @param server The FastMCP server instance
 */
export function registerPrompts(server: FastMCP) {
  // Example prompt
  server.addPrompt({
    name: "greeting",
    description: "A simple greeting prompt",
    arguments: [
      {
        name: "name",
        description: "Name to greet",
        required: true,
      },
    ],
    load: async ({ name }) => {
      return `Hello, ${name}! How can I help you today?`;
    }
  });

  // Code generation prompt
  server.addPrompt({
    name: "code_generator",
    description: "Generate code based on requirements",
    arguments: [
      {
        name: "language",
        description: "Programming language",
        required: true,
      },
      {
        name: "functionality",
        description: "Description of the functionality needed",
        required: true,
      },
      {
        name: "style",
        description: "Coding style or framework preferences",
        required: false,
      },
    ],
    load: async ({ language, functionality, style }) => {
      let prompt = `Generate ${language} code that ${functionality}.`;
      
      if (style) {
        prompt += ` Follow ${style} coding conventions and best practices.`;
      }
      
      prompt += `

Requirements:
- Write clean, readable code
- Include appropriate comments
- Handle edge cases and errors
- Follow ${language} best practices
- Provide usage examples if applicable

Please generate the code and explain how it works.`;
      
      return prompt;
    }
  });

  // Technical documentation prompt
  server.addPrompt({
    name: "tech_documentation",
    description: "Generate technical documentation",
    arguments: [
      {
        name: "type",
        description: "Type of documentation (API, user guide, README, etc.)",
        required: true,
      },
      {
        name: "project_name",
        description: "Name of the project",
        required: true,
      },
      {
        name: "description",
        description: "Brief description of the project",
        required: true,
      },
      {
        name: "audience",
        description: "Target audience (developers, end-users, etc.)",
        required: false,
      },
    ],
    load: async ({ type, project_name, description, audience }) => {
      const targetAudience = audience || "developers";
      
      return `Create comprehensive ${type} documentation for "${project_name}".

Project Description: ${description}
Target Audience: ${targetAudience}

Please include:
- Clear and concise explanations
- Step-by-step instructions where applicable
- Code examples and usage patterns
- Common troubleshooting scenarios
- Prerequisites and setup requirements
- Best practices and recommendations

Structure the documentation in a logical, easy-to-follow format that would be helpful for ${targetAudience}.`;
    }
  });

  // Data analysis prompt
  server.addPrompt({
    name: "data_analysis",
    description: "Analyze data and provide insights",
    arguments: [
      {
        name: "data_type",
        description: "Type of data to analyze",
        required: true,
      },
      {
        name: "analysis_goal",
        description: "What insights or conclusions are needed",
        required: true,
      },
      {
        name: "format",
        description: "Preferred output format (report, charts, summary, etc.)",
        required: false,
      },
    ],
    load: async ({ data_type, analysis_goal, format }) => {
      const outputFormat = format || "detailed report";
      
      return `Analyze ${data_type} data to ${analysis_goal}.

Please provide:
- Data exploration and initial observations
- Key patterns, trends, and anomalies
- Statistical insights and metrics
- Actionable recommendations
- Visual representations where helpful
- Limitations and assumptions

Format the analysis as a ${outputFormat} that clearly communicates findings and their implications.`;
    }
  });

  // Creative writing prompt
  server.addPrompt({
    name: "creative_writing",
    description: "Generate creative content",
    arguments: [
      {
        name: "genre",
        description: "Genre of writing (story, poem, script, etc.)",
        required: true,
      },
      {
        name: "theme",
        description: "Central theme or topic",
        required: true,
      },
      {
        name: "tone",
        description: "Desired tone (serious, humorous, mysterious, etc.)",
        required: false,
      },
      {
        name: "length",
        description: "Approximate length (short, medium, long)",
        required: false,
      },
    ],
    load: async ({ genre, theme, tone, length }) => {
      const writingTone = tone || "engaging";
      const writingLength = length || "medium";
      
      return `Write a ${writingLength} ${genre} with a ${writingTone} tone, centered around the theme of "${theme}".

Creative guidelines:
- Develop compelling characters or elements
- Create an engaging narrative structure
- Use vivid descriptions and imagery
- Incorporate the theme naturally throughout
- Maintain consistency in tone and style
- End with a satisfying conclusion

Focus on creating original, creative content that captures the reader's attention and effectively explores the given theme.`;
    }
  });

  // Problem-solving prompt
  server.addPrompt({
    name: "problem_solver",
    description: "Structured approach to problem solving",
    arguments: [
      {
        name: "problem",
        description: "Description of the problem to solve",
        required: true,
      },
      {
        name: "context",
        description: "Additional context or constraints",
        required: false,
      },
      {
        name: "approach",
        description: "Preferred problem-solving approach",
        required: false,
      },
    ],
    load: async ({ problem, context, approach }) => {
      let prompt = `Analyze and solve the following problem: ${problem}`;
      
      if (context) {
        prompt += `\n\nContext and Constraints: ${context}`;
      }
      
      if (approach) {
        prompt += `\n\nPreferred Approach: ${approach}`;
      }
      
      prompt += `

Please provide a structured solution that includes:

1. **Problem Analysis**
   - Break down the problem into components
   - Identify key challenges and constraints
   - Clarify assumptions

2. **Solution Strategy**
   - Outline your approach
   - Consider alternative solutions
   - Explain your reasoning

3. **Implementation Plan**
   - Step-by-step action items
   - Required resources or tools
   - Timeline considerations

4. **Risk Assessment**
   - Potential obstacles
   - Mitigation strategies
   - Contingency plans

5. **Success Metrics**
   - How to measure solution effectiveness
   - Key performance indicators`;

      return prompt;
    }
  });

  // Learning and explanation prompt
  server.addPrompt({
    name: "explain_concept",
    description: "Explain complex concepts clearly",
    arguments: [
      {
        name: "concept",
        description: "The concept to explain",
        required: true,
      },
      {
        name: "level",
        description: "Complexity level (beginner, intermediate, advanced)",
        required: true,
      },
      {
        name: "context",
        description: "Domain or field context",
        required: false,
      },
    ],
    load: async ({ concept, level, context }) => {
      const domainContext = context ? ` in the context of ${context}` : "";
      
      return `Explain "${concept}"${domainContext} for someone at a ${level} level.

Structure your explanation to include:

1. **Simple Definition**
   - Clear, jargon-free explanation
   - Core essence of the concept

2. **Key Components**
   - Break down into main parts
   - How components relate to each other

3. **Real-World Examples**
   - Practical applications
   - Relatable analogies or metaphors

4. **Common Misconceptions**
   - What people often get wrong
   - Clarify confusing aspects

5. **Next Steps**
   - Related concepts to explore
   - Resources for deeper learning

Adjust the complexity and depth based on the ${level} level, ensuring the explanation is accessible yet comprehensive.`;
    }
  });

  // Review and feedback prompt
  server.addPrompt({
    name: "review_feedback",
    description: "Provide structured review and feedback",
    arguments: [
      {
        name: "content_type",
        description: "Type of content to review (code, document, design, etc.)",
        required: true,
      },
      {
        name: "focus_areas",
        description: "Specific areas to focus on during review",
        required: false,
      },
      {
        name: "criteria",
        description: "Evaluation criteria or standards",
        required: false,
      },
    ],
    load: async ({ content_type, focus_areas, criteria }) => {
      let prompt = `Please review the following ${content_type} and provide constructive feedback.`;
      
      if (focus_areas) {
        prompt += `\n\nFocus Areas: ${focus_areas}`;
      }
      
      if (criteria) {
        prompt += `\n\nEvaluation Criteria: ${criteria}`;
      }
      
      prompt += `

Please structure your review as follows:

1. **Overall Assessment**
   - General strengths and weaknesses
   - Key observations

2. **Detailed Feedback**
   - Specific issues and suggestions
   - Line-by-line or section-by-section comments where applicable

3. **Strengths to Maintain**
   - What's working well
   - Best practices being followed

4. **Areas for Improvement**
   - Priority issues to address
   - Specific recommendations

5. **Action Items**
   - Concrete steps for improvement
   - Suggested next actions

Provide feedback that is constructive, specific, and actionable to help improve the quality of the ${content_type}.`;

      return prompt;
    }
  });
}
