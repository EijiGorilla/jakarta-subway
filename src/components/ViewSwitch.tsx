import "@esri/calcite-components/dist/components/calcite-button";
import { CalciteButton } from "@esri/calcite-components-react";
import { use, useState, useEffect } from "react";
import Viewpoint from "@arcgis/core/Viewpoint";
import { MyContext } from "../contexts/MyContext";

export default function ViewSwitch() {
  const { updateViewchange, updateIs3D, updateViewpoint, is3D } =
    use(MyContext);

  const [labelViewtype, setLabelViewtype] = useState("2D");
  const arcgisMap = document.querySelector(
    is3D === false ? "arcgis-map" : "arcgis-scene"
  );

  const switchView = () => {
    // current viewpoint
    const activeViewpoint: any = arcgisMap?.view.viewpoint.clone();

    // Compute scale conversion factor with cosine of latitude to
    // account for distance distortion as latitude moves away from the equator
    const latitude: any = arcgisMap?.view.center.latitude;
    const scaleConversionFactor = Math.cos((latitude * Math.PI) / 180.0);

    // Toggle the view state
    // setIs3D((prev) => !prev);
    updateIs3D((prev: any) => !prev);

    // note that is3D is not synchronouslly updated with useState when
    // used inside the same function.
    // So, you cannot use this updated is3D. To address, you can simply
    // swap as below between true and false.
    if (is3D === false ? true : false) {
      activeViewpoint.scale /= scaleConversionFactor;
      const newScale = activeViewpoint.scale;
      console.log(newScale);
      const newTargetGeometry = activeViewpoint.targetGeometry;
      const newViewpoint = new Viewpoint({
        scale: newScale,
        targetGeometry: newTargetGeometry,
      });
      updateViewpoint(newViewpoint);
      setLabelViewtype("3D");
    } else {
      activeViewpoint.scale *= scaleConversionFactor;
      const newScale = activeViewpoint.scale;
      const newTargetGeometry = activeViewpoint.targetGeometry;
      const newViewpoint = new Viewpoint({
        scale: newScale,
        targetGeometry: newTargetGeometry,
      });
      updateViewpoint(newViewpoint);
      setLabelViewtype("2D");
    }
  };

  useEffect(() => {
    updateViewchange(is3D === false ? "arcgis-map" : "arcgis-scene");
  }, [is3D]);

  return (
    <div
      style={{
        position: "fixed",
        zIndex: 10,
        backgroundColor: "#252525",
        marginLeft: "5px",
        marginTop: "5px",
      }}
    >
      <CalciteButton onClick={switchView} label="3D">
        <span style={{ color: "white" }}>{labelViewtype}</span>
      </CalciteButton>
    </div>
  );
}
