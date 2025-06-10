/// <reference types="vite/client" />

// FIX: Teach TypeScript about the new Notification Scheduling APIs
// This extends the global Window and NotificationOptions types.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TimestampTrigger = any;

interface Window {
  TimestampTrigger?: new (timestamp: number) => TimestampTrigger;
}

interface NotificationOptions {
  showTrigger?: TimestampTrigger;
}