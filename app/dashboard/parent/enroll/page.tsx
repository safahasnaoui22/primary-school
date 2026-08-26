'use client';

import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './Inscription.css';

interface ChildData {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  classId: string;
  previousSchool: string;
}
type Language = 'fr';

const translations: Record<Language, Record<string, string>> = {
  fr: {
    schoolName: 'École Primaire EduSmart',
    subtitle: 'Inscription 2026',
    step1: 'Contact',
    step2: 'Enfants',
    step3: 'Santé',
    step4: 'Final',
    connectedAs: 'Connecté en tant que',
    phone: 'Téléphone',
    children: 'Vos enfants',
    addChild: 'Ajouter un enfant',
    child: 'Enfant',
    firstName: 'Prénom',
    lastName: 'Nom',
    age: 'Âge',
    gender: 'Genre',
    boy: 'Garçon',
    girl: 'Fille',
    class: 'Classe',
    previousSchool: 'École précédente (optionnel)',
    medical: 'Remarques médicales',
    docs: 'Documents',
    upload: 'Cliquez pour télécharger',
    consent: "J'accepte que ces informations soient utilisées par l'école dans le cadre du traitement de l'inscription.",
    prev: 'Précédent',
    next: 'Suivant',
    finish: 'Finaliser',
    submitting: 'Envoi en cours...',
    thankYou: 'Merci !',
    confirmed: "Votre inscription a été envoyée à l'administration.",
    contact: 'Nous vous contacterons sous 48h.',
    backHome: 'Retour au tableau de bord',
    phoneTooltip: 'Ex: 55 123 456',
    required: 'Champ obligatoire',
    invalidPhone: 'Numéro invalide (8 chiffres min)',
    childRequired: 'Prénom et nom requis',
    ageRequired: 'Âge entre 1 et 18',
    atLeastOneChild: 'Ajoutez au moins un enfant',
    fileUploaded: 'Fichier sélectionné',
    consentRequired: 'Vous devez accepter pour continuer',
    submitError: "Une erreur s'est produite. Veuillez réessayer.",
    loginRequired: 'Vous devez être connecté pour inscrire un enfant.',
    goToLogin: 'Se connecter',
  },
};

export default function EnrollChildPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const lang: Language = 'fr';
  const t = translations[lang];

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [children, setChildren] = useState<ChildData[]>([
    { firstName: '', lastName: '', age: '', gender: '', classId: '', previousSchool: '' },
  ]);
  const [medical, setMedical] = useState('');
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<{ id: string; name: string }[]>([]);
  const isSubmittingRef = useRef(false);

  React.useEffect(() => {
    fetch('/api/classes')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setAvailableClasses(data));
  }, []);

  const validateStep = (s: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    let valid = true;

    if (s === 1) {
      if (!phone.trim() || phone.length < 8) {
        newErrors.phone = t.invalidPhone;
        valid = false;
      }
    } else if (s === 2) {
      if (children.length === 0) {
        newErrors.children = t.atLeastOneChild;
        valid = false;
      } else {
        children.forEach((child, i) => {
          if (!child.firstName.trim() || !child.lastName.trim()) {
            newErrors[`child_${i}_name`] = t.childRequired;
            valid = false;
          }
          if (!child.classId) {
            newErrors[`child_${i}_class`] = 'Classe requise';
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
      pane.animate(
        [
          { transform: 'translateX(-8px)' },
          { transform: 'translateX(8px)' },
          { transform: 'translateX(-4px)' },
          { transform: 'translateX(4px)' },
          { transform: 'translateX(0)' },
        ],
        { duration: 300, easing: 'ease-in-out' }
      );
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

  const submitEnrollment = async () => {
    if (isSubmittingRef.current) return;
    if (!validateStep(3)) {
      shakeCurrentPane();
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentPhone: phone, children, medical, consent }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.submitError);

      setSubmitted(true);
      setStep(4);
      fireConfetti();
    } catch (err: any) {
      setErrors({ submit: err.message || t.submitError });
      shakeCurrentPane();
      isSubmittingRef.current = false; // allow retry on failure
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

  const removeChild = (idx: number) => {
    if (children.length > 1) setChildren(children.filter((_, i) => i !== idx));
  };

  const addChild = () => {
    setChildren([...children, { firstName: '', lastName: '', age: '', gender: '', classId: '', previousSchool: '' }]);
  };

  const updateChild = (idx: number, field: keyof ChildData, value: string) => {
    setChildren(children.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const getStepClass = (s: number) => {
    if (step === s) return 'active';
    if (step > s) return 'completed';
    return '';
  };

  if (status === 'loading') {
    return <div style={{ padding: 60, textAlign: 'center', color: '#5A6A7A' }}>Chargement...</div>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'PARENT') {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <p style={{ color: '#5A6A7A', marginBottom: 16 }}>{t.loginRequired}</p>
        <button
          onClick={() => router.push('/authentification')}
          style={{ background: '#FFB400', color: '#071B4A', border: 'none', padding: '10px 24px', borderRadius: 20, fontWeight: 700, cursor: 'pointer' }}
        >
          {t.goToLogin}
        </button>
      </div>
    );
  }

  return (
    <div className="inscription-page">
      <div className="card">
        <div className="card-header">
          <div className="brand">
            <h1>{t.schoolName}</h1>
            <span className="badge">{t.subtitle}</span>
          </div>
        </div>

        <div className="progress-horizontal">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`progress-step ${getStepClass(s)}`}>
              <div className="circle">{step > s ? <i className="fas fa-check"></i> : s}</div>
              <div className="label">{t[`step${s}`]}</div>
            </div>
          ))}
          <div className="progress-track" />
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {/* Step 1 — just phone + who's connected */}
          <div className={`step-pane ${step === 1 ? 'active-pane' : ''}`}>
            <div className="fields">
              <div className="field full" style={{ background: '#FAFAFA', padding: 14, borderRadius: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#5A6A7A' }}>{t.connectedAs}</span>
                <div style={{ fontWeight: 700, color: '#071B4A' }}>{session?.user?.name}</div>
                <div style={{ fontSize: 13, color: '#5A6A7A' }}>{session?.user?.email}</div>
              </div>
              <div className="field full">
                <label><i className="fas fa-phone-alt"></i> {t.phone} <span className="required">*</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phoneTooltip}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>
            </div>
          </div>

          {/* Step 2 — children */}
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
                        onChange={(e) => updateChild(idx, 'firstName', e.target.value)}
                        className={errors[`child_${idx}_name`] ? 'error' : ''}
                      />
                    </div>
                    <div className="field">
                      <label>{t.lastName} <span className="required">*</span></label>
                      <input
                        type="text"
                        value={child.lastName}
                        onChange={(e) => updateChild(idx, 'lastName', e.target.value)}
                        className={errors[`child_${idx}_name`] ? 'error' : ''}
                      />
                      {errors[`child_${idx}_name`] && <span className="error">{errors[`child_${idx}_name`]}</span>}
                    </div>
                    <div className="field">
                      <label>{t.age} <span className="required">*</span></label>
                      <input
                        type="number"
                        min="1"
                        max="18"
                        value={child.age}
                        onChange={(e) => updateChild(idx, 'age', e.target.value)}
                        className={errors[`child_${idx}_age`] ? 'error' : ''}
                      />
                      {errors[`child_${idx}_age`] && <span className="error">{errors[`child_${idx}_age`]}</span>}
                    </div>
                    <div className="field">
                      <label>{t.gender}</label>
                      <select value={child.gender} onChange={(e) => updateChild(idx, 'gender', e.target.value)}>
                        <option value="">—</option>
                        <option value="M">{t.boy}</option>
                        <option value="F">{t.girl}</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>{t.class} <span className="required">*</span></label>
                      <select value={child.classId} onChange={(e) => updateChild(idx, 'classId', e.target.value)}>
                        <option value="">— Choisir une classe —</option>
                        {availableClasses.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      {errors[`child_${idx}_class`] && <span className="error">{errors[`child_${idx}_class`]}</span>}
                      {availableClasses.length === 0 && (
                        <span style={{ fontSize: 12, color: '#5A6A7A' }}>Aucune classe disponible pour le moment.</span>
                      )}
                    </div>
                    <div className="field full">
                      <label>{t.previousSchool}</label>
                      <input
                        type="text"
                        value={child.previousSchool}
                        onChange={(e) => updateChild(idx, 'previousSchool', e.target.value)}
                      />
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
                <textarea value={medical} onChange={(e) => setMedical(e.target.value)} rows={3} />
              </div>
              <div className="field full consent-field">
                <label className="consent-label">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <span>{t.consent}</span>
                </label>
                {errors.consent && <span className="error">{errors.consent}</span>}
              </div>
              {errors.submit && <div className="error-summary">{errors.submit}</div>}
            </div>
          </div>

          {/* Step 4 */}
          {step === 4 && submitted && (
            <div className="step-pane active-pane final">
              <div className="thankyou">
                <i className="fas fa-check-circle"></i>
                <h2>{t.thankYou}</h2>
                <p>{t.confirmed}</p>
                <p className="contact">{t.contact}</p>
                <Link href="/dashboard/parent" className="home-btn">
                 {t.backHome}
                </Link>
              </div>
            </div>
          )}

          {step !== 4 && (
            <div className="nav">
              <button type="button" className="btn btn-secondary" onClick={goPrev} disabled={step === 1 || isSubmitting}>
              {t.prev}
              </button>
              <button type="button" className="btn btn-primary" onClick={goNext} disabled={isSubmitting}>
                {isSubmitting ? t.submitting : step === 3 ? t.finish : t.next} <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}