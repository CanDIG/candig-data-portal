import { styled } from '@mui/material/styles';
import {
    Avatar,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Stack,
    Typography
} from '@mui/material';

// assets
import { IconBrandTelegram, IconBuildingStore, IconMailbox, IconPhoto } from '@tabler/icons-react';
import User1 from 'assets/images/users/user-round.svg';

// style constant
const PREFIX = 'NotificationList';
const classes = {
    grow: `${PREFIX}-grow`,
    navContainer: `${PREFIX}-navContainer`,
    listAction: `${PREFIX}-listAction`,
    actionColor: `${PREFIX}-actionColor`,
    listItem: `${PREFIX}-listItem`,
    sendIcon: `${PREFIX}-sendIcon`,
    listDivider: `${PREFIX}-listDivider`,
    listChipError: `${PREFIX}-listChipError`,
    listChipWarning: `${PREFIX}-listChipWarning`,
    listChipSuccess: `${PREFIX}-listChipSuccess`,
    listAvatarSuccess: `${PREFIX}-listAvatarSuccess`,
    listAvatarPrimary: `${PREFIX}-listAvatarPrimary`,
    listContainer: `${PREFIX}-listContainer`,
    uploadCard: `${PREFIX}-uploadCard`,
    paddingBottom: `${PREFIX}-paddingBottom`,
    itemAction: `${PREFIX}-itemActionw`
};
const StyledList = styled(List)(({ theme }) => ({
    [`&.${classes.navContainer}`]: {
        width: '100%',
        maxWidth: '330px',
        paddingTop: 0,
        paddingBottom: 0,
        borderRadius: '10px',
        [theme.breakpoints.down('md')]: {
            maxWidth: '300px'
        }
    },
    [`&.${classes.listAction}`]: {
        top: '22px'
    },
    [`&.${classes.actionColor}`]: {
        color: theme.palette.grey[500]
    },
    [`&.${classes.listItem}`]: {
        padding: 0
    },
    [`&.${classes.sendIcon}`]: {
        marginLeft: '8px',
        marginTop: '-3px'
    },
    [`&.${classes.listDivider}`]: {
        marginTop: 0,
        marginBottom: 0
    },
    [`&.${classes.listChipError}`]: {
        color: theme.palette.orange.dark,
        backgroundColor: theme.palette.orange.light,
        height: '24px',
        padding: '0 6px',
        marginRight: '5px'
    },
    [`&.${classes.listChipWarning}`]: {
        color: theme.palette.warning.dark,
        backgroundColor: theme.palette.warning.light,
        height: '24px',
        padding: '0 6px'
    },
    [`&.${classes.listChipSuccess}`]: {
        color: theme.palette.success.dark,
        backgroundColor: theme.palette.success.light,
        height: '24px',
        padding: '0 6px'
    },
    [`&.${classes.listAvatarSuccess}`]: {
        color: theme.palette.success.dark,
        backgroundColor: theme.palette.success.light,
        border: 'none',
        borderColor: theme.palette.success.main
    },
    [`&.${classes.listAvatarPrimary}`]: {
        color: theme.palette.primary.dark,
        backgroundColor: theme.palette.primary.light,
        border: 'none',
        borderColor: theme.palette.primary.main
    },
    [`&.${classes.listContainer}`]: {
        paddingLeft: '56px'
    },
    [`&.${classes.uploadCard}`]: {
        backgroundColor: theme.palette.secondary.light
    },
    [`&.${classes.paddingBottom}`]: {
        paddingBottom: '16px'
    },
    [`&.${classes.itemAction}`]: {
        cursor: 'pointer',
        padding: '16px',
        '&:hover': {
            background: theme.palette.primary.light
        }
    }
}));

// ===========================|| NOTIFICATION LIST ITEM ||=========================== //

function NotificationList() {
    return (
        <StyledList className={classes.navContainer}>
            <div className={classes.itemAction}>
                <ListItem alignItems="center" className={classes.listItem}>
                    <ListItemAvatar>
                        <Avatar alt="John Doe" src={User1} />
                    </ListItemAvatar>
                    <ListItemText primary={<Typography variant="subtitle1">John Doe</Typography>} />
                    <ListItemSecondaryAction className={classes.listAction}>
                        <Grid container justifyContent="flex-end">
                            <Grid item xs={12}>
                                <Typography variant="caption" display="block" gutterBottom className={classes.actionColor}>
                                    2 min ago
                                </Typography>
                            </Grid>
                        </Grid>
                    </ListItemSecondaryAction>
                </ListItem>
                <Grid container direction="column" className={classes.listContainer}>
                    <Grid item xs={12} className={classes.paddingBottom}>
                        <Typography variant="subtitle2">It is a long established fact that a reader will be distracted</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item>
                                <Chip label="Unread" className={classes.listChipError} />
                            </Grid>
                            <Grid item>
                                <Chip label="New" className={classes.listChipWarning} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
            <Divider className={classes.listDivider} />
            <div className={classes.itemAction}>
                <ListItem alignItems="center" className={classes.listItem}>
                    <ListItemAvatar>
                        <Avatar className={classes.listAvatarSuccess}>
                            <IconBuildingStore stroke={1.5} size="1.3rem" />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={<Typography variant="subtitle1">Store Verification Done</Typography>} />
                    <ListItemSecondaryAction className={classes.listAction}>
                        <Grid container justifyContent="flex-end">
                            <Grid item xs={12}>
                                <Typography variant="caption" display="block" gutterBottom className={classes.actionColor}>
                                    2 min ago
                                </Typography>
                            </Grid>
                        </Grid>
                    </ListItemSecondaryAction>
                </ListItem>
                <Grid container direction="column" className={classes.listContainer}>
                    <Grid item xs={12} className={classes.paddingBottom}>
                        <Typography variant="subtitle2">We have successfully received your request.</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item>
                                <Chip label="Unread" className={classes.listChipError} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
            <Divider className={classes.listDivider} />
            <div className={classes.itemAction}>
                <ListItem alignItems="center" className={classes.listItem}>
                    <ListItemAvatar>
                        <Avatar className={classes.listAvatarPrimary}>
                            <IconMailbox stroke={1.5} size="1.3rem" />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={<Typography variant="subtitle1">Check Your Mail.</Typography>} />
                    <ListItemSecondaryAction className={classes.listAction}>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Typography variant="caption" display="block" gutterBottom className={classes.actionColor}>
                                    2 min ago
                                </Typography>
                            </Grid>
                        </Grid>
                    </ListItemSecondaryAction>
                </ListItem>
                <Grid container direction="column" className={classes.listContainer}>
                    <Grid item xs={12} className={classes.paddingBottom}>
                        <Typography variant="subtitle2">All done! Now check your inbox as you&apos;re in for a sweet treat!</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item>
                                <Button variant="contained" disableElevation>
                                    Mail
                                    <IconBrandTelegram stroke={1.5} size="1.3rem" className={classes.sendIcon} />
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
            <Divider className={classes.listDivider} />
            <div className={classes.itemAction}>
                <ListItem alignItems="center" className={classes.listItem}>
                    <ListItemAvatar>
                        <Avatar alt="John Doe" src={User1} />
                    </ListItemAvatar>
                    <ListItemText primary={<Typography variant="subtitle1">John Doe</Typography>} />
                    <ListItemSecondaryAction className={classes.listAction}>
                        <Grid container justifyContent="flex-end">
                            <Grid item xs={12}>
                                <Typography variant="caption" display="block" gutterBottom className={classes.actionColor}>
                                    2 min ago
                                </Typography>
                            </Grid>
                        </Grid>
                    </ListItemSecondaryAction>
                </ListItem>
                <Grid container direction="column" className={classes.listContainer}>
                    <Grid item xs={12} className={classes.paddingBottom}>
                        <Typography component="span" variant="subtitle2">
                            Uploaded two file on &nbsp;
                            <Typography component="span" variant="h6">
                                21 Jan 2020
                            </Typography>
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item xs={12}>
                                <Card className={classes.uploadCard}>
                                    <CardContent>
                                        <Grid container direction="column">
                                            <Grid item xs={12}>
                                                <Stack direction="row" spacing={2}>
                                                    <IconPhoto stroke={1.5} size="1.3rem" />
                                                    <Typography variant="subtitle1">demo.jpg</Typography>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
            <Divider className={classes.listDivider} />
            <div className={classes.itemAction}>
                <ListItem alignItems="center" className={classes.listItem}>
                    <ListItemAvatar>
                        <Avatar alt="John Doe" src={User1} />
                    </ListItemAvatar>
                    <ListItemText primary={<Typography variant="subtitle1">John Doe</Typography>} />
                    <ListItemSecondaryAction className={classes.listAction}>
                        <Grid container justifyContent="flex-end">
                            <Grid item xs={12}>
                                <Typography variant="caption" display="block" gutterBottom className={classes.actionColor}>
                                    2 min ago
                                </Typography>
                            </Grid>
                        </Grid>
                    </ListItemSecondaryAction>
                </ListItem>
                <Grid container direction="column" className={classes.listContainer}>
                    <Grid item xs={12} className={classes.paddingBottom}>
                        <Typography variant="subtitle2">It is a long established fact that a reader will be distracted</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item>
                                <Chip label="Confirmation of Account." className={classes.listChipSuccess} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        </StyledList>
    );
}

export default NotificationList;
