'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Inscription.css';

// Types
interface ChildData {
  firstName: string;
  age: string;
  class: string;
}

interface FormData {
  step1: {
    phone: string;
    city: string;
    street: string;
  };
  children: ChildData[];
  medical: string;
  currentStep: number;
  lang: string;
}

type Language = 'fr' | 'en' | 'ar';

interface Translations {
  [key: string]: {
    formTitle: string;
    formSubtitle: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
    phone: string;
    city: string;
    street: string;
    children: string;
    addChild: string;
    child: string;
    firstName: string;
    age: string;
    class: string;
    medical: string;
    docs: string;
    upload: string;
    prev: string;
    next: string;
    finish: string;
    thankYou: string;
    confirmed: string;
    contact: string;
    phoneTooltip: string;
    cityTooltip: string;
    streetTooltip: string;
    medicalTooltip: string;
    saveIndicator: string;
  };
}

const translations: Translations = {
  fr: {
    formTitle: 'École Moderne Tunis',
    formSubtitle: 'inscription premium · année 2026',
    step1: 'Parent',
    step2: 'Enfants',
    step3: 'Santé + docs',
    step4: 'Final',
    phone: 'Téléphone',
    city: 'address',
    street: 'Rue & numéro',
    children: 'Vos enfants',
    addChild: 'Ajouter un enfant',
    child: 'Enfant',
    firstName: 'Prénom',
    age: 'Âge',
    class: 'Classe souhaitée',
    medical: 'Remarque médicale',
    docs: 'Documents requis',
    upload: 'PDF ou photo (cliquez)',
    prev: 'Précédent',
    next: 'Suivant',
    finish: 'Terminer',
    thankYou: 'Merci !',
    confirmed: 'Inscription confirmée',
    contact: "L'équipe vous contactera sous 48h",
    phoneTooltip: 'Numéro valide requis',
    cityTooltip: 'Votre ville de résidence',
    streetTooltip: 'Adresse complète',
    medicalTooltip: 'Informations médicales importantes',
    saveIndicator: 'Brouillon sauvegardé'
  },
  en: {
    formTitle: 'Tunis Modern School',
    formSubtitle: 'premium registration · year 2026',
    step1: 'Parent',
    step2: 'Children',
    step3: 'Health + docs',
    step4: 'Final',
    phone: 'Phone',
    city: 'address',
    street: 'Street & number',
    children: 'Your children',
    addChild: 'Add a child',
    child: 'Child',
    firstName: 'First name',
    age: 'Age',
    class: 'Desired class',
    medical: 'Medical note',
    docs: 'Required documents',
    upload: 'PDF or photo (click)',
    prev: 'Previous',
    next: 'Next',
    finish: 'Finish',
    thankYou: 'Thank you!',
    confirmed: 'Registration confirmed',
    contact: 'The team will contact you within 48h',
    phoneTooltip: 'Valid number required',
    cityTooltip: 'Your city of residence',
    streetTooltip: 'Complete address',
    medicalTooltip: 'Important medical information',
    saveIndicator: 'Draft saved'
  },
  ar: {
    formTitle: 'المدرسة التونسية العصرية',
    formSubtitle: 'تسجيل ممتاز · سنة 2026',
    step1: 'ولي الأمر',
    step2: 'الأطفال',
    step3: 'الصحة + المستندات',
    step4: 'النهائي',
    phone: 'الهاتف',
    city: 'المدينة / المعتمدية',
    street: 'الشارع والرقم',
    children: 'أطفالكم',
    addChild: 'إضافة طفل',
    child: 'طفل',
    firstName: 'الاسم الأول',
    age: 'العمر',
    class: 'القسم المطلوب',
    medical: 'ملاحظة طبية',
    docs: 'المستندات المطلوبة',
    upload: 'PDF أو صورة (انقر)',
    prev: 'السابق',
    next: 'التالي',
    finish: 'إنهاء',
    thankYou: 'شكراً!',
    confirmed: 'تم تأكيد التسجيل',
    contact: 'سيتصل بك الفريق خلال 48 ساعة',
    phoneTooltip: 'رقم صالح مطلوب',
    cityTooltip: 'مدينة إقامتك',
    streetTooltip: 'العنوان الكامل',
    medicalTooltip: 'معلومات طبية مهمة',
    saveIndicator: 'تم حفظ المسودة'
  }
};

const Inscription: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showSaveIndicator, setShowSaveIndicator] = useState<boolean>(false);
  const [children, setChildren] = useState<ChildData[]>([
    { firstName: 'Youssef', age: '7', class: 'CE1' }
  ]);
  
  // Form fields
  const [phone, setPhone] = useState<string>('52 555 789');
  const [city, setCity] = useState<string>('TEBOLBA');
  const [street, setStreet] = useState<string>('Route de la plage 7');
  const [medicalNote, setMedicalNote] = useState<string>('Youssef : allergie aux arachides');
  
  // Error states
  const [phoneError, setPhoneError] = useState<string>('');
  const [cityError, setCityError] = useState<string>('');
  const [streetError, setStreetError] = useState<string>('');
  const [step1Error, setStep1Error] = useState<string>('');
  const [step2Error, setStep2Error] = useState<string>('');
  const [step3Error, setStep3Error] = useState<string>('');
  
  // Refs – FIXED: use ReturnType<typeof setTimeout>
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const totalSteps = 4;

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Update language and direction
  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    
    // Animate on language change
    if (cardRef.current) {
      cardRef.current.style.transform = 'scale(1.02)';
      setTimeout(() => {
        if (cardRef.current) cardRef.current.style.transform = 'scale(1)';
      }, 300);
    }
  }, [currentLang]);

  // Auto-save function
  const autoSaveDraft = useCallback(() => {
    const formData: FormData = {
      step1: { phone, city, street },
      children,
      medical: medicalNote,
      currentStep,
      lang: currentLang
    };
    
    localStorage.setItem('formDraft', JSON.stringify(formData));
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 3000);
  }, [phone, city, street, children, medicalNote, currentStep, currentLang]);

  // Debounced auto-save
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(autoSaveDraft, 1000);
    
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [phone, city, street, children, medicalNote, currentStep, currentLang, autoSaveDraft]);

  // Load draft from localStorage
  const loadDraft = () => {
    const draft = localStorage.getItem('formDraft');
    if (draft) {
      const data: FormData = JSON.parse(draft);
      
      if (window.confirm(
        currentLang === 'fr' ? 'Un brouillon a été trouvé. Voulez-vous le restaurer ?' :
        currentLang === 'en' ? 'A draft was found. Do you want to restore it?' :
        'تم العثور على مسودة. هل تريد استعادتها؟'
      )) {
        setPhone(data.step1.phone || '');
        setCity(data.step1.city || '');
        setStreet(data.step1.street || '');
        setMedicalNote(data.medical || '');
        setChildren(data.children.length ? data.children : [{ firstName: '', age: '', class: 'CP1' }]);
        setCurrentStep(data.currentStep || 1);
        if (data.lang) setCurrentLang(data.lang as Language);
      }
    }
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    let isValid = true;

    if (step === 1) {
      setPhoneError('');
      setCityError('');
      setStreetError('');
      setStep1Error('');

      if (!phone.trim()) {
        setPhoneError(currentLang === 'fr' ? 'Le téléphone est requis' : 
                     currentLang === 'en' ? 'Phone is required' : 'الهاتف مطلوب');
        isValid = false;
      } else if (!/^[0-9\s\+\-]{8,}$/.test(phone)) {
        setPhoneError(currentLang === 'fr' ? 'Format de téléphone invalide' : 
                     currentLang === 'en' ? 'Invalid phone format' : 'صيغة الهاتف غير صالحة');
        isValid = false;
      }

      if (!city.trim()) {
        setCityError(currentLang === 'fr' ? 'La ville est requise' : 
                    currentLang === 'en' ? 'City is required' : 'المدينة مطلوبة');
        isValid = false;
      }

      if (!street.trim()) {
        setStreetError(currentLang === 'fr' ? "L'adresse est requise" : 
                      currentLang === 'en' ? 'Address is required' : 'العنوان مطلوب');
        isValid = false;
      }

      setStep1Error(isValid ? '' : 
        currentLang === 'fr' ? 'Veuillez corriger les erreurs' : 
        currentLang === 'en' ? 'Please correct the errors' : 'يرجى تصحيح الأخطاء');
      
      return isValid;
    }

    if (step === 2) {
      if (children.length === 0) {
        setStep2Error(currentLang === 'fr' ? 'Ajoutez au moins un enfant' :
                     currentLang === 'en' ? 'Add at least one child' : 'أضف طفلاً واحداً على الأقل');
        return false;
      }

      let allValid = true;
      children.forEach((child, index) => {
        if (!child.firstName.trim()) {
          allValid = false;
        }
        if (!child.age || parseInt(child.age) < 1 || parseInt(child.age) > 18) {
          allValid = false;
        }
      });

      setStep2Error(allValid ? '' : 
        currentLang === 'fr' ? 'Veuillez corriger les erreurs' : 
        currentLang === 'en' ? 'Please correct the errors' : 'يرجى تصحيح الأخطاء');
      
      return allValid;
    }

    if (step === 3) {
      setStep3Error('');
      return true;
    }

    return true;
  };

  // Navigation handlers
  const goToNext = () => {
    if (!validateStep(currentStep)) {
      // Shake animation
      const activePane = document.querySelector('.step-pane.active-pane');
      if (activePane) {
        activePane.animate([
          { transform: 'translateX(-12px)' },
          { transform: 'translateX(12px)' },
          { transform: 'translateX(-6px)' },
          { transform: 'translateX(6px)' },
          { transform: 'translateX(-3px)' },
          { transform: 'translateX(3px)' },
          { transform: 'translateX(0)' }
        ], {
          duration: 400,
          easing: 'ease-in-out'
        });
      }
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Child management
  const addChild = () => {
    setChildren(prev => [...prev, { firstName: '', age: '', class: 'CP1' }]);
  };

  const removeChild = (index: number) => {
    if (children.length > 1) {
      setChildren(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateChild = (index: number, field: keyof ChildData, value: string) => {
    setChildren(prev => prev.map((child, i) => 
      i === index ? { ...child, [field]: value } : child
    ));
  };

  // Confetti effect
  const showConfetti = () => {
    const colors = ['#0b2f4e', '#1e2f3c', '#d0dae6', '#ffffff'];
    
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: ${Math.random() * 10 + 5}px;
        height: ${Math.random() * 10 + 5}px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}%;
        top: -10px;
        opacity: ${Math.random() * 0.8 + 0.2};
        transform: rotate(${Math.random() * 360}deg);
        z-index: 1000;
        pointer-events: none;
        animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
      `;
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 5000);
    }
  };

  const handleFinish = () => {
    // Animate check icon
    const icon = document.querySelector('.thankyou-message i');
    if (icon) {
      icon.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.3)' },
        { transform: 'scale(1)' }
      ], {
        duration: 600,
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      });
    }
    
    showConfetti();
    localStorage.removeItem('formDraft');
  };

  const t = translations[currentLang];

  return (
    <div className="inscription-body">
      {/* Floating decorative shapes */}
      <div className="floating-shapeI shapeI-1"></div>
      <div className="floating-shapeI shapeI-2"></div>
      <div className="floating-shapeI shapeI-3"></div>
      <div className="floating-shapeI shapeI-4"></div>

      {/* Language selector */}
      <div className="language-selector" id="languageSelector">
        {(['fr', 'ar', 'en'] as Language[]).map(lang => (
          <button
            key={lang}
            className={`lang-btn ${currentLang === lang ? 'active' : ''}`}
            onClick={() => setCurrentLang(lang)}
          >
            <i className="fas fa-flag"></i> {
              lang === 'fr' ? 'Français' : lang === 'ar' ? 'العربية' : 'English'
            }
          </button>
        ))}
      </div>

      {/* Save indicator */}
      {showSaveIndicator && (
        <div className="save-indicator" role="status">
          <i className="fas fa-check" aria-hidden="true"></i> {t.saveIndicator}
        </div>
      )}

      <div className="premium-card" ref={cardRef} role="main" aria-label="Formulaire d'inscription scolaire">
        <div className="school-header">
          <div className="school-icon" aria-hidden="true">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <h2>
            {t.formTitle} <span>{t.formSubtitle}</span>
          </h2>
        </div>

        {/* Progress step indicator */}
        <div className="progress-steps" id="progressSteps" role="navigation" aria-label="Progression de l'inscription">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step}
              className={`step-item ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
              data-step={step}
              role="tab"
              aria-selected={currentStep === step}
              aria-label={`Étape ${step}: ${t[`step${step}` as keyof Translations['fr']]}`}
            >
              <div className="step-circle" aria-hidden="true">
                {currentStep > step ? <i className="fas fa-check"></i> : step}
              </div>
              <div className="step-label">{t[`step${step}` as keyof Translations['fr']]}</div>
            </div>
          ))}
        </div>

        {/* Step 1: Parent */}
        <div className={`step-pane ${currentStep === 1 ? 'active-pane' : ''}`} id="step1" role="tabpanel">
          <div className="form-grid">
            <div className="field full-width">
              <label htmlFor="phone">
                <i className="fas fa-mobile-alt" aria-hidden="true"></i> {t.phone} <span className="required">*</span>
              </label>
              <input 
                type="tel" 
                id="phone" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phone}
                aria-required="true"
                aria-describedby="phoneError"
                className={phoneError ? 'error' : ''}
              />
              <span className="tooltip" role="tooltip">{t.phoneTooltip}</span>
              {phoneError && <div className="error-msg" id="phoneError" role="alert">{phoneError}</div>}
            </div>
            <div className="field full-width">
              <label htmlFor="city">
                <i className="fas fa-map-pin" aria-hidden="true"></i> {t.city} <span className="required">*</span>
              </label>
              <input 
                type="text" 
                id="city" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t.city}
                aria-required="true"
                aria-describedby="cityError"
                className={cityError ? 'error' : ''}
              />
              <span className="tooltip" role="tooltip">{t.cityTooltip}</span>
              {cityError && <div className="error-msg" id="cityError" role="alert">{cityError}</div>}
            </div>
            <div className="field full-width">
              <label htmlFor="street">
                <i className="fas fa-road" aria-hidden="true"></i> {t.street} <span className="required">*</span>
              </label>
              <input 
                type="text" 
                id="street" 
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder={t.street}
                aria-required="true"
                aria-describedby="streetError"
                className={streetError ? 'error' : ''}
              />
              <span className="tooltip" role="tooltip">{t.streetTooltip}</span>
              {streetError && <div className="error-msg" id="streetError" role="alert">{streetError}</div>}
            </div>
          </div>
          {step1Error && <div className="validation-summary" id="step1Error" role="alert">{step1Error}</div>}
        </div>

        {/* Step 2: Children */}
        <div className={`step-pane ${currentStep === 2 ? 'active-pane' : ''}`} id="step2" role="tabpanel">
          <div className="children-header">
            <h3><i className="fas fa-child" style={{ color: '#0b2f4e' }} aria-hidden="true"></i> {t.children}</h3>
            <button className="add-child-btn" onClick={addChild} aria-label={t.addChild}>
              <i className="fas fa-plus" aria-hidden="true"></i> {t.addChild}
            </button>
          </div>
          
          <div className="children-section" id="childrenContainer" role="list" aria-label="Liste des enfants">
            {children.map((child, index) => (
              <div key={index} className="child-card" data-child={index + 1} role="listitem">
                <div className="child-header">
                  <h4>👶 {t.child} {index + 1}</h4>
                  <button 
                    className="remove-child" 
                    onClick={() => removeChild(index)}
                    style={{ visibility: children.length > 1 ? 'visible' : 'hidden' }}
                    aria-label={`${t.child} ${index + 1}`}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor={`child${index}-firstname`}>
                      {t.firstName} <span className="required">*</span>
                    </label>
                    <input 
                      type="text" 
                      id={`child${index}-firstname`}
                      value={child.firstName}
                      onChange={(e) => updateChild(index, 'firstName', e.target.value)}
                      aria-required="true"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`child${index}-age`}>
                      {t.age} <span className="required">*</span>
                    </label>
                    <input 
                      type="number" 
                      id={`child${index}-age`}
                      value={child.age}
                      onChange={(e) => updateChild(index, 'age', e.target.value)}
                      aria-required="true"
                    />
                  </div>
                  <div className="field full-width">
                    <label htmlFor={`child${index}-class`}>{t.class}</label>
                    <select 
                      id={`child${index}-class`}
                      value={child.class}
                      onChange={(e) => updateChild(index, 'class', e.target.value)}
                    >
                      <option>CP1</option>
                      <option>CP2</option>
                      <option>CE1</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {step2Error && <div className="validation-summary" id="step2Error" role="alert">{step2Error}</div>}
        </div>

        {/* Step 3: Health + docs */}
        <div className={`step-pane ${currentStep === 3 ? 'active-pane' : ''}`} id="step3" role="tabpanel">
          <div className="form-grid">
            <div className="field full-width">
              <label htmlFor="docs">
                <i className="fas fa-paperclip" aria-hidden="true"></i> {t.docs}
              </label>
              <div 
                className="file-zone" 
                onClick={() => document.getElementById('docs')?.click()}
                role="button"
                tabIndex={0}
                aria-label={t.upload}
              >
                <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2.2rem', color: '#0b2f4e' }} aria-hidden="true"></i>
                <p>{t.upload}</p>
                <input type="file" id="docs" hidden multiple accept=".pdf,.jpg,.jpeg,.png" aria-hidden="true" />
              </div>
            </div>
            <div className="field full-width">
              <label htmlFor="medicalNote">
                <i className="fas fa-heartbeat" aria-hidden="true"></i> {t.medical}
              </label>
              <textarea 
                id="medicalNote" 
                value={medicalNote}
                onChange={(e) => setMedicalNote(e.target.value)}
                placeholder={t.medical}
                aria-describedby="medicalHelp"
              ></textarea>
              <span className="tooltip" role="tooltip">{t.medicalTooltip}</span>
            </div>
          </div>
          {step3Error && <div className="validation-summary" id="step3Error" role="alert">{step3Error}</div>}
        </div>

        {/* Step 4: Final */}
        <div className={`step-pane ${currentStep === 4 ? 'active-pane' : ''}`} id="step4" role="tabpanel">
          <div className="thankyou-message">
            <i className="fas fa-check-circle" aria-hidden="true"></i>
            <h2>{t.thankYou}</h2>
            <p>{t.confirmed}</p>
            <p style={{ color: '#0b2f4e' }}>{t.contact}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="nav-buttons">
          <button 
            className="btn" 
            id="prevBtn" 
            onClick={goToPrev}
            disabled={currentStep === 1}
            aria-label={t.prev}
          >
            <i className="fas fa-arrow-right" aria-hidden="true"></i> {t.prev}
          </button>
          
          {currentStep < totalSteps ? (
            <button className="btn btn-primary" id="nextBtn" onClick={goToNext} aria-label={t.next}>
              {t.next} <i className="fas fa-arrow-left" aria-hidden="true"></i>
            </button>
          ) : (
            <button className="btn btn-primary" id="finishBtn" onClick={handleFinish} aria-label={t.finish}>
              {t.finish} <i className="fas fa-check" aria-hidden="true"></i>
            </button>
          )}
        </div>
      </div>

      {/* Keyframe animation for confetti */}
      <style>{`
        @keyframes confettiFall {
          to {
            transform: translateY(100vh) rotate(${Math.random() * 720}deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Inscription;