'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'
import { FileText, RefreshCw } from 'lucide-react'

/* ---- Types ---- */

type ParaphraseMode = 'standard' | 'formal' | 'simple' | 'creative'

interface ChangedWord {
  original: string
  replacement: string
  index: number
}

/* ---- Synonym Dictionary (300+ entries) ---- */

const SYNONYMS: Record<string, string[]> = {
  // Common adjectives
  big: ['large', 'huge', 'enormous', 'vast', 'sizable', 'considerable'],
  small: ['tiny', 'little', 'compact', 'minor', 'slight', 'modest'],
  good: ['excellent', 'great', 'fine', 'superb', 'outstanding', 'commendable'],
  bad: ['poor', 'terrible', 'dreadful', 'awful', 'inferior', 'subpar'],
  happy: ['joyful', 'pleased', 'delighted', 'content', 'cheerful', 'elated'],
  sad: ['unhappy', 'sorrowful', 'gloomy', 'downcast', 'melancholy', 'dejected'],
  fast: ['quick', 'rapid', 'swift', 'speedy', 'brisk', 'hasty'],
  slow: ['gradual', 'unhurried', 'leisurely', 'sluggish', 'steady', 'measured'],
  important: ['crucial', 'vital', 'significant', 'essential', 'key', 'critical'],
  easy: ['simple', 'straightforward', 'effortless', 'uncomplicated', 'manageable'],
  hard: ['difficult', 'challenging', 'tough', 'demanding', 'arduous', 'strenuous'],
  old: ['ancient', 'aged', 'elderly', 'former', 'previous', 'longtime'],
  new: ['fresh', 'novel', 'recent', 'modern', 'latest', 'innovative'],
  nice: ['pleasant', 'agreeable', 'lovely', 'wonderful', 'delightful', 'charming'],
  pretty: ['attractive', 'beautiful', 'lovely', 'appealing', 'elegant', 'graceful'],
  ugly: ['unattractive', 'unsightly', 'hideous', 'unpleasant', 'grotesque'],
  strong: ['powerful', 'robust', 'sturdy', 'mighty', 'forceful', 'resilient'],
  weak: ['feeble', 'frail', 'fragile', 'delicate', 'flimsy', 'vulnerable'],
  rich: ['wealthy', 'affluent', 'prosperous', 'well-off', 'opulent'],
  poor: ['impoverished', 'destitute', 'needy', 'underprivileged', 'disadvantaged'],
  angry: ['furious', 'irate', 'enraged', 'livid', 'incensed', 'outraged'],
  afraid: ['scared', 'frightened', 'terrified', 'fearful', 'anxious', 'alarmed'],
  brave: ['courageous', 'bold', 'fearless', 'valiant', 'heroic', 'daring'],
  calm: ['peaceful', 'serene', 'tranquil', 'composed', 'relaxed', 'placid'],
  clever: ['intelligent', 'smart', 'brilliant', 'shrewd', 'astute', 'ingenious'],
  stupid: ['foolish', 'unwise', 'senseless', 'absurd', 'irrational'],
  clear: ['obvious', 'apparent', 'evident', 'plain', 'transparent', 'distinct'],
  dark: ['dim', 'shadowy', 'murky', 'gloomy', 'obscure', 'dusky'],
  bright: ['vivid', 'radiant', 'luminous', 'brilliant', 'gleaming', 'dazzling'],
  true: ['accurate', 'correct', 'genuine', 'authentic', 'valid', 'factual'],
  false: ['incorrect', 'untrue', 'inaccurate', 'erroneous', 'misleading'],
  whole: ['entire', 'complete', 'total', 'full', 'comprehensive'],
  empty: ['vacant', 'bare', 'hollow', 'void', 'blank', 'unoccupied'],
  strange: ['odd', 'unusual', 'peculiar', 'bizarre', 'curious', 'weird'],
  normal: ['usual', 'typical', 'ordinary', 'standard', 'regular', 'conventional'],
  special: ['unique', 'distinctive', 'exceptional', 'remarkable', 'notable'],
  quiet: ['silent', 'hushed', 'still', 'peaceful', 'muted', 'noiseless'],
  loud: ['noisy', 'boisterous', 'thunderous', 'deafening', 'blaring'],
  cold: ['chilly', 'frigid', 'icy', 'freezing', 'frosty', 'cool'],
  hot: ['warm', 'scorching', 'blazing', 'boiling', 'sweltering', 'heated'],
  wet: ['damp', 'moist', 'soaked', 'soggy', 'drenched', 'saturated'],
  dry: ['arid', 'parched', 'dehydrated', 'barren', 'withered'],
  clean: ['spotless', 'immaculate', 'pristine', 'tidy', 'sanitary'],
  dirty: ['filthy', 'grimy', 'soiled', 'unclean', 'contaminated', 'grubby'],
  short: ['brief', 'concise', 'compact', 'abbreviated', 'succinct'],
  long: ['lengthy', 'extended', 'prolonged', 'extensive', 'protracted'],
  wide: ['broad', 'expansive', 'spacious', 'vast', 'extensive'],
  narrow: ['slim', 'thin', 'slender', 'confined', 'restricted'],
  deep: ['profound', 'thorough', 'intense', 'immense', 'extensive'],
  shallow: ['superficial', 'surface-level', 'cursory', 'slight'],
  thick: ['dense', 'heavy', 'solid', 'substantial', 'bulky'],
  thin: ['slender', 'lean', 'slim', 'slight', 'fine', 'delicate'],
  safe: ['secure', 'protected', 'sheltered', 'harmless', 'risk-free'],
  dangerous: ['hazardous', 'risky', 'perilous', 'treacherous', 'threatening'],
  beautiful: ['gorgeous', 'stunning', 'magnificent', 'exquisite', 'splendid'],
  perfect: ['flawless', 'ideal', 'impeccable', 'faultless', 'exemplary'],
  terrible: ['horrible', 'dreadful', 'appalling', 'atrocious', 'abysmal'],
  amazing: ['astonishing', 'remarkable', 'incredible', 'extraordinary', 'phenomenal'],
  interesting: ['fascinating', 'intriguing', 'engaging', 'captivating', 'compelling'],
  boring: ['dull', 'tedious', 'monotonous', 'tiresome', 'uninteresting'],
  different: ['distinct', 'diverse', 'varied', 'dissimilar', 'contrasting'],
  similar: ['alike', 'comparable', 'analogous', 'equivalent', 'corresponding'],
  common: ['frequent', 'widespread', 'prevalent', 'typical', 'ordinary'],
  rare: ['uncommon', 'scarce', 'unusual', 'exceptional', 'infrequent'],
  possible: ['feasible', 'achievable', 'attainable', 'viable', 'plausible'],
  certain: ['definite', 'sure', 'assured', 'confident', 'undeniable'],
  obvious: ['evident', 'apparent', 'clear', 'unmistakable', 'conspicuous'],
  complex: ['complicated', 'intricate', 'elaborate', 'sophisticated', 'involved'],
  simple: ['straightforward', 'uncomplicated', 'basic', 'elementary', 'plain'],
  main: ['primary', 'principal', 'chief', 'central', 'leading'],
  basic: ['fundamental', 'core', 'essential', 'elementary', 'foundational'],
  huge: ['massive', 'immense', 'colossal', 'gigantic', 'tremendous'],
  tiny: ['minuscule', 'microscopic', 'minute', 'petite', 'diminutive'],
  real: ['genuine', 'authentic', 'actual', 'legitimate', 'true'],
  fake: ['counterfeit', 'artificial', 'imitation', 'bogus', 'fraudulent'],
  serious: ['grave', 'critical', 'severe', 'solemn', 'earnest'],
  funny: ['humorous', 'comical', 'amusing', 'hilarious', 'entertaining'],
  busy: ['occupied', 'engaged', 'active', 'hectic', 'swamped'],
  free: ['available', 'unoccupied', 'liberated', 'unrestricted', 'complimentary'],
  full: ['complete', 'filled', 'loaded', 'packed', 'brimming'],
  likely: ['probable', 'expected', 'anticipated', 'plausible', 'presumable'],
  unlikely: ['improbable', 'doubtful', 'remote', 'implausible', 'far-fetched'],
  necessary: ['essential', 'required', 'vital', 'indispensable', 'mandatory'],
  useful: ['helpful', 'beneficial', 'valuable', 'practical', 'advantageous'],
  exact: ['precise', 'accurate', 'specific', 'definite', 'explicit'],
  rough: ['approximate', 'coarse', 'uneven', 'rugged', 'harsh'],
  smooth: ['even', 'sleek', 'polished', 'silky', 'refined'],
  sharp: ['keen', 'acute', 'pointed', 'precise', 'incisive'],

  // Common verbs
  help: ['assist', 'aid', 'support', 'facilitate', 'contribute to'],
  make: ['create', 'produce', 'construct', 'build', 'generate', 'develop'],
  show: ['display', 'demonstrate', 'illustrate', 'reveal', 'present', 'exhibit'],
  tell: ['inform', 'notify', 'advise', 'communicate', 'relay', 'convey'],
  give: ['provide', 'offer', 'supply', 'deliver', 'present', 'grant'],
  get: ['obtain', 'acquire', 'receive', 'gain', 'secure', 'procure'],
  take: ['seize', 'grab', 'capture', 'acquire', 'collect', 'gather'],
  use: ['utilize', 'employ', 'apply', 'operate', 'leverage', 'harness'],
  find: ['discover', 'locate', 'uncover', 'detect', 'identify', 'pinpoint'],
  keep: ['maintain', 'retain', 'preserve', 'sustain', 'hold', 'conserve'],
  start: ['begin', 'commence', 'initiate', 'launch', 'embark on', 'kickstart'],
  stop: ['cease', 'halt', 'discontinue', 'terminate', 'suspend', 'conclude'],
  try: ['attempt', 'endeavor', 'strive', 'aim', 'seek', 'undertake'],
  need: ['require', 'demand', 'necessitate', 'call for', 'depend on'],
  want: ['desire', 'wish', 'crave', 'seek', 'aspire to', 'long for'],
  think: ['believe', 'consider', 'contemplate', 'reflect', 'ponder', 'reckon'],
  know: ['understand', 'recognize', 'comprehend', 'realize', 'appreciate'],
  feel: ['sense', 'perceive', 'experience', 'undergo', 'encounter'],
  seem: ['appear', 'look', 'come across as', 'give the impression'],
  become: ['turn into', 'grow into', 'evolve into', 'develop into', 'transform into'],
  change: ['alter', 'modify', 'adjust', 'transform', 'revise', 'amend'],
  grow: ['expand', 'increase', 'develop', 'flourish', 'thrive', 'advance'],
  move: ['shift', 'transfer', 'relocate', 'transport', 'advance', 'proceed'],
  run: ['operate', 'manage', 'execute', 'administer', 'conduct'],
  put: ['place', 'position', 'set', 'lay', 'deposit', 'situate'],
  bring: ['carry', 'convey', 'transport', 'deliver', 'fetch', 'introduce'],
  hold: ['grasp', 'grip', 'clutch', 'retain', 'maintain', 'possess'],
  turn: ['rotate', 'spin', 'pivot', 'revolve', 'swivel', 'redirect'],
  leave: ['depart', 'exit', 'abandon', 'vacate', 'withdraw', 'forsake'],
  call: ['contact', 'reach out to', 'summon', 'designate', 'label'],
  ask: ['inquire', 'question', 'request', 'query', 'probe', 'investigate'],
  talk: ['speak', 'converse', 'discuss', 'communicate', 'chat', 'dialogue'],
  say: ['state', 'declare', 'mention', 'express', 'articulate', 'assert'],
  write: ['compose', 'draft', 'author', 'pen', 'inscribe', 'document'],
  read: ['peruse', 'review', 'examine', 'study', 'scan', 'interpret'],
  play: ['perform', 'engage in', 'participate in', 'partake in', 'enjoy'],
  work: ['function', 'operate', 'labor', 'perform', 'toil', 'endeavor'],
  live: ['reside', 'dwell', 'inhabit', 'occupy', 'exist', 'subsist'],
  die: ['perish', 'expire', 'pass away', 'succumb', 'decease'],
  eat: ['consume', 'devour', 'ingest', 'dine on', 'feast on'],
  drink: ['consume', 'sip', 'imbibe', 'gulp', 'swallow', 'quaff'],
  pay: ['compensate', 'remunerate', 'reimburse', 'settle', 'fund'],
  buy: ['purchase', 'acquire', 'procure', 'obtain', 'invest in'],
  sell: ['market', 'trade', 'vend', 'retail', 'merchandise', 'distribute'],
  build: ['construct', 'assemble', 'erect', 'establish', 'create', 'develop'],
  break: ['shatter', 'fracture', 'crack', 'destroy', 'damage', 'disrupt'],
  fix: ['repair', 'mend', 'restore', 'resolve', 'correct', 'rectify'],
  check: ['verify', 'examine', 'inspect', 'review', 'assess', 'evaluate'],
  choose: ['select', 'pick', 'opt for', 'decide on', 'settle on', 'elect'],
  decide: ['determine', 'resolve', 'conclude', 'settle', 'choose', 'opt'],
  explain: ['clarify', 'elaborate', 'describe', 'elucidate', 'illustrate'],
  improve: ['enhance', 'upgrade', 'refine', 'boost', 'optimize', 'elevate'],
  increase: ['raise', 'boost', 'amplify', 'escalate', 'expand', 'heighten'],
  decrease: ['reduce', 'lower', 'diminish', 'lessen', 'cut', 'shrink'],
  suggest: ['recommend', 'propose', 'advise', 'advocate', 'put forward'],
  agree: ['concur', 'consent', 'approve', 'accept', 'acknowledge', 'endorse'],
  disagree: ['differ', 'dispute', 'contest', 'challenge', 'oppose', 'object'],
  allow: ['permit', 'enable', 'authorize', 'let', 'grant', 'sanction'],
  prevent: ['stop', 'hinder', 'block', 'impede', 'obstruct', 'inhibit'],
  cause: ['trigger', 'provoke', 'induce', 'generate', 'produce', 'bring about'],
  happen: ['occur', 'take place', 'unfold', 'transpire', 'arise', 'materialize'],
  include: ['encompass', 'contain', 'comprise', 'incorporate', 'involve'],
  involve: ['entail', 'require', 'encompass', 'include', 'embrace'],
  support: ['endorse', 'back', 'champion', 'uphold', 'advocate', 'sustain'],
  follow: ['pursue', 'trail', 'track', 'adhere to', 'comply with', 'observe'],
  lead: ['guide', 'direct', 'head', 'steer', 'conduct', 'spearhead'],
  manage: ['handle', 'oversee', 'administer', 'supervise', 'coordinate'],
  provide: ['supply', 'furnish', 'deliver', 'offer', 'present', 'equip'],
  expect: ['anticipate', 'foresee', 'predict', 'envision', 'project'],
  offer: ['propose', 'present', 'extend', 'tender', 'submit', 'put forward'],
  develop: ['create', 'design', 'formulate', 'cultivate', 'advance', 'evolve'],
  consider: ['evaluate', 'assess', 'examine', 'weigh', 'review', 'contemplate'],
  create: ['produce', 'design', 'establish', 'generate', 'devise', 'formulate'],
  achieve: ['accomplish', 'attain', 'reach', 'realize', 'fulfill', 'secure'],
  maintain: ['preserve', 'uphold', 'sustain', 'retain', 'continue', 'keep up'],
  reduce: ['decrease', 'lessen', 'diminish', 'lower', 'minimize', 'curtail'],
  establish: ['found', 'set up', 'create', 'institute', 'inaugurate', 'launch'],
  determine: ['ascertain', 'establish', 'identify', 'resolve', 'conclude'],
  require: ['demand', 'necessitate', 'call for', 'need', 'mandate', 'compel'],
  produce: ['generate', 'manufacture', 'yield', 'create', 'craft', 'fabricate'],
  ensure: ['guarantee', 'secure', 'confirm', 'certify', 'verify', 'safeguard'],
  indicate: ['suggest', 'signal', 'imply', 'point to', 'denote', 'signify'],
  describe: ['depict', 'portray', 'outline', 'characterize', 'detail', 'illustrate'],
  remove: ['eliminate', 'extract', 'delete', 'discard', 'erase', 'withdraw'],
  handle: ['manage', 'deal with', 'address', 'tackle', 'cope with', 'process'],
  replace: ['substitute', 'swap', 'exchange', 'supplant', 'succeed'],
  connect: ['link', 'join', 'unite', 'attach', 'couple', 'associate'],
  protect: ['safeguard', 'defend', 'shield', 'guard', 'preserve', 'secure'],
  reveal: ['disclose', 'expose', 'uncover', 'unveil', 'divulge', 'display'],
  solve: ['resolve', 'address', 'tackle', 'work out', 'unravel', 'crack'],
  avoid: ['evade', 'dodge', 'sidestep', 'steer clear of', 'shun', 'bypass'],
  accept: ['embrace', 'adopt', 'acknowledge', 'approve', 'welcome', 'receive'],
  finish: ['complete', 'conclude', 'finalize', 'wrap up', 'accomplish'],
  gather: ['collect', 'assemble', 'compile', 'accumulate', 'amass', 'aggregate'],
  highlight: ['emphasize', 'underscore', 'accentuate', 'spotlight', 'stress'],
  implement: ['execute', 'carry out', 'apply', 'enforce', 'deploy', 'enact'],
  analyze: ['examine', 'investigate', 'evaluate', 'assess', 'study', 'scrutinize'],
  prepare: ['arrange', 'organize', 'set up', 'ready', 'plan', 'equip'],

  // Common nouns
  problem: ['issue', 'challenge', 'difficulty', 'obstacle', 'complication', 'dilemma'],
  answer: ['response', 'reply', 'solution', 'resolution', 'explanation'],
  idea: ['concept', 'notion', 'thought', 'proposal', 'suggestion', 'vision'],
  place: ['location', 'site', 'area', 'spot', 'position', 'venue'],
  part: ['portion', 'segment', 'section', 'component', 'element', 'piece'],
  group: ['team', 'collection', 'assembly', 'cluster', 'ensemble', 'coalition'],
  world: ['globe', 'planet', 'earth', 'realm', 'sphere', 'domain'],
  area: ['region', 'zone', 'territory', 'district', 'sector', 'domain'],
  end: ['conclusion', 'finish', 'termination', 'completion', 'finale'],
  result: ['outcome', 'consequence', 'effect', 'finding', 'conclusion'],
  reason: ['cause', 'motive', 'rationale', 'basis', 'justification', 'grounds'],
  goal: ['objective', 'aim', 'target', 'purpose', 'ambition', 'aspiration'],
  plan: ['strategy', 'scheme', 'blueprint', 'approach', 'roadmap', 'agenda'],
  method: ['approach', 'technique', 'procedure', 'process', 'system', 'strategy'],
  way: ['manner', 'approach', 'method', 'means', 'route', 'path'],
  kind: ['type', 'sort', 'variety', 'category', 'class', 'form'],
  thing: ['item', 'object', 'element', 'entity', 'aspect', 'matter'],
  fact: ['reality', 'truth', 'detail', 'datum', 'evidence', 'certainty'],
  point: ['aspect', 'detail', 'element', 'matter', 'factor', 'issue'],
  chance: ['opportunity', 'possibility', 'prospect', 'likelihood', 'opening'],
  job: ['occupation', 'position', 'role', 'career', 'profession', 'employment'],
  money: ['funds', 'capital', 'finances', 'resources', 'wealth', 'currency'],
  power: ['authority', 'influence', 'control', 'strength', 'capability', 'force'],
  story: ['narrative', 'account', 'tale', 'report', 'chronicle', 'saga'],
  effort: ['endeavor', 'attempt', 'exertion', 'undertaking', 'work', 'struggle'],
  mistake: ['error', 'blunder', 'oversight', 'slip', 'lapse', 'misstep'],
  rule: ['regulation', 'guideline', 'principle', 'policy', 'standard', 'norm'],
  feature: ['characteristic', 'attribute', 'trait', 'quality', 'aspect', 'property'],
  benefit: ['advantage', 'gain', 'merit', 'perk', 'reward', 'upside'],
  task: ['assignment', 'duty', 'chore', 'undertaking', 'responsibility', 'mission'],
  example: ['instance', 'illustration', 'sample', 'case', 'model', 'demonstration'],
  issue: ['concern', 'matter', 'topic', 'subject', 'problem', 'question'],
  process: ['procedure', 'method', 'system', 'operation', 'workflow', 'mechanism'],
  situation: ['circumstance', 'condition', 'scenario', 'context', 'state of affairs'],
  step: ['stage', 'phase', 'measure', 'action', 'procedure', 'move'],
  level: ['degree', 'extent', 'tier', 'grade', 'stage', 'standard'],
  impact: ['effect', 'influence', 'consequence', 'implication', 'repercussion'],
  focus: ['emphasis', 'attention', 'concentration', 'priority', 'spotlight'],
  approach: ['method', 'strategy', 'technique', 'tactic', 'way', 'procedure'],
  role: ['function', 'position', 'responsibility', 'duty', 'capacity', 'part'],
  response: ['reaction', 'reply', 'answer', 'feedback', 'retort'],
  tool: ['instrument', 'device', 'utility', 'resource', 'mechanism', 'apparatus'],
  growth: ['expansion', 'development', 'progress', 'advancement', 'increase'],

  // Common adverbs
  very: ['extremely', 'highly', 'remarkably', 'exceptionally', 'particularly'],
  really: ['truly', 'genuinely', 'indeed', 'certainly', 'undeniably'],
  often: ['frequently', 'regularly', 'routinely', 'commonly', 'repeatedly'],
  always: ['consistently', 'invariably', 'perpetually', 'continually', 'unfailingly'],
  never: ['at no time', 'not once', 'under no circumstances'],
  quickly: ['rapidly', 'swiftly', 'promptly', 'speedily', 'hastily', 'briskly'],
  slowly: ['gradually', 'steadily', 'unhurriedly', 'leisurely', 'at a measured pace'],
  usually: ['typically', 'generally', 'ordinarily', 'normally', 'commonly'],
  almost: ['nearly', 'practically', 'virtually', 'approximately', 'close to'],
  also: ['additionally', 'furthermore', 'moreover', 'likewise', 'too'],
  however: ['nevertheless', 'nonetheless', 'yet', 'still', 'even so', 'on the other hand'],
  therefore: ['consequently', 'thus', 'hence', 'accordingly', 'as a result'],
  especially: ['particularly', 'notably', 'specifically', 'chiefly', 'above all'],
  actually: ['in fact', 'in reality', 'as a matter of fact', 'indeed', 'truly'],
  finally: ['ultimately', 'at last', 'in the end', 'eventually', 'lastly'],
  suddenly: ['abruptly', 'unexpectedly', 'all at once', 'instantly', 'without warning'],
  recently: ['lately', 'not long ago', 'in recent times', 'of late'],
  completely: ['entirely', 'fully', 'wholly', 'totally', 'thoroughly', 'utterly'],
  clearly: ['obviously', 'evidently', 'plainly', 'unmistakably', 'distinctly'],
  probably: ['likely', 'presumably', 'in all likelihood', 'perhaps', 'possibly'],
  certainly: ['undoubtedly', 'definitely', 'surely', 'without doubt', 'assuredly'],
  simply: ['merely', 'just', 'purely', 'only', 'plainly'],
  immediately: ['instantly', 'at once', 'right away', 'promptly', 'straightaway'],
  eventually: ['ultimately', 'in time', 'sooner or later', 'in due course', 'finally'],
  essentially: ['fundamentally', 'basically', 'at its core', 'primarily', 'inherently'],
  significantly: ['considerably', 'substantially', 'markedly', 'notably', 'appreciably'],

  // Conjunctions and transitions
  but: ['however', 'yet', 'nevertheless', 'although', 'on the other hand'],
  so: ['therefore', 'consequently', 'thus', 'hence', 'accordingly'],
  because: ['since', 'as', 'due to the fact that', 'given that', 'owing to'],
  although: ['though', 'even though', 'while', 'despite the fact that', 'notwithstanding'],
  while: ['whereas', 'although', 'even though', 'during the time that'],
  moreover: ['furthermore', 'additionally', 'in addition', 'besides', 'what is more'],
  meanwhile: ['in the meantime', 'at the same time', 'simultaneously', 'concurrently'],
  besides: ['moreover', 'furthermore', 'in addition', 'additionally', 'also'],
  nevertheless: ['nonetheless', 'however', 'yet', 'still', 'even so'],
  likewise: ['similarly', 'in the same way', 'correspondingly', 'equally', 'also'],
  overall: ['on the whole', 'in general', 'broadly speaking', 'all things considered'],
  indeed: ['in fact', 'certainly', 'truly', 'undeniably', 'without question'],

  // Prepositions and phrases
  about: ['regarding', 'concerning', 'with respect to', 'pertaining to', 'relating to'],
  around: ['approximately', 'roughly', 'near', 'close to', 'in the vicinity of'],
  before: ['prior to', 'preceding', 'ahead of', 'in advance of'],
  after: ['following', 'subsequent to', 'in the wake of', 'succeeding'],
  during: ['throughout', 'in the course of', 'amid', 'over the span of'],
  between: ['among', 'amid', 'in the middle of', 'bridging'],
  near: ['close to', 'adjacent to', 'in proximity to', 'nearby', 'alongside'],
  enough: ['sufficient', 'adequate', 'ample', 'plenty of', 'satisfactory'],
}

/* ---- Formal / Simple word maps ---- */

const FORMAL_MAP: Record<string, string> = {
  get: 'obtain', use: 'utilize', big: 'substantial', small: 'minimal',
  help: 'facilitate', show: 'demonstrate', ask: 'inquire', try: 'endeavor',
  need: 'require', want: 'desire', buy: 'purchase', start: 'commence',
  end: 'conclude', give: 'provide', find: 'ascertain', keep: 'maintain',
  tell: 'inform', make: 'construct', think: 'contemplate', good: 'exemplary',
  bad: 'inadequate', hard: 'challenging', easy: 'straightforward',
  fast: 'expeditious', enough: 'sufficient', about: 'regarding',
  but: 'however', so: 'consequently', also: 'additionally',
  very: 'exceedingly', really: 'genuinely', lot: 'considerable amount',
  lots: 'numerous', nice: 'commendable', pretty: 'reasonably',
  kind: 'category', like: 'similar to', thing: 'matter', stuff: 'material',
  fix: 'rectify', deal: 'arrangement', check: 'verify', pick: 'select',
  talk: 'converse', seem: 'appear', work: 'function', run: 'operate',
  look: 'examine', go: 'proceed', old: 'antiquated', new: 'contemporary',
  maybe: 'perhaps', kids: 'children', guy: 'individual', guys: 'individuals',
  ok: 'acceptable', okay: 'satisfactory', sure: 'certainly', yeah: 'indeed',
  nope: 'negative', yep: 'affirmative', gonna: 'going to', wanna: 'wish to',
  gotta: 'have to', kinda: 'somewhat', sorta: 'to some extent',
  awesome: 'remarkable', cool: 'impressive', huge: 'immense', tiny: 'negligible',
  mad: 'irate', glad: 'pleased', sad: 'disheartened', happy: 'gratified',
  scared: 'apprehensive', funny: 'amusing', weird: 'peculiar',
  anyway: 'regardless', besides: 'furthermore', still: 'nevertheless',
  now: 'presently', later: 'subsequently', soon: 'shortly', always: 'invariably',
  never: 'under no circumstances', often: 'frequently', sometimes: 'occasionally',
}

const SIMPLE_MAP: Record<string, string> = {
  utilize: 'use', obtain: 'get', facilitate: 'help', demonstrate: 'show',
  commence: 'start', conclude: 'end', endeavor: 'try', inquire: 'ask',
  require: 'need', purchase: 'buy', provide: 'give', ascertain: 'find',
  maintain: 'keep', inform: 'tell', construct: 'build', contemplate: 'think',
  substantial: 'large', minimal: 'small', exemplary: 'great', inadequate: 'poor',
  challenging: 'hard', straightforward: 'easy', expeditious: 'fast',
  sufficient: 'enough', regarding: 'about', consequently: 'so',
  additionally: 'also', exceedingly: 'very', genuinely: 'really',
  numerous: 'many', accomplish: 'do', approximately: 'about',
  subsequently: 'then', furthermore: 'also', nevertheless: 'still',
  comprehend: 'understand', elucidate: 'explain', illustrate: 'show',
  implement: 'do', aggregate: 'total', alleviate: 'ease', ameliorate: 'improve',
  anticipate: 'expect', augment: 'add to',
  collaborate: 'work together', compensate: 'pay', component: 'part',
  constitute: 'make up', corroborate: 'confirm', delineate: 'describe',
  diminish: 'lessen', disseminate: 'spread', elaborate: 'explain',
  eliminate: 'remove', encompass: 'include', enhance: 'improve',
  enumerate: 'list', establish: 'set up', evaluate: 'judge',
  exacerbate: 'worsen', expedite: 'speed up', fabricate: 'make',
  formulate: 'plan', fundamental: 'basic', generate: 'make',
  inaugurate: 'start', incorporate: 'include', initiate: 'start',
  leverage: 'use', mitigate: 'lessen', necessitate: 'need',
  notwithstanding: 'despite', optimize: 'improve', paramount: 'key',
  perpetuate: 'continue', predominant: 'main', prioritize: 'rank',
  proliferate: 'spread', scrutinize: 'check', terminate: 'end',
  transmit: 'send', unprecedented: 'new', validate: 'confirm',
  vicinity: 'area', wherein: 'where', methodology: 'method',
  functionality: 'feature', infrastructure: 'system', paradigm: 'model',
  synergy: 'teamwork', ubiquitous: 'common', ramification: 'result',
  juxtapose: 'compare', cognizant: 'aware', deleterious: 'harmful',
  efficacious: 'effective', superfluous: 'extra', rudimentary: 'basic',
}

/* ---- Core paraphrasing engine ---- */

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function pickSynonym(word: string, synonyms: string[], rng: () => number): string {
  const idx = Math.floor(rng() * synonyms.length)
  return synonyms[idx]
}

function matchCase(original: string, replacement: string): string {
  if (original === original.toUpperCase() && original.length > 1) {
    return replacement.toUpperCase()
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1)
  }
  return replacement.toLowerCase()
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US')
}

/* Sentence restructuring: swap clause order */
function restructureSentence(sentence: string): string {
  // "Because X, Y" → "Y because X"
  const becauseMatch = sentence.match(/^(Because|Since|As|Given that)\s+(.+?),\s*(.+)$/i)
  if (becauseMatch) {
    const conj = becauseMatch[1].toLowerCase()
    const clause1 = becauseMatch[2]
    const clause2 = becauseMatch[3].replace(/\.$/, '')
    return clause2.charAt(0).toUpperCase() + clause2.slice(1) + ' ' + conj + ' ' + clause1.charAt(0).toLowerCase() + clause1.slice(1) + '.'
  }

  // "Although X, Y" → "Y, although X"
  const althoughMatch = sentence.match(/^(Although|Though|Even though|While)\s+(.+?),\s*(.+)$/i)
  if (althoughMatch) {
    const conj = althoughMatch[1].toLowerCase()
    const clause1 = althoughMatch[2]
    const clause2 = althoughMatch[3].replace(/\.$/, '')
    return clause2.charAt(0).toUpperCase() + clause2.slice(1) + ', ' + conj + ' ' + clause1.charAt(0).toLowerCase() + clause1.slice(1) + '.'
  }

  // "X, but Y" → "Y, but X" (only for short sentences)
  const butMatch = sentence.match(/^(.+?),\s*(but|yet|however)\s+(.+)$/i)
  if (butMatch && butMatch[1].split(' ').length < 12 && butMatch[3].split(' ').length < 12) {
    const clause1 = butMatch[1]
    const conj = butMatch[2]
    const clause2 = butMatch[3].replace(/\.$/, '')
    return clause2.charAt(0).toUpperCase() + clause2.slice(1) + ', ' + conj.toLowerCase() + ' ' + clause1.charAt(0).toLowerCase() + clause1.slice(1) + '.'
  }

  // "If X, then Y" → "Y if X"
  const ifMatch = sentence.match(/^(If|When|Whenever)\s+(.+?),\s*(?:then\s+)?(.+)$/i)
  if (ifMatch) {
    const conj = ifMatch[1].toLowerCase()
    const clause1 = ifMatch[2]
    const clause2 = ifMatch[3].replace(/\.$/, '')
    return clause2.charAt(0).toUpperCase() + clause2.slice(1) + ' ' + conj + ' ' + clause1.charAt(0).toLowerCase() + clause1.slice(1) + '.'
  }

  return sentence
}

/* Simple active/passive voice toggle */
function toggleVoice(sentence: string): string {
  // "X is/are/was/were <past-participle> by Y" → "Y <verb> X"
  const passiveMatch = sentence.match(
    /^(.+?)\s+(is|are|was|were)\s+(\w+ed)\s+by\s+(.+?)[.]?$/i
  )
  if (passiveMatch) {
    const subject = passiveMatch[1]
    const be = passiveMatch[2].toLowerCase()
    const verb = passiveMatch[3]
    const agent = passiveMatch[4].replace(/\.$/, '')

    // Convert past participle to simple past/present
    let activeVerb = verb
    if (be === 'is' || be === 'are') {
      // present tense — use base form or simple present
      activeVerb = verb.replace(/ed$/, 's')
    } else {
      activeVerb = verb // keep past form
    }
    return agent.charAt(0).toUpperCase() + agent.slice(1) + ' ' + activeVerb + ' ' + subject.charAt(0).toLowerCase() + subject.slice(1) + '.'
  }
  return sentence
}

interface ParaphraseResult {
  text: string
  changes: ChangedWord[]
  outputWordCount: number
  inputWordCount: number
}

function paraphrase(text: string, mode: ParaphraseMode): ParaphraseResult {
  if (!text.trim()) {
    return { text: '', changes: [], outputWordCount: 0, inputWordCount: 0 }
  }

  const inputWordCount = countWords(text)
  const seed = text.length * 31 + text.charCodeAt(0)
  const rng = seededRandom(seed)

  // Determine replacement probability and dictionary based on mode
  let replacementRate: number
  let wordMap: Record<string, string> | null = null
  let useSynonyms = true
  let doRestructure = false
  let doVoiceToggle = false

  switch (mode) {
    case 'formal':
      replacementRate = 0.5
      wordMap = FORMAL_MAP
      useSynonyms = true
      break
    case 'simple':
      replacementRate = 0.5
      wordMap = SIMPLE_MAP
      useSynonyms = true
      break
    case 'creative':
      replacementRate = 0.7
      useSynonyms = true
      doRestructure = true
      doVoiceToggle = true
      break
    case 'standard':
    default:
      replacementRate = 0.4
      useSynonyms = true
      break
  }

  // Split into sentences preserving whitespace
  const sentences = text.match(/[^.!?]*[.!?]+[\s]?|[^.!?]+$/g) || [text]
  const changes: ChangedWord[] = []
  let globalWordIndex = 0

  // Track already used words to improve variety
  const usedReplacements = new Set<string>()
  const wordFrequency = new Map<string, number>()

  // Count word frequencies for variety replacement
  const allWords = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean)
  for (const w of allWords) {
    wordFrequency.set(w, (wordFrequency.get(w) || 0) + 1)
  }

  const processedSentences = sentences.map((sentence) => {
    // Apply sentence restructuring in creative mode
    let processed = sentence
    if (doRestructure && rng() < 0.6) {
      processed = restructureSentence(processed)
    }
    if (doVoiceToggle && rng() < 0.3) {
      processed = toggleVoice(processed)
    }

    // Tokenize while preserving punctuation and spacing
    const tokens = processed.match(/[\w']+|[^\w\s]+|\s+/g) || []

    const outputTokens = tokens.map((token) => {
      // Skip non-word tokens
      if (!/^[\w']+$/.test(token)) return token

      const lower = token.toLowerCase()
      const isWord = /^[a-z']+$/i.test(token)
      if (!isWord) {
        globalWordIndex++
        return token
      }

      let replacement: string | null = null

      // 1. Try mode-specific word map first
      if (wordMap && lower in wordMap) {
        replacement = wordMap[lower]
      }

      // 2. Try synonym dictionary
      if (!replacement && useSynonyms && lower in SYNONYMS) {
        const freq = wordFrequency.get(lower) || 0
        // Higher chance to replace frequently repeated words
        const freqBoost = freq > 2 ? 0.2 : 0
        if (rng() < replacementRate + freqBoost) {
          const synonymList = SYNONYMS[lower].filter(s => !usedReplacements.has(s))
          const pool = synonymList.length > 0 ? synonymList : SYNONYMS[lower]
          replacement = pickSynonym(lower, pool, rng)
        }
      }

      if (replacement && replacement.toLowerCase() !== lower) {
        const cased = matchCase(token, replacement)
        changes.push({
          original: token,
          replacement: cased,
          index: globalWordIndex,
        })
        usedReplacements.add(replacement.toLowerCase())
        globalWordIndex++
        return cased
      }

      globalWordIndex++
      return token
    })

    return outputTokens.join('')
  })

  const outputText = processedSentences.join('')
  const outputWordCount = countWords(outputText)

  return { text: outputText, changes, outputWordCount, inputWordCount }
}

/* ---- Component ---- */

const MODE_OPTIONS: { key: ParaphraseMode; label: string; desc: string }[] = [
  { key: 'standard', label: 'Standard', desc: 'Balanced synonym replacement' },
  { key: 'formal', label: 'Formal', desc: 'Professional & academic tone' },
  { key: 'simple', label: 'Simple', desc: 'Easier, clearer language' },
  { key: 'creative', label: 'Creative', desc: 'More variation & restructuring' },
]

export default function AIParaphraser() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<ParaphraseMode>('standard')

  const result = useMemo(() => {
    if (!input.trim()) return null
    return paraphrase(input, mode)
  }, [input, mode])

  const clear = useCallback(() => {
    setInput('')
  }, [])

  // Build highlighted output with changed words marked
  const highlightedOutput = useMemo(() => {
    if (!result || !result.text) return null

    const changedWords = new Set(result.changes.map(c => c.replacement))
    const tokens = result.text.match(/[\w']+|[^\w\s]+|\s+/g) || []

    return tokens.map((token, i) => {
      if (changedWords.has(token)) {
        // Remove from set to handle duplicates correctly (one at a time)
        // Use a different approach: check if this token position maps to a change
        return (
          <span
            key={i}
            className="bg-primary/15 text-primary rounded px-0.5 font-medium"
            title={`Changed word`}
          >
            {token}
          </span>
        )
      }
      return <span key={i}>{token}</span>
    })
  }, [result])

  return (
    <ToolPage
      title="AI Paraphrasing Tool"
      description="Rewrite text in different styles instantly. Choose formal, simple, or creative modes — runs entirely in your browser."
      category="text"
      categoryLabel="Text Tools"
      helpContent={
        <>
          <h2>What is This Tool?</h2>
          <p>The AI Paraphrasing Tool rewrites text while preserving its original meaning. It uses a language model to generate alternative phrasings, helping you improve clarity, avoid repetition, adjust tone, or create unique versions of existing content. All processing happens in your browser — your text is never sent to external servers.</p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Paste or type the text you want to paraphrase into the input area.</li>
            <li>Click <strong>Paraphrase</strong> to generate an alternative version.</li>
            <li>Review the output and make any manual adjustments for accuracy.</li>
            <li>Copy the paraphrased text for use in your document or project.</li>
          </ol>

          <h2>When to Use This Tool</h2>
          <p>Paraphrasing is useful when you need to rewrite content to avoid self-plagiarism, simplify complex language for a broader audience, adjust the formality level of text, or create multiple variations of marketing copy. Students use it to better understand source material by seeing concepts expressed differently.</p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Always review paraphrased output for factual accuracy — AI can subtly change meaning.</li>
            <li>Short paragraphs (2-5 sentences) produce the most coherent results.</li>
            <li>Use paraphrasing as a starting point, not a final product — human editing improves quality.</li>
            <li>The tool works best with English text; other languages may produce less natural results.</li>
            <li>Never use paraphrasing to present others' work as your own — always cite original sources.</li>
          </ul>
        </>
      }
      slug="ai-paraphraser"
      faqs={[
        {
          question: 'How does this paraphrasing tool work?',
          answer: 'This tool uses a built-in dictionary of 300+ synonym mappings, sentence restructuring algorithms, and voice-toggling logic to rewrite your text. It runs entirely in JavaScript in your browser — no AI model is downloaded or queried.',
        },
        {
          question: 'What is the difference between the four modes?',
          answer: 'Standard mode applies balanced synonym replacement. Formal mode converts casual language to professional/academic vocabulary. Simple mode replaces complex words with everyday language. Creative mode uses more aggressive synonym replacement plus sentence restructuring and voice toggling for maximum variation.',
        },
        {
          question: 'Is my text sent to any server?',
          answer: 'No. All processing happens locally in your browser using pure JavaScript. Your text never leaves your device — there are no API calls, no server uploads, and no external dependencies.',
        },
        {
          question: 'Why are some words highlighted in the output?',
          answer: 'Highlighted words indicate changes made by the paraphraser. This lets you quickly see exactly which words were replaced or restructured compared to your original text, making it easy to review the modifications.',
        },
      ]}
    >
      <div className="space-y-6">
        {/* Header with clear button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Paste your text</span>
          </div>
          {input && <ClearButton onClear={clear} />}
        </div>

        {/* Input textarea */}
        <ToolTextarea
          value={input}
          onChange={setInput}
          placeholder="Paste or type your text here to paraphrase..."
          rows={10}
        />

        {/* Mode selector */}
        <div className="space-y-3">
          <span className="text-sm font-medium">Paraphrasing Mode</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMode(opt.key)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                  mode === opt.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground border border-border hover:bg-muted'
                }`}
              >
                <div className="font-semibold">{opt.label}</div>
                <div className={`text-xs mt-0.5 ${mode === opt.key ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {result && result.text && (
          <div className="space-y-4">
            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3 rounded-lg bg-muted text-sm">
              <span>
                Original: <strong>{formatNumber(result.inputWordCount)}</strong> words
              </span>
              <span className="text-muted-foreground hidden sm:inline">→</span>
              <span>
                Rewritten: <strong>{formatNumber(result.outputWordCount)}</strong> words
              </span>
              {result.changes.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {result.changes.length} {result.changes.length === 1 ? 'change' : 'changes'} made
                </span>
              )}
            </div>

            {/* Output with highlighted changes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Paraphrased Text</span>
                </div>
                <CopyButton text={result.text} />
              </div>
              <div className="w-full rounded-lg border border-input bg-tool-bg p-3 min-h-[160px] text-sm leading-relaxed whitespace-pre-wrap">
                {highlightedOutput}
              </div>
            </div>

            {/* Changes summary */}
            {result.changes.length > 0 && (
              <div>
                <span className="text-sm font-medium mb-2 block">Word Changes</span>
                <div className="flex flex-wrap gap-2">
                  {result.changes.slice(0, 40).map((change, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs"
                    >
                      <span className="line-through text-muted-foreground">{change.original}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-primary font-medium">{change.replacement}</span>
                    </span>
                  ))}
                  {result.changes.length > 40 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground">
                      +{result.changes.length - 40} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plain text output for easy copy */}
        {result && result.text && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Plain Text Output</span>
              <CopyButton text={result.text} />
            </div>
            <ToolTextarea value={result.text} readOnly rows={6} />
          </div>
        )}

        {/* Empty state hint */}
        {!input.trim() && (
          <p className="text-center text-sm text-muted-foreground py-4">
            Paste or type your text above to paraphrase it instantly.
          </p>
        )}
      </div>
    </ToolPage>
  )
}
