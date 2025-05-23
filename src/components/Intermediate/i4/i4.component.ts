import { Component } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { AfterViewInit } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import { SimpleMarkerSymbol } from '@arcgis/core/symbols';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import { CommonModule } from '@angular/common';
import * as route from '@arcgis/core/rest/route';
import RouteParameters from '@arcgis/core/rest/support/RouteParameters.js';

@Component({
  selector: 'app-i2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './i4.component.html',
  styleUrls: ['./i4.component.css'],
})
export class I4Component implements AfterViewInit {
  private mapView!: MapView;
  private StartLocation: any = null;
  private locationList: any[] = [];
  private isStart = false;

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    const map = new Map({
      basemap: 'streets',
    });

    this.mapView = new MapView({
      container: 'mapViewDiv',
      map: map,
      center: [-117.1611, 32.7157],
      zoom: 13,
    });

    this.mapView.when(() => {
      console.log('Map view is ready!');
      this.mapView.on('click', (event) => {
        if (this.isStart) {
          this.handleMapClick(event);
        }
      });
    });
  }

  handleMapClick(event: any): void {
    const clickedPoint = event.mapPoint;

    if (this.StartLocation === null) {
      this.StartLocation = clickedPoint;
      this.markPoint(clickedPoint, true);
    } else {
      this.markPoint(clickedPoint, false);
    }

    if (this.locationList.length > 1) {
      this.requestRoute();
    }
  }

  markPoint(location: any, isFirst: boolean): void {
    let style: 'circle' | 'square' = isFirst ? 'square' : 'circle';
    console.log('location', location);

    const marker = new Graphic({
      geometry: location,
      symbol: new SimpleMarkerSymbol({
        color: [218, 156, 115, 0.7],
        size: 5,
        style: style,
      }),
      attributes: {
        Name: `Location ${this.locationList.length + 1}`,
      },
    });
    this.mapView.graphics.add(marker);
    this.locationList.push(marker);
  }

  handleClearAllClick(): void {
    this.StartLocation = null;
    this.locationList = [];
    this.mapView.graphics.removeAll();
    this.isStart = false;
  }

  handleStartClick(): void {
    this.isStart = true;
  }

  requestRoute(): void {
    const routeParams = new RouteParameters({
      stops: new FeatureSet({
        features: [...this.locationList],
      }),
      returnDirections: true,
    });

    route
      .solve(
        'https://sampleserver6.arcgisonline.com/arcgis/rest/services/NetworkAnalysis/SanDiego/NAServer/Route',
        routeParams
      )
      .then((response) => {
        this.renderRoutes(response);
      })
      .catch((error) => {
        console.error('Error solving the route:', error);
      });
  }

  renderRoutes(response: any): void {
    // Check if the route was found and contains directions and geometry
    if (response.routeResults && response.routeResults.length > 0) {
      const routeResult = response.routeResults[0];

      // Get the polyline geometry from the route result
      const polylineGeometry = routeResult.route.geometry;

      // Create a SimpleLineSymbol to style the route line
      const lineSymbol = new SimpleLineSymbol({
        color: [0, 0, 255], // Blue line color
        width: 4, // Line width
      });

      // Create a graphic with the polyline geometry and the line symbol
      const routeGraphic = new Graphic({
        geometry: polylineGeometry,
        symbol: lineSymbol,
      });

      // Add the graphic to the map
      this.mapView.graphics.add(routeGraphic);

      // Optionally, log the directions if needed
      console.log('Directions:', routeResult.directions?.features);
    }
  }
}
