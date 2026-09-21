/**
 * Audio hooks for the journey.
 *
 * Audio is OFF by default and no sound files ship with the project, so this is
 * inert until someone drops files into `public/audio` and calls `enableAudio()`
 * from a user gesture. Everything degrades to a no-op when a file is missing or
 * the browser blocks the AudioContext — nothing here can break the experience.
 *
 * Expected files (all optional):
 *   public/audio/engine-loop.mp3  — a seamless idle loop, pitched by speed
 *   public/audio/arrive.mp3       — one-shot when a mission destination is reached
 */

export type OneShot = "arrive";

const SOURCES: Record<"engine" | OneShot, string> = {
  engine: "/audio/engine-loop.mp3",
  arrive: "/audio/arrive.mp3",
};

interface AudioState {
  enabled: boolean;
  context: AudioContext | null;
  master: GainNode | null;
  engineSource: AudioBufferSourceNode | null;
  engineGain: GainNode | null;
  buffers: Map<string, AudioBuffer | null>;
}

const state: AudioState = {
  enabled: false,
  context: null,
  master: null,
  engineSource: null,
  engineGain: null,
  buffers: new Map(),
};

export const isAudioEnabled = (): boolean => state.enabled;

/** Fetch and decode a clip. Resolves to null when the file is not published. */
async function load(url: string): Promise<AudioBuffer | null> {
  if (state.buffers.has(url)) return state.buffers.get(url) ?? null;
  const context = state.context;
  if (!context) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(String(response.status));
    const buffer = await context.decodeAudioData(await response.arrayBuffer());
    state.buffers.set(url, buffer);
    return buffer;
  } catch {
    // Cache the miss so a missing file is only requested once.
    state.buffers.set(url, null);
    return null;
  }
}

/**
 * Must be called from a user gesture — browsers will not start an AudioContext
 * otherwise. Safe to call more than once.
 */
export async function enableAudio(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (state.enabled) return true;

  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return false;

    const context = new Ctor();
    await context.resume();

    const master = context.createGain();
    master.gain.value = 0.35;
    master.connect(context.destination);

    state.context = context;
    state.master = master;
    state.enabled = true;
  } catch {
    return false;
  }

  const engine = await load(SOURCES.engine);
  if (engine && state.context && state.master) {
    const gain = state.context.createGain();
    gain.gain.value = 0;
    gain.connect(state.master);

    const source = state.context.createBufferSource();
    source.buffer = engine;
    source.loop = true;
    source.connect(gain);
    source.start();

    state.engineSource = source;
    state.engineGain = gain;
  }

  return true;
}

export function disableAudio(): void {
  state.engineSource?.stop();
  state.engineSource = null;
  state.engineGain = null;
  void state.context?.close();
  state.context = null;
  state.master = null;
  state.enabled = false;
}

/**
 * Drives the engine loop from the car. Called once per frame from the rig;
 * returns immediately when audio is off, so it costs nothing by default.
 *
 * @param speed 0..1 normalised road speed
 * @param load  0..1 throttle-ish value, used for volume
 */
export function updateEngine(speed: number, load: number): void {
  const source = state.engineSource;
  const gain = state.engineGain;
  const context = state.context;
  if (!source || !gain || !context) return;

  const now = context.currentTime;
  // Pitch tracks speed; a narrow range keeps a single loop from sounding synthetic.
  source.playbackRate.setTargetAtTime(0.72 + speed * 0.9, now, 0.12);
  gain.gain.setTargetAtTime(0.12 + load * 0.5, now, 0.2);
}

export async function playOneShot(name: OneShot, volume = 0.5): Promise<void> {
  const context = state.context;
  const master = state.master;
  if (!context || !master) return;

  const buffer = await load(SOURCES[name]);
  if (!buffer) return;

  const gain = context.createGain();
  gain.gain.value = volume;
  gain.connect(master);

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(gain);
  source.start();
  source.onended = () => gain.disconnect();
}
