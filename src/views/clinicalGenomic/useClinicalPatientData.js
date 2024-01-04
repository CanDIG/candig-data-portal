import { useEffect, useState } from 'react';
import { useSidebarWriterContext } from '../../layout/MainLayout/Sidebar/SidebarContext';
import { fetchFederation } from '../../store/api';
import PatientSidebar from './widgets/patientSidebar';

function useClinicalPatientData(patientId, programId) {
    const sidebarWriter = useSidebarWriterContext();
    const [data, setData] = useState({});
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [title, setTitle] = useState('');
    const [topLevel, setTopLevel] = useState({});

    function formatKey(key) {
        return key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                // const url = `v2/authorized/donor_with_clinical_data/program/${programId}/donor/${patientId}`;
                const url = `v2/authorized/donor_with_clinical_data/program/SYNTHETIC-2/donor/DONOR_2`;
                const result = await fetchFederation(url, 'katsu');
                console.log('RESULTS', result);
                const patientData = result[0].results || {};

                sidebarWriter(<PatientSidebar sidebar={patientData} setRows={setRows} setColumns={setColumns} setTitle={setTitle} />);

                const filteredData = Object.fromEntries(
                    Object.entries(patientData).filter(([key, value]) => !Array.isArray(value) && typeof value !== 'object' && value !== '')
                );
                setTopLevel(filteredData);
                setData(patientData);
            } catch (error) {
                console.error('Error fetching clinical patient data:', error);
            }
        };

        fetchData();
    }, [patientId, programId, sidebarWriter]);

    return { data, rows, columns, title, topLevel, formatKey };
}

export default useClinicalPatientData;
