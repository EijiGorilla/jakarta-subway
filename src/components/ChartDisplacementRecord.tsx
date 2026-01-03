/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useState, useEffect, use } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";
import {
  generateChartData,
  getReferencePointValueForSubtraction,
} from "../Query";
import {
  chart_div_height,
  chart_inside_label_color_down_mmyr,
  chart_inside_label_color_up_mmyr,
  secondary_color,
} from "../uniqueValues";
import * as XLSX from "xlsx";
import { MyContext } from "../contexts/MyContext";

// Dispose function
function maybeDisposeRoot(divId: any) {
  am5.array.each(am5.registry.rootElements, function (root) {
    if (root.dom.id === divId) {
      root.dispose();
    }
  });
}

// https://www.amcharts.com/docs/v5/tutorials/dynamically-switching-data-set-for-an-xychart/
export default function ChartDisplacementRecord() {
  const { newdates, referenceid, selectedid, clickedexportexcel, is3D } =
    use(MyContext);

  const xAxisRef = useRef<unknown | any | undefined>({});
  const yAxisRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [chartData, setChartData] = useState([]);
  const [displMmyrValue, setDisplMmyrValue] = useState<any>();
  const [referencePointData, setReferencePointData] = useState<any>();

  const chartID = "lot-progress";

  // Get reference point values for subtraction
  useEffect(() => {
    getReferencePointValueForSubtraction(referenceid).then((response: any) => {
      setReferencePointData(response);
    });
  }, [referenceid]);

  useEffect(() => {
    generateChartData(selectedid, newdates, referencePointData).then(
      (response: any) => {
        setChartData(response[0]);
        setDisplMmyrValue(response[1]);
      }
    );
    // }
  }, [selectedid, newdates]);

  // Export to Excel
  useEffect(() => {
    if (chartData.length > 0) {
      // Remove numerical date values
      const arr1 = chartData.map(({ Date, value }) => ({ Date, value }));
      const worksheet = XLSX.utils.json_to_sheet(arr1);
      const workbook = XLSX.utils.book_new();
      const file_name = "Displacement_" + selectedid + ".xlsx";
      XLSX.utils.book_append_sheet(workbook, worksheet, "Displacement");
      XLSX.writeFile(workbook, file_name);
    }
  }, [clickedexportexcel]);

  useEffect(() => {
    maybeDisposeRoot(chartID);
    var root = am5.Root.new(chartID);
    root.container.children.clear();
    root._logo?.dispose();

    // Set themesf
    const myTheme = am5.Theme.new(root);
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([
      am5themes_Animated.new(root),
      myTheme,
      am5themes_Responsive.new(root),
    ]);

    // Move minor label a bit down
    myTheme.rule("AxisLabel", ["minor"]).setAll({
      dy: 1,
    });

    // Tweak minor grid opacity
    myTheme.rule("Grid", ["minor"]).setAll({
      strokeOpacity: 0.08,
    });

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    var chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
      })
    );
    chartRef.current = chart;

    // Chart title
    // let label = chart.children.unshift(
    //   am5.Label.new(root, {
    //     text: 'Displacement (mm)',
    //     fontSize: 14,
    //     // fontWeight: 'bold',
    //     textAlign: 'center',
    //     fill: am5.color('#ffffff'),
    //     x: am5.percent(50),
    //     centerX: am5.percent(50),
    //     paddingTop: -5,
    //     paddingBottom: 0,
    //   }),
    // );

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    var cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "zoomX",
      })
    );
    cursor.lineY.set("visible", false);

    // Create axes //
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    var xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0,
        baseInterval: {
          timeUnit: "day",
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(root, {
          minorGridEnabled: false,
          minGridDistance: 100,
          minorLabelsEnabled: false,
          strokeOpacity: 1,
          strokeWidth: 2,
          stroke: am5.color(secondary_color),
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    // Grid line inside the chart
    // Hide grid lines inside the chart
    // yAxis.get('renderer').grid.template.set('forceHidden', true);
    xAxis.get("renderer").grid.template.setAll({
      strokeWidth: 0.5,
      stroke: am5.color(secondary_color),
    });

    xAxis.get("renderer").labels.template.setAll({
      oversizedBehavior: "truncate",
      maxWidth: 150,
      fill: am5.color(secondary_color),
    });

    xAxis.set("minorDateFormats", {
      day: "dd",
      month: "MM",
    });

    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        // extraMax: 0.0005,
        // max: 0.01,
        renderer: am5xy.AxisRendererY.new(root, {
          minorGridEnabled: false,
          minGridDistance: 40,
          minorLabelsEnabled: false,
          strokeOpacity: 1,
          strokeWidth: 2,
          stroke: am5.color(secondary_color),
        }),
      })
    );

    // Grid line inside the chart
    // Hide grid lines inside the chart
    // yAxis.get('renderer').grid.template.set('forceHidden', true);
    yAxis.get("renderer").grid.template.setAll({
      strokeWidth: 0.5,
      stroke: am5.color(secondary_color),
    });

    yAxis.get("renderer").labels.template.setAll({
      oversizedBehavior: "truncate",
      maxWidth: 150,
      fill: am5.color(secondary_color),
    });

    xAxisRef.current = xAxis;
    yAxisRef.current = yAxis;

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    var series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "Series",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY}",
        }),
      })
    );

    // Main line
    series.strokes.template.setAll({
      strokeWidth: 2,
    });

    // Actual bullet
    series.bullets.push(function () {
      var bulletCircle = am5.Circle.new(root, {
        radius: 2,
        fill: series.get("fill"),
      });
      return am5.Bullet.new(root, {
        sprite: bulletCircle,
      });
    });

    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    // chart.set("scrollbarX", am5.Scrollbar.new(root, {
    //   orientation: "horizontal"
    // }));

    series.data.setAll(chartData);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [chartID, chartData]);

  return (
    <>
      <div
        id="chartAlignDiv"
        style={{
          // display: 'flex',
          // border: 'solid 1px gray',
          marginRight: "10px",
          marginLeft: "10px",
          overflow: "auto",
        }}
      >
        <div
          id={chartID}
          style={{
            height: chart_div_height,
            width: "99%",
            backgroundColor: "#2b2b2b",
            color: "white",
            bottom: 50,
            marginLeft: "0.3vw",
            marginRight: "auto",
          }}
        >
          {/* Add label when the chart is empty */}
          {!chartData[0] && (
            <span
              style={{
                color: "white",
                // fontSize: informationWidget === true ? "10px" : "14px",
                position: "absolute",
                zIndex: "2",
                top: "40%",
                left: "10%",
              }}
            >
              {is3D ? (
                <span style={{ color: "white", fontSize: "20px" }}>
                  Chart does not work in 3D. Please return to 2D.
                </span>
              ) : (
                "(Zoom) and click a point feature to show its land subsidence distribution over time."
              )}
            </span>
          )}

          <span
            style={{
              position: "fixed",
              right: 50,
              marginTop: "10px",
              color:
                displMmyrValue > 0
                  ? chart_inside_label_color_up_mmyr
                  : displMmyrValue < 0
                  ? chart_inside_label_color_down_mmyr
                  : secondary_color,
              fontWeight: "bold",
              fontSize: "20px",
              //   display: informationWidget === true ? "none" : "block",
            }}
          >
            {displMmyrValue}{" "}
            <span
              style={{
                fontWeight: "normal",
                color: secondary_color,
                fontSize: "15px",
              }}
            >
              mm/yr
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
