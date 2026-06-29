'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Inscription.css';
import Link from 'next/link';

// Types
interface ChildData {
  firstName: string;
  age: string;
  class: string;
}

interface FormData {
  step1: { phone: string; city: string; street: string };
  children: ChildData[];
  medical: string;
  currentStep: number;
  lang: string;
}

type Language = 'fr' | 'en' | 'ar';

const translations: Record<Language, any> = {
  fr: {
    schoolName: 'EduSmart',
    subtitle: 'Excellence & Tradition depuis 1992',
    formTitle: 'Inscription Année 2026',
    step1: 'Parent',
    step2: 'Enfants',
    step3: 'Santé & Docs',
    step4: 'Finalisation',
    phone: 'Numéro de téléphone',
    city: 'Ville / Gouvernorat',
    street: 'Adresse complète',
    children: 'Vos enfants',
    addChild: 'Ajouter un enfant',
    child: 'Enfant',
    firstName: 'Prénom',
    age: 'Âge',
    class: 'Classe souhaitée',
    medical: 'Informations médicales (allergies, etc.)',
    docs: 'Documents à joindre',
    upload: 'Cliquez pour télécharger (PDF, JPG)',
    prev: 'Précédent',
    next: 'Suivant',
    finish: 'Finaliser',
    thankYou: 'Merci pour votre confiance !',
    confirmed: 'Votre inscription a été enregistrée.',
    contact: 'Notre équipe vous contactera sous 48h.',
    backHome: 'Retour à l\'accueil',
    phoneTooltip: 'Ex: 55 123 456',
    cityTooltip: 'Ex: Tunis, Sousse, etc.',
    streetTooltip: 'Rue, numéro, code postal',
    medicalTooltip: 'Indiquez toute information importante',
    saveIndicator: 'Brouillon sauvegardé',
    required: 'Champ obligatoire',
    invalidPhone: 'Numéro invalide (8 chiffres minimum)',
    childRequired: 'Prénom requis',
    ageRequired: 'Âge valide (1-18)',
    atLeastOneChild: 'Ajoutez au moins un enfant',
    fileUploaded: 'Fichier sélectionné',
  },
  en: {
    schoolName: 'EduSmart',
    subtitle: 'Excellence & Tradition since 1992',
    formTitle: 'Registration 2026',
    step1: 'Parent',
    step2: 'Children',
    step3: 'Health & Docs',
    step4: 'Finalize',
    phone: 'Phone number',
    city: 'City / Governorate',
    street: 'Full address',
    children: 'Your children',
    addChild: 'Add a child',
    child: 'Child',
    firstName: 'First name',
    age: 'Age',
    class: 'Desired class',
    medical: 'Medical information (allergies, etc.)',
    docs: 'Attach documents',
    upload: 'Click to upload (PDF, JPG)',
    prev: 'Previous',
    next: 'Next',
    finish: 'Finish',
    thankYou: 'Thank you for your trust!',
    confirmed: 'Your registration has been recorded.',
    contact: 'Our team will contact you within 48h.',
    backHome: 'Back to home',
    phoneTooltip: 'e.g. 55 123 456',
    cityTooltip: 'e.g. Tunis, Sousse',
    streetTooltip: 'Street, number, postal code',
    medicalTooltip: 'Indicate any important information',
    saveIndicator: 'Draft saved',
    required: 'Required',
    invalidPhone: 'Invalid phone (min 8 digits)',
    childRequired: 'First name required',
    ageRequired: 'Valid age (1-18)',
    atLeastOneChild: 'Add at least one child',
    fileUploaded: 'File selected',
  },
  ar: {
    schoolName: 'EduSmart',
    subtitle: 'التميز والتقليد منذ 1992',
    formTitle: 'تسجيل 2026',
    step1: 'ولي الأمر',
    step2: 'الأطفال',
    step3: 'الصحة والوثائق',
    step4: 'الإنهاء',
    phone: 'رقم الهاتف',
    city: 'المدينة / الولاية',
    street: 'العنوان الكامل',
    children: 'أطفالكم',
    addChild: 'إضافة طفل',
    child: 'طفل',
    firstName: 'الاسم الأول',
    age: 'العمر',
    class: 'القسم المطلوب',
    medical: 'معلومات طبية (حساسية...)',
    docs: 'المستندات المرفقة',
    upload: 'انقر للتحميل (PDF، JPG)',
    prev: 'السابق',
    next: 'التالي',
    finish: 'إنهاء',
    thankYou: 'شكراً لثقتكم!',
    confirmed: 'تم تسجيل طلبكم بنجاح.',
    contact: 'سيتصل بكم فريقنا خلال 48 ساعة.',
    backHome: 'العودة للرئيسية',
    phoneTooltip: 'مثال: 55 123 456',
    cityTooltip: 'مثال: تونس، سوسة',
    streetTooltip: 'الشارع، الرقم، الرمز البريدي',
    medicalTooltip: 'أي معلومات طبية مهمة',
    saveIndicator: 'تم حفظ المسودة',
    required: 'مطلوب',
    invalidPhone: 'رقم غير صالح (8 أرقام على الأقل)',
    childRequired: 'الاسم الأول مطلوب',
    ageRequired: 'عمر صالح (1-18)',
    atLeastOneChild: 'أضف طفلاً واحداً على الأقل',
    fileUploaded: 'تم اختيار الملف',
  }
};

const Inscription: React.FC = () => {
  const [lang, setLang] = useState<Language>('fr');
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [children, setChildren] = useState<ChildData[]>([{ firstName: '', age: '', class: 'CP1' }]);
  const [medical, setMedical] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSave, setShowSave] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const t = translations[lang];

  // Load draft
  useEffect(() => {
    const draft = localStorage.getItem('inscriptionDraft');
    if (draft) {
      const data: FormData = JSON.parse(draft);
      if (window.confirm(t.saveIndicator + ' – ' + (lang === 'fr' ? 'Restaurer ?' : 'Restore?'))) {
        setPhone(data.step1.phone || '');
        setCity(data.step1.city || '');
        setStreet(data.step1.street || '');
        setMedical(data.medical || '');
        if (data.children.length) setChildren(data.children);
        setStep(data.currentStep || 1);
        if (data.lang) setLang(data.lang as Language);
      }
    }
  }, []);

  // Auto-save
  const autoSave = useCallback(() => {
    const data: FormData = {
      step1: { phone, city, street },
      children,
      medical,
      currentStep: step,
      lang,
    };
    localStorage.setItem('inscriptionDraft', JSON.stringify(data));
    setShowSave(true);
    setTimeout(() => setShowSave(false), 2500);
  }, [phone, city, street, children, medical, step, lang]);

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(autoSave, 1200);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [phone, city, street, children, medical, step, lang, autoSave]);

  // Validation
  const validateStep = (s: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    let valid = true;

    if (s === 1) {
      if (!phone.trim() || phone.length < 8) {
        newErrors.phone = t.invalidPhone;
        valid = false;
      }
      if (!city.trim()) {
        newErrors.city = t.required;
        valid = false;
      }
      if (!street.trim()) {
        newErrors.street = t.required;
        valid = false;
      }
    } else if (s === 2) {
      if (children.length === 0) {
        newErrors.children = t.atLeastOneChild;
        valid = false;
      } else {
        children.forEach((child, i) => {
          if (!child.firstName.trim()) {
            newErrors[`child_${i}_firstName`] = t.childRequired;
            valid = false;
          }
          const age = parseInt(child.age);
          if (isNaN(age) || age < 1 || age > 18) {
            newErrors[`child_${i}_age`] = t.ageRequired;
            valid = false;
          }
        });
      }
    }
    setErrors(newErrors);
    return valid;
  };

  const goNext = () => {
    if (validateStep(step)) {
      if (step < 4) setStep(step + 1);
    } else {
      // shake animation on the active pane
      const pane = document.querySelector('.step-pane.active-pane');
      if (pane) {
        pane.animate([
          { transform: 'translateX(-10px)' },
          { transform: 'translateX(10px)' },
          { transform: 'translateX(-6px)' },
          { transform: 'translateX(6px)' },
          { transform: 'translateX(0)' }
        ], { duration: 400, easing: 'ease-in-out' });
      }
    }
  };

  const goPrev = () => { if (step > 1) setStep(step - 1); };

  const addChild = () => {
    setChildren([...children, { firstName: '', age: '', class: 'CP1' }]);
  };

  const removeChild = (idx: number) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== idx));
    }
  };

  const updateChild = (idx: number, field: keyof ChildData, value: string) => {
    const updated = children.map((c, i) => (i === idx ? { ...c, [field]: value } : c));
    setChildren(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(3)) {
      setSubmitted(true);
      // Show confetti / success
      localStorage.removeItem('inscriptionDraft');
      // Confetti effect
      if (typeof window !== 'undefined') {
        const colors = ['#c99a3b', '#0a1a2f', '#f8f4ed', '#e8a87c'];
        for (let i = 0; i < 120; i++) {
          const el = document.createElement('div');
          el.style.cssText = `
            position: fixed; 
            width: ${6 + Math.random() * 10}px; 
            height: ${6 + Math.random() * 10}px; 
            background: ${colors[Math.floor(Math.random() * colors.length)]}; 
            left: ${Math.random() * 100}%; 
            top: -10px; 
            border-radius: ${Math.random() > 0.5 ? '50%' : '2px'}; 
            transform: rotate(${Math.random() * 360}deg); 
            z-index: 9999; 
            pointer-events: none; 
            animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
          `;
          document.body.appendChild(el);
          setTimeout(() => el.remove(), 5000);
        }
      }
    }
  };

  const getStepClass = (s: number) => {
    if (step === s) return 'active';
    if (step > s) return 'completed';
    return '';
  };

  return (
    <div className="inscription-page">
      <div className="background-decor" />
      
      <div className="language-selector">
        {(['fr', 'ar', 'en'] as Language[]).map(l => (
          <button
            key={l}
            className={`lang-btn ${lang === l ? 'active' : ''}`}
            onClick={() => setLang(l)}
          >
            {l === 'fr' ? 'FR' : l === 'ar' ? 'ع' : 'EN'}
          </button>
        ))}
      </div>

      {showSave && (
        <div className="save-indicator">
          <i className="fas fa-check-circle"></i> {t.saveIndicator}
        </div>
      )}

      <div className="inscription-card" ref={cardRef}>
        <div className="card-header">
          <div className="school-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1>{t.schoolName}</h1>
            <p>{t.subtitle}</p>
            <span className="form-title">{t.formTitle}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-steps">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`step-item ${getStepClass(s)}`}>
              <div className="step-circle">
                {step > s ? <i className="fas fa-check"></i> : s}
              </div>
              <div className="step-label">{t[`step${s}`]}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1 */}
          <div className={`step-pane ${step === 1 ? 'active-pane' : ''}`}>
            <div className="form-grid">
              <div className="field full-width">
                <label><i className="fas fa-phone-alt"></i> {t.phone} <span className="required">*</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder={t.phoneTooltip}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>
              <div className="field full-width">
                <label><i className="fas fa-map-marker-alt"></i> {t.city} <span className="required">*</span></label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder={t.cityTooltip}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-msg">{errors.city}</span>}
              </div>
              <div className="field full-width">
                <label><i className="fas fa-road"></i> {t.street} <span className="required">*</span></label>
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder={t.streetTooltip}
                  className={errors.street ? 'error' : ''}
                />
                {errors.street && <span className="error-msg">{errors.street}</span>}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`step-pane ${step === 2 ? 'active-pane' : ''}`}>
            <div className="children-header">
              <h3><i className="fas fa-child"></i> {t.children}</h3>
              <button type="button" className="add-child-btn" onClick={addChild}>
                <i className="fas fa-plus"></i> {t.addChild}
              </button>
            </div>
            <div className="children-list">
              {children.map((child, idx) => (
                <div key={idx} className="child-card">
                  <div className="child-header">
                    <h4>{t.child} {idx + 1}</h4>
                    <button
                      type="button"
                      className="remove-child"
                      onClick={() => removeChild(idx)}
                      style={{ visibility: children.length > 1 ? 'visible' : 'hidden' }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <label>{t.firstName} <span className="required">*</span></label>
                      <input
                        type="text"
                        value={child.firstName}
                        onChange={e => updateChild(idx, 'firstName', e.target.value)}
                        className={errors[`child_${idx}_firstName`] ? 'error' : ''}
                      />
                      {errors[`child_${idx}_firstName`] && <span className="error-msg">{errors[`child_${idx}_firstName`]}</span>}
                    </div>
                    <div className="field">
                      <label>{t.age} <span className="required">*</span></label>
                      <input
                        type="number"
                        min="1"
                        max="18"
                        value={child.age}
                        onChange={e => updateChild(idx, 'age', e.target.value)}
                        className={errors[`child_${idx}_age`] ? 'error' : ''}
                      />
                      {errors[`child_${idx}_age`] && <span className="error-msg">{errors[`child_${idx}_age`]}</span>}
                    </div>
                    <div className="field full-width">
                      <label>{t.class}</label>
                      <select
                        value={child.class}
                        onChange={e => updateChild(idx, 'class', e.target.value)}
                      >
                        <option>CP1</option>
                        <option>CP2</option>
                        <option>CE1</option>
                        <option>CE2</option>
                        <option>CM1</option>
                        <option>CM2</option>
                        <option>6ème</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              {errors.children && <div className="error-summary">{errors.children}</div>}
            </div>
          </div>

          {/* Step 3 */}
          <div className={`step-pane ${step === 3 ? 'active-pane' : ''}`}>
            <div className="form-grid">
              <div className="field full-width">
                <label><i className="fas fa-file-upload"></i> {t.docs}</label>
                <div className="file-zone">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    id="fileInput"
                  />
                  <label htmlFor="fileInput">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>{files.length ? `${files.length} ${t.fileUploaded}` : t.upload}</p>
                  </label>
                </div>
              </div>
              <div className="field full-width">
                <label><i className="fas fa-heartbeat"></i> {t.medical}</label>
                <textarea
                  value={medical}
                  onChange={e => setMedical(e.target.value)}
                  placeholder={t.medicalTooltip}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Step 4 – Final */}
          {step === 4 && (
            <div className="step-pane active-pane final-step">
              <div className="thankyou-message">
                <i className="fas fa-check-circle"></i>
                <h2>{t.thankYou}</h2>
                <p>{t.confirmed}</p>
                <p className="contact-note">{t.contact}</p>
                <Link href="/" className="btn-home">
                  <i className="fas fa-arrow-left"></i> {t.backHome}
                </Link>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step !== 4 && (
            <div className="nav-buttons">
              <button type="button" className="btn btn-secondary" onClick={goPrev} disabled={step === 1}>
                <i className="fas fa-arrow-left"></i> {t.prev}
              </button>
              <button type="button" className="btn btn-primary" onClick={goNext}>
                {step === 3 ? t.finish : t.next} <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Inscription;