import "@arcgis/map-components/components/arcgis-elevation-profile";
import { use } from "react";
import { MyContext } from "../contexts/MyContext";

export default function ElevationProfile() {
  const { viewchange } = use(MyContext);

  const elevationProfileElement = document.querySelector(
    "arcgis-elevation-profile"
  );

  // elevationProfileElement.unitOptions = [
  //   { distance: "kilometers" },
  //   { elevation: "millimeters" },
  // ];

  return (
    <>
      <arcgis-elevation-profile
        referenceElement={viewchange}
        slot="bottom-right"
        unit="millimeters"
      ></arcgis-elevation-profile>
    </>
  );
}
