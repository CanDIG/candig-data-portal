import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Avatar, Box, ButtonBase } from '@mui/material';
import { useTheme } from '@mui/system';

// Images
// import MOHLogo from '../../assets/MOH/MOHCCN_Logo_EN.png';

// Icons
import { IconBrandGithub, IconWorld, IconMail, IconCopyright } from '@tabler/icons-react';

// style constant
const PREFIX = 'footer';
const classes = {
    footer: `${PREFIX}-footer`,
    socials: `${PREFIX}-socials`,
    links: `${PREFIX}-links`,
    linkFrame: `${PREFIX}-linkFrame`,
    help: `${PREFIX}-help`,
    fundedBox: `${PREFIX}-fundedBox`
};
const FooterContainer = styled('footer')(({ theme }) => ({
    [`&.${classes.footer}`]: {
        display: 'flex',
        padding: '1.5em',
        justifyContent: 'space-between',
        alignItems: 'top',
        flexShrink: 0
    },
    [`&.${classes.socials}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'top',
        gap: '5px',
        flexShrink: 0,
        margin: 0
    },
    [`&.${classes.links}`]: {
        display: 'flex',
        padding: '0px 5px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '2px',
        flexShrink: 0
    },
    [`&.${classes.linkFrame}`]: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        margin: 0,
        padding: 0,
        '& > svg': {
            marginRight: '5px' // Adjust the spacing between the icon and text as needed
        },
        '& > span, & > p, & > a': {
            margin: 0,
            color: theme.palette.primary.main,
            fontWeight: 'bold'
        }
    },
    [`&.${classes.help}`]: {
        display: 'flex',
        padding: '0px 25px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        flexShrink: 0,
        color: theme.palette.primary.main
    },
    [`&.${classes.fundedBox}`]: {
        display: 'flex',
        flexDirection: 'row'
    }
}));

const SocialsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'top',
    gap: '5px',
    flexShrink: 0,
    margin: 0
}));

function Footer(props) {
    const theme = useTheme();
    const MOHLogo2 = '../../assets/MOH/MOHCCN_Logo_EN.png';
    return (
        <FooterContainer {...props} className={classes.footer}>
            <SocialsContainer className={classes.socials}>
                <img alt="CanDIG logo hyperlink" style={{ marginRight: '2em' }} />
                <Box className={classes.links} style={{ marginRight: '2em' }}>
                    <a className={classes.linkFrame} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <IconWorld stroke={1.5} size="1.3rem" style={{ color: theme.palette.primary.main, marginRight: '0.5em' }} />
                        <span style={{ margin: 0, color: theme.palette.primary.main, fontWeight: 'bold' }}> CanDIG</span>
                    </a>
                    <a className={classes.linkFrame} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <IconBrandGithub stroke={1.5} size="1.3rem" style={{ color: theme.palette.primary.main, marginRight: '0.5em' }} />
                        <span style={{ margin: 0, color: theme.palette.primary.main, fontWeight: 'bold' }}>CanDIG GitHub</span>
                    </a>
                    <div className={classes.linkFrame} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <IconCopyright stroke={1.5} size="1.3rem" style={{ color: 'grey', marginRight: '0.5em' }} />
                        <p style={{ margin: 0, color: 'grey' }}>CanDIG v2.1.1</p>
                    </div>
                </Box>
                <Box className={classes.help}>
                    <p style={{ margin: 0, color: theme.palette.primary.main, fontWeight: 'bold' }}>
                        Have questions or want to share your feedback?
                    </p>
                    <a style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <IconMail stroke={1.5} size="1.3rem" style={{ color: theme.palette.primary.main, marginRight: '0.5em' }} />
                        <span style={{ margin: 0, color: theme.palette.primary.main }}>info@distributedgenomics.ca</span>
                    </a>
                </Box>
            </SocialsContainer>
            <Box className={classes.fundedBox} style={{ display: 'flex', flexDirection: 'row', alignItems: 'top' }}>
                <div style={{ marginRight: '2em' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '0.5em' }}>CanDIG Receives Funds from:</p>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', marginRight: '3em' }}>
                            <a
                                href="https://www.tfri.ca/"
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', textDecoration: 'none' }}
                            >
                                <span style={{ margin: 0, color: theme.palette.primary.main }}>TFRI</span>
                            </a>
                            <a
                                href="https://uhndata.io/"
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', textDecoration: 'none' }}
                            >
                                <span style={{ margin: 0, color: theme.palette.primary.main }}>UHN DATA</span>
                            </a>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <a
                                href="https://www.bcgsc.ca/"
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', textDecoration: 'none' }}
                            >
                                <span style={{ margin: 0, color: theme.palette.primary.main }}>BCGSC</span>
                            </a>
                            <a
                                href="https://computationalgenomics.ca/"
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', textDecoration: 'none' }}
                            >
                                <span style={{ margin: 0, color: theme.palette.primary.main }}>C3G</span>
                            </a>
                        </div>
                    </div>
                </div>
                <img src={MOHLogo2} alt="MOH logo hyperlink" />
            </Box>
        </FooterContainer>
    );
}

Footer.propTypes = {
    // Define your prop types here
};

export default Footer;
