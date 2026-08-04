export type ToolCategory = 
  | 'developer' | 'encoders' | 'crypto' | 'seo' | 'text' 
  | 'string' | 'content' | 'markdown' | 'color' | 'css'
  | 'financial' | 'converters' | 'math' | 'image' | 'datetime'
  | 'network' | 'generators';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  keywords: string[];
  icon: string; // lucide icon name
}

export const categoryLabels: Record<ToolCategory, { label: string; icon: string; description: string }> = {
  developer: { label: 'Developer Tools', icon: 'Code2', description: 'Formatters, converters, validators, and diff tools' },
  encoders: { label: 'Encoders & Decoders', icon: 'Binary', description: 'Base64, URL, HTML entities, JWT, and more' },
  crypto: { label: 'Crypto & Hash', icon: 'Shield', description: 'Hashing, encryption, passwords, and security' },
  seo: { label: 'SEO Tools', icon: 'Search', description: 'Meta tags, schema, sitemaps, and analysis' },
  text: { label: 'Text Tools', icon: 'Type', description: 'Counters, case converters, and text manipulation' },
  string: { label: 'String Utilities', icon: 'Terminal', description: 'Escape, regex, generators, and encoding' },
  content: { label: 'Content & Writing', icon: 'PenTool', description: 'Headlines, readability, social media' },
  markdown: { label: 'Markdown Tools', icon: 'FileText', description: 'Editor, converters, and table generator' },
  color: { label: 'Color Tools', icon: 'Palette', description: 'Picker, converter, palette, and contrast' },
  css: { label: 'CSS Tools', icon: 'Paintbrush', description: 'Generators for gradients, shadows, flexbox' },
  financial: { label: 'Financial Calculators', icon: 'DollarSign', description: 'Loans, interest, tax, investments' },
  converters: { label: 'Unit Converters', icon: 'ArrowLeftRight', description: 'Length, weight, temperature, data, and more' },
  math: { label: 'Math & Science', icon: 'Calculator', description: 'Scientific, statistics, equations' },
  image: { label: 'Image Tools', icon: 'Image', description: 'Compress, resize, convert, QR codes' },
  datetime: { label: 'Date & Time', icon: 'Clock', description: 'Timestamps, timezones, cron builder' },
  network: { label: 'Network & API', icon: 'Globe', description: 'DNS, IP lookup, HTTP status codes' },
  generators: { label: 'Generators', icon: 'Sparkles', description: 'UUID, Lorem Ipsum, passwords, fake data' },
};

// Tools will self-register by importing this and adding to the array
export const tools: ToolDefinition[] = [];

export function registerTool(tool: ToolDefinition) {
  if (!tools.find(t => t.id === tool.id)) {
    tools.push(tool);
  }
}

export function getToolsByCategory(category: ToolCategory): ToolDefinition[] {
  return tools.filter(t => t.category === category);
}

export function getAllCategories(): ToolCategory[] {
  return Object.keys(categoryLabels) as ToolCategory[];
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.toLowerCase();
  return tools.filter(t => 
    t.name.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.keywords.some(k => k.toLowerCase().includes(q))
  );
}
