import { useEffect, use, useState } from "react";
import { sar_points_layer } from "../layers";
import { object_id } from "../uniqueValues";
import { MyContext } from "../contexts/MyContext";

export default function SelectedPointId() {
  const { updateSelectedid, layerviewreset, viewchange } = use(MyContext);

  useEffect(() => {
    let highlight: any; // Variable to hold the highlight handle
    let selectedFeatures: any = []; // Array to store ObjectIDs of selected features
    let layerView: any;
    const arcgisMap = document.querySelector(viewchange);

    sar_points_layer.when(() => {
      // For higlight
      // arcgisMap.whenLayerView(sar_points_layer).then((lv: any) => {
      //   layerView = lv;
      // });

      arcgisMap?.view.on("click", (event: any) => {
        arcgisMap?.view.hitTest(event).then((response: any) => {
          const result: any = response.results[0];
          const title = result?.graphic?.layer?.title;

          if (result) {
            const ctrlKey = event.native.ctrlKey || event.native.metakey;
            const objectId = result.graphic.attributes[object_id];
            if (ctrlKey) {
              console.log("holded ctrKey");
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
            console.log(selectedFeatures);
            updateSelectedid(selectedFeatures);

            if (highlight) {
              highlight.remove(); // Remove previous highlight
            }

            // highlight = layerView?.highlight(selectedFeatures, {
            //   name: "default",
            // });
          } else if (!event.native.ctrlKey && !event.native.metaKey) {
            // If the user clicks on an empty area without the modifier key, clear selection
            // if (highlight) {
            //   highlight.remove();
            // }
            selectedFeatures = [];
            updateSelectedid(null);
          }

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
