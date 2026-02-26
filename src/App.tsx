/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Why from './pages/Why';
import How from './pages/How';
import Etiquette from './pages/Etiquette';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Styleguide from './pages/Styleguide';
import { UIProvider } from './context/UIContext';

export default function App() {
  return (
    <UIProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="why" element={<Why />} />
            <Route path="how" element={<How />} />
            <Route path="etiquette" element={<Etiquette />} />
            <Route path="articles" element={<Articles />}>
              <Route path=":id" element={<ArticleDetail />} />
            </Route>
            <Route path="styleguide" element={<Styleguide />} />
          </Route>
        </Routes>
      </Router>
    </UIProvider>
  );
}
