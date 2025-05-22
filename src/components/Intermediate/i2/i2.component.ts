import { Component } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { AfterViewInit } from '@angular/core';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine.js';
import Graphic from '@arcgis/core/Graphic';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import { SimpleMarkerSymbol } from '@arcgis/core/symbols';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import * as closestFacility from '@arcgis/core/rest/closestFacility';
import ClosestFacilityParameters from '@arcgis/core/rest/support/ClosestFacilityParameters';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
// import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils';

@Component({
  selector: 'app-i2',
  standalone: true,
  imports: [],
  templateUrl: './i2.component.html',
  styleUrls: ['./i2.component.css'],
})
export class I2Component implements AfterViewInit {
  private mapView!: MapView;

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    const map = new Map({
      basemap: 'streets',
    });

    const featureLayer = new FeatureLayer({
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/USA/MapServer/0',
    });

    map.add(featureLayer);

    this.mapView = new MapView({
      container: 'mapViewDiv',
      map: map,
      center: [-117.1611, 32.7157],
      zoom: 10,
    });

    this.mapView.when(() => {
      console.log('Map view is ready!');
      this.mapView.on('click', (event) => {
        this.handleMapClick(event, featureLayer);
      });
    });
  }

  handleMapClick(event: any, featureLayer: FeatureLayer): void {
    const clickedPoint = event.mapPoint;
    const bufferRadius = 20000; // 20 km

    const buffer = geometryEngine.buffer(clickedPoint, bufferRadius, 'meters');
    const singleBuffer = Array.isArray(buffer) ? buffer[0] : buffer;

    const incidentGraphic = new Graphic({
      geometry: event.mapPoint,
      symbol: new SimpleMarkerSymbol({
        color: [218, 156, 115, 0.7], // Blue
        size: 5,
        style: 'square',
      }),
    });

    const fillSymbol = new SimpleFillSymbol({
      color: [218, 156, 115, 0.3],
      outline: {
        color: [0, 0, 0, 255],
        width: 0,
      },
    });

    const bufferGraphic = new Graphic({
      geometry: singleBuffer,
      symbol: fillSymbol,
    });

    // add buffer and clicked point
    this.mapView.graphics.removeAll();
    this.mapView.graphics.add(bufferGraphic);
    this.mapView.graphics.add(incidentGraphic);

    // query features in the buffer
    const query = featureLayer.createQuery();
    query.geometry = singleBuffer;
    query.spatialRelationship = 'intersects';
    query.returnGeometry = true;
    query.outSpatialReference = { wkid: 4326 };

    // use candidate facilities to find the closest one
    featureLayer.queryFeatures(query).then((result) => {
      const facilities = result.features;
      console.log("number of facilities:", facilities.length);
      console.log('First Facility:', facilities[0]?.geometry);
      closestFacility
        .solve(
          'https://sampleserver6.arcgisonline.com/arcgis/rest/services/NetworkAnalysis/SanDiego/NAServer/ClosestFacility',
          new ClosestFacilityParameters({
            incidents: new FeatureSet({
              features: [incidentGraphic],
            }),
            facilities: new FeatureSet({
              features: [...facilities],
            }),
            returnRoutes: true,
            defaultTargetFacilityCount: 10,
          })
        )
        .then((response) => {
          console.log('closest facility:', response);
        });
    });
  }
}
