export interface PassLimit {
  id: number | string;
  max_passes_from: number;
  max_passes_from_active: boolean;
  max_passes_to: number;
  max_passes_to_active: boolean;
  from_count: number;
  to_count: number;
}
