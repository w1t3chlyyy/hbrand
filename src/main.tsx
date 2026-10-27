import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import Catalog from './pages/Catalog.tsx';
import NewPage from './pages/NewPage.tsx';
import './index.css';

const path = window.location.pathname.replace(/\/$/, '');
const Page = path === '/catalog' ? Catalog : path === '/new' ? NewPage : App;

createRoot(document.getElementById('root')!).render(<Page />);
