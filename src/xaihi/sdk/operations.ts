export interface OperationRun {
  runId: string
  progress: (p: { done: number; total?: number; message?: string }) => void
  preview: (p: { message: string }) => void
  resultView: (payload: unknown) => void
  checkpoint?: (p: unknown) => void
}

export const NULL_RUN: OperationRun = {
  runId: 'null-run',
  progress: () => {},
  preview: () => {},
  resultView: () => {},
  checkpoint: () => {},
}

export interface OperationJournal {
  open: (meta: { nodeId: string; actionId: string }) => OperationRun
  finish: (runId: string) => void
  fail: (runId: string, reason: string) => void
}

export const OPERATIONS_SERVICE = 'operations'
