import { use, useEffect, useState } from "react";
import "../index.css";
import "../App.css";
import "@arcgis/map-components/dist/components/arcgis-map";
import "@arcgis/map-components/dist/components/arcgis-scene";
import "@arcgis/map-components/dist/components/arcgis-zoom";
import "@arcgis/map-components/dist/components/arcgis-legend";
import "@arcgis/map-components/dist/components/arcgis-basemap-gallery";
import "@arcgis/map-components/dist/components/arcgis-layer-list";
import "@arcgis/map-components/dist/components/arcgis-expand";
import "@arcgis/map-components/dist/components/arcgis-placement";
import "@arcgis/map-components/dist/components/arcgis-search";
import "@arcgis/map-components/dist/components/arcgis-compass";
import {
  admin_boundary_groupLayer,
  alingment_line_layer,
  overview_alingment_line_layer,
  sar_points_layer_tile,
  displacement_groupLayer,
  sar_elevation_layer,
  displacement_grouLayer_magnitude,
} from "../layers";
import "@esri/calcite-components/dist/components/calcite-button";
import { MyContext } from "../contexts/MyContext";
import "@esri/calcite-components/dist/components/calcite-button";
import "@arcgis/map-components/components/arcgis-elevation-profile";
import Ground from "@arcgis/core/Ground";

// 2 D <-> 3D
// https://developers.arcgis.com/javascript/latest/sample-code/views-switch-2d-3d/

export default function MapDisplay() {
  const { activewidget, viewpoint, is3D } = use(MyContext);
  const [mapView, setMapView] = useState();
  const [newGround, setNewGround] = useState(
    new Ground({
      layers: sar_elevation_layer,
    })
  );

  const arcgisMap = document.querySelector(
    is3D === false ? "arcgis-map" : "arcgis-scene"
  );
  const arcgisOverviewMap = document.querySelector(
    is3D === false ? "#arcgis-overview-map" : "#arcgis-overview-scene"
  );

  function mapViewEnvironment() {
    arcgisMap.view.ui.components = [];
    arcgisMap.map.ground.navigationConstraint = "none";
    arcgisMap.map.ground.opacity = 0.7;
  }

  useEffect(() => {
    if (mapView) {
      arcgisMap && mapViewEnvironment();

      if (mapView.id === "arcgis-map-id") {
        // Remove layers
        arcgisMap?.map?.remove(displacement_grouLayer_magnitude);

        // Add layers
        arcgisMap?.map?.add(sar_points_layer_tile);
        arcgisMap?.map?.add(admin_boundary_groupLayer);
        arcgisMap?.map?.add(displacement_groupLayer);
        arcgisMap?.map?.add(alingment_line_layer);
        arcgisOverviewMap?.map.add(overview_alingment_line_layer);

        // Overview map
      } else {
        arcgisMap?.map?.remove(sar_points_layer_tile);
        arcgisMap?.map?.remove(displacement_groupLayer);
        arcgisMap?.map?.add(displacement_grouLayer_magnitude);
        arcgisMap?.map?.add(alingment_line_layer);

        arcgisOverviewMap?.map.add(overview_alingment_line_layer);
      }
    }
  }, [mapView, arcgisMap, arcgisOverviewMap]);

  useEffect(() => {
    const elevationProfileElement = document.querySelector(
      "arcgis-elevation-profile"
    );

    // Ensure to use new Ground method
    if (activewidget === "elevation-profile" && elevationProfileElement) {
      arcgisMap && mapViewEnvironment();
      elevationProfileElement.profiles = [
        {
          type: "ground",
          title: "Subsidence (raw scale)",
        },
      ];
    } else {
      arcgisMap && mapViewEnvironment();
    }
  }, [activewidget]);

  return (
    <>
      {is3D ? (
        <arcgis-scene
          basemap="dark-gray-vector"
          viewingMode="local"
          viewpoint={viewpoint}
          ground={
            activewidget === "elevation-profile" ? newGround : "world-elevation"
          }
          id="arcgis-scene-id"
          onarcgisViewReadyChange={(event) => {
            setMapView(event.target);
          }}
        ></arcgis-scene>
      ) : (
        <arcgis-map
          basemap="dark-gray-vector"
          ground={
            activewidget === "elevation-profile" ? newGround : "world-elevation"
          }
          viewpoint={viewpoint}
          id="arcgis-map-id"
          onarcgisViewReadyChange={(event) => {
            setMapView(event.target);
          }}
        ></arcgis-map>
      )}
    </>
  );
}
