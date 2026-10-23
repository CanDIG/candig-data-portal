// Shared helpers for the site admin / site curator / user dashboards.

import { GridToolbar } from '@mui/x-data-grid';

/*
 * Split a free-text field of user ids into a trimmed, de-duplicated, lower-cased
 * list. User identities are treated case-insensitively and the ingest service
 * stores curators/team members lower-cased, so every admin input is normalised
 * the same way here (commas, semicolons, and any whitespace are separators).
 */
export function parseUserList(value) {
    return [
        ...new Set(
            String(value || '')
                .split(/[\s,;]+/)
                .map((item) => item.trim().toLowerCase())
                .filter(Boolean)
        )
    ];
}

/*
 * Common MUI DataGrid props shared by the admin tables so their toolbars,
 * quick-filter, selection behaviour, and page-size options stay in sync. Spread
 * this first, then override per-table (e.g. pageSizeOptions/initialState) as
 * needed.
 */
export const adminDataGridProps = {
    slots: { toolbar: GridToolbar },
    slotProps: { toolbar: { showQuickFilter: true } },
    disableRowSelectionOnClick: true,
    pageSizeOptions: [10, 25, 50],
    initialState: { pagination: { paginationModel: { pageSize: 10 } } }
};
