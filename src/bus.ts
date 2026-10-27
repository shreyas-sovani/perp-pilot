import { z } from 'zod';
import { appendFileSync, mkdirSync } from 'node:fs';

export const AGENTS = ['orchestrator','marketData','signals','copilot','risk','execution','guard','reporter'] as const;
export type AgentName = typeof AGENTS[number];

export const Envelope = z.object({
  seq: z.number().int().nonnegative(),
  ts: z.number().int(),
  agent: z.enum(AGENTS),
  kind: z.string(),
  payload: z.unknown(),
  dryRun: z.boolean(),
});
export type Envelope = z.infer<typeof Envelope>;

type Handler = (e: Envelope) => void;
const handlers = new Map<string, Set<Handler>>();
let seq = 0;
let jsonlPath: string | null = null;

export function busStartJournal(date = new Date()) {
  mkdirSync('runs', { recursive: true });
  jsonlPath = `runs/${date.toISOString().slice(0, 10)}.jsonl`;
}
export function publish(agent: AgentName, kind: string, payload: unknown, dryRun: boolean): Envelope {
  const env = Envelope.parse({ seq: seq++, ts: Date.now(), agent, kind, payload, dryRun });
  if (jsonlPath) appendFileSync(jsonlPath, JSON.stringify(env) + '\n');
  for (const h of handlers.get(kind) ?? []) h(env);
  for (const h of handlers.get('*') ?? []) h(env);
  return env;
}
export function subscribe(kind: string | '*', h: Handler): () => void {
  const set = handlers.get(kind) ?? new Set();
  set.add(h); handlers.set(kind, set);
  return () => set.delete(h);
}
export const busSeq = () => seq;
