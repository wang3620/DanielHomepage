import React, { useState, useEffect } from 'react';
import { Map } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { Select, Alert, Row, Col, message, Spin, Button } from 'antd';
import axios from 'axios';

const INITIAL_VIEW_STATE = {
  longitude: -122.19,
  latitude: 47.62,
  zoom: 9,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

export default function Mapbox() {
  const [selectValue, setSelectValue] = useState('mysql');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.IP_LOCATION_DATA_URL}?type=${selectValue}`)
      .then((res) => {
        setData(res.data.data);
        message.info(`It takes ${res.data.backendQueryTimeMs}ms to query in backend`);
      })
      .catch((error) => {
        if (error.response) {
          // https://axios-http.com/docs/handling_errors
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          message.error(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
      })
      .finally(() => setLoading(false));
  }, [selectValue]);
  const layers = [
    new HeatmapLayer({
      data: data,
      id: 'heatmp-layer',
      pickable: false,
      getPosition: (d) => [d[0], d[1]],
      getWeight: (d) => d[2],
      radiusPixels: 1,
      intensity: 1,
      threshold: 0
    })
  ];
  return (
    <div>
      <Spin spinning={loading}>
        <Row gutter={[8]} align="middle">
          <Col>
            <Select
              defaultValue={'mysql'}
              onChange={(value) => setSelectValue(value)}
              style={{ width: 200 }}>
              <Select.Option value={'mysql'}>mysql</Select.Option>
              <Select.Option value={'redis'}>redis</Select.Option>
            </Select>
          </Col>
          <Col>
            <Alert
              // this message needs to be in sync with our backend logic
              message="Currently it's only fetching the latest 200 record from our backend"
              type="info"
              showIcon
            />
          </Col>
          <Col>
            <Button
              type={'primary'}
              onClick={() => {
                window.location.href = `https://${window.location.hostname}`;
              }}>
              Go Back to Home Page
            </Button>
          </Col>
        </Row>
      </Spin>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        style={{ marginTop: 50, marginBottom: 200 }}>
        <Map reuseMaps mapLib={maplibregl} mapStyle={MAP_STYLE} preventStyleDiffing={true} />
      </DeckGL>
    </div>
  );
}
