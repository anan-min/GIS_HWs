import { Component } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { AfterViewInit } from '@angular/core';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine.js';
import Graphic from '@arcgis/core/Graphic';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import { SimpleMarkerSymbol } from '@arcgis/core/symbols';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import * as closestFacility from '@arcgis/core/rest/closestFacility';
import ClosestFacilityParameters from '@arcgis/core/rest/support/ClosestFacilityParameters';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-i2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './i2.component.html',
  styleUrls: ['./i2.component.css'],
})
export class I2Component implements AfterViewInit {
  private mapView!: MapView;
  public closestFacilities: any[] = [];
  public selectedFacility: any = null;

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
        color: [218, 156, 115, 0.7],
        size: 5,
        style: 'square',
      }),
      attributes: {
        Name: '',
      },
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

    // use candidate facilities to find the closest one
    featureLayer.queryFeatures(query).then((result) => {
      const facilities = result.features;
      console.log('facilities:', facilities);
      console.log('number of facilities:', facilities.length);
      this.markFacilities(facilities);

      const updatedFacilities = facilities.map((feature) => {
        return new Graphic({
          geometry: feature.geometry,
          attributes: {
            Name: feature.attributes?.areaname || 'Unknown City',
          },
        });
      });

      closestFacility
        .solve(
          'https://sampleserver6.arcgisonline.com/arcgis/rest/services/NetworkAnalysis/SanDiego/NAServer/ClosestFacility',
          new ClosestFacilityParameters({
            incidents: new FeatureSet({
              features: [incidentGraphic],
            }),
            facilities: new FeatureSet({
              features: [...updatedFacilities],
            }),
            returnRoutes: true,
            defaultTargetFacilityCount: 10,
          })
        )
        .then((response) => {
          const routes = response.routes;
          if (routes) {
            this.updateClosestFacilities(routes);
            console.log('Closest Facilities:', this.closestFacilities);
            this.addRoutesToMap(routes);
          }
        });
    });
  }

  markFacilities(facilities: Graphic[]): void {
    facilities.forEach((facility) => {
      facility.symbol = new SimpleMarkerSymbol({
        color: [98, 69, 52, 1],
        size: 5,
        style: 'circle',
      });
      this.mapView.graphics.add(facility);
    });
  }

  updateClosestFacilities(routes: FeatureSet): void {
    this.closestFacilities = routes.features.map((route) => {
      const rawName = route.attributes.Name || '';
      const nameParts = rawName.split(' - ');
      const cityName = nameParts.length > 1 ? nameParts[1] : rawName;

      return {
        name: cityName,
        totalTime: route.attributes.Total_TravelTime,
        geometry: route.geometry,
      };
    });
  }

  addRoutesToMap(routes: FeatureSet): void {
    routes.features.forEach((route) => {
      const routeGraphic = new Graphic({
        geometry: route.geometry,
        symbol: new SimpleLineSymbol({
          color: [138, 98, 73, 0.5],
          width: 2,
        }),
      });
      this.mapView.graphics.add(routeGraphic);
    });
  }

  highlightRoute(facility: any): void {
    this.selectedFacility = facility;

    this.mapView.graphics.removeMany(
      this.mapView.graphics.filter((g) => g.attributes?.type === 'highlight')
    );

    const highlightGraphic = new Graphic({
      geometry: facility.geometry,
      symbol: {
        type: 'simple-line',
        color: [130, 100, 140, 0.7],
        width: 5,
      },
      attributes: {
        type: 'highlight',
      },
    });

    this.mapView.graphics.add(highlightGraphic);

    const extent = facility.geometry.extent;
    this.mapView.goTo(extent.expand(1.2)); // add some padding
  }
}
