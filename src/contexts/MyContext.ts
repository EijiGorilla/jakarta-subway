import { createContext } from "react";

type MyActionEventContextType = {
  startyear: any;
  endyear: any;
  newdates: any;
  referenceid: any;
  selectedid: any;
  selectedkabupaten: any;
  selectedareaforscenario: any;
  clickedexportexcel: any;
  viewchange: any;
  is3D: any;
  viewpoint: any;
  activewidget: any;
  elevprofileready: any;
  layerviewreset: any;
  updateStartyear: any;
  updateEndyear: any;
  updateNewdates: any;
  updateReferenceid: any;
  updateSelectedid: any;
  updateSelectedkabupaten: any;
  updateSelectedareforscenario: any;
  updateClickedexportexcel: any;
  updateViewchange: any;
  updateIs3D: any;
  updateViewpoint: any;
  updateActivewidget: any;
  updateElevprofileready: any;
  updateLayerviewreset: any;
};

const initialState = {
  startyear: undefined,
  endyear: undefined,
  newdates: undefined,
  referenceid: undefined,
  selectedid: undefined,
  selectedkabupaten: undefined,
  selectedareaforscenario: undefined,
  clickedexportexcel: undefined,
  viewchange: undefined,
  is3D: undefined,
  viewpoint: undefined,
  activewidget: undefined,
  elevprofileready: undefined,
  layerviewreset: undefined,
  updateStartyear: undefined,
  updateEndyear: undefined,
  updateNewdates: undefined,
  updateReferenceid: undefined,
  updateSelectedid: undefined,
  updateSelectedkabupaten: undefined,
  updateSelectedareforscenario: undefined,
  updateClickedexportexcel: undefined,
  updateViewchange: undefined,
  updateIs3D: undefined,
  updateViewpoint: undefined,
  updateActivewidget: undefined,
  updateElevprofileready: undefined,
  updateLayerviewreset: undefined,
};

export const MyContext = createContext<MyActionEventContextType>({
  ...initialState,
});
