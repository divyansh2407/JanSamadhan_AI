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
  Zap,
  Waves,
  Car,
  Building2,
  ShieldAlert,
  Sparkles,
  Construction,
} from 'lucide-react';

const ICON_MAP = {
  // PascalCase Lucide icon names from seed & database
  Zap: Zap,
  Construction: Construction,
  Trash2: Trash2,
  Droplets: Droplets,
  Waves: Waves,
  Car: Car,
  Wind: Wind,
  Building2: Building2,
  ShieldAlert: ShieldAlert,
  Sparkles: Sparkles,
  Trees: Trees,
  HelpCircle: HelpCircle,
  Lightbulb: Lightbulb,
  CloudRain: CloudRain,
  AlertTriangle: AlertTriangle,

  // Kebab-case slugs
  'roads-potholes': Construction,
  'garbage-waste': Trash2,
  'water-supply': Droplets,
  'street-lighting': Zap,
  'electricity-streetlights': Zap,
  'drainage-sewage': Waves,
  'public-health': Activity,
  'air-pollution': Wind,
  'noise-pollution': Volume2,
  'illegal-construction': Hammer,
  'tree-greenery': Trees,
  'stray-animals': PawPrint,
  'traffic-signage': Car,
  'public-infrastructure': Building2,
  'public-safety': ShieldAlert,
  'sanitation-hygiene': Sparkles,
  'parks-public-spaces': Trees,
  'other-civic-issues': HelpCircle,
};

export default function CategoryIcon({ iconKey, categoryName, className = 'w-5 h-5' }) {
  let IconComponent = HelpCircle;

  if (iconKey && ICON_MAP[iconKey]) {
    IconComponent = ICON_MAP[iconKey];
  } else if (categoryName) {
    const nameLower = categoryName.toLowerCase();
    if (nameLower.includes('road') || nameLower.includes('pothole')) IconComponent = Construction;
    else if (nameLower.includes('garbage') || nameLower.includes('waste')) IconComponent = Trash2;
    else if (nameLower.includes('water') || nameLower.includes('leak')) IconComponent = Droplets;
    else if (nameLower.includes('electric') || nameLower.includes('light')) IconComponent = Zap;
    else if (nameLower.includes('drain') || nameLower.includes('sewage')) IconComponent = Waves;
    else if (nameLower.includes('health') || nameLower.includes('sanitation') || nameLower.includes('hygiene')) IconComponent = Sparkles;
    else if (nameLower.includes('air') || nameLower.includes('wind')) IconComponent = Wind;
    else if (nameLower.includes('noise')) IconComponent = Volume2;
    else if (nameLower.includes('infra') || nameLower.includes('building')) IconComponent = Building2;
    else if (nameLower.includes('safety') || nameLower.includes('hazard')) IconComponent = ShieldAlert;
    else if (nameLower.includes('tree') || nameLower.includes('park')) IconComponent = Trees;
    else if (nameLower.includes('traffic') || nameLower.includes('car') || nameLower.includes('transport')) IconComponent = Car;
    else if (nameLower.includes('animal') || nameLower.includes('stray')) IconComponent = PawPrint;
    else if (nameLower.includes('construction')) IconComponent = Hammer;
  }

  return <IconComponent className={className} />;
}

CategoryIcon.propTypes = {
  iconKey: PropTypes.string,
  categoryName: PropTypes.string,
  className: PropTypes.string,
};

