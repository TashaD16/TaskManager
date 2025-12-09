import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const tasksFilePath = path.join(__dirname, 'tasks.json');

// Helper function to read tasks from the JSON file
const readTasks = async () => {
  try {
    const data = await fs.readFile(tasksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []; // If the file doesn't exist, return an empty array
    }
    throw error;
  }
};

// Helper function to write tasks to the JSON file
const writeTasks = async (tasks) => {
  await fs.writeFile(tasksFilePath, JSON.stringify(tasks, null, 2));
};

// Get all tasks
app.get('/tasks', async (req, res) => {
  const tasks = await readTasks();
  res.json(tasks);
});

// Add a new task
app.post('/tasks', async (req, res) => {
  const tasks = await readTasks();
  const newTask = {
    id: Date.now().toString(),
    ...req.body,
    status: 'todo', // Default status
  };
  tasks.push(newTask);
  await writeTasks(tasks);
  res.status(201).json(newTask);
});

// Update a task
app.put('/tasks/:id', async (req, res) => {
  const tasks = await readTasks();
  const taskIndex = tasks.findIndex((t) => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).send('Task not found');
  }
  tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
  await writeTasks(tasks);
  res.json(tasks[taskIndex]);
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
  const tasks = await readTasks();
  const newTasks = tasks.filter((t) => t.id !== req.params.id);
  if (tasks.length === newTasks.length) {
    return res.status(404).send('Task not found');
  }
  await writeTasks(newTasks);
  res.status(204).send();
});

// AI endpoint for sub-task suggestions (placeholder)
app.post('/tasks/:id/suggest-subtasks', async (req, res) => {
    // TODO: Integrate with Gemini API
    console.log(`Received request to suggest sub-tasks for task ID: ${req.params.id}`);
    console.log(`Task Title: ${req.body.title}`);

    // Placeholder response
    const suggestions = [
        { id: 'sub1', title: `Sub-task 1 for "${req.body.title}"`, status: 'todo' },
        { id: 'sub2', title: `Sub-task 2 for "${req.body.title}"`, status: 'todo' },
    ];

    res.json(suggestions);
});


app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
