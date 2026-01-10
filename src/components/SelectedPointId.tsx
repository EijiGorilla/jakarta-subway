import { useEffect, use } from "react";
import { highlightPointHoverGrapchicsLayer, sar_points_layer } from "../layers";
import { object_id } from "../uniqueValues";
import { MyContext } from "../contexts/MyContext";
import { generateChartData } from "../Query";

export default function SelectedPointId() {
  const { updateSelectedid, updateChartdata, viewchange, newdates } =
    use(MyContext);

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
          // const title = result?.graphic?.layer?.title;

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
              ?.whenLayerView(sar_points_layer)
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
          generateChartData(selectedFeatures, newdates).then(
            (response: any) => {
              updateChartdata(response);
            }
          );
          // if (!title) {
          //   updateSelectedid(null);
          //   updateSelectedareforscenario(null);
          // } else if (title === "Kabupaten") {
          //   updateSelectedid(null);
          //   updateSelectedareforscenario(result.graphic.attributes["namobj"]);

          //   // Highlight boundary
          //   updateSelectedkabupaten(result.graphic.attributes[object_id]);
          // } else if (
          //   title === sar_point_layer_title ||
          //   hot_spot_analysis_layer_title
          // ) {
          //   updateSelectedid(result.graphic.attributes[object_id]);
          //   updateSelectedareforscenario(null);

          //   if (title === sar_point_layer_title) {
          //     setLayerViewFeatureLayer(sar_points_layer);
          //   } else if (title === hot_spot_analysis_layer_title) {
          //     setLayerViewFeatureLayer(hot_spot_layer);
          //   }
          // }
        });
      });
    });
  }, []);
  return <></>;
}
