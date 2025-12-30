import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/calcite/calcite.css";
import { CalciteShell } from "@esri/calcite-components-react";
import { useState, useEffect } from "react";
import OAuthInfo from "@arcgis/core/identity/OAuthInfo";
import IdentityManager from "@arcgis/core/identity/IdentityManager";
import Portal from "@arcgis/core/portal/Portal";

import "./App.css";
import MapDisplay from "./components/MapDisplay";
import { dates_sar, initialViewpoint, years_dropdown } from "./uniqueValues";
import ChartPanel from "./components/ChartPanel";
import SelectedPointId from "./components/SelectedPointId";
import ExportExcel from "./components/ExportExcel";
import ViewSwitch from "./components/ViewSwitch";
import ActionPanel from "./components/ActionPanel";
import { MyContext } from "./contexts/MyContext";

function App() {
  // User Authentication
  const [loggedInState, setLoggedInState] = useState<boolean>(false);
  useEffect(() => {
    // Useful video: https://www.google.com/search?sca_esv=41638d9270b90df6&rlz=1C1CHBF_enPH1083PH1083&udm=7&fbs=AIIjpHxU7SXXniUZfeShr2fp4giZud1z6kQpMfoEdCJxnpm_3W-pLdZZVzNY_L9_ftx08kwv-_tUbRt8pOUS8_MjaceHuSAD6YvWZ0rfFzwmtmaBgLepZn2IJkVH-w3cPU5sPVz9l1Pp06apNShUnFfpGUJOF8p91U6HxH3ukND0OVTTVy0CGuHNdViLZqynGb0mLSRGeGVO46qnJ_2yk3F0uV6R6BW9rQ&q=apply+user+authentication+using+arcgis+maps+sdk+for+javascript+for+arcgis+enterprise&sa=X&ved=2ahUKEwjVqZbdlLKQAxUtmq8BHVQQCHcQtKgLegQIGRAB&biw=1920&bih=911&dpr=1#fpstate=ive&vld=cid:fcf356be,vid:hQH9d1vc8Gc,st:0
    // check app authentication: https://developers.arcgis.com/documentation/security-and-authentication/app-authentication/how-to-implement-app-authentication/
    const info = new OAuthInfo({
      appId: "akGfF7aeu24Z5bFn",
      popup: false,
      portalUrl: "https://gis.railway-sector.com/portal",
    });

    IdentityManager.registerOAuthInfos([info]);
    async function loginAndLoadPortal() {
      try {
        await IdentityManager.checkSignInStatus(info.portalUrl + "/sharing");
        const portal: any = new Portal({
          // access: "public",
          url: info.portalUrl,
          authMode: "no-prompt",
        });
        portal.load().then(() => {
          setLoggedInState(true);
          console.log("Logged in as: ", portal.user.username);
        });
      } catch (error) {
        console.error("Authentication error:", error);
        IdentityManager.getCredential(info.portalUrl);
      }
    }
    loginAndLoadPortal();
  }, []);

  // createContext
  const [startyear, setStartYear] = useState<any>(years_dropdown[0]);
  const [endyear, setEndYear] = useState<any>(
    years_dropdown[years_dropdown.length - 1]
  );
  const [newdates, setNewDates] = useState<any>(dates_sar);
  const [referenceid, setReferenceid] = useState<any>();
  const [selectedid, setSelectedid] = useState<any>();
  const [selectedkabupaten, setSelectedkabupaten] = useState<any>();
  const [selectedareaforscenario, setSelectedareaforscenario] = useState<any>();
  const [clickedexportexcel, setClickedexportexcel] = useState<boolean>(false);
  const [viewchange, setViewchange] = useState<any>("arcgis-map");
  const [is3D, setIs3D] = useState(false);
  const [viewpoint, setViewpoint] = useState(initialViewpoint);
  const [activewidget, setActivewidget] = useState("layers");
  const updateStartyear = (newStartyear: any) => {
    setStartYear(newStartyear);
  };

  const updateEndyear = (newEndyear: any) => {
    setEndYear(newEndyear);
  };

  const updateNewdates = (newDates: any) => {
    setNewDates(newDates);
  };

  const updateReferenceid = (newid: any) => {
    setReferenceid(newid);
  };

  const updateSelectedid = (newSelectedid: any) => {
    setSelectedid(newSelectedid);
  };

  const updateSelectedkabupaten = (newkabupaten: any) => {
    setSelectedkabupaten(newkabupaten);
  };

  const updateSelectedareforscenario = (newarea: any) => {
    setSelectedareaforscenario(newarea);
  };

  const updateClickedexportexcel = (newClick: any) => {
    setClickedexportexcel(newClick);
  };

  const updateViewchange = (newView: any) => {
    setViewchange(newView);
  };

  const updateIs3D = (newViewtype: any) => {
    setIs3D(newViewtype);
  };

  const updateViewpoint = (newViewpoint: any) => {
    setViewpoint(newViewpoint);
  };

  const updateActivewidget = (newWidget: any) => {
    setActivewidget(newWidget);
  };

  return (
    <>
      {loggedInState === true ? (
        <CalciteShell>
          <MyContext
            value={{
              startyear,
              endyear,
              newdates,
              referenceid,
              selectedid,
              selectedkabupaten,
              selectedareaforscenario,
              clickedexportexcel,
              viewchange,
              is3D,
              viewpoint,
              activewidget,
              updateStartyear,
              updateEndyear,
              updateNewdates,
              updateReferenceid,
              updateSelectedid,
              updateSelectedkabupaten,
              updateSelectedareforscenario,
              updateClickedexportexcel,
              updateViewchange,
              updateIs3D,
              updateViewpoint,
              updateActivewidget,
            }}
          >
            <ViewSwitch />
            <ActionPanel />
            <MapDisplay />
            <ChartPanel />
            <SelectedPointId />
            <ExportExcel />
          </MyContext>
        </CalciteShell>
      ) : (
        <div></div>
      )}
    </>
  );
}

export default App;
