import { Component } from '@angular/core';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import TileLayer from '@arcgis/core/layers/TileLayer';
import BaseMap from '@arcgis/core/Basemap';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { AfterViewInit } from '@angular/core';
import Sketch from '@arcgis/core/widgets/Sketch';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
import Graphic from '@arcgis/core/Graphic';

@Component({
  selector: 'app-i3',
  templateUrl: './i3.component.html',
  styleUrls: ['./i3.component.css'],
})
export class I3Component implements AfterViewInit {
  private objectId: number | null = null;

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
      // Ensure the feature layer is editable (checking for proper permissions)
      editingEnabled: true,
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
      creationMode: 'update',
      availableCreateTools: ['polygon'],
    });

    sketchWidget.on('create', (event) => {
      if (event.state === 'complete') {
        const newFeature = event.graphic;
        this.applyEditsOnCreate(featureLayer, newFeature);
      }
    });

    sketchWidget.on('update', (event) => {
      if (event.state === 'start') {
        // When update starts, perform a spatial query to get the objectId based on the geometry
        const geometry = event.graphics[0].geometry;
        this.queryObjectId(featureLayer, geometry);
      } else if (event.state === 'complete') {
        const updatedFeature = event.graphics[0];
        this.applyEditsOnUpdate(featureLayer, updatedFeature);
      }
    });

    sketchWidget.on('delete', (event) => {
      if (this.objectId !== null) {
        this.applyEditsOnDelete(featureLayer);
      }
    });

    mapView.ui.add(sketchWidget, 'top-right');
  }

  queryObjectId(featureLayer: FeatureLayer, geometry: any): void {
    const query = featureLayer.createQuery();
    query.geometry = geometry;
    query.spatialRelationship = 'intersects';
    query.outFields = ['objectid'];
    query.returnGeometry = false;
    featureLayer
      .queryFeatures(query)
      .then((response) => {
        if (response.features.length > 0) {
          this.objectId = response.features[0].attributes.objectid;
          console.log('Found objectId:', this.objectId);
        } else {
          console.log('No features found for the selected geometry.');
        }
      })
      .catch((error) => {
        console.error('Error executing spatial query:', error);
      });
  }

  // Function to apply edits and add attributes to the feature
  applyEditsOnCreate(featureLayer: FeatureLayer, newFeature: any): void {
    const symbolid = 0; // Set symbolid (can be 0, 1, 2, or 3)

    // Define the symbol for the polygon
    const symbol = new SimpleFillSymbol({
      color: [0, 0, 255, 0.3], // Blue with 30% transparency
      outline: {
        color: [0, 0, 255], // Blue outline
        width: 1,
      },
    });

    // Get the current time to generate description dynamically
    const currentTime = new Date();
    const description = `Feature added at ${currentTime.toLocaleString()}`;

    // Set the symbol and attributes to the graphic
    newFeature.symbol = symbol;
    newFeature.attributes = {
      symbolid: symbolid, // Assign the symbolid attribute
      description: description, // Assign dynamic description
    };

    // Prepare the graphic for applyEdits (adding a new feature)
    const addFeature = new Graphic({
      geometry: newFeature.geometry,
      symbol: newFeature.symbol,
      attributes: newFeature.attributes,
    });

    // Use applyEdits to add the new feature to the FeatureLayer
    featureLayer
      .applyEdits({
        addFeatures: [addFeature], // Add the new polygon feature
      })
      .then((editResponse) => {
        console.log('Successfully added the feature:', editResponse);
      })
      .catch((error) => {
        console.error('Error adding the feature:', error);
      });
  }

  applyEditsOnUpdate(featureLayer: FeatureLayer, updatedFeature: any): void {
    if (this.objectId !== null) {
      const updatedGraphic = new Graphic({
        geometry: updatedFeature.geometry,
        attributes: {
          objectid: this.objectId, // Update with the stored objectId
        },
      });

      featureLayer
        .applyEdits({
          updateFeatures: [updatedGraphic], // Update the existing feature with new geometry
        })
        .then((editResponse) => {
          console.log('Successfully updated the feature:', editResponse);
        })
        .catch((error) => {
          console.error('Error updating the feature:', error);
        });
    }
  }

  applyEditsOnDelete(featureLayer: FeatureLayer): void {
    if (this.objectId !== null) {
      const deleteFeature = {
        objectId: this.objectId,
      };

      featureLayer
        .applyEdits({
          deleteFeatures: [deleteFeature], // Delete the feature using the stored objectId
        })
        .then((editResponse) => {
          console.log('Successfully deleted the feature:', editResponse);
        })
        .catch((error) => {
          console.error('Error deleting the feature:', error);
        });
    }
  }
}
