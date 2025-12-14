/**
 * Configuration type definitions
 */

export interface Config {
  appName: string;
  version: string;
  environment: 'development' | 'production' | 'test';
  debug: boolean;
}
