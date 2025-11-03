import { useCallback, useMemo } from "react";
import AddTodoForm from "./AddTodoForm";
import TodoItem from "./TodoItem";
import SearchBar from "./SearchBar";
import styles from "../styles/TodoList.module.css";
import { useTodos } from "../hooks/useTodos";

export default function TodoList() {
  const {
    todos,
    isLoading,
    error,
    addTodo,
    toggleTodo,
    deleteTodo,
    mutatingId,
    searchTerm,
    setSearchTerm,
    currentPage,
    limitPerPage,
    totalTodos,
    goToNextPage,
    goToPrevPage,
    setLimit,
    editTodoTitle,
  } = useTodos();

  const totalPages = Math.max(1, Math.ceil((totalTodos || 0) / (limitPerPage || 1)));

  const handleSearchChange = useCallback((e) => setSearchTerm(e.target.value), [setSearchTerm]);

  const handleLimitChange = useCallback((e) => setLimit(e.target.value), [setLimit]);

  const todoItems = useMemo(() => {
    return todos.map((todo) => ({
      id: todo.id,
      task: todo.todo || todo.task,
      completed: todo.completed,
      loading: mutatingId === todo.id,
    }));
  }, [todos, mutatingId]);

  return (
    <div className={styles.wrapper}>
      <AddTodoForm onAddTodo={addTodo} />
      <SearchBar value={searchTerm} onChange={handleSearchChange} />
      {isLoading && (
        <div className={styles.empty}>
          <span className={styles.emptyText}>Loading...</span>
        </div>
      )}
      {error && (
        <div className={styles.empty}>
          <span className={styles.emptyText}>{error}</span>
        </div>
      )}
      {todos.length === 0 && !isLoading ? (
        <div className={styles.empty}>
          <span className={styles.emptyText}>No tasks yet. May grace guide you...</span>
        </div>
      ) : (
        <ul className={styles.list}>
          {todoItems.map((item) => (
            <TodoItem
              key={item.id}
              task={item.task}
              completed={item.completed}
              onToggle={() => toggleTodo(item.id)}
              onDelete={() => deleteTodo(item.id)}
              loading={item.loading}
              onEdit={(newTitle) => editTodoTitle(item.id, newTitle)}
            />
          ))}
        </ul>
      )}
      <div className={styles.footer}>
        <div className={styles.metrics}>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <span className={styles.metricsDivider}>|</span>
          <span>{totalTodos} items</span>
        </div>
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={goToPrevPage}
            disabled={currentPage <= 1 || isLoading}
          >
            Previous
          </button>
          <button
            className={styles.pageBtn}
            onClick={goToNextPage}
            disabled={isLoading || currentPage >= totalPages}
          >
            Next
          </button>
          <label className={styles.limitLabel}>
            Per page
            <select
              className={styles.limitSelect}
              value={limitPerPage}
              onChange={handleLimitChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
