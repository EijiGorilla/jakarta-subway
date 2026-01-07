import ColorVariable from "@arcgis/core/renderers/visualVariables/ColorVariable";
import { iqr_table, sar_points_layer } from "./layers";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import { SimpleMarkerSymbol } from "@arcgis/core/symbols";
import StatisticDefinition from "@arcgis/core/rest/support/StatisticDefinition";
import Query from "@arcgis/core/rest/support/Query";
import FeatureFilter from "@arcgis/core/layers/support/FeatureFilter";
import { SimpleFillSymbol } from "@arcgis/core/symbols";
import {
  date_sar_suffix,
  dates_sar,
  iqr_date_field,
  iqr_max_field,
  iqr_min_field,
  iqr_q1_field,
  iqr_q2_5_field,
  iqr_q3_field,
  iqr_q97_5_field,
  latest_date_field,
  max_symbology,
  min_symbology,
  object_id,
  point_chart_y_variable,
  point_color,
  visualVariable_field,
} from "./uniqueValues";
import OpacityVariable from "@arcgis/core/renderers/visualVariables/OpacityVariable";
import PointCloudStretchRenderer from "@arcgis/core/renderers/PointCloudStretchRenderer";
import Extent from "@arcgis/core/geometry/Extent";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";

// total records for checking
// export async function totalRecords() {
//   var total_records = new StatisticDefinition({
//     onStatisticField: 'objectid',
//     statisticType: 'count',
//     outStatisticFieldName: 'total_records',
//   });
//   var query = sar_points_layer.createQuery();
//   query.where = '1=1';
//   query.outStatistics = [total_records];
//   query.outFields = ['objectid'];
//   const response = await sar_points_layer.queryFeatures(query);
//   var stats = response.features[0].attributes;
//   const count = stats.total_records;
//   return count;
// }
// totalRecords().then((result: any) => {
//   console.log(result);
// });

// function onlyUnique(value: any, index: any, array: any) {
//   return array.indexOf(value) === index;
// }

// export async function getFieldNamesYears() {
//   const query = sar_points_layer.createQuery();
//   return sar_points_layer.queryFeatures(query).then((response: any) => {
//     const field_names: any = [];
//     const years_list: any = [];
//     var fields = response.fields;
//     fields.map((field: any, index: any) => {
//       if (field.name[0] === date_sar_suffix) {
//         field_names.push(field.name);
//         const year = Number(field.name.replace(date_sar_suffix, '').slice(0, 4));
//         years_list.push(year);
//       }
//     });
//     console.log(field_names);
//     const unique_years = years_list.filter(onlyUnique);
//     return [field_names, unique_years];
//   });
// }

// Create data for time-series chart when a specific id is selected
// reference point values to extract from to account for displacement unrelated to subsidence.
export async function getReferencePointValueForSubtraction(ref_point_id: any) {
  const query = sar_points_layer.createQuery();
  if (ref_point_id) {
    query.where = `${object_id} = ` + ref_point_id;
  } else {
    query.where = "1=1";
  }

  return sar_points_layer.queryFeatures(query).then((results: any) => {
    // when ref_point_id entered does not exist, do nothing.
    // when a reference point is selected,
    // compile all values across all the date fields in an objectd array.
    if (ref_point_id) {
      var stats = results.features[0].attributes;
      const ref_data = dates_sar.map((date: any) => {
        const dateString = date.replace(date_sar_suffix, "");
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        const date_n = new Date(year, month - 1, day);
        date_n.setHours(0, 0, 0, 0);
        return Object.assign({
          date: date_n.getTime(),
          value: stats[date],
        });
      });
      return ref_data;
    }
  });
}

export async function generateChartData(
  selectedid: any,
  newdates: any,
  refData: any
) {
  if (selectedid) {
    const query = sar_points_layer.createQuery();
    query.where = `${object_id} = ` + selectedid;
    return sar_points_layer.queryFeatures(query).then((results: any) => {
      var stats = results.features[0].attributes;
      const map = newdates.map((date: any, index: any) => {
        const dateString = date.replace(date_sar_suffix, "");
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        const date_label = `${year.toString()}-${month.toString()}-${day.toString()}`;
        const date_n = new Date(year, month - 1, day);
        date_n.setHours(0, 0, 0, 0);

        // get reference point data
        const find = refData?.filter(
          (elem: any) => elem.date === date_n.getTime()
        );
        const ref_value = find ? find[0].value : 0;

        //
        return Object.assign({
          Date: date_label,
          date: date_n.getTime(), //date.replace('f', ''),
          // value: stats[newdates[index]],
          value: stats[newdates[index]] - ref_value, // subtract to account for displacement unrelated to subsidence
        });
      });
      const displ_mmyr = stats[point_chart_y_variable];
      return [map, displ_mmyr];
    });
  } else {
    const default_data = [{}];
    return default_data;
  }
}

export function dateReadableConversion(dates: any) {
  // dates are array []
  const dates_string = dates.map((item: any) => item?.replace("X", ""));
  const year = dates_string.map((item: any) => item?.slice(0, 4));
  const month = dates_string.map((item: any) => item?.slice(4, 6));
  const day = dates_string.map((item: any) => item?.slice(6, 8));
  const datesDropdown = year.map(
    (item: any, index: any) => `${item}/${month[index]}/${day[index]}`
  );
  return datesDropdown;
}

export async function updateRendererForSymbology(last_date: any) {
  const query = iqr_table.createQuery();
  const last_date_X = last_date.replace("x", "X");
  // query.where = "dates = '" + last_date_X + "'";
  query.where = `${iqr_date_field} = '${last_date_X}'`;

  query.outFields = [
    iqr_date_field,
    iqr_max_field,
    iqr_q1_field,
    iqr_q3_field,
    iqr_min_field,
    iqr_q2_5_field,
    iqr_q97_5_field,
  ];
  const response = await iqr_table.queryFeatures(query);
  var attributes = response.features[0].attributes;
  const min_symbology = Math.floor(attributes[iqr_q2_5_field]);
  const max_symbology = Math.floor(attributes[iqr_q97_5_field]);

  const values = [min_symbology, 0, max_symbology];
  const colorVariable_stops = values.map((value: any, index: any) => {
    return Object.assign({
      value: value,
      color: point_color[index],
      label:
        index === 0
          ? "< " + value.toString() + " mm"
          : index === 1
          ? "0"
          : index === 2
          ? "> " + max_symbology + " mm"
          : "",
    });
  });

  const opacityVariable_stops = values.map((value: any, index: any) => {
    return Object.assign({
      value: value,
      opacity: index === 1 ? 0.1 : 0.9,
    });
  });

  const new_visualVariable = [
    new ColorVariable({
      field: last_date_X,
      stops: colorVariable_stops,
      legendOptions: {
        title: dateReadableConversion([last_date_X]),
      },
    }),
    new OpacityVariable({
      field: last_date_X,
      legendOptions: {
        showLegend: false,
      },
      stops: opacityVariable_stops,
    }),
  ];

  const new_point_renderer = new SimpleRenderer({
    symbol: new SimpleMarkerSymbol({
      style: "circle",
      color: undefined,
      // outline: {
      //   color: [0, 0, 0, 0],
      //   width: 0.5,
      // },
      outline: undefined,
      size: "6.5px",
    }),
    visualVariables: new_visualVariable,

    // https://developers.arcgis.com/javascript/latest/visualization/symbols-color-ramps/esri-color-ramps/
  });

  return new_point_renderer;
}

// sar point las symbology
const values_las = [min_symbology, 0, max_symbology];
const colorVariable_stops_las = values_las.map((value: any, index: any) => {
  return Object.assign({
    value: value,
    color: point_color[index],
    label:
      index === 0 ? "Higher" : index === 1 ? "0" : index === 2 ? "Lower" : "",
  });
});

export const new_point_renderer_las = new PointCloudStretchRenderer({
  field: "ELEVATION",
  colorModulation: {
    field: "ELEVATION",
    minValue: -35,
    maxValue: 14,
  },
  stops: colorVariable_stops_las,
  pointSizeAlgorithm: {
    type: "fixed-size",
    size: 6.5,
  },
});

// Fishnet symbology
const colorVariable_stops = [
  {
    value: min_symbology,
    color: point_color[0],
    // label: "< " + min_symbology.toString(),
    label: "Higher",
  },
  {
    value: 0,
    color: point_color[1],
    label: "0",
  },
  {
    value: max_symbology,
    color: point_color[2],
    // label: "> " + max_symbology.toString(),
    label: "Lower",
  },
];

const opacityVariable_stops = [
  {
    value: min_symbology,
    opacity: 0.9,
  },
  {
    value: 0,
    opacity: 0.1,
  },
  {
    value: max_symbology,
    opacity: 0.9,
  },
];

export const visualVariables_fishnet = [
  new ColorVariable({
    field: visualVariable_field,
    stops: colorVariable_stops,
    legendOptions: {
      title: dates_sar[dates_sar.length - 1].replace(date_sar_suffix, ""),
    },
  }),
  new OpacityVariable({
    field: visualVariable_field,
    stops: opacityVariable_stops,
    legendOptions: {
      showLegend: false,
    },
  }),
];

// Get minimum and maximum records and zoom
export async function getMinMaxRecords(newdates: any) {
  // Regardless of start years, min and max records are extracted from the end year.
  // So query based on the end year only.
  const end_year_date = newdates[newdates.length - 1];
  const query = sar_points_layer.createQuery();

  var min_value = new StatisticDefinition({
    onStatisticField: end_year_date,
    outStatisticFieldName: "min_value",
    statisticType: "min",
  });

  var max_value = new StatisticDefinition({
    onStatisticField: end_year_date,
    outStatisticFieldName: "max_value",
    statisticType: "max",
  });

  query.outFields = [end_year_date, object_id];
  query.outStatistics = [min_value, max_value];

  return sar_points_layer.queryFeatures(query).then((results: any) => {
    var stats = results.features[0].attributes;
    return stats;
  });
}

export function zoomToMinMaxRecord(view: any, value: any, end_year_date: any) {
  let highlightSelect: any;
  var query = sar_points_layer.createQuery();
  query.outFields = [end_year_date, object_id];
  query.where = `${end_year_date} = ` + value;
  view?.whenLayerView(sar_points_layer).then((layerView: any) => {
    sar_points_layer.queryFeatures(query).then((results: any) => {
      const objectID = results.features[0].attributes[object_id];
      var queryExt = new Query({
        objectIds: [objectID],
      });
      sar_points_layer.queryExtent(queryExt).then((result: any) => {
        result.extent &&
          view?.goTo({
            target: result.extent,
            speedFactor: 2,
            zoom: 17,
          });
      });

      highlightSelect && highlightSelect.remove();
      highlightSelect = layerView.highlight([objectID]);
      view?.view.on("click", () => {
        layerView.filter = new FeatureFilter({
          where: undefined,
        });
        highlightSelect.remove();
      });
    });
  });
}

// Thousand separators function
export function thousands_separators(num: any) {
  if (num) {
    var num_parts = num.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return num_parts.join(".");
  }
}

export const webmercatorExtent = new Extent({
  xmin: -20037508.342787,
  ymin: -20037508.342787,
  xmax: 20037508.342787,
  ymax: 20037508.342787,
  spatialReference: SpatialReference.WebMercator,
});
