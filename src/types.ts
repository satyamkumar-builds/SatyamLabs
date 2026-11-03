export type SupportedLanguage = 
  | 'html' 
  | 'css' 
  | 'javascript' 
  | 'typescript' 
  | 'python' 
  | 'cpp' 
  | 'c' 
  | 'java' 
  | 'rust' 
  | 'sql' 
  | 'markdown' 
  | 'json';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  content: string;
  isFolder: boolean;
  language: SupportedLanguage;
  children?: FileItem[];
}

export type ThemeId = 
  | 'dark-plus' 
  | 'one-dark' 
  | 'dracula' 
  | 'monokai' 
  | 'github-dark' 
  | 'cyberpunk' 
  | 'light';

export interface TabItem {
  fileId: string;
  isDirty?: boolean;
}

export interface ExecutionLog {
  id: string;
  text: string;
  type: 'stdout' | 'stderr' | 'info' | 'system';
  timestamp: string;
}

export interface EditorSettings {
  fontSize: number;
  theme: ThemeId;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  autoRunWeb: boolean;
}

export type ActivePanel = 'explorer' | 'search' | 'templates' | 'settings' | 'github';
export type ViewMode = 'editor' | 'preview' | 'split';
