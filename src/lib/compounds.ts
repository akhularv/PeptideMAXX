import type { Compound } from '../types/compound'

// Full compound database with accurate pharmacology.
// Evidence tiers: clinical = human RCT or regulatory approval exists;
// preclinical = animal/in-vitro data; anecdotal = community reports only.
export const compounds: Compound[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // BPC-157 — Body Protection Compound 157
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'bpc-157',
    name: 'BPC-157',
    category: 'peptide',
    tags: ['healing', 'gut', 'tendon', 'anti-inflammatory', 'angiogenesis'],
    // Previously '#00E5C8' (old teal) — updated to new --accent token value #7DF0C8
    accentColor: '#7DF0C8',
    summary:
      'Pentadecapeptide (GEPPPGKPADDAGLV) derived from a gastric juice protein. ' +
      'Extensive preclinical data for tissue healing; no completed human RCTs as of 2025.',
    mechanism:
      'Stimulates angiogenesis via VEGFR2 upregulation; activates the FAK–paxillin ' +
      'pathway to drive cell migration; upregulates growth hormone receptor expression ' +
      'in tendon fibroblasts; promotes nitric oxide synthesis for vasodilation; ' +
      'modulates dopamine (D1/D2) and serotonin receptor signaling.',
    effects: [
      'Accelerated tendon and ligament healing',
      'Gastric mucosal cytoprotection (ulcer healing)',
      'Systemic anti-inflammatory action',
      'Neuroprotection in CNS injury models',
      'Skeletal muscle healing and regeneration',
    ],
    sideEffects: [
      'Nausea (especially oral route)',
      'Transient hypotension',
      'Headache',
      'Dizziness',
      'Potential interaction with anticoagulants',
    ],
    dangers: [
      'Zero completed human RCTs — long-term safety entirely unknown',
      'Anticoagulant interaction risk (NO pathway modulation)',
    ],
    evidenceTier: 'preclinical',
    halfLife: '~4 h (SubQ)',
    commonDoses: ['200–500 mcg/day'],
    routes: ['SubQ', 'IM', 'Oral (lower bioavailability)'],
    synergies: ['TB-500', 'GHK-Cu'],
    conflicts: ['Anticoagulants (warfarin, heparin)'],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // TB-500 — Thymosin Beta-4
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'tb-500',
    name: 'TB-500 (Thymosin Beta-4)',
    category: 'peptide',
    tags: ['healing', 'systemic recovery', 'cardiac', 'anti-inflammatory', 'angiogenesis'],
    // Previously '#00D4FF' (old cyan) — updated to new --accent-cool token value #7ABFFF
    accentColor: '#7ABFFF',
    summary:
      'Synthetic analogue of the endogenous 43-amino-acid peptide Thymosin Beta-4. ' +
      'Phase I/II clinical trials exist for cardiac repair; systemic healing agent.',
    mechanism:
      'Sequesters G-actin monomers, reducing polymerization and enabling cell migration; ' +
      'upregulates integrin expression on endothelial cells; inhibits NF-κB (anti-inflammatory); ' +
      'promotes angiogenesis and cardiomyocyte survival after ischemic injury.',
    effects: [
      'Systemic tissue healing and recovery acceleration',
      'Cardiac muscle protection post-ischemia',
      'Reduced inflammation at injury sites',
      'Improved flexibility and joint mobility',
      'Hair follicle stimulation (anagen phase promotion)',
    ],
    sideEffects: [
      'Fatigue',
      'Head rush / brief lightheadedness post-injection',
      'Nausea at high doses',
    ],
    dangers: [
      'Theoretical oncogenic risk: angiogenesis promotion may support tumor vascularization',
      'Contraindicated in patients with known malignancy',
    ],
    evidenceTier: 'clinical',
    halfLife: '~3–5 days',
    commonDoses: [
      '2–5 mg 2×/week (loading phase, 4–6 weeks)',
      '2 mg/week (maintenance)',
    ],
    routes: ['SubQ', 'IM'],
    synergies: ['BPC-157'],
    conflicts: ['Active malignancy (theoretical)'],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Semax — ACTH(4-7) analogue
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'semax',
    name: 'Semax',
    category: 'nootropic',
    tags: ['nootropic', 'BDNF', 'neuroprotection', 'focus', 'stroke'],
    accentColor: '#F5A623',
    summary:
      'Heptapeptide MEHFPGP — a synthetic analogue of ACTH(4-7) developed in Russia. ' +
      'Approved in Russia/Ukraine for stroke and cognitive disorders.',
    mechanism:
      'Upregulates BDNF, NGF, and VEGF gene expression; agonizes melanocortin receptors ' +
      '(MC1R–MC5R); modulates serotonergic and dopaminergic systems; suppresses ' +
      'pro-inflammatory cytokines (TNF-α, IL-1β) for neuroprotection; stimulates ' +
      'serotonin reuptake; increases acetylcholinesterase activity.',
    effects: [
      'Enhanced attention and working memory',
      'Neuroprotection post-stroke (approved indication in Russia)',
      'Anxiolytic effect at lower doses',
      'Stimulant-like focus without cardiovascular jitteriness',
      'Elevated BDNF (neurotrophic support)',
    ],
    sideEffects: [
      'Irritability at high doses',
      'Nasal irritation (intranasal route)',
      'Transient blood pressure changes',
      'Potential anxiety at high doses',
    ],
    dangers: [
      'Limited Western regulatory review; Russian clinical data not always peer-reviewed',
      'BP variability requires caution in hypertensive patients',
    ],
    evidenceTier: 'clinical',
    halfLife: 'Minutes in serum; CNS effects persist 4–8 h',
    commonDoses: ['300–900 mcg/day intranasal'],
    routes: ['Intranasal (primary)', 'SubQ'],
    synergies: ['Selank'],
    conflicts: [],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Selank — Tuftsin analogue
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'selank',
    name: 'Selank',
    category: 'nootropic',
    tags: ['anxiolytic', 'nootropic', 'GABA', 'immunomodulation', 'mood'],
    accentColor: '#A78BFA',
    summary:
      'Heptapeptide TKPRPGP — a synthetic analogue of the immunopeptide tuftsin. ' +
      'Approved in Russia for anxiety disorders; non-sedating, non-habit-forming.',
    mechanism:
      'Potentiates GABAergic transmission via GABA-A receptor modulation; ' +
      'increases BDNF gene expression; upregulates IL-6 (immunomodulation); ' +
      'inhibits enkephalinase, increasing endogenous enkephalin half-life; ' +
      'modulates serotonin metabolism and turnover.',
    effects: [
      'Anxiolytic effect without sedation or dependence',
      'Cognitive enhancement (memory, learning)',
      'Immunomodulation (adaptive immune support)',
      'Mood stabilization',
      'Mild stimulant quality at higher doses',
    ],
    sideEffects: [
      'Nasal irritation (intranasal route)',
      'Mild fatigue in some users',
      'Rare headache',
    ],
    dangers: [
      'Limited Western clinical data; Russian approval context differs from FDA standards',
    ],
    evidenceTier: 'clinical',
    halfLife: 'Minutes in serum; CNS effects persist 4–8 h',
    commonDoses: ['250–500 mcg/day intranasal'],
    routes: ['Intranasal', 'SubQ'],
    synergies: ['Semax'],
    conflicts: [],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // GHK-Cu — Copper Peptide
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'ghk-cu',
    name: 'GHK-Cu (Copper Peptide)',
    category: 'peptide',
    tags: ['skin', 'collagen', 'wound healing', 'anti-aging', 'Nrf2', 'hair'],
    accentColor: '#F59E0B',
    summary:
      'Glycyl-L-histidyl-L-lysine complexed with Cu²⁺. Endogenous tripeptide that ' +
      'declines with age; modulates hundreds of genes involved in tissue remodeling and longevity.',
    mechanism:
      'High-affinity copper(II) chelator and carrier; activates ~84 genes and suppresses ' +
      '~14 genes related to inflammation and fibrosis; upregulates collagen I/III synthesis, ' +
      'elastin, and decorin; activates VEGF and FGF receptors for angiogenesis; activates ' +
      'Nrf2 antioxidant pathway; modulates TGF-β for anti-inflammatory effect; activates ' +
      'DNA repair mechanisms.',
    effects: [
      'Skin rejuvenation (increased collagen and elastin)',
      'Wound and scar healing acceleration',
      'Hair follicle stimulation (anagen phase)',
      'Systemic anti-inflammatory gene modulation',
      'Longevity-associated gene expression changes',
    ],
    sideEffects: [
      'Skin irritation or redness at application site (topical)',
      'Copper toxicity risk at high systemic doses',
      'Transient skin flushing',
    ],
    dangers: [
      'Systemic copper accumulation risk with high-dose SubQ use',
      'Avoid in Wilson disease (copper metabolism disorder)',
    ],
    evidenceTier: 'preclinical',
    halfLife: '~20–30 min (plasma)',
    commonDoses: [
      'Topical: 0.1–3% cream or serum',
      'SubQ: 1–2 mg 2–3×/week',
    ],
    routes: ['Topical (primary)', 'SubQ'],
    synergies: ['BPC-157'],
    conflicts: ['Wilson disease', 'Copper-chelating medications'],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Ipamorelin — Selective GHRP
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    category: 'peptide',
    tags: ['GH', 'IGF-1', 'body composition', 'recovery', 'sleep', 'GHS-R1a'],
    accentColor: '#34D399',
    summary:
      'Pentapeptide growth hormone releasing peptide (GHRP). Most selective ' +
      'GHS-R1a agonist — stimulates GH pulse without elevating cortisol or prolactin.',
    mechanism:
      'Selective ghrelin receptor (GHS-R1a) agonist; stimulates pulsatile GH release ' +
      'from anterior pituitary somatotrophs; minimal effect on cortisol/prolactin vs ' +
      'other GHRPs (GHRP-2, GHRP-6); synergizes with GHRH analogues (e.g., CJC-1295) ' +
      'for amplified GH pulse; secondary elevation of IGF-1 through hepatic GH signaling.',
    effects: [
      'Increased GH and downstream IGF-1',
      'Improved lean body mass and fat reduction',
      'Accelerated post-exercise recovery',
      'Improved deep sleep quality (GH is sleep-entrained)',
      'Anti-aging effects via GH/IGF-1 axis',
    ],
    sideEffects: [
      'Water retention (dose-dependent)',
      'Mild carpal tunnel syndrome at high/chronic doses',
      'Mild hunger increase (less than GHRP-6)',
      'GHS-R1a desensitization with continuous uninterrupted use',
    ],
    dangers: [
      'Potential acceleration of pre-existing malignancies via IGF-1 elevation',
      'Contraindicated in minors, pregnant women, and active cancer patients',
      'IGF-1 elevation may worsen diabetic retinopathy',
    ],
    evidenceTier: 'preclinical',
    halfLife: '~2 h',
    commonDoses: ['200–300 mcg, 2–3×/day (pre-sleep dosing optimal)'],
    routes: ['SubQ', 'IM'],
    synergies: ['CJC-1295'],
    conflicts: ['Active malignancy', 'Insulin (additive hypoglycemia risk)'],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // Dihexa — HGF/MET positive allosteric modulator
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'dihexa',
    name: 'Dihexa (PNB-0408)',
    category: 'nootropic',
    tags: ['synaptogenesis', 'cognition', 'HGF', 'MET receptor', 'neurogenesis'],
    accentColor: '#F472B6',
    summary:
      'N-hexanoic-Tyr-Ile-(6)-aminohexanoic amide. Positive allosteric modulator of ' +
      'HGF at the MET receptor; reported 7 orders of magnitude more potent than BDNF ' +
      'for synaptogenesis. Extreme caution: NO human safety data.',
    mechanism:
      'Positive allosteric modulator of hepatocyte growth factor (HGF) binding at the MET ' +
      'receptor tyrosine kinase; promotes dendritic arborization and new synapse formation; ' +
      'activates PAI-1 (plasminogen activator inhibitor-1); small molecule that crosses the ' +
      'blood-brain barrier with high CNS penetrance.',
    effects: [
      'Cognitive enhancement (memory consolidation and recall in animal models)',
      'Neurogenesis and synaptogenesis',
      'Potential benefit in neurodegeneration models (Alzheimer\'s, cognitive decline)',
    ],
    sideEffects: [
      'Unknown — extremely limited human experiential data',
      'Theoretical: increased clotting tendency (PAI-1 upregulation)',
    ],
    dangers: [
      'PAI-1 upregulation → thrombosis risk (blood clot formation)',
      'MET oncogene activation → theoretical cancer risk (MET drives tumor growth)',
      'NO established human safety profile — treat as experimental',
      'Avoid in any personal or family history of cancer or clotting disorders',
    ],
    evidenceTier: 'anecdotal',
    halfLife: 'Unknown (estimated days based on structure)',
    commonDoses: ['1–2 mg/week SubQ (extreme caution; use is experimental)'],
    routes: ['SubQ'],
    synergies: [],
    conflicts: [
      'Anticoagulants (paradoxical clot risk via PAI-1)',
      'Any cancer history',
      'Thromboembolic history',
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // NAD+ — Nicotinamide Adenine Dinucleotide
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'nad-plus',
    name: 'NAD+',
    category: 'compound',
    tags: ['longevity', 'mitochondria', 'sirtuin', 'DNA repair', 'energy', 'PARP'],
    accentColor: '#FB923C',
    summary:
      'Endogenous coenzyme found in every living cell. Declines ~50% by age 50. ' +
      'Substrate for sirtuins and PARP enzymes; central to mitochondrial energy metabolism. ' +
      'IV infusion or oral precursors (NMN, NR) are both studied.',
    mechanism:
      'Cofactor for >400 enzymatic redox reactions; sirtuin (SIRT1–7) substrate — ' +
      'these deacetylases regulate longevity, stress response, and metabolism; ' +
      'PARP enzyme substrate for NAD+-dependent DNA damage repair; ' +
      'NAD+/NADH ratio governs mitochondrial electron transport chain efficiency; ' +
      'activates AMPK cascade via SIRT1-LKB1 axis; restores CLOCK-BMAL1 circadian ' +
      'rhythm signaling via SIRT1 deacetylation.',
    effects: [
      'Mitochondrial biogenesis and ATP production efficiency',
      'DNA damage repair (PARP activation)',
      'Sirtuin-mediated longevity signaling',
      'Neuroprotection and cognitive support',
      'Cellular energy restoration (anti-fatigue)',
      'Anti-aging epigenetic effects',
    ],
    sideEffects: [
      'Flushing, warmth, itching (IV — dose-dependent)',
      'Nausea during rapid IV infusion',
      'GI upset (oral NMN/NR)',
      'Headache (IV)',
    ],
    dangers: [
      'Potential concern: NAD+ fuels both normal cells and rapidly dividing cancer cells',
      'High-dose IV should be administered by qualified medical professional',
    ],
    evidenceTier: 'clinical',
    halfLife: 'Minutes (actively metabolized and recycled); precursors NMN/NR have longer plasma half-lives',
    commonDoses: [
      'IV: 500 mg–1 g infusion (clinic setting)',
      'Oral precursors: NMN 250–1000 mg/day or NR 300–1000 mg/day',
    ],
    routes: ['IV (most direct systemic effect)', 'Oral (as NMN or NR precursors)'],
    synergies: ['Resveratrol (activates SIRT1)', 'TMG (methyl donor to prevent methylation depletion)'],
    conflicts: ['Chemotherapy agents (theoretical competition)'],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CJC-1295 (with DAC) — Long-acting GHRH analogue
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'cjc-1295-dac',
    name: 'CJC-1295 (with DAC)',
    category: 'peptide',
    tags: ['GH', 'IGF-1', 'body composition', 'GHRH', 'DAC', 'long-acting'],
    accentColor: '#60A5FA',
    summary:
      'Modified GHRH analogue with Drug Affinity Complex (DAC) technology. ' +
      'DAC creates irreversible albumin binding extending half-life from minutes to ~8 days. ' +
      'Typically paired with Ipamorelin for synergistic GH pulse amplification.',
    mechanism:
      'GHRH receptor agonist at anterior pituitary somatotrophs; DAC maleimide linker ' +
      'conjugates the peptide to circulating albumin irreversibly, creating a depot effect ' +
      'and ~8-day half-life; stimulates sustained pulsatile GH secretion pattern; ' +
      'secondary IGF-1 elevation via hepatic GH receptor signaling; ' +
      'synergizes with GHS-R1a agonists (Ipamorelin) for 2–10× amplified GH pulse.',
    effects: [
      'Sustained GH and IGF-1 elevation (weekly dosing)',
      'Lean muscle mass accrual',
      'Body fat reduction (lipolysis)',
      'Improved post-exercise and post-injury recovery',
      'Enhanced deep sleep quality',
    ],
    sideEffects: [
      'Water retention (common at initiation)',
      'Hypoglycemia risk (GH-induced insulin resistance)',
      'Carpal tunnel syndrome at high/chronic doses',
      'Numbness and tingling (extremities)',
      'Injection site reactions',
      'Somatotroph desensitization with prolonged continuous use (cycle recommended)',
    ],
    dangers: [
      'IGF-1 elevation may accelerate pre-existing malignancies',
      'Diabetics: mandatory glucose monitoring — worsens insulin resistance',
      'Contraindicated in active cancer and minors',
      'Acromegaly risk with very long-term supraphysiologic GH levels',
    ],
    evidenceTier: 'preclinical',
    halfLife: '~8 days (with DAC)',
    commonDoses: [
      '1–2 mg/week SubQ (combined with Ipamorelin 200–300 mcg 2–3×/day)',
    ],
    routes: ['SubQ', 'IM'],
    synergies: ['Ipamorelin (synergistic GH pulse amplification)'],
    conflicts: [
      'Insulin (additive hypoglycemia)',
      'Active malignancy',
      'Diabetes (glucose monitoring mandatory)',
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // PT-141 — Bremelanotide (FDA-approved)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'pt-141',
    name: 'PT-141 (Bremelanotide)',
    category: 'peptide',
    tags: ['libido', 'sexual health', 'melanocortin', 'MC4R', 'FDA-approved'],
    // Previously '#F43F5E' (rose-red) — changed to purple to respect "red = danger only" rule.
    // PT-141 is a CNS/libido compound; purple reflects its melanocortin/neurological mechanism.
    accentColor: '#C084FC',
    summary:
      'Cyclic heptapeptide melanocortin analogue of alpha-MSH. FDA-approved as Vyleesi ' +
      '(1.75 mg autoinjector) for hypoactive sexual desire disorder (HSDD) in ' +
      'premenopausal women. Acts centrally on CNS, not on vascular system like PDE5 inhibitors.',
    mechanism:
      'Melanocortin receptor agonist with selectivity for MC1R, MC3R, and MC4R; ' +
      'MC4R activation in the hypothalamus drives sexual arousal via dopaminergic and ' +
      'noradrenergic pathway activation — mechanism is central (CNS), independent of ' +
      'vascular nitric oxide pathways; transient blood pressure elevation via MC1R ' +
      'peripheral effects.',
    effects: [
      'Sexual arousal and libido enhancement (both sexes)',
      'Erectile facilitation (MC4R CNS pathway)',
      'Mood elevation and motivational enhancement',
      'Mild sunless tanning (MC1R activation)',
    ],
    sideEffects: [
      'Nausea (most common; 40%+ incidence — pre-treat with antiemetic)',
      'Facial flushing and warmth',
      'Transient hypertension (+6–8 mmHg systolic)',
      'Headache',
      'Spontaneous erections (males)',
    ],
    dangers: [
      'Contraindicated in cardiovascular disease (blood pressure elevation)',
      'Hyperpigmentation with prolonged or frequent use (MC1R activation)',
      'Avoid concomitant use with antihypertensives (hypotension risk)',
      'Avoid in high-cardiovascular-risk patients',
    ],
    evidenceTier: 'clinical',
    halfLife: '~2.7 h',
    commonDoses: [
      '1–2 mg SubQ 45 min before activity',
      'FDA-approved: 1.75 mg autoinjector (Vyleesi)',
    ],
    routes: ['SubQ', 'Intranasal (lower bioavailability)'],
    synergies: [],
    conflicts: [
      'Antihypertensives (additive hypotension risk)',
      'Cardiovascular disease',
      'Nitrates',
    ],
  },
]

/**
 * Look up a single compound by its ID slug.
 *
 * Args:
 *   id: compound ID string (e.g. 'bpc-157')
 * Returns:
 *   Compound object, or undefined if not found
 */
export const getCompoundById = (id: string): Compound | undefined =>
  compounds.find((c) => c.id === id)
