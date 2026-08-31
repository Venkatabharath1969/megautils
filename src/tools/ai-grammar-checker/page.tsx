'use client'

import { useState, useMemo, useCallback } from 'react'
import { ToolPage, ToolTextarea, CopyButton, ClearButton } from '@/components/tool-page'
import { CheckCircle2, AlertTriangle, Sparkles, MousePointerClick, BarChart3 } from 'lucide-react'

/* ────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────── */

type ErrorCategory = 'spelling' | 'grammar' | 'punctuation' | 'style'

interface GrammarError {
  start: number
  end: number
  message: string
  suggestion: string
  category: ErrorCategory
  original: string
}

/* ────────────────────────────────────────────────────────────────────
   Common misspellings dictionary  (word → correction)
   ──────────────────────────────────────────────────────────────────── */

const MISSPELLINGS: Record<string, string> = {
  abandonned: 'abandoned', aberation: 'aberration', abilty: 'ability', abondoned: 'abandoned',
  absense: 'absence', abreviation: 'abbreviation', absorbtion: 'absorption', abundacies: 'abundances',
  abundancies: 'abundances', abutts: 'abuts', acadamy: 'academy', accademy: 'academy',
  accedentally: 'accidentally', accellerate: 'accelerate', accessable: 'accessible', accesss: 'access',
  accidentaly: 'accidentally', accidently: 'accidentally', accomodate: 'accommodate', accomodation: 'accommodation',
  acomplish: 'accomplish', accumalate: 'accumulate', accurracy: 'accuracy', accross: 'across',
  acheive: 'achieve', acheiving: 'achieving', achievment: 'achievement', achive: 'achieve',
  acknowlege: 'acknowledge', acknowledgeing: 'acknowledging', acn: 'can', acquaintence: 'acquaintance',
  acquiantance: 'acquaintance', acquisation: 'acquisition', acrage: 'acreage', acredited: 'accredited',
  adaquate: 'adequate', addional: 'additional', additionaly: 'additionally', addres: 'address',
  adequit: 'adequate', adhearing: 'adhering', adminstered: 'administered', adminstrate: 'administrate',
  adolecent: 'adolescent', adress: 'address', adultary: 'adultery', advertisment: 'advertisement',
  advertisments: 'advertisements', adviced: 'advised', aeriel: 'aerial', affilate: 'affiliate',
  affilliate: 'affiliate', afterwords: 'afterwards', agaisnt: 'against', aganist: 'against',
  aggaravates: 'aggravates', aggresion: 'aggression', aggresssion: 'aggression', aggrieve: 'aggrieve',
  agianst: 'against', agravate: 'aggravate', agreeement: 'agreement', agregate: 'aggregate',
  agresssive: 'aggressive', agressive: 'aggressive', aicraft: 'aircraft', aisian: 'asian',
  alchohol: 'alcohol', alchol: 'alcohol', alcohal: 'alcohol', alcoholisim: 'alcoholism',
  aledge: 'allege', aledged: 'alleged', alege: 'allege', algebraical: 'algebraic',
  algorhythm: 'algorithm', algorythm: 'algorithm', algoritm: 'algorithm', algorithim: 'algorithm',
  allign: 'align', allopone: 'allophone', allopones: 'allophones', allowes: 'allows',
  almsot: 'almost', alochol: 'alcohol', alot: 'a lot', alow: 'allow', alowed: 'allowed',
  alreday: 'already', alledge: 'allege', alledged: 'alleged', amatuer: 'amateur',
  ammend: 'amend', ammended: 'amended', ammount: 'amount', amung: 'among',
  analagous: 'analogous', analise: 'analyse', analogeous: 'analogous', analogy: 'analogy',
  anarchim: 'anarchism', ancester: 'ancestor', ancestory: 'ancestry', anothe: 'another',
  annouced: 'announced', announed: 'announced', annualy: 'annually', anohter: 'another',
  anomoly: 'anomaly', anonimity: 'anonymity', anonimous: 'anonymous', anounce: 'announce',
  anounced: 'announced', antartic: 'antarctic', anticipaion: 'anticipation', anyother: 'any other',
  anytying: 'anything', aparent: 'apparent', aparment: 'apartment', aplication: 'application',
  aplogize: 'apologize', apologise: 'apologize', apparantly: 'apparently', apparenly: 'apparently',
  apparentely: 'apparently', apparition: 'apparition', appealling: 'appealing', appeareance: 'appearance',
  appearence: 'appearance', applicaiton: 'application', applyed: 'applied', appoitment: 'appointment',
  apporach: 'approach', approachs: 'approaches', appologize: 'apologize', appreciattion: 'appreciation',
  appriciate: 'appreciate', approch: 'approach', appropirate: 'appropriate', apropriate: 'appropriate',
  aquaintance: 'acquaintance', aquire: 'acquire', aquired: 'acquired', aquisition: 'acquisition',
  arbitary: 'arbitrary', archealogy: 'archaeology', archeaology: 'archaeology', archieved: 'achieved',
  architechture: 'architecture', archtecture: 'architecture', arguement: 'argument', arguements: 'arguments',
  arised: 'arose', arrangment: 'arrangement', arround: 'around', artical: 'article',
  assasinate: 'assassinate', assasinated: 'assassinated', assasination: 'assassination',
  assemple: 'assemble', assertation: 'assertion', asside: 'aside', assistence: 'assistance',
  assistent: 'assistant', assosiate: 'associate', assumtion: 'assumption', asterick: 'asterisk',
  athiest: 'atheist', atheisim: 'atheism', atmoshpere: 'atmosphere', attatchment: 'attachment',
  attemp: 'attempt', attemt: 'attempt', attemted: 'attempted', attendence: 'attendance',
  attened: 'attended', atribute: 'attribute', audeince: 'audience', audiance: 'audience',
  auther: 'author', authorative: 'authoritative', authrorities: 'authorities', avalable: 'available',
  avaiable: 'available', availabe: 'available', availaible: 'available', availble: 'available',
  avaliable: 'available', averageed: 'averaged', awared: 'awarded',
  banannas: 'bananas', bankrupcy: 'bankruptcy', basicaly: 'basically', basicly: 'basically',
  beautifull: 'beautiful', becasue: 'because', becouse: 'because', becuase: 'because',
  becomming: 'becoming', befor: 'before', begining: 'beginning', beginining: 'beginning',
  beginner: 'beginner', beleif: 'belief', beleive: 'believe', beleived: 'believed',
  beleives: 'believes', belive: 'believe', belived: 'believed', benificial: 'beneficial',
  benifit: 'benefit', beseiged: 'besieged', boaut: 'boat', boundry: 'boundary',
  buisness: 'business', buisnessman: 'businessman', burried: 'buried', busines: 'business',
  bussiness: 'business',
  calander: 'calendar', calandar: 'calendar', calender: 'calendar', camoflage: 'camouflage',
  campain: 'campaign', candiate: 'candidate', catagory: 'category', catagorize: 'categorize',
  catagories: 'categories', caugt: 'caught', causeing: 'causing', cemetarey: 'cemetery',
  cemetry: 'cemetery', chalenging: 'challenging', changable: 'changeable', charachter: 'character',
  charater: 'character', cheif: 'chief', childern: 'children', cieling: 'ceiling',
  circut: 'circuit', circumsision: 'circumcision', ciriculum: 'curriculum', clera: 'clear',
  colection: 'collection', collegue: 'colleague', colum: 'column', comand: 'command',
  comeing: 'coming', comemorate: 'commemorate', comision: 'commission', commemeorate: 'commemorate',
  comming: 'coming', commited: 'committed', commiting: 'committing', commitee: 'committee',
  commmit: 'commit', commuication: 'communication', compair: 'compare', comparision: 'comparison',
  compeletly: 'completely', competance: 'competence', completly: 'completely', compromize: 'compromise',
  concensus: 'consensus', concieve: 'conceive', condamned: 'condemned', conferance: 'conference',
  confidental: 'confidential', confrim: 'confirm', congradulate: 'congratulate',
  consciencious: 'conscientious', concious: 'conscious', consious: 'conscious',
  consequtive: 'consecutive', consistant: 'consistent', constitusion: 'constitution',
  contempoary: 'contemporary', continous: 'continuous', continueing: 'continuing',
  contraversy: 'controversy', contravercial: 'controversial', conveinance: 'convenience',
  convience: 'convenience', conveniance: 'convenience', coperate: 'cooperate',
  copywrite: 'copyright', corosion: 'corrosion', correspondance: 'correspondence',
  cotten: 'cotton', coudl: 'could', counceling: 'counseling', curiousity: 'curiosity',
  curriculem: 'curriculum', custumer: 'customer',
  dacquiri: 'daiquiri', damenor: 'demeanor', deafult: 'default', dealling: 'dealing',
  decathalon: 'decathlon', decieve: 'deceive', decideable: 'decidable', decieving: 'deceiving',
  dectect: 'detect', defendent: 'defendant', defenately: 'definitely', defenitely: 'definitely',
  definately: 'definitely', definatly: 'definitely', definetly: 'definitely', definit: 'definite',
  definitly: 'definitely', defintely: 'definitely', degrate: 'degrade', delerious: 'delirious',
  deliberatly: 'deliberately', demenor: 'demeanor', democracies: 'democracies',
  demographical: 'demographic', denegrating: 'denigrating', dependance: 'dependence',
  dependancy: 'dependency', dependant: 'dependent', descibed: 'described', desicion: 'decision',
  desparate: 'desperate', despirately: 'desperately', develope: 'develop', developement: 'development',
  developped: 'developed', develpment: 'development', devolopment: 'development',
  diagraming: 'diagramming', dicovery: 'discovery', dictatorship: 'dictatorship',
  didnt: "didn't", dieing: 'dying', differance: 'difference', differant: 'different',
  differencial: 'differential', difficukt: 'difficult', diffrent: 'different',
  dilema: 'dilemma', dimesnion: 'dimension', dingity: 'dignity', diptheria: 'diphtheria',
  disapear: 'disappear', disapoint: 'disappoint', disapointed: 'disappointed',
  disappearence: 'disappearance', dissapear: 'disappear', dissapoint: 'disappoint',
  dissappointed: 'disappointed', disasterous: 'disastrous', discpline: 'discipline',
  disipline: 'discipline', dispair: 'despair', dispite: 'despite', distiction: 'distinction',
  diversed: 'diverse', docoment: 'document', dominent: 'dominant', donig: 'doing',
  dosnt: "doesn't", driveing: 'driving', drnik: 'drink', droped: 'dropped',
  ealier: 'earlier', ecomonic: 'economic', eddition: 'edition', efficent: 'efficient',
  efficency: 'efficiency', eigth: 'eighth', electic: 'electric', elegable: 'eligible',
  embarass: 'embarrass', embarassed: 'embarrassed', embarassing: 'embarrassing',
  emergancy: 'emergency', emision: 'emission', emited: 'emitted', emmigrate: 'emigrate',
  emminent: 'eminent', emmission: 'emission', emotinal: 'emotional', emporer: 'emperor',
  enchance: 'enhance', encorporate: 'incorporate', encyclopaedia: 'encyclopedia',
  endolithes: 'endoliths', enigeer: 'engineer', enought: 'enough', enterance: 'entrance',
  enteratinment: 'entertainment', entirly: 'entirely', entrpreneur: 'entrepreneur',
  enviorment: 'environment', enviroment: 'environment', enviromental: 'environmental',
  enviormental: 'environmental', equivelant: 'equivalent', equivilant: 'equivalent',
  esential: 'essential', essencial: 'essential', essentail: 'essential', essentual: 'essential',
  establising: 'establishing', ethnocentricm: 'ethnocentrism', evidance: 'evidence',
  exagerate: 'exaggerate', exagerrate: 'exaggerate', examinated: 'examined', exampel: 'example',
  excelent: 'excellent', excellant: 'excellent', excercise: 'exercise', excersise: 'exercise',
  exection: 'execution', exeedingly: 'exceedingly', exercize: 'exercise', exhistance: 'existence',
  existance: 'existence', exlain: 'explain', exorsice: 'exorcise', expecially: 'especially',
  expell: 'expel', experianced: 'experienced', explaination: 'explanation', explaning: 'explaining',
  explination: 'explanation', explotation: 'exploitation', expresso: 'espresso',
  extravagent: 'extravagant', extremly: 'extremely',
  facinated: 'fascinated', facist: 'fascist', facsination: 'fascination', faild: 'failed',
  familar: 'familiar', familier: 'familiar', famouce: 'famous', fatc: 'fact', favourate: 'favourite',
  feasable: 'feasible', febuary: 'february', fedreally: 'federally', feild: 'field',
  ficticious: 'fictitious', finanical: 'financial', flourescent: 'fluorescent',
  forcast: 'forecast', forclose: 'foreclose', forein: 'foreign', foreward: 'foreword',
  forfiet: 'forfeit', formaly: 'formally', formelly: 'formerly', foriegn: 'foreign',
  fourty: 'forty', foward: 'forward', freind: 'friend', freinds: 'friends',
  frequentily: 'frequently', fulfil: 'fulfill', fullfill: 'fulfill', fundametal: 'fundamental',
  futher: 'further',
  gague: 'gauge', galvinized: 'galvanized', garentee: 'guarantee', garnison: 'garrison',
  gaurd: 'guard', geneology: 'genealogy', generaly: 'generally', geniuenly: 'genuinely',
  geting: 'getting', gettign: 'getting', ghandi: 'gandhi', gimmick: 'gimmick',
  gloabl: 'global', goverment: 'government', govenrment: 'government', govorment: 'government',
  govornment: 'government', gramar: 'grammar', grammer: 'grammar', grandure: 'grandeur',
  gratefull: 'grateful', greatful: 'grateful', greif: 'grief', gropu: 'group',
  guage: 'gauge', guarentee: 'guarantee', garenteed: 'guaranteed', guidence: 'guidance',
  gurantee: 'guarantee', guranteed: 'guaranteed',
  haapen: 'happen', haiku: 'haiku', happend: 'happened', happnes: 'happens',
  harrass: 'harass', harrassment: 'harassment', haveing: 'having', heirarchy: 'hierarchy',
  heigth: 'height', hieght: 'height', helpfull: 'helpful', heridity: 'heredity',
  heroe: 'hero', heros: 'heroes', hesistant: 'hesitant', horizan: 'horizon',
  hosptial: 'hospital', humerous: 'humorous', humurous: 'humorous', hygeine: 'hygiene',
  hygene: 'hygiene', hypocrasy: 'hypocrisy', hypothises: 'hypotheses',
  identicle: 'identical', illegaly: 'illegally', imagenary: 'imaginary', imanent: 'imminent',
  imediately: 'immediately', immediatley: 'immediately', immediatly: 'immediately',
  immidiatly: 'immediately', imperealist: 'imperialist', importamt: 'important',
  importent: 'important', impossable: 'impossible', inadequit: 'inadequate',
  inagurated: 'inaugurated', incidently: 'incidentally', incorect: 'incorrect',
  incredable: 'incredible', indefinately: 'indefinitely', indenpendent: 'independent',
  indepedant: 'independent', independance: 'independence', independant: 'independent',
  indespensable: 'indispensable', indispensible: 'indispensable', indivdual: 'individual',
  indvidual: 'individual', inefficent: 'inefficient', infered: 'inferred',
  influance: 'influence', influencial: 'influential', infomation: 'information',
  informtion: 'information', ingenius: 'ingenious', inital: 'initial', initally: 'initially',
  inocent: 'innocent', inovation: 'innovation', insistance: 'insistence',
  insitution: 'institution', instilation: 'installation', intelectual: 'intellectual',
  inteligence: 'intelligence', inteligent: 'intelligent', intentially: 'intentionally',
  interchangable: 'interchangeable', intresting: 'interesting', interupt: 'interrupt',
  interveiw: 'interview', introdution: 'introduction', intruduced: 'introduced',
  intuative: 'intuitive', invertors: 'inventors', irrelevent: 'irrelevant',
  irresistable: 'irresistible', isen: 'is not',
  jeapardy: 'jeopardy', jewlery: 'jewelry', journies: 'journeys', judgement: 'judgment',
  juducial: 'judicial',
  kernal: 'kernel', knowlege: 'knowledge', knowlegeable: 'knowledgeable',
  lable: 'label', labatory: 'laboratory', laguage: 'language', langauge: 'language',
  larrly: 'largely', larg: 'large', lastest: 'latest', leage: 'league',
  leasure: 'leisure', lenght: 'length', liasion: 'liaison', liason: 'liaison',
  libary: 'library', liberry: 'library', libreal: 'liberal', librery: 'library',
  liesure: 'leisure', lightenning: 'lightning', likly: 'likely', lonelyness: 'loneliness',
  loosing: 'losing',
  maintainance: 'maintenance', maintance: 'maintenance', maintenence: 'maintenance',
  managable: 'manageable', managment: 'management', maneouver: 'maneuver', manoeuver: 'maneuver',
  manufacure: 'manufacture', manuever: 'maneuver', marrage: 'marriage', mathmatics: 'mathematics',
  medcine: 'medicine', medeval: 'medieval', medevil: 'medieval', medievel: 'medieval',
  memeber: 'member', milennium: 'millennium', millenium: 'millennium', mileu: 'milieu',
  millitary: 'military', miniscule: 'minuscule', minium: 'minimum', minstry: 'ministry',
  mircle: 'miracle', mischevious: 'mischievous', mischievious: 'mischievous',
  miscelaneous: 'miscellaneous', miscellanious: 'miscellaneous', mischeivous: 'mischievous',
  misfourtune: 'misfortune', misspel: 'misspell', misspeled: 'misspelled', misterious: 'mysterious',
  monestary: 'monastery', moreso: 'more so', morgage: 'mortgage', mountian: 'mountain',
  mroe: 'more', mucuous: 'mucous', multicultralism: 'multiculturalism', municial: 'municipal',
  mussle: 'muscle', mysefl: 'myself',
  naieve: 'naive', naturaly: 'naturally', neccessary: 'necessary', neccessity: 'necessity',
  necesary: 'necessary', necessiate: 'necessitate', neccesary: 'necessary', negociate: 'negotiate',
  neice: 'niece', nieghbor: 'neighbor', neighbour: 'neighbor', nieghbour: 'neighbor',
  noticable: 'noticeable', noticeable: 'noticeable', nuaght: 'naught', nuculer: 'nuclear',
  obediance: 'obedience', obession: 'obsession', occassion: 'occasion', occassional: 'occasional',
  occassionally: 'occasionally', occured: 'occurred', occurence: 'occurrence', occuring: 'occurring',
  offcially: 'officially', offen: 'often', omision: 'omission', omited: 'omitted',
  ommision: 'omission', ommited: 'omitted', onlly: 'only', oparate: 'operate',
  openess: 'openness', opertunity: 'opportunity', oppinion: 'opinion', opponant: 'opponent',
  opposit: 'opposite', oppurtunity: 'opportunity', optomism: 'optimism', orchastra: 'orchestra',
  organistion: 'organisation', orientate: 'orient', orignal: 'original', originaly: 'originally',
  otehr: 'other', oustanding: 'outstanding', overachiever: 'overachiever',
  paide: 'paid', pamflet: 'pamphlet', paniced: 'panicked', paralel: 'parallel',
  paralell: 'parallel', parahprase: 'paraphrase', paralells: 'parallels', paralysed: 'paralyzed',
  paremeter: 'parameter', parliment: 'parliament', parralel: 'parallel', particulary: 'particularly',
  pary: 'party', pasttime: 'pastime', paticular: 'particular', peice: 'piece',
  penatly: 'penalty', pendulam: 'pendulum', peolpe: 'people', percantage: 'percentage',
  percieve: 'perceive', peremeter: 'perimeter', performace: 'performance', performence: 'performance',
  peripathetic: 'peripatetic', permanant: 'permanent', permision: 'permission',
  permited: 'permitted', persistance: 'persistence', personaly: 'personally',
  perticularly: 'particularly', pharoah: 'pharaoh', phenomenom: 'phenomenon',
  piblisher: 'publisher', pilgrimmage: 'pilgrimage', plagerize: 'plagiarize',
  playright: 'playwright', plebicite: 'plebiscite', poisen: 'poison', polical: 'political',
  polinator: 'pollinator', politican: 'politician', polution: 'pollution',
  poossible: 'possible', populer: 'popular', posess: 'possess', posession: 'possession',
  posible: 'possible', possable: 'possible', possably: 'possibly', posseses: 'possesses',
  possiblity: 'possibility', postion: 'position', potatoe: 'potato', potatos: 'potatoes',
  powerfull: 'powerful', practial: 'practical', preceed: 'precede', preceeded: 'preceded',
  preceeding: 'preceding', precense: 'presence', prefered: 'preferred', preferrable: 'preferable',
  pregnent: 'pregnant', preist: 'priest', prepair: 'prepare', presance: 'presence',
  presedent: 'precedent', presense: 'presence', prestigous: 'prestigious', presumibly: 'presumably',
  pretection: 'protection', primarly: 'primarily', primative: 'primitive',
  priveledge: 'privilege', priviledge: 'privilege', probalby: 'probably', probaly: 'probably',
  probem: 'problem', procede: 'proceed', proceedure: 'procedure', profesion: 'profession',
  professer: 'professor', proffesional: 'professional', proffessor: 'professor',
  progam: 'program', programing: 'programming', prominant: 'prominent', prononciation: 'pronunciation',
  pronounciation: 'pronunciation', proove: 'prove', propoganda: 'propaganda',
  propper: 'proper', propotion: 'proportion', prosess: 'process', protien: 'protein',
  prottest: 'protest', prowd: 'proud', prufe: 'proof', pscyhology: 'psychology',
  psycology: 'psychology', publically: 'publicly', puplisher: 'publisher', purposly: 'purposely',
  pursuade: 'persuade', persue: 'pursue', persued: 'pursued',
  qualaty: 'quality', quantaty: 'quantity', quarentine: 'quarantine', questionaire: 'questionnaire',
  quicklyu: 'quickly', quitted: 'quit',
  raelly: 'really', reaccuring: 'recurring', realy: 'really', reccomend: 'recommend',
  reccommend: 'recommend', receieve: 'receive', receving: 'receiving', recieve: 'receive',
  recieved: 'received', recieving: 'receiving', recognise: 'recognize', recomend: 'recommend',
  recomended: 'recommended', recommed: 'recommend', reconize: 'recognize', recordproducer: 'record producer',
  recuring: 'recurring', refered: 'referred', refering: 'referring', referrence: 'reference',
  reffered: 'referred', regluar: 'regular', reknown: 'renown', religous: 'religious',
  reluctent: 'reluctant', remaing: 'remaining', remeber: 'remember', remembrence: 'remembrance',
  reminscent: 'reminiscent', rennovate: 'renovate', repitition: 'repetition',
  representive: 'representative', reresentation: 'representation', resembelance: 'resemblance',
  resistence: 'resistance', resourses: 'resources', responce: 'response', responsable: 'responsible',
  responsibilty: 'responsibility', restaraunt: 'restaurant', restarant: 'restaurant',
  resturant: 'restaurant', resurect: 'resurrect', retreive: 'retrieve', revelant: 'relevant',
  reveiw: 'review', reveral: 'reversal', revolutionar: 'revolutionary', rhetoricle: 'rhetorical',
  rigourous: 'rigorous', rythm: 'rhythm', rythym: 'rhythm', rythem: 'rhythm',
  sacrafice: 'sacrifice', sacreligious: 'sacrilegious', saftey: 'safety', safty: 'safety',
  salery: 'salary', sandwhich: 'sandwich', satisfyed: 'satisfied', scedule: 'schedule',
  sceduled: 'scheduled', scholarstic: 'scholastic', sciencists: 'scientists',
  scince: 'science', seceeded: 'seceded', secratary: 'secretary', secretery: 'secretary',
  seing: 'seeing', sence: 'sense', sentance: 'sentence', seperate: 'separate',
  seperately: 'separately', sepration: 'separation', seragated: 'segregated',
  severly: 'severely', shiped: 'shipped', shiping: 'shipping', shoud: 'should',
  shouldnt: "shouldn't", sieze: 'seize', similiar: 'similar', similer: 'similar',
  sinceerly: 'sincerely', singificant: 'significant', skilfull: 'skillful', smae: 'same',
  socitey: 'society', soem: 'some', sofware: 'software', solider: 'soldier',
  somthing: 'something', somtimes: 'sometimes', sophmore: 'sophomore', specificly: 'specifically',
  spectaular: 'spectacular', speeling: 'spelling', speling: 'spelling', sponser: 'sponsor',
  sponzor: 'sponsor', staion: 'station', stategic: 'strategic', statment: 'statement',
  steriods: 'steroids', stilus: 'stylus', stoping: 'stopping', stradegy: 'strategy',
  stratagy: 'strategy', strenght: 'strength', strenghten: 'strengthen', strentgh: 'strength',
  sturcture: 'structure', subconcious: 'subconscious', subsidary: 'subsidiary',
  substancial: 'substantial', substitued: 'substituted', substution: 'substitution',
  succedd: 'succeed', succesful: 'successful', succesfull: 'successful', successfull: 'successful',
  succesfully: 'successfully', suceed: 'succeed', sucess: 'success', sucessful: 'successful',
  sufficent: 'sufficient', sugest: 'suggest', sugested: 'suggested', sumary: 'summary',
  supercede: 'supersede', superflous: 'superfluous', suplimented: 'supplemented',
  supposidly: 'supposedly', suprise: 'surprise', suprised: 'surprised', suprising: 'surprising',
  surley: 'surely', surounding: 'surrounding', suroundings: 'surroundings',
  surveilance: 'surveillance', survivers: 'survivors', swaers: 'swears', sylabus: 'syllabus',
  symetrical: 'symmetrical', symettrical: 'symmetrical', sympathize: 'sympathize',
  synonomous: 'synonymous', syphyllis: 'syphilis', sytem: 'system',
  tahn: 'than', taht: 'that', talekd: 'talked', targetting: 'targeting', techician: 'technician',
  technicaly: 'technically', technolgy: 'technology', teh: 'the', tehy: 'they',
  telelevision: 'television', temparate: 'temperate', tempature: 'temperature',
  temporarilly: 'temporarily', tendancy: 'tendency', termoil: 'turmoil',
  terroist: 'terrorist', terorist: 'terrorist', territorist: 'terrorist', thay: 'they',
  theif: 'thief', themselfs: 'themselves', theri: 'their', thgat: 'that', thier: 'their',
  thikning: 'thinking', thnig: 'thing', thoughout: 'throughout', threatend: 'threatened',
  thrid: 'third', throuh: 'through', throught: 'throughout', tiem: 'time',
  togehter: 'together', tolerence: 'tolerance', tommorow: 'tomorrow', tommorrow: 'tomorrow',
  tomorow: 'tomorrow', tongiht: 'tonight', tornadoe: 'tornado', torpedos: 'torpedoes',
  toubles: 'troubles', tounge: 'tongue', tradtional: 'traditional', trafficed: 'trafficked',
  transfered: 'transferred', translater: 'translator', transmision: 'transmission',
  tremondous: 'tremendous', triguered: 'triggered', truely: 'truly', trustwothy: 'trustworthy',
  tryed: 'tried', tthe: 'the', tunelled: 'tunneled', turkye: 'turkey', twelth: 'twelfth',
  tyrany: 'tyranny',
  ubiquitious: 'ubiquitous', uncommited: 'uncommitted', unconcious: 'unconscious',
  underate: 'underrate', understaning: 'understanding', undesireable: 'undesirable',
  unforetunately: 'unfortunately', unfortunatly: 'unfortunately', unfortuantly: 'unfortunately',
  unicornio: 'unicorn', uninvitied: 'uninvited', uniqe: 'unique', univercity: 'university',
  unnecesary: 'unnecessary', unneccessary: 'unnecessary', unneccesary: 'unnecessary',
  unprecendented: 'unprecedented', untill: 'until', unuseable: 'unusable', unusualy: 'unusually',
  upholstry: 'upholstery', usally: 'usually', usefull: 'useful', useing: 'using',
  utalize: 'utilize', ususally: 'usually',
  vacume: 'vacuum', vaccum: 'vacuum', vaccuum: 'vacuum', vegitable: 'vegetable',
  vehical: 'vehicle', vengence: 'vengeance', verfication: 'verification',
  vigilence: 'vigilance', villian: 'villain', villians: 'villains', visable: 'visible',
  vistors: 'visitors', voilent: 'violent',
  wanna: 'want to', warrent: 'warrant', wath: 'watch', wether: 'whether',
  whcih: 'which', wheras: 'whereas', whereever: 'wherever', wich: 'which',
  wierd: 'weird', wieght: 'weight', wih: 'with', wille: 'will', witheld: 'withheld',
  withold: 'withhold', witn: 'with', wonderfull: 'wonderful', wordlwide: 'worldwide',
  worshiped: 'worshipped', wouldnt: "wouldn't", writen: 'written', writting: 'writing',
  xenophoby: 'xenophobia',
  yeild: 'yield', yera: 'year', yeras: 'years', yatch: 'yacht', youre: "you're",
  zeotropical: 'zeotropic',
}

/* ────────────────────────────────────────────────────────────────────
   Confused-words pairs  (pattern → { check, suggestion, message })
   ──────────────────────────────────────────────────────────────────── */

interface ConfusedWordRule {
  pattern: RegExp
  check: (match: RegExpExecArray, fullText: string) => boolean
  suggestion: string
  message: string
}

const CONFUSED_WORDS: ConfusedWordRule[] = [
  // their / there / they're
  {
    pattern: /\btheir\b/gi,
    check: (m, text) => {
      const after = text.slice(m.index! + m[0].length).trimStart()
      return /^(is|are|was|were|has|have|had|will|would|could|should|can|might|may|shall)\b/i.test(after)
    },
    suggestion: "they're",
    message: "Did you mean \"they're\" (they are)? \"Their\" is possessive.",
  },
  {
    pattern: /\bthere\b/gi,
    check: (m, text) => {
      const before = text.slice(Math.max(0, m.index! - 30), m.index!).trimEnd()
      const after = text.slice(m.index! + m[0].length).trimStart()
      return /\b(in|at|over|on|with|from)\s*$/i.test(before) === false &&
             /^(car|house|dog|cat|book|phone|idea|name|opinion|mother|father|friend|child|children|home|school|work|office|team|group)\b/i.test(after)
    },
    suggestion: 'their',
    message: 'Did you mean "their" (possessive)? "There" refers to a place.',
  },
  // your / you're
  {
    pattern: /\byour\b/gi,
    check: (m, text) => {
      const after = text.slice(m.index! + m[0].length).trimStart()
      return /^(going|coming|doing|making|being|getting|running|looking|trying|welcome|right|wrong|the best|the worst|not|never|always|absolutely|so |very |really |quite )/i.test(after)
    },
    suggestion: "you're",
    message: "Did you mean \"you're\" (you are)? \"Your\" is possessive.",
  },
  // its / it's
  {
    pattern: /\bits\b/gi,
    check: (m, text) => {
      const after = text.slice(m.index! + m[0].length).trimStart()
      return /^(a |an |the |been |not |going |important|necessary|possible|impossible|clear|obvious|true|false|great|good|bad|hard|easy|difficult)/i.test(after)
    },
    suggestion: "it's",
    message: "Did you mean \"it's\" (it is)? \"Its\" is possessive.",
  },
  {
    pattern: /\bit's\b/gi,
    check: (m, text) => {
      const after = text.slice(m.index! + m[0].length).trimStart()
      return /^(own\b|color|tail|name|size|shape|purpose|function|design|surface|texture|body|head|legs)/i.test(after)
    },
    suggestion: 'its',
    message: 'Did you mean "its" (possessive)? "It\'s" means "it is".',
  },
  // affect / effect
  {
    pattern: /\beffect\b/gi,
    check: (m, text) => {
      const before = text.slice(Math.max(0, m.index! - 30), m.index!).trimEnd()
      return /\b(will|would|could|can|may|might|shall|should|does|did|do|to|not|never|greatly|directly|significantly|negatively|positively)\s*$/i.test(before)
    },
    suggestion: 'affect',
    message: 'Did you mean "affect" (verb)? "Effect" is usually a noun.',
  },
  // then / than
  {
    pattern: /\bthen\b/gi,
    check: (m, text) => {
      const before = text.slice(Math.max(0, m.index! - 40), m.index!).trimEnd()
      return /\b(more|less|greater|fewer|better|worse|larger|smaller|higher|lower|older|younger|faster|slower|rather|other)\s*$/i.test(before)
    },
    suggestion: 'than',
    message: 'Did you mean "than" (comparison)? "Then" refers to time.',
  },
  // lose / loose
  {
    pattern: /\bloose\b/gi,
    check: (m, text) => {
      const before = text.slice(Math.max(0, m.index! - 30), m.index!).trimEnd()
      return /\b(will|would|could|can|may|might|to|not|don't|didn't|doesn't|won't|wouldn't|going to)\s*$/i.test(before)
    },
    suggestion: 'lose',
    message: 'Did you mean "lose" (to misplace)? "Loose" means not tight.',
  },
  // who's / whose
  {
    pattern: /\bwho's\b/gi,
    check: (m, text) => {
      const after = text.slice(m.index! + m[0].length).trimStart()
      return /^(car|house|dog|book|phone|idea|name|turn|fault|responsibility|job|problem|bag|coat|hat)\b/i.test(after)
    },
    suggestion: 'whose',
    message: 'Did you mean "whose" (possessive)? "Who\'s" means "who is".',
  },
  // to / too
  {
    pattern: /\bto\b/gi,
    check: (m, text) => {
      const after = text.slice(m.index! + m[0].length).trimStart()
      return /^(much|many|few|little|late|early|long|short|fast|slow|big|small|hot|cold|hard|easy|difficult|expensive|cheap|far|close|high|low|old|young|loud|quiet)\b/i.test(after) &&
             !/^(much|many|few|little|late|early|long|short|fast|slow|big|small|hot|cold|hard|easy|difficult|expensive|cheap|far|close|high|low|old|young|loud|quiet)\s+(to|for|of|in|at|on|the|a|an)\b/i.test(after)
    },
    suggestion: 'too',
    message: 'Did you mean "too" (excessively)? "To" is a preposition.',
  },
]

/* ────────────────────────────────────────────────────────────────────
   Passive voice patterns
   ──────────────────────────────────────────────────────────────────── */

const PASSIVE_REGEX = /\b(was|were|is|are|been|be|being)\s+(being\s+)?(given|taken|made|done|seen|known|found|told|shown|left|held|brought|set|kept|turned|sent|called|used|asked|needed|expected|allowed|considered|believed|required|reported|supposed|said|thought|written|built|sold|bought|paid|taught|hit|cut|put|read|run|shut|let|hurt|felt|met|sat|stood|understood|broken|chosen|driven|eaten|fallen|forgotten|frozen|gotten|gone|grown|hidden|ridden|risen|shaken|spoken|stolen|sworn|thrown|woken|worn|accepted|achieved|added|admitted|affected|agreed|aimed|announced|appeared|applied|approved|arrived|attacked|attempted|avoided|based|beaten|become|begun|blamed|blocked|borrowed|caused|changed|charged|checked|claimed|cleaned|closed|collected|combined|compared|completed|concerned|confirmed|connected|contacted|contained|continued|controlled|convinced|corrected|covered|created|crossed|damaged|dealt|decided|declared|delivered|demanded|denied|described|designed|desired|destroyed|developed|directed|discovered|discussed|divided|earned|encouraged|enjoyed|entered|established|examined|exchanged|excited|excused|exercised|existed|expanded|experienced|explained|expressed|extended|faced|failed|forced|formed|gained|generated|grabbed|guaranteed|guided|handled|headed|helped|identified|ignored|imagined|improved|included|increased|indicated|influenced|informed|intended|interested|introduced|invited|involved|joined|judged|killed|landed|laughed|led|lifted|liked|limited|linked|listened|lived|loaded|locked|looked|loved|maintained|managed|marked|measured|mentioned|minded|missed|mixed|monitored|moved|named|noticed|obtained|occurred|offered|opened|operated|ordered|organized|owned|passed|performed|permitted|picked|placed|planned|played|pointed|prepared|presented|pressed|prevented|produced|promoted|proposed|protected|proved|provided|published|pulled|pushed|raised|reached|realized|received|recognized|recorded|reduced|referred|reflected|refused|regarded|related|released|remained|remembered|removed|repeated|replaced|represented|requested|resolved|respected|resulted|returned|revealed|reviewed|saved|searched|secured|selected|separated|served|settled|shared|signed|smiled|solved|sorted|spread|started|stated|stopped|stored|studied|submitted|succeeded|suffered|suggested|supplied|supported|survived|suspected|tested|threatened|touched|tracked|traded|trained|transferred|treated|tried|trusted|turned|visited|voted|waited|walked|warned|watched|wished|wondered|worked|worried)\b/gi

/* ────────────────────────────────────────────────────────────────────
   Writing Style Report — Wordiness, Clichés, Fillers
   ──────────────────────────────────────────────────────────────────── */

const WORDY_PHRASES: Record<string, string> = {
  'in order to': 'to',
  'due to the fact that': 'because',
  'at this point in time': 'now',
  'in the event that': 'if',
  'for the purpose of': 'to',
  'on a daily basis': 'daily',
  'in spite of the fact that': 'although',
  'a large number of': 'many',
  'the vast majority of': 'most',
  'at the present time': 'currently',
  'has the ability to': 'can',
  'is able to': 'can',
  'take into consideration': 'consider',
  'make a decision': 'decide',
  'give consideration to': 'consider',
  'it is important to note that': '',
  'it should be noted that': '',
  'it is worth mentioning that': '',
  'as a matter of fact': 'in fact',
  'in the near future': 'soon',
}

const PASSIVE_VOICE_REGEX = /(was|were|is|are|am|been|being|be)\s+(\w+ed|written|spoken|taken|given|made|done|seen|known|found|told|thought|felt|left|brought|begun|shown|heard|run|held|kept|set|put|read|paid|drawn|built|sent|spent|meant)\b/gi

const CLICHES = [
  'at the end of the day', 'think outside the box', 'low-hanging fruit',
  'move the needle', 'deep dive', 'paradigm shift', 'synergy', 'leverage',
  'best practices', 'circle back', 'touch base', 'game changer', 'value add',
  'take it to the next level', 'on the same page', 'win-win', 'bandwidth',
  'drill down', 'action items', 'stakeholders', 'bring to the table',
  'back to the drawing board', 'hit the ground running', 'bite the bullet',
  'break the ice', 'cutting edge', 'easy as pie', 'food for thought',
  'get the ball rolling', 'go the extra mile', 'in a nutshell',
  'it goes without saying', 'no brainer', 'on the same wavelength',
  'raise the bar', 'read between the lines', 'take one for the team',
  'the bottom line', 'tip of the iceberg', 'up to speed',
]

const FILLER_WORDS = [
  'actually', 'basically', 'literally', 'very', 'really', 'just',
  'quite', 'rather', 'somewhat', 'perhaps',
]

type StyleIssueType = 'wordiness' | 'passive' | 'cliche' | 'filler'

interface StyleIssue {
  type: StyleIssueType
  start: number
  end: number
  text: string
  suggestion: string
}

const STYLE_ISSUE_META: Record<StyleIssueType, { label: string; color: string; bgColor: string }> = {
  wordiness: { label: 'Wordiness', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-500/10' },
  passive:   { label: 'Passive Voice', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-500/10' },
  cliche:    { label: 'Cliché', color: 'text-pink-600 dark:text-pink-400', bgColor: 'bg-pink-500/10' },
  filler:    { label: 'Filler Word', color: 'text-teal-600 dark:text-teal-400', bgColor: 'bg-teal-500/10' },
}

interface WritingStats {
  totalIssues: number
  wordiness: number
  passive: number
  cliche: number
  filler: number
  passivePercentage: number
  avgSentenceLength: number
  vocabularyDiversity: number
  fillerWordCount: number
  totalSentences: number
  totalWords: number
}

function analyzeWritingStyle(text: string): { issues: StyleIssue[]; stats: WritingStats } {
  if (!text.trim()) {
    return {
      issues: [],
      stats: { totalIssues: 0, wordiness: 0, passive: 0, cliche: 0, filler: 0, passivePercentage: 0, avgSentenceLength: 0, vocabularyDiversity: 0, fillerWordCount: 0, totalSentences: 0, totalWords: 0 },
    }
  }

  const issues: StyleIssue[] = []
  const lowerText = text.toLowerCase()

  // 1. Wordiness detector
  for (const [phrase, replacement] of Object.entries(WORDY_PHRASES)) {
    let idx = lowerText.indexOf(phrase)
    while (idx !== -1) {
      issues.push({
        type: 'wordiness',
        start: idx,
        end: idx + phrase.length,
        text: text.slice(idx, idx + phrase.length),
        suggestion: replacement || '(remove)',
      })
      idx = lowerText.indexOf(phrase, idx + phrase.length)
    }
  }

  // 2. Passive voice detector
  const pvRegex = new RegExp(PASSIVE_VOICE_REGEX.source, PASSIVE_VOICE_REGEX.flags)
  let pvMatch: RegExpExecArray | null
  while ((pvMatch = pvRegex.exec(text)) !== null) {
    issues.push({
      type: 'passive',
      start: pvMatch.index,
      end: pvMatch.index + pvMatch[0].length,
      text: pvMatch[0],
      suggestion: 'Consider rewriting in active voice',
    })
  }

  // 3. Cliché detector
  for (const cliche of CLICHES) {
    let idx = lowerText.indexOf(cliche)
    while (idx !== -1) {
      issues.push({
        type: 'cliche',
        start: idx,
        end: idx + cliche.length,
        text: text.slice(idx, idx + cliche.length),
        suggestion: 'Consider a more original expression',
      })
      idx = lowerText.indexOf(cliche, idx + cliche.length)
    }
  }

  // 4. Filler word highlighter
  for (const filler of FILLER_WORDS) {
    const fillerRegex = new RegExp(`\\b${filler}\\b`, 'gi')
    let fm: RegExpExecArray | null
    while ((fm = fillerRegex.exec(text)) !== null) {
      issues.push({
        type: 'filler',
        start: fm.index,
        end: fm.index + fm[0].length,
        text: fm[0],
        suggestion: 'Consider removing this filler word',
      })
    }
  }

  // Sort by position
  issues.sort((a, b) => a.start - b.start)

  // Calculate stats
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const totalWords = words.length
  const totalSentences = sentences.length
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z']/g, '')).filter(Boolean))
  const avgSentenceLength = totalSentences > 0 ? Math.round(totalWords / totalSentences) : 0
  const vocabularyDiversity = totalWords > 0 ? Math.round((uniqueWords.size / totalWords) * 100) / 100 : 0

  const countByType = { wordiness: 0, passive: 0, cliche: 0, filler: 0 }
  for (const issue of issues) countByType[issue.type]++

  const passivePercentage = totalSentences > 0 ? Math.round((countByType.passive / totalSentences) * 100) : 0

  return {
    issues,
    stats: {
      totalIssues: issues.length,
      ...countByType,
      passivePercentage,
      avgSentenceLength,
      vocabularyDiversity,
      fillerWordCount: countByType.filler,
      totalSentences,
      totalWords,
    },
  }
}

/* ────────────────────────────────────────────────────────────────────
   The main checker function
   ──────────────────────────────────────────────────────────────────── */

function checkGrammar(text: string): GrammarError[] {
  if (!text.trim()) return []

  const errors: GrammarError[] = []
  const seen = new Set<string>() // avoid duplicate ranges

  const addError = (e: GrammarError) => {
    const key = `${e.start}-${e.end}`
    if (!seen.has(key)) {
      seen.add(key)
      errors.push(e)
    }
  }

  /* ── 1. Spelling ──────────────────────────────────────────────── */
  const wordRegex = /\b[a-zA-Z']+\b/g
  let wordMatch: RegExpExecArray | null
  while ((wordMatch = wordRegex.exec(text)) !== null) {
    const word = wordMatch[0]
    const lower = word.toLowerCase()

    // Skip very short words and contractions that are valid
    if (lower.length < 2) continue
    if (["i'm", "i'll", "i've", "i'd", "don't", "doesn't", "didn't", "won't",
         "wouldn't", "couldn't", "shouldn't", "can't", "isn't", "aren't", "wasn't",
         "weren't", "hasn't", "haven't", "hadn't", "it's", "that's", "there's",
         "they're", "you're", "we're", "he's", "she's", "who's", "what's",
         "let's", "here's", "where's"].includes(lower)) continue

    const correction = MISSPELLINGS[lower]
    if (correction) {
      // Preserve original case style
      let fixed = correction
      if (word[0] === word[0].toUpperCase()) {
        fixed = correction.charAt(0).toUpperCase() + correction.slice(1)
      }
      addError({
        start: wordMatch.index,
        end: wordMatch.index + word.length,
        original: word,
        message: `"${word}" appears to be misspelled.`,
        suggestion: fixed,
        category: 'spelling',
      })
    }
  }

  /* ── 2. Confused words ────────────────────────────────────────── */
  for (const rule of CONFUSED_WORDS) {
    let m: RegExpExecArray | null
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags)
    while ((m = regex.exec(text)) !== null) {
      if (rule.check(m, text)) {
        // Preserve case
        let suggestion = rule.suggestion
        if (m[0][0] === m[0][0].toUpperCase()) {
          suggestion = suggestion.charAt(0).toUpperCase() + suggestion.slice(1)
        }
        addError({
          start: m.index,
          end: m.index + m[0].length,
          original: m[0],
          message: rule.message,
          suggestion,
          category: 'grammar',
        })
      }
    }
  }

  /* ── 3. Double words  ("the the") ─────────────────────────────── */
  const doubleWordRegex = /\b([a-zA-Z]+)\s+\1\b/gi
  let dw: RegExpExecArray | null
  while ((dw = doubleWordRegex.exec(text)) !== null) {
    addError({
      start: dw.index,
      end: dw.index + dw[0].length,
      original: dw[0],
      message: `Repeated word "${dw[1]}".`,
      suggestion: dw[1],
      category: 'grammar',
    })
  }

  /* ── 4. Missing capitalisation after sentence-ending punctuation ── */
  const capRegex = /([.!?])\s+([a-z])/g
  let capMatch: RegExpExecArray | null
  while ((capMatch = capRegex.exec(text)) !== null) {
    const charIdx = capMatch.index + capMatch[0].length - 1
    addError({
      start: charIdx,
      end: charIdx + 1,
      original: capMatch[2],
      message: 'Sentence should start with a capital letter.',
      suggestion: capMatch[2].toUpperCase(),
      category: 'grammar',
    })
  }

  /* ── 5. Subject-verb agreement (basic patterns) ───────────────── */
  const svPatterns: { pattern: RegExp; message: string; suggestion: string }[] = [
    { pattern: /\b(he|she|it)\s+(are)\b/gi, message: 'Subject-verb disagreement: use "is" with he/she/it.', suggestion: 'is' },
    { pattern: /\b(he|she|it)\s+(were)\b/gi, message: 'Subject-verb disagreement: use "was" with he/she/it.', suggestion: 'was' },
    { pattern: /\b(he|she|it)\s+(have)\b(?!\s+(to|been))/gi, message: 'Subject-verb disagreement: use "has" with he/she/it.', suggestion: 'has' },
    { pattern: /\b(I)\s+(is)\b/gi, message: 'Subject-verb disagreement: use "am" with I.', suggestion: 'am' },
    { pattern: /\b(I)\s+(has)\b/gi, message: 'Subject-verb disagreement: use "have" with I.', suggestion: 'have' },
    { pattern: /\b(we|they)\s+(is)\b/gi, message: 'Subject-verb disagreement: use "are" with we/they.', suggestion: 'are' },
    { pattern: /\b(we|they)\s+(was)\b/gi, message: 'Subject-verb disagreement: use "were" with we/they.', suggestion: 'were' },
    { pattern: /\b(we|they)\s+(has)\b(?!\s+(to|been))/gi, message: 'Subject-verb disagreement: use "have" with we/they.', suggestion: 'have' },
    { pattern: /\b(you)\s+(is)\b/gi, message: 'Subject-verb disagreement: use "are" with you.', suggestion: 'are' },
    { pattern: /\b(you)\s+(was)\b/gi, message: 'Subject-verb disagreement: use "were" with you.', suggestion: 'were' },
  ]

  for (const sv of svPatterns) {
    let m: RegExpExecArray | null
    const regex = new RegExp(sv.pattern.source, sv.pattern.flags)
    while ((m = regex.exec(text)) !== null) {
      // The verb is group 2 — highlight just that
      const verbStart = m.index + m[1].length + 1
      const verb = m[2]
      addError({
        start: verbStart,
        end: verbStart + verb.length,
        original: verb,
        message: sv.message,
        suggestion: sv.suggestion,
        category: 'grammar',
      })
    }
  }

  /* ── 6. "a" before vowel → "an" ──────────────────────────────── */
  const aAnRegex = /\ba\s+([aeiou][a-z]*)\b/gi
  let aMatch: RegExpExecArray | null
  while ((aMatch = aAnRegex.exec(text)) !== null) {
    // Skip "a use/uniform/union/unit/united/unique/usual/user/utility/universe" – "u" sounds like "y"
    if (/^(uni|use|user|usual|usually|united|union|unique|uniform|unit|utility|universe|universal|university|uranium|ubiquit)/i.test(aMatch[1])) continue
    // Skip "a one/once" – "o" sounds like "w"
    if (/^(one|once)\b/i.test(aMatch[1])) continue
    addError({
      start: aMatch.index,
      end: aMatch.index + 1,
      original: 'a',
      message: 'Use "an" before words starting with a vowel sound.',
      suggestion: 'an',
      category: 'grammar',
    })
  }

  /* ── 7. "an" before consonant → "a" ──────────────────────────── */
  const anARegex = /\ban\s+([bcdfghjklmnpqrstvwxyz][a-z]*)\b/gi
  let anMatch: RegExpExecArray | null
  while ((anMatch = anARegex.exec(text)) !== null) {
    // Skip "an hour/honest/honor/heir/herb" – silent "h"
    if (/^(hour|honest|honor|honour|heir|herb)\b/i.test(anMatch[1])) continue
    addError({
      start: anMatch.index,
      end: anMatch.index + 2,
      original: 'an',
      message: 'Use "a" before words starting with a consonant sound.',
      suggestion: 'a',
      category: 'grammar',
    })
  }

  /* ── 8. Punctuation checks ────────────────────────────────────── */

  // Double spaces
  const dblSpace = /  +/g
  let ds: RegExpExecArray | null
  while ((ds = dblSpace.exec(text)) !== null) {
    addError({
      start: ds.index,
      end: ds.index + ds[0].length,
      original: ds[0],
      message: 'Multiple consecutive spaces.',
      suggestion: ' ',
      category: 'punctuation',
    })
  }

  // Space before punctuation
  const spacePunc = / +([,;:!?.])/g
  let sp: RegExpExecArray | null
  while ((sp = spacePunc.exec(text)) !== null) {
    addError({
      start: sp.index,
      end: sp.index + sp[0].length,
      original: sp[0],
      message: 'Remove space before punctuation.',
      suggestion: sp[1],
      category: 'punctuation',
    })
  }

  // Missing period at end (only if text has multiple words and doesn't end with punctuation)
  const trimmed = text.trimEnd()
  if (trimmed.length > 10 && /\s/.test(trimmed) && !/[.!?:;'"\-)\]}>]$/.test(trimmed)) {
    addError({
      start: trimmed.length,
      end: trimmed.length,
      original: '',
      message: 'Text appears to be missing ending punctuation.',
      suggestion: '.',
      category: 'punctuation',
    })
  }

  /* ── 9. Style: passive voice ──────────────────────────────────── */
  let pv: RegExpExecArray | null
  const passiveRegex = new RegExp(PASSIVE_REGEX.source, PASSIVE_REGEX.flags)
  while ((pv = passiveRegex.exec(text)) !== null) {
    addError({
      start: pv.index,
      end: pv.index + pv[0].length,
      original: pv[0],
      message: 'Passive voice detected. Consider using active voice for clarity.',
      suggestion: pv[0], // no auto-fix for style
      category: 'style',
    })
  }

  /* ── 10. Style: very long sentences (>40 words) ───────────────── */
  const sentences = text.split(/(?<=[.!?])\s+/)
  let offset = 0
  for (const sentence of sentences) {
    const idx = text.indexOf(sentence, offset)
    const wordCount = sentence.split(/\s+/).filter(Boolean).length
    if (wordCount > 40) {
      addError({
        start: idx,
        end: idx + sentence.length,
        original: sentence,
        message: `This sentence is ${wordCount} words long. Consider breaking it into shorter sentences for readability.`,
        suggestion: sentence, // no auto-fix
        category: 'style',
      })
    }
    offset = idx + sentence.length
  }

  // Sort by position
  errors.sort((a, b) => a.start - b.start)
  return errors
}

/* ────────────────────────────────────────────────────────────────────
   Apply all fixable errors
   ──────────────────────────────────────────────────────────────────── */

function applyFixes(text: string, errors: GrammarError[]): string {
  // Only apply non-style fixes where suggestion differs from original
  const fixable = errors
    .filter(e => e.category !== 'style' && e.suggestion !== e.original)
    .sort((a, b) => b.start - a.start) // reverse order to preserve indices

  let result = text
  for (const err of fixable) {
    result = result.slice(0, err.start) + err.suggestion + result.slice(err.end)
  }
  return result
}

/* ────────────────────────────────────────────────────────────────────
   Category metadata
   ──────────────────────────────────────────────────────────────────── */

const CATEGORY_META: Record<ErrorCategory, { label: string; color: string; bgColor: string; borderColor: string; underline: string }> = {
  spelling:    { label: 'Spelling',    color: 'text-red-600 dark:text-red-400',    bgColor: 'bg-red-500/10',    borderColor: 'border-red-500/30',    underline: 'decoration-red-500' },
  grammar:     { label: 'Grammar',     color: 'text-blue-600 dark:text-blue-400',   bgColor: 'bg-blue-500/10',   borderColor: 'border-blue-500/30',   underline: 'decoration-blue-500' },
  punctuation: { label: 'Punctuation', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', underline: 'decoration-orange-500' },
  style:       { label: 'Style',       color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30', underline: 'decoration-yellow-500' },
}

/* ────────────────────────────────────────────────────────────────────
   Component
   ──────────────────────────────────────────────────────────────────── */

export default function AIGrammarChecker() {
  const [input, setInput] = useState('')
  const [selectedError, setSelectedError] = useState<GrammarError | null>(null)
  const [activeTab, setActiveTab] = useState<'errors' | 'report'>('errors')

  const errors = useMemo(() => checkGrammar(input), [input])

  const correctedText = useMemo(() => {
    if (errors.length === 0) return input
    return applyFixes(input, errors)
  }, [input, errors])

  const counts = useMemo(() => {
    const c: Record<ErrorCategory, number> = { spelling: 0, grammar: 0, punctuation: 0, style: 0 }
    for (const e of errors) c[e.category]++
    return c
  }, [errors])

  const styleReport = useMemo(() => analyzeWritingStyle(input), [input])

  const totalErrors = errors.length

  const handleFixAll = useCallback(() => {
    setInput(correctedText)
    setSelectedError(null)
  }, [correctedText])

  const handleFixOne = useCallback((err: GrammarError) => {
    if (err.category === 'style' || err.suggestion === err.original) return
    const fixed = input.slice(0, err.start) + err.suggestion + input.slice(err.end)
    setInput(fixed)
    setSelectedError(null)
  }, [input])

  /* Build highlighted HTML for the annotated preview */
  const annotatedHtml = useMemo(() => {
    if (!input || errors.length === 0) return ''

    const parts: string[] = []
    let lastIdx = 0

    for (const err of errors) {
      if (err.start < lastIdx) continue // overlapping
      if (err.start > lastIdx) {
        parts.push(escapeHtml(input.slice(lastIdx, err.start)))
      }

      const meta = CATEGORY_META[err.category]
      const snippet = input.slice(err.start, err.end) || '\u200B'
      parts.push(
        `<span class="underline decoration-wavy decoration-2 ${meta.underline} cursor-pointer relative group" data-idx="${errors.indexOf(err)}">${escapeHtml(snippet)}<span class="hidden group-hover:block absolute left-0 bottom-full mb-1 px-2 py-1 text-xs rounded shadow-lg bg-popover text-popover-foreground border border-border whitespace-nowrap z-50">${escapeHtml(err.message)}</span></span>`
      )
      lastIdx = err.end
    }

    if (lastIdx < input.length) {
      parts.push(escapeHtml(input.slice(lastIdx)))
    }

    return parts.join('')
  }, [input, errors])

  return (
    <ToolPage
      title="AI Grammar Checker"
      description="Check your text for grammar, spelling, and punctuation errors. Get instant corrections — runs entirely in your browser."
      category="text"
      categoryLabel="Text Tools"
      slug="ai-grammar-checker"
      helpContent={
        <>
          <h2>What is AI Grammar Checker?</h2>
          <p>
            AI Grammar Checker is a free, browser-based writing assistant that scans your text for spelling mistakes, grammar errors, punctuation problems, and style issues. Unlike cloud-dependent grammar tools, this checker runs entirely in your browser using a sophisticated rule-based engine built in pure JavaScript. It includes a dictionary of over 500 commonly misspelled words, pattern-matching for grammar rules like subject-verb agreement and confused words, and heuristics for detecting passive voice and overly long sentences. Your text never leaves your device, making it ideal for proofreading confidential documents, academic papers, and professional emails.
          </p>
          <p>
            Errors are organized into four clear categories — spelling, grammar, punctuation, and style — each highlighted with a distinct color in the text. You can click any highlighted error to see the suggested correction and apply it individually, or use the Fix All button to auto-correct every spelling, grammar, and punctuation issue at once. Style suggestions are displayed for your consideration but are not auto-corrected, since they often require human judgment to rephrase properly.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Type or paste the text you want to proofread into the input area on the left side of the screen.</li>
            <li>The tool instantly analyzes your text and highlights any issues it finds, grouped by category.</li>
            <li>Review the error summary panel at the top to see how many spelling, grammar, punctuation, and style issues were detected.</li>
            <li>Click on any highlighted error in the text to view its description and suggested fix, then apply the correction with a single click.</li>
            <li>Alternatively, click the Fix All button to automatically apply all spelling, grammar, and punctuation corrections at once.</li>
            <li>Copy the corrected text using the copy button, or clear the input to start checking a new document.</li>
          </ol>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li>Paste your full document at once rather than checking sentence by sentence. The tool analyzes context across sentences for more accurate detection.</li>
            <li>Pay special attention to confused-word detections such as their/there/they&#39;re and your/you&#39;re, as these are among the most common writing mistakes that spell-checkers often miss.</li>
            <li>Review style suggestions carefully. Passive voice is not always wrong, and long sentences can be intentional for rhetorical effect.</li>
            <li>Use this tool as a final proofreading step after you have finished writing and editing your content for structure and clarity.</li>
            <li>The checker works best with standard English prose. It may flag intentional informal language, dialogue, or creative writing choices as errors.</li>
            <li>Since all processing happens locally, there is no word limit. You can check documents of any length without worrying about character caps or rate limits.</li>
          </ul>
        </>
      }
      faqs={[
        {
          question: 'How does this grammar checker work without AI models?',
          answer: 'This tool uses an extensive rule-based engine built in pure JavaScript. It includes a dictionary of 500+ commonly misspelled words, pattern-matching for grammar rules like subject-verb agreement, confused word detection (their/there/they\'re, your/you\'re, etc.), and style analysis for passive voice and sentence length. Everything runs instantly in your browser with zero downloads.',
        },
        {
          question: 'What types of errors does it detect?',
          answer: 'The checker identifies four categories of issues: Spelling errors (common misspellings), Grammar errors (subject-verb agreement, double words, missing capitalisation, a/an usage, confused words), Punctuation problems (double spaces, space before punctuation, missing end punctuation), and Style suggestions (passive voice, overly long sentences).',
        },
        {
          question: 'Is my text sent to any server?',
          answer: 'No. All processing happens entirely in your browser using JavaScript. Your text never leaves your device. There are no API calls, no cloud processing, and no data stored anywhere.',
        },
        {
          question: 'Can I auto-correct all detected errors?',
          answer: 'Yes! Click "Fix All" to automatically apply all spelling, grammar, and punctuation corrections. Style suggestions (like passive voice) are informational and not auto-corrected because they require human judgment to rephrase. You can also click individual errors to fix them one at a time.',
        },
      ]}
    >
      <div className="space-y-4">
        {/* Error summary panel */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Total badge */}
          <div className="flex items-center gap-1.5">
            {totalErrors === 0 && input.trim() ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {!input.trim()
                ? 'Enter text to check'
                : totalErrors === 0
                  ? 'No issues found!'
                  : `${totalErrors} issue${totalErrors === 1 ? '' : 's'} found`}
            </span>
          </div>

          {/* Category counts */}
          {totalErrors > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(counts) as ErrorCategory[]).map(cat => {
                if (counts[cat] === 0) return null
                const meta = CATEGORY_META[cat]
                return (
                  <span key={cat} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.bgColor} ${meta.color}`}>
                    {counts[cat]} {meta.label}
                  </span>
                )
              })}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {totalErrors > 0 && correctedText !== input && (
              <button
                onClick={handleFixAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Fix All
              </button>
            )}
            <ClearButton onClear={() => { setInput(''); setSelectedError(null) }} />
          </div>
        </div>

        {/* Main split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: input + annotated preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Your Text</span>
              {input.trim() && (
                <span className="text-xs text-muted-foreground">
                  {input.trim().split(/\s+/).length} words
                </span>
              )}
            </div>
            <ToolTextarea
              value={input}
              onChange={setInput}
              placeholder="Type or paste your text here to check for grammar, spelling, and punctuation errors..."
              rows={12}
            />

            {/* Annotated preview with inline highlights */}
            {input.trim() && errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <MousePointerClick className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Click underlined text to see details. Hover for quick preview.</span>
                </div>
                <div
                  className="p-3 rounded-lg border border-border bg-muted/30 text-sm leading-relaxed whitespace-pre-wrap break-words max-h-80 overflow-y-auto"
                  onClick={(e) => {
                    const target = (e.target as HTMLElement).closest('[data-idx]')
                    if (target) {
                      const idx = parseInt(target.getAttribute('data-idx')!, 10)
                      setSelectedError(errors[idx] ?? null)
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: annotatedHtml }}
                />
              </div>
            )}
          </div>

          {/* Right: selected error details + corrected output */}
          <div className="space-y-3">
            {/* Selected error detail card */}
            {selectedError && (
              <div className={`p-4 rounded-lg border ${CATEGORY_META[selectedError.category].borderColor} ${CATEGORY_META[selectedError.category].bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${CATEGORY_META[selectedError.category].color}`}>
                    {CATEGORY_META[selectedError.category].label}
                  </span>
                  <button onClick={() => setSelectedError(null)} className="text-xs text-muted-foreground hover:text-foreground">
                    Dismiss
                  </button>
                </div>
                <p className="text-sm mb-2">{selectedError.message}</p>
                {selectedError.category !== 'style' && selectedError.suggestion !== selectedError.original && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Suggestion:</span>
                    <code className="text-sm font-mono px-1.5 py-0.5 rounded bg-background border border-border">
                      {selectedError.suggestion}
                    </code>
                    <button
                      onClick={() => handleFixOne(selectedError)}
                      className="ml-auto inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Fix
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Error list */}
            {errors.length > 0 && (
              <div>
                <span className="text-sm font-semibold">All Issues</span>
                <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                  {errors.map((err, i) => {
                    const meta = CATEGORY_META[err.category]
                    return (
                      <button
                        key={`${err.start}-${err.end}-${i}`}
                        onClick={() => setSelectedError(err)}
                        className={`w-full text-left p-2 rounded-md border text-xs transition-colors hover:bg-muted/50 ${
                          selectedError === err ? `${meta.borderColor} ${meta.bgColor}` : 'border-border'
                        }`}
                      >
                        <span className={`font-semibold ${meta.color}`}>{meta.label}:</span>{' '}
                        <span className="text-muted-foreground">
                          {err.original ? `"${err.original.length > 30 ? err.original.slice(0, 30) + '...' : err.original}"` : '(end of text)'}
                        </span>
                        {err.category !== 'style' && err.suggestion !== err.original && (
                          <span className="text-foreground"> → "{err.suggestion}"</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Corrected output */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Corrected Text</span>
              {correctedText && <CopyButton text={correctedText} />}
            </div>
            <ToolTextarea
              value={correctedText}
              readOnly
              placeholder="Corrected text will appear here..."
              rows={12}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">Legend:</span>
          {(Object.keys(CATEGORY_META) as ErrorCategory[]).map(cat => {
            const meta = CATEGORY_META[cat]
            return (
              <span key={cat} className="inline-flex items-center gap-1.5 text-xs">
                <span className={`inline-block w-4 border-b-2 border-wavy ${meta.underline}`} />
                <span className={meta.color}>{meta.label}</span>
              </span>
            )
          })}
        </div>

        {/* Writing Style Report */}
        {input.trim() && (
          <div className="space-y-4 pt-4 border-t border-border">
            {/* Tab toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('errors')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'errors'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Grammar Issues ({totalErrors})
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'report'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Writing Report ({styleReport.stats.totalIssues})
              </button>
            </div>

            {activeTab === 'report' && (
              <div className="space-y-4">
                {/* Stats Panel */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <div className="text-2xl font-bold text-foreground">{styleReport.stats.totalIssues}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total Style Issues</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <div className="text-2xl font-bold text-foreground">{styleReport.stats.passivePercentage}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Passive Voice</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <div className="text-2xl font-bold text-foreground">{styleReport.stats.avgSentenceLength}</div>
                    <div className="text-xs text-muted-foreground mt-1">Avg Sentence Length</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <div className="text-2xl font-bold text-foreground">{(styleReport.stats.vocabularyDiversity * 100).toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Vocabulary Diversity</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                    <div className="text-2xl font-bold text-foreground">{styleReport.stats.fillerWordCount}</div>
                    <div className="text-xs text-muted-foreground mt-1">Filler Words</div>
                  </div>
                </div>

                {/* Issue category badges */}
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(STYLE_ISSUE_META) as StyleIssueType[]).map(type => {
                    const meta = STYLE_ISSUE_META[type]
                    const count = styleReport.issues.filter(i => i.type === type).length
                    if (count === 0) return null
                    return (
                      <span key={type} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${meta.bgColor} ${meta.color}`}>
                        {count} {meta.label}{count !== 1 ? (type === 'wordiness' ? '' : 's') : ''}
                      </span>
                    )
                  })}
                </div>

                {/* Issue list */}
                {styleReport.issues.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {styleReport.issues.map((issue, i) => {
                      const meta = STYLE_ISSUE_META[issue.type]
                      return (
                        <div key={`${issue.start}-${issue.end}-${i}`} className={`p-3 rounded-lg border border-border ${meta.bgColor}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-semibold uppercase tracking-wider ${meta.color}`}>{meta.label}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">&quot;{issue.text.length > 60 ? issue.text.slice(0, 60) + '...' : issue.text}&quot;</span>
                            {issue.suggestion && (
                              <span className="text-muted-foreground ml-2">→ {issue.suggestion}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    No writing style issues detected. Your text looks clean!
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPage>
  )
}

/* ── Utility ────────────────────────────────────────────────────── */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
