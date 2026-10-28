import pino from 'pino';
const SECRET_KEY = /private|key|secret|mnemonic/i;
const redactString = (s: string, key?: string): string => (key && SECRET_KEY.test(key) ? '[REDACTED]' : s);
const censor = (o: unknown, key?: string): unknown => {
  if (key && SECRET_KEY.test(key)) return '[REDACTED]';
  if (typeof o === 'string') return redactString(o, key);
  if (Array.isArray(o)) return o.map((v) => censor(v));
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, censor(v, k)]));
  return o;
};
export function redactForLog(value: unknown): unknown { return censor(value); }

export const log = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: { paths: ['privateKey', 'apiKey', '*.privateKey', '*.apiKey'], censor: '[REDACTED]' },
  mixin: () => ({}),
  hooks: {
    logMethod(inputArgs, method) {
      const next = inputArgs.map((a) => (typeof a === 'string' ? redactString(a) : a && typeof a === 'object' ? censor(a) : a));
      method.apply(this, next as typeof inputArgs);
    },
  },
});
export const safeLog = (obj: object, msg: string) => log.debug(censor(obj), msg);
