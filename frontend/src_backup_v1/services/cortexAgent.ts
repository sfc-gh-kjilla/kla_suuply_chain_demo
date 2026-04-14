const SNOWFLAKE_ACCOUNT_URL = import.meta.env.VITE_SNOWFLAKE_ACCOUNT_URL || '';
const SNOWFLAKE_PAT = import.meta.env.VITE_SNOWFLAKE_PAT || '';
const AGENT_DATABASE = 'KLA_SUPPLY_CHAIN';
const AGENT_SCHEMA = 'APP';
const AGENT_NAME = 'KLA_DIAGNOSTIC_AGENT';

export interface AgentMessage {
  role: 'user' | 'assistant';
  content: Array<{ type: 'text'; text: string }>;
}

export interface ToolResult {
  tool: string;
  result: unknown;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SNOWFLAKE_PAT}`,
    ...options.headers as Record<string, string>,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  
  return response;
}

export async function runAgent(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: Array<{ type: string; text: string }> }>
): Promise<{ responseText: string; toolResults: ToolResult[] }> {
  const messages = [
    ...conversationHistory,
    {
      role: 'user',
      content: [{ type: 'text', text: userMessage }],
    },
  ];

  const response = await fetchWithAuth(
    `${SNOWFLAKE_ACCOUNT_URL}/api/v2/databases/${AGENT_DATABASE}/schemas/${AGENT_SCHEMA}/agents/${AGENT_NAME}:run`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        messages,
        stream: false,
      }),
    }
  );

  const data = await response.json();
  
  let responseText = '';
  const toolResults: ToolResult[] = [];

  if (data.content && Array.isArray(data.content)) {
    for (const item of data.content) {
      if (item.type === 'text' && item.text) {
        responseText += item.text;
      }
      if (item.type === 'tool_result' && item.tool_result) {
        toolResults.push({
          tool: item.tool_result.name || 'unknown',
          result: item.tool_result.content,
        });
      }
    }
  }

  return { responseText, toolResults };
}

export function isAgentConfigured(): boolean {
  return Boolean(SNOWFLAKE_ACCOUNT_URL && SNOWFLAKE_PAT);
}
