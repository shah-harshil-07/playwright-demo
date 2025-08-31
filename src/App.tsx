import React, { useState, useRef, useEffect, ChangeEvent, KeyboardEvent, FormEvent } from 'react';

// Types
type Todo = {
  id: number;
  title: string;
  completed: boolean;
};
type Filter = 'All' | 'Active' | 'Completed';

// Constants
const LOCAL_STORAGE_KEY = 'react-todos';
const FILTERS: Filter[] = ['All', 'Active', 'Completed'];

function loadTodos(): Todo[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
}

const TODO_ITEMS = [
  'buy some cheese',
  'feed the cat',
  'book a doctors appointment',
] as const;

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos());
  const [filter, setFilter] = useState<Filter>('All');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const newTodoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  // Filtering items
  const filteredTodos = todos.filter(todo =>
    filter === 'All'
      ? true
      : filter === 'Active'
      ? !todo.completed
      : todo.completed
  );

  // Counts
  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  // Add todo
  function handleAddTodo(e: FormEvent) {
    e.preventDefault();
    const value = newTodoRef.current?.value.trim() ?? '';
    if (value) {
      setTodos([...todos, { id: Date.now(), title: value, completed: false }]);
      if (newTodoRef.current) newTodoRef.current.value = '';
    }
  }

  // Toggle completion
  function handleToggle(id: number) {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  // Delete
  function handleDelete(id: number) {
    setTodos(todos.filter(t => t.id !== id));
  }

  // Editing
  function handleEditStart(todo: Todo) {
    setEditingId(todo.id);
    setEditValue(todo.title);
  }

  function handleEditChange(e: ChangeEvent<HTMLInputElement>) {
    setEditValue(e.target.value);
  }

  function handleEditSubmit(id: number) {
    const val = editValue.trim();
    if (val) {
      setTodos(todos.map(t => t.id === id ? { ...t, title: val } : t));
    } else {
      handleDelete(id);
    }
    setEditingId(null);
    setEditValue('');
  }

  function handleEditKeyDown(e: KeyboardEvent<HTMLInputElement>, id: number) {
    if (e.key === 'Enter') {
      handleEditSubmit(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditValue('');
    }
  }

  function handleEditBlur(id: number) {
    handleEditSubmit(id);
  }

  // Clear completed
  function handleClearCompleted() {
    setTodos(todos.filter(t => !t.completed));
  }

  // Mark all
  function handleMarkAll(e: ChangeEvent<HTMLInputElement>) {
    setTodos(todos.map(t => ({ ...t, completed: e.target.checked })));
  }

  // Filter setter
  function setCurrentFilter(f: Filter) {
    setFilter(f);
  }

  return (
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <form onSubmit={handleAddTodo}>
          <input
            data-testid="new-todo"
            ref={newTodoRef}
            className="new-todo"
            placeholder="What needs to be done?"
            autoFocus
          />
        </form>
      </header>
      {todos.length > 0 && (
        <section className="main">
          <input
            id="toggle-all"
            className="toggle-all"
            type="checkbox"
            aria-label="Mark all as complete"
            checked={activeCount === 0}
            onChange={handleMarkAll}
          />
          <ul className="todo-list" data-testid="todo-list">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                data-testid="todo-item"
                className={todo.completed ? 'completed' : ''}
              >
                <div className="view">
                  {!editingId && (
                    <input
                      className="toggle"
                      type="checkbox"
                      role="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo.id)}
                      style={{ display: editingId === todo.id ? 'none' : undefined }}
                    />
                  )}
                  {!editingId && (
                    <label
                      onDoubleClick={() => handleEditStart(todo)}
                      data-testid="todo-title"
                      style={{ display: editingId === todo.id ? 'none' : undefined }}
                    >
                      {todo.title}
                    </label>
                  )}
                  <button className="destroy" onClick={() => handleDelete(todo.id)} />
                </div>
                {editingId === todo.id && (
                  <input
                    className="edit"
                    role="textbox"
                    aria-label="Edit"
                    value={editValue}
                    onChange={handleEditChange}
                    onBlur={() => handleEditBlur(todo.id)}
                    onKeyDown={e => handleEditKeyDown(e, todo.id)}
                    autoFocus
                  />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      {todos.length > 0 && (
        <footer className="footer">
          <span className="todo-count" data-testid="todo-count">
            {activeCount} items left
          </span>
          <ul className="filters">
            {FILTERS.map((f) => (
              <li key={f}>
                <a
                  href="#/"
                  className={filter === f ? 'selected' : ''}
                  role="link"
                  aria-label={f}
                  onClick={() => setCurrentFilter(f)}
                >
                  {f}
                </a>
              </li>
            ))}
          </ul>
          {completedCount > 0 && (
            <button
              className="clear-completed"
              role="button"
              aria-label="Clear completed"
              onClick={handleClearCompleted}
            >
              Clear completed
            </button>
          )}
        </footer>
      )}
    </section>
  );
}
