import { useCallback, useState } from 'react';

// ===========================|| ADMIN ACTION HOOK ||=========================== //

/*
 * Shared busy/feedback state and a runAction helper for the admin dashboard
 * sections. Consolidates the repeated pattern of: set busy, clear feedback, run
 * an async action, then surface a success or error Alert.
 *
 * runAction resolves to { ok, result, error } (it never rejects) so callers can
 * refresh their data and clear inputs ONLY on success:
 *
 *   runAction(() => approveUser(id), `Approved ${id}.`).then((r) => r.ok && reload());
 *
 * setBusy/setFeedback are also exposed for bespoke flows (e.g. batch operations
 * that report partial success themselves).
 *
 * @returns {{ busy, setBusy, feedback, setFeedback, runAction }}
 */
export default function useAdminAction() {
    const [busy, setBusy] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const runAction = useCallback(
        (action, successText) => {
            setBusy(true);
            setFeedback(null);
            return action()
                .then((result) => {
                    setFeedback({ severity: 'success', text: successText });
                    return { ok: true, result };
                })
                .catch((error) => {
                    setFeedback({ severity: 'error', text: `${error}` });
                    return { ok: false, error };
                })
                .finally(() => setBusy(false));
        },
        []
    );

    return { busy, setBusy, feedback, setFeedback, runAction };
}
