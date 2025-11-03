import { memo, useState, useCallback } from "react";
import styles from "../styles/AddTodoForm.module.css";

const AddTodoForm = memo(function AddTodoForm({ onAddTodo }) {
  const [input, setInput] = useState("");

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (input.trim()) {
      onAddTodo(input.trim());
      setInput("");
    }
  }, [input, onAddTodo]);

  const handleChange = useCallback((e) => setInput(e.target.value), []);

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        value={input}
        onChange={handleChange}
        placeholder="Add a new task..."
        autoFocus
      />
      <button className={styles.button} type="submit" aria-label="Add">
        +
      </button>
    </form>
  );
});

export default AddTodoForm;
