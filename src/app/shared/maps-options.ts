export const mapsOptions = {
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: true,
  fullscreenControl: false,
  mapTypeId: google.maps.MapTypeId.ROADMAP,
  styles: [
    {
      featureType: "administrative.country",
      elementType: "geometry.fill",
      stylers: [
        {
          color: "#d5c210",
        },
      ],
    },
    {
      featureType: "administrative.neighborhood",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi",
      elementType: "labels.text",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.attraction",
      elementType: "labels.text",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.business",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "labels.icon",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "geometry.fill",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.medical",
      elementType: "labels.text",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.school",
      elementType: "labels.text",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.attraction",
      elementType: "labels.text",
      stylers: [
        {
          color: "#ffe600",
        },
      ],
    },
    {
      featureType: "poi.business",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    // {
    //   featureType: "road",
    //   elementType: "labels",
    //   stylers: [
    //     {
    //       visibility: "off",
    //     },
    //   ],
    // },
    // {
    //   featureType: "road.arterial",
    //   elementType: "labels",
    //   stylers: [
    //     {
    //       visibility: "off",
    //     },
    //   ],
    // },
    // {
    //   featureType: "road.highway",
    //   elementType: "labels",
    //   stylers: [
    //     {
    //       visibility: "off",
    //     },
    //   ],
    // },
    // {
    //   featureType: "road.local",
    //   stylers: [
    //     {
    //       visibility: "off",
    //     },
    //   ],
    // },
    {
      featureType: "water",
      elementType: "labels.text",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
  ],
};


export const triangleIcon = {
  path: "M 0,20 L 20,20 L 10,0 z", // This is an SVG path for a larger triangle
  fillColor: "#838197",
  fillOpacity: 1.0,
  strokeWeight: 0.5,
  scale: 0.7,
};

export interface CustomMapMarker {
  lat: number;
  lng: number;
  label?: string;
  activeIcon?: boolean;
  featuredImage?: any;
}
