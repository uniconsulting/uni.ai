const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const API_KEY = process.env.ELEVENLABS_API_KEY;

export async function streamSpeech(text: string): Promise<ReadableStream<Uint8Array>> {
  if (!VOICE_ID || !API_KEY) {
    throw new Error("ElevenLabs credentials are not configured");
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs error ${response.status}: ${err}`);
  }

  return response.body!;
}
