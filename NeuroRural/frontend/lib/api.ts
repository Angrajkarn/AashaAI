// In production behind an ALB, we use relative paths. On localhost, we use the explicit port.
export const API_BASE = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || "")
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

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

export async function getPatientDetails(patientId: string | number) {
  const res = await fetch(`${API_BASE}/api/patients/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch details for patient ${patientId}`);
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

export async function analyzeMultimodal(symptoms: string, imageBlob?: Blob | null, age: number = 30) {
  // If no image is provided, fallback to the lightweight endpoint
  if (!imageBlob) {
    return analyzeSymptoms(symptoms);
  }

  const formData = new FormData();
  formData.append("symptoms", symptoms);
  formData.append("age", age.toString());
  formData.append("image", imageBlob, "captured_condition.jpg");

  const res = await fetch(`${API_BASE}/api/triage/multimodal`, {
    method: "POST",
    // Do NOT set Content-Type header manually when using FormData
    body: formData,
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Multimodal Analysis failed: ${res.status} ${errorText}`);
  }
  
  return res.json();
}

export async function askMentor(question: string, context?: string) {
  const res = await fetch(`${API_BASE}/api/triage/mentor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, context }),
  });
  if (!res.ok) throw new Error("Mentor request failed");
  return res.json();
}
export async function digitize(imageBlob: Blob) {
  const formData = new FormData();
  formData.append("image", imageBlob, "prescription.jpg");
  const res = await fetch(`${API_BASE}/api/triage/digitize`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Digitization request failed");
  return res.json();
}

export async function transcribeAudio(audioBlob: Blob) {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  const res = await fetch(`${API_BASE}/api/triage/voice`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Voice transcription failed");
  return res.json();
}

export async function getInventoryStatus() {
  const res = await fetch(`${API_BASE}/api/inventory/status`);
  if (!res.ok) throw new Error("Failed to fetch inventory");
  return res.json();
}

export async function triggerReorder(itemId: number) {
  const res = await fetch(`${API_BASE}/api/inventory/reorder/${itemId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Reorder failed");
  return res.json();
}

export async function getHotspots() {
  const res = await fetch(`${API_BASE}/api/analytics/hotspots`);
  if (!res.ok) throw new Error("Failed to fetch hotspots");
  return res.json();
}

export async function getAnalyticsAlerts() {
  const res = await fetch(`${API_BASE}/api/analytics/alerts`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function generatePatientReport(patientId: string | number) {
  const res = await fetch(`${API_BASE}/api/patients/${patientId}/report`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to generate report");
  return res.json();
}
