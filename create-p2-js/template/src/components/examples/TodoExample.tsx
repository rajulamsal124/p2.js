import React, { useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

// Define Todo type
const TodoSchema = z.object({
  id: z.number(),
  text: z.string(),
  completed: z.boolean(),
});

type Todo = z.infer<typeof TodoSchema>;

// Mock API functions (replace with real API calls later)
const fetchTodos = async (): Promise<Todo[]> => {
  const todos = localStorage.getItem('todos');
  return todos ? JSON.parse(todos) : [];
};

const addTodo = async (text: string): Promise<Todo> => {
  const todos = await fetchTodos();
  const newTodo: Todo = {
    id: todos.length + 1,
    text,
    completed: false,
  };
  localStorage.setItem('todos', JSON.stringify([...todos, newTodo]));
  return newTodo;
};

const toggleTodo = async (id: number): Promise<Todo> => {
  const todos = await fetchTodos();
  const updatedTodos = todos.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  localStorage.setItem('todos', JSON.stringify(updatedTodos));
  return updatedTodos.find(todo => todo.id === id)!;
};

const deleteTodo = async (id: number): Promise<void> => {
  const todos = await fetchTodos();
  const filteredTodos = todos.filter(todo => todo.id !== id);
  localStorage.setItem('todos', JSON.stringify(filteredTodos));
};

export const TodoExample: React.FC = () => {
  const [newTodo, setNewTodo] = useState('');
  const queryClient = useQueryClient();

  // Queries
  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: fetchTodos,
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: addTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setNewTodo('');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: toggleTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    addMutation.mutate(newTodo);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="flex-1 px-4 py-2 border rounded"
            placeholder="Add new todo"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center justify-between p-4 bg-white rounded shadow"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleMutation.mutate(todo.id)}
                className="h-5 w-5"
              />
              <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                {todo.text}
              </span>
            </div>
            
            <div>
              <button
                onClick={() => deleteMutation.mutate(todo.id)}
                className="px-3 py-1 text-sm text-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
