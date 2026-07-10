'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Inscription.css';
import Link from 'next/link';

interface ChildData {
  firstName: string;
  age: string;
  class: string;
}

interface FormData {
  step1: { parentName: string; parentEmail: string; phone: string; city: string; street: string };
  children: ChildData[];
  medical: string;
  consent: boolean;
  currentStep: number;
  lang: string;
}

type Language = 'fr' | 'en' | 'ar';

const translations: Record<Language, any> = {
  fr: {
    schoolName: 'École Primaire EduSmart',
    subtitle: 'Inscription 2026',
    step1: 'Parent',
    step2: 'Enfants',
    step3: 'Santé',
    step4: 'Final',
    parentName: 'Nom complet',
    parentEmail: 'Email',
    phone: 'Téléphone',
    city: 'Ville',
    street: 'Adresse',
    children: 'Vos enfants',
    addChild: 'Ajouter un enfant',
    child: 'Enfant',
    firstName: 'Prénom',
    age: 'Âge',
    class: 'Classe',
    medical: 'Remarques médicales',
    docs: 'Documents',
    upload: 'Cliquez pour télécharger',
    consent: "J'accepte que ces informations soient utilisées par l'école dans le cadre du traitement de l'inscription.",
    prev: 'Précédent',
    next: 'Suivant',
    finish: 'Finaliser',
    submitting: 'Envoi en cours...',
    thankYou: 'Merci !',
    confirmed: 'Votre inscription a été envoyée à l\'administration.',
    contact: 'Nous vous contacterons sous 48h.',
    backHome: 'Accueil',
    parentNameTooltip: 'Ex: Amine Ben Salah',
    parentEmailTooltip: 'Ex: amine@email.com',
    phoneTooltip: 'Ex: 55 123 456',
    cityTooltip: 'Ex: Tunis',
    streetTooltip: 'Rue et numéro',
    medicalTooltip: 'Allergies, etc.',
    saveIndicator: 'Brouillon sauvegardé',
    required: 'Champ obligatoire',
    invalidPhone: 'Numéro invalide (8 chiffres min)',
    invalidEmail: 'Email invalide',
    childRequired: 'Prénom requis',
    ageRequired: 'Âge entre 1 et 18',
    atLeastOneChild: 'Ajoutez au moins un enfant',
    fileUploaded: 'Fichier sélectionné',
    consentRequired: 'Vous devez accepter pour continuer',
    submitError: "Une erreur s'est produite. Veuillez réessayer.",
  },
  en: {
    schoolName: 'EduSmart Primary School',
    subtitle: 'Registration 2026',
    step1: 'Parent',
    step2: 'Children',
    step3: 'Health',
    step4: 'Final',
    parentName: 'Full name',
    parentEmail: 'Email',
    phone: 'Phone',
    city: 'City',
    street: 'Address',
    children: 'Your children',
    addChild: 'Add child',
    child: 'Child',
    firstName: 'First name',
    age: 'Age',
    class: 'Class',
    medical: 'Medical notes',
    docs: 'Documents',
    upload: 'Click to upload',
    consent: 'I agree that this information may be used by the school to process this registration.',
    prev: 'Previous',
    next: 'Next',
    finish: 'Finish',
    submitting: 'Submitting...',
    thankYou: 'Thank you!',
    confirmed: 'Your registration has been sent to the school administration.',
    contact: 'We will contact you within 48h.',
    backHome: 'Home',
    parentNameTooltip: 'e.g. John Smith',
    parentEmailTooltip: 'e.g. john@email.com',
    phoneTooltip: 'e.g. 55 123 456',
    cityTooltip: 'e.g. Tunis',
    streetTooltip: 'Street and number',
    medicalTooltip: 'Allergies, etc.',
    saveIndicator: 'Draft saved',
    required: 'Required',
    invalidPhone: 'Invalid (min 8 digits)',
    invalidEmail: 'Invalid email',
    childRequired: 'First name required',
    ageRequired: 'Age 1-18',
    atLeastOneChild: 'Add at least one child',
    fileUploaded: 'File selected',
    consentRequired: 'You must agree to continue',
    submitError: 'Something went wrong. Please try again.',
  },
  ar: {
    schoolName: 'مدرسة إيدو سمارت الابتدائية',
    subtitle: 'تسجيل 2026',
    step1: 'ولي الأمر',
    step2: 'الأطفال',
    step3: 'الصحة',
    step4: 'النهائي',
    parentName: 'الاسم الكامل',
    parentEmail: 'البريد الإلكتروني',
    phone: 'الهاتف',
    city: 'المدينة',
    street: 'العنوان',
    children: 'أطفالكم',
    addChild: 'إضافة طفل',
    child: 'طفل',
    firstName: 'الاسم الأول',
    age: 'العمر',
    class: 'القسم',
    medical: 'ملاحظات طبية',
    docs: 'المستندات',
    upload: 'انقر للتحميل',
    consent: 'أوافق على استخدام هذه المعلومات من قبل المدرسة لمعالجة التسجيل.',
    prev: 'السابق',
    next: 'التالي',
    finish: 'إنهاء',
    submitting: 'جارٍ الإرسال...',
    thankYou: 'شكراً!',
    confirmed: 'تم إرسال طلب التسجيل إلى إدارة المدرسة.',
    contact: 'سنتصل بكم خلال 48 ساعة.',
    backHome: 'الرئيسية',
    parentNameTooltip: 'مثال: أمين بن صالح',
    parentEmailTooltip: 'مثال: amine@email.com',
    phoneTooltip: 'مثال: 55 123 456',
    cityTooltip: 'مثال: تونس',
    streetTooltip: 'الشارع والرقم',
    medicalTooltip: 'حساسية، إلخ',
    saveIndicator: 'تم حفظ المسودة',
    required: 'مطلوب',
    invalidPhone: 'رقم غير صالح (8 أرقام)',
    invalidEmail: 'بريد إلكتروني غير صالح',
    childRequired: 'الاسم الأول مطلوب',
    ageRequired: 'العمر بين 1 و 18',
    atLeastOneChild: 'أضف طفلاً واحداً على الأقل',
    fileUploaded: 'تم اختيار الملف',
    consentRequired: 'يجب الموافقة للمتابعة',
    submitError: 'حدث خطأ. حاول مرة أخرى.',
  }
};

export default function Inscription() {
  const [lang, setLang] = useState<Language>('fr');
  const [step, setStep] = useState(1);
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [children, setChildren] = useState<ChildData[]>([{ firstName: '', age: '', class: 'CP1' }]);
  const [medical, setMedical] = useState('');
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSave, setShowSave] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const t = translations[lang];

  useEffect(() => {
    const draft = localStorage.getItem('inscriptionDraft');
    if (draft) {
      const data: FormData = JSON.parse(draft);
      if (window.confirm(t.saveIndicator + ' – ' + (lang === 'fr' ? 'Restaurer ?' : 'Restore?'))) {
        setParentName(data.step1.parentName || '');
        setParentEmail(data.step1.parentEmail || '');
        setPhone(data.step1.phone || '');
        setCity(data.step1.city || '');
        setStreet(data.step1.street || '');
        setMedical(data.medical || '');
        setConsent(data.consent || false);
        if (data.children.length) setChildren(data.children);
        setStep(data.currentStep || 1);
        if (data.lang) setLang(data.lang as Language);
      }
    }
  }, []);

  const autoSave = useCallback(() => {
    const data: FormData = {
      step1: { parentName, parentEmail, phone, city, street },
      children,
      medical,
      consent,
      currentStep: step,
      lang,
    };
    localStorage.setItem('inscriptionDraft', JSON.stringify(data));
    setShowSave(true);
    setTimeout(() => setShowSave(false), 2500);
  }, [parentName, parentEmail, phone, city, street, children, medical, consent, step, lang]);

  // Fixed: skip the very first run so opening the page (or just switching
  // language/step with nothing typed yet) no longer triggers a phantom save.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(autoSave, 1200);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [parentName, parentEmail, phone, city, street, children, medical, consent, step, lang, autoSave]);

  const validateStep = (s: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    let valid = true;

    if (s === 1) {
      if (!parentName.trim()) {
        newErrors.parentName = t.required;
        valid = false;
      }
      if (!parentEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
        newErrors.parentEmail = t.invalidEmail;
        valid = false;
      }
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
    } else if (s === 3) {
      if (!consent) {
        newErrors.consent = t.consentRequired;
        valid = false;
      }
    }
    setErrors(newErrors);
    return valid;
  };

  const shakeCurrentPane = () => {
    const pane = document.querySelector('.step-pane.active-pane');
    if (pane) {
      pane.animate([
        { transform: 'translateX(-8px)' },
        { transform: 'translateX(8px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' }
      ], { duration: 300, easing: 'ease-in-out' });
    }
  };

  const fireConfetti = () => {
    if (typeof window === 'undefined') return;
    const colors = ['#c99a3b', '#0a1a2f', '#f8f4ed', '#e8a87c'];
    for (let i = 0; i < 100; i++) {
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
  };

  // This now actually runs — previously nothing called handleSubmit at all,
  // since the "Finish" button was type="button" and only called goNext.
  const submitEnrollment = async () => {
    if (!validateStep(3)) {
      shakeCurrentPane();
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentName,
          parentEmail,
          parentPhone: phone,
          city,
          street,
          children,
          medical,
          consent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.submitError);

      localStorage.removeItem('inscriptionDraft');
      setSubmitted(true);
      setStep(4);
      fireConfetti();
    } catch (err: any) {
      setErrors({ submit: err.message || t.submitError });
      shakeCurrentPane();
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    if (step === 3) {
      submitEnrollment();
      return;
    }
    if (validateStep(step)) {
      if (step < 4) setStep(step + 1);
    } else {
      shakeCurrentPane();
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

  const getStepClass = (s: number) => {
    if (step === s) return 'active';
    if (step > s) return 'completed';
    return '';
  };

  return (
    <div className="inscription-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="lang-bar">
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
        <div className="save-toast">
          <i className="fas fa-check-circle"></i> {t.saveIndicator}
        </div>
      )}

      <div className="card" ref={cardRef}>
        <div className="card-header">
          <div className="brand">
            <h1>{t.schoolName}</h1>
            <span className="badge">{t.subtitle}</span>
          </div>
        </div>

        <div className="progress-horizontal">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`progress-step ${getStepClass(s)}`}>
              <div className="circle">
                {step > s ? <i className="fas fa-check"></i> : s}
              </div>
              <div className="label">{t[`step${s}`]}</div>
            </div>
          ))}
          <div className="progress-track" />
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step 1 */}
          <div className={`step-pane ${step === 1 ? 'active-pane' : ''}`}>
            <div className="fields">
              <div className="field full">
                <label><i className="fas fa-user"></i> {t.parentName} <span className="required">*</span></label>
                <input
                  type="text"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  placeholder={t.parentNameTooltip}
                  className={errors.parentName ? 'error' : ''}
                />
                {errors.parentName && <span className="error">{errors.parentName}</span>}
              </div>
              <div className="field full">
                <label><i className="fas fa-envelope"></i> {t.parentEmail} <span className="required">*</span></label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={e => setParentEmail(e.target.value)}
                  placeholder={t.parentEmailTooltip}
                  className={errors.parentEmail ? 'error' : ''}
                />
                {errors.parentEmail && <span className="error">{errors.parentEmail}</span>}
              </div>
              <div className="field">
                <label><i className="fas fa-phone-alt"></i> {t.phone} <span className="required">*</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder={t.phoneTooltip}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>
              <div className="field">
                <label><i className="fas fa-map-marker-alt"></i> {t.city} <span className="required">*</span></label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder={t.cityTooltip}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error">{errors.city}</span>}
              </div>
              <div className="field full">
                <label><i className="fas fa-road"></i> {t.street} <span className="required">*</span></label>
                <input
                  type="text"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder={t.streetTooltip}
                  className={errors.street ? 'error' : ''}
                />
                {errors.street && <span className="error">{errors.street}</span>}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`step-pane ${step === 2 ? 'active-pane' : ''}`}>
            <div className="children-section">
              <div className="children-header">
                <h3><i className="fas fa-child"></i> {t.children}</h3>
                <button type="button" className="add-btn" onClick={addChild}>
                  <i className="fas fa-plus"></i> {t.addChild}
                </button>
              </div>
              {children.map((child, idx) => (
                <div key={idx} className="child-card">
                  <div className="child-header">
                    <h4>{t.child} {idx + 1}</h4>
                    {children.length > 1 && (
                      <button type="button" className="remove-btn" onClick={() => removeChild(idx)}>
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                  <div className="fields">
                    <div className="field">
                      <label>{t.firstName} <span className="required">*</span></label>
                      <input
                        type="text"
                        value={child.firstName}
                        onChange={e => updateChild(idx, 'firstName', e.target.value)}
                        className={errors[`child_${idx}_firstName`] ? 'error' : ''}
                      />
                      {errors[`child_${idx}_firstName`] && <span className="error">{errors[`child_${idx}_firstName`]}</span>}
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
                      {errors[`child_${idx}_age`] && <span className="error">{errors[`child_${idx}_age`]}</span>}
                    </div>
                    <div className="field full">
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
            <div className="fields">
              <div className="field full">
                <label><i className="fas fa-file-upload"></i> {t.docs}</label>
                <div className="file-zone">
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} id="fileInput" />
                  <label htmlFor="fileInput">
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>{files.length ? `${files.length} ${t.fileUploaded}` : t.upload}</p>
                  </label>
                </div>
              </div>
              <div className="field full">
                <label><i className="fas fa-heartbeat"></i> {t.medical}</label>
                <textarea
                  value={medical}
                  onChange={e => setMedical(e.target.value)}
                  placeholder={t.medicalTooltip}
                  rows={3}
                />
              </div>
              <div className="field full consent-field">
                <label className="consent-label">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                  />
                  <span>{t.consent}</span>
                </label>
                {errors.consent && <span className="error">{errors.consent}</span>}
              </div>
              {errors.submit && <div className="error-summary">{errors.submit}</div>}
            </div>
          </div>

          {/* Step 4 – Final */}
          {step === 4 && submitted && (
            <div className="step-pane active-pane final">
              <div className="thankyou">
                <i className="fas fa-check-circle"></i>
                <h2>{t.thankYou}</h2>
                <p>{t.confirmed}</p>
                <p className="contact">{t.contact}</p>
                <Link href="/" className="home-btn">
                  <i className="fas fa-arrow-left"></i> {t.backHome}
                </Link>
              </div>
            </div>
          )}

          {step !== 4 && (
            <div className="nav">
              <button type="button" className="btn btn-secondary" onClick={goPrev} disabled={step === 1 || isSubmitting}>
                <i className="fas fa-arrow-left"></i> {t.prev}
              </button>
              <button type="button" className="btn btn-primary" onClick={goNext} disabled={isSubmitting}>
                {isSubmitting ? t.submitting : (step === 3 ? t.finish : t.next)} <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}