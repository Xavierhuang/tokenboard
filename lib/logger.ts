export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: string, message: string, data?: any): string {
    let formattedMessage = `[${this.context}] ${level.toUpperCase()} - ${this.getTimestamp()}: ${message}`;
    if (data) {
      try {
        formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
      } catch (e) {
        // Fallback for circular structures or other serialization errors
        formattedMessage += `\n[Unserializable data]`;
      }
    }
    return formattedMessage;
  }

  log(message: string, data?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatMessage('log', message, data));
    }
  }

  info(message: string, data?: any) {
    console.info(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: any) {
    console.warn(this.formatMessage('warn', message, data));
  }

  error(message: string, error?: any) {
    const errorMessage = error instanceof Error ? error.stack || error.message : String(error);
    console.error(this.formatMessage('error', message, errorMessage));
  }
} 