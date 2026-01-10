/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useState, useEffect, use } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5index from "@amcharts/amcharts5/index";
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
  object_id,
  secondary_color,
} from "../uniqueValues";
import * as XLSX from "xlsx";
import { MyContext } from "../contexts/MyContext";
import { sar_points_layer } from "../layers";
import { ArcgisMap } from "@arcgis/map-components/dist/components/arcgis-map";
import Point from "@arcgis/core/geometry/Point";
import { SimpleMarkerSymbol } from "@arcgis/core/symbols";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import "@esri/calcite-components/dist/components/calcite-button";
import { CalciteButton } from "@esri/calcite-components-react";

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
  const { selectedid, clickedexportexcel, chartdata, is3D } = use(MyContext);

  const arcgisMap = document.querySelector("arcgis-map") as ArcgisMap;

  const xAxisRef = useRef<unknown | any | undefined>({});
  const yAxisRef = useRef<unknown | any | undefined>({});
  const chartRef = useRef<unknown | any | undefined>({});
  const [chartData, setChartData] = useState([]);
  const [displMmyrValue, setDisplMmyrValue] = useState<any>();

  const chartID = "lot-progress";

  useEffect(() => {
    if (chartdata) {
      setChartData(chartdata[0]);
      setDisplMmyrValue(chartdata[1]);
    }
  }, [chartdata]);

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
        // panX: false,
        // panY: false,
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
        maxTooltipDistance: 0,
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
    const xAxis = chart.xAxes.push(
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

    const yAxis: any = chart.yAxes.push(
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
    for (var i = 0; i < chartData.length; i++) {
      var series: any = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: selectedid[i].toString(),
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
      // eslint-disable-next-line no-loop-func
      series.bullets.push(function () {
        var bulletCircle: any = am5.Circle.new(root, {
          radius: 2,
          fill: series.get("fill"),
        });
        return am5.Bullet.new(root, {
          sprite: bulletCircle,
        });
      });

      series.data.setAll(chartData[i]);

      series.appear();
      // chart.appear(1000, 100);
    }

    let highlight: any;

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    var legend: any = chart.rightAxesContainer.children.push(
      am5.Legend.new(root, {
        width: 100,
        paddingLeft: 15,
        height: am5.percent(100),
      })
    );

    const highlightPointHoverGrapchicsLayer = new GraphicsLayer({});
    highlightPointHoverGrapchicsLayer.listMode = "hide";

    // When legend item container is hovered, dim all the series except the hovered one
    legend.itemContainers.template.events.on("pointerover", (e: any) => {
      var itemContainer = e.target;

      // As series list is data of a legend, dataContext is series
      var series = itemContainer.dataItem.dataContext;

      if (highlight) {
        highlight.remove();
      }

      chart.series.each((chartSeries: any) => {
        if (chartSeries !== series) {
          chartSeries.strokes.template.setAll({
            strokeOpacity: 0.15,
            stroke: am5.color(0x000000),
          });
        } else {
          const hovered_id = Number(chartSeries.get("name"));

          // Create a enlarged point for highlight.
          const query = sar_points_layer.createQuery();
          query.where = `${object_id} = ${hovered_id}`;
          arcgisMap?.whenLayerView(sar_points_layer).then((layerView: any) => {
            sar_points_layer.queryFeatures(query).then((response: any) => {
              const stats = response.features[0].attributes;
              const lat = stats["Lat_deg"];
              const long = stats["Lon_deg"];
              const point = new Point({
                longitude: long,
                latitude: lat,
              });

              const markerSymbol: any = new SimpleMarkerSymbol({
                // color: "#FF00FF40",
                color: "#80808080",
                size: "20px",
                outline: {
                  color: "#FF00FF",
                  width: 2,
                },
              });

              const pointGraphic = new Graphic({
                geometry: point,
                symbol: markerSymbol,
              });

              highlightPointHoverGrapchicsLayer.add(pointGraphic);
              arcgisMap?.map?.add(highlightPointHoverGrapchicsLayer);

              highlight = layerView?.highlight(
                highlightPointHoverGrapchicsLayer,
                {
                  name: "temporary",
                }
              );
            });
          });

          chartSeries.strokes.template.setAll({
            strokeWidth: 2,
            stroke: "magenta",
          });
        }
      });
    });

    // When legend item container is unhovered, make all series as they are
    legend.itemContainers.template.events.on("pointerout", (e: any) => {
      var itemContainer = e.target;
      var series = itemContainer.dataItem.dataContext;
      highlightPointHoverGrapchicsLayer.removeAll();

      if (highlight) {
        highlight.remove();
      }

      chart.series.each((chartSeries: any) => {
        chartSeries.strokes.template.setAll({
          strokeOpacity: 1,
          strokeWidth: 1,
          stroke: chartSeries.get("fill"),
        });
      });
    });

    legend.itemContainers.template.set("width", am5.p100);
    legend.valueLabels.template.setAll({
      width: am5.p100,
      textAlign: "right",
    });

    legend.labels.template.setAll({
      oversizedBehavior: "truncate",
      fill: am5.color("#ffffff"),
      //textDecoration: "underline"
      //width: am5.percent(200)
      //fontWeight: "300"
    });

    // It's is important to set legend data after all the events are set on template, otherwise events won't be copied
    legend.data.setAll(chart.series.values);

    if (chartData.length > 0) {
      legend.children.unshift(
        am5.Label.new(root, {
          text: "ID Number", // Set the desired title text
          fontWeight: "500", // Optional: make the title bold
          textAlign: "center",
          marginBottom: 5, // Optional: add some space below the title
          fill: am5.color("#ffffff"),
        })
      );
    }

    chart.appear(1000, 100);
    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    // chart.set("scrollbarX", am5.Scrollbar.new(root, {
    //   orientation: "horizontal"
    // }));

    // series.data.setAll(chartData);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    // series.appear(1000);
    // chart.appear(1000, 100);

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
            // bottom: 50,
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
                "(Zoom) and click a point feature(s) to show the temporal distribution of land displacement."
              )}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
