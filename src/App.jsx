import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";

function App() {
  const [count, setCount] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

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
      <div className="main-col">
        <div className="card">
          {error ? (
            <p className="error">{error}</p>
          ) : count === null ? (
            <p className="loading">Načítám&hellip;</p>
          ) : (
            <>
              <span className="count">{count.toLocaleString("cs-CZ")}</span>
              <p className="label">návštěv</p>
            </>
          )}
        </div>
        {/* kontaktní formulář — zatím skrytý
        <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault();
            const email = import.meta.env.VITE_CONTACT_EMAIL;
            window.location.href = `mailto:${email}?subject=Zpráva z vasutnahrad.cz&body=${encodeURIComponent(message)}`;
          }}
        >
          <textarea
            className="contact-textarea"
            placeholder="Napište zprávu…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <button type="submit" className="contact-btn" disabled={!message.trim()}>
            Odeslat
          </button>
        </form>
        */}
      </div>
      <Link to="/stats" className="stats-link">Statistiky</Link>
    </div>
  );
}

export default App;