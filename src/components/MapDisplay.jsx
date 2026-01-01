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
  fishnet_3d_layer,
} from "../layers";
import "@esri/calcite-components/dist/components/calcite-button";
import { MyContext } from "../contexts/MyContext";
import "@esri/calcite-components/dist/components/calcite-button";
import { disableZooming, OverviewExtentsetup } from "../Query";
import "@arcgis/map-components/components/arcgis-elevation-profile";
import Ground from "@arcgis/core/Ground";

// 2 D <-> 3D
// https://developers.arcgis.com/javascript/latest/sample-code/views-switch-2d-3d/

export default function MapDisplay() {
  const { activewidget, viewpoint, is3D } = use(MyContext);
  const [mapView, setMapView] = useState();
  const [newGround, setNewGround] = useState();

  const arcgisMap = document.querySelector(
    is3D === false ? "arcgis-map" : "arcgis-scene"
  );
  const arcgisOverviewMap = document.querySelector(
    is3D === false ? "#arcgis-overview-map" : "#arcgis-overview-scene"
  );

  useEffect(() => {
    if (mapView) {
      if (mapView.id === "arcgis-map-id") {
        if (arcgisMap) {
          arcgisMap.view.ui.components = [];
          arcgisMap.map.ground.navigationConstraint = "none";
          arcgisMap.map.ground.opacity = 0.7;
        }

        // Remove layers
        arcgisMap?.map?.remove(fishnet_3d_layer);

        // Add layers
        arcgisMap?.map?.add(sar_points_layer_tile);
        arcgisMap?.map?.add(admin_boundary_groupLayer);
        arcgisMap?.map?.add(displacement_groupLayer);
        arcgisMap?.map?.add(alingment_line_layer);
        arcgisOverviewMap?.map.add(overview_alingment_line_layer);

        // Overview map
        arcgisMap?.viewOnReady(async () => {
          await arcgisOverviewMap?.viewOnReady();
          disableZooming(arcgisOverviewMap?.view);
          OverviewExtentsetup(arcgisMap, arcgisOverviewMap);
        });
      } else {
        arcgisMap?.map?.remove(sar_points_layer_tile);
        arcgisMap?.map?.remove(displacement_groupLayer);
        arcgisMap?.map?.add(fishnet_3d_layer);
        arcgisMap?.map?.add(alingment_line_layer);
        arcgisOverviewMap?.map.add(overview_alingment_line_layer);
      }
    }
  }, [mapView, arcgisMap, arcgisOverviewMap]);

  useEffect(() => {
    // Add elevationProfileElement inside useEffect
    const elevationProfileElement = document.querySelector(
      "arcgis-elevation-profile"
    );

    // Ensure to use new Ground method
    if (activewidget === "elevation-profile" && elevationProfileElement) {
      // update ground in scene
      setNewGround(
        new Ground({
          layers: sar_elevation_layer,
        })
      );

      elevationProfileElement.profiles = [
        {
          type: "ground",
          title: "Displacement",
        },
      ];
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
        >
          {activewidget === "elevation-profile" && (
            <arcgis-elevation-profile
              slot="bottom-right"
              unit="millimeters"
            ></arcgis-elevation-profile>
          )}
          <arcgis-map
            style={{
              position: "fixed",
              zIndex: "1",
              width: "135px",
              height: "160px",
              borderStyle: "solid",
              borderColor: "grey",
              borderWidth: "1px",
              overflow: "hidden",
              top: "10px",
              right: "10px",
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
          id="arcgis-map-id"
          onarcgisViewReadyChange={(event) => {
            setMapView(event.target);
          }}
        >
          {/* Overview Map */}
          <arcgis-map
            style={{
              position: "fixed",
              zIndex: "1",
              width: "135px",
              height: "160px",
              borderStyle: "solid",
              borderColor: "grey",
              borderWidth: "1px",
              overflow: "hidden",
              top: "10px",
              right: "10px",
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
