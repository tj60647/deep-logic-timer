
export interface RobotMessage {
  text: string;
  type: 'status' | 'warning' | 'alert' | 'info';
  timestamp: number;
}

export enum TimerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}
