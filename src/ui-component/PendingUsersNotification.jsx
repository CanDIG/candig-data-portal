import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// mui
import { Chip, Tooltip } from '@mui/material';
import { IconAlertTriangle } from '@tabler/icons-react';

// project imports
import config from '../config';
import useSiteAdmin from '../hooks/useSiteAdmin';
import { fetchPendingUsers } from '../store/api';

// Show the notification at most once per browser session (per login).
const SESSION_KEY = 'candig.pendingUsersNotified';

// ===========================|| PENDING USERS NOTIFICATION ||=========================== //

/*
 * When a site administrator loads the portal, check whether there are any users
 * awaiting approval and, if so, surface a compact indicator in the header (just
 * left of the user menu) that links to the pending users section of the Site
 * Admin Dashboard. It appears once per session and can be dismissed.
 */
function PendingUsersNotification() {
    const { loading, isSiteAdmin } = useSiteAdmin();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (loading || !isSiteAdmin) {
            return;
        }
        if (sessionStorage.getItem(SESSION_KEY)) {
            return;
        }
        // Claim the once-per-session sentinel up front so a concurrent mount
        // (or React 18 StrictMode's double-invoke in dev) can't both fetch and
        // double-notify. Trade-off: if this check fails there is no retry this
        // session, which is fine for a best-effort notification.
        sessionStorage.setItem(SESSION_KEY, 'true');
        fetchPendingUsers()
            .then((users) => {
                if (users.length > 0) {
                    setCount(users.length);
                    setOpen(true);
                }
            })
            .catch((error) => console.log(`Could not check pending users: ${error}`));
    }, [loading, isSiteAdmin]);

    if (!open) {
        return null;
    }

    const handleReview = () => {
        setOpen(false);
        navigate(`${config.basename}/siteAdmin?section=pending`);
    };

    return (
        <Tooltip title="Review pending users">
            <Chip
                color="warning"
                variant="filled"
                icon={<IconAlertTriangle size="1.1rem" stroke={1.5} />}
                label={`${count} pending user${count === 1 ? '' : 's'}`}
                onClick={handleReview}
                onDelete={() => setOpen(false)}
                sx={{ mr: 1.5, height: '48px', borderRadius: '27px', fontWeight: 500, fontSize: '0.875rem' }}
            />
        </Tooltip>
    );
}

export default PendingUsersNotification;
