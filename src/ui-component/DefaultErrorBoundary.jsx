import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary'

import { Snackbar } from '@mui/material'

function ErrorFallback({ error }) {
	const [snackbarOpen, setSnackbarOpen] = useState(true);

	return (
		<div role="alert">
			<p>Something went wrong:</p>
			<pre style={{ color: 'red' }}>{error.message}</pre>
			<Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)} message={error.message} />
		</div>
	)
}

export default function DefaultErrorBoundary(props) {
    return <ErrorBoundary FallbackComponent={ErrorFallback} {...props} />
}
