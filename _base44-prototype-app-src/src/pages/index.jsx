import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Timer from "./Timer";

import Projects from "./Projects";

import Reports from "./Reports";

import Guide from "./Guide";

import Imprint from "./Imprint";

import PrivacyPolicy from "./PrivacyPolicy";

import BackupRestore from "./BackupRestore";

import ReferenceHtml from "./ReferenceHtml";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Timer: Timer,
    
    Projects: Projects,
    
    Reports: Reports,
    
    Guide: Guide,
    
    Imprint: Imprint,
    
    PrivacyPolicy: PrivacyPolicy,
    
    BackupRestore: BackupRestore,
    
    ReferenceHtml: ReferenceHtml,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Timer" element={<Timer />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/Guide" element={<Guide />} />
                
                <Route path="/Imprint" element={<Imprint />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/BackupRestore" element={<BackupRestore />} />
                
                <Route path="/ReferenceHtml" element={<ReferenceHtml />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}