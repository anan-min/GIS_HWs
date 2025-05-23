import { Component, AfterViewInit } from '@angular/core';
import { Q2Component } from '../q2/q2.component';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';

@Component({
  imports: [Q2Component],
  selector: 'app-q3',
  templateUrl: './q3.component.html',
  styleUrls: ['./q3.component.css'],
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
