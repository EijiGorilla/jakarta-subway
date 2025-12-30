import { use, useEffect, useState, useRef } from 'react';
import '../index.css';
import '../App.css';
import '@arcgis/map-components/dist/components/arcgis-map';
import '@arcgis/map-components/dist/components/arcgis-scene';
import '@arcgis/map-components/dist/components/arcgis-zoom';
import '@arcgis/map-components/dist/components/arcgis-legend';
import '@arcgis/map-components/dist/components/arcgis-basemap-gallery';
import '@arcgis/map-components/dist/components/arcgis-layer-list';
import '@arcgis/map-components/dist/components/arcgis-expand';
import '@arcgis/map-components/dist/components/arcgis-placement';
import '@arcgis/map-components/dist/components/arcgis-search';
import '@arcgis/map-components/dist/components/arcgis-compass';
import {
  admin_boundary_groupLayer,
  alingment_line_layer,
  admin_boundary_kabupaten,
  overview_alingment_line_layer,
  sar_points_layer_tile,
  displacement_groupLayer,
  sar_elevation_layer,
} from '../layers';
import '@esri/calcite-components/dist/components/calcite-button';
import { initialViewpoint, object_id } from '../uniqueValues';
import { MyContext } from '../contexts/MyContext';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import * as promiseUtils from '@arcgis/core/core/promiseUtils';
import Extent from '@arcgis/core/geometry/Extent';
import '@esri/calcite-components/dist/components/calcite-button';
import { CalciteButton } from '@esri/calcite-components-react';
import Viewpoint from '@arcgis/core/Viewpoint';
import { disableZooming, OverviewExtentsetup } from '../Query';
import * as intersectionOperator from '@arcgis/core/geometry/operators/intersectionOperator';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import Graphic from '@arcgis/core/Graphic';
import { SimpleFillSymbol } from '@arcgis/core/symbols';
import Ground from '@arcgis/core/Ground';
import '@arcgis/map-components/dist/components/arcgis-elevation-profile';

// 2 D <-> 3D
// https://developers.arcgis.com/javascript/latest/sample-code/views-switch-2d-3d/

export default function MapDisplay() {
  const { updateViewchange, viewpoint, is3D } = use(MyContext);
  const [mapView, setMapView] = useState();
  const [mapOverview, setMapOverview] = useState();

  const arcgisMap = document.querySelector(is3D === false ? 'arcgis-map' : 'arcgis-scene');
  const arcgisOverviewMap = document.querySelector(
    is3D === false ? '#arcgis-overview-map' : '#arcgis-overview-scene',
  );
  const arcgisElevationProfile = document.querySelector('arcgis-elevation-profile');

  useEffect(() => {
    const arcgisMap = document.querySelector(is3D === false ? 'arcgis-map' : 'arcgis-scene');
    const arcgisOverviewMap = document.querySelector(
      is3D === false ? '#arcgis-overview-map' : '#arcgis-overview-scene',
    );
    const arcgisElevationProfile = document.querySelector('arcgis-elevation-profile');
    if (mapView) {
      arcgisMap.map.add(sar_points_layer_tile);
      arcgisMap.map.add(admin_boundary_groupLayer);
      arcgisMap.map.add(displacement_groupLayer);
      arcgisMap.map.add(alingment_line_layer);
      arcgisMap.view.ui.components = [];
      arcgisMap.map.ground.navigationConstraint = 'none';
      arcgisMap.map.ground.opacity = 0.7;

      arcgisMap?.viewOnReady(async () => {
        arcgisOverviewMap.map.add(overview_alingment_line_layer);
        await arcgisOverviewMap.viewOnReady();
        disableZooming(arcgisOverviewMap.view);
        OverviewExtentsetup(arcgisMap, arcgisOverviewMap);
      });
    }

    if (is3D) {
      arcgisMap?.map.ground.layers.add(sar_elevation_layer);
      arcgisMap.map.remove(displacement_groupLayer);
      arcgisMap.map.add(alingment_line_layer);
    }
  }, [mapView]);

  return (
    <>
      {is3D ? (
        <arcgis-scene
          basemap="dark-gray-vector"
          viewingMode="local"
          //ground="world-elevation"  For elevation profile, remove this.
          viewpoint={viewpoint}
          onarcgisViewReadyChange={(event) => {
            setMapView(event.target);
          }}
        >
          <arcgis-elevation-profile slot="bottom-right"></arcgis-elevation-profile>
          <arcgis-map
            style={{
              position: 'fixed',
              zIndex: '1',
              width: '135px',
              height: '160px',
              borderStyle: 'solid',
              borderColor: 'grey',
              borderWidth: '1px',
              overflow: 'hidden',
              top: '10px',
              right: '10px',
            }}
            id="arcgis-overview-scene"
            basemap="dark-gray-vector" //{customBasemap}
            ground="world-elevation"
            zoom="9"
            center="106.8244387, -6.209296499999998"
          ></arcgis-map>
        </arcgis-scene>
      ) : (
        <arcgis-map
          basemap="dark-gray-vector"
          ground="world-elevation"
          viewpoint={viewpoint}
          onarcgisViewReadyChange={(event) => {
            setMapView(event.target);
          }}
        >
          {/* Overview Map */}
          <arcgis-map
            style={{
              position: 'fixed',
              zIndex: '1',
              width: '135px',
              height: '160px',
              borderStyle: 'solid',
              borderColor: 'grey',
              borderWidth: '1px',
              overflow: 'hidden',
              top: '10px',
              right: '10px',
            }}
            id="arcgis-overview-map"
            basemap="dark-gray-vector" //{customBasemap}
            ground="world-elevation"
            zoom="9"
            center="106.8244387, -6.209296499999998"
          ></arcgis-map>
        </arcgis-map>
      )}
    </>
  );
}
