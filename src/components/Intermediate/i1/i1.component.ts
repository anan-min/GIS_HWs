import { Component, AfterViewInit } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import IdentifyParameters from '@arcgis/core/rest/support/IdentifyParameters';
import * as identify from '@arcgis/core/rest/identify';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-i1',
  template: `
    <div class="container">
      <div class="map-container">
        <div id="mapViewDiv"></div>
      </div>

      <div class="table-container">
        <table id="stateTable">
          <thead>
            <tr>
              <th>State Name</th>
              <th>Subregion</th>
              <th>State Abbreviation</th>
            </tr>
          </thead>
          <tbody id="tableBody">
            <!-- Loop over states array and create rows dynamically -->
            <tr
              *ngFor="let state of states"
              [ngClass]="{ highlight: isRowHighlighted(state.stateAbbr) }"
              (click)="onRowClick(state.stateAbbr)"
            >
              <td>{{ state.stateName }}</td>
              <td>{{ state.subregion }}</td>
              <td>{{ state.stateAbbr }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      /* Highlight row styles */
      .highlight {
        background-color: #ff0000;
        font-weight: bold;
        color: #ffffff;
        font-size: 20px;
        text-align: center;
        padding: 10px;
      }

      /* Container that wraps both map and table */
      .container {
        display: flex;
        height: 100vh; /* Ensure full viewport height */
        width: 100%;
        overflow: hidden; /* Prevent scrolling issues */
      }

      /* Map section takes up 50% of the container */
      .map-container {
        display: flex;
        height: 100%;
        width: 50%; /* 50% width for map */
        background-color: #f0f0f0; /* Add a subtle background color */
      }

      #mapViewDiv {
        width: 100%;
        height: 100%;
      }

      /* Table section takes up 50% of the container */
      .table-container {
        display: flex;
        flex-direction: column;
        padding: 20px;
        max-height: 100%;
        overflow-y: auto;
        width: 50%; /* 50% width for table */
        background-color: #ffffff;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1); /* Shadow on the right side */
        border-left: 2px solid #ddd; /* Border separating the table from the map */
      }

      /* Style for the table header */
      #stateTable thead {
        background-color: #f0f0f0; /* Subtle background color for header */
        color: #333; /* Darker text color */
        font-size: 18px; /* Slightly larger font size for the header */
        font-weight: bold; /* Bold text for header */
      }

      /* Style for table headers (th) */
      #stateTable th {
        padding: 12px 20px; /* Padding for the header cells */
        text-align: left; /* Align header text to the left */
        border-bottom: 2px solid #ddd; /* Border at the bottom of header cells */
        background-color: #e9e9e9; /* Slightly different background for header cells */
      }

      /* Optional: Add hover effect for the header */
      #stateTable th:hover {
        background-color: #d3d3d3; /* Light hover effect for better user interaction */
      }
    `,
  ],
})
export class I1Component implements AfterViewInit {
  private mapView!: MapView;
  private identifyParams!: IdentifyParameters;
  private featureLayer!: FeatureLayer;
  private highlightedStateAbbr: string | null = null;
  states: any[] = [];

  ngAfterViewInit(): void {
    this.initializeMap();
    this.initializeFeatureLayer();
    this.queryData();
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
          this.mapView.goTo({
            target: geometry?.extent,
            zoom: 6,
          });
        }

        this.highlightTableRow(result.feature.attributes['STATE_ABBR']);
      })
      .catch((error) => {
        console.error('Error during Identify task:', error);
      });
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
        this.states = response.features.map((feature) => ({
          stateName: feature.attributes['STATE_NAME'],
          subregion: feature.attributes['SUB_REGION'],
          stateAbbr: feature.attributes['STATE_ABBR'],
        }));
      })
      .catch((error) => {
        console.error('Error during query:', error);
      });
  }

  // Function to create a table from the query data

  // loop through everyrow
  // remove hightlight
  // highlight when find row data-state = statename
  highlightTableRow(stateName: string): void {
    this.highlightedStateAbbr = stateName; // Set the highlighted state abbreviation
  }

  onRowClick(stateAbbr: string): void {
    this.highlightedStateAbbr = stateAbbr; // Set the clicked row's state abbreviation
    this.createPolygonFromStateAbbr(stateAbbr);
  }

  // Function to check if the row should be highlighted
  isRowHighlighted(stateAbbr: string): boolean {
    return this.highlightedStateAbbr === stateAbbr;
  }

  createPolygonFromStateAbbr(stateAbbr: string): void {
    const query = this.featureLayer.createQuery();
    query.where = `STATE_ABBR = '${stateAbbr}'`; // Use the stateAbbr to query the feature layer
    query.outFields = ['STATE_NAME', 'SUB_REGION', 'STATE_ABBR', 'SHAPE']; // Ensure SHAPE field is included for geometry
    query.returnGeometry = true;

    this.featureLayer
      .queryFeatures(query)
      .then((response) => {
        const feature = response.features[0]; // Get the first matching feature (state)
        console.log('Feature:', feature);

        if (feature) {
          const geometry = feature.geometry;
          const polygonGraphic = new Graphic({
            geometry: geometry,
            symbol: {
              type: 'simple-fill',
              color: [0, 0, 255, 0.3], // Set polygon color to blue with transparency
              outline: {
                color: [0, 0, 255], // Blue outline
                width: 1,
              },
            },
          });

          // Add the polygon graphic to the map
          this.mapView.graphics.removeAll(); // Clear any previous graphics
          this.mapView.graphics.add(polygonGraphic);

          this.mapView.goTo({
            target: geometry?.extent,
            zoom: 6,
          });
        }
      })
      .catch((error) => {
        console.error('Error querying feature layer:', error);
      });
  }
}
