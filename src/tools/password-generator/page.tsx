'use client'

import { useState, useCallback, useMemo } from 'react'
import { Shield } from 'lucide-react'
import { ToolPage, CopyButton, ClearButton, DownloadButton } from '@/components/tool-page'

const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

const AMBIGUOUS_CHARS = '0OoIl1'

// ~2048 common English words for passphrase generation
const WORDLIST = [
  'abandon','ability','able','about','above','absent','absorb','abstract','absurd','abuse',
  'access','acid','acoustic','acquire','across','act','action','actor','actress','actual',
  'adapt','add','addict','address','adjust','admit','adult','advance','advice','aerobic',
  'affair','afford','afraid','again','age','agent','agree','ahead','aim','air',
  'airport','aisle','alarm','album','alcohol','alert','alien','all','alley','allow',
  'almost','alone','alpha','already','also','alter','always','amateur','amazing','among',
  'amount','amused','analyst','anchor','ancient','anger','angle','angry','animal','ankle',
  'announce','annual','another','answer','antenna','antique','anxiety','any','apart','apology',
  'appear','apple','approve','april','arch','arctic','area','arena','argue','arm',
  'armor','army','around','arrange','arrest','arrive','arrow','art','artefact','artist',
  'artwork','ask','aspect','assault','asset','assist','assume','asthma','atom','attack',
  'attend','attitude','attract','auction','audit','august','aunt','author','auto','autumn',
  'average','avocado','avoid','awake','aware','awesome','awful','awkward','axis','baby',
  'bachelor','bacon','badge','bag','balance','balcony','ball','bamboo','banana','banner',
  'bar','barely','bargain','barrel','base','basic','basket','battle','beach','bean',
  'beauty','because','become','beef','before','begin','behave','behind','believe','below',
  'belt','bench','benefit','best','betray','better','between','beyond','bicycle','bid',
  'bike','bind','biology','bird','birth','bitter','black','blade','blame','blanket',
  'blast','bleak','bless','blind','blood','blossom','blow','blue','blur','blush',
  'board','boat','body','boil','bomb','bone','bonus','book','boost','border',
  'boring','borrow','boss','bottom','bounce','box','boy','bracket','brain','brand',
  'brass','brave','bread','breeze','brick','bridge','brief','bright','bring','brisk',
  'broken','bronze','broom','brother','brown','brush','bubble','buddy','budget','buffalo',
  'build','bulb','bulk','bullet','bundle','bunny','burden','burger','burst','bus',
  'business','busy','butter','buyer','buzz','cabbage','cabin','cable','cactus','cage',
  'cake','call','calm','camera','camp','canal','cancel','candy','cannon','canoe',
  'canvas','canyon','capable','capital','captain','car','carbon','card','cargo','carpet',
  'carry','cart','case','cash','casino','castle','casual','cat','catalog','catch',
  'category','cattle','caught','cause','caution','cave','ceiling','celery','cement','census',
  'century','cereal','certain','chair','chalk','champion','change','chaos','chapter','charge',
  'chase','cheap','check','cheese','cherry','chest','chicken','chief','child','chimney',
  'choice','choose','chunk','church','cigar','circle','citizen','city','civil','claim',
  'clap','clarify','claw','clay','clean','clerk','clever','click','client','cliff',
  'climb','clinic','clip','clock','close','cloth','cloud','clown','club','clump',
  'cluster','clutch','coach','coast','coconut','code','coffee','coil','coin','collect',
  'color','column','combine','come','comfort','comic','common','company','concert','conduct',
  'confirm','congress','connect','consider','control','convince','cook','cool','copper','copy',
  'coral','core','corn','correct','cost','cotton','couch','country','couple','course',
  'cousin','cover','coyote','crack','cradle','craft','cram','crane','crash','crater',
  'crawl','crazy','cream','credit','creek','crew','cricket','crime','crisp','critic',
  'crop','cross','crouch','crowd','crucial','cruel','cruise','crumble','crush','cry',
  'crystal','cube','culture','cup','cupboard','curious','current','curtain','curve','cushion',
  'custom','cute','cycle','dad','damage','damp','dance','danger','daring','dash',
  'daughter','dawn','day','deal','debate','debris','decade','december','decide','decline',
  'decorate','decrease','deer','defense','define','defy','degree','delay','deliver','demand',
  'demise','denial','dentist','deny','depart','depend','deposit','depth','deputy','derive',
  'describe','desert','design','desk','despair','destroy','detail','detect','develop','device',
  'devote','diagram','dial','diamond','diary','dice','diesel','diet','differ','digital',
  'dignity','dilemma','dinner','dinosaur','direct','dirt','disagree','discover','disease','dish',
  'dismiss','disorder','display','distance','divert','divide','divorce','dizzy','doctor','document',
  'dog','doll','dolphin','domain','donate','donkey','donor','door','dose','double',
  'dove','draft','dragon','drama','drastic','draw','dream','dress','drift','drill',
  'drink','drip','drive','drop','drum','dry','duck','dumb','dune','during',
  'dust','dutch','duty','dwarf','dynamic','eager','eagle','early','earn','earth',
  'easily','east','easy','echo','ecology','economy','edge','edit','educate','effort',
  'egg','eight','either','elbow','elder','electric','elegant','element','elephant','elevator',
  'elite','else','embark','embody','embrace','emerge','emotion','employ','empower','empty',
  'enable','enact','end','endless','endorse','enemy','energy','enforce','engage','engine',
  'enhance','enjoy','enlist','enough','enrich','enroll','ensure','enter','entire','entry',
  'envelope','episode','equal','equip','era','erase','erode','erosion','error','erupt',
  'escape','essay','essence','estate','eternal','ethics','evidence','evil','evolve','exact',
  'example','excess','exchange','excite','exclude','excuse','execute','exercise','exhaust','exhibit',
  'exile','exist','exit','exotic','expand','expect','expire','explain','expose','express',
  'extend','extra','eye','eyebrow','fabric','face','faculty','fade','faint','faith',
  'fall','false','fame','family','famous','fan','fancy','fantasy','farm','fashion',
  'fat','fatal','father','fatigue','fault','favorite','feature','february','federal','fee',
  'feed','feel','female','fence','festival','fetch','fever','few','fiber','fiction',
  'field','figure','file','film','filter','final','find','fine','finger','finish',
  'fire','firm','fiscal','fish','fit','fitness','fix','flag','flame','flash',
  'flat','flavor','flee','flight','flip','float','flock','floor','flower','fluid',
  'flush','fly','foam','focus','fog','foil','fold','follow','food','foot',
  'force','forest','forget','fork','fortune','forum','forward','fossil','foster','found',
  'fox','fragile','frame','frequent','fresh','friend','fringe','frog','front','frost',
  'frown','frozen','fruit','fuel','fun','funny','furnace','fury','future','gadget',
  'gain','galaxy','gallery','game','gap','garage','garbage','garden','garlic','garment',
  'gas','gasp','gate','gather','gauge','gaze','general','genius','genre','gentle',
  'genuine','gesture','ghost','giant','gift','giggle','ginger','giraffe','girl','give',
  'glad','glance','glare','glass','glide','glimpse','globe','gloom','glory','glove',
  'glow','glue','goat','goddess','gold','good','goose','gorilla','gospel','gossip',
  'govern','gown','grab','grace','grain','grant','grape','grass','gravity','great',
  'green','grid','grief','grit','grocery','group','grow','grunt','guard','guess',
  'guide','guilt','guitar','gun','gym','habit','hair','half','hammer','hamster',
  'hand','happy','harbor','hard','harsh','harvest','hat','have','hawk','hazard',
  'head','health','heart','heavy','hedgehog','height','hello','helmet','help','hen',
  'hero','hip','hire','history','hobby','hockey','hold','hole','holiday','hollow',
  'home','honey','hood','hope','horn','horror','horse','hospital','host','hotel',
  'hour','hover','hub','huge','human','humble','humor','hundred','hungry','hunt',
  'hurdle','hurry','hurt','husband','hybrid','ice','icon','idea','identify','idle',
  'ignore','ill','illegal','image','imitate','immense','immune','impact','impose','improve',
  'impulse','inch','include','income','increase','index','indicate','indoor','industry','infant',
  'inflict','inform','initial','inject','inmate','inner','innocent','input','inquiry','insane',
  'insect','inside','inspire','install','intact','interest','into','invest','invite','involve',
  'iron','island','isolate','issue','item','ivory','jacket','jaguar','jar','jazz',
  'jealous','jeans','jelly','jewel','job','join','joke','journey','joy','judge',
  'juice','jungle','junior','junk','just','kangaroo','keen','keep','ketchup','key',
  'kick','kid','kidney','kind','kingdom','kiss','kit','kitchen','kite','kitten',
  'kiwi','knee','knife','knock','know','lab','label','labor','ladder','lady',
  'lake','lamp','language','laptop','large','later','latin','laugh','laundry','lava',
  'law','lawn','lawsuit','layer','lazy','leader','leaf','learn','leave','lecture',
  'left','leg','legal','legend','leisure','lemon','lend','length','lens','leopard',
  'lesson','letter','level','liberty','library','license','life','lift','light','like',
  'limb','limit','link','lion','liquid','list','little','live','lizard','load',
  'loan','lobster','local','lock','logic','lonely','long','loop','lottery','loud',
  'lounge','love','loyal','lucky','luggage','lumber','lunar','lunch','luxury','lyrics',
  'machine','mad','magic','magnet','maid','mail','main','major','make','mammal',
  'man','manage','mandate','mango','mansion','manual','maple','marble','march','margin',
  'marine','market','marriage','mask','mass','master','match','material','math','matrix',
  'matter','maximum','maze','meadow','mean','measure','meat','mechanic','medal','media',
  'melody','melt','member','memory','mention','menu','mercy','merge','merit','merry',
  'mesh','message','metal','method','middle','midnight','milk','million','mimic','mind',
  'minimum','minor','minute','miracle','mirror','misery','miss','mistake','mix','mixed',
  'mixture','mobile','model','modify','mom','moment','monitor','monkey','monster','month',
  'moon','moral','more','morning','mosquito','mother','motion','motor','mountain','mouse',
  'move','movie','much','muffin','mule','multiply','muscle','museum','mushroom','music',
  'must','mutual','myself','mystery','myth','naive','name','napkin','narrow','nasty',
  'nation','nature','near','neck','need','negative','neglect','neither','nephew','nerve',
  'nest','net','network','neutral','never','news','next','nice','night','noble',
  'noise','nominee','normal','north','nose','notable','nothing','notice','novel','now',
  'nuclear','number','nurse','nut','oak','obey','object','oblige','obscure','observe',
  'obtain','obvious','occur','ocean','october','odor','off','offer','office','often',
  'oil','okay','old','olive','olympic','omit','once','one','onion','online',
  'only','open','opera','opinion','oppose','option','orange','orbit','orchard','order',
  'ordinary','organ','orient','original','orphan','ostrich','other','outdoor','outer','output',
  'outside','oval','oven','over','own','owner','oxygen','oyster','ozone','pact',
  'paddle','page','pair','palace','palm','panda','panel','panic','panther','paper',
  'parade','parent','park','parrot','party','pass','patch','path','patient','patrol',
  'pattern','pause','pave','payment','peace','peanut','pear','peasant','pelican','pen',
  'penalty','pencil','people','pepper','perfect','permit','person','pet','phone','photo',
  'phrase','physical','piano','picnic','picture','piece','pig','pigeon','pill','pilot',
  'pink','pioneer','pipe','pistol','pitch','pizza','place','planet','plastic','plate',
  'play','please','pledge','pluck','plug','plunge','poem','poet','point','polar',
  'pole','police','pond','pony','pool','popular','portion','pose','position','possible',
  'post','potato','pottery','poverty','powder','power','practice','praise','predict','prefer',
  'prepare','present','pretty','prevent','price','pride','primary','print','priority','prison',
  'private','prize','problem','process','produce','profit','program','project','promote','proof',
  'property','prosper','protect','proud','provide','public','pudding','pull','pulp','pulse',
  'pumpkin','punch','pupil','puppy','purchase','purity','purpose','purse','push','put',
  'puzzle','pyramid','quality','quantum','quarter','question','quick','quit','quiz','quote',
  'rabbit','raccoon','race','rack','radar','radio','raft','rage','rail','rain',
  'raise','rally','ramp','ranch','random','range','rapid','rare','rate','rather',
  'raven','raw','razor','ready','real','reason','rebel','rebuild','recall','receive',
  'recipe','record','recycle','reduce','reflect','reform','region','regret','regular','reject',
  'relax','release','relief','rely','remain','remember','remind','remove','render','renew',
  'rent','reopen','repair','repeat','replace','report','require','rescue','resemble','resist',
  'resource','response','result','retire','retreat','return','reunion','reveal','review','reward',
  'rhythm','rib','ribbon','rice','rich','ride','ridge','rifle','right','rigid',
  'ring','riot','ripple','risk','ritual','rival','river','road','roast','robot',
  'robust','rocket','romance','roof','rookie','room','rose','rotate','rough','round',
  'route','royal','rubber','rude','rug','rule','run','runway','rural','sad',
  'saddle','sadness','safe','sail','salad','salmon','salon','salt','salute','same',
  'sample','sand','satisfy','satoshi','sauce','sausage','save','say','scale','scan',
  'scare','scatter','scene','scheme','school','science','scissors','scorpion','scout','scrap',
  'screen','script','scrub','sea','search','season','seat','second','secret','section',
  'security','seed','seek','segment','select','sell','seminar','senior','sense','sentence',
  'series','service','session','settle','setup','seven','shadow','shaft','shallow','share',
  'shed','shell','sheriff','shield','shift','shine','ship','shiver','shock','shoe',
  'shoot','shop','short','shoulder','shove','shrimp','shrug','shuffle','shy','sibling',
  'sick','side','siege','sight','sign','silent','silk','silly','silver','similar',
  'simple','since','sing','siren','sister','situate','six','size','skate','sketch',
  'ski','skill','skin','skirt','skull','slab','slam','sleep','slender','slice',
  'slide','slight','slim','slogan','slot','slow','slush','small','smart','smile',
  'smoke','smooth','snack','snake','snap','sniff','snow','soap','soccer','social',
  'sock','soda','soft','solar','soldier','solid','solution','solve','someone','song',
  'soon','sorry','sort','soul','sound','soup','source','south','space','spare',
  'spatial','spawn','speak','special','speed','spell','spend','sphere','spice','spider',
  'spike','spin','spirit','split','sponsor','spoon','sport','spot','spray','spread',
  'spring','spy','square','squeeze','squirrel','stable','stadium','staff','stage','stairs',
  'stamp','stand','start','state','stay','steak','steel','stem','step','stereo',
  'stick','still','sting','stock','stomach','stone','stool','story','stove','strategy',
  'street','strike','strong','struggle','student','stuff','stumble','style','subject','submit',
  'subway','success','such','sudden','suffer','sugar','suggest','suit','summer','sun',
  'sunny','sunset','super','supply','supreme','sure','surface','surge','surprise','surround',
  'survey','suspect','sustain','swallow','swamp','swap','swarm','swear','sweet','swim',
  'swing','switch','sword','symbol','symptom','syrup','system','table','tackle','tag',
  'tail','talent','talk','tank','tape','target','task','taste','tattoo','taxi',
  'teach','team','tell','ten','tenant','tennis','tent','term','test','text',
  'thank','that','theme','then','theory','there','they','thing','this','thought',
  'three','thrive','throw','thumb','thunder','ticket','tide','tiger','tilt','timber',
  'time','tiny','tip','tired','tissue','title','toast','tobacco','today','toddler',
  'toe','together','toilet','token','tomato','tomorrow','tone','tongue','tonight','tool',
  'tooth','top','topic','topple','torch','tornado','tortoise','toss','total','tourist',
  'toward','tower','town','toy','track','trade','traffic','tragic','train','transfer',
  'trap','trash','travel','tray','treat','tree','trend','trial','tribe','trick',
  'trigger','trim','trip','trophy','trouble','truck','true','truly','trumpet','trust',
  'truth','try','tube','tuna','tunnel','turkey','turn','turtle','twelve','twenty',
  'twice','twin','twist','two','type','typical','ugly','umbrella','unable','unaware',
  'uncle','uncover','under','undo','unfair','unfold','unhappy','uniform','union','unique',
  'unit','universe','unknown','unlock','until','unusual','unveil','update','upgrade','uphold',
  'upon','upper','upset','urban','usage','use','used','useful','useless','usual',
  'utility','vacant','vacuum','vague','valid','valley','valve','van','vanish','vapor',
  'various','vast','vault','vehicle','velvet','vendor','venture','venue','verb','verify',
  'version','very','vessel','veteran','viable','vibrant','vicious','victory','video','view',
  'village','vintage','violin','virtual','virus','visa','visit','visual','vital','vivid',
  'vocal','voice','void','volcano','volume','vote','voyage','wage','wagon','wait',
  'walk','wall','walnut','want','warfare','warm','warrior','wash','wasp','waste',
  'water','wave','way','wealth','weapon','wear','weasel','weather','web','wedding',
  'weekend','weird','welcome','well','west','wet','whale','what','wheat','wheel',
  'when','where','whip','whisper','wide','width','wife','wild','will','win',
  'window','wine','wing','wink','winner','winter','wire','wisdom','wise','wish',
  'witness','wolf','woman','wonder','wood','wool','word','work','world','worry',
  'worth','wrap','wreck','wrestle','wrist','write','wrong','yard','year','yellow',
  'you','young','youth','zebra','zero','zone','zoo',
]

function removeAmbiguous(charset: string): string {
  return charset.split('').filter(c => !AMBIGUOUS_CHARS.includes(c)).join('')
}

function generatePassword(
  length: number,
  options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean },
  excludeAmbiguous: boolean
): string {
  let chars = ''
  const enabledSets: string[] = []

  let up = CHARSETS.uppercase
  let lo = CHARSETS.lowercase
  let nu = CHARSETS.numbers
  let sy = CHARSETS.symbols

  if (excludeAmbiguous) {
    up = removeAmbiguous(up)
    lo = removeAmbiguous(lo)
    nu = removeAmbiguous(nu)
    sy = removeAmbiguous(sy)
  }

  if (options.uppercase) { chars += up; enabledSets.push(up) }
  if (options.lowercase) { chars += lo; enabledSets.push(lo) }
  if (options.numbers) { chars += nu; enabledSets.push(nu) }
  if (options.symbols) { chars += sy; enabledSets.push(sy) }
  if (!chars) { chars = lo; enabledSets.push(lo) }

  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  const result = Array.from(array, (v) => chars[v % chars.length])

  // Guarantee at least one character from each enabled set
  for (const set of enabledSets) {
    if (!result.some(c => set.includes(c))) {
      // Pick a random position and replace with a random char from missing set
      const posArr = new Uint32Array(1)
      crypto.getRandomValues(posArr)
      const pos = posArr[0] % length
      const charArr = new Uint32Array(1)
      crypto.getRandomValues(charArr)
      result[pos] = set[charArr[0] % set.length]
    }
  }

  // Shuffle (Fisher-Yates) to avoid positional bias from guarantees
  const shuffleArr = new Uint32Array(length)
  crypto.getRandomValues(shuffleArr)
  for (let i = result.length - 1; i > 0; i--) {
    const j = shuffleArr[i] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]]
  }

  return result.join('')
}

function generatePassphrase(wordCount: number, separator: string, capitalize: boolean, includeNumber: boolean): string {
  const array = new Uint32Array(wordCount)
  crypto.getRandomValues(array)
  const words = Array.from(array, (v) => WORDLIST[v % WORDLIST.length])
  if (capitalize) {
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1)
    }
  }
  if (includeNumber) {
    const posArr = new Uint32Array(1)
    crypto.getRandomValues(posArr)
    const pos = posArr[0] % words.length
    const digitArr = new Uint32Array(1)
    crypto.getRandomValues(digitArr)
    words[pos] = words[pos] + (digitArr[0] % 10)
  }
  return words.join(separator)
}

function getStrength(password: string): { label: string; percent: number; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 2) return { label: 'Weak', percent: 25, color: 'bg-red-500' }
  if (score <= 3) return { label: 'Fair', percent: 50, color: 'bg-yellow-500' }
  if (score <= 4) return { label: 'Good', percent: 75, color: 'bg-blue-500' }
  return { label: 'Strong', percent: 100, color: 'bg-green-500' }
}

function calcEntropy(mode: 'password' | 'passphrase', opts: {
  length?: number;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
  excludeAmbiguous?: boolean;
  wordCount?: number;
}): number {
  if (mode === 'passphrase') {
    return Math.floor((opts.wordCount || 4) * Math.log2(WORDLIST.length))
  }
  let charsetSize = 0
  let up = CHARSETS.uppercase
  let lo = CHARSETS.lowercase
  let nu = CHARSETS.numbers
  let sy = CHARSETS.symbols
  if (opts.excludeAmbiguous) {
    up = removeAmbiguous(up)
    lo = removeAmbiguous(lo)
    nu = removeAmbiguous(nu)
    sy = removeAmbiguous(sy)
  }
  if (opts.uppercase) charsetSize += up.length
  if (opts.lowercase) charsetSize += lo.length
  if (opts.numbers) charsetSize += nu.length
  if (opts.symbols) charsetSize += sy.length
  if (charsetSize === 0) charsetSize = lo.length
  return Math.floor((opts.length || 16) * Math.log2(charsetSize))
}

function crackTime(entropyBits: number): { label: string; color: string } {
  if (entropyBits <= 0) return { label: 'Instantly', color: 'text-red-500' }
  // 10 billion guesses/second, average case = half the keyspace
  const seconds = Math.pow(2, entropyBits) / 1e10 / 2
  if (seconds < 1) return { label: 'Instantly', color: 'text-red-500' }
  if (seconds < 60) return { label: `${Math.round(seconds)} seconds`, color: 'text-red-500' }
  const minutes = seconds / 60
  if (minutes < 60) return { label: `${Math.round(minutes)} minutes`, color: 'text-orange-500' }
  const hours = minutes / 60
  if (hours < 24) return { label: `${Math.round(hours)} hours`, color: 'text-orange-500' }
  const days = hours / 24
  if (days < 365) return { label: `${Math.round(days)} days`, color: 'text-yellow-500' }
  const years = days / 365
  if (years < 100) return { label: `${Math.round(years)} years`, color: 'text-blue-500' }
  if (years < 1_000_000) return { label: `${Math.round(years).toLocaleString()} years`, color: 'text-green-500' }
  return { label: 'Millions of years+', color: 'text-green-500' }
}

export default function PasswordGeneratorTool() {
  const [mode, setMode] = useState<'password' | 'passphrase'>('password')
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [passwords, setPasswords] = useState<string[]>([])

  // Passphrase options
  const [wordCount, setWordCount] = useState(4)
  const [separator, setSeparator] = useState('-')
  const [capitalizeWords, setCapitalizeWords] = useState(false)
  const [includeNumber, setIncludeNumber] = useState(false)

  const entropy = useMemo(() => {
    if (mode === 'passphrase') {
      return calcEntropy('passphrase', { wordCount })
    }
    return calcEntropy('password', { length, uppercase, lowercase, numbers, symbols, excludeAmbiguous })
  }, [mode, length, uppercase, lowercase, numbers, symbols, excludeAmbiguous, wordCount])

  const crack = useMemo(() => crackTime(entropy), [entropy])

  const generate = useCallback(() => {
    const result: string[] = []
    for (let i = 0; i < quantity; i++) {
      if (mode === 'passphrase') {
        result.push(generatePassphrase(wordCount, separator, capitalizeWords, includeNumber))
      } else {
        const opts = { uppercase, lowercase, numbers, symbols }
        result.push(generatePassword(length, opts, excludeAmbiguous))
      }
    }
    setPasswords(result)
  }, [mode, length, uppercase, lowercase, numbers, symbols, excludeAmbiguous, quantity, wordCount, separator, capitalizeWords, includeNumber])

  const allText = passwords.join('\n')

  return (
    <ToolPage
      title="Password Generator"
      description="Generate secure random passwords with customizable length and character sets."
      category="generators"
      categoryLabel="Generators"
      helpContent={
        <>
          <h2>What is a Password Generator?</h2>
          <p>
            A password generator creates random strings of characters that are designed to be extremely difficult for attackers to guess or crack through brute-force methods. Humans are notoriously bad at inventing passwords — we tend to reuse familiar words, add predictable numbers, and follow patterns that automated cracking tools exploit in seconds. A dedicated generator removes that human bias by using a cryptographically secure random number source to select each character independently, producing passwords with maximum entropy for their length.
          </p>

          <h2>How to Use This Tool</h2>
          <ol>
            <li>Set your desired <strong>password length</strong> using the slider. Security experts recommend at least 12–16 characters; longer is always better.</li>
            <li>Choose which <strong>character sets</strong> to include: uppercase letters, lowercase letters, numbers, and symbols. Enabling all four maximises the keyspace and produces the strongest passwords.</li>
            <li>Set the <strong>quantity</strong> if you need more than one password — you can generate up to 50 at once.</li>
            <li>Click <strong>Generate Password</strong>. Each password appears with a colour-coded strength indicator so you can judge its quality at a glance.</li>
            <li>Click the <strong>Copy</strong> button next to any password to send it to your clipboard, then paste it into your password manager or sign-up form.</li>
          </ol>

          <h2>When to Use a Password Generator</h2>
          <p>
            Use a generator every time you create a new account, rotate credentials, generate API keys, or set up database passwords. It is especially important for accounts that protect sensitive information — email, banking, cloud infrastructure, and admin panels. Generating passwords in bulk is handy when provisioning multiple test accounts or issuing temporary credentials to team members.
          </p>

          <h2>Tips and Best Practices</h2>
          <ul>
            <li><strong>Never reuse passwords.</strong> If one service is breached, attackers will try the same credentials on every other site — a technique called credential stuffing.</li>
            <li>Store generated passwords in a reputable <strong>password manager</strong> rather than in a spreadsheet, sticky note, or browser autofill alone.</li>
            <li>For passphrases (easier to type on mobile), consider combining four or more random dictionary words — but for maximum security per character, symbol-rich random strings are superior.</li>
            <li>This generator on utilsnow.com uses the <strong>Web Crypto API</strong> (<code>crypto.getRandomValues</code>), which is the same cryptographic primitive browsers use for TLS. Your passwords are never sent to a server.</li>
            <li>Enable <strong>two-factor authentication</strong> (2FA) wherever possible — even the strongest password benefits from an additional layer of security.</li>
          </ul>
        </>
      }
      faqs={[
        { question: 'How long should a strong password be?', answer: 'Security experts recommend at least 12-16 characters. Longer passwords with a mix of uppercase, lowercase, numbers, and symbols are exponentially harder to crack.' },
        { question: 'Are the generated passwords truly random?', answer: 'Yes. This tool uses the Web Crypto API (crypto.getRandomValues), which provides cryptographically secure random number generation built into your browser.' },
        { question: 'Are my generated passwords stored anywhere?', answer: 'No. Passwords are generated entirely in your browser and are never sent to any server. Once you close or refresh the page, they are gone unless you save them.' },
        { question: 'Why should I include symbols in my password?', answer: 'Adding symbols dramatically increases the number of possible combinations, making brute-force attacks much slower. A 12-character password with symbols is far stronger than one with only letters.' },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('password')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'password' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
            >
              Password
            </button>
            <button
              onClick={() => setMode('passphrase')}
              className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === 'passphrase' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
            >
              Passphrase
            </button>
          </div>

          {mode === 'password' ? (
            <>
              {/* Length Slider */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <label className="font-medium">Length</label>
                  <span className="text-muted-foreground">{length}</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={128}
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>8</span>
                  <span>128</span>
                </div>
              </div>

              {/* Character Set Checkboxes */}
              <div className="space-y-2">
                {[
                  { label: 'Uppercase (A-Z)', checked: uppercase, set: setUppercase },
                  { label: 'Lowercase (a-z)', checked: lowercase, set: setLowercase },
                  { label: 'Numbers (0-9)', checked: numbers, set: setNumbers },
                  { label: 'Symbols (!@#$...)', checked: symbols, set: setSymbols },
                ].map((opt) => (
                  <label key={opt.label} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={opt.checked} onChange={(e) => opt.set(e.target.checked)} className="rounded border-border" />
                    {opt.label}
                  </label>
                ))}
              </div>

              {/* Exclude Ambiguous */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  className="rounded border-border"
                />
                Exclude ambiguous (0OoIl1)
              </label>
            </>
          ) : (
            <>
              {/* Word Count */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <label className="font-medium">Word Count</label>
                  <span className="text-muted-foreground">{wordCount}</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={8}
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>3</span>
                  <span>8</span>
                </div>
              </div>

              {/* Separator */}
              <div>
                <label className="text-sm font-medium block mb-1.5">Separator</label>
                <div className="flex gap-2">
                  {[
                    { label: 'Hyphen', value: '-' },
                    { label: 'Space', value: ' ' },
                    { label: 'Period', value: '.' },
                    { label: 'Underscore', value: '_' },
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSeparator(s.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${separator === s.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Capitalize passphrase */}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={capitalizeWords} onChange={(e) => setCapitalizeWords(e.target.checked)} className="rounded border-border" />
                Capitalize words
              </label>

              {/* Include number */}
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={includeNumber} onChange={(e) => setIncludeNumber(e.target.checked)} className="rounded border-border" />
                Include number
              </label>
            </>
          )}

          {/* Entropy Display */}
          <div className="p-3 rounded-lg bg-muted flex items-center justify-between">
            <span className="text-sm font-medium">Entropy</span>
            <span className="text-sm font-mono text-muted-foreground">{entropy} bits</span>
          </div>

          {/* Crack Time Estimate */}
          <div className="p-3 rounded-lg bg-muted flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Crack Time
            </span>
            <span className={`text-sm font-semibold ${crack.color}`}>
              {crack.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Generate</label>
            <input
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-20 px-3 py-1.5 text-sm rounded-md border border-input bg-tool-bg focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-sm text-muted-foreground">{mode === 'passphrase' ? 'passphrase(s)' : 'password(s)'}</span>
          </div>

          <button onClick={generate} className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Generate {mode === 'passphrase' ? 'Passphrase' : 'Password'}{quantity > 1 ? 's' : ''}
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Generated {mode === 'passphrase' ? 'Passphrases' : 'Passwords'}</span>
            <div className="flex gap-1.5">
              {passwords.length > 0 && <CopyButton text={allText} />}
              {passwords.length > 1 && <DownloadButton content={allText} filename="passwords.txt" />}
              {passwords.length > 0 && <ClearButton onClear={() => setPasswords([])} />}
            </div>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {passwords.length === 0 && (
              <div className="p-4 rounded-lg bg-muted text-center text-sm text-muted-foreground">
                Click Generate to create {mode === 'passphrase' ? 'passphrases' : 'passwords'}
              </div>
            )}
            {passwords.map((pw, i) => {
              const strength = getStrength(pw)
              return (
                <div key={i} className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between mb-1.5">
                    <code className="text-sm font-mono break-all flex-1 mr-2">{pw}</code>
                    <CopyButton text={pw} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted-foreground/20">
                      <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${strength.percent}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{strength.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </ToolPage>
  )
}
