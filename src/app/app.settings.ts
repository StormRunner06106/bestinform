import { Injectable } from "@angular/core";
import {environment} from "../environments/environment";

export class Settings {
  constructor(
    public url: string,
    public name: string,
    public theme: string,
    public toolbar: number,
    public stickyMenuToolbar: boolean,
    public header: string,
    public rtl: boolean,
    public searchPanelVariant: number,
    public searchOnBtnClick: boolean,
    public currency: string,

    //additional options
    public mainToolbarFixed: boolean,
    public contentOffsetToTop: boolean,
    public headerBgImage: boolean,
    public headerBgVideo: boolean,
    public loadMore: {
      start: boolean;
      step: number;
      load: boolean;
      page: number;
      complete: boolean;
      result: number;
    }
  ) {}
}

@Injectable()
export class AppSettings {
  public settings = new Settings(
    environment.api_url,
    "Bestinform", // theme name
    "blue", // blue, green, red, pink, purple, grey, orange-dark
    1, // 1 or 2
    true, // true = sticky, false = not sticky
    "image", // default, image, carousel, map, video
    false, // true = rtl, false = ltr
    1, //  1, 2  or 3
    false, //  true = search on button click
    "USD", // USD, EUR

    //NOTE:  don't change additional options values, they used for theme performance
    false,
    false,
    false,
    false,
    {
      start: false,
      step: 1,
      load: false,
      page: 1,
      complete: false,
      result: 0,
    }
  );
}
