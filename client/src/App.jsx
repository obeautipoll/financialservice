import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  createEmigrant,
  deleteEmigrant,
  getEmigrants,
  updateEmigrant
} from "./services/emigrantsService";

const formDefaults = {
  year: "",
  single: "",
  married: "",
  widower: "",
  separated: "",
  divorced: "",
  notReported: ""
};

const statusKeys = [
  "single",
  "married",
  "widower",
  "separated",
  "divorced",
  "notReported"
];

const chartColors = [
  "#0f766e",
  "#e76f51",
  "#264653",
  "#e9c46a",
  "#2a9d8f",
  "#8d99ae"
];

const labelMap = {
  single: "Single",
  married: "Married",
  widower: "Widower",
  separated: "Separated",
  divorced: "Divorced",
  notReported: "Not Reported"
};

function App() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(formDefaults);
  const [editingId, setEditingId] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");
      const items = await getEmigrants();
      setRecords(items);
    } catch (err) {
      setError(err.message || "Failed to load Supabase records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    if (yearFilter === "all") {
      return records;
    }

    return records.filter((record) => String(record.year) === yearFilter);
  }, [records, yearFilter]);

  const totalsByStatus = useMemo(() => {
    return statusKeys.map((key) => ({
      name: labelMap[key],
      value: filteredRecords.reduce((sum, item) => sum + Number(item[key] || 0), 0)
    }));
  }, [filteredRecords]);

  const totalsByYear = useMemo(() => {
    return filteredRecords.map((record) => ({
      ...record,
      total: statusKeys.reduce((sum, key) => sum + Number(record[key] || 0), 0)
    }));
  }, [filteredRecords]);

  const relationshipData = useMemo(() => {
    return filteredRecords.map((record) => ({
      year: record.year,
      single: record.single,
      married: record.married,
      total: statusKeys.reduce((sum, key) => sum + Number(record[key] || 0), 0)
    }));
  }, [filteredRecords]);

  const distributionData = useMemo(() => {
    return filteredRecords.flatMap((record) =>
      statusKeys.map((key) => ({
        year: record.year,
        category: labelMap[key],
        value: record[key]
      }))
    );
  }, [filteredRecords]);

  const geographicPlaceholder = useMemo(() => {
    return [
      { region: "North America", value: totalsByStatus[1]?.value || 0 },
      { region: "Asia", value: totalsByStatus[0]?.value || 0 },
      { region: "Europe", value: totalsByStatus[2]?.value || 0 },
      { region: "Oceania", value: totalsByStatus[3]?.value || 0 }
    ];
  }, [totalsByStatus]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(formDefaults);
    setEditingId("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await updateEmigrant(editingId, form);
      } else {
        await createEmigrant(form);
      }

      resetForm();
      await loadRecords();
    } catch (err) {
      setError(err.message || "Save failed.");
    }
  };

  const startEdit = (record) => {
    setEditingId(record.id);
    setForm({
      year: record.year,
      single: record.single,
      married: record.married,
      widower: record.widower,
      separated: record.separated,
      divorced: record.divorced,
      notReported: record.notReported
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteEmigrant(id);
      await loadRecords();
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  };

  return (
    <div className="page-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">ITD112 Data Visualization Techniques</p>
          <h1>Filipino Emigrants Dashboard</h1>
          <p className="hero-copy">
            Supabase-backed CRUD, multiple visualization types, and deployment-ready
            setup for GitHub and Vercel.
          </p>
        </div>
        <div className="hero-card">
          <span>Records</span>
          <strong>{records.length}</strong>
          <small>Supabase table: emigrants</small>
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="panel panel-form">
          <div className="panel-header">
            <h2>{editingId ? "Update Record" : "Add Record"}</h2>
            <button type="button" className="secondary-button" onClick={resetForm}>
              Clear
            </button>
          </div>

          <form className="form-grid" onSubmit={handleSubmit}>
            {Object.keys(formDefaults).map((field) => (
              <label key={field}>
                <span>{labelMap[field] || "Year"}</span>
                <input
                  min="0"
                  name={field}
                  onChange={handleChange}
                  required
                  type="number"
                  value={form[field]}
                />
              </label>
            ))}
            <button className="primary-button" type="submit">
              {editingId ? "Save Changes" : "Add to Supabase"}
            </button>
          </form>
          {error ? <p className="feedback error">{error}</p> : null}
          {loading ? <p className="feedback">Loading Supabase data...</p> : null}
        </section>

        <section className="panel panel-table">
          <div className="panel-header">
            <h2>Dataset Records</h2>
            <select
              aria-label="Filter by year"
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
            >
              <option value="all">All Years</option>
              {records.map((record) => (
                <option key={record.id} value={record.year}>
                  {record.year}
                </option>
              ))}
            </select>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Single</th>
                  <th>Married</th>
                  <th>Widower</th>
                  <th>Separated</th>
                  <th>Divorced</th>
                  <th>Not Reported</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.year}</td>
                    <td>{record.single}</td>
                    <td>{record.married}</td>
                    <td>{record.widower}</td>
                    <td>{record.separated}</td>
                    <td>{record.divorced}</td>
                    <td>{record.notReported}</td>
                    <td className="action-cell">
                      <button type="button" onClick={() => startEdit(record)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(record.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!filteredRecords.length && !loading ? (
                  <tr>
                    <td colSpan="8">No records found. Add data or adjust the filter.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel chart-panel">
          <div className="panel-header">
            <h2>Comparison: Status Totals</h2>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={totalsByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {totalsByStatus.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="panel chart-panel">
          <div className="panel-header">
            <h2>Composition: Civil Status Share</h2>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={totalsByStatus} cx="50%" cy="50%" dataKey="value" label outerRadius={110}>
                {totalsByStatus.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </section>

        <section className="panel chart-panel">
          <div className="panel-header">
            <h2>Trend: Yearly Totals</h2>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={totalsByYear}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="single" fill="#2a9d8f" />
              <Line dataKey="total" stroke="#e76f51" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </section>

        <section className="panel chart-panel">
          <div className="panel-header">
            <h2>Distribution: All Status Values</h2>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="year" name="Year" />
              <YAxis type="number" dataKey="value" name="Value" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={distributionData} fill="#264653" />
            </ScatterChart>
          </ResponsiveContainer>
        </section>

        <section className="panel chart-panel">
          <div className="panel-header">
            <h2>Relationship: Single vs Married</h2>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="single" name="Single" />
              <YAxis type="number" dataKey="married" name="Married" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={relationshipData} fill="#e9c46a" />
            </ScatterChart>
          </ResponsiveContainer>
        </section>

        <section className="panel chart-panel">
          <div className="panel-header">
            <h2>Geographic Representation Placeholder</h2>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart layout="vertical" data={geographicPlaceholder}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="region" width={100} />
              <Tooltip />
              <Bar dataKey="value" fill="#0f766e" radius={[0, 10, 10, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="chart-note">
            Replace this placeholder with an actual destination-country or regional
            dataset when you reach the geographic mapping requirement.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
