import { use } from "react";
import "@esri/calcite-components/dist/components/calcite-button";
import { CalciteButton } from "@esri/calcite-components-react";
import { MyContext } from "../contexts/MyContext";

export default function ExportExcel() {
  const { clickedexportexcel, updateClickedexportexcel, elevprofileready } =
    use(MyContext);

  return (
    <>
      {elevprofileready === "ready" ? (
        <div></div>
      ) : (
        <CalciteButton
          onClick={() =>
            updateClickedexportexcel(
              clickedexportexcel === false ? true : false
            )
          }
          slot="trigger"
          scale="s"
          appearance="solid"
          icon-start="file-excel"
          style={{
            "--calcite-button-background-color": "#0079C1",
            marginLeft: "auto",
            marginRight: "10px",
            marginTop: "5px",
          }}
        >
          <span style={{ color: "white" }}>Export to Excel</span>
        </CalciteButton>
      )}
    </>
  );
}
