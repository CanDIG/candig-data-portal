import { useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Chip, Tooltip } from '@mui/material';
import { useSearchQueryReaderContext, useSearchResultsWriterContext } from '../SearchResultsContext';

const PREFIX = 'SearchExplainer';

const Root = styled('div')(({ theme }) => ({
    [`& .${PREFIX}-chiptext`]: {
        textTransform: 'capitalize'
    },
    [`& .${PREFIX}-background`]: {
        backgroundColor: theme.palette.primary.light,
        color: 'black',
        paddingLeft: 15,
        paddingBottom: 20
    },
    [`& .${PREFIX}-chip`]: {
        backgroundColor: 'white',
        marginRight: 5,
        marginLeft: 5,
        marginTop: 20
    },
    [`& .${PREFIX}-bold`]: {
        position: 'relative',
        top: 10
    }
}));

function SearchExplainer() {
    const reader = useSearchQueryReaderContext();
    const writer = useSearchResultsWriterContext();
    const query = reader.query;
    const queryChips = [];

    // Once an OR-list gets long (e.g. deselecting a node can exclude dozens of
    // programs at once), listing every value would overflow the bar. Past this
    // threshold we collapse to a count and reveal the full list on hover.
    const COMPACT_THRESHOLD = 3;

    // Decompose the query into its roots: what are we searching on?
    if (query !== undefined) {
        const ignoredKeys = ['page', 'page_size']; // These are never included in the explanation
        Object.keys(query).forEach((key) => {
            if (key !== undefined && query[key] !== undefined && !ignoredKeys.includes(key)) {
                const onDelete = () => {
                    writer((old) => ({ ...old, clear: key }));
                };
                const splitQuery = String(query[key])
                    .split('|')
                    .filter((value) => value !== '');
                const formattedKey = key.replaceAll('_', ' ');

                let label;
                if (splitQuery.length > COMPACT_THRESHOLD) {
                    // Compact: a count with the full list revealed on hover.
                    const compactText =
                        key === 'exclude_programs'
                            ? `Excluding ${splitQuery.length} programs`
                            : `${formattedKey}: ${splitQuery.length} selected`;
                    label = (
                        <Tooltip title={splitQuery.join(', ')} placement="bottom" arrow>
                            <span className={`${PREFIX}-chiptext`}>{compactText}</span>
                        </Tooltip>
                    );
                } else {
                    const newVal = splitQuery.flatMap((value) => [<b key={value}> OR </b>, value]).slice(1);
                    newVal.splice(
                        0,
                        0,
                        <span className={`${PREFIX}-chiptext`} key={`${key} span`}>
                            {formattedKey}:{' '}
                        </span>
                    );
                    label = newVal;
                }
                queryChips.push([key, label, onDelete]);
            }
        });
    }

    useEffect(() => {
        writer((old) => ({ ...old, clear: '' }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reader.reqNum]);

    if (queryChips.length === 0) {
        queryChips.push(['all', 'All results', undefined]);
    }

    // NB: intentionally not memoized on reqNum — this bar summarizes the CURRENT
    // sidebar selection, so it must re-render whenever the query changes (e.g. a
    // program is deselected), not only when a search is submitted.
    return (
        <Root>
            <Box className={`${PREFIX}-background`}>
                {queryChips
                    /* NB: FlatMap+slice(1) to insert ANDs between entries */
                    .flatMap((chip) => [
                        <span className={`${PREFIX}-bold`} key={`${chip[0]} and`}>
                            <b>&nbsp;AND&nbsp;</b>
                        </span>,
                        <Chip
                            key={`${chip[0]} chip`}
                            label={chip[1]}
                            onDelete={chip[2]}
                            variant="outlined"
                            color="primary"
                            className={`${PREFIX}-chip`}
                        />
                    ])
                    .slice(1)}
            </Box>
        </Root>
    );
}

export default SearchExplainer;
