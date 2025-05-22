import { Component } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { AfterViewInit } from '@angular/core';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine.js';
import Graphic from '@arcgis/core/Graphic';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

@Component({
  selector: 'app-i4',
  standalone: true,
  imports: [],
  templateUrl: './i4.component.html',
  styleUrls: ['./i4.component.css'],
})
export class I4Component implements AfterViewInit {
  private mapView!: MapView;
  private featureLayer!: FeatureLayer;

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

    this.featureLayer = featureLayer;
    map.add(featureLayer);

    this.mapView = new MapView({
      container: 'mapViewDiv',
      map: map,
      center: [-122.4194, 37.7749], // San Francisco
      zoom: 10,
    });

    this.mapView.when(() => {
      console.log('Map view is ready!');
      this.mapView.on('click', (event) => {
        this.handleMapClick(event);
      });
    });
  }

  handleMapClick(event: any): void {
    const clickedPoint = event.mapPoint;
    const bufferRadius = 20000; // 20 km

    const buffer = geometryEngine.buffer(clickedPoint, bufferRadius, 'meters');
    const singleBuffer = Array.isArray(buffer) ? buffer[0] : buffer;

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

    this.mapView.graphics.add(bufferGraphic);
  }

  
}
