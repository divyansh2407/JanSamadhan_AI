/**
 * JanSamadhan – Multi-Section Civic Problem Reporting Form
 * Supports both Registered Citizens and Zero-PII Anonymous Reporters.
 * Sections: Category -> Details -> Location -> Photographic Evidence -> Review & Submit.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Shield,
  EyeOff,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Camera,
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Search,
  Crosshair,
  Info,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CategoryIcon from '../../components/common/CategoryIcon';
import LocationSelector from '../../components/map/LocationSelector';
import reportService from '../../services/reportService';
import { useAuth } from '../../hooks/useAuth';

const SEVERITY_LEVELS = [
  { value: 'LOW', label: 'Low', description: 'Minor issue, no immediate safety hazard' },
  { value: 'MEDIUM', label: 'Medium', description: 'Noticeable inconvenience or recurring problem' },
  { value: 'HIGH', label: 'High', description: 'Significant disruption, risk of damage or injury' },
  { value: 'CRITICAL', label: 'Critical', description: 'Severe emergency hazard requiring prompt intervention' },
];

const POPULAR_CITIES = ['Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Thane', 'Bengaluru', 'Delhi', 'Hyderabad'];

export const DEFAULT_CATEGORIES = [
  {
    id: 'cat-roads',
    name: 'Roads and Potholes',
    description: 'Potholes, damaged pavements, road cave-ins, and unfinished asphalt work.',
    icon: 'Construction',
  },
  {
    id: 'cat-garbage',
    name: 'Garbage and Waste Management',
    description: 'Overflowing dumpsters, uncollected domestic waste, and illegal debris dumping.',
    icon: 'Trash2',
  },
  {
    id: 'cat-water',
    name: 'Water Supply and Leakage',
    description: 'Pipeline bursts, low water pressure, contaminated supply, and leaking public taps.',
    icon: 'Droplets',
  },
  {
    id: 'cat-drainage',
    name: 'Drainage and Sewage',
    description: 'Blocked stormwater drains, sewage overflow, broken manhole covers, and backflow.',
    icon: 'Waves',
  },
  {
    id: 'cat-electricity',
    name: 'Electricity and Streetlights',
    description: 'Dark streetlights, leaning electric poles, sparking transformers, and dangling cables.',
    icon: 'Zap',
  },
  {
    id: 'cat-traffic',
    name: 'Traffic and Transportation',
    description: 'Broken traffic lights, missing road signage, junction bottlenecks, and bus stop damage.',
    icon: 'Car',
  },
  {
    id: 'cat-pollution',
    name: 'Air and Noise Pollution',
    description: 'Industrial emissions, open garbage burning, and excessive construction noise.',
    icon: 'Wind',
  },
  {
    id: 'cat-infrastructure',
    name: 'Public Infrastructure',
    description: 'Damaged footbridges, municipal school buildings, cracked community walls, and barriers.',
    icon: 'Building2',
  },
  {
    id: 'cat-safety',
    name: 'Public Safety',
    description: 'Unlit dark corridors, open excavation trenches, abandoned structures, and stray hazards.',
    icon: 'ShieldAlert',
  },
  {
    id: 'cat-sanitation',
    name: 'Sanitation and Hygiene',
    description: 'Unhygienic public toilets, stagnant vector breeding pools, and open defecation spots.',
    icon: 'Sparkles',
  },
  {
    id: 'cat-parks',
    name: 'Parks and Public Spaces',
    description: 'Overgrown public parks, vandalized playground equipment, and damaged walking tracks.',
    icon: 'Trees',
  },
  {
    id: 'cat-other',
    name: 'Other Civic Issues',
    description: 'Civic grievances not covered under standard municipal classifications.',
    icon: 'HelpCircle',
  },
];

export default function ReportProblemForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Mode: 'anonymous' or 'registered'
  const requestedMode = searchParams.get('mode') === 'anonymous' ? 'anonymous' : 'registered';
  const isAnonymous = requestedMode === 'anonymous';

  // Step tracker (1 to 5)
  const [currentStep, setCurrentStep] = useState(1);

  // Categories state initialized with defaults for instantaneous zero-latency display
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [categorySearch, setCategorySearch] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    description: '',
    severity: 'MEDIUM',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    address: '',
    landmark: '',
    wardId: '',
    wardName: '',
    latitude: null,
    longitude: null,
    locationAccuracy: null,
    locationMode: 'manual', // 'manual' | 'gps'
  });

  // Images state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef(null);

  // UI / Error state
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Redirect to login if user selected registered mode but is not logged in
  useEffect(() => {
    if (!isAnonymous && !isAuthenticated) {
      navigate('/login?redirect=/report/submit?mode=registered');
    }
  }, [isAnonymous, isAuthenticated, navigate]);

  // Load categories from backend (with instantaneous fallback)
  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const data = await reportService.getCategories();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      } catch (err) {
        console.warn('Using standard municipal categories fallback:', err);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };
    fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Smart multi-word, space-collapsed, and synonym category matching
  const filteredCategories = categories.filter((cat) => {
    const rawSearch = categorySearch.toLowerCase().trim();
    if (!rawSearch) return true;

    const name = (cat.name || '').toLowerCase();
    const desc = (cat.description || '').toLowerCase();

    // 1. Direct substring match on name or description
    if (name.includes(rawSearch) || desc.includes(rawSearch)) {
      return true;
    }

    // 2. Whitespace-removed match (e.g. "street light" matches "Electricity and Streetlights")
    const collapsedSearch = rawSearch.replace(/[\s\-_]+/g, '');
    const collapsedName = name.replace(/[\s\-_]+/g, '');
    const collapsedDesc = desc.replace(/[\s\-_]+/g, '');
    if (collapsedName.includes(collapsedSearch) || collapsedDesc.includes(collapsedSearch)) {
      return true;
    }

    // 3. Multi-word match: every word in the search query appears in name or description
    const words = rawSearch.split(/[\s\-_]+/).filter((w) => w.length > 1);
    if (words.length > 0) {
      const allWordsMatch = words.every(
        (word) => name.includes(word) || desc.includes(word) || collapsedName.includes(word)
      );
      if (allWordsMatch) return true;
    }

    // 4. Common civic synonyms / aliases
    const aliases = {
      'street light': ['electricity', 'light', 'lamp', 'pole'],
      'streetlight': ['electricity', 'light', 'lamp', 'pole'],
      'light': ['electricity', 'streetlight'],
      'electric': ['power', 'transformer', 'cable'],
      'pothole': ['road', 'pavement', 'asphalt'],
      'road': ['pothole', 'footpath', 'traffic'],
      'garbage': ['waste', 'trash', 'dumpster', 'sanitation'],
      'waste': ['garbage', 'trash', 'sanitation'],
      'water': ['pipeline', 'leakage', 'tap', 'drainage'],
      'drain': ['sewage', 'manhole', 'water', 'drainage'],
      'sewage': ['drainage', 'manhole', 'waste'],
      'traffic': ['transportation', 'signal', 'bus', 'car'],
      'pollution': ['air', 'noise', 'smoke'],
      'safety': ['hazard', 'dark', 'trench'],
      'park': ['garden', 'playground', 'trees'],
    };

    for (const [key, related] of Object.entries(aliases)) {
      if (rawSearch.includes(key) || key.includes(rawSearch)) {
        if (
          related.some((r) => name.includes(r) || desc.includes(r)) ||
          name.includes(key) ||
          desc.includes(key)
        ) {
          return true;
        }
      }
    }

    return false;
  });

  const selectedCategoryObj = categories.find((c) => c.id === formData.categoryId);

  // GPS Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(latitude.toFixed(6)),
          longitude: parseFloat(longitude.toFixed(6)),
          locationAccuracy: Math.round(accuracy),
          locationMode: 'gps',
        }));
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === 1
            ? 'Location access denied. Please enable location permissions or enter address manually.'
            : 'Unable to retrieve location. Please fill the address manually.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle Photo selection (1 to 3 images, max 5MB each, JPEG/PNG/WebP)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxBytes = 5 * 1024 * 1024; // 5MB

    const newFiles = [];
    const newPreviews = [];
    const fileErrors = [];

    if (selectedFiles.length + files.length > 3) {
      setErrors((prev) => ({
        ...prev,
        images: 'Maximum of 3 photographic evidence attachments allowed.',
      }));
      return;
    }

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        fileErrors.push(`${file.name}: Only JPEG, PNG, or WebP images are permitted.`);
        return;
      }
      if (file.size > maxBytes) {
        fileErrors.push(`${file.name}: Exceeds maximum 5MB size limit.`);
        return;
      }

      newFiles.push(file);
      newPreviews.push({
        url: URL.createObjectURL(file),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      });
    });

    if (fileErrors.length > 0) {
      setErrors((prev) => ({ ...prev, images: fileErrors.join(' ') }));
    } else {
      setErrors((prev) => ({ ...prev, images: null }));
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index].url);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation per step
  const validateStep = (step) => {
    const errs = {};

    if (step === 1) {
      if (!formData.categoryId) errs.categoryId = 'Please select a problem category';
    } else if (step === 2) {
      if (!formData.title.trim() || formData.title.trim().length < 5) {
        errs.title = 'Title must be at least 5 characters';
      } else if (formData.title.trim().length > 150) {
        errs.title = 'Title cannot exceed 150 characters';
      }

      if (!formData.description.trim() || formData.description.trim().length < 10) {
        errs.description = 'Description must be at least 10 characters';
      } else if (formData.description.trim().length > 2000) {
        errs.description = 'Description cannot exceed 2000 characters';
      }
    } else if (step === 3) {
      if (!formData.address.trim() || formData.address.trim().length < 3) {
        errs.address = 'Street address or location description is required';
      }
      if (!formData.city.trim()) {
        errs.city = 'City is required';
      }
      if (!/^\d{6}$/.test(formData.pincode.trim())) {
        errs.pincode = 'Please enter a valid 6-digit Indian PIN code';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Submission Handler
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      alert('Please complete all required fields in the form.');
      return;
    }

    if (!termsAccepted) {
      setErrors((prev) => ({
        ...prev,
        terms: 'You must confirm that this report describes a genuine civic issue.',
      }));
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      // 1. Upload any selected images to server storage (strips EXIF automatically)
      const uploadedFileUrls = [];
      if (selectedFiles.length > 0) {
        setUploadingImages(true);
        try {
          for (const file of selectedFiles) {
            const res = await reportService.uploadImage(file);
            if (res && res.url) {
              uploadedFileUrls.push(res.url);
            }
          }
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          throw new Error(
            uploadErr.response?.data?.message ||
              uploadErr.message ||
              'Failed to upload image evidence. Please check file format and size.'
          );
        } finally {
          setUploadingImages(false);
        }
      }

      // 2. Prepare payload
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        severity: formData.severity,
        address: formData.address.trim(),
        landmark: formData.landmark ? formData.landmark.trim() : null,
        city: formData.city.trim(),
        state: formData.state.trim() || 'Maharashtra',
        pincode: formData.pincode.trim() || '411001',
        wardId: formData.wardId ? formData.wardId : null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        imageUrl: uploadedFileUrls.length > 0 ? uploadedFileUrls[0] : null,
        imageUrls: uploadedFileUrls,
      };

      // 3. Dispatch to appropriate endpoint
      let result;
      if (isAnonymous) {
        result = await reportService.submitAnonymousReport(payload);
      } else {
        result = await reportService.submitRegisteredReport(payload);
      }

      // 4. Navigate to confirmation view with full submission payload
      navigate('/report/confirmation', {
        state: {
          isAnonymous,
          result,
          formData: {
            ...formData,
            categoryName: selectedCategoryObj?.name,
            uploadedFileUrls,
          },
        },
      });
    } catch (err) {
      console.error('Report submission failed:', err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to submit report. Please check your network and try again.';
      setSubmitError(errMsg);
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8]">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="section-container max-w-4xl mx-auto px-4">
          {/* Mode Banner */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-civic-border shadow-xs">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  isAnonymous
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {isAnonymous ? <EyeOff className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#172B20]">
                    {isAnonymous ? 'Anonymous Civic Reporting' : 'Registered Citizen Report'}
                  </h2>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      isAnonymous
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-green-50 text-green-800 border border-green-200'
                    }`}
                  >
                    {isAnonymous ? 'Zero PII Mode' : 'Verified Profile'}
                  </span>
                </div>
                <p className="text-xs text-[#647067]">
                  {isAnonymous
                    ? 'No personal data or login attached. A one-time 256-bit secret token will be issued.'
                    : `Reporting as ${user?.name || 'Citizen'} (${user?.email}). Linked to your dashboard.`}
                </p>
              </div>
            </div>

            <Link
              to={`/report/submit?mode=${isAnonymous ? 'registered' : 'anonymous'}`}
              className="text-xs text-green-700 hover:text-green-800 font-semibold underline shrink-0"
            >
              Switch to {isAnonymous ? 'Citizen Mode' : 'Anonymous Mode'}
            </Link>
          </div>

          {/* Stepper Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: 'Category' },
                { num: 2, label: 'Problem Details' },
                { num: 3, label: 'Location' },
                { num: 4, label: 'Photo Evidence' },
                { num: 5, label: 'Review & Submit' },
              ].map((step) => (
                <div key={step.num} className="flex-1 flex flex-col items-center relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (step.num < currentStep) setCurrentStep(step.num);
                    }}
                    disabled={step.num > currentStep}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      currentStep === step.num
                        ? 'bg-green-600 text-white shadow-md ring-4 ring-green-100'
                        : currentStep > step.num
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {currentStep > step.num ? <CheckCircle2 className="w-5 h-5 text-green-700" /> : step.num}
                  </button>
                  <span
                    className={`mt-2 text-[11px] font-medium hidden sm:block ${
                      currentStep === step.num
                        ? 'text-green-800 font-bold'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Content Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-civic-border shadow-sm">
            {submitError && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* STEP 1: CATEGORY SELECTION                                    */}
            {/* ───────────────────────────────────────────────────────────── */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-[#172B20]">Select Problem Category</h3>
                  <p className="text-xs text-[#647067] mt-1">
                    Choose the municipal department category that best matches your issue.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories (e.g., pothole, drainage, street light)..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-civic-border text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>

                {errors.categoryId && (
                  <p className="text-xs text-rose-600 font-medium">{errors.categoryId}</p>
                )}

                {loadingCategories ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-civic-secondary text-xs">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                    <span>Loading municipal categories...</span>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50">
                    <HelpCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-700">
                      No categories found matching &quot;{categorySearch}&quot;
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Try searching for &quot;street light&quot;, &quot;pothole&quot;, &quot;garbage&quot;, &quot;drainage&quot;, or &quot;water&quot;.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCategorySearch('')}
                      className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredCategories.map((cat) => {
                      const isSelected = formData.categoryId === cat.id;
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, categoryId: cat.id }));
                            setErrors((prev) => ({ ...prev, categoryId: null }));
                          }}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                            isSelected
                              ? 'border-green-600 bg-green-50/70 shadow-sm ring-2 ring-green-500/20'
                              : 'border-civic-border hover:border-green-300 hover:bg-gray-50'
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-civic-secondary'
                            }`}
                          >
                            <CategoryIcon iconKey={cat.icon} categoryName={cat.name} />
                          </div>
                          <div className="min-w-0">
                            <h4
                              className={`text-xs font-bold truncate ${
                                isSelected ? 'text-green-950' : 'text-[#172B20]'
                              }`}
                            >
                              {cat.name}
                            </h4>
                            <p className="text-[11px] text-[#647067] line-clamp-2 mt-0.5">
                              {cat.description || 'Report civic concerns in this category'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!formData.categoryId}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>Continue to Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* STEP 2: PROBLEM DETAILS                                       */}
            {/* ───────────────────────────────────────────────────────────── */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <div className="flex items-center gap-2 text-xs text-green-700 font-semibold mb-1">
                    <CategoryIcon
                      iconKey={selectedCategoryObj?.icon}
                      categoryName={selectedCategoryObj?.name}
                      className="w-4 h-4"
                    />
                    <span>{selectedCategoryObj?.name || 'Selected Category'}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#172B20]">Describe the Problem</h3>
                  <p className="text-xs text-[#647067] mt-1">
                    Provide clear, factual specifics to help municipal authorities dispatch the correct team.
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-1">
                    Problem Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="e.g. Deep pothole causing skidding near Shivaji Nagar bus stop"
                    maxLength={150}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-green-500 focus:outline-none ${
                      errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-civic-border'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1 text-[11px] text-[#647067]">
                    <span>{errors.title ? <span className="text-rose-600 font-medium">{errors.title}</span> : 'Be concise and clear'}</span>
                    <span>{formData.title.length}/150</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-1">
                    Detailed Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Explain what is wrong, when it started, and any hazards to traffic, pedestrians, or public health..."
                    maxLength={2000}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-green-500 focus:outline-none ${
                      errors.description ? 'border-rose-400 bg-rose-50/30' : 'border-civic-border'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1 text-[11px] text-[#647067]">
                    <span>{errors.description ? <span className="text-rose-600 font-medium">{errors.description}</span> : 'Minimum 10 characters required'}</span>
                    <span>{formData.description.length}/2000</span>
                  </div>
                </div>

                {/* Severity Level */}
                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-2">
                    Severity Assessment
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {SEVERITY_LEVELS.map((sev) => {
                      const isSelected = formData.severity === sev.value;
                      return (
                        <div
                          key={sev.value}
                          onClick={() => setFormData((prev) => ({ ...prev, severity: sev.value }))}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-green-600 bg-green-50/70 ring-2 ring-green-500/20'
                              : 'border-civic-border hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-bold uppercase ${
                                sev.value === 'CRITICAL'
                                  ? 'text-rose-600'
                                  : sev.value === 'HIGH'
                                  ? 'text-amber-600'
                                  : 'text-[#172B20]'
                              }`}
                            >
                              {sev.label}
                            </span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                          </div>
                          <p className="text-[11px] text-[#647067] mt-1 leading-snug">
                            {sev.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-civic-border text-xs font-semibold text-civic-secondary hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>Continue to Location</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* STEP 3: LOCATION DETAILS                                      */}
            {/* ───────────────────────────────────────────────────────────── */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-[#172B20]">Location Details</h3>
                  <p className="text-xs text-[#647067] mt-1">
                    Pinpoint where the problem is located using GPS, OpenStreetMap pin placement, or manual address.
                  </p>
                </div>

                {/* Location Intelligence: GPS Detection & Interactive OpenStreetMap Pin */}
                <LocationSelector
                  value={formData}
                  onChange={setFormData}
                  city={formData.city || 'Pune'}
                />

                {/* Option B: Manual Address Fields */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#647067]">
                    Address & Landmark Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-xs font-bold text-[#172B20] mb-1">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                        placeholder="e.g. Pune"
                        className="w-full px-4 py-2.5 rounded-xl border border-civic-border text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {POPULAR_CITIES.slice(0, 4).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, city: c }))}
                            className="text-[10px] px-2 py-0.5 rounded bg-gray-100 hover:bg-green-100 text-civic-secondary hover:text-green-800 transition-colors"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ward / Zone */}
                    <div>
                      <label className="block text-xs font-bold text-[#172B20] mb-1">
                        Ward / Zone / Prabhag (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.wardName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, wardName: e.target.value }))}
                        placeholder="e.g. Ward 12 - Kothrud / Baner"
                        className="w-full px-4 py-2.5 rounded-xl border border-civic-border text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-xs font-bold text-[#172B20] mb-1">
                      Street Address / Road Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="e.g. JM Road, near Deccan Gymkhana"
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-green-500 focus:outline-none ${
                        errors.address ? 'border-rose-400 bg-rose-50/30' : 'border-civic-border'
                      }`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.address}</p>
                    )}
                  </div>

                  {/* Landmark & PIN code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#172B20] mb-1">
                        Prominent Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => setFormData((prev) => ({ ...prev, landmark: e.target.value }))}
                        placeholder="e.g. Opposite Sambhaji Park Main Gate"
                        className="w-full px-4 py-2.5 rounded-xl border border-civic-border text-xs focus:ring-2 focus:ring-green-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B20] mb-1">
                        PIN Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={formData.pincode}
                        onChange={(e) => setFormData((prev) => ({ ...prev, pincode: e.target.value }))}
                        placeholder="e.g. 411004"
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-green-500 focus:outline-none ${
                          errors.pincode ? 'border-rose-400 bg-rose-50/30' : 'border-civic-border'
                        }`}
                      />
                      {errors.pincode && (
                        <p className="mt-1 text-xs text-rose-600 font-medium">{errors.pincode}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-civic-border text-xs font-semibold text-civic-secondary hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>Continue to Photos</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* STEP 4: PHOTOGRAPHIC EVIDENCE                                 */}
            {/* ───────────────────────────────────────────────────────────── */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-[#172B20]">Photographic Evidence</h3>
                  <p className="text-xs text-[#647067] mt-1">
                    Upload 1 to 3 clear photos. Photos significantly improve verification speed and municipal action.
                  </p>
                </div>

                {/* Privacy & EXIF disclosure note */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Automatic Privacy Protection:</strong> All uploaded photos are parsed server-side to strip embedded EXIF markers, GPS tags, and camera serial numbers.
                  </span>
                </div>

                {errors.images && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    {errors.images}
                  </div>
                )}

                {/* File Dropzone */}
                {selectedFiles.length < 3 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 hover:border-green-500 rounded-3xl p-8 text-center cursor-pointer transition-all hover:bg-green-50/30 flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#172B20] block">
                        Click to upload photos or take a picture
                      </span>
                      <span className="text-[11px] text-[#647067] block mt-0.5">
                        Supported: JPEG, PNG, WebP • Max 5MB per image • Up to 3 photos
                      </span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Previews */}
                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[#172B20] block">
                      Selected Photos ({imagePreviews.length}/3):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {imagePreviews.map((prev, index) => (
                        <div
                          key={index}
                          className="relative rounded-2xl border border-civic-border overflow-hidden bg-gray-50 group"
                        >
                          <img
                            src={prev.url}
                            alt={prev.name}
                            className="w-full h-36 object-cover"
                          />
                          <div className="p-2 bg-white/95 border-t border-civic-border text-[10px] text-[#647067] truncate flex items-center justify-between">
                            <span className="truncate">{prev.name}</span>
                            <span className="shrink-0 font-mono ml-1">{prev.size}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors"
                            title="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-civic-border text-xs font-semibold text-civic-secondary hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <span>Continue to Review</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────── */}
            {/* STEP 5: REVIEW & SUBMIT                                       */}
            {/* ───────────────────────────────────────────────────────────── */}
            {currentStep === 5 && (
              <form onSubmit={handleSubmitReport} className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-xl font-bold text-[#172B20]">Review Your Submission</h3>
                  <p className="text-xs text-[#647067] mt-1">
                    Please verify your report details before submitting to municipal dispatch.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-5 rounded-2xl bg-[#F8FAF8] border border-civic-border space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <span className="font-semibold text-[#647067]">Reporting Mode:</span>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full ${
                        isAnonymous
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {isAnonymous ? 'Anonymous (Zero PII)' : 'Registered Citizen'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-gray-200 pb-3">
                    <div>
                      <span className="font-semibold text-[#647067] block">Category:</span>
                      <span className="font-bold text-[#172B20] flex items-center gap-1.5 mt-0.5">
                        <CategoryIcon
                          iconKey={selectedCategoryObj?.icon}
                          categoryName={selectedCategoryObj?.name}
                          className="w-4 h-4 text-green-600"
                        />
                        {selectedCategoryObj?.name}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#647067] block">Severity Level:</span>
                      <span className="font-bold text-[#172B20] mt-0.5 block">{formData.severity}</span>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-3">
                    <span className="font-semibold text-[#647067] block">Title:</span>
                    <span className="font-bold text-[#172B20] mt-0.5 block">{formData.title}</span>
                  </div>

                  <div className="border-b border-gray-200 pb-3">
                    <span className="font-semibold text-[#647067] block">Description:</span>
                    <p className="text-[#172B20] mt-0.5 leading-relaxed whitespace-pre-line">
                      {formData.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-gray-200 pb-3">
                    <div>
                      <span className="font-semibold text-[#647067] block">Location:</span>
                      <span className="text-[#172B20] mt-0.5 block">
                        {formData.address}
                        {formData.landmark && ` (Landmark: ${formData.landmark})`}, {formData.city} - {formData.pincode}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-[#647067] block">GPS Coordinates:</span>
                      <span className="text-[#172B20] mt-0.5 font-mono block">
                        {formData.latitude && formData.longitude
                          ? `${formData.latitude}, ${formData.longitude}`
                          : 'Not provided (Manual Address)'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-[#647067] block">Attached Photos:</span>
                    <span className="text-[#172B20] mt-0.5 block">
                      {imagePreviews.length} photo(s) selected
                    </span>
                  </div>
                </div>

                {/* Important Anonymous Warning Box */}
                {isAnonymous && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="block font-bold">Crucial Anonymous Reporting Requirement:</strong>
                      <p className="leading-relaxed">
                        Upon clicking submit, you will be issued a <strong>256-bit Secret Tracking Key</strong>.
                        Because zero personal information is retained, this key is <strong>irrecoverable if lost</strong>.
                        You must copy or download this key on the next screen to check future status updates.
                      </p>
                    </div>
                  </div>
                )}

                {/* Confirmation Terms Checkbox */}
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        if (e.target.checked) setErrors((prev) => ({ ...prev, terms: null }));
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-xs text-[#172B20] leading-snug">
                      I declare that the information and photographs submitted represent a genuine civic issue in good faith. I understand that false or defamatory reports violate platform terms.
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-xs text-rose-600 font-medium pl-6">{errors.terms}</p>
                  )}
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-civic-border text-xs font-semibold text-civic-secondary hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-xs font-bold shadow-md transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                          {uploadingImages ? 'Sanitizing Photos...' : 'Submitting to Municipal Intake...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <FileCheck className="w-4 h-4" />
                        <span>Confirm & Submit Civic Report</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

