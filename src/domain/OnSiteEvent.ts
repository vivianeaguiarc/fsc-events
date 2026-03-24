export interface OnSiteEvent {
  id: string;
  name: string;
  ticketPriceInCents: number;
  latitude: number;
  longitude: number;
  date: Date;
  ownerId: string;
}
