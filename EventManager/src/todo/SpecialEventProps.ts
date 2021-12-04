export interface SpecialEventProps {
  _id?: string;
  title: string;
  numberOfPeople: number;
  date:Date;
  isApproved:boolean;
  latitude?: number;
  longitude?: number;
  webViewPath: string;
}
