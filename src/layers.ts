import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import UniqueValueRenderer from "@arcgis/core/renderers/UniqueValueRenderer";
import {
  SimpleFillSymbol,
  SimpleLineSymbol,
  SimpleMarkerSymbol,
} from "@arcgis/core/symbols";
import {
  admin_boudnary_layer_title,
  color_hotspot,
  iqr_date_field,
  iqr_max_field,
  iqr_q2_5_field,
  iqr_q97_5_field,
  kabupaten_name_field,
  label_hotspot,
  latest_date_field,
  values_hotspot,
  view_maxScale,
  view_maxScale_tile,
  view_minScale,
} from "./uniqueValues";
import GroupLayer from "@arcgis/core/layers/GroupLayer";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import Basemap from "@arcgis/core/Basemap";
import BasemapStyle from "@arcgis/core/support/BasemapStyle";
import TileLayer from "@arcgis/core/layers/TileLayer";
import ElevationLayer from "@arcgis/core/layers/ElevationLayer";
import {
  dateReadableConversion,
  new_point_renderer_las,
  visualVariables_fishnet,
} from "./Query";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import PointCloudLayer from "@arcgis/core/layers/PointCloudLayer";

// layer title
export const sar_point_layer_title = "Displacement (mm)";
export const sar_points_las_layer_title = "Points";
export const sar_points_tile_layer_title = "Surface";
export const hot_spot_analysis_layer_title =
  "Hot Spot Analysis" +
  " (" +
  dateReadableConversion([latest_date_field]) +
  ")";

// subway alingment line
const alignmentRenderer = new SimpleRenderer({
  symbol: new SimpleLineSymbol({
    color: "orange",
    width: "2px",
  }),
});

export const alingment_line_layer = new FeatureLayer({
  portalItem: {
    id: "eb361ab895d94c11bb88c26722ceb04d",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 1,
  // minScale: view_minScale,
  // maxScale: view_maxScale,
  renderer: alignmentRenderer,
  popupEnabled: false,
  title: "Alingment",
  elevationInfo: {
    mode: "on-the-ground",
  },
});
alingment_line_layer.listMode = "hide";

export const overview_alingment_line_layer = new FeatureLayer({
  portalItem: {
    id: "eb361ab895d94c11bb88c26722ceb04d",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 1,
  renderer: alignmentRenderer,
  popupEnabled: false,
  elevationInfo: {
    mode: "on-the-ground",
  },
});
overview_alingment_line_layer.listMode = "hide";

// SAR point layer
export const sar_points_layer = new FeatureLayer({
  portalItem: {
    id: "eb361ab895d94c11bb88c26722ceb04d",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 0,
  minScale: view_minScale,
  maxScale: view_maxScale,
  popupEnabled: false,
  title: sar_point_layer_title,
  // elevationInfo: {
  //   featureExpressionInfo: {
  //     expression: "$feature." + point_chart_y_variable, // `$feature[${elevField}]`,
  //   },
  //   // mode: 'relative-to-scene',
  //   mode: "relative-to-ground",
  //   unit: "millimeters",
  // },
});

export const sar_points_las = new PointCloudLayer({
  portalItem: {
    id: "e4f97b8fb7db4cafbd94c1dd9b350c01",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  renderer: new_point_renderer_las,
  title: sar_points_las_layer_title,
});

export const sar_points_layer_tile = new TileLayer({
  url: "https://gis.railway-sector.com/server/rest/services/Hosted/j_displacement_tile/MapServer",
  maxScale: view_maxScale_tile,
});
sar_points_layer_tile.listMode = "hide";

// Optimized hot spot
const uniqueValueInfos_hotspot = values_hotspot.map(
  (value: any, index: any) => {
    return Object.assign({
      value: value,
      label: label_hotspot[index],
      symbol: new SimpleMarkerSymbol({
        style: "circle",
        color: color_hotspot[index],
        outline: {
          color: [0, 0, 0, 0],
          width: 0.5,
        },
        size: "6.5px",
      }),
    });
  },
);

export const hot_spot_renderer = new UniqueValueRenderer({
  field: "gi_bin",
  uniqueValueInfos: uniqueValueInfos_hotspot,
});

export const hot_spot_layer = new FeatureLayer({
  portalItem: {
    id: "eb361ab895d94c11bb88c26722ceb04d",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 0,
  minScale: view_minScale,
  maxScale: view_maxScale,
  popupEnabled: false,
  renderer: hot_spot_renderer,
  // eslint-disable-next-line no-useless-concat
  outFields: ["Gi_Bin"],
  title: hot_spot_analysis_layer_title,
});

// Administrative Boundary
const kabupaten_renderer = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    color: "black",
    style: "none",
    outline: {
      color: "black",
      width: "2.5px",
    },
  }),
});

export const admin_boundary_kabupaten = new FeatureLayer({
  portalItem: {
    id: "eb361ab895d94c11bb88c26722ceb04d",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 3,
  outFields: [kabupaten_name_field],
  renderer: kabupaten_renderer,
  // When renderer is defined, it does not get highlighted. why?
  // renderer: admin_line_renderer,
  popupEnabled: false,
  title: admin_boudnary_layer_title[0],
  elevationInfo: {
    mode: "on-the-ground",
  },
});

// Kecamatan
export const admin_boundary_kecamatan = new FeatureLayer({
  portalItem: {
    id: "eb361ab895d94c11bb88c26722ceb04d",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 2,
  popupEnabled: false,
  // renderer: admin_line_renderer,
  title: admin_boudnary_layer_title[1],
  elevationInfo: {
    mode: "on-the-ground",
  },
});

export const admin_boundary_desa = new FeatureLayer({
  portalItem: {
    id: "eb361ab895d94c11bb88c26722ceb04d",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 4,
  popupEnabled: false,
  title: admin_boudnary_layer_title[2],
  elevationInfo: {
    mode: "on-the-ground",
  },
});

// Interquartile Range value tables
export const iqr_table = new FeatureLayer({
  portalItem: {
    id: "c9581257bac74980a44f3e65409f758c",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  outFields: [iqr_date_field, iqr_max_field, iqr_q2_5_field, iqr_q97_5_field],
  popupEnabled: false,
});

// Fishenet polygon in 3D
const new_polygon_renderer = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    style: undefined,
    color: undefined,
    outline: undefined,
  }),
  // label: "Displays the area of land subsidence",
  visualVariables: visualVariables_fishnet,
});

export const fishnet_3d_layer = new FeatureLayer({
  portalItem: {
    id: "498d45f2db7a4367b0c8c2d50d085595",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  minScale: 150000,
  maxScale: 0,
  popupEnabled: false,
  hasZ: true,
  // elevationInfo: {
  //   mode: "absolute-height",
  //   featureExpressionInfo: {
  //     expression: "(Geometry($feature).z) * -1",
  //   },
  // },
  title: sar_points_tile_layer_title,
  renderer: new_polygon_renderer,
});

export const displacement_groupLayer = new GroupLayer({
  title: "Land Displacement",
  visible: true,
  visibilityMode: "exclusive",
  layers: [hot_spot_layer, sar_points_layer],
});

export const displacement_grouLayer_magnitude = new GroupLayer({
  title: "Magnitude of Land Displacement",
  visible: true,
  visibilityMode: "exclusive",
  layers: [sar_points_las, fishnet_3d_layer],
});

export const admin_boundary_groupLayer = new GroupLayer({
  title: "Admin. Boundary Layers",
  visible: true,
  visibilityMode: "independent",
  layers: [
    admin_boundary_desa,
    admin_boundary_kecamatan,
    admin_boundary_kabupaten,
    alingment_line_layer,
  ],
});

const mapBaseLayer = new VectorTileLayer({
  portalItem: {
    id: "642ab8c40a864fd9a95e39ce0a97362b",
  },
});

// Create a Basemap with the custom layer
export const customBasemap = new Basemap({
  baseLayers: [mapBaseLayer],
  title: "My Custom Basemap",
  // Optionally, provide a thumbnail URL for use in the BasemapGallery widget
  // thumbnailUrl: "path/to/thumbnail.png",
});

export const basemap = new Basemap({
  style: new BasemapStyle({
    id: "dark-gray-vector",
    places: null,
  }),
});

// For elevation profile
export const sar_elevation_layer = new ElevationLayer({
  portalItem: {
    id: "66a0f9e24c5a454a8c80a03d93c056aa",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
});

export const highlightPointHoverGrapchicsLayer = new GraphicsLayer({
  title: "pointerover",
});
highlightPointHoverGrapchicsLayer.listMode = "hide";

/////////////////////////////
// let colors = [
//   new Color("#6b2600ff"),
//   new Color("#b59273ff"),
//   new Color("#fffee6ff"),
//   new Color("#809298ff"),
//   new Color("#002649ff"),
// ];

// // Create the color ramp
// const colorRamp = rasterColorRamps.createColorRamp({ colors: colors });

// // Instantiate the renderer
// const renderer = new RasterStretchRenderer({
//   colorRamp: colorRamp,
//   stretchType: "min-max", // Example stretch type
//   dynamicRangeAdjustment: true, // Enable DRA
// });

// export const sar_elevation_imagery = new ImageryLayer({
//   portalItem: {
//     id: "66a0f9e24c5a454a8c80a03d93c056aa",
//     portal: {
//       url: "https://gis.railway-sector.com/portal",
//     },
//   },
//   format: "lerc",
//   elevationInfo: {
//     mode: "absolute-height",
//     // featureExpressionInfo: {
//     //   expression: "Geometry($feature).z * 100",
//     // },
//     unit: "meters",
//   },
//   // url: https://gis.railway-sector.com/server/rest/services/j_subway_20251006_m/ImageServer,
//   renderer: renderer,
// });

// LayerInfos for SAR and Hot Spot layers
export const layerInfos_sar_hotspot = [
  {
    layer: sar_points_layer,
    title: "",
  },
  {
    layer: hot_spot_layer,
    title: hot_spot_analysis_layer_title,
  },
  {
    layer: sar_points_layer_tile,
    title: "",
  },
  {
    layer: fishnet_3d_layer,
    title: "Magnitude of Land Displacement",
  },
  {
    layer: sar_points_las,
    title: "Magnitude of Land Displacement",
  },
];

export const layerInfos_null = [
  {
    layer: null,
  },
];
