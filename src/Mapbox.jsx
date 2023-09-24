import React, { useState } from 'react';
import { Map } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { Select, Alert, Row } from 'antd';

const INITIAL_VIEW_STATE = {
  longitude: -122.19,
  latitude: 47.62,
  zoom: 9,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

export default function Mapbox({
  intensity = 1,
  threshold = 0,
  radiusPixels = 1,
  mapStyle = MAP_STYLE
}) {
  const [selectValue, setSelectValue] = useState('mysql');
  const layers = [
    new HeatmapLayer({
      data: `${process.env.IP_LOCATION_DATA_URL}?type=${selectValue}`,
      id: 'heatmp-layer',
      pickable: false,
      getPosition: (d) => [d[0], d[1]],
      getWeight: (d) => d[2],
      radiusPixels,
      intensity,
      threshold
    })
  ];
  return (
    <div>
      <Row>
        <Select
          defaultValue={'mysql'}
          onChange={(value) => setSelectValue(value)}
          style={{ width: 200 }}>
          <Select.Option value={'mysql'}>mysql</Select.Option>
          <Select.Option value={'redis'}>redis</Select.Option>
        </Select>
        <Alert
          message="Currently it's only fetching the latest 30 record from our backend"
          type="info"
          showIcon
        />
      </Row>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        style={{ marginTop: 50, marginBottom: 200 }}>
        <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
      </DeckGL>
    </div>
  );
}
