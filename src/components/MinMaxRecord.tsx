import { useState, useEffect, use } from 'react';
import '@esri/calcite-components/dist/components/calcite-button';
import { CalciteButton } from '@esri/calcite-components-react';
import {
  getMinMaxRecords,
  getReferencePointValueForSubtraction,
  thousands_separators,
  zoomToMinMaxRecord,
} from '../Query';
import { date_sar_suffix, margin_bottom_title_item, secondary_color } from '../uniqueValues';
import { MyContext } from '../contexts/MyContext';

/////////////////////////////////////
export default function MinMaxRecord() {
  const { newdates, referenceid, is3D } = use(MyContext);
  const arcgisMap = document.querySelector(is3D === false ? 'arcgis-map' : 'arcgis-scene');

  const [referencePointData, setReferencePointData] = useState<any>();
  const [minRecord, setMinRecord] = useState<any>();
  const [maxRecord, setMaxRecord] = useState<any>();
  const [originalMinRecordForZoom, setOriginalMinRecordForZoom] = useState<any>();
  const [originalMaxRecordForZoom, setOriginalMaxRecordForZoom] = useState<any>();
  const [zoomClickMin, setZoomClickMin] = useState<boolean>(false);
  const [zoomClickMax, setZoomClickMax] = useState<boolean>(false);
  const [newEndYearDate, setNewEndYearDate] = useState<any>();

  // Get reference point values for subtraction
  useEffect(() => {
    getReferencePointValueForSubtraction(referenceid).then((response: any) => {
      setReferencePointData(response);
    });
  }, [referenceid]);

  useEffect(() => {
    // Update a reference point value with new end-year-date
    const dateString = newdates[newdates.length - 1].replace(date_sar_suffix, '');
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const date_n = new Date(year, month - 1, day);
    date_n.setHours(0, 0, 0, 0);
    const ref_new_date = date_n.getTime();
    // Get a reference value on the latest date being selected (i.e., subtracting value)

    // console.log(referencePointData);
    const find = referencePointData?.filter((elem: any) => elem.date === ref_new_date);
    const ref_value = find ? find[0].value : 0;

    // New end-year date for filter
    setNewEndYearDate(newdates[newdates.length - 1]); // get the last one

    // Excecute functions
    getMinMaxRecords(newdates).then((response: any) => {
      setOriginalMinRecordForZoom(response.min_value);
      setOriginalMaxRecordForZoom(response.max_value);
      const minimum = thousands_separators((response.min_value - ref_value).toFixed(2));
      const maximum = thousands_separators((response.max_value - ref_value).toFixed(2));
      setMinRecord(minimum);
      setMaxRecord(maximum);
    });
  }, [referencePointData, newdates]);

  useEffect(() => {
    if (originalMinRecordForZoom) {
      // wait until this record is read.
      zoomToMinMaxRecord(arcgisMap, originalMinRecordForZoom, newEndYearDate);
    }
  }, [zoomClickMin]);

  useEffect(() => {
    if (originalMinRecordForZoom) {
      // wait until this record is read.
      zoomToMinMaxRecord(arcgisMap, originalMaxRecordForZoom, newEndYearDate);
    }
  }, [zoomClickMax]);

  return (
    <div
      style={{
        display: 'flex',
        marginBottom: margin_bottom_title_item,
        justifyContent: 'space-between',
        marginRight: 'auto',
        marginLeft: 'auto',
      }}
    >
      {/* Minimum Record */}
      <div style={{ color: 'white', fontSize: '1.5rem' }}>
        <div style={{ color: secondary_color, fontSize: '1rem' }}>Minimum Record</div>
        <span style={{ color: 'white' }}>
          {minRecord}
          <span
            style={{
              color: secondary_color,
              fontSize: '0.9rem',
              paddingLeft: '5px',
            }}
          >
            mm
          </span>
        </span>
        <div>
          <CalciteButton
            id="minbutton"
            onClick={() => setZoomClickMin(zoomClickMin === false ? true : false)}
            slot="trigger"
            kind="inverse"
            scale="s"
            icon-start="layer-zoom-to"
          >
            <span style={{ color: '#ffffff' }}>Zoom to Min</span>
          </CalciteButton>
        </div>
      </div>

      {/* Maximum Record */}
      <div
        style={{
          color: 'white',
          fontSize: '1.5rem',
          marginRight: 'auto',
          marginLeft: '40px',
        }}
      >
        <div style={{ color: secondary_color, fontSize: '1rem' }}>Maximum Record</div>
        <span style={{ color: 'white', marginLeft: '5px' }}>
          {maxRecord}
          <span
            style={{
              color: secondary_color,
              fontSize: '0.9rem',
              paddingLeft: '5px',
            }}
          >
            mm
          </span>
        </span>
        <div>
          <CalciteButton
            id="maxbutton"
            onClick={() => setZoomClickMax(zoomClickMax === false ? true : false)}
            slot="trigger"
            kind="inverse"
            scale="s"
            icon-start="layer-zoom-to"
          >
            <span style={{ color: '#ffffff' }}>Zoom to Max</span>
          </CalciteButton>
        </div>
      </div>
    </div>
  );
}
