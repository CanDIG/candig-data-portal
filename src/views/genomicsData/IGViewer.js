import NewWindow from 'react-new-window';
import VcfInstance from 'ui-component/IGV/VcfInstance';
import PropTypes from 'prop-types';

const IGViewer = ({ closeWindow, data }) => {
    const onClosed = () => {
        closeWindow();
    };

    return (
        <NewWindow
            title="Integrative Genomics Viewer"
            onUnload={onClosed}
            features={{
                outerHeight: '100%',
                outerWidth: '100%'
            }}
        >
            <VcfInstance genome={data.genome} tracks={[data.tracks]} />
        </NewWindow>
    );
};

IGViewer.propTypes = {
    closeWindow: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
};

export default IGViewer;
