export interface Job {
  id: string;
  pluginId: string;
  status: 'queued' | 'running' | 'complete' | 'error';
  input: string;
  output?: string;
  error?: string;
  createdAt: string;
}