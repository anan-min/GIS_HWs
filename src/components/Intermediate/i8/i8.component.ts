import { Component } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { AfterViewInit } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import { SimpleMarkerSymbol } from '@arcgis/core/symbols';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-i8',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './i8.component.html',
  styleUrls: ['./i8.component.css'],
})
export class I8Component implements AfterViewInit {
  private mapView!: MapView;
  public isAddingUser = false;
  public isEditingUser = false;

  public lattitude: number = 0;
  public longitude: number = 0;

  public users: any[] = [];

  public userForm = new FormGroup({
    name: new FormControl('นัท'),
    surname: new FormControl('อนันต์'),
    gender: new FormControl('ชาย'),
    mobile: new FormControl('0888605503'),
  });

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

    this.lattitude = -117.1611;
    this.longitude = 32.7157;

    this.mapView.when(() => {
      console.log('Map view is ready!');
      this.markPoint(this.mapView.center);
      this.mapView.on('click', (event) => {
        this.handleMapClick(event);
      });
    });
  }

  handleMapClick(event: any): void {
    const clickedPoint = event.mapPoint;
    this.lattitude = clickedPoint.latitude;
    this.longitude = clickedPoint.longitude;
    console.log('You clicked at: Latitude = ' + this.lattitude);
    console.log('You clicked at: Longitude = ' + this.longitude);

    this.markPoint(clickedPoint);
  }

  markPoint(location: any): void {
    this.mapView.graphics.removeAll();
    const marker = new Graphic({
      geometry: location,
      symbol: new SimpleMarkerSymbol({
        color: [218, 156, 115, 0.7],
        size: 5,
        style: 'circle',
      }),
      attributes: {
        Name: `test`,
      },
    });
    this.mapView.graphics.add(marker);
  }

  onClearFormClick(): void {}
  onUserEditClick(user: any): void {}
  onAddUserClick(): void {}
  onSaveFormClick(): void {}
}
