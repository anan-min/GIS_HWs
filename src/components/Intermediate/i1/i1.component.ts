import { Component, AfterViewInit } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';

import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';
import * as identify from '@arcgis/core/rest/identify';
import Graphic from '@arcgis/core/Graphic';

@Component({
  imports: [],
  selector: 'app-i1',
  template: `
    <div class="map-container">
      <div id="mapViewDiv"></div>
    </div>
  `,
  styles: [
    `
      .map-container {
        display: flex;
        height: 100vh;
        width: 50%;
      }

      #mapViewDiv {
        flex: 1;
        height: 100%;
      }
    `,
  ],
})
export class I1Component implements AfterViewInit {
  private mapView!: MapView;
  private identifyParams!: IdentifyParameters;

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  // Function to initialize the map
  initializeMap(): void {
    const map = new Map({
      basemap: 'streets-navigation-vector',
    });

    const censusLayer = new MapImageLayer({
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer',
    });
    map.add(censusLayer);

    this.mapView = new MapView({
      container: 'mapViewDiv',
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

  generateTable() {
    
  }

  handleMapClick(event: any): void {
    const clickedPoint = event.mapPoint;
    const latitude = clickedPoint.latitude;
    const longitude = clickedPoint.longitude;

    this.mapView.graphics.removeAll();
    this.identifyParams.geometry = clickedPoint;
    this.identifyParams.mapExtent = this.mapView.extent;

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
          const geometry = result.feature.geometry;
          const polygon = geometry.clone();

          const polygonGraphic = new Graphic({
            geometry: polygon,
            symbol: {
              type: 'simple-fill',
              color: [0, 0, 255, 0.3],
              outline: {
                color: [0, 0, 255],
                width: 1,
              },
            },
          });

          this.mapView.graphics.add(polygonGraphic);
        }
      })
      .catch((error) => {
        console.error('Error during Identify task:', error);
      });
  }
}
