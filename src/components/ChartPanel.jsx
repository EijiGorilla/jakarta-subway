import { use, useEffect, useState } from "react";
import "../index.css";
import "../App.css";
import "@esri/calcite-components/dist/components/calcite-panel";
import "@esri/calcite-components/dist/components/calcite-chip";
import "@esri/calcite-components/dist/components/calcite-chip-group";
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
  const { elevprofileready } = use(MyContext);
  const [chartPanelHeight, setChartPanelHeight] = useState("7%");
  const [minElevation, setMinElevation] = useState(undefined);
  const [maxElevation, setMaxElevation] = useState(undefined);
  const [chartPanelName, setChartPanelName] = useState("Chart Panel");

  const arcgisElevationProfileElement = document.querySelector(
    "arcgis-elevation-profile"
  );

  useEffect(() => {
    if (elevprofileready === "ready") {
      setChartPanelName(
        "Land Subsidence Profile" +
          " (" +
          dateReadableConversion([latest_date_field]) +
          ")"
      );

      // if (arcgisElevationProfileElement) {
      //   arcgisElevationProfileElement.profiles = [
      //     {
      //       type: "ground",
      //       title: "Subsidence",
      //     },
      //   ];
      //   arcgisElevationProfileElement.unitOptions = {
      //     distance: "kilometers", // Supported distance units: "meters", "feet", "kilometers", "miles", etc.
      //     elevation: "meters", // Supported elevation units: "meters", "feet", etc.
      //   };
      // }
    } else {
      setChartPanelName("Chart Panel");
    }
  }, [elevprofileready]);

  const handleElevationProfileChange = (event) => {
    if (event.detail.name !== "progress" || event.target.progress !== 1) {
      return;
    }
    const profiles = event.target.profiles;
    const statistics = profiles.at(0)?.statistics;
    const minimumElevation = Math.round(statistics?.minElevation);
    const maximumElevation = Math.round(statistics?.maxElevation);

    setMinElevation(
      `${minimumElevation} ${event.target.effectiveUnits.elevation}`
    );
    setMaxElevation(
      `${maximumElevation} ${event.target.effectiveUnits.distance}`
    );
  };
  return (
    <CalcitePanel
      collapsible
      heading={chartPanelName}
      style={{
        height:
          chartPanelHeight === chart_panel_height_collapsed
            ? chart_panel_height_default
            : chart_panel_height_collapsed,
        backgroundColor: "#ffffff",
      }}
      onCalcitePanelToggle={() => {
        setChartPanelHeight(
          chartPanelHeight === chart_panel_height_default
            ? chart_panel_height_collapsed
            : chart_panel_height_default
        );
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* <ChartType /> */}
        <ExportExcel />
      </div>
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
            style={{ width: "100%", height: "100%", marginTop: "20px" }}
          ></arcgis-elevation-profile>
        </>
      ) : (
        <ChartDisplacementRecord />
      )}
    </CalcitePanel>
  );
}
