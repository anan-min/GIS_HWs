import { Component, AfterViewInit } from '@angular/core';
import { Q2Component } from '../q2/q2.component';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';

@Component({
  imports: [Q2Component],
  selector: 'app-q3',
  template: `
    <div class="map-container">
      <app-q2 (locate)="onLocate($event)" class="form-container"></app-q2>
      <div id="mapViewDiv"></div>
    </div>
  `,
  styles: [
    `
      .map-container {
        display: flex;
        height: 100vh;
        width: 100%;
        position: relative; /* Make sure the container has a relative position */
      }

      #mapViewDiv {
        flex: 1;
        height: 100%;
      }

      .form-container {
        width: 300px;
        height: 100%;
        padding: 20px;
        position: absolute;
        top: 20px;
        right: 20px;
        z-index: 10; /* Ensure the form is above the map */
      }
    `,
  ],
})
export class Q3Component implements AfterViewInit {
  private mapView!: MapView;

  // Initialize map after the view is initialized
  ngAfterViewInit(): void {
    this.initializeMap();
  }

  // Function to initialize the map
  initializeMap(): void {
    const map = new Map({
      basemap: 'streets-navigation-vector', // Use your preferred basemap
    });

    this.mapView = new MapView({
      container: 'mapViewDiv', // The ID of the div where the map will be displayed
      map: map,
      center: [-118.805, 34.027], // Default center (longitude, latitude)
      zoom: 13, // Default zoom level
    });
    this.mapView.ui.add('locate', 'top-left');
    this.mapView.ui.add('zoom', 'top-left');
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
}
