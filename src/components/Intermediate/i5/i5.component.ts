import { Component } from '@angular/core';
import LayerList from '@arcgis/core/widgets/LayerList';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { AfterViewInit } from '@angular/core';
import GroupLayer from '@arcgis/core/layers/GroupLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';

@Component({
  selector: 'app-i5',
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
export class I5Component implements AfterViewInit {
  ngAfterViewInit(): void {
    this.initializeMap();
  }

  initializeMap(): void {
    const map = new Map({});

    const oceanBaseLayer = new TileLayer({
      url: 'https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer',
    });

    const censusBlockPointLayer = new FeatureLayer({
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/0',
    });

    const censusBlockGroupLayer = new FeatureLayer({
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/1',
    });

    const detailedCountiesLayer = new FeatureLayer({
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/2',
    });

    const stateLayer = new FeatureLayer({
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3',
    });

    const censusGroupLayer = new GroupLayer({
      title: 'Census Layers',
      layers: [
        censusBlockPointLayer,
        censusBlockGroupLayer,
        detailedCountiesLayer,
        stateLayer,
      ],
    });

    map.add(oceanBaseLayer);
    map.add(censusGroupLayer);

    const mapView = new MapView({
      container: 'mapViewDiv',
      map: map,
      center: [-118.805, 34.027],
      zoom: 6,
      constraints: {
        minZoom: 5,
        maxZoom: 10,
      },
    });

    const layerList = new LayerList({
      view: mapView,
    });
    mapView.ui.add(layerList, 'top-right');

    mapView.when(() => {
      console.log('Map loaded');
      mapView.goTo({
        target: [-118.805, 34.027],
        zoom: 6,
      });
    });
  }
}
