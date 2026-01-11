import { useEffect, use, useState } from "react";
import {
  highlightPointHoverGrapchicsLayer,
  hot_spot_layer,
  sar_points_layer,
} from "../layers";
import { object_id } from "../uniqueValues";
import { MyContext } from "../contexts/MyContext";
import { generateChartData } from "../Query";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";

export default function SelectedPointId() {
  const { updateSelectedid, updateChartdata, viewchange, newdates } =
    use(MyContext);
  const [selected, setSelected] = useState();
  const [highlightedLayer, setHighlightedLayer] =
    useState<FeatureLayer>(sar_points_layer);

  reactiveUtils.watch(
    () => sar_points_layer.visible,
    (visible) => {
      if (visible) {
        setHighlightedLayer(sar_points_layer);
      } else {
        setHighlightedLayer(hot_spot_layer);
      }
    }
  );

  useEffect(() => {
    let highlight: any; // Variable to hold the highlight handle
    let selectedFeatures: any = []; // Array to store ObjectIDs of selected features

    sar_points_layer.when(() => {
      const arcgisMap = document.querySelector(viewchange);

      arcgisMap?.view.on("click", (event: any) => {
        // Remove highlighted custom points
        arcgisMap.map.remove(highlightPointHoverGrapchicsLayer);
        arcgisMap?.view.hitTest(event).then((response: any) => {
          const result: any = response.results[0];

          if (result) {
            const ctrlKey = event.native.ctrlKey || event.native.metakey;
            const objectId = result.graphic.attributes[object_id];

            if (ctrlKey) {
              const index = selectedFeatures.indexOf(objectId);
              if (index > -1) {
                // Feature is already selected, remove it. When the same point is clicked, index = 0.
                selectedFeatures.splice(index, 1);
              } else {
                selectedFeatures.push(objectId);
              }
            } else {
              // If Ctrl is not held, clear previous selections and select only the new one
              selectedFeatures = [objectId];
            }

            highlight && highlight.remove();

            // For higlight
            arcgisMap
              ?.whenLayerView(highlightedLayer)
              .then((layerView: any) => {
                highlight = layerView?.highlight(selectedFeatures, {
                  name: "default",
                });
              });
          } else if (!event.native.ctrlKey && !event.native.metaKey) {
            // If the user clicks on an empty area without the modifier key, clear selection
            highlight && highlight.remove();
            selectedFeatures = [];
          }

          // Sort selected point IDs
          selectedFeatures &&
            selectedFeatures.sort((a: number, b: number) => {
              return a - b;
            });

          updateSelectedid(selectedFeatures);
          setSelected(selectedFeatures);
        });
      });
    });
  }, [newdates, highlightedLayer]);

  useEffect(() => {
    // Update chart when time period is changed.
    generateChartData(selected, newdates).then((response: any) => {
      updateChartdata(response);
    });
  }, [newdates, selected]);
  return <></>;
}
