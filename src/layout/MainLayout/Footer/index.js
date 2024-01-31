import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, ButtonBase } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/system';
import config from 'config';
import MOHLogo from '../../../assets/images/MOH/MOHCCN_Logo_EN.png';
import CanDIGLogo from '../../../assets/images/logo-notext.png';
import { IconBrandGithub, IconWorld, IconMail, IconCopyright } from '@tabler/icons-react';

const flexFrame = {
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 0,
    margin: 0
};

const linkFrame = {
    ...flexFrame,
    alignItems: 'center'
};

const linkText = {
    margin: 0,
    fontWeight: 'bold'
};

const SocialsContainer = styled(Box)(({ theme }) => ({
    ...flexFrame,
    flexDirection: 'row',
    gap: '5px',
    margin: 0,
    alignItems: 'flex-start'
}));

const LinksContainer = styled(Box)(({ theme }) => ({
    ...flexFrame,
    padding: '0px 5px',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '2px',
    '& a': {
        ...linkFrame,
        textDecoration: 'none',
        color: theme.palette.primary.main,
        '&:visited': {
            color: theme.palette.primary.main
        }
    }
}));

const LinkFrame = styled(Box)(({ theme }) => ({
    ...linkFrame,
    '& > svg': {
        marginRight: '5px'
    },
    '& > *': {
        ...linkText,
        color: theme.palette.primary.main
    }
}));

const FundingLink = styled('a')(({ theme }) => ({
    ...linkFrame,
    textDecoration: 'none',
    color: theme.palette.primary.main,
    '&:visited': {
        color: theme.palette.primary.main
    }
}));

const HelpContainer = styled(Box)(({ theme }) => ({
    ...flexFrame,
    flexDirection: 'column',
    alignItems: 'flex-start',
    color: theme.palette.primary.main
}));

const ResponsiveFooterContainer = styled('footer')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '1.5em',
    paddingRight: '1.5em',
    paddingLeft: '1.5em',
    alignItems: 'top',
    flexShrink: 0,
    margin: 0,

    [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    }
}));

const ResponsiveSocialsContainer = styled(SocialsContainer)(({ theme }) => ({
    marginLeft: '1em',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'flex-start'
    }
}));

const ResponsiveLinksContainer = styled(LinksContainer)(({ theme }) => ({
    [theme.breakpoints.down('md')]: {
        marginRight: 0
    }
}));

const ResponsiveCanDIGContainer = styled('div')(({ theme }) => ({
    ...flexFrame,
    [theme.breakpoints.down('md')]: {
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2em'
    }
}));

const ResponsiveFundingContainer = styled('div')(({ theme }) => ({
    ...flexFrame,
    [theme.breakpoints.down('md')]: {
        marginTop: '2em',
        justifyContent: 'space-between'
    }
}));

function Footer(props) {
    const theme = useTheme();
    const [open, setOpen] = useState(false);

    const handleTooltipClose = () => {
        setOpen(false);
    };

    const handleTooltipOpen = () => {
        setOpen(true);
        setTimeout(() => {
            handleTooltipClose();
        }, 3000);
    };

    function fallbackCopyTextToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            console.log('Email copied to clipboard');
            handleTooltipOpen();
        } catch (err) {
            console.error('Fallback copy failed:', err);
        } finally {
            document.body.removeChild(textarea);
        }
    }

    function copyEmail(email) {
        try {
            if (navigator.clipboard) {
                navigator.clipboard
                    .writeText(email)
                    .then(() => {
                        console.log('Email copied to clipboard');
                        handleTooltipOpen();
                    })
                    .catch(() => {
                        fallbackCopyTextToClipboard(email);
                    });
            } else {
                fallbackCopyTextToClipboard(email);
            }
        } catch (err) {
            console.error('Error copying email:', err);
        }
    }

    return (
        <ResponsiveFooterContainer {...props}>
            <ResponsiveSocialsContainer>
                <ResponsiveCanDIGContainer>
                    <div style={{ ...flexFrame }}>
                        <a href={config.defaultPath}>
                            <img src={CanDIGLogo} alt="CanDIG logo hyperlink" style={{ marginRight: '0.5em', height: '4.5em' }} />
                        </a>
                        <ResponsiveLinksContainer style={{ marginRight: '2em' }}>
                            <a
                                href="https://www.distributedgenomics.ca/"
                                style={{
                                    ...linkFrame,
                                    textDecoration: 'none'
                                }}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <IconWorld stroke={1.5} size="1.3rem" style={{ color: theme.palette.primary.main, marginRight: '0.5em' }} />
                                <span style={linkText}> CanDIG</span>
                            </a>
                            <a
                                href="https://github.com/CanDIG"
                                style={{
                                    ...linkFrame,
                                    textDecoration: 'none'
                                }}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <IconBrandGithub
                                    stroke={1.5}
                                    size="1.3rem"
                                    style={{ color: theme.palette.primary.main, marginRight: '0.5em' }}
                                />
                                <span style={linkText}>CanDIG GitHub</span>
                            </a>
                            <LinkFrame>
                                <IconCopyright stroke={1.5} size="1.3rem" style={{ color: 'grey', marginRight: '0.5em' }} />
                                <p style={{ ...linkText, color: 'grey' }}>CanDIG {config.candigVersion}</p>
                            </LinkFrame>
                        </ResponsiveLinksContainer>
                    </div>
                    <HelpContainer style={{ color: theme.palette.primary.main, padding: 0 }}>
                        <p style={{ ...linkText, fontWeight: 'bold' }}>Have questions or want to share your feedback?</p>
                        <ButtonBase
                            onClick={() => copyEmail('info@distributedgenomics.ca')}
                            onMouseOver={() => {
                                document.body.style.cursor = 'pointer';
                                return null;
                            }}
                            onMouseOut={() => {
                                document.body.style.cursor = 'default';
                                return null;
                            }}
                        >
                            <Tooltip
                                title="Email Copied!"
                                placement="right"
                                style={{ ...linkFrame, cursor: 'pointer' }}
                                PopperProps={{
                                    disablePortal: true
                                }}
                                onClose={handleTooltipClose}
                                open={open}
                                disableFocusListener
                                disableHoverListener
                                disableTouchListener
                            >
                                <IconMail stroke={1.5} size="1.3rem" style={{ color: theme.palette.primary.main, marginRight: '0.5em' }} />
                                <span style={linkText}>info@distributedgenomics.ca</span>
                            </Tooltip>
                        </ButtonBase>
                    </HelpContainer>
                </ResponsiveCanDIGContainer>
            </ResponsiveSocialsContainer>
            <ResponsiveFundingContainer style={{ marginRight: '1em' }}>
                <div style={{ marginRight: '1em' }}>
                    <p style={{ ...linkText, fontWeight: 'bold', marginBottom: '0.5em' }}>CanDIG Receives Funds from:</p>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', marginRight: '3em' }}>
                            <FundingLink href="https://www.tfri.ca/" target="_blank" rel="noreferrer">
                                <span style={linkText}>TFRI</span>
                            </FundingLink>
                            <FundingLink href="https://uhndata.io/" target="_blank" rel="noreferrer">
                                <span style={linkText}>UHN DATA</span>
                            </FundingLink>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <FundingLink href="https://www.bcgsc.ca/" target="_blank" rel="noreferrer">
                                <span style={linkText}>BCGSC</span>
                            </FundingLink>
                            <FundingLink href="https://computationalgenomics.ca/" target="_blank" rel="noreferrer">
                                <span style={linkText}>C3G</span>
                            </FundingLink>
                        </div>
                    </div>
                </div>
                <a href="https://www.marathonofhopecancercentres.ca/" target="_blank" rel="noreferrer">
                    <img src={MOHLogo} alt="MOH logo hyperlink" style={{ position: 'relative', top: '-1em', width: '6.5em' }} />
                </a>
            </ResponsiveFundingContainer>
        </ResponsiveFooterContainer>
    );
}

export default Footer;
