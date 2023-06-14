import { useEffect, useState } from 'react';

import { Box, Button, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { TreeView, TreeItem } from '@mui/lab';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useSearchResultsReaderContext } from '../SearchResultsContext';

const useStyles = makeStyles((theme) => {
    return {
        label: {
            textTransform: "capitalize",
            display: "inline-flex"
        }
    };
    });
    

const TEST_PATIENT = {
    "biomarkers": [],
    "cause_of_death": "Unknown",
    "comorbidities": [],
    "date_alive_after_lost_to_followup": "2022-03",
    "date_of_birth": "1987-09",
    "date_of_death": "2015-09",
    "exposures": [],
    "gender": "Woman",
    "is_deceased": true,
    "lost_to_followup_after_clinical_event_identifier": "",
    "lost_to_followup_reason": "Not applicable",
    "primary_diagnoses": [
      {
        "basis_of_diagnosis": "Histology of a primary tumour",
        "biomarkers": [],
        "cancer_type_code": "C43.9",
        "clinical_m_category": "M1a(1)",
        "clinical_n_category": "N0(mol-)",
        "clinical_stage_group": "Stage IBS",
        "clinical_t_category": "T4b",
        "clinical_tumour_staging_system": "Binet staging system",
        "date_of_diagnosis": "2019-10",
        "laterality": "Bilateral",
        "lymph_nodes_examined_method": "Physical palpation of patient",
        "lymph_nodes_examined_status": "No lymph nodes found in resected specimen",
        "number_lymph_nodes_positive": 10,
        "specimens": [
          {
            "biomarkers": [],
            "pathological_m_category": "M0",
            "pathological_n_category": "N0(mol+)",
            "pathological_stage_group": "Stage IIBES",
            "pathological_t_category": "T3e",
            "pathological_tumour_staging_system": "Durie-Salmon staging system",
            "percent_tumour_cells_measurement_method": "Image analysis",
            "percent_tumour_cells_range": "20-50%",
            "reference_pathology_confirmed_diagnosis": "Unknown",
            "reference_pathology_confirmed_tumour_presence": "Not done",
            "sample_registrations": [
              {
                "sample_type": "Total RNA",
                "specimen_tissue_source": "Venous blood",
                "specimen_type": "Primary tumour - adjacent to normal",
                "submitter_sample_id": "SAMPLE_REGISTRATION_28",
                "tumour_normal_designation": "Tumour"
              }
            ],
            "specimen_anatomic_location": "C43.9",
            "specimen_collection_date": "2021-04-20",
            "specimen_laterality": "Right",
            "specimen_processing": "Other",
            "specimen_storage": "Paraffin block",
            "tumour_grade": "Grade Group 3",
            "tumour_grading_system": "Scarff-Bloom-Richardson grading system",
            "tumour_histological_type": "8124/9"
          }
        ],
        "submitter_primary_diagnosis_id": "PRIMARY_DIAGNOSIS_16",
        "treatments": [
          {
            "biomarkers": [],
            "chemotherapies": [],
            "days_per_cycle": 6,
            "followups": [
              {
                "anatomic_site_progression_or_recurrence": "C06",
                "biomarkers": [],
                "date_of_followup": "2022-09",
                "date_of_relapse": "2021-11",
                "disease_status_at_followup": "Stable",
                "method_of_progression_status": "Physical examination procedure (procedure)",
                "recurrence_m_category": "MX",
                "recurrence_n_category": "N0a",
                "recurrence_stage_group": "Stage IAES",
                "recurrence_t_category": "T2a2",
                "recurrence_tumour_staging_system": [
                  "Rai staging system",
                  "International Neuroblastoma Risk Group Staging System",
                  "AJCC 8th edition"
                ],
                "relapse_type": "Progression (liquid tumours)"
              }
            ],
            "hormone_therapies": [],
            "immunotherapies": [],
            "is_primary_treatment": "Yes",
            "line_of_treatment": 1,
            "number_of_cycles": 4,
            "radiation": null,
            "response_to_treatment_criteria_method": "Response Assessment in Neuro-Oncology (RANO)",
            "status_of_treatment": "Treatment incomplete due to technical or organizational problems",
            "submitter_treatment_id": "TREATMENT_22",
            "surgery": {
              "greatest_dimension_tumour": 5,
              "id": "dc2e58ae-a1e7-4a63-ae5b-346cbb53b021",
              "lymphovascular_invasion": "Unknown",
              "margin_types_involved": [
                "Unknown"
              ],
              "margin_types_not_assessed": [
                "Distal margin",
                "Proximal margin"
              ],
              "margin_types_not_involved": [
                "Circumferential resection margin"
              ],
              "perineural_invasion": "Unknown",
              "residual_tumour_classification": "R2",
              "submitter_specimen_id": null,
              "surgery_location": "Primary",
              "surgery_site": "C14",
              "surgery_type": "Pneumonectomy",
              "tumour_focality": "Unifocal",
              "tumour_length": 3,
              "tumour_width": 5
            },
            "treatment_end_date": "2022-07",
            "treatment_intent": "Diagnostic",
            "treatment_setting": "Neoadjuvant",
            "treatment_start_date": "2021-10"
          }
        ]
      }
    ],
    "primary_site": [
      "Esophagus",
      "Base of tongue",
      "Nasal cavity and middle ear"
    ],
    "program_id": "SYNTHETIC-2",
    "sex_at_birth": "Other",
    "submitter_donor_id": "DONOR_10"
  };

function isObject(obj) {
    return (typeof obj === 'object' && obj !== null);
}

const JSONTree = (props) => {
    const {id, label, json} = props;
    const classes = useStyles();
    let value = (typeof(json) === "number" || typeof(json) === "string") ? json :
                (typeof(json) === "boolean" ? String(json) : "");
    // Convert the label into a prettier variant
    let prettyLabel = typeof(label) === "string" ? label.replaceAll("_", " ") : label;

    return <TreeItem nodeId={id} label={
        <Box sx={{ justifyContent: "flex-start", alignItems: 'center', p: 0.5, pr: 0 }}>
            <Box color="inherit" sx={{ mr: 1 }} />
            <div className={classes.label}>
                <b>{prettyLabel}</b>
            </div> {value ? <>: {value}</> : ""}
        </Box>
    }>
        {Array.isArray(json) ? 
            // Displaying an array: return recursive JSONTrees, prefixed by their index
            (json.length > 0 ? json.map((value, i) =>
                <JSONTree id={id + "/" + i} label={i} json={value} key={i} />
            ) : <JSONTree id={id + "/empty"} label="empty" json={""} />)
        : isObject(json) ?
            // Displaying an object: return recursive JSONTrees, prefixed by their key
            Object.keys(json).map((key) =>
                <JSONTree id={id + "/" + key} label={key} json={json[key]} key={key} />
            )
        :
            // Displaying a single value -- we just need the outer TreeItem
            undefined
        }
    </TreeItem>
}

function PivotTable(props) {
    const resultsContext = useSearchResultsReaderContext();
    const patient = TEST_PATIENT; // resultsContext.selectedPatient;
    const [expanded, setExpanded] = useState([]);
    const [search, setSearch] = useState([]);
    console.log(expanded);

    const getAllChildIDs = (json, prefix) => {
        if (Array.isArray(json)) {
            return [prefix].concat(
                json.map((value, i) => getAllChildIDs(value, prefix + "/" + i))
                ).flat(1);
        } else if (isObject(json)) {
            return [prefix].concat(
                Object.keys(json).map((key) => getAllChildIDs(json[key], prefix + "/" + key))
                ).flat(1);
        }
        return [];
    }

    // Prune the patient entry according to search
    let prunedPatient = patient;
    if (search) {
        console.log(search);
        const recursivePrune = (json) => {
            if (Array.isArray(json)) {
                // Create a new array with pruned children
                let retVal = json.map((child) => recursivePrune(child)).filter((child) => child !== undefined);
                return retVal.length <= 0 ? undefined : retVal;
            } else if (isObject(json)) {
                // Find any key that matches the search
                let retVal = {};
                Object.keys(json).forEach(
                    (key) => {
                        if (key.indexOf(search) > 0) {
                            // include all children of a matching parent
                            retVal[key] = json[key];
                        }

                        // For all non-valid keys, there might be a valid child -- recurse downwards and prune
                        let childObj = recursivePrune(json[key]);
                        if (childObj !== undefined) {
                            retVal[key] = childObj;
                        }
                    });
                return Object.keys(retVal) > 0 ? retVal : undefined;
            } else if (typeof json === "string" && json.indexOf(search) > 0) {
                return json;
            }
            return undefined;
        }
      prunedPatient = recursivePrune(patient);
    }

    const handleExpandAll = () => {
        setExpanded( (old) =>
          old.length === 0 ? getAllChildIDs(prunedPatient, ".") : []
        );
    };

    const handleToggle = (_, nodeIds) => {
        setExpanded(nodeIds);
    };

    return (
        <Box mr={2} ml={1} p={1} pr={5} sx={{ border: 1, borderRadius: 2, boxShadow: 2 }}>
            <Box sx={{ display: "flex", alignItems: 'center', p: 0.5, pr: 0 }}>
                <Typography variant="h5" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
                    Patient Info
                </Typography>
                <Button onClick={handleExpandAll}>
                  {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
                </Button>
                <TextField
                    id="filled-search"
                    label="Search"
                    type="search"
                    variant="filled"
                    onChange={(event) => {setSearch(event.target.value)}}
                    />
            </Box>
            {prunedPatient ?
                <TreeView
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    expanded={expanded}
                    onNodeToggle={handleToggle}
                    >
                    <JSONTree id="." label={"Patient " + (prunedPatient?.submitter_donor_id || "")} json={prunedPatient} />
                </TreeView>
            :
                <Typography>Please select a patient to see results</Typography>
            }
        </Box>
    );
}

export default PivotTable;
