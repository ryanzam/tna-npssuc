import { TnaEvent, TnaEventAttendee } from './event';
import { TnaGallery } from './gallery';
import { TnaMember } from './member';
import { TnaAccount } from './account';

export * from './gallery';
export * from './member';
export * from './event';
export * from './account';

export class Data {
  member: [TnaMember];
  infos?: [any];
  events: [TnaEvent];
  gallery: [TnaGallery];
  account?: [TnaAccount];
  eventAttendees: [TnaEventAttendee]
}
