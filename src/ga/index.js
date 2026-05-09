//Google Analytics GA4 setup
import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const isGAEnabled = Boolean(GA_MEASUREMENT_ID) && import.meta.env.PROD;

let isInitialized = false;

export const initGA = () => {
  if (!isGAEnabled || isInitialized) {
    return;
  }

  ReactGA.initialize(GA_MEASUREMENT_ID);
  isInitialized = true;
};

export const trackPageView = (url) => {
  if (!isInitialized) {
    return;
  }

  ReactGA.send({ hitType: 'pageview', page: url });
};

export const trackEvent = ({ action, category, label, value }) => {
  if (!isInitialized) {
    return;
  }

  ReactGA.event({ action, category, label, value });
};
