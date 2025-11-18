import { useEffect, useMemo, useState } from "react";

const backendUrl =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000"; // fallback for local dev

const getMedal = (index) => {
  const medals = ["🥇", "🥈", "🥉"];
  return medals[index] || index + 1;
};

// Return trophy image path from /public/trophies for top 3 ranks
const getTrophyIconSrc = (index) => {
  if (index === 0) return "/trophies/Gold.png";
  if (index === 1) return "/trophies/Silver.png";
  if (index === 2) return "/trophies/Bronze.png";
  return null;
};

// Build FY month options (Apr–Mar) up to the current calendar month
const buildMonthOptions = (financialYear) => {
  if (!financialYear) return [];

  const [startYStr, endYStr] = financialYear.split("-").map((p) => p.trim());
  const startY = parseInt(startYStr, 10);
  const endY = parseInt(endYStr, 10);

  if (Number.isNaN(startY) || Number.isNaN(endY)) return [];

  const monthsInFY = [
    { m: 4, y: startY, label: "Apr" },
    { m: 5, y: startY, label: "May" },
    { m: 6, y: startY, label: "Jun" },
    { m: 7, y: startY, label: "Jul" },
    { m: 8, y: startY, label: "Aug" },
    { m: 9, y: startY, label: "Sep" },
    { m: 10, y: startY, label: "Oct" },
    { m: 11, y: startY, label: "Nov" },
    { m: 12, y: startY, label: "Dec" },
    { m: 1, y: endY, label: "Jan" },
    { m: 2, y: endY, label: "Feb" },
    { m: 3, y: endY, label: "Mar" },
  ];

  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;

  // Only show months up to the current month (no future months)
  return monthsInFY
    .filter(({ y, m }) => y < nowYear || (y === nowYear && m <= nowMonth))
    .map(({ y, m, label }) => ({
      value: `${y}-${String(m).padStart(2, "0")}`,
      label: `${label} ${y}`,
    }));
};

export default function Leaderboard() {
  const [fyRows, setFyRows] = useState([]);
  const [monthRows, setMonthRows] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("current"); // "current" or "YYYY-MM"
  const [monthOptions, setMonthOptions] = useState([]);

  // Rebuild month dropdown options when financialYear changes
  useEffect(() => {
    if (!financialYear) return;
    const opts = buildMonthOptions(financialYear);
    setMonthOptions(opts);
  }, [financialYear]);

  // Fetch leaderboard data whenever selected month changes
  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      setLoading(true);
      setErr("");

      try {
        let url = `${backendUrl}/api/leaderboard`;
        if (selectedMonth && selectedMonth !== "current") {
          const params = new URLSearchParams({ uptoMonth: selectedMonth });
          url += `?${params.toString()}`;
        }

        const res = await fetch(url, {
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
    return () => {
      ignore = true;
    };
  }, [selectedMonth]);

  const selectedMonthLabel = useMemo(() => {
    if (selectedMonth === "current") return "Current Month";

    const found = monthOptions.find((m) => m.value === selectedMonth);
    return found ? found.label : selectedMonth;
  }, [selectedMonth, monthOptions]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen px-4 py-6 bg-[linear-gradient(180deg,_#e0f2fe_0%,_#f5fbff_45%,_#e6fffa_100%)] [font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#0f172a] flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-9 h-9 rounded-full border-4 border-[#0ea5e9] border-t-transparent animate-spin duration-[800ms]" />
          <span className="text-sm text-[#475569]">Loading leaderboard…</span>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div
        className="min-h-screen px-4 py-6 bg-[linear-gradient(180deg,_#e0f2fe_0%,_#f5fbff_45%,_#e6fffa_100%)] [font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#0f172a] flex items-center justify-center"
      >
        <div className="max-w-[420px] px-[18px] py-[14px] rounded-[12px] bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-sm text-center shadow-[0_8px_20px_rgba(248,113,113,0.2)]">
          {err}
        </div>
      </div>
    );
  }

  const renderTable = (rows) => (
    <div className="rounded-[20px] border border-[#e2e8f0] bg-[rgba(255,255,255,0.96)] shadow-[0_18px_40px_rgba(148,163,184,0.25)] overflow-hidden">
      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead className="sticky top-0 bg-[#eff6ff] border-b border-[#dbeafe] z-[1]">
            <tr>
              <th className="px-2 py-[10px] font-semibold text-left text-[11px] tracking-[0.16em] uppercase text-[#64748b] w-[60px] text-center">
                Rank
              </th>
              <th className="px-2 py-[10px] font-semibold text-left text-[11px] tracking-[0.16em] uppercase text-[#64748b] pl-[18px]">
                Employee Name
              </th>
              <th className="px-2 py-[10px] font-semibold text-left text-[11px] tracking-[0.16em] uppercase text-[#64748b] w-[100px] text-right pr-[18px]">
                Points
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => {
              const trophySrc = getTrophyIconSrc(index);
              const displayScore =
                row.score != null && !Number.isNaN(Number(row.score))
                  ? Math.round(Number(row.score)) // ROUND TO NEAREST INTEGER
                  : 0;

              let rowClass =
                "border-b border-[#e5e7eb] transition-colors duration-150 hover:bg-[#eff6ff]";
              if (index % 2 === 1) rowClass += " bg-[#f8fafc]";
              if (index === 0) rowClass += " bg-[#fef3c7]";
              else if (index === 1) rowClass += " bg-[#e5e7eb]";
              else if (index === 2) rowClass += " bg-[#e0f2fe]";

              return (
                <tr
                  key={`${row.employee_id ?? "noid"}-${index}`}
                  className={rowClass}
                >
                  <td className="px-2 py-[10px] text-[13px] text-center font-semibold">
                    {getMedal(index)}
                  </td>
                  <td className="px-2 py-[10px] text-[13px] pl-[18px]">
                    <span
                      className={
                        index < 3
                          ? "text-[#0f172a] font-semibold"
                          : "text-[#475569]"
                      }
                    >
                      {row.employee_name}
                    </span>
                  </td>
                  <td className="px-2 py-[10px] text-[13px] pr-[18px] text-right font-semibold flex items-center justify-end gap-[6px]">
                    <span className="tabular-nums text-[#111827]">
                      {displayScore}
                    </span>
                    {trophySrc && (
                      <img
                        src={trophySrc}
                        alt="Trophy icon"
                        className="w-[18px] h-[18px]"
                      />
                    )}
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-7 text-center text-[13px] text-[#9ca3af]"
                >
                  No data available for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen px-4 py-6 bg-[linear-gradient(180deg,_#e0f2fe_0%,_#f5fbff_45%,_#e6fffa_100%)] [font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-[#0f172a]"
    >
      <div className="max-w-[1120px] mx-auto flex flex-col gap-5">
        {/* Top header card with logo and period info */}
        <header className="bg-[rgba(255,255,255,0.96)] border border-[#bae6fd] rounded-[24px] px-5 py-4 flex flex-col gap-4 shadow-[0_16px_40px_rgba(56,189,248,0.25)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-[14px]">
            <div>
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#020617] m-0">
                Leaderboard
              </h1>
              <p className="mt-[3px] mb-0 text-xs text-[#6b7280]">
                Performance overview for{" "}
                <span className="text-[#0f172a] font-medium">
                  FY {financialYear || "—"}
                </span>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] tracking-[0.18em] uppercase text-[#9ca3af]">
              SHOWING SCORES UP TO
            </span>
            <span className="px-3 py-[6px] rounded-full border border-[#bae6fd] bg-[#e0f2fe] text-xs font-medium text-[#0f172a]">
              {selectedMonthLabel}
            </span>
          </div>
        </header>

        {/* Controls strip: live data, top-3, month selector */}
        <section className="bg-[rgba(255,255,255,0.9)] border border-[#bae6fd] rounded-[22px] px-4 py-[10px] flex flex-col gap-[10px] shadow-[0_8px_24px_rgba(56,189,248,0.25)] md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-[6px] px-3 py-[6px] rounded-full border border-[#a7f3d0] bg-[#ecfdf5] text-[11px] text-[#334155] font-medium">
              <span className="w-[9px] h-[9px] rounded-full bg-[#22c55e] shadow-[0_0_0_3px_rgba(34,197,94,0.25)]" />
              <span>Live data</span>
            </span>
            <span className="inline-flex items-center gap-[6px] px-3 py-[6px] rounded-full border border-[#fed7aa] bg-[#fffbeb] text-[11px] text-[#334155] font-medium">
              <span className="w-[9px] h-[9px] rounded-full bg-[#f59e0b] shadow-[0_0_0_3px_rgba(245,158,11,0.25)]" />
              <span>Top 3 highlighted</span>
            </span>
          </div>

          {/* Month dropdown */}
          <div className="flex items-center gap-[10px]">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#9ca3af]">
              Month
            </span>
            <div className="relative inline-block">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none rounded-full border border-[#bae6fd] bg-[#e0f2fe] text-[#0f172a] text-xs py-[6px] pl-3 pr-6 outline-none focus:border-[#0ea5e9] focus:shadow-[0_0_0_2px_rgba(14,165,233,0.35)]"
              >
                <option value="current">Current Month</option>
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#64748b]">
                ▼
              </span>
            </div>
          </div>
        </section>

        {/* Main content: mobile stacked (YTD first), desktop side-by-side */}
        <div className="flex flex-col gap-6 [@media(min-width:900px)]:flex-row">
          {/* YTD / FY Section (always first on mobile) */}
          <section className="flex-1 flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-[#020617] m-0">
                Year-to-Date Leaderboard (FY)
              </h2>
              <span className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af]">
                Cumulative points
              </span>
            </div>
            {renderTable(fyRows)}
          </section>

          {/* MTD Section */}
          <section className="flex-1 flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-[#020617] m-0">
                Month-to-Date Leaderboard
              </h2>
              <span className="text-[11px] uppercase tracking-[0.12em] text-[#9ca3af]">
                Selected month
              </span>
            </div>
            {renderTable(monthRows)}
          </section>
        </div>
      </div>
    </div>
  );
}