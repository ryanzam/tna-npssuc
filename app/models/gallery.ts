export class TnaGallery {
  owner: number | string;
  description: string;
  title: string;
  pictures?: [any];
  pk: number | string;
}

export class TnaGalleryPicture {
  url: string;
  cover_photo: string;
  gallery: number | string;
  pk: number | string;
}
