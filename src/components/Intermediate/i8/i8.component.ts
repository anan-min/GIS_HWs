import { Component } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { AfterViewInit, OnInit } from '@angular/core';
import Graphic from '@arcgis/core/Graphic';
import { SimpleMarkerSymbol } from '@arcgis/core/symbols';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import Point from '@arcgis/core/geometry/Point';

@Component({
  selector: 'app-i8',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './i8.component.html',
  styleUrls: ['./i8.component.css'],
})
export class I8Component implements AfterViewInit, OnInit {
  private mapView!: MapView;
  public isAddingUser = true;
  public isEditingUser = false;
  public lattitude: number = 0;
  public longitude: number = 0;
  private currentUser: any = null;
  public users: any[] = [
    {
      name: 'สมชาย1',
      surname: 'ศรีประเสริฐ',
      gender: 'M',
      mobile: '0912345678',
      lattitude: 13.7563, // Latitude for Bangkok
      longitude: 100.5018, // Longitude for Bangkok
    },
    {
      name: 'สมชาย2',
      surname: 'ศรีประเสริฐ',
      gender: 'F',
      mobile: '0912345679',
      lattitude: 14.5995, // Latitude for Chiang Mai
      longitude: 98.6793, // Longitude for Chiang Mai
    },
    {
      name: 'สมชาย3',
      surname: 'ศรีประเสริฐ',
      gender: 'M',
      mobile: '0912345680',
      lattitude: 15.87, // Latitude for Krabi
      longitude: 98.293, // Longitude for Krabi
    },
  ];
  public filteredUsers: any[] = [];
  public searchForm = new FormGroup({
    search: new FormControl(''),
  });
  public userForm = new FormGroup({
    name: new FormControl('Jane', [
      Validators.required, // Name is required
      Validators.minLength(2), // Name should be at least 2 characters
    ]),
    surname: new FormControl('Doe', [
      Validators.required, // Surname is required
      Validators.minLength(2), // Surname should be at least 2 characters
    ]),
    gender: new FormControl('M', [
      Validators.required, // Gender is required
      Validators.pattern('^(M|F)$'), // Gender must be 'M' or 'F'
    ]),
    mobile: new FormControl('0000000000', [
      Validators.required, // Mobile is required
      Validators.pattern('^0[0-9]{9}$'), // Mobile must be 10 digits starting with 0
    ]),
  });

  ngOnInit(): void {
    this.filteredUsers = [...this.users];
    this.searchForm.get('search')?.valueChanges.subscribe((text) => {
      this.filterUsers(text || '');
    });
  }

  filterUsers(text: string): void {
    this.filteredUsers = this.users.filter((user) => {
      return (
        user.name.toLowerCase().includes(text.toLowerCase()) ||
        user.surname.toLowerCase().includes(text.toLowerCase())
      );
    });
  }

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

  onClearFormClick(): void {
    this.resetUserForm();
    this.isAddingUser = true;
    this.isEditingUser = false;
  }

  onUserEditClick(user: any): void {
    this.currentUser = user;
    this.isEditingUser = true;
    this.isAddingUser = false;
    this.userForm.patchValue({
      name: user.name,
      surname: user.surname,
      gender: user.gender,
      mobile: user.mobile,
    });
    this.goToUserLocation(user);
  }

  onAddUserClick(): void {
    this.isAddingUser = true;
    this.isEditingUser = false;
    this.resetUserForm();
    const defaultLocation = new Point({
      latitude: 13.7563,
      longitude: 100.5018,
    });
    this.mapView.goTo(defaultLocation);
    this.markPoint(defaultLocation);
  }
  onSaveFormClick(): void {
    this.currentUser = {
      name: this.userForm.value.name,
      surname: this.userForm.value.surname,
      gender: this.userForm.value.gender,
      mobile: this.userForm.value.mobile,
      lattitude: this.lattitude,
      longitude: this.longitude,
    };
    console.log(this.currentUser);
    this.resetUserForm();
    this.isAddingUser = true;
    this.isEditingUser = false;
  }

  goToUserLocation(user: any): void {
    const location = new Point({
      latitude: user.lattitude,
      longitude: user.longitude,
    });

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

    this.mapView.graphics.removeAll();
    this.mapView.graphics.add(marker);
    this.mapView.goTo(location);
  }

  resetUserForm(): void {
    this.userForm.reset();
    this.userForm.patchValue({
      name: 'Jane',
      surname: 'Doe',
      gender: 'M',
      mobile: '0000000000',
    });
  }
}
