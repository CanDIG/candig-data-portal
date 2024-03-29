// mui
import Skeleton from '@mui/material/Skeleton';

// ===========================|| SKELETON IMAGE CARD ||=========================== //

function ImagePlaceholder({ ...others }) {
    return <Skeleton variant="rectangular" {...others} animation="wave" />;
}

export default ImagePlaceholder;
