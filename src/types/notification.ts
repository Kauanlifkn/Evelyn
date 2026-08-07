export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'shelter' | 'weather' | 'system' | 'tsunami';
  severity?: number;
  read: boolean;
  createdAt: string;
  link?: string;
  isSimulated: true;
}
