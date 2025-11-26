
export function getPriorityLabel(priority) {
  const map = {
    1: "Highest",
    2: "High",
    3: "Medium",
    4: "Low",
    5: "Lowest"
  };

  if (!priority) return "-";

  return map[priority] || "-";
}

