import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

interface Project { id: string; name: string; }
interface Task { id: string; projectId: string; status: string; }

const projects: Project[] = [];
const tasks: Task[] = [];

app.get('/health', (_: Request, res: Response) => res.json({ ok: true }));

app.post('/projects', (req: Request, res: Response) => {
  const id = (projects.length + 1).toString();
  const project: Project = { id, name: req.body.name };
  projects.push(project);
  res.json(project);
});

app.post('/scrape', (req: Request, res: Response) => {
  const id = (tasks.length + 1).toString();
  const task: Task = { id, projectId: req.body.project, status: 'queued' };
  tasks.push(task);
  res.json(task);
});

app.get('/tasks/:id', (req: Request, res: Response) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).end();
  res.json(task);
});

app.get('/tasks/:id/download', (req: Request, res: Response) => {
  const data = { message: 'mock data for ' + req.params.id };
  res.json(data);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on ${port}`);
});
