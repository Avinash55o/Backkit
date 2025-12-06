export interface ProgressCallback {
  (current: number, total: number, message?: string): void;
}

export class ProgressTracker {
  private current = 0;
  private total: number;
  private callback?: ProgressCallback;

  constructor(total: number, callback?: ProgressCallback) {
    this.total = total;
    this.callback = callback;
  }

  increment(message?: string): void {
    this.current++;
    if (this.callback) {
      this.callback(this.current, this.total, message);
    }
  }

  setTotal(total: number): void {
    this.total = total;
  }

  getProgress(): number {
    return this.total > 0 ? (this.current / this.total) * 100 : 0;
  }
}
