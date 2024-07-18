import {Injectable} from '@angular/core';
import {SystemSetting} from "../_models/system-setting.model";

type Path = {
  pageNameRo: string;
  pageNameEn: string;
  backendName: string;
  parentImagePath?: string;
  nextRouteSection?: string;
  children?: {[key: string]: Path};
};

type MainCategories = {
  [key: string]: Path
};

@Injectable({
  providedIn: 'root'
})
export class CategoryPathService {

  private categoriesPath: MainCategories = {
    trips: {
      pageNameRo: 'Călătorii & Itinerarii',
      pageNameEn: 'Trips & Itineraries',
      backendName: 'tripOptions',
      parentImagePath: 'trip',
      children: {
        itineraries: {
          pageNameRo: 'Alegeți tematica itinerariului',
          pageNameEn: 'Select the theme of the itinerary',
          backendName: 'itinerary',
          nextRouteSection: 'itineraries-theme'
        },
        itineraries_configurator: {
          pageNameRo: 'Configurație itinerariu',
          pageNameEn: 'Itinerary configurator',
          backendName: 'configuratorItinerary',
          nextRouteSection: 'itineraries-config'
        },
        holiday_offers: {
          pageNameRo: 'Oferte călătorii',
          pageNameEn: 'Holiday offers',
          backendName: 'holidayOffer',
          nextRouteSection: 'holiday-offers'
        }
      }
    }
  }

  // returnam numele paginii in ro, apoi en si ruta de urmarit pt obiectul din setari
  getInfoFromRoutePath(path: string[],
                       obj: MainCategories | Path | object = this.categoriesPath,
                       pathToSettings: string[] = []): [string, string, string[], string[]] {

    const currentObjKey = path[0];
    let pageNameRo: string = obj[currentObjKey]?.pageNameRo;
    let pageNameEn: string = obj[currentObjKey]?.pageNameEn;

    for (const key of Object.keys(obj)) {
      if (key === currentObjKey) {
        pageNameRo = obj[key].pageNameRo;
        pageNameEn = obj[key].pageNameEn;
        pathToSettings.push(obj[key].backendName);

        if (typeof obj[key] === 'object' && obj[key].children && path.length > 1) {
          return this.getInfoFromRoutePath(path.splice(1), obj[key].children, pathToSettings);
        }
      }
    }

    return [pageNameRo, pageNameEn, pathToSettings, obj[currentObjKey].parentImagePath ? [obj[currentObjKey].parentImagePath] : pathToSettings];
  }

  getImageFromSettingsObject(path: string[], settings: SystemSetting): {fileName: string, filePath: string} {

    const currentPath = path[0];
    let image: {fileName: string, filePath: string} = null;

    for (const key of Object.keys(settings)) {
      if (key === currentPath) {
        image = settings[key].image;

        if (typeof settings[key] === 'object' && path.length > 1) {
          return this.getImageFromSettingsObject(path.splice(1), settings[key]);
        }
      }
    }

    return image;
  }

  getInfoFromObjectPath(path: string[], obj: MainCategories | Path | object = this.categoriesPath, pathOfCategories: string[]) {
    const currentPath = path[0];
    for (const key of Object.keys(obj)) {
      if (key === currentPath) {
        if (typeof obj[key] === 'object') {
          return this.getInfoFromObjectPath(path.splice(1), obj[key], pathOfCategories);
        }
      }
    }

    let categoryData = {};
    const categoryDictionary = this.getCategoryPathFromSettingsPath(pathOfCategories.slice());
    for (const key of Object.keys(obj)) {
      if (!['image', 'enable', 'nameRo', 'nameEn'].includes(key)) {
        categoryData = {...categoryData, [categoryDictionary[key].keyName]: {...obj[key], nextRouteSection: categoryDictionary[key].nextRouteSection}};
      }
    }
    console.log(categoryDictionary);
    console.log(categoryData);
    console.log(pathOfCategories);
    return categoryData;

  }

  private getCategoryPathFromSettingsPath(pathOfCategories: string[], obj: MainCategories | Path | object = this.categoriesPath) {
    let categoryDict = {};

    const currentPath = pathOfCategories[0];
    for (const key of Object.keys(obj)) {
      if (key === currentPath) {
        if (typeof obj[key] === 'object') {
          return this.getCategoryPathFromSettingsPath(pathOfCategories.splice(1), obj[key].children);
        }
      }
    }

    for (const key of Object.keys(obj)) {
      categoryDict = {...categoryDict, [obj[key].backendName]: {keyName: key, nextRouteSection: obj[key].nextRouteSection ? obj[key].nextRouteSection : null}}
    }
    console.log(categoryDict);
    return categoryDict;

  }
}
