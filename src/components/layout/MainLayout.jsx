import { Outlet } from "react-router-dom";
import MainAppBar from "./MainAppBar";
import styles from "./MainLayout.module.css";

const MainLayout = () => {
  return (
    <div className={styles.root}>
      <MainAppBar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
