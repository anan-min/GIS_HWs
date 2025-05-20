import { Component, AfterViewInit } from '@angular/core';
import { Q2Component } from '../q2/q2.component'; // Ensure Q2Component is correctly imported
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';




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
        width: 100%;P
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

    this.mapView.on('click', (event) => {
      this.handleMapClick(event);
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

    // Log the latitude and longitude of the clicked location
    console.log(
      `You clicked at: Latitude = ${latitude}, Longitude = ${longitude}`
    );
  }
}
