import { useReducer, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import mapDataCanada from '@highcharts/map-collection/countries/ca/ca-all.geo.json';
import PropTypes from 'prop-types';

import { LoadingIndicator, usePromiseTracker, trackPromise } from 'ui-component/LoadingIndicator/LoadingIndicator';
import MainCard from 'ui-component/cards/MainCard';

// Initialize HighchartsMap
HighchartsMap(Highcharts);
const initialState = {
    title: {
        text: 'CanDIG Data Source'
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
        minColor: '#E4FFE9',
        maxColor: '#36B84C'
    },
    series: [
        {
            type: 'map',
            name: 'Province',
            mapData: mapDataCanada,
            states: {
                hover: {
                    color: '#1E88E5'
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
    const { promiseInProgress } = usePromiseTracker();
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
            {promiseInProgress ? (
                <LoadingIndicator />
            ) : (
                <HighchartsReact options={chartOptions} highcharts={Highcharts} constructorType="mapChart" />
            )}
        </MainCard>
    );
}

TreatingCentreMap.propTypes = {
    data: PropTypes.object.isRequired
};

export default TreatingCentreMap;
