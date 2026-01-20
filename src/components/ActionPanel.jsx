import { use, useEffect, useState } from "react";
import "../App.css";
import "../index.css";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-list-item";
import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "@esri/calcite-components/dist/components/calcite-action";
import "@esri/calcite-components/dist/components/calcite-action-bar";
import "@esri/calcite-components/dist/components/calcite-notice";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/dist/components/arcgis-compass";
import {
  CalciteShellPanel,
  CalciteActionBar,
  CalciteAction,
  CalcitePanel,
  CalciteNotice,
} from "@esri/calcite-components-react";
import {
  secondary_color,
  action_pane_title_font_size,
  margin_left_pane_title,
  margin_bottom_title_item,
  defineActions,
} from "../uniqueValues";
import DatePicker from "./DatePicker";
import MinMaxRecord from "./MinMaxRecord";
import { layerInfos_sar_hotspot } from "../layers";
import { MyContext } from "../contexts/MyContext";

function ActionPanel() {
  const { updateElevprofileready, updateActivewidget, viewchange, is3D } =
    use(MyContext);
  const arcgisMapLegend = document.querySelector("arcgis-legend");
  const [activeWidget, setActiveWidget] = useState(null);
  const [nextWidget, setNextWidget] = useState(null);

  useEffect(() => {
    setNextWidget("mainq");
  }, []);

  useEffect(() => {
    if (arcgisMapLegend) {
      arcgisMapLegend.layerInfos = layerInfos_sar_hotspot;

      arcgisMapLegend.hideLayersNotInCurrentView = false;
      arcgisMapLegend.respectLayerVisibilityDisabled = false;
    }
  });

  useEffect(() => {
    updateActivewidget(nextWidget);
    if (activeWidget) {
      const actionActiveWidget = document.querySelector(
        `[data-panel-id=${activeWidget}]`,
      );
      actionActiveWidget.hidden = true;
    }

    if (nextWidget !== activeWidget) {
      const actionNextWidget = document.querySelector(
        `[data-panel-id=${nextWidget}]`,
      );
      actionNextWidget.hidden = false;
    }

    updateElevprofileready(
      nextWidget === "elevation-profile" ? "ready" : undefined,
    );
  });

  return (
    <CalciteShellPanel
      // if width is not set to '1', the panel will not be closed when action widget is clicekd.
      width="1"
      slot="panel-start"
      position="start"
      id="left-shell-panel"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#888 #555",
      }}
    >
      <CalciteActionBar slot="action-bar">
        <CalciteAction
          data-action-id="mainq"
          icon="layers"
          text="main panel"
          id="mainq"
          //textEnabled={true}
          onClick={(event) => {
            setNextWidget(event.target.id);
            setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
          }}
        ></CalciteAction>

        <CalciteAction
          data-action-id="basemaps"
          icon="basemap"
          text="basemaps"
          id="basemaps"
          onClick={(event) => {
            setNextWidget(event.target.id);
            setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
          }}
        ></CalciteAction>

        {!is3D && (
          <CalciteAction
            data-action-id="elevation-profile"
            icon="graph-time-series"
            text="Displacement profile"
            id="elevation-profile"
            onClick={(event) => {
              setNextWidget(event.target.id);
              setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
            }}
          ></CalciteAction>
        )}

        <CalciteAction
          data-action-id="information"
          icon="information"
          text="Information"
          id="information"
          onClick={(event) => {
            setNextWidget(event.target.id);
            setActiveWidget(nextWidget === activeWidget ? null : nextWidget);
          }}
        ></CalciteAction>
      </CalciteActionBar>

      <CalcitePanel
        heading="Main Pane"
        data-panel-id="mainq"
        style={{ width: "375px" }}
        hidden
      >
        <DatePicker />

        <div
          style={{
            fontSize: action_pane_title_font_size,
            color: secondary_color,
            marginBottom: margin_bottom_title_item,
            marginLeft: margin_left_pane_title,
            marginTop: "1.5vh",
          }}
        >
          Visible Layers:
          <arcgis-layer-list
            referenceElement={viewchange}
            selectionMode="multiple"
            visibilityAppearance="checkbox"
            show-filter
            filter-placeholder="Filter layers"
            listItemCreatedFunction={defineActions}
          ></arcgis-layer-list>
        </div>

        {/* Min and Max Record */}
        {!is3D && <MinMaxRecord />}

        {/* Subtract displacement from the reference point */}
        {/* <ReferencePointSubtraction /> */}

        {/* Note for 3D */}
        {is3D && (
          <CalciteNotice open icon="exclamation-point-f">
            <div slot="title">Important Note</div>
            <div slot="message">
              To aid in the visual interpretation of displaced lands, points or
              surfaces are exaggerated x 1,000 times of the original scale (mm)
              in 3D view.
            </div>
          </CalciteNotice>
        )}

        {/* Add Legend */}
        <arcgis-legend
          referenceElement={viewchange}
          id="arcgis-map-legend"
          style={{
            margin: "auto",
            // scale: 1.1,
            // transform: "scaleY(1.2)",
          }}
        ></arcgis-legend>
      </CalcitePanel>

      <CalcitePanel
        heading="Basemaps"
        data-panel-id="basemaps"
        style={{ width: "20.8vw" }}
        hidden
      >
        <arcgis-basemap-gallery
          referenceElement={viewchange}
        ></arcgis-basemap-gallery>
      </CalcitePanel>

      <CalcitePanel
        class="elevation-profile-panel"
        height="l"
        data-panel-id="elevation-profile"
        hidden
      ></CalcitePanel>

      <CalcitePanel heading="Description" data-panel-id="information" hidden>
        {nextWidget === "information" && (
          <div className="informationDiv">
            <div
              style={{
                fontSize: "16px",
                color: secondary_color,
                marginTop: "10px",
                marginLeft: "10px",
              }}
            >
              Overview
            </div>
            <div>
              <img
                src="https://EijiGorilla.github.io/Symbols/Land_Subsidence/Overview.svg"
                alt="Overview"
                height={"100%"}
                width={"100%"}
                style={{ marginBottom: "auto" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "16px",
                  color: secondary_color,
                  marginTop: "10px",
                  marginLeft: "10px",
                }}
              >
                Chart:
              </div>
              <img
                src="https://EijiGorilla.github.io/Symbols/Land_Subsidence/Chart_displacement.svg"
                alt="Overview"
                height={"100%"}
                width={"100%"}
                style={{ marginBottom: "auto", marginTop: "auto" }}
              />
            </div>
            <div>
              <img
                src="https://EijiGorilla.github.io/Symbols/Land_Subsidence/Chart_scenario_status_quo.svg"
                alt="Overview"
                height={"100%"}
                width={"100%"}
                style={{ marginBottom: "auto", marginTop: "auto" }}
              />
            </div>
            <div>
              <img
                src="https://EijiGorilla.github.io/Symbols/Land_Subsidence/Chart_scenarios.svg"
                alt="Overview"
                height={"100%"}
                width={"100%"}
                style={{ marginBottom: "auto", marginTop: "auto" }}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: "16px",
                  color: secondary_color,
                  marginTop: "10px",
                  marginLeft: "10px",
                }}
              >
                Hot Spot Analysis:
              </div>
              <img
                src="https://EijiGorilla.github.io/Symbols/Land_Subsidence/Hot_spot_analysis.svg"
                alt="Overview"
                height={"100%"}
                width={"100%"}
                style={{ marginBottom: "auto", marginTop: "auto" }}
              />
            </div>
          </div>
        )}
      </CalcitePanel>
    </CalciteShellPanel>
  );
}

export default ActionPanel;
