import React from 'react';
import { Map } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';

// const DATA_URL =
//   'http://officialdaniel.com/ip_location_history'; // todo -- not sure why this doesn't work

const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/screen-grid/uber-pickup-locations.json';

const INITIAL_VIEW_STATE = {
  longitude: -73.75,
  latitude: 40.73, // todo -- change to the following location once we figure out why it doesn't work
  // longitude: -122.19,
  // latitude: 47.62,
  zoom: 9,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

export default function Mapbox({
  data = DATA_URL,
  intensity = 1,
  threshold = 0,
  radiusPixels = 30,
  mapStyle = MAP_STYLE
}) {
  const layers = [
    new HeatmapLayer({
      data,
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
    <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={layers}>
      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}
