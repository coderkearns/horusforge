import Alpine from 'alpinejs';
import screenPlugin from 'alpine-screens';
import { horusforgeApp } from './app.js';
import './styles/base.css';
import './styles/horus-theme.css';
import './styles/effects.css';

window.horusforgeApp = horusforgeApp;

Alpine.plugin(screenPlugin({
  storeName: 'screens',
  initialScreen: 'boot'
}));

window.Alpine = Alpine;
Alpine.start();
