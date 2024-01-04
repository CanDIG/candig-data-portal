import PropTypes from 'prop-types';

// mui
import { styled } from '@mui/material/styles';
import { Divider, List, Typography } from '@mui/material';

// project imports
import NavItem from '../NavItem';
import NavCollapse from '../NavCollapse';

const PREFIX = 'NavGroup';

const classes = {
    menuCaption: `${PREFIX}-menuCaption`,
    subMenuCaption: `${PREFIX}-subMenuCaption`,
    menuDivider: `${PREFIX}-menuDivider`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
    [`& .${classes.menuCaption}`]: {
        ...theme.typography.menuCaption
    },

    [`& .${classes.subMenuCaption}`]: {
        ...theme.typography.subMenuCaption
    },

    [`& .${classes.menuDivider}`]: {
        marginTop: '2px',
        marginBottom: '10px'
    }
}));

// ===========================|| SIDEBAR MENU LIST GROUP ||=========================== //

function NavGroup({ item }) {
    // menu list collapse & items
    const items = item.children.map((menu) => {
        switch (menu.type) {
            case 'collapse':
                return <NavCollapse key={menu.id} menu={menu} level={1} />;
            case 'item':
                return <NavItem key={menu.id} item={menu} level={1} />;
            default:
                return (
                    <Typography key={menu.id} variant="h6" color="error" align="center">
                        Menu Items Error
                    </Typography>
                );
        }
    });

    return (
        <Root>
            <List
            // Adds bold header grouping best used in sidebar
            // subheader={
            //     item.title && (
            //         <Typography variant="caption" className={classes.menuCaption} display="block" gutterBottom>
            //             {item.title}
            //             {item.caption && (
            //                 <Typography variant="caption" className={classes.subMenuCaption} display="block" gutterBottom>
            //                     {item.caption}
            //                 </Typography>
            //             )}
            //         </Typography>
            //     )
            // }
            >
                {items}
            </List>
            {/* group divider */}
            <Divider className={classes.menuDivider} />
        </Root>
    );
}

NavGroup.propTypes = {
    item: PropTypes.object
};

export default NavGroup;
