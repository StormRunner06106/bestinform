import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  reverseGeocode(lat: number, lng: number): Promise<string> {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    return new Promise((resolve, reject) => {
      geocoder.geocode({ 'location': latlng }, (results, status) => {
        if (status === 'OK') {
          if (results[0]) {
            const locality = this.extractAddressComponent(results[0], 'locality');
            const country = this.extractAddressComponent(results[0], 'country');
            const formattedLocation = `${locality}, ${country}`;
            resolve(formattedLocation);
          } else {
            reject('No results found');
          }
        } else {
          reject('Geocoder failed due to: ' + status);
        }
      });
    });
  }

  getCityName(lat: number, lng: number): Promise<string> {
    return this.reverseGeocode(lat, lng).then(location => {
      // Assuming the location format is "City, Country", we split and take the first part
      const cityName = location.split(',')[0];
      return cityName;
    }).catch(error => {
      console.error('Error getting city name:', error);
      throw error; // Propagate the error if there's one
    });
  }

  private extractAddressComponent(result, type) {
    const component = result.address_components.find(ac => ac.types.includes(type));
    return component ? component.long_name : '';
  }
}
