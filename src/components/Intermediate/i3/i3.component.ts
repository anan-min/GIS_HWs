import { Component } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import TileLayer from '@arcgis/core/layers/TileLayer';
import BaseMap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { AfterViewInit } from '@angular/core';
import Sketch from '@arcgis/core/widgets/Sketch';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';

@Component({
  selector: 'app-i3',
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
export class I3Component implements AfterViewInit {
  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    const map = new Map({
      basemap: new BaseMap({
        baseLayers: [
          new TileLayer({
            url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer',
          }),
        ],
      }),
    });

    const featureLayer = new FeatureLayer({
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/FeatureServer/2',
    });

    const graphicsLayer = new GraphicsLayer();

    map.add(featureLayer);
    map.add(graphicsLayer);

    const mapView = new MapView({
      container: 'mapViewDiv',
      map: map,
      center: [-118.805, 34.027],
      zoom: 6,
    });

    const sketchWidget = new Sketch({
      view: mapView,
      layer: graphicsLayer,
      creationMode: "update", 
      
    });



    mapView.ui.add(sketchWidget, 'top-right');
  }
}
