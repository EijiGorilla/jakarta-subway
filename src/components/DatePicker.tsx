import "../index.css";
import "../App.css";
import { use, useEffect, useState } from "react";
import {
  action_pane_title_font_size,
  date_sar_suffix,
  dates_sar,
  margin_bottom_title_item,
  margin_left_pane_title,
  secondary_color,
  years_dropdown,
} from "../uniqueValues";
import "@esri/calcite-components/dist/components/calcite-dropdown";
import "@esri/calcite-components/dist/components/calcite-dropdown-group";
import "@esri/calcite-components/dist/components/calcite-dropdown-item";
import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/calcite/calcite.css";
import {
  CalciteDropdown,
  CalciteDropdownGroup,
  CalciteDropdownItem,
  CalciteButton,
} from "@esri/calcite-components-react";
import { sar_points_layer } from "../layers";

import { updateRendererForSymbology } from "../Query";
import { MyContext } from "../contexts/MyContext";

export default function DatePicker() {
  const { startyear, endyear, updateStartyear, updateEndyear, updateNewdates } =
    use(MyContext);

  const [startYearsDropdown, setStartYearsDropdown] =
    useState<any>(years_dropdown);
  const [endYearsDropdown, setEndYearsDropdown] = useState<any>(years_dropdown);

  // Update Date picked
  const handleStartYear = (obj: any) => {
    updateStartyear(obj);
  };

  const handleEndYear = (obj: any) => {
    updateEndyear(obj);
  };

  const handleNewDatesForChart = (obj: any) => {
    updateNewdates(obj);
  };

  useEffect(() => {
    // update end years list in dropdown list
    setEndYearsDropdown(
      years_dropdown.filter((elem: any) => elem >= startyear)
    );
    setStartYearsDropdown(
      years_dropdown.filter((elem: any) => elem <= endyear)
    );

    // identify the first date of the selected year from the date fields array
    // make sure to add 'x' to correctly filter by year
    const first_dates_x = dates_sar.filter((elem: any) =>
      elem.includes(date_sar_suffix.concat(startyear))
    );
    const last_dates_x = dates_sar.filter((elem: any) =>
      elem.includes(date_sar_suffix.concat(endyear))
    );
    const last_date = last_dates_x[last_dates_x.length - 1];

    // Get an index of the first and end date
    const first_date_index = dates_sar.indexOf(first_dates_x[0]);
    const end_date_index = dates_sar.indexOf(last_date);

    handleNewDatesForChart(
      dates_sar.slice(first_date_index, end_date_index + 1)
    );

    // Sar point color ramps
    updateRendererForSymbology(last_date).then((response: any) => {
      sar_points_layer.renderer = response;
    });
  }, [startyear, endyear]);

  return (
    <>
      <div
        style={{
          fontSize: action_pane_title_font_size,
          color: secondary_color,
          marginBottom: margin_bottom_title_item,
          marginLeft: margin_left_pane_title,
          marginTop: "1vh",
        }}
      >
        Time Period:
      </div>
      <div
        style={{
          display: "flex",
          fontSize: "20px",
          marginLeft: "25px",
          marginRight: "auto",
        }}
      >
        <CalciteDropdown width="m" style={{ marginRight: "4%" }}>
          <CalciteButton slot="trigger" kind="inverse" scale="s">
            <span style={{ color: "#ffffff" }}>Start Year</span>
          </CalciteButton>
          <CalciteDropdownGroup group-title="">
            {startYearsDropdown &&
              startYearsDropdown.map((year: any, index: any) => {
                return (
                  <CalciteDropdownItem
                    key={index}
                    id={year}
                    // onCalciteDropdownItemSelect={(event: any) => setStartYear(event.target.id)}
                    onCalciteDropdownItemSelect={(event: any) =>
                      handleStartYear(event.target.id)
                    }
                  >
                    {year}
                  </CalciteDropdownItem>
                );
              })}
          </CalciteDropdownGroup>
        </CalciteDropdown>
        {startyear}
        <div style={{ marginLeft: "3%", marginRight: "3%" }}>{"-"}</div>
        {endyear}
        <CalciteDropdown width="m" style={{ marginLeft: "4%" }}>
          <CalciteButton slot="trigger" kind="inverse" scale="s">
            <span style={{ color: "#ffffff" }}>End Year</span>
          </CalciteButton>
          <CalciteDropdownGroup group-title="">
            {endYearsDropdown &&
              endYearsDropdown.map((year: any, index: any) => {
                return (
                  <CalciteDropdownItem
                    key={index}
                    id={year}
                    onCalciteDropdownItemSelect={(event: any) =>
                      handleEndYear(event.target.id)
                    }
                  >
                    {year}
                  </CalciteDropdownItem>
                );
              })}
          </CalciteDropdownGroup>
        </CalciteDropdown>
      </div>
    </>
  );
}
