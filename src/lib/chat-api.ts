const PROXY = process.env.NEXT_PUBLIC_PROXY_URL ?? "";
const KEY = process.env.NEXT_PUBLIC_PROXY_KEY ?? "";

type Role = "user" | "assistant";
export type HistoryItem = { role: Role; content: string };

export async function fetchReply(
  message: string,
  niche: string,
  mode: "sales" | "support" | "kb",
  history: HistoryItem[],
): Promise<string> {
  const res = await fetch(`${PROXY}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Key": KEY,
    },
    body: JSON.stringify({ message, niche, mode, history: history.slice(-10) }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.reply as string;
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", blob, "voice.webm");

  const res = await fetch(`${PROXY}/api/transcribe`, {
    method: "POST",
    headers: { "X-Internal-Key": KEY },
    body: formData,
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) throw new Error(`Transcribe error: ${res.status}`);
  const data = await res.json();
  return (data.text as string) ?? "";
}

export async function fetchSpeechBlob(text: string): Promise<Blob> {
  const res = await fetch(`${PROXY}/api/speak`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Key": KEY,
    },
    body: JSON.stringify({ text: text.slice(0, 500) }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) throw new Error(`Speak error: ${res.status}`);
  return res.blob();
}
