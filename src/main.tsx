import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import Catalog from './pages/Catalog.tsx';
import './index.css';

const isCatalog = window.location.pathname.replace(/\/$/, '') === '/catalog';

createRoot(document.getElementById('root')!).render(isCatalog ? <Catalog /> : <App />);
