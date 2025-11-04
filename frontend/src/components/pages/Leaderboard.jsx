import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import trophyIcon from '../../assets/leaderboardicon/trophy_48.png';


const backendUrl = process.env.REACT_APP_API_BASE_URL; // same env var your app uses

const getMedal = (index) => {
  const medals = ["🥇", "🥈", "🥉"];
  return medals[index] || index + 1;
};

export default function Leaderboard() {
  const { userData } = useSelector((s) => s.user);
  const [fyRows, setFyRows] = useState([]);
  const [monthRows, setMonthRows] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [financialYear, setFinancialYear] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${backendUrl}/api/leaderboard`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!ignore) {
          setFinancialYear(data.financialYear || "");
          setFyRows(Array.isArray(data.fyData) ? data.fyData : []);
          setMonthRows(Array.isArray(data.monthlyData) ? data.monthlyData : []);
        }
      } catch (e) {
        if (!ignore) setErr("Failed to load leaderboard.");
        console.error("Leaderboard fetch error:", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();
    return () => { ignore = true; };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-700">
        Loading...
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-600">
        {err}
      </div>
    );
  }

  const renderTable = (rows) => (
    <div className="overflow-hidden rounded-xl">
     <div className="max-h-[420px] overflow-y-auto scroll-smooth">
        <table className="w-full text-white text-center border-collapse table-fixed">
          <thead className="sticky top-0 bg-blue-900 text-white text-base md:text-lg z-10">
            <tr>
              <th className="py-3 w-16">#</th>
              <th className="py-3">Employee Name</th>
              <th className="py-3 w-1/4">Points</th>
            </tr>
          </thead>

              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.employee_id}-${index}`}
                    className={`${index % 2 === 0 ? "bg-blue-900/50" : "bg-blue-800/50"
                      } border-b border-blue-700`}
                  >
                    <td className="py-4 text-2xl md:text-3xl font-bold w-16">
                      {getMedal(index)}
                    </td>
                    <td className="py-4 px-2">{row.employee_name}</td>
                    <td className="py-4 px-2 font-bold flex items-center justify-center gap-2">
                      <span>{row.score}</span>
                      {index === 0 && (
                        <img
                          src={trophyIcon}
                          alt="Trophy icon"
                          className="w-5 md:w-6 inline"
                        />
                      )}
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-10 text-cyan-200">
                      No data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] px-4 py-10 flex items-start justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div
        className="
        relative w-full max-w-6xl p-6 md:p-8 rounded-3xl border
        border-cyan-400/60 bg-black/30 backdrop-blur-lg
        shadow-[0_0_40px_rgba(34,211,238,0.35)]
      "
      >
        {/* Title badge */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-wider px-6 py-1 rounded-full border-2 border-cyan-400 text-cyan-100 bg-[#0b1835]">
            LEADERBOARD
          </h2>
        </div>

        {/* Financial Year Section */}
        <div className="mt-8 flex flex-col md:flex-row gap-10 justify-between items-start">
         <div className="flex-1 w-full">
          <p className="text-center text-cyan-300 mb-2 text-base md:text-lg font-semibold">
            Scores based on Financial Year {financialYear && `(${financialYear})`}
          </p>
          {renderTable(fyRows)}
        </div>

        {/* Current Month Section */}
        <div className="flex-1 w-full">
          <p className="text-center text-cyan-300 mb-2 text-base md:text-lg font-semibold">
            Scores of Current Month
          </p>
          {renderTable(monthRows)}
        </div>
        </div>
      </div>
    </div>
  );
}
