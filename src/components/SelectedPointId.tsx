import { useEffect, use, useState, useRef } from "react";
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
  const {
    updateSelectedid,
    updateChartdata,
    viewchange,
    newdates,
    resetchart,
  } = use(MyContext);
  const [selected, setSelected] = useState();

  // layerview.highlight is non-serializable object (i.e., untranslatable into another format)
  // In this case, useState hook fails, so use useRef instead to store the non-serializable object.
  const highlightLayerHandle = useRef<FeatureLayer | any>(sar_points_layer);
  const highlightHandle = useRef<FeatureLayer | any>(null);

  const resetChartAll = () => {
    highlightHandle.current && highlightHandle.current.remove();
    setSelected(undefined);
    highlightPointHoverGrapchicsLayer &&
      highlightPointHoverGrapchicsLayer.removeAll();
  };

  reactiveUtils.watch(
    () => sar_points_layer.visible,
    (visible) => {
      resetChartAll();
      if (visible) {
        highlightLayerHandle.current = sar_points_layer;
        resetChartAll();
      } else {
        highlightLayerHandle.current = hot_spot_layer;
        resetChartAll();
      }
    },
  );

  useEffect(() => {
    let selectedFeatures: any = []; // Array to store ObjectIDs of selected features

    highlightLayerHandle.current.when(() => {
      const arcgisMap = document.querySelector(viewchange);

      arcgisMap?.view.on("click", (event: any) => {
        // Remove highlighted custom points
        arcgisMap.map.remove(highlightPointHoverGrapchicsLayer);

        arcgisMap?.view.hitTest(event).then((response: any) => {
          const result: any = response.results[0];

          if (!result?.graphic?.layer) {
            return; // do nothing
          } else if (result) {
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
            highlightHandle.current && highlightHandle.current.remove();

            // For higlight
            arcgisMap
              ?.whenLayerView(highlightLayerHandle.current)
              .then((layerView: any) => {
                highlightHandle.current = layerView?.highlight(
                  selectedFeatures,
                  {
                    name: "default",
                  },
                );
              });

            // highlightHandle.current && highlightHandle.current.remove();

            // Sort selected point IDs
            selectedFeatures &&
              selectedFeatures.sort((a: number, b: number) => {
                return a - b;
              });

            updateSelectedid(selectedFeatures);
            setSelected(selectedFeatures);
            generateChartData(selectedFeatures, newdates).then(
              (response: any) => {
                updateChartdata(response);
              },
            );
          }
        });
      });
    });
  }, [newdates, highlightHandle]);

  useEffect(() => {
    resetChartAll();
  }, [resetchart]);

  useEffect(() => {
    generateChartData(selected, newdates).then((response: any) => {
      updateChartdata(response);
    });
  }, [newdates, selected]);
  return <></>;
}
