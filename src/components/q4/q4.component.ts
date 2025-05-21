import { Component, AfterViewInit } from '@angular/core';
import { Q2Component } from '../q2/q2.component';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';
import * as identify from '@arcgis/core/rest/identify';
import Graphic from '@arcgis/core/Graphic';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import { CustomPoint } from '../q2/custom-point.model';

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
    </div>
  `,
  styles: [
    `
      .map-container {
        display: flex;
        height: 100vh;
        width: 100%;
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
        z-index: 10;
      }
    `,
  ],
})
export class Q4Component implements AfterViewInit {
  private mapView!: MapView;
  private identifyParams!: IdentifyParameters;
  latitude: number = 34.027;
  longitude: number = -118.805;

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  // Function to initialize the map
  initializeMap(): void {
    const map = new Map({
      basemap: 'streets-navigation-vector',
    });

    // Define the PopupTemplate for the FeatureLayer
    const template = new PopupTemplate({
      title: '{STATE_NAME}',
      content: [
        {
          type: 'fields',
          fieldInfos: [
            {
              fieldName: 'POP2008',
              label: 'Population',
            },
            {
              fieldName: 'Shape_Area',
              label: 'Area',
            },
          ],
        },
      ],
    });

    const featureLayer = new FeatureLayer({
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3',
      popupTemplate: template, // Set the popupTemplate for the FeatureLayer
    });

    const censusLayer = new MapImageLayer({
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer',
    });

    map.add(censusLayer);
    map.add(featureLayer);

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

  onLocate(customPoint: CustomPoint): void {
    this.latitude = customPoint.latitude;
    this.longitude = customPoint.longitude;
    console.log('Updated Latitude:', this.latitude);
    console.log('Updated Longitude:', this.longitude);

    // event emitter works fine

    // Make sure to set the mapView center properly
    this.mapView
      .goTo({
        center: [this.longitude, this.latitude],
        zoom: 6,
      })
      .catch((error) =>
        console.error('Error when moving the map view:', error)
      );
  }

  handleMapClick(event: any): void {
    const clickedPoint = event.mapPoint;
    const latitude = clickedPoint.latitude;
    const longitude = clickedPoint.longitude;

    this.latitude = latitude;
    this.longitude = longitude;

    this.mapView.graphics.removeAll(); // Clear any existing graphics
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
        const result = response.results[0];
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

          const clickedPoint = event.mapPoint;
          const stateName = result.feature.attributes['STATE_NAME'];
          const population = result.feature.attributes['POP2008'];
          const shapeArea = result.feature.attributes['Shape_Area'];

          const popupContent = `
          <strong>State Name:</strong> ${stateName}<br>
          <strong>Population:</strong> ${population}<br>
          <strong>Area:</strong> ${shapeArea} sq. meters<br>
          <strong>Latitude:</strong> ${latitude}<br>
          <strong>Longitude:</strong> ${longitude}
        `;

          // Set the popup content and open it at the clicked location
          if (this.mapView.popup) {
            this.mapView.popup.open({
              title: stateName, // Title of the popup
              content: popupContent, // Content for the popup
              location: clickedPoint, // Set the location where the popup should appear
            });
          }
        }
      })
      .catch((error) => {
        console.error('Error during Identify task:', error);
      });
  }
}
