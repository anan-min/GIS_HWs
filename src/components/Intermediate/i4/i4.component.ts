import { Component } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { AfterViewInit } from '@angular/core';
import Draw from '@arcgis/core/views/draw/Draw';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

@Component({
  selector: 'app-i4',
  imports: [],
  template: `
    <div class="map-container">
      <div id="mapViewDiv"></div>
    </div>
  `,
  styles: [
    `
      .map-container {
        display: flex;
        height: 100vh; /* Full height of the viewport */
        width: 100%;
      }

      #mapViewDiv {
        flex: 1; /* Map takes up remaining space */
        height: 100%;
      }
    `,
  ],
})
export class I4Component implements AfterViewInit {
  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    const map = new Map({
      basemap: 'streets-navigation-vector',
    });

    const mapView = new MapView({
      container: 'mapViewDiv',
      map: map,
      center: [-118.805, 34.027],
      zoom: 6,
    });

    mapView.on('click', (event) => {
      this.onMapClick(event, mapView);
    });

    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    const draw = new Draw({
      view: mapView,
    });
  }

  onMapClick(event: any, mapView: MapView): void {
    console.log('Map clicked at:', event.mapPoint);
    console.log('Map clicked at:', event.mapPoint);
  }

  markPoint(draw: Draw, mapPoint: any): void {
    const markAction = draw.create('point');
    
  }
}
