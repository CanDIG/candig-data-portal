import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// mui
import { Card, CardContent, Divider, Grid, Typography } from '@mui/material';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';

// project imports
import config from 'config';
import { gridSpacing } from 'store/constant';

// assets
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import HomeIcon from '@mui/icons-material/Home';
import HomeTwoToneIcon from '@mui/icons-material/HomeTwoTone';

const PREFIX = 'Breadcrumbs';

const classes = {
    link: `${PREFIX}-link`,
    activeLink: `${PREFIX}-activeLink`,
    icon: `${PREFIX}-icon`,
    content: `${PREFIX}-content`,
    noPadding: `${PREFIX}-noPadding`,
    card: `${PREFIX}-card`,
    root: `${PREFIX}-root`,
    titleTop: `${PREFIX}-titleTop`,
    titleBottom: `${PREFIX}-titleBottom`,
    divider: `${PREFIX}-divider`
};

const StyledCard = styled(Card)(({ theme }) => ({
    [`& .${classes.link}`]: {
        display: 'flex',
        color: theme.palette.grey[900],
        textDecoration: 'none',
        alignContent: 'center',
        alignItems: 'center'
    },

    [`& .${classes.activeLink}`]: {
        display: 'flex',
        textDecoration: 'none',
        alignContent: 'center',
        alignItems: 'center',
        color: theme.palette.grey[500]
    },

    [`& .${classes.icon}`]: {
        marginRight: theme.spacing(0.75),
        marginTop: `-${theme.spacing(0.25)}`,
        width: '1rem',
        height: '1rem',
        color: theme.palette.secondary.main
    },

    [`& .${classes.content}`]: {
        padding: '16px !important'
    },

    [`& .${classes.noPadding}`]: {
        padding: '16px !important',
        paddingLeft: '0 !important'
    },

    [`& .${classes.card}`]: {
        marginBottom: theme.spacing(gridSpacing),
        border: '1px solid',
        borderColor: theme.palette.primary[200] + 75
    },

    [`& .${classes.root}`]: {
        background: 'transparent',
        boxShadow: 'none',
        border: 'none'
    },

    [`& .${classes.titleTop}`]: {
        marginBottom: theme.spacing(1)
    },

    [`& .${classes.titleBottom}`]: {
        marginTop: theme.spacing(1)
    },

    [`& .${classes.divider}`]: {
        borderColor: theme.palette.primary.main,
        marginBottom: theme.spacing(gridSpacing)
    }
}));

// ===========================|| BREADCRUMBS ||=========================== //

function Breadcrumbs({ card, divider, icon, icons, maxItems, navigation, rightAlign, separator, title, titleBottom, ...others }) {
    const [main, setMain] = useState([]);
    const [item, setItem] = useState([]);

    // set active item state
    const getCollapse = (item) => {
        if (item.children) {
            item.children.filter((collapse) => {
                if (collapse.type && collapse.type === 'collapse') {
                    getCollapse(collapse);
                } else if (collapse.type && collapse.type === 'item') {
                    if (document.location.pathname === config.basename + collapse.url) {
                        setMain(item);
                        setItem(collapse);
                    }
                }
                return false;
            });
        }
    };

    useEffect(() => {
        navigation.items.map((item, index) => {
            if (item.type && item.type === 'group') {
                getCollapse(item, index);
            }
            return false;
        });
    });

    // item separator
    const SeparatorIcon = separator;
    const separatorIcon = separator ? <SeparatorIcon stroke={1.5} size="1rem" /> : '/';

    // card class
    let cardClass = classes.card;
    if (card === false) {
        cardClass = classes.root;
    }

    // card content class
    let contentClass = classes.content;
    if (card === false) {
        contentClass = classes.noPadding;
    }

    let mainContent;
    let itemContent;
    let breadcrumbContent = '';
    let itemTitle = '';
    let CollapseIcon;
    let ItemIcon;

    // collapse item
    if (main && main.type === 'collapse') {
        CollapseIcon = main.icon ? main.icon : AccountTreeTwoToneIcon;
        mainContent = (
            <Typography component={Link} to="#" variant="subtitle1" className={classes.link}>
                {icons && <CollapseIcon className={classes.icon} />}
                {main.title}
            </Typography>
        );
    }

    // items
    if (item && item.type === 'item') {
        itemTitle = item.title;

        ItemIcon = item.icon ? item.icon : AccountTreeTwoToneIcon;
        itemContent = (
            <Typography variant="subtitle1" className={classes.activeLink}>
                {icons && <ItemIcon className={classes.icon} />}
                {itemTitle}
            </Typography>
        );

        // main
        if (item.breadcrumbs !== false) {
            breadcrumbContent = (
                <StyledCard className={cardClass} {...others}>
                    <CardContent className={contentClass}>
                        <Grid
                            container
                            direction={rightAlign ? 'row' : 'column'}
                            justifyContent={rightAlign ? 'space-between' : 'flex-start'}
                            alignItems={rightAlign ? 'center' : 'flex-start'}
                            spacing={1}
                        >
                            {title && !titleBottom && (
                                <Grid item>
                                    <Typography variant="h3" sx={{ fontWeight: 500 }}>
                                        {' '}
                                        {item.title}{' '}
                                    </Typography>
                                </Grid>
                            )}
                            <Grid item>
                                <MuiBreadcrumbs aria-label="breadcrumb" maxItems={maxItems || 8} separator={separatorIcon}>
                                    <Typography component={Link} to="/" color="inherit" variant="subtitle1" className={classes.link}>
                                        {icons && <HomeTwoToneIcon className={classes.icon} />}
                                        {icon && <HomeIcon className={classes.icon} style={{ marginRight: 0 }} />}
                                        {!icon && 'Dashboard'}
                                    </Typography>
                                    {mainContent}
                                    {itemContent}
                                </MuiBreadcrumbs>
                            </Grid>
                            {title && titleBottom && (
                                <Grid item>
                                    <Typography variant="h3" sx={{ fontWeight: 500 }}>
                                        {' '}
                                        {item.title}{' '}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                    {card === false && divider !== false && <Divider className={classes.divider} />}
                </StyledCard>
            );
        }
    }

    return breadcrumbContent;
}

Breadcrumbs.propTypes = {
    card: PropTypes.bool,
    divider: PropTypes.bool,
    icon: PropTypes.bool,
    icons: PropTypes.bool,
    maxItems: PropTypes.number,
    navigation: PropTypes.object,
    rightAlign: PropTypes.bool,
    separator: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    title: PropTypes.bool,
    titleBottom: PropTypes.bool
};

export default Breadcrumbs;
