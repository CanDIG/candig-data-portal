// project imports
import config from 'config';

// action - state management
import * as actionTypes from './actions';

export const initialState = {
    isOpen: [], // for active default menu
    fontFamily: config.fontFamily,
    borderRadius: config.borderRadius,
    opened: false
};

// ===========================|| CUSTOMIZATION REDUCER ||=========================== //

const customizationReducer = (state = initialState, action = {}) => {
    let id;
    switch (action.type) {
        case actionTypes.MENU_OPEN:
            id = action.id;
            return {
                ...state,
                isOpen: [id]
            };
        case actionTypes.SET_MENU:
            return {
                ...state,
                opened: action.opened
            };
        case actionTypes.SET_FONT_FAMILY:
            return {
                ...state,
                fontFamily: action.fontFamily
            };
        case actionTypes.SET_BORDER_RADIUS:
            return {
                ...state,
                borderRadius: action.borderRadius
            };
        case 'SET_SELECTED_CLINICAL_SEARCH_RESULTS':
            return {
                ...state,
                clinicalSearch: {
                    ...action.payload
                }
            };
        case 'SET_CLINICAL_SEARCH_PATIENTS':
            return {
                ...state,
                clinicalSearchResultPatients: {
                    ...action.payload
                }
            };
        case 'SET_SELECTED_DATASET':
            return {
                ...state,
                selectedDataset: action.payload
            };
        case 'SET_DATASETS':
            return {
                ...state,
                datasets: {
                    ...action.payload
                }
            };
        case 'SET_UPDATE_STATE':
            return {
                ...state,
                update: {
                    ...action.payload
                }
            };
        default:
            return {
                ...state,
                clinicalSearch: {
                    clinicalSearchDropDowns: {
                        selectedMedications: 'All',
                        selectedConditions: 'All',
                        selectedSex: 'All',
                        selectedCancerType: 'All',
                        selectedHistologicalType: 'All'
                    },
                    selectedClinicalSearchResults: {}
                },
                clinicalSearchResultPatients: {
                    data: {}
                },
                selectedDataset: '',
                datasets: {},
                update: {
                    datasetName: '',
                    datasetId: ''
                }
            };
    }
};

export default customizationReducer;
