import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import HomePageV2 from './pages/HomePageV2';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/v2" element={<HomePageV2 />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path=":slug" element={<DetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
