import { Component } from '@angular/core';
import LayerList from '@arcgis/core/widgets/LayerList';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import { AfterViewInit } from '@angular/core';
import Swipe from '@arcgis/core/widgets/Swipe';

@Component({
  selector: 'app-i6',
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
export class I6Component implements AfterViewInit {
  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    const map = new Map({});

    const oceanBaseLayer = new TileLayer({
      url: 'https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer',
    });

    const worldStreetLayer = new TileLayer({
      url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer',
    });

    map.add(oceanBaseLayer);
    map.add(worldStreetLayer);

    const mapView = new MapView({
      container: 'mapViewDiv',
      map: map,
      center: [-118.805, 34.027],
      zoom: 6,
    });

    const swipe = new Swipe({
      view: mapView,
      leadingLayers: [oceanBaseLayer],
      trailingLayers: [worldStreetLayer],
      direction: 'horizontal',
      position: 50,
    });

    mapView.ui.add(swipe);
  }
}
