import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [formStatus, setFormStatus] = useState(null); // null | "sending" | "success" | "error"

  useEffect(() => {
    // Pokud je v URL ?skip=1, nastav cookie a přesměruj
    if (new URLSearchParams(window.location.search).get("skip") === "1") {
      document.cookie = "skip_count=1; max-age=31536000; path=/; SameSite=Strict";
      window.history.replaceState({}, "", "/");
    }

    // Zavolej počítadlo kvůli započtení návštěvy (výsledek se nezobrazuje)
    fetch("/api/visits").catch(() => {});
  }, []);

  return (
    <div className="page">
      <div className="main-col">
        <div className="card"></div>
        <form
          className="contact-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setFormStatus("sending");
            try {
              const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  access_key: "f236c74c-7c67-432d-8bd7-7eb3c2bb3e4f",
                  subject: "Zpráva z vasutnahrad.cz",
                  message,
                }),
              });
              const data = await res.json();
              if (data.success) {
                setFormStatus("success");
                setMessage("");
              } else {
                setFormStatus("error");
              }
            } catch {
              setFormStatus("error");
            }
          }}
        >
          <textarea
            className="contact-textarea"
            placeholder="Napište zprávu…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <button type="submit" className="contact-btn" disabled={!message.trim() || formStatus === "sending"}>
            {formStatus === "sending" ? "Odesílám…" : "Odeslat"}
          </button>
          {formStatus === "success" && <p className="form-success">Zpráva odeslána, díky!</p>}
          {formStatus === "error" && <p className="form-error">Nepodařilo se odeslat zprávu.</p>}
        </form>
      </div>
      <Link to="/stats" className="stats-link">Statistiky</Link>
    </div>
  );
}

export default App;