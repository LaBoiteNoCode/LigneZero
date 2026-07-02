import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from '@/data/DataProvider';
import { Layout } from '@/components/layout/Layout';
import HomePage from '@/pages/HomePage';
import TeamPage from '@/pages/TeamPage';
import StaffPage from '@/pages/StaffPage';
import GamesPage from '@/pages/GamesPage';
import SponsorsPage from '@/pages/SponsorsPage';
import SchedulePage from '@/pages/SchedulePage';
import ShopPage from '@/pages/ShopPage';
import CommunityPage from '@/pages/CommunityPage';
import AccountPage from '@/pages/AccountPage';
import DemoPage from '@/pages/DemoPage';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="equipe" element={<TeamPage />} />
          <Route path="staff" element={<StaffPage />} />
          <Route path="jeux" element={<GamesPage />} />
          <Route path="sponsors" element={<SponsorsPage />} />
          <Route path="calendrier" element={<SchedulePage />} />
          <Route path="communaute" element={<CommunityPage />} />
          <Route path="compte" element={<AccountPage />} />
          <Route path="boutique" element={<ShopPage />} />
          <Route path="demo" element={<DemoPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  );
}
