import React from 'react';
import { createRoot } from 'react-dom/client';
import TeachMode from './components/TeachMode';
import './style.css';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<TeachMode />);