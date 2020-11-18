export interface CleverInfo {
  last_failed_sync: Date;
  last_successful_sync: Date;
  next_sync: Date;
  num_accounts: number;
  is_enabled: boolean;
  is_syncing: boolean;
}
