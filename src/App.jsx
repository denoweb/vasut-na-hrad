import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";

function App() {
  const [count, setCount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Pokud je v URL ?skip=1, nastav cookie a přesměruj
    if (new URLSearchParams(window.location.search).get("skip") === "1") {
      document.cookie = "skip_count=1; max-age=31536000; path=/; SameSite=Strict";
      window.history.replaceState({}, "", "/");
    }

    fetch("/api/visits")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setCount(data.count))
      .catch(() => setError("Nepodařilo se načíst počet návštěv."));
  }, []);

  return (
    <div className="page">
<div className="card">
        {error ? (
          <p className="error">{error}</p>
        ) : count === null ? (
          <p className="loading">Načítám&hellip;</p>
        ) : (
          <>
            <span className="count">{count.toLocaleString("cs-CZ")}</span>
            <p className="label">celkových návštěv</p>
          </>
        )}
      </div>
      <Link to="/stats" className="stats-link">Statistiky</Link>
    </div>
  );
}

export default App;