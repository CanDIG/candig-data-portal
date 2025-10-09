import { useEffect, useMemo } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Chip } from '@mui/material';
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

    // Decompose the query into its roots: what are we searching on?
    if (query !== undefined) {
        const ignoredKeys = ['page', 'page_size']; // These are never included in the explanation
        Object.keys(query).forEach((key) => {
            if (key !== undefined && query[key] !== undefined && !ignoredKeys.includes(key)) {
                const onDelete = () => {
                    writer((old) => ({ ...old, clear: key }));
                };
                const splitQuery = query[key].split('|');
                const newVal = splitQuery.flatMap((value) => [<b key={value}> OR </b>, value]).slice(1);
                const formattedKey = key.replaceAll('_', ' ');
                newVal.splice(
                    0,
                    0,
                    <span className={`${PREFIX}-chiptext`} key={`${key} span`}>
                        {formattedKey}:{' '}
                    </span>
                );
                queryChips.push([key, newVal, onDelete]);
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

    return useMemo(
        () => (
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
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [reader.reqNum]
    );
}

export default SearchExplainer;
