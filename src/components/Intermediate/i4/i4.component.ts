import { Attribute, Component } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { AfterViewInit } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import { SimpleMarkerSymbol } from '@arcgis/core/symbols';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import { CommonModule } from '@angular/common';

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
      zoom: 10,
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
      this.locationList.push(clickedPoint);
      this.markPoint(clickedPoint, false);
      console.log(this.locationList);
    }
  }

  markPoint(location: any, isFirst: boolean): void {
    let style: 'circle' | 'square' = isFirst ? 'square' : 'circle';

    const marker = new Graphic({
      geometry: location,
      symbol: new SimpleMarkerSymbol({
        color: [218, 156, 115, 0.7],
        size: 5,
        style: style,
      }),
      attributes: {
        Name: '',
      },
    });
    this.mapView.graphics.add(marker);
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
}
