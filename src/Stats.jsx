import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Stats.css";

function Stats() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Nepodařilo se načíst statistiky."));
  }, []);

  return (
    <div className="page">
      <div className="stats-header">
        <h1>Statistiky návštěv</h1>
        <Link to="/" className="back-link">← Zpět</Link>
      </div>

      {error ? (
        <p className="error">{error}</p>
      ) : !data ? (
        <p className="loading">Načítám&hellip;</p>
      ) : (
        <>
          <p className="stats-total">Celkem návštěv: <strong>{data.total.toLocaleString("cs-CZ")}</strong></p>
          {data.rows.length === 0 ? (
            <p className="loading">Zatím žádné záznamy.</p>
          ) : (
            <table className="stats-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>IP adresa</th>
                  <th>Počet návštěv</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr key={row.ip}>
                    <td>{i + 1}</td>
                    <td>{row.ip}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default Stats;
