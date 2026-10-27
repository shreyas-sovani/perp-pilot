import pino from 'pino';
const REDACT = [/private[_-]?key/i, /api[_-]?key/i, /0x[0-9a-fA-F]{64}/, /seed|mnemonic/i];
const redactString = (s: string): string => (REDACT.some(r => r.test(s)) ? '[REDACTED]' : s);
const censor = (o: unknown, key?: string): unknown => {
  if (key && REDACT.some(r => r.test(key))) return '[REDACTED]';
  if (typeof o === 'string') return redactString(o);
  if (Array.isArray(o)) return o.map((v) => censor(v));
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, censor(v, k)]));
  return o;
};
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
