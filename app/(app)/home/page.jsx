import HomeView from "@/sections/home/view/HomeView";

export const metadata = {
  title: `Home`,
  description: `Social media app home page`,
};

const HomePage = async () => {
  return <HomeView />;
};

export default HomePage; 