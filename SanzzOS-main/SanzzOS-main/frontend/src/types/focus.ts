export interface FocusSession {
  readonly id: string;
  readonly taskName: string;
  readonly durationMinutes: number;
  readonly completed: boolean;
  readonly startedAt: string;
  readonly endedAt: string;
}
