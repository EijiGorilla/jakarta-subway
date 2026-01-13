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
  highlightPointHoverGrapchicsLayer,
} from "../layers";
import "@esri/calcite-components/dist/components/calcite-button";
import { MyContext } from "../contexts/MyContext";
import "@esri/calcite-components/dist/components/calcite-button";
import "@arcgis/map-components/components/arcgis-elevation-profile";
import Ground from "@arcgis/core/Ground";
import Graphic from "@arcgis/core/Graphic";
import { SimpleFillSymbol } from "@arcgis/core/symbols";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import * as promiseUtils from "@arcgis/core/core/promiseUtils";
import * as intersectionOperator from "@arcgis/core/geometry/operators/intersectionOperator";
import { webmercatorExtent } from "../Query";
import Extent from "@arcgis/core/geometry/Extent";
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

  // console.log(is3D);
  const [newCenter, setNewCenter] = useState();

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

  function overviewMapViewEnvironment() {
    arcgisOverviewMap.constraints.rotationEnabled = false;
    arcgisOverviewMap.view.ui.components = [];
  }

  useEffect(() => {
    if (mapView) {
      arcgisMap?.map?.add(highlightPointHoverGrapchicsLayer);
      arcgisMap && mapViewEnvironment();
      arcgisOverviewMap && overviewMapViewEnvironment();

      if (arcgisMap) {
        arcgisMap.highlights = [
          { name: "default", color: "cyan" },
          { name: "temporary", color: "magenta" },
          { name: "custom", color: "yellow" },
        ];
      }

      if (mapView.id === "arcgis-map-id") {
        // Remove layers
        arcgisMap?.map?.remove(displacement_grouLayer_magnitude);

        // Add layers
        arcgisMap?.map?.add(sar_points_layer_tile);
        arcgisMap?.map?.add(admin_boundary_groupLayer);
        arcgisMap?.map?.add(displacement_groupLayer);
        arcgisMap?.map?.add(alingment_line_layer);
        arcgisOverviewMap?.map.add(overview_alingment_line_layer);
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
    const visibleAreaDebouncer = promiseUtils.debounce(async () => {
      // if (arcgisMap?.stationary) { // Adding this fails in 2D.
      // const intersection = intersectionOperator.execute(
      //   webmercatorExtent,
      //   arcgisMap?.visibleArea
      // );

      const xmax_va = arcgisMap?.visibleArea?.extent.xmax;
      const xmin_va = arcgisMap?.visibleArea?.extent.xmin;
      const ymin_va = arcgisMap?.visibleArea?.extent.ymin;
      const ymax_va = arcgisMap?.visibleArea?.extent.ymax;

      // when each point is expanded to 100m at 45 degrees, we get 70.71m (trigonometry)
      const new_scale = Math.sin((45 * Math.PI) / 180) * 100;

      const new_extent = new Extent({
        xmin: xmin_va - new_scale,
        ymin: ymin_va - new_scale,
        xmax: xmax_va + new_scale,
        ymax: ymax_va + new_scale,
        spatialReference: {
          // Ensure the spatial reference matches the view's or is well-defined (e.g., WGS84 - wkid: 4326, or Web Mercator - wkid: 3857/102100)
          wkid: 102100,
        },
      });
      await arcgisOverviewMap?.view?.goTo(new_extent);
      // await arcgisOverviewMap?.view?.goTo(intersection);
      // }
    });

    arcgisMap?.viewOnReady(async () => {
      await arcgisOverviewMap?.viewOnReady();
      const visibleAreaGraphic = new Graphic({
        geometry: null,
        symbol: new SimpleFillSymbol({
          color: null,
          outline: {
            width: 2,
            color: "#d9dc00ff",
          },
        }),
      });
      arcgisOverviewMap?.graphics.add(visibleAreaGraphic);

      reactiveUtils.watch(
        () => arcgisMap.visibleArea,
        async (visibleArea) => {
          try {
            await visibleAreaDebouncer();
            visibleAreaGraphic.geometry = visibleArea;
          } catch (error) {
            if (error.name === "AbortError") {
              return;
            }
            console.error("Error updating visible area graphic: ", error);
          }
        }
      );
    });
  }, [arcgisMap]);

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
          <arcgis-map
            style={{
              position: "fixed",
              zIndex: "1",
              width: "170px",
              height: "190px",
              borderStyle: "solid",
              borderColor: "grey",
              borderWidth: "1px",
              overflow: "hidden",
              top: "10px",
              right: "10px",
            }}
            id="arcgis-overview-scene"
            basemap="dark-gray-vector" //{customBasemap}
            // ground="world-elevation"
            // zoom="9"
            // center="106.8244387, -6.209296499999998"
          ></arcgis-map>
        </arcgis-scene>
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
        >
          {/* Overview Map */}
          <arcgis-map
            style={{
              position: "fixed",
              zIndex: "1",
              width: "170px",
              height: "190px",
              borderStyle: "solid",
              borderColor: "grey",
              borderWidth: "1px",
              overflow: "hidden",
              top: "10px",
              right: "10px",
            }}
            id="arcgis-overview-map"
            basemap="dark-gray-vector" //{customBasemap}
            zoom="13"
            center={newCenter}
            // center="106.8244387, -6.209296499999998"
          ></arcgis-map>
        </arcgis-map>
      )}
    </>
  );
}
