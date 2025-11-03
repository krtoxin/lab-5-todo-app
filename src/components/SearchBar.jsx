import { memo } from "react";
import styles from "../styles/TodoList.module.css";

const SearchBar = memo(function SearchBar({ value, onChange }) {
  return (
    <div className={styles.topbar}>
      <input
        className={styles.search}
        placeholder="Search todos..."
        value={value}
        onChange={onChange}
        aria-label="Search todos"
      />
    </div>
  );
});

export default SearchBar;
