import { useReducer, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import mapDataCanada from '@highcharts/map-collection/countries/ca/ca-all.geo.json';
import PropTypes from 'prop-types';

import { trackPromise } from 'ui-component/LoadingIndicator/LoadingIndicator';
import MainCard from 'ui-component/cards/MainCard';
import config from 'config';

// Initialize HighchartsMap
HighchartsMap(Highcharts);
const initialState = {
    title: {
        text: 'Data Source',
        align: config.isDHDP ? 'left' : undefined,
        style: {
            color: config.isDHDP ? '##00434F' : undefined,
            fontFamily: config.isDHDP ? 'Montserrat' : undefined,
            fontSize: config.isDHDP ? 14 : undefined,
            fontWeight: config.isDHDP ? 'bold' : 'normal'
        }
    },
    credits: {
        enabled: false
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },
    colorAxis: {
        min: 0,
        nullColor: config.isDHDP ? '#B0DAE1' : undefined,
        minColor: config.isDHDP ? '#B0DAE1' : '#E4FFE9',
        maxColor: config.isDHDP ? '#00879D' : '#36B84C'
    },
    negativeColor: config.isDHDP ? '#B0DAE1' : undefined,
    nullColor: config.isDHDP ? '#B0DAE1' : undefined,
    nullInteraction: false,
    series: [
        {
            type: 'map',
            name: 'Province',
            mapData: mapDataCanada,
            states: {
                hover: {
                    color: config.isDHDP ? '#00879D' : '#1E88E5',
                    borderColor: config.isDHDP ? '#003D47' : undefined
                },
                select: {
                    color: config.isDHDP ? '#B0DAE1' : undefined
                },
                normal: {
                    color: config.isDHDP ? '#B0DAE1' : undefined
                }
            }
        }
    ],
    exporting: {
        enabled: false
    }
};

function reducer(state, action) {
    switch (action.type) {
        case 'addSeries':
            return {
                ...state,
                ...{
                    series: [
                        {
                            data: action.payload,
                            type: 'map',
                            name: 'Province',
                            mapData: mapDataCanada,
                            tooltip: {
                                pointFormat: '<b>{point.name}</b><br>- Patients {point.value}'
                            }
                        }
                    ]
                }
            };
        default:
            throw new Error();
    }
}
function TreatingCentreMap({ data }) {
    const [chartOptions, dispatchChartOptions] = useReducer(reducer, initialState);

    useEffect(() => {
        const payload = [];
        Object.keys(data).forEach((province) => {
            payload.push([province, data[province]]);
        });
        const updateChart = new Promise((resolve) => {
            dispatchChartOptions({
                type: 'addSeries',
                payload
            });
            resolve();
        });

        trackPromise(updateChart);
    }, [data]);

    return (
        <MainCard>
            <HighchartsReact options={chartOptions} highcharts={Highcharts} constructorType="mapChart" />
        </MainCard>
    );
}

TreatingCentreMap.propTypes = {
    data: PropTypes.object.isRequired
};

export default TreatingCentreMap;
