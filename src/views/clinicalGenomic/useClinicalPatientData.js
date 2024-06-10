import { useEffect, useState } from 'react';
import { useSidebarWriterContext } from '../../layout/MainLayout/Sidebar/SidebarContext';
import { fetchFederation } from '../../store/api';
import PatientSidebar from './widgets/patientSidebar';

/*
 * Custom hook to fetch and manage clinical patient data.
 * @param {string} patientId - The ID of the patient.
 * @param {string} programId - The ID of the program.
 * @param {string} location - The location of the patient.
 * @returns {Object} - An object containing data, rows, columns, title, and topLevel.
 */
function useClinicalPatientData(patientId, programId, location) {
    // Access the SidebarContext to update the sidebar with patient information
    const sidebarWriter = useSidebarWriterContext();

    // State variables to store fetched data, table rows, columns, title, and topLevel data
    const [data, setData] = useState({});
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [title, setTitle] = useState('');
    const [topLevel, setTopLevel] = useState({});

    function filterNestedObject(obj) {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(
                    ([key, value]) =>
                        value !== null &&
                        !(
                            (Array.isArray(value) && value.length === 0) || // Exclude empty arrays
                            value === '' ||
                            key === ''
                        ) &&
                        (!(typeof value === 'object') ||
                            (typeof value === 'object' && ('month_interval' in value || value.every((item) => typeof item === 'string'))))
                )
                .map(([key, value]) => {
                    if (Array.isArray(value)) {
                        return [key, value.join(', ')];
                    }

                    return [key, value];
                })
        );
    }

    // useEffect to fetch data when patientId, programId, or sidebarWriter changes
    useEffect(() => {
        // Asynchronous function to fetch data
        const fetchData = async () => {
            try {
                // Construct the API URL based on the provided parameters
                if (programId && patientId) {
                    const url = `v2/authorized/donor_with_clinical_data/program/${programId}/donor/${patientId}`;

                    const result = await fetchFederation(url, 'katsu');
                    // Extract patientData from the fetched result or use an empty object
                    const matchingObj = result.find((obj) => obj.location?.name === location);

                    const patientData = matchingObj ? matchingObj.results : {};

                    // Filter patientData to create topLevel data excluding arrays, objects, and empty values
                    const filteredData = filterNestedObject(patientData);

                    if (filteredData?.date_of_birth) {
                        if (filteredData.date_of_birth.day_interval) {
                            // Logic for 'day' resolution
                            if (filteredData?.date_of_death?.day_interval && filteredData?.date_of_birth?.day_interval) {
                                const ageInDays = filteredData.date_of_death.day_interval - filteredData.date_of_birth.day_interval;
                                filteredData.age_at_death = Math.floor(ageInDays / 365);
                                filteredData.age_at_first_diagnosis = Math.floor(-filteredData.date_of_birth.day_interval / 365);
                            } else if (filteredData?.date_of_birth?.day_interval && !filteredData?.date_of_death?.day_interval) {
                                filteredData.age_at_first_diagnosis = Math.floor(-filteredData.date_of_birth.day_interval / 365);
                            }
                            delete filteredData.date_of_death;
                            delete filteredData.date_of_birth;
                        } else if (filteredData.date_of_birth.month_interval) {
                            // Logic for 'month' resolution
                            if (filteredData?.date_of_death?.month_interval && filteredData?.date_of_birth?.month_interval) {
                                const ageInMonths = filteredData.date_of_death.month_interval - filteredData.date_of_birth.month_interval;
                                filteredData.age_at_death = Math.floor(ageInMonths / 12);
                                filteredData.age_at_first_diagnosis = Math.floor(-filteredData.date_of_birth.month_interval / 12);
                            } else if (filteredData?.date_of_birth?.month_interval && !filteredData?.date_of_death?.month_interval) {
                                filteredData.age_at_first_diagnosis = Math.floor(-filteredData.date_of_birth.month_interval / 12);
                            }
                            delete filteredData.date_of_death;
                            delete filteredData.date_of_birth;
                        } else {
                            delete filteredData.date_of_death;
                            delete filteredData.date_of_birth;
                        }
                    } else {
                        delete filteredData.date_of_death;
                        filteredData.age_at_first_diagnosis = null;
                    }

                    if (filteredData?.date_alive_after_lost_to_followup?.day_interval) {
                        const ageInDays = filteredData.date_alive_after_lost_to_followup.day_interval;
                        const years = Math.floor(ageInDays / 365);
                        const remainingDays = ageInDays % 365;
                        const months = Math.floor(remainingDays / 30);
                        const days = remainingDays % 30;

                        filteredData.time_from_diagnosis_to_last_followup = `${years}y ${months}m ${days}d`;
                        delete filteredData.date_alive_after_lost_to_followup;
                    } else if (filteredData?.date_alive_after_lost_to_followup?.month_interval) {
                        const ageInMonths = filteredData.date_alive_after_lost_to_followup.month_interval;
                        const years = Math.floor(ageInMonths / 12);
                        const remainingMonths = ageInMonths % 12;
                        filteredData.time_from_diagnosis_to_last_followup = `${years}y ${remainingMonths}m`;
                        delete filteredData.date_alive_after_lost_to_followup;
                    }

                    setTopLevel(filteredData);
                    setData(patientData);
                    // Update the sidebar with patientData using the PatientSidebar component
                    sidebarWriter(
                        <PatientSidebar
                            sidebar={patientData}
                            setRows={setRows}
                            setColumns={setColumns}
                            setTitle={setTitle}
                            ageAtFirstDiagnosis={filteredData.age_at_first_diagnosis}
                        />
                    );
                }
            } catch (error) {
                console.error('Error fetching clinical patient data:', error);
            }
        };

        fetchData();
    }, [patientId, programId, location, sidebarWriter]);

    return { data, rows, columns, title, topLevel, setRows, setColumns, setTitle, setTopLevel };
}

export default useClinicalPatientData;
