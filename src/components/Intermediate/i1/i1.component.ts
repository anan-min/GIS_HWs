import { Component, AfterViewInit } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';
import * as identify from '@arcgis/core/rest/identify';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

@Component({
  selector: 'app-i1',
  template: `
    <div class="map-container">
      <div id="mapViewDiv"></div>
    </div>

    <div class="table-container">
      <div></div>
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
  private featureLayer!: FeatureLayer; // Declare the featureLayer here

  ngAfterViewInit(): void {
    this.initializeMap();
    this.initializeFeatureLayer(); // Create the feature layer once
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

  // Initialize the feature layer only once
  initializeFeatureLayer(): void {
    this.featureLayer = new FeatureLayer({
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3', // Example URL
    });

    this.featureLayer
      .when(() => {
        console.log('FeatureLayer is ready');
      })
      .catch((error) => {
        console.error('Error loading FeatureLayer:', error);
      });
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

    // Query the featureLayer after the map click
    this.queryData();
  }

  queryData(): void {
    console.log('Querying Feature Layer for data...');

    if (!this.featureLayer) {
      console.error('FeatureLayer is not initialized');
      return;
    }

    // Query the feature layer directly
    this.featureLayer
      .queryFeatures({
        where: '1=1', // Get all records (you can modify the condition as needed)
        outFields: ['STATE_NAME', 'SUB_REGION', 'STATE_ABBR'], // Specify the fields you need
        returnGeometry: false, // We don't need geometry for this example
      })
      .then((response) => {
        console.log('Query Response:', response);

        // Extract data from the response
        const data = response.features.map((feature) => ({
          stateName: feature.attributes['STATE_NAME'],
          subregion: feature.attributes['SUB_REGION'],
          stateAbbr: feature.attributes['STATE_ABBR'],
        }));

        // Log the data
        console.log('Mapped Data:', data);
      })
      .catch((error) => {
        console.error('Error during query:', error);
      });
  }
}
