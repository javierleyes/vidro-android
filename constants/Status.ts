export const VisitStatus = {
  PENDING: 1,
  COMPLETED: 2,
} as const;

export type VisitStatusType = typeof VisitStatus[keyof typeof VisitStatus];
