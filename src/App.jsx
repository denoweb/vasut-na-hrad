import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    </div>
  );
}

export default App;