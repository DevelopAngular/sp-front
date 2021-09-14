export interface GSuiteOrgs {
    last_failed_sync?: string;
    last_successful_sync?: string;
    next_sync?: string;
    num_accounts?: number;
    selectors?: any;
    is_syncing?: boolean;
    is_enabled?: boolean;
    is_authorized?: boolean;
    wants_authorization?: boolean;
    sync_type?: string;
}
