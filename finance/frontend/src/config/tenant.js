const DEFAULT_TENANT = "sl";

function normalizeTenant(raw) {
  const v = String(raw || "").toLowerCase().trim();
  if (v === "ny" || v === "newyork" || v === "new_york") return "ny";
  return "sl";
}

export function getTenant() {
  // Allows switching without a rebuild: `/?tenant=ny` (or `sl`)
  if (typeof window !== "undefined") {
    const qp = new URLSearchParams(window.location.search).get("tenant");
    if (qp) return normalizeTenant(qp);
  }

  return normalizeTenant(process.env.REACT_APP_TENANT || DEFAULT_TENANT);
}

export function getCampusConfig() {
  const tenant = getTenant();

  if (tenant === "ny") {
    return {
      campusName: "SLIIT New York Campus",
      currencyCode: "USD",
    };
  }

  return {
    campusName: "Sri Lanka Institute of Information Technology (SLIIT)",
    currencyCode: "LKR",
  };
}

