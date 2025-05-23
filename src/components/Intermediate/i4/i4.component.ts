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
  public directions: any[] = [];
  public highlightedDirection: any = null;

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
    if (response.routeResults && response.routeResults.length > 0) {
      const routeResult = response.routeResults[0];

      const polylineGeometry = routeResult.route.geometry;

      const lineSymbol = new SimpleLineSymbol({
        color: [138, 98, 73, 0.5], // Blue line color
        width: 2, // Line width
      });

      const routeGraphic = new Graphic({
        geometry: polylineGeometry,
        symbol: lineSymbol,
      });

      this.mapView.graphics.add(routeGraphic);

      this.directions = routeResult.directions?.features.map(
        (direction: any) => {
          return {
            text: direction.attributes.text,
            geometry: direction.geometry,
          };
        }
      );
    }
  }

  highlightDirection(direction: any): void {
    this.highlightedDirection = direction;

    this.mapView.graphics.removeMany(
      this.mapView.graphics.filter((g) => g.attributes?.type === 'highlight')
    );

    const highlightGraphic = new Graphic({
      geometry: direction.geometry,
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
    const extent = direction.geometry.extent;
    const expandFactor =
      extent.width < 0.01 && extent.height < 0.01 ? 1.1 : 1.2;
    this.mapView.goTo(extent.expand(expandFactor), { animate: true });
  }
}
