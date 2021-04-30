export class Toast {
  title: string;
  subtitle?: string;
  type: 'success' | 'error' | 'info';
  icon?: string;
  action?: string;
  showButton?: boolean;
  buttonText?: string;
  hasBackdrop?: boolean;
}
