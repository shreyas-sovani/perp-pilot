export interface ReportInput {
  fileSlug: string;
  title: string;
  severity: 'critical' | 'major' | 'normal';
  area: 'API' | 'SDK' | 'docs' | 'app' | 'contracts';
  steps: string[];
  expected: string;
  actual: string;
  evidence: string[];
  sdkVersion?: string;
  walletAddress?: string;
  extraEnv?: Record<string, string>;
}

export function renderReport(r: ReportInput): string {
  const steps = r.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
  const evidence = r.evidence.map(e => `- ${e}`).join('\n');
  return `# ${r.title}
Severity: ${r.severity}
Area: ${r.area}

## Steps to reproduce
${steps}

## Expected
${r.expected}

## Actual
${r.actual}

## Evidence
${evidence}

## Environment
SDK version: ${r.sdkVersion ?? '@somnia-chain/markets-sdk@0.32.1'}
Network: Somnia Tokyo testnet (chain ID 50383)
Wallet address: ${r.walletAddress ?? '<bot wallet address>'}${Object.entries(r.extraEnv ?? {}).map(([k, v]) => `\n${k}: ${v}`).join('')}
`;
}

export function reportPath(id: string): string { return `feedback/${id}.md`; }
