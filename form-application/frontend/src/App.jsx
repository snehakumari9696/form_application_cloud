import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function App() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  async function loadSubmissions() {
    try {
      const response = await fetch(`${API_BASE}/api/submissions`);
      if (!response.ok) return;
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch {
      // Backend/database may not be configured yet.
    }
  }

  useEffect(() => { loadSubmissions(); }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!file) {
      setStatus({ type: "error", message: "Please choose a file." });
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("age", age);
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/submissions`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Submission failed.");

      setStatus({ type: "success", message: data.message });
      setName("");
      setAge("");
      setFile(null);
      event.target.reset();
      await loadSubmissions();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not reach the backend." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="eyebrow"><span className="dot" /> FULL-STACK • AWS CLOUD STORAGE</div>
        <h1>Submit your <span>details.</span></h1>
        <p className="subtitle">Your file is stored securely in Amazon S3, while your form details and file reference are saved in Amazon RDS.</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div><p className="step">FORM SUBMISSION</p><h2>Your information</h2></div>
          <span className="lock">Private upload</span>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sneha Sharma" maxLength="100" required />

          <label htmlFor="age">Age</label>
          <input id="age" type="number" min="1" max="120" step="1" value={age}
            onChange={(e) => setAge(e.target.value)} placeholder="Enter your age" required />

          <label htmlFor="file">Upload a file</label>
          <label className="file-drop" htmlFor="file">
            <span className="upload-icon">↑</span>
            <strong>{file ? file.name : "Choose a file to upload"}</strong>
            <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "PDF, JPG, PNG, WEBP or TXT • Up to 5 MB"}</span>
            <input id="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)} required />
          </label>

          {status.message && <div className={`notice ${status.type}`} role="status">{status.message}</div>}
          <button disabled={loading}>{loading ? "Submitting…" : "Submit form"} <span>→</span></button>
          <p className="privacy">Your browser sends the file to your backend. AWS credentials are never exposed in the frontend.</p>
        </form>
      </section>

      <section className="records">
        <div className="records-title"><div><p className="step">DATABASE</p><h2>Recent submissions</h2></div><span>{submissions.length} shown</span></div>
        {submissions.length === 0 ? (
          <p className="empty">No submissions to display yet. Configure AWS and submit your first form.</p>
        ) : (
          <div className="table-wrap"><table><thead><tr><th>Name</th><th>Age</th><th>File</th><th>Submitted</th></tr></thead>
            <tbody>{submissions.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.age}</td>
              <td>{item.originalFilename}</td><td>{new Date(item.createdAt).toLocaleString()}</td></tr>)}</tbody>
          </table></div>
        )}
      </section>
      <footer>Built with React, Node.js, Amazon S3 &amp; Amazon RDS</footer>
    </main>
  );
}
