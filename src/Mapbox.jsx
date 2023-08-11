import React from 'react';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';

const mariadb = require('mariadb');
const pool = mariadb.createPool({
    host: 'localhost',
    user:'daniel',
    password: '7777',
    database: "danielHomepage",
    connectionLimit: 5
});

const DATA_URL =
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/screen-grid/uber-pickup-locations.json'; // eslint-disable-line

const INITIAL_VIEW_STATE = {
    longitude: -73.75,
    latitude: 40.73,
    zoom: 9,
    maxZoom: 16,
    pitch: 0,
    bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

export default async function Mapbox({
                                         data = DATA_URL,
                                intensity = 1,
                                threshold = 0.03,
                                radiusPixels = 30,
                                mapStyle = MAP_STYLE
                            }) {
    let conn;
    try {
        conn = await pool.getConnection();
        const res = await conn.query("select * from ip_location_history");
        console.log(res);
        const layers = [
            new HeatmapLayer({
                data,
                id: 'heatmp-layer',
                pickable: false,
                getPosition: d => [d[0], d[1]],
                getWeight: d => d[2],
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
    } catch (err) {
        return <div>error in init</div>
    }
}