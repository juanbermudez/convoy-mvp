const { OpenAI } = require('openai');

/**
 * AI Planning Module
 * Responsible for interacting with LLM APIs to generate plans and summaries
 */
class AIPlanningModule {
  constructor(supabaseClient, llmApiKey) {
    this.supabase = supabaseClient;
    // Initialize OpenAI client (could be replaced with Anthropic or other LLM providers)
    this.llmClient = new OpenAI({
      apiKey: llmApiKey
    });
  }

  /**
   * Fetch context for planning from the database
   */
  async fetchContextForPlanning(projectId) {
    if (!this.supabase) return null;
    
    try {
      // Get project data
      const { data: projectData, error: projectError } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      
      // Get existing tasks if any
      const { data: existingTasks, error: tasksError } = await this.supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);
      
      if (tasksError) throw tasksError;
      
      // Get project rules if any
      const { data: projectRules, error: rulesError } = await this.supabase
        .from('project_rules')
        .select('*')
        .eq('project_id', projectId);
      
      if (rulesError) throw rulesError;
      
      return {
        project: projectData,
        existingTasks: existingTasks || [],
        projectRules: projectRules || []
      };
    } catch (error) {
      console.error('Error fetching planning context:', error);
      return null;
    }
  }

  /**
   * Generate a plan for a project based on description
   */
  async generatePlan(projectName, description, context = null) {
    try {
      // Construct the prompt
      const prompt = this._constructPlanningPrompt(projectName, description, context);
      
      // Call LLM API
      const response = await this.llmClient.chat.completions.create({
        model: "gpt-4", // Or other appropriate model
        messages: [
          {
            role: "system", 
            content: "You are an expert software developer and project planner. Your job is to break down projects into clear, actionable tasks."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.5, // Lower temperature for more consistent results
        max_tokens: 2000
      });
      
      // Parse the response
      const content = response.choices[0].message.content.trim();
      const tasks = this._parseTasksFromResponse(content);
      
      return tasks;
    } catch (error) {
      console.error('Error generating plan:', error);
      // Return a fallback minimal plan
      return [
        {
          title: `Initial setup for ${projectName}`,
          description: "Set up the basic project structure and configuration.",
          priority: "high"
        },
        {
          title: `Implementation of ${projectName} core features`,
          description: "Implement the main functionality described in the project.",
          priority: "medium"
        },
        {
          title: `Testing and documentation for ${projectName}`,
          description: "Create tests and documentation for the implemented features.",
          priority: "medium"
        }
      ];
    }
  }

  /**
   * Construct the prompt for planning
   */
  _constructPlanningPrompt(projectName, description, context) {
    let prompt = `
Project Name: ${projectName}

Project Description:
${description}

`;

    // Add context information if available
    if (context) {
      if (context.existingTasks && context.existingTasks.length > 0) {
        prompt += "\nExisting tasks in this project:\n";
        context.existingTasks.forEach(task => {
          prompt += `- ${task.title} (${task.status}): ${task.description}\n`;
        });
      }
      
      if (context.projectRules && context.projectRules.length > 0) {
        prompt += "\nProject rules to consider:\n";
        context.projectRules.forEach(rule => {
          prompt += `- ${rule.name}: ${rule.description}\n`;
        });
      }
    }

    prompt += `
Please break down this project into a list of actionable tasks. Each task should include:
1. A clear, concise title
2. A detailed description of what needs to be done
3. A priority level (high, medium, or low)

Format your response as a list of JSON objects with the following structure:
[
  {
    "title": "Task title",
    "description": "Detailed description of what needs to be done",
    "priority": "high|medium|low"
  },
  ...
]

Please generate between 5-10 tasks that cover the project scope.
`;

    return prompt;
  }

  /**
   * Parse LLM response into task objects
   */
  _parseTasksFromResponse(response) {
    try {
      // Extract JSON array from the response text
      const jsonMatch = response.match(/\[\s*\{.*\}\s*\]/s);
      
      if (jsonMatch) {
        const tasksJson = jsonMatch[0];
        const tasks = JSON.parse(tasksJson);
        
        // Validate tasks
        return tasks.map(task => ({
          title: task.title || 'Untitled task',
          description: task.description || '',
          priority: ['high', 'medium', 'low'].includes(task.priority?.toLowerCase())
            ? task.priority.toLowerCase()
            : 'medium'
        }));
      }
      
      // If JSON parsing fails, attempt to extract tasks in a more forgiving way
      const taskRegex = /(?:Task|^\d+)[^\n]*title[^\n]*:([^\n]*)[^\n]*description[^\n]*:([^\n]*)[^\n]*priority[^\n]*:([^\n]*)/gi;
      const matches = [...response.matchAll(taskRegex)];
      
      if (matches.length > 0) {
        return matches.map(match => ({
          title: match[1]?.trim() || 'Untitled task',
          description: match[2]?.trim() || '',
          priority: ['high', 'medium', 'low'].includes(match[3]?.trim().toLowerCase())
            ? match[3]?.trim().toLowerCase()
            : 'medium'
        }));
      }
      
      // Fallback
      console.warn('Failed to parse tasks from response, using fallback parsing.');
      const lines = response.split('\n').filter(line => line.trim().length > 0);
      
      // Try to extract task titles
      const tasks = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/^\d+\.|^Task \d+:|^-\s+\w+/)) {
          const title = line.replace(/^\d+\.|^Task \d+:|^-\s+/, '').trim();
          const description = i + 1 < lines.length ? lines[i + 1].trim() : '';
          tasks.push({
            title: title || 'Untitled task',
            description: description,
            priority: 'medium'
          });
        }
      }
      
      return tasks.length > 0 ? tasks : [
        { title: 'Task 1', description: 'First task generated from the project description', priority: 'high' },
        { title: 'Task 2', description: 'Second task generated from the project description', priority: 'medium' },
        { title: 'Task 3', description: 'Third task generated from the project description', priority: 'medium' }
      ];
    } catch (error) {
      console.error('Error parsing tasks from response:', error);
      return [
        { title: 'Task 1', description: 'First task generated from the project description', priority: 'high' },
        { title: 'Task 2', description: 'Second task generated from the project description', priority: 'medium' },
        { title: 'Task 3', description: 'Third task generated from the project description', priority: 'medium' }
      ];
    }
  }

  /**
   * Save generated tasks to the database
   */
  async saveTasks(projectId, tasks) {
    if (!this.supabase) throw new Error('Supabase client not initialized');
    
    // Convert tasks to database format
    const dbTasks = tasks.map(task => ({
      project_id: projectId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: 'todo',
    }));
    
    // Insert into Supabase
    const { data, error } = await this.supabase
      .from('tasks')
      .insert(dbTasks)
      .select();
    
    if (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
    
    // Log activity for each created task
    for (const task of data) {
      await this.supabase
        .from('activity_feed_items')
        .insert({
          task_id: task.id,
          agent_id: 'ai-planner',
          type: 'TASK_CREATED',
          content: `Task created: "${task.title}" with priority "${task.priority}"`
        });
    }
    
    return data;
  }

  /**
   * Generate a checkpoint summary for a task
   */
  async generateCheckpointSummary(task, activities, checkpointType) {
    try {
      let systemPrompt = '';
      let userPrompt = '';
      
      // Set up prompts based on checkpoint type
      switch (checkpointType) {
        case 'PLAN_REVIEW':
          systemPrompt = "You are an AI assistant helping with project planning review. Summarize the proposed plan clearly.";
          userPrompt = this._constructPlanReviewPrompt(task, activities);
          break;
        
        case 'CODE_REVIEW':
          systemPrompt = "You are an AI code reviewer helping to ensure code quality. Summarize the code changes and highlight any issues.";
          userPrompt = this._constructCodeReviewPrompt(task, activities);
          break;
        
        case 'FUNCTIONALITY_REVIEW':
          systemPrompt = "You are an AI reviewer assessing functionality. Summarize the feature implementation and highlight any issues.";
          userPrompt = this._constructFunctionalityReviewPrompt(task, activities);
          break;
        
        default:
          systemPrompt = "You are an AI assistant summarizing task progress. Create a clear summary of the current state.";
          userPrompt = this._constructDefaultSummaryPrompt(task, activities);
      }
      
      // Call LLM API
      const response = await this.llmClient.chat.completions.create({
        model: "gpt-4", // Or other appropriate model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error(`Error generating ${checkpointType} summary:`, error);
      return `[AI was unable to generate a detailed summary due to an error]
      
Basic summary: 
Task "${task.title}" is ready for ${checkpointType.toLowerCase().replace('_', ' ')}.
Status: ${task.status}
Priority: ${task.priority}`;
    }
  }

  /**
   * Construct prompt for plan review
   */
  _constructPlanReviewPrompt(task, activities) {
    return `
I need a summary of the planning for the following task:

Task: ${task.title}
Description: ${task.description}
Status: ${task.status}
Priority: ${task.priority}

Recent activity:
${activities.slice(0, 5).map(a => `- ${a.timestamp}: ${a.content}`).join('\n')}

Please create a concise summary of the proposed plan for this task. Highlight the key aspects that should be reviewed before proceeding with implementation. Your summary should help the reviewer understand what's being proposed and make an informed decision about whether to approve the plan or request revisions.
`;
  }

  /**
   * Construct prompt for code review
   */
  _constructCodeReviewPrompt(task, activities) {
    return `
I need a summary of the code changes for the following task:

Task: ${task.title}
Description: ${task.description}
Status: ${task.status}
Priority: ${task.priority}

Recent activity (newest first):
${activities.slice(0, 10).map(a => `- ${a.timestamp}: ${a.content}`).join('\n')}

Please create a concise summary of the code changes made for this task. Highlight any key implementation decisions, potential issues or areas that should be reviewed more carefully. Your summary should help the reviewer understand what changes were made and make an informed decision about whether to approve the code or request revisions.
`;
  }

  /**
   * Construct prompt for functionality review
   */
  _constructFunctionalityReviewPrompt(task, activities) {
    return `
I need a summary of the functionality implementation for the following task:

Task: ${task.title}
Description: ${task.description}
Status: ${task.status}
Priority: ${task.priority}

Recent activity (newest first):
${activities.slice(0, 10).map(a => `- ${a.timestamp}: ${a.content}`).join('\n')}

Please create a concise summary of the functionality implemented for this task. Highlight what features were added, how they should be tested, and any known limitations. Your summary should help the reviewer understand what was implemented and make an informed decision about whether the functionality meets requirements or needs further work.
`;
  }

  /**
   * Construct default summary prompt
   */
  _constructDefaultSummaryPrompt(task, activities) {
    return `
I need a general summary of the following task:

Task: ${task.title}
Description: ${task.description}
Status: ${task.status}
Priority: ${task.priority}

Recent activity (newest first):
${activities.slice(0, 10).map(a => `- ${a.timestamp}: ${a.content}`).join('\n')}

Please create a concise summary of the current state of this task. Highlight key progress, any blockers or issues, and what needs to be done next. Your summary should help the reviewer understand the current state and make an informed decision about next steps.
`;
  }
}

module.exports = { AIPlanningModule };
