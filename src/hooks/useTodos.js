import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import axios from "axios";

const TODOS_URL = "https://dummyjson.com/todos";

export function useTodos() {
  const queryClient = useQueryClient();
  const [mutatingId, setMutatingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);
  const [totalTodos, setTotalTodos] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const skip = (currentPage - 1) * limitPerPage;

  const { data, isLoading, error } = useQuery({
    queryKey: ["todos", { limit: limitPerPage, skip }],
    queryFn: async () => {
      const res = await axios.get(`${TODOS_URL}?limit=${limitPerPage}&skip=${skip}`);
      setTotalTodos(res.data.total ?? 0);
      return res.data.todos;
    },
    placeholderData: (prev) => prev,
  });

  const filteredTodos = useMemo(() => {
    const list = data || [];
    if (!searchTerm.trim()) return list;
    const q = searchTerm.trim().toLowerCase();
    return list.filter((t) => (t.todo || t.task || "").toLowerCase().includes(q));
  }, [data, searchTerm]);

  const addTodo = useCallback((text) => {
    const pageKey = ["todos", { limit: limitPerPage, skip }];
    const newTodo = {
      id: Date.now(),
      todo: text,
      completed: false,
      userId: 1,
      isLocal: true,
    };
    queryClient.setQueryData(pageKey, (old = []) => {
      const updated = [newTodo, ...old];
      return updated.slice(0, limitPerPage);
    });
    setTotalTodos((t) => (typeof t === "number" ? t + 1 : 1));
  }, [limitPerPage, skip, queryClient]);

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }) => axios.put(`${TODOS_URL}/${id}`, { completed }),
    onMutate: async ({ id }) => {
      setMutatingId(id);
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const prevTodos = queryClient.getQueryData(["todos", { limit: limitPerPage, skip }]);
      queryClient.setQueryData(["todos", { limit: limitPerPage, skip }], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
      return { prevTodos };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["todos", { limit: limitPerPage, skip }], context.prevTodos);
    },
    onSettled: () => {
      setMutatingId(null);
    },
  });

  const toggleTodo = useCallback((id) => {
    const pageKey = ["todos", { limit: limitPerPage, skip }];
    const current = queryClient.getQueryData(pageKey) || [];
    const todo = current.find((t) => t.id === id);
    if (!todo) return;
    if (todo.isLocal) {
      queryClient.setQueryData(pageKey, (old = []) =>
        old.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
      return;
    }
    setMutatingId(id);
    toggleMutation.mutate({ id, completed: !todo.completed });
  }, [limitPerPage, skip, queryClient, toggleMutation]);

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`${TODOS_URL}/${id}`),
    onMutate: async (id) => {
      setMutatingId(id);
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const prevTodos = queryClient.getQueryData(["todos", { limit: limitPerPage, skip }]);
      queryClient.setQueryData(["todos", { limit: limitPerPage, skip }], (old = []) =>
        old.filter((t) => t.id !== id)
      );
      return { prevTodos };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["todos", { limit: limitPerPage, skip }], context.prevTodos);
    },
    onSettled: () => {
      setMutatingId(null);
    },
  });

  const deleteTodo = useCallback((id) => {
    const pageKey = ["todos", { limit: limitPerPage, skip }];
    const current = queryClient.getQueryData(pageKey) || [];
    const todo = current.find((t) => t.id === id);
    if (!todo) return;
    if (todo.isLocal) {
      queryClient.setQueryData(pageKey, (old = []) => old.filter((t) => t.id !== id));
      return;
    }
    setMutatingId(id);
    deleteMutation.mutate(id);
  }, [limitPerPage, skip, queryClient, deleteMutation]);

  const editMutation = useMutation({
    mutationFn: ({ id, newTitle }) => axios.put(`${TODOS_URL}/${id}`, { todo: newTitle }),
    onMutate: async ({ id, newTitle }) => {
      setMutatingId(id);
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const prevTodos = queryClient.getQueryData(["todos", { limit: limitPerPage, skip }]);
      queryClient.setQueryData(["todos", { limit: limitPerPage, skip }], (old = []) =>
        old.map((t) => (t.id === id ? { ...t, todo: newTitle } : t))
      );
      return { prevTodos };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["todos", { limit: limitPerPage, skip }], context.prevTodos);
    },
    onSettled: () => {
      setMutatingId(null);
    },
  });

  const editTodoTitle = useCallback((id, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;
    const trimmed = newTitle.trim();
    const pageKey = ["todos", { limit: limitPerPage, skip }];
    const current = queryClient.getQueryData(pageKey) || [];
    const todo = current.find((t) => t.id === id);
    if (!todo) return;
    if (todo.isLocal) {
      queryClient.setQueryData(pageKey, (old = []) =>
        old.map((t) => (t.id === id ? { ...t, todo: trimmed } : t))
      );
      return;
    }
    editMutation.mutate({ id, newTitle: trimmed });
  }, [limitPerPage, skip, queryClient, editMutation]);

  const goToNextPage = useCallback(() => {
    const nextSkip = currentPage * limitPerPage;
    const hasMore = nextSkip < totalTodos;
    if (hasMore) setCurrentPage((p) => p + 1);
  }, [currentPage, limitPerPage, totalTodos]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  }, [currentPage]);

  const setLimit = useCallback((limit) => {
    const parsed = Number(limit) || 10;
    setLimitPerPage(parsed);
    setCurrentPage(1);
  }, []);

  return {
    todos: filteredTodos,
    isLoading,
    error: error ? error.message : null,
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
  };
}
