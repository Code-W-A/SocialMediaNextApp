import React from "react";
import css from "@/styles/homeLayout.module.css";
import Header from "@/components/Header";
import ThemeProvider from "@/lib/ThemeProvider";
import Box from "@/components/Box";
import Sidebar from "@/components/Sidebar";
import BottomNavbar from "@/components/BottomNavbar";
import AdminChatSupport from "@/components/AdminChatSupport";
import { SettingsContextProvider } from "@/context/settings/settings-provider";
import { Toaster } from "react-hot-toast";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
// TEMPORARILY COMMENTED OUT - FOLLOWERS/FOLLOWING FUNCTIONALITY
// import {
//   getAllFollowersAndFollowings,
// } from "@/actions/user";
import { currentUser } from "@/lib/firebaseAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import V1MigrationWrapper from "@/components/V1MigrationWrapper";

const HomeLayout = async ({ children }) => {
  const queryClient = new QueryClient();
  const user = await currentUser();

  // TEMPORARILY COMMENTED OUT - FOLLOWERS/FOLLOWING FUNCTIONALITY
  // get profile info of logged in user
  // await queryClient.prefetchQuery({
  //   queryKey: ["user", user?.id, "followInfo"],
  //   queryFn: () => getAllFollowersAndFollowings(user?.id),
  //   enabled: !!user,
  //   // 20 mins stale time
  //   staleTime: 1000 * 60 * 20,
  // });


  return (
    <ProtectedRoute>
      <SettingsContextProvider>
        <ThemeProvider>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <V1MigrationWrapper>
              <Box
                type="baseBg"
                style={{ position: "relative", width: "100vw", height: "100vh" }}
              >
                <div className={css.wrapper}>
                  {/* header */}
                  <Header />

                  {/* body */}
                  <div className={css.container}>
                    <Sidebar />

                    <div className={css.page_body}>{children}</div>
                  </div>
                  
                  {/* Bottom Navigation for Mobile */}
                  <BottomNavbar />
                  
                  {/* Admin Chat Support - Hidden, used via dropdown triggers */}
                  <AdminChatSupport trigger="hidden" />
                </div>
              </Box>
            </V1MigrationWrapper>
          </HydrationBoundary>
          <Toaster />
        </ThemeProvider>
      </SettingsContextProvider>
    </ProtectedRoute>
  );
};

export default HomeLayout;
