import React from 'react';
import PropTypes from 'prop-types';
import {
  AlertTriangle,
  Trash2,
  Droplets,
  Lightbulb,
  CloudRain,
  Activity,
  Wind,
  Volume2,
  Hammer,
  Trees,
  PawPrint,
  TrafficCone,
  HelpCircle,
} from 'lucide-react';

const ICON_MAP = {
  'roads-potholes': AlertTriangle,
  'garbage-waste': Trash2,
  'water-supply': Droplets,
  'street-lighting': Lightbulb,
  'drainage-sewage': CloudRain,
  'public-health': Activity,
  'air-pollution': Wind,
  'noise-pollution': Volume2,
  'illegal-construction': Hammer,
  'tree-greenery': Trees,
  'stray-animals': PawPrint,
  'traffic-signage': TrafficCone,
};

export default function CategoryIcon({ iconKey, categoryName, className = 'w-5 h-5' }) {
  let IconComponent = HelpCircle;

  if (iconKey && ICON_MAP[iconKey]) {
    IconComponent = ICON_MAP[iconKey];
  } else if (categoryName) {
    const nameLower = categoryName.toLowerCase();
    if (nameLower.includes('road') || nameLower.includes('pothole')) IconComponent = AlertTriangle;
    else if (nameLower.includes('garbage') || nameLower.includes('waste')) IconComponent = Trash2;
    else if (nameLower.includes('water') || nameLower.includes('leak')) IconComponent = Droplets;
    else if (nameLower.includes('light')) IconComponent = Lightbulb;
    else if (nameLower.includes('drain') || nameLower.includes('sewage')) IconComponent = CloudRain;
    else if (nameLower.includes('health') || nameLower.includes('sanitation')) IconComponent = Activity;
    else if (nameLower.includes('air')) IconComponent = Wind;
    else if (nameLower.includes('noise')) IconComponent = Volume2;
    else if (nameLower.includes('construction')) IconComponent = Hammer;
    else if (nameLower.includes('tree') || nameLower.includes('greenery')) IconComponent = Trees;
    else if (nameLower.includes('animal') || nameLower.includes('stray')) IconComponent = PawPrint;
    else if (nameLower.includes('traffic') || nameLower.includes('signage')) IconComponent = TrafficCone;
  }

  return <IconComponent className={className} />;
}

CategoryIcon.propTypes = {
  iconKey: PropTypes.string,
  categoryName: PropTypes.string,
  className: PropTypes.string,
};
