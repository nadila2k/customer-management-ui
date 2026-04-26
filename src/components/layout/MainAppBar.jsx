import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import styles from "./AppBar.module.css";

function MainAppBar() {
  return (
    <AppBar position="sticky" elevation={0} className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
      
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <PeopleAltOutlinedIcon sx={{ color: "#fff", fontSize: 18 }} />
          </div>
          <Typography className={styles.logoText}>CustomerHub</Typography>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default MainAppBar;
