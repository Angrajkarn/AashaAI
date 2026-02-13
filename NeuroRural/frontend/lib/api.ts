export const API_BASE = "http://localhost:8000";

export async function login(biometricId: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ biometric_id: biometricId }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function getPatients() {
  const res = await fetch(`${API_BASE}/api/patients/`);
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
}

export async function analyzeSymptoms(symptoms: string) {
  const res = await fetch(`${API_BASE}/api/triage/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms }),
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}
