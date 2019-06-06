export class TnaEvent {
  reference_number?: string;
  expiry_datetime?: string;
  description: string;
  title: string;
  family_price?: number | string;
  registration_open?: boolean;
  children_price?: number | string;
  datetime: string;
  location: string;
  registration?: boolean;
  owner: number | string;
  adult_price: number | string;
  pictures?: [any];
  uid?: string;
}
export class TnaEventAttendee {
  total: number | string;
  email_reminder_sent?: boolean;
  name: string;
  no_children?: number | string;
  email: string;
  phone?: string;
  has_paid?: boolean;
  address: string;
  no_family?: number | string;
  no_adults?: number | string;
  no_vegetarian?: number | string;
  events: number | string;
  pk: number | string;
}
