import NewWindow from 'react-new-window';
import CramVcfInstance from 'ui-component/IGV/CramVcfInstance';
import PropTypes from 'prop-types';

const IGViewer = ({ closeWindow, options }) => {
    const onClosed = () => {
        closeWindow();
    };

    return (
        <NewWindow
            title="Integrative Genomics Viewer"
            onUnload={onClosed}
            onBlock={() => alert('Please allow popups for this website')}
            features={{
                outerHeight: '100%',
                outerWidth: '100%'
            }}
        >
            <CramVcfInstance options={options} />
        </NewWindow>
    );
};

IGViewer.propTypes = {
    closeWindow: PropTypes.func.isRequired,
    options: PropTypes.object.isRequired
};

export default IGViewer;
