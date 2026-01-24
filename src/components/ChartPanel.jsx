import { use, useEffect, useState } from "react";
import "../index.css";
import "../App.css";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-chip";
import "@esri/calcite-components/dist/components/calcite-chip-group";
import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-notice";
import "@esri/calcite-components/dist/calcite/calcite.css";
import {
  CalcitePanel,
  CalciteChipGroup,
  CalciteChip,
} from "@esri/calcite-components-react";
import {
  chart_panel_height_collapsed,
  chart_panel_height_default,
  latest_date_field,
} from "../uniqueValues";
// import ChartType from './ChartType';
import ExportExcel from "./ExportExcel";
import ChartDisplacementRecord from "./ChartDisplacementRecord";
import { MyContext } from "../contexts/MyContext";
import "@arcgis/map-components/components/arcgis-elevation-profile";
import { dateReadableConversion } from "../Query";

export default function ChartPanel() {
  const { elevprofileready, activewidget, is3D, chartdata } = use(MyContext);
  const [chartPanelHeight, setChartPanelHeight] = useState("7%");
  const [minElevation, setMinElevation] = useState(undefined);
  const [maxElevation, setMaxElevation] = useState(undefined);
  const [chartPanelName, setChartPanelName] = useState("Chart Panel");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (chartdata) {
      setChartData(chartdata[0]);
    }
  }, [chartdata]);

  useEffect(() => {
    const elevationProfileElement = document.querySelector(
      "arcgis-elevation-profile",
    );

    if (elevprofileready === "ready") {
      setChartPanelName(
        "Land Displacement Profile" +
          " (" +
          dateReadableConversion([latest_date_field]) +
          ")",
      );

      if (elevationProfileElement) {
        elevationProfileElement.profiles = [
          {
            type: "ground",
            title: "Displacement",
          },
        ];
      }
    } else {
      setChartPanelName("Chart Panel");
    }
  }, [elevprofileready, activewidget]);

  const handleElevationProfileChange = (event) => {
    if (event.detail.name !== "progress" || event.target.progress !== 1) {
      return;
    }

    const profiles = event.target.profiles;
    const statistics = profiles.at(0)?.statistics;
    const minimumElevation = Math.round(statistics?.minElevation);
    const maximumElevation = Math.round(statistics?.maxElevation);

    setMinElevation(
      `${minimumElevation} ${event.target.effectiveUnits.elevation}`,
    );
    setMaxElevation(
      `${maximumElevation} ${event.target.effectiveUnits.distance}`,
    );
  };
  return (
    <>
      {!is3D && (
        <CalcitePanel
          collapsible
          heading={chartPanelName}
          style={{
            height:
              chartPanelHeight === chart_panel_height_collapsed
                ? chart_panel_height_default
                : chart_panel_height_collapsed,
            scrollbarWidth: "thin",
            scrollbarColor: "#888 #555",
            // "--calcite-color-background": "#ffffff",
          }}
          onCalcitePanelToggle={() => {
            setChartPanelHeight(
              chartPanelHeight === chart_panel_height_default
                ? chart_panel_height_collapsed
                : chart_panel_height_default,
            );
          }}
        >
          {chartData.length > 0 && (
            <div style={{ marginRight: "auto", marginLeft: "10px" }}>
              <ExportExcel />
            </div>
          )}
          {/* {chartData.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <CalciteNotice
                open
                icon="exclamation-point-f"
                scale="s"
                style={{ display: "block", marginLeft: 0, marginRight: "auto" }}
              >
                <div slot="message">
                  Reset charts by clicking anywhere on the map.
                </div>
              </CalciteNotice>
              <div>
                <ExportExcel />
              </div>
            </div>
          )} */}

          {elevprofileready === "ready" ? (
            <>
              <CalciteChipGroup
                slot="header-actions-end"
                style={{
                  "--calcite-chip-background-color": "#0079C1",
                  marginTop: "auto",
                  marginBottom: "auto",
                }}
              >
                {maxElevation && (
                  <CalciteChip icon="maximum-graph" id="max-elevation">
                    {maxElevation}
                  </CalciteChip>
                )}
                {minElevation && (
                  <CalciteChip icon="minimum-graph" id="min-elevation">
                    {minElevation}
                  </CalciteChip>
                )}
              </CalciteChipGroup>

              <arcgis-elevation-profile
                referenceElement="arcgis-map-id"
                unit="millimeters"
                hideClearButton
                hideLegend
                hideSettingsButton
                onarcgisPropertyChange={handleElevationProfileChange}
                style={{
                  width: "100%",
                  marginTop: "30px",
                }}
              ></arcgis-elevation-profile>
            </>
          ) : (
            <ChartDisplacementRecord />
          )}
        </CalcitePanel>
      )}
    </>
  );
}
