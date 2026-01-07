import Viewpoint from "@arcgis/core/Viewpoint";
import { hot_spot_analysis_layer_title } from "./layers";

// Initial viewpoint
export const initialViewpoint = new Viewpoint({
  scale: 100000,
  targetGeometry: {
    type: "point",
    latitude: -6.2,
    longitude: 106.8244387,
  },
});

// Date Picker
export const monthList = [
  {
    value: 1,
    month: "Jan.",
  },
  {
    value: 2,
    month: "Feb.",
  },
  {
    value: 3,
    month: "Mar.",
  },
  {
    value: 4,
    month: "Apr.",
  },
  {
    value: 5,
    month: "May",
  },
  {
    value: 6,
    month: "Jun.",
  },
  {
    value: 7,
    month: "Jul.",
  },
  {
    value: 8,
    month: "Aug.",
  },
  {
    value: 9,
    month: "Sep.",
  },
  {
    value: 10,
    month: "Oct.",
  },
  {
    value: 11,
    month: "Nov.",
  },
  {
    value: 12,
    month: "Dec.",
  },
];

// SAR point layer fields
export const hotspot_field = "Gi_Bin";
export const object_id = "OBJECTID";
export const point_chart_y_variable = "DispR_mmyr";

// Fishnet fields
export const visualVariable_field = "height";

// Boundary fields
export const kabupaten_name_field = "NAMOBJ";

// IQR field for symbology
export const min_symbology = -7.9;
export const max_symbology = 8.4;
export const iqr_date_field = "dates";
export const iqr_min_field = "min_";
export const iqr_max_field = "max_";
export const iqr_q1_field = "Q1";
export const iqr_q3_field = "Q3";

// Visible layers for segmented control
export const visible_layer_points = [
  "Total Displ.",
  "Hot Spot Analysis",
  "OFF",
];
export const visible_layer_subdiv = [
  "All",
  "Cempakaputih Barat",
  "Durensawit",
  "Kapukmuara",
  "Maphar",
  "Petukangan Selatan",
];

// Administrative boundary
export const admin_boudnary_layer_title = ["Kabupaten", "Kecamatan", "Desa"];

// Time series char filter
export const years_dropdown = [2025];
export const date_sar_suffix = "X";
export const dates_sar = [
  "X20250721",
  "X20250725",
  "X20250801",
  "X20250805",
  "X20250812",
  "X20250816",
  "X20250823",
  "X20250827",
  "X20250903",
  "X20250907",
  "X20250914",
  "X20250918",
  "X20250925",
  "X20250929",
  "X20251006",
];
export const latest_date_field = dates_sar[dates_sar.length - 1];

// Font and color
export const secondary_color = "#f7f5f7ff";
export const action_pane_title_font_size = "16px";
export const margin_left_pane_title = "7px";
export const margin_left_pane_item = "20px";
export const margin_right_pane_item = "5px";
export const margin_bottom_title_item = "0.6vh";

// Chart Panel
export const chart_div_height = "30vh";
export const scenario_type_field_name = "scenario";

export const chart_panel_height_default = "72%";
export const chart_panel_height_collapsed = "7%";
export const chart_inside_label_color_down_mmyr = "red";
export const chart_inside_label_color_up_mmyr = "#0095ffff";
export const chart_types_segmented_control = [
  "Total displ.(mm)",
  "0% reduced (future water extraction)",
  "25% reduced",
  "50% reduced",
  "75% reduced",
  "100% reduced",
];

// Symbology Renderer
// SAR Points renderer
export const view_maxScale_tile = 4540.19999912944;
export const view_minScale = 5000;
export const view_minScale_zoom = 7500;
export const view_maxScale = 0;
export const point_color = ["#e04635e6", "#f9fecc1a", "#5f87c1e6"];

// Hot Spot renderer
export const values_hotspot = [-3, -2, -1, 0, 1, 2, 3];
export const color_hotspot = [
  "#D62F27",
  "#ED7551",
  "#FAB984",
  [0, 0, 0, 0], //'#9C9C9C', // Not Significant
  "#C0CCBE",
  "#849EBA",
  "#4575B5",
];

// export const label_hotspot = [
//   "Downward with 99% Confidence", // significant land subsidence
//   "Downward with 95% Confidence",
//   "Downward with 90% Confidence",
//   "Not Significant",
//   "Upward with 90% Confidence",
//   "Upward with 95% Confidence",
//   "Upward with 99% Confidence",
// ];

export const label_hotspot = [
  "Subsided with 99% Confidence", // significant land subsidence
  "Subsided with 95% Confidence",
  "Subsided with 90% Confidence",
  "Not Significant",
  "Elevated with 90% Confidence",
  "Elevated with 95% Confidence",
  "Elevated with 99% Confidence",
];

// Minimum and maximum record
export const ref_point_id = 1988268;

export async function defineActions(event) {
  const { item } = event;

  // Expand the GroupLayer as default
  if (
    item.title === "Magnitude of Land Subsidence" ||
    item.title === "Land Subsidence" ||
    item.title === "Admin. Boundary Layers"
  ) {
    item.open = true;
  }

  item.title === admin_boudnary_layer_title[1] ||
  item.title === admin_boudnary_layer_title[2] ||
  item.title === hot_spot_analysis_layer_title
    ? (item.visible = false)
    : (item.visible = true);
}
