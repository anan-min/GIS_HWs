import { Component, AfterViewInit } from '@angular/core';
import { Q2Component } from '../q2/q2.component';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';

import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';
import * as identify from '@arcgis/core/rest/identify';
import Graphic from '@arcgis/core/Graphic';

@Component({
  imports: [Q2Component],
  selector: 'app-q4',
  template: `
    <div class="map-container">
      <app-q2
        (locate)="onLocate($event)"
        class="form-container"
        formTitle="Q4 Locator"
        [lattitude]="latitude"
        [longitude]="longitude"
      ></app-q2>
      <div id="mapViewDiv"></div>
      <!-- ArcGIS Map container -->
    </div>
  `,
  styles: [
    `
      .map-container {
        display: flex;
        height: 100vh; /* Full height of the viewport */
        width: 100%;
      }

      #mapViewDiv {
        flex: 1; /* Map takes up remaining space */
        height: 100%;
      }

      .form-container {
        width: 300px; /* Fixed width for the form */
        height: 100%;
        padding: 20px;
        position: absolute;
        top: 20px;
        right: 20px;
      }
    `,
  ],
})
export class Q4Component implements AfterViewInit {
  private mapView!: MapView;
  private identifyParams!: IdentifyParameters;
  latitude: number = 34.027;
  longitude: number = -118.805;

  // Initialize map after the view is initialized
  ngAfterViewInit(): void {
    this.initializeMap();
  }

  // Function to initialize the map
  initializeMap(): void {
    const map = new Map({
      basemap: 'streets-navigation-vector', // Use your preferred basemap
    });

    const censusLayer = new MapImageLayer({
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer',
    });
    map.add(censusLayer);

    this.mapView = new MapView({
      container: 'mapViewDiv', // The ID of the div where the map will be displayed
      map: map,
      center: [-98.35, 39.5],
      zoom: 5,
    });

    this.identifyParams = new IdentifyParameters();
    this.identifyParams.layerIds = [3];
    this.identifyParams.layerOption = 'top';
    this.identifyParams.tolerance = 3;
    this.identifyParams.returnGeometry = true;
    this.identifyParams.width = this.mapView.width;
    this.identifyParams.height = this.mapView.height;

    this.mapView.when(() => {
      console.log('Map view is ready!');

      // Listen for click events on the map
      this.mapView.on('click', (event) => {
        this.handleMapClick(event);
      });
    });
  }

  // Handle location input from Q2Component and update map center
  onLocate(customPoint: any): void {
    if (this.mapView) {
      this.mapView.goTo({
        center: [customPoint.longitude, customPoint.latitude],
        zoom: 13,
      });
      console.log('Map centered at:', customPoint);
    }
  }

  handleMapClick(event: any): void {
    const clickedPoint = event.mapPoint;
    const latitude = clickedPoint.latitude;
    const longitude = clickedPoint.longitude;

    this.latitude = latitude;
    this.longitude = longitude;

    this.mapView.graphics.removeAll();
    this.identifyParams.geometry = clickedPoint;
    this.identifyParams.mapExtent = this.mapView.extent;

    // Log the latitude and longitude of the clicked location
    console.log(
      `You clicked at: Latitude = ${latitude}, Longitude = ${longitude}`
    );

    identify
      .identify(
        'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer',
        this.identifyParams
      )
      .then((response) => {
        const result = response.results[0]; // Get the first result (state)
        if (result) {
          // Create a Polygon graphic around the identified state
          const geometry = result.feature.geometry;
          const polygon = geometry.clone(); // Clone the geometry to create a polygon

          // Create a graphic symbol for the polygon
          const polygonGraphic = new Graphic({
            geometry: polygon,
            symbol: {
              type: 'simple-fill', // Simple fill symbol
              color: [0, 0, 255, 0.3], // Semi-transparent blue
              outline: {
                color: [0, 0, 255], // Blue outline
                width: 1,
              },
            },
          });

          this.mapView.graphics.add(polygonGraphic);

          if (this.mapView.popup) {
            console.log('Popup is available.');
            console.log('Feature attributes:', result.feature.attributes);
            this.mapView.popup.open({
              location: clickedPoint, // Popup will appear at the clicked point
              title: result.feature.attributes['STATE_NAME'], // State name
              content: `
                <b>Population (2007):</b> ${result.feature.attributes['POP2007']}<br>
                <b>Area:</b> ${result.feature.attributes['Shape_Area']} square miles
              `,
            });
          } else {
            console.error('Popup is not available.');
          }
        }
      })
      .catch((error) => {
        console.error('Error during Identify task:', error);
      });
  }
}
