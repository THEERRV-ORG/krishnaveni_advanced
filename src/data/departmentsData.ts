import { DepartmentInfo } from '../types';

export const CLINICAL_DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'dept-neuro',
    name: 'Neurological Rehabilitation Department',
    shortCode: 'Neuro',
    tagline: 'Specialized Neuro-Motor Recovery, Neuroplasticity & Functional Independence',
    overview: 'Led by Dr. P. Sai Tejaswini, MPT in Neurology & MIAP, our Neurological Rehabilitation Department provides evidence-based tele-rehabilitation for patients recovering from central and peripheral nervous system disorders. We utilize principles of neuroplasticity, Bobath concepts, and PNF motor facilitation to restore maximum physical movement and quality of life.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
    iconName: 'Brain',
    colorTheme: 'from-blue-600 to-indigo-700',
    whatWeTreat: [
      {
        condition: 'Stroke',
        description: 'Targeted post-stroke recovery focusing on hemiplegia/hemiparesis, upper & lower limb neuroplasticity, spasticity management, and unassisted walking.',
        keySymptoms: ['One-sided limb weakness', 'Muscle tightness & spasticity', 'Loss of hand grip & dexterity', 'Gait and balance difficulty']
      },
      {
        condition: 'Parkinson',
        description: 'Movement disorder rehabilitation targeting resting tremors, muscle rigidity, postural instability, bradykinesia (slowness of movement), and gait freezing.',
        keySymptoms: ['Limb and hand tremors', 'Muscle stiffness & rigidity', 'Shuffling gait & balance unsteadiness', 'Slowness in initiating movement']
      },
      {
        condition: 'Multiple Sclerosis',
        description: 'Specialized neuro-rehab protocols for Multiple Sclerosis (MS), ataxia, sensory-motor coordination (Frenkel’s exercises), and fatigue management.',
        keySymptoms: ['Coordination loss & clumsy movement', 'Muscle weakness & tremors', 'Sensory numbness/tingling', 'Chronic neuro fatigue']
      },
      {
        condition: 'Cervical Spondylitis',
        description: 'Cervical spine and nerve decompression therapy, deep neck flexor strengthening, postural realignment, and radiculopathy nerve flossing.',
        keySymptoms: ['Severe neck stiffness & aching', 'Radiating pain down arm & fingers', 'Numbness or tingling in hand', 'Cervicogenic headaches']
      },
      {
        condition: 'Any Other Neurological Conditions',
        description: 'Evidence-based physical therapy for Bell’s palsy (facial palsy), Peripheral Neuropathy, Spinal Cord Injury (SCI), Guillain-Barré Syndrome (GBS), Cerebellar Ataxia, and motor neuropathy.',
        keySymptoms: ['Facial muscle drooping & asymmetry', 'Diabetic peripheral numbness in feet', 'Foot drop and balance loss', 'Post-spinal injury mobility rehabilitation']
      }
    ],
    consultationProtocol: [
      {
        step: '1. Motor & Reflex Video Assessment',
        description: 'Dr. Tejaswini conducts an interactive live movement screening, evaluating muscle tone, voluntary control, and range of motion.'
      },
      {
        step: '2. Review of MRI / CT Scans & Reports',
        description: 'Detailed analysis of brain/spine MRI scans, nerve conduction studies, and medical prescriptions uploaded by the patient.'
      },
      {
        step: '3. Neuroplasticity Home Exercise Prescription',
        description: 'Custom video-demonstrated exercises with step-by-step repetitions, pacing guidelines, and caregiver assistance guidance.'
      },
      {
        step: '4. Progressive Recovery Monitoring',
        description: 'Regular follow-up milestones to advance difficulty, improve gait speed, and transition towards unassisted independence.'
      }
    ],
    expertGuidance: [
      'Early rehabilitation within the first 3-6 months post-stroke yields the fastest neuroplastic recovery.',
      'Consistency in daily guided movement therapy is key to preventing joint contractures and muscle spasticity.',
      'Caregiver education is provided in every consultation to ensure safe transfer techniques at home.'
    ]
  },
  {
    id: 'dept-ortho',
    name: 'Orthopedic Care Department',
    shortCode: 'Ortho',
    tagline: 'Precision Joint Biomechanics, Spine Alignment, Mobility & Chronic Pain Relief',
    overview: 'Our Orthopedic Care Department specializes in diagnosing, treating, and preventing non-surgical and chronic musculoskeletal conditions. Dr. Tejaswini provides biomechanical assessments, spinal decompression exercises, and targeted joint conditioning to eliminate back, neck, shoulder, and knee pain at the root cause.',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    iconName: 'Activity',
    colorTheme: 'from-cyan-600 to-blue-700',
    whatWeTreat: [
      {
        condition: 'Sciatica & Lumbar Disc Herniation / Bulge',
        description: 'Spine decompression protocols, nerve flossing, and deep core stabilization to relieve radiating nerve pain down the leg.',
        keySymptoms: ['Sharp shooting leg pain', 'Lower back stiffness', 'Numbness in toes', 'Pain when bending']
      },
      {
        condition: 'Cervical Spondylosis, Neck Pain & Tech Neck',
        description: 'Postural correction, deep neck flexor strengthening, and scapular stabilization to relieve neck stiffness and tension headaches.',
        keySymptoms: ['Neck stiffness', 'Shoulder radiating pain', 'Tension headaches', 'Arm tingling']
      },
      {
        condition: 'Frozen Shoulder (Adhesive Capsulitis) & Rotator Cuff',
        description: 'Systematic capsular stretching, rotator cuff muscle rehabilitation, and overhead reaching mobility restoration.',
        keySymptoms: ['Severe night shoulder pain', 'Inability to reach behind back', 'Overhead stiffness']
      },
      {
        condition: 'Knee Osteoarthritis & Degenerative Joint Pain',
        description: 'Quadriceps and hamstring reconditioning, patellar tracking correction, and joint-load reduction techniques.',
        keySymptoms: ['Knee cracking/crepitus', 'Pain climbing stairs', 'Morning joint stiffness', 'Swelling']
      },
      {
        condition: 'Plantar Fasciitis & Chronic Heel / Foot Pain',
        description: 'Calf-fascia stretching, arch strengthening, gait modification, and footwear guidance.',
        keySymptoms: ['First-step morning heel pain', 'Arch ache after standing', 'Heel bone tenderness']
      },
      {
        condition: 'Tennis Elbow & Golfer’s Elbow (Epicondylitis)',
        description: 'Eccentric wrist tendon loading, forearm fascial release, and repetitive strain rehabilitation.',
        keySymptoms: ['Outer elbow soreness', 'Weak gripping power', 'Pain lifting cups/bags']
      }
    ],
    consultationProtocol: [
      {
        step: '1. Biomechanical Posture & Range Screening',
        description: 'Real-time camera assessment of spine curvature, joint angles, functional movement patterns, and pain triggers.'
      },
      {
        step: '2. Scan Analysis (X-Ray / MRI / Ultrasound)',
        description: 'Thorough review of joint space narrowing, disc bulges, tendon tears, and degenerative changes.'
      },
      {
        step: '3. Corrective Exercise & Ergonomic Plan',
        description: 'Tailored physical therapy program with ergonomic chair/desk recommendations to eliminate daily mechanical stress.'
      },
      {
        step: '4. Long-Term Spine & Joint Longevity',
        description: 'Core-strengthening regimens and functional exercises to prevent future recurrence.'
      }
    ],
    expertGuidance: [
      'Over 85% of disc bulges and sciatica cases resolve completely with conservative, guided physical therapy.',
      'Active exercise therapy is clinically proven to outperform passive painkillers for long-term joint health.',
      'Workplace ergonomic adjustments prevent repetitive strain injuries from becoming chronic disabilities.'
    ]
  },
  {
    id: 'dept-postop',
    name: 'Post-Surgical & Trauma Rehabilitation',
    shortCode: 'Post-Op',
    tagline: 'Phased Post-Operative Recovery Protocols for Complete Functional Independence',
    overview: 'Post-surgical rehabilitation is vital for preventing joint stiffness, restoring muscle bulk, and safely returning to everyday activities after orthopedic or spinal surgery. Dr. Tejaswini guides patients through evidence-based, phased recovery protocols customized to their surgeon’s guidelines.',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
    iconName: 'ShieldCheck',
    colorTheme: 'from-emerald-600 to-teal-700',
    whatWeTreat: [
      {
        condition: 'Total Knee Replacement (TKR) Rehabilitation',
        description: 'Phase-1 to Phase-3 knee bending (ROM), quadriceps lag elimination, scar mobilization, and independent stairs climbing.',
        keySymptoms: ['Knee stiffness post-surgery', 'Quadriceps weakness', 'Difficulty bending knee', 'Limping gait']
      },
      {
        condition: 'Total Hip Replacement (THR) & Hemiarthroplasty',
        description: 'Hip dislocation precaution education, abductor muscle reconditioning, and normal weight-bearing gait retraining.',
        keySymptoms: ['Hip stiffness', 'Gluteal muscle weakness', 'Unequal step length']
      },
      {
        condition: 'ACL, PCL & Meniscus Surgery Recovery',
        description: 'Graft protection protocols, progressive knee extension/flexion loading, and functional proprioceptive rehabilitation.',
        keySymptoms: ['Knee swelling', 'Loss of full extension', 'Instability on pivot', 'Muscle atrophy']
      },
      {
        condition: 'Post-Spine Surgery (Discectomy & Spinal Fusion)',
        description: 'Gentle neural mobilization, segmental spine stabilization, and safe log-rolling and bending ergonomics.',
        keySymptoms: ['Post-op back guarding', 'Stiff spine', 'Fear of movement', 'Deconditioned core']
      },
      {
        condition: 'Post-Fracture Stiffness & Cast Removal Rehab',
        description: 'Overcoming joint contractures, restoring bone-joint mobility, and rebuild muscle strength following cast removal.',
        keySymptoms: ['Severe joint stiffness', 'Limb thinning/atrophy', 'Weakness holding objects']
      }
    ],
    consultationProtocol: [
      {
        step: '1. Surgical Report & Protocol Review',
        description: 'Review of surgical discharge summary, implant specifications, postoperative X-rays, and surgeon instructions.'
      },
      {
        step: '2. Joint Swelling & ROM Assessment',
        description: 'Measuring degree of joint bend/straightening on live video and assessing localized tissue healing.'
      },
      {
        step: '3. Phased Therapeutic Movement Guidance',
        description: 'Supervised progressive exercises ensuring zero graft or implant strain while rapidly regaining mobility.'
      },
      {
        step: '4. Gait & Unassisted Walking Retraining',
        description: 'Safe transition from walker &rarr; elbow crutches &rarr; walking stick &rarr; independent walking.'
      }
    ],
    expertGuidance: [
      'Commencing structured physiotherapy within the prescribed post-op timeline prevents irreversible joint contractures.',
      'Swelling and pain are carefully managed with elevation, ice therapy routines, and gentle active-assisted movements.',
      'We work in full alignment with your operating orthopedic surgeon’s post-operative protocol.'
    ]
  },
  {
    id: 'dept-sports',
    name: 'Sports Injury & Athletic Performance',
    shortCode: 'Sports',
    tagline: 'Sports Biomechanics, Certified Kinesio Taping, Ligament Rehab & Return-to-Play',
    overview: 'Whether you are a recreational runner, gym enthusiast, or competitive athlete, our Sports Injury Department offers specialized clinical assessment and physical therapy. Dr. Tejaswini integrates kinetic chain screening, progressive tissue loading, and certified kinesiology taping protocols to get you back to peak performance.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    iconName: 'Trophy',
    colorTheme: 'from-rose-600 to-red-700',
    whatWeTreat: [
      {
        condition: 'Sprains and Strains',
        description: 'Targeted rehabilitation for ligament sprains (ankle, knee, wrist) and muscle strains (hamstring, calf, groin), focusing on active swelling reduction, progressive tissue loading, and scar remolding.',
        keySymptoms: ['Joint instability or giving way', 'Sudden sharp muscle pull', 'Localized swelling and bruising', 'Pain with weight-bearing or stretching']
      },
      {
        condition: 'Fractures',
        description: 'Post-fracture rehabilitation following bone healing or cast/brace removal, eliminating joint contractures, restoring bone-loading tolerance, and rebuilding muscular strength.',
        keySymptoms: ['Post-immobilization joint stiffness', 'Limb muscle weakness and atrophy', 'Reduced bone-loading tolerance', 'Altered movement mechanics']
      },
      {
        condition: 'Tendinitis',
        description: 'Evidence-based eccentric loading, tendon reconditioning, and biomechanical correction for Achilles tendinitis, patellar tendinitis (Jumper’s knee), and elbow tendinitis.',
        keySymptoms: ['Focal tendon tenderness and burning', 'Stiffness after resting or in the mornings', 'Pain on explosive or repetitive motion', 'Tendon thickening']
      },
      {
        condition: 'Dislocations',
        description: 'Comprehensive neuromuscular stabilization, joint proprioception training, and dynamic stabilizer strengthening for shoulder, patellar, and finger subluxations/dislocations.',
        keySymptoms: ['Joint apprehension and fear of re-injury', 'Recurrent laxity or instability', 'Surrounding muscular guarding', 'Loss of confidence in overhead motion']
      },
      {
        condition: 'Rotator Cuff injuries',
        description: 'Scapulohumeral rhythm correction, rotator cuff tendon repair rehab, rotator cuff strengthening, and overhead movement retraining without impingement.',
        keySymptoms: ['Painful arc when raising arm overhead', 'Deep ache in outer shoulder', 'Difficulty sleeping on affected side', 'Weakness during overhead tasks']
      },
      {
        condition: 'Knee injuries',
        description: 'Specialized management for ACL/PCL sprains, meniscus tears, runner’s knee (PFPS), and ligament laxity through kinetic chain alignment and progressive quadriceps/hamstring reconditioning.',
        keySymptoms: ['Knee swelling after physical activity', 'Clicking, catching, or locking sensations', 'Pain going down stairs or squatting', 'Loss of full knee extension']
      },
      {
        condition: 'Concussions',
        description: 'Sub-symptom aerobic exercise protocols, cervical spine assessment, vestibulo-ocular screening, and gradual graduated return-to-play guidelines following sports concussions.',
        keySymptoms: ['Dizziness with rapid head turns', 'Neck stiffness following impact', 'Post-exertion fatigue or brain fog', 'Balance and spatial unsteadiness']
      }
    ],
    consultationProtocol: [
      {
        step: '1. Athletic Movement & Kinetic Chain Screening',
        description: 'Assessing squat mechanics, single-leg hop stability, core engagement, and biomechanical compensation.'
      },
      {
        step: '2. Review of MRI / Ultrasound Imaging',
        description: 'Analyzing degree of tendon tear (Grade 1/2/3), bone marrow edema, or cartilage involvement.'
      },
      {
        step: '3. Certified Kinesio Taping & Loading Protocol',
        description: 'Demonstrating therapeutic taping applications and structured progressive loading exercises.'
      },
      {
        step: '4. Return-to-Sport (RTS) Testing',
        description: 'Objective strength symmetry and functional agility tests before clearing full athletic participation.'
      }
    ],
    expertGuidance: [
      'Rest alone rarely fixes athletic tendon pain; structured, progressive mechanical loading is required to rebuild tensile strength.',
      'Certified kinesiology taping provides neuromuscular feedback and joint decompression during athletic training.',
      'Correcting underlying hip and core weakness protects the knees and ankles from recurrent sports injuries.'
    ]
  },
  {
    id: 'dept-gynae-womens',
    name: 'Gynaecological & Women’s Health Department',
    shortCode: 'Gynae',
    tagline: 'Obstetric, Gynaecological, Pelvic Floor Strengthening & Women’s Health',
    overview: 'Our Gynaecological and Women’s Health Physiotherapy Department offers specialized, confidential, and evidence-based physical therapy designed for every milestone of a woman’s life. From pregnancy and postpartum recovery to pelvic pain, pelvic organ prolapse, urinary incontinence, and menopausal wellness, Dr. P. Sai Tejaswini provides compassionate, 1-on-1 personalized clinical care.',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
    iconName: 'Sparkles',
    colorTheme: 'from-pink-600 to-purple-700',
    whatWeTreat: [
      {
        condition: 'Pregnancy care',
        description: 'Trimester-safe therapeutic exercise, pelvic girdle pain (PGP) relief, sacroiliac joint stabilization, posture realignment, and gentle active movement preparation for labor.',
        keySymptoms: ['Pubic bone (symphysis pubis) tenderness', 'Lower back and buttock ache during pregnancy', 'Difficulty turning in bed or walking', 'Rib flare and postural strain']
      },
      {
        condition: 'Postnatal Rehabilitation',
        description: 'Evidence-based Diastasis Recti correction, transverse abdominis reactivation, safe post-Cesarean scar mobilization, and guided return to core strength (avoiding harmful crunches).',
        keySymptoms: ['Abdominal bulging or doming when sitting up', 'Persistent "post-baby belly"', 'Core weakness with lower back ache', 'C-section scar pulling or tightness']
      },
      {
        condition: 'Pelvic Floor Disorders',
        description: 'Targeted pelvic floor muscle re-education (guided Kegels with biofeedback mechanics) for stress/urge urinary incontinence and conservative Stage 1 & 2 pelvic organ prolapse.',
        keySymptoms: ['Urine leakage on coughing, sneezing, or laughing', 'Sudden frequent urge to urinate', 'Sensation of vaginal heaviness or bulge', 'Incomplete bladder emptying']
      },
      {
        condition: 'Pelvic & Gynaecological pain',
        description: 'Pelvic floor downtraining, myofascial trigger point relaxation, diaphragmatic breathing, and autonomic calming for chronic pelvic pain, dysmenorrhea (painful periods), and vaginismus.',
        keySymptoms: ['Deep pelvic or lower abdominal aching', 'Severe menstrual cramps and back pain', 'Painful intercourse or tampon insertion', 'Tight or spastic pelvic floor muscles']
      },
      {
        condition: 'Menopause & Women\'s Wellness',
        description: 'Bone-density preservation through osteo-protective weight-bearing exercises, joint mobility routines, postural preservation, and metabolic fitness through hormonal transitions.',
        keySymptoms: ['Generalized joint stiffness and ache', 'Gradual loss of muscle tone and stamina', 'Postural changes and spinal discomfort', 'Bone density reduction (osteopenia/osteoporosis)']
      }
    ],
    consultationProtocol: [
      {
        step: '1. Confidential Clinical & Gynaecological Intake',
        description: 'Detailed discussion in 100% private video setting covering obstetric history, symptoms, bladder/bowel patterns, and lifestyle goals.'
      },
      {
        step: '2. Posture, Diastasis Recti & Pelvic Assessment',
        description: 'Guiding self-palpation check for abdominal wall integrity, breathing mechanics, rib flare, and pelvic alignment.'
      },
      {
        step: '3. Customized Pelvic Floor & Core Prescription',
        description: 'Step-by-step coaching on correct pelvic floor contraction vs. relaxation (avoiding common straining mistakes).'
      },
      {
        step: '4. Progressive Functional Recovery Roadmap',
        description: 'Structured home exercise regimen, ergonomic tips for daily tasks, and follow-up reviews to track symptom resolution.'
      }
    ],
    expertGuidance: [
      'Over 70% of women perform Kegel exercises incorrectly (often bearing down instead of lifting); proper clinical coaching is essential for real results.',
      'Gynaecological pelvic floor physiotherapy is highly effective at any age—whether you are prenatal, 6 months postpartum, or in menopause.',
      'Standard abdominal crunches worsen Diastasis Recti and increase downward pelvic pressure; gentle transverse core recruitment is the safe, proven path.'
    ]
  },
  {
    id: 'dept-cardio-pulmonary',
    name: 'Cardiology & Pulmonology Rehabilitation Department',
    shortCode: 'Cardiology & Pulmonology',
    tagline: 'Monitored Cardiac Conditioning, Sternal Safety, Breathing Retraining & Lung Capacity Recovery',
    overview: 'Our Cardiology & Pulmonology Rehabilitation Department provides comprehensive, evidence-based tele-rehabilitation for patients recovering from cardiac events, heart surgeries, vascular disease, and chronic respiratory disorders. Dr. P. Sai Tejaswini designs supervised aerobic pacing, sternal-safe movement protocols, and diaphragmatic breathing therapies to rebuild heart-lung endurance, vital capacity, and active longevity.',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800',
    iconName: 'Heart',
    colorTheme: 'from-rose-600 to-pink-700',
    whatWeTreat: [
      {
        condition: 'Post Myocardial Infarction (Heart Attack)',
        description: 'Supervised early-phase cardiac recovery and structured aerobic pacing following a heart attack, focusing on myocardial conditioning, safe exertion thresholds, and heart rate monitoring.',
        keySymptoms: ['Post-event physical weakness', 'Fear and apprehension during physical activity', 'Shortness of breath on minimal exertion', 'Fatigue with normal daily routines']
      },
      {
        condition: 'Coronary Artery Disease (CAD)',
        description: 'Structured low-to-moderate intensity aerobic conditioning, MET-based activity pacing, and guided lifestyle physical therapy to improve myocardial perfusion, collateral circulation, and stamina.',
        keySymptoms: ['Exertional chest heaviness or fatigue', 'Reduced physical stamina during brisk walking', 'Breathlessness during stair climbing', 'Anginal threshold awareness']
      },
      {
        condition: 'Post Angioplasty / PCI',
        description: 'Graduated reconditioning and progressive walking regimens following percutaneous coronary intervention (stenting) to rebuild cardiovascular confidence safely without overexertion.',
        keySymptoms: ['Apprehension about heart rate elevation', 'General physical deconditioning', 'Uncertainty regarding safe exercise limits', 'Fatigue on moderate walking']
      },
      {
        condition: 'Post CABG (Bypass Surgery)',
        description: 'Comprehensive post-Coronary Artery Bypass Graft rehabilitation, ensuring sternal precaution compliance, thoracic mobility, scar healing, and progressive endurance building.',
        keySymptoms: ['Chest tightness or sternal guarding', 'Upper back and shoulder stiffness', 'Low aerobic stamina after hospital discharge', 'Shallow breathing patterns']
      },
      {
        condition: 'COPD (Chronic Obstructive Pulmonary Disease)',
        description: 'Diaphragmatic breathing re-education, pursed-lip breathing mechanics, sputum clearance, and graded aerobic exercise to reduce air trapping and dyspnea in emphysema and chronic bronchitis.',
        keySymptoms: ['Chronic shortness of breath with simple tasks', 'Persistent cough with mucus retention', 'Frequent chest tightness', 'Low oxygen saturation on exertion']
      },
      {
        condition: 'Asthma',
        description: 'Breathing pattern retraining, thoracic wall expansion, inspiratory muscle conditioning, and exercise-induced bronchoconstriction prevention strategies.',
        keySymptoms: ['Wheezing and breathlessness on physical exertion', 'Chest tightness during weather changes', 'Rapid, shallow upper-chest breathing', 'Exercise intolerance']
      },
      {
        condition: 'Bronchiectasis',
        description: 'Active Cycle of Breathing Techniques (ACBT), postural drainage guidance, huffing techniques, and airway clearance therapy to prevent recurrent pulmonary infections.',
        keySymptoms: ['Chronic daily productive cough with sputum', 'Frequent chest infections and fatigue', 'Dyspnea during physical activities', 'Wheezing and chest congestion']
      },
      {
        condition: 'Pneumonia',
        description: 'Post-pneumonia pulmonary rehabilitation, chest clearance mobilization, segmental expansion exercises, and progressive reconditioning to restore vital lung capacity.',
        keySymptoms: ['Post-infection residual breathlessness', 'Fatigue and reduced lung expansion', 'Persistent cough or mucus pooling', 'Weakness climbing stairs']
      },
      {
        condition: 'Any Other Cardiovascular Conditions',
        description: 'Evidence-based cardiac physical therapy for Heart Failure, Post Cardiac Surgery (Valve replacement/repair), Peripheral Arterial Disease (PAD claudication), Hypertension lifestyle management, Stable Angina, Congenital Heart Disease, and Cardiac Deconditioning.',
        keySymptoms: ['Cramping calf pain when walking (PAD claudication)', 'Dependent leg swelling & fluid fatigue (Heart failure)', 'Post-sternotomy posture slumping', 'Prolonged bed-rest physical deconditioning']
      },
      {
        condition: 'Any Other Pulmonary Conditions',
        description: 'Comprehensive respiratory rehabilitation for Post-COVID Respiratory Problems, Interstitial Lung Disease (ILD), Pulmonary Fibrosis, Pulmonary Hypertension, Atelectasis, Pleural Effusion recovery, Post-Thoracic Surgery, and Post-Tuberculosis respiratory impairment.',
        keySymptoms: ['Long-COVID chronic breathlessness & fatigue', 'Dry persistent cough and reduced lung compliance (Fibrosis)', 'Chest wall stiffness following thoracic surgery', 'Desaturation (SpO2 drops) during exertion']
      }
    ],
    consultationProtocol: [
      {
        step: '1. Cardio-Respiratory History & Scan/Report Intake',
        description: 'Detailed review of recent ECG, 2D Echocardiogram (LVEF %), pulmonary function tests (PFT / Spirometry), surgical discharge summaries, and physician advice.'
      },
      {
        step: '2. Functional Exercise Tolerance & Vitals Screening',
        description: 'Assessing resting heart rate, blood pressure history, baseline SpO2 levels, respiratory rate, and guided Borg Rating of Perceived Exertion (RPE).'
      },
      {
        step: '3. Monitored Cardiac Conditioning & Breathing Retraining',
        description: 'Demonstrating warm-up protocols, target heart rate pacing, sternal-safe home movement, diaphragmatic breathing, and chest clearance techniques.'
      },
      {
        step: '4. Graded Functional Stamina & Progression Protocol',
        description: 'Gradually advancing aerobic duration, step counts, and breathing endurance while continuously monitoring symptom thresholds.'
      }
    ],
    expertGuidance: [
      'Supervised exercise therapy significantly reduces secondary cardiac events and systematically rebuilds aerobic stamina after heart attack, CABG, or angioplasty.',
      'Pursed-lip and diaphragmatic breathing create positive expiratory pressure, keeping small airways open and dramatically decreasing breathlessness in COPD and asthma.',
      'Patients recovering from thoracic or cardiac surgery are guided with precise sternal precautions to ensure complete bone healing while preventing muscle loss.'
    ]
  }
];
