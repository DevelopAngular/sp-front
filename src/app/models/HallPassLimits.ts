export interface HallPassLimit {
  id: number;
  schoolId: number;
  passLimit: number;
  frequency: 'day'; // TODO: add more when more frequencies are implemented
  limitEnabled: boolean;
}
