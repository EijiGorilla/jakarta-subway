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
  kabupaten_name_field,
  label_hotspot,
  point_chart_y_variable,
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
import { visualVariables_fishnet } from "./Query";

// layer title
export const sar_point_layer_title = "Land Displacement (mm)";
export const hot_spot_analysis_layer_title = "Hot Spot Analysis";

// subway alingment line
const alignmentRenderer = new SimpleRenderer({
  symbol: new SimpleLineSymbol({
    color: "#ff0000",
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
  elevationInfo: {
    featureExpressionInfo: {
      expression: "$feature." + point_chart_y_variable, // `$feature[${elevField}]`,
    },
    // mode: 'relative-to-scene',
    mode: "relative-to-ground",
    unit: "millimeters",
  },
});

export const sar_points_layer_tile = new TileLayer({
  url: "https://gis.railway-sector.com/server/rest/services/Hosted/j_displacement/MapServer",
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
  }
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
    id: "eb361ab895d94c11bb88c26722ceb04d",
    portal: {
      url: "https://gis.railway-sector.com/portal",
    },
  },
  layerId: 5,
  outFields: [iqr_date_field, iqr_max_field],
  popupEnabled: false,
});

// Fishenet polygon in 3D
const new_polygon_renderer = new SimpleRenderer({
  symbol: new SimpleFillSymbol({
    style: undefined,
    color: undefined,
    outline: undefined,
  }),
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
  // elevationInfo: {
  //   mode: "absolute-height",
  //   featureExpressionInfo: {
  //     expression: "(Geometry($feature).z) * -1",
  //   },
  // },
  title: "Displacement (exaggerated x 1000)",
  renderer: new_polygon_renderer,
});

export const displacement_groupLayer = new GroupLayer({
  title: "Land Displacement",
  visible: true,
  visibilityMode: "exclusive",
  layers: [hot_spot_layer, sar_points_layer],
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

// LayerInfos for SAR and Hot Spot layers
export const layerInfos_sar_hotspot = [
  {
    layer: sar_points_layer,
    title: sar_point_layer_title,
  },
  {
    layer: hot_spot_layer,
    title: hot_spot_analysis_layer_title,
  },
  {
    layer: sar_points_layer_tile,
    title: sar_point_layer_title,
  },
  {
    layer: fishnet_3d_layer,
  },
];

export const layerInfos_null = [
  {
    layer: null,
  },
];
