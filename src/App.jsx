import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import styles from "./styles/App.module.css";
import TodoList from "./components/TodoList";

const queryClient = new QueryClient();

export default function App() {
  return (
    <div className={styles.appBg}>
      <div className={styles.centerPanel}>
        <QueryClientProvider client={queryClient}>
          <h1 className={styles.title}>Elden Ring Todo List</h1>
          <TodoList />
        </QueryClientProvider>
      </div>
    </div>
  );
}