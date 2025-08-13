const compatibilityDataRO = {
  astrology: {
    general: {
      "Berbec": "Berbecul este un semn de foc, creat la începutul zodiacului. Persoanele născute sub acest semn sunt adesea energice, pasionate și dornice de aventură. În dragoste, Berbecul tinde să fie direct și deschis, ceea ce face relațiile interesante. Cu toate acestea, pot fi impulsivi atunci când vine vorba de cheltuieli, ceea ce poate crea provocări în gestionarea banilor.",
      "Taur": "Taurul este un semn de pământ, stabil și practic. Persoanele născute sub acest semn sunt adesea determinate, loiale și caută confort în viața lor. În dragoste, Taurul preferă să construiască relații solide și durabile, iar în gestionarea banilor este mai prudent și mai atent. Aceste trăsături influențează profund cum se descurcă în relațiile lor romantice și cum își gestionează resursele financiare.",
      "Gemeni": "Gemenii sunt un semn de aer, caracterizat prin comunicare, versatilitate și curiozitate. Persoanele născute sub acest semn sunt adesea sociabile și dornice să exploreze idei și perspective noi. În dragoste, Gemenii caută conexiuni stimulante și variate, dar pot fi și indeciși. În gestionarea banilor, au tendința de a cheltui impulsiv, însă pot fi ingenioși în găsirea de soluții financiare creative.",
      "Rac": "Racul este un semn de apă, caracterizat prin emotivitate, sensibilitate și intuiție. Persoanele născute sub acest semn sunt adesea empatice și caută conexiuni profunde în viața lor personală. În dragoste, Racul tinde să fie protector și loial, dar poate fi și vulnerabil. În ceea ce privește gestionarea banilor, Racul este adesea prudent și preferă stabilitatea financiară."
      ,
      "Leu": "Leul este un semn de foc, cunoscut pentru carismă, generozitate și dorința de a fi în centrul atenției. Persoanele născute sub acest semn sunt pasionale, încrezătoare și adesea își asumă rolul de lider în relații. În dragoste, Leul caută atenție și afecțiune, iar în gestionarea finanțelor poate fi impulsiv, ceea ce poate duce uneori la neînțelegeri.",
      "Fecioară": "Fecioara este un semn de pământ, cunoscut pentru pragmatism, atenție la detalii și natură analitică. Persoanele născute sub acest semn sunt organizate, muncitoare și caută stabilitate în relații. În dragoste, Fecioara este loială și dedicată, dar poate fi critică față de sine și față de partener. Financiar, Fecioara este prudentă și preferă planificarea înaintea deciziilor."
      ,
      "Balanță": "Balanța este un semn de aer, caracterizat prin dorința de a crea echilibru, armonie și relații sănătoase. Persoanele născute sub acest semn sunt sociabile, romantice și apreciază frumosul. În dragoste, Balanța caută conexiuni profunde și echilibru, fiind adesea foarte dedicate partenerilor lor. În ceea ce privește gestionarea finanțelor, Balanța poate fi impulsivă la cheltuieli, dar își dorește să găsească un echilibru financiar.",
      "Vărsător": "Vărsătorul este un semn de aer, cunoscut pentru natura sa inovatoare și originală. Cei născuți sub acest semn sunt adesea vizionari, sociabili și independenți. În dragoste, caută conexiuni stimulante care le permit exprimarea creativității, dar pot evita angajamentele profunde. Financiar, sunt mai puțin interesați de lucruri materiale, însă ingenioși în a găsi modalități originale de a face bani.",
      "Capricorn": "Capricornul este un semn de pământ, recunoscut pentru ambiție, disciplină și pragmatism. Cei născuți sub acest semn sunt orientați spre obiective și perseverenți. În dragoste, Capricornul caută stabilitate și angajament, fiind loial și responsabil. Financiar, este organizat și prudent, cu abilități foarte bune de gestionare a banilor.",
      "Pești": "Peștii sunt un semn de apă, cunoscut pentru sensibilitate, empatie și natura visătoare. Cei născuți sub acest semn au o intuiție puternică și înțeleg profund emoțiile celorlalți. În dragoste, caută conexiuni autentice și profunde, dar pot idealiza relațiile, ceea ce le poate îngreuna raportarea la realitate. Financiar, pot fi mai visători și mai puțin practici, însă aduc o abordare creativă în gestionarea resurselor."
    },
    elements: {
      "Foc-Foc": {
        dragoste: "O relație plină de energie și pasiune, cu mult entuziasm reciproc.",
        finante: "Competiția poate impulsiona succesul, dar și cheltuieli impulsive.",
        scor: 85
      },
      "Foc-Aer": {
        dragoste: "Aerul alimentează focul, legătură pasională și creativă.",
        finante: "Idei ambițioase, dar atenție la consecvență în execuție.",
        scor: 90
      },
      "Pământ-Apă": {
        dragoste: "Armonie hrănită de emoții profunde și suport reciproc.",
        finante: "Practic + intuitiv = colaborare reușită în gestionarea resurselor.",
        scor: 75
      }
    },
    signs: {
      // Berbec (Aries) x 12
      "Berbec-Berbec": { scor: 80, dragoste: "Relația este plină de pasiune și energie. Ambii parteneri se bucură de spontaneitate și aventură, dar pot exista momente de rivalitate. Este important să își susțină reciproc dorințele și să comunice deschis pentru a evita conflictele.", finante: "Amândoi pot fi impulsivi cu cheltuielile, așa că este esențial să își stabilească un buget comun pentru a evita întâmpinarea dificultăților financiare." },
      "Berbec-Taur": { scor: 60, dragoste: "Berbecul aduce energie iar Taurul stabilitate în relație, dar pot exista neînțelegeri din cauza diferențelor lor. Berbecul vrea libertate, iar Taurul preferă stabilitatea. Este important să se respecte și să se adapteze unul la stilul de viață al celuilalt.", finante: "Taurul este mai prudent cu banii, în timp ce Berbecul este mai impulsiv. Trebuie să colaboreze și să afle cum să cheltuie și să economisească împreună.", prietenie: "Berbecul aduce energie și entuziasm, Taurul preferă stabilitatea – prietenie interesantă, uneori provocatoare.", spiritualitate: "Berbecul mai impulsiv în căutările spirituale, Taurul caută rădăcini și stabilitate în credințe.", activitati: "Berbecul preferă aventuri; Taurul se bucură de plăceri simple, precum mesele împreună." },
      "Berbec-Gemeni": { scor: 85, dragoste: "Această relație este plină de distracție și entuziasm! Gemenii îi oferă Berbecului varietate și conversații interesante, iar Berbecul îi stimulează pe Gemenii să fie mai curajoși. Amândoi apreciază aventura și se înțeleg foarte bine.", finante: "Berbecul tinde să fie impulsiv, iar Gemenii pot fi indeciși. Este important să discute despre finanțe și să stabilească un buget pentru a evita cheltuielile necontrolate.", prietenie: "Combinație plină de distracție și spontaneitate, cu chimie excelentă.", spiritualitate: "Ambele zodii pot explora concepte noi; Berbecul e direct, Gemenii analitici.", activitati: "Plăcere pentru activități sociale și aventuri: călătorii, sporturi." },
      "Berbec-Rac": { scor: 55, dragoste: "Interacțiunea poate fi o combinație complicată, deoarece Berbecul este energic, iar Racul este mai sensibil. Racul poate simți că Berbecul este copleșitor, și este important ca Berbecul să fie atent la nevoile emoționale ale Racului.", finante: "Racul preferă să economisească, în timp ce Berbecul este mai predispus să cheltuie. Este esențial să comunice deschis despre așteptările financiare și să găsească un echilibru.", prietenie: "Poate fi complicată: Berbec energic, Rac sensibil.", spiritualitate: "Racul caută conexiuni emoționale profunde; Berbecul poate fi mai puțin interesat.", activitati: "Racul preferă seri acasă; Berbecul caută aventuri." },
      "Berbec-Leu": { scor: 90, dragoste: "Aceasta este o combinație extrem de puternică! Ambele zodii sunt pline de viață și iubesc aventurile. Se admiră reciproc și se sprijină în aspirațiile lor. Pasiunea dintre ei este evidentă și își doresc să se distingă în fața celorlalți.", finante: "Amândouă zodiile pot fi generoase, dar pot încerca uneori să cheltuie excesiv. Este bine să colaboreze la gestionarea banilor pentru a evita problemele financiare.", prietenie: "Combinație puternică, plină de energie și sprijin reciproc.", spiritualitate: "Ambele pot fi pasionate în căutările lor; viziuni similare.", activitati: "Dragoste pentru distracție și aventuri." },
      "Berbec-Fecioară": { scor: 50, dragoste: "Această combinație poate fi provocatoare. Berbecul este energic și impulsiv, pe când Fecioara este mai analitică și practică. Aceasta poate duce la neînțelegeri, dar dacă Berbecul învață să aprecieze abordarea Fecioarei, pot găsi un echilibru.", finante: "Fecioara va dori economii, iar Berbecul va fi mai aventuros. Este crucial să discute despre cheltuieli și să ajungă la un compromis.", prietenie: "Poate fi provocatoare: Berbec impulsiv, Fecioară analitică.", spiritualitate: "Fecioara caută ordine; Berbecul preferă explorarea liberă.", activitati: "Berbecul preferă activități energice; Fecioara activități mai calme." },
      "Berbec-Balanță": { scor: 60, dragoste: "Această relație trebuie să fie echilibrată. Berbecul aduce spontaneitate, iar Balanța caută armonie. Cele două semne trebuie să găsească un punct comun între impulsivitate și stabilitate.", finante: "Balanța poate dori să economisească, în timp ce Berbecul poate avea tendința de a cheltui. Este important să fie pe aceeași lungime de undă atunci când vine vorba de bani." },
      "Berbec-Scorpion": { scor: 70, dragoste: "Această relație este plină de intensitate. Ambele zodii aduc emoții profunde și pasiune în relație. Trebuie să construiască o încredere solidă pentru a face față provocărilor.", finante: "Berbecul poate fi impulsiv cu banii, în timp ce Scorpionul este mai precaut. Este esențial să comunice și să se sprijine reciproc în gestionarea finanțelor." },
      "Berbec-Săgetător": { scor: 95, dragoste: "Aceasta este o combinație excelentă! Amândouă zodiile iubesc aventura și libertatea, ceea ce le permite să se înțeleagă repede. Se simt bine împreună și își împărtășesc dorințele.", finante: "Săgetătorul este optimist în privința banilor, iar Berbecul poate lua decizii rapide, dar amândouă zodiile lucrează bine împreună pentru a-și atinge obiectivele financiare." },
      "Berbec-Capricorn": { scor: 55, dragoste: "Această relație poate necesita adaptare. Berbecul este impulsiv, iar Capricornul își dorește stabilitate. Berbecul trebuie să respecte limitele Capricornului, iar acesta din urmă să fie deschis la spontaneitate.", finante: "Capricornul este foarte prudent cu banii, ceea ce poate provoca tensiuni cu Berbecul. Comunicarea este cheia pentru a evita conflictele financiare." },
      "Berbec-Vărsător": { scor: 80, dragoste: "Aceștia sunt atât de asemănători în dorința de a explora și de a trăi în mod creativ. Atât Berbecul cât și Vărsătorul iubesc să discute idei și să se înțeleagă reciproc.", finante: "Vărsătorul poate aduce idei inovatoare pentru investiții, iar Berbecul va contribui cu impulsivitate. Este important să colaboreze la planificarea financiară." },
      "Berbec-Pești": { scor: 65, dragoste: "Aceasta poate fi o combinație interesantă; Berbecul este energic, iar Peștii sunt visători. Berbecul ar trebui să fie mai atent la sensibilitatea Peștilor.", finante: "Peștii pot fi mai puțin interesați de aspectele financiare, în timp ce Berbecul tinde să cheltuie impulsiv. O discuție deschisă despre bani este esențială pentru a-și organiza cheltuielile." },

      // Taur x 12 – actualizat conform materialului furnizat
      "Taur-Berbec": { 
        scor: 60, 
        dragoste: "Această relație poate fi provocatoare, deoarece Taurul este mai stabil, iar Berbecul este impulsiv. Berbecul aduce energie, dar Taurul preferă rutina. Înțelegerea reciprocă este crucială în această combinație.", 
        finante: "Taurul este mai conservator cu banii, în timp ce Berbecul poate cheltui impulsiv. Trebuie să discute deschis despre finanțe pentru a evita conflictele." 
      },
      "Taur-Taur": { 
        scor: 85, 
        dragoste: "Două persoane Taur formează o relație extrem de stabilă și confortabilă. Amândouă apreciază loialitatea și protejarea relației, ceea ce le face să fie foarte compatibile.", 
        finante: "Amândouă zodiile au o abordare prudentă a banilor și preferă să economisească. Aceasta le oferă stabilitate financiară, dar trebuie să se asigure că nu devin prea rigide sau conservatoare." 
      },
      "Taur-Gemeni": { 
        scor: 65, 
        dragoste: "Această relație poate fi interesantă datorită diferențelor dintre cele două zodii. Taurul preferă stabilitatea, iar Gemenii caută varietate. Taurul poate învăța să se deschidă la noi experiențe, iar Gemenii pot învăța să aprecieze confortul.", 
        finante: "Taurul va dori să economisească, în timp ce Gemenii pot fi mai impulsivi. Comunicarea despre cheltuieli este esențială pentru a evita conflictele." 
      },
      "Taur-Rac": { 
        scor: 90, 
        dragoste: "Această combinație este extrem de compatibilă. Racul aduce emoție și grijă, iar Taurul oferă siguranță și stabilitate, ceea ce îi face una dintre cele mai armonioase cupluri.", 
        finante: "Ambele zodii sunt prudente cu banii, ceea ce le facilitează construirea unui viitor financiar stabil. Împreună, vor lua decizii financiare înțelepte." 
      },
      "Taur-Leu": { 
        scor: 55, 
        dragoste: "Leul aduce energie și va dori să fie în centrul atenției, în timp ce Taurul este mai reținut. Pot apărea tensiuni din cauza diferențelor de personalitate, dar pot lucra împreună dacă își respectă nevoile.", 
        finante: "Leul poate cheltui mai mult, iar Taurul va dori să economisească. Este important să găsească un echilibru și să comunice despre obiectivele financiare." 
      },
      "Taur-Fecioară": { 
        scor: 80, 
        dragoste: "Această relație este bazată pe stabilitate și respect. Ambele zodii sunt realiste și caută să se sprijine reciproc, construind o legătură solidă.", 
        finante: "Fecioara este atentă și analitică, iar Taurul este practic. Împreună, vor lua decizii financiare înțelepte și vor gestiona banii cu succes." 
      },
      "Taur-Balanță": { 
        scor: 70, 
        dragoste: "Balanța aduce o latură artistică și sociabilă în viața Taurului, care poate fi uneori mai rezervat. Această dinamică poate aduce un echilibru frumos în relație.", 
        finante: "Balanța caută armonie și preferă economiile, în vreme ce Taurul este mai tradițional. Comunicarea este esențială pentru a-și îmbina stilurile de a gestiona banii." 
      },
      "Taur-Scorpion": { 
        scor: 75, 
        dragoste: "Această combinație poate fi intensă. Scorpionul este pasional, iar Taurul oferă stabilitate. Ambele semne trebuie să găsească un echilibru între nevoile emoționale și cele practice.", 
        finante: "Taurul este prudent, iar Scorpionul poate fi mai riscant în privința cheltuielilor. Este important să găsească o abordare comună pentru banii lor." 
      },
      "Taur-Săgetător": { 
        scor: 60, 
        dragoste: "Această relație poate fi provocatoare, deoarece Săgetătorul este aventuros și liber, pe când Taurul preferă stabilitatea. Este necesar ca ambii să respecte nevoile și forma lor de viață.", 
        finante: "Săgetătorul este mai predispus la cheltuieli impulsive, în timp ce Taurul preferă economiile. Comunicarea este esențială pentru a evita conflictele legate de bani." 
      },
      "Taur-Capricorn": { 
        scor: 90, 
        dragoste: "Această combinație este excelentă! Ambele zodii sunt conducătoare și orientate spre succes. Se sprijină reciproc și construiesc o legătură puternică bazată pe responsabilitate.", 
        finante: "Ambii sunt foarte practici și atenți cu banii, ceea ce le permite să construiască o bază financiară solidă și să economisească împreună." 
      },
      "Taur-Vărsător": { 
        scor: 60, 
        dragoste: "Această relație poate fi neobișnuită, deoarece Vărsătorul aduce idei noi și o gândire excentrică, în timp ce Taurul este mai tradițional. Aceasta poate aduce atât provocări, cât și oportunități de creștere.", 
        finante: "Vărsătorul poate fi mai experimentat în privința cheltuielilor, în vreme ce Taurul este mai prudent. Trebuie să comunice deschis pentru a se înțelege în privința banilor." 
      },
      "Taur-Pești": { 
        scor: 75, 
        dragoste: "Această combinație poate aduce o legătură emoțională profundă. Taurul oferă stabilitate, iar Peștii visează și aduc creativitate în relație.", 
        finante: "Peștii pot fi mai puțin interesați de administrarea banilor, iar Taurul poate avea tendința să cheltuie mai prudent. Discuțiile deschise sunt esențiale pentru a îmbina abordările lor financiare." 
      },
      // Gemeni x 12 – actualizat
      "Gemeni-Berbec": { scor: 85, dragoste: "Această combinație este plină de energie și entuziasm. Berbecul aduce pasiune, iar Gemenii oferă o comunicare deschisă și distracție. Împreună, se înțeleg excelent și se bucură de aventuri.", finante: "Berbecul tinde să fie impulsiv, iar Gemenii indeciși. Trebuie să colaboreze și să își stabilească un buget pentru a evita cheltuielile inutile." },
      "Gemeni-Taur": { scor: 65, dragoste: "Această relație poate fi interesantă, dar provocatoare. Taurul caută stabilitate, iar Gemenii preferă varietatea. Pot apărea neînțelegeri din cauza acestor diferențe.", finante: "Taurul este mai prudent cu banii și va dori să economisească, în timp ce Gemenii pot cheltui impulsiv. Este esențial să discute deschis despre finanțe pentru a găsi un echilibru." },
      "Gemeni-Gemeni": { scor: 80, dragoste: "Două persoane Gemeni formează o relație plină de distracție și conversații interesante. Ambele părți se completează reciproc și iubesc explorarea de noi idei.", finante: "Amândoi pot fi impulsivi cu cheltuielile, așa că este important să își stabilească un buget și să decidă împreună cum să își gestioneze banii." },
      "Gemeni-Rac": { scor: 55, dragoste: "Această relație poate fi complicată, deoarece Racul este mai emoțional, iar Gemenii sunt mai raționali. Racul poate simți că Gemenii sunt insuficient de dedicați, iar Gemenii pot considera că Racul este prea emotiv.", finante: "Racul preferă economisirea, iar Gemenii pot fi mai impulsivi. Comunicația deschisă despre bani este esențială pentru a evita conflictele." },
      "Gemeni-Leu": { scor: 75, dragoste: "Această combinație este vibrantă și plină de viață! Gemenii aduc varietate, iar Leul aduce carismă, ceea ce duce la o relație interesantă și plină de distracție.", finante: "Leul este mai generos, iar Gemenii pot cheltui impulsiv. Este bine să stabilească un buget pentru a menține un echilibru financiar." },
      "Gemeni-Fecioară": { scor: 60, dragoste: "Fecioara este practică, în vreme ce Gemenii sunt mai ușor de distras. Diferența poate duce la neînțelegeri, dar dacă ambele zodii sunt dispuse să colaboreze, pot învăța una de la alta.", finante: "Fecioara tinde să fie prudentă, iar Gemenii mai impulsivi. Este important să găsească un mod comun de a gestiona banii." },
      "Gemeni-Balanță": { scor: 90, dragoste: "Această combinație este extrem de compatibilă! Ambele zodii sunt sociabile și adoră să socializeze. Se înțeleg bine și se sprijină reciproc în relațiile lor.", finante: "Ambele zodii sunt creative și pot găsi soluții financiare inovatoare. Comunicarea este cheia pentru a menține echilibrul financiar." },
      "Gemeni-Scorpion": { scor: 55, dragoste: "Această relație poate fi intensă, cu Scorpionul aducând profunzime, iar Gemenii aduc distracție. Pot apărea conflicte din cauza diferențelor de personalitate.", finante: "Scorpionul poate fi mai riscant în abordarea cheltuielilor, în timp ce Gemenii pot fi indeciși. Este important să ajungă la un acord în privința banilor." },
      "Gemeni-Săgetător": { scor: 95, dragoste: "Aceasta este o combinație excelentă! Ambele zodii iubesc aventura și libertatea. Se simt bine împreună și își sprijină reciproc dorințele de explorare.", finante: "Ambele zodii sunt creative în gestionarea banilor, dar trebuie să se asigure că nu cheltuie prea mult impulsiv." },
      "Gemeni-Capricorn": { scor: 50, dragoste: "Această relație poate necesita adaptare. Capricornul este mai serios și disciplinat, în timp ce Gemenii sunt mai lejeri. Respectul reciproc este esențial pentru armonie.", finante: "Capricornul este mai prudent, iar Gemenii pot fi mai impulsivi. Comunicarea este importantă pentru a se înțelege în privința banilor." },
      "Gemeni-Vărsător": { scor: 90, dragoste: "Această relație este fantastică! Ambele zodii iubesc libertatea, inovația și ideile noi. Vor avea multe conversații interesante și pot dezvolta o legătură profundă.", finante: "Împreună, pot găsi modalități creative de a gestiona banii și își vor sprijini reciproc inițiativele financiare." },
      "Gemeni-Pești": { scor: 75, dragoste: "Această combinație poate fi interesantă. Gemenii sunt mai raționali, în timp ce Peștii sunt visători. Gemenii pot învăța multe de la Pești și viceversa.", finante: "Peștii pot avea o abordare mai puțin practică a banilor, iar Gemenii sunt mai impulsivi. O discuție deschisă despre bani este esențială pentru a-și organiza cheltuielile." },
      // Rac x 12 – actualizat
      "Rac-Berbec": { scor: 55, dragoste: "Această relație poate fi provocatoare, deoarece Racul este mai sensibil, iar Berbecul este impulsiv. Racul poate simți că Berbecul nu este suficient de atent la nevoile sale emoționale, iar Berbecul poate considera că Racul este prea emotiv.", finante: "Racul este prudent cu banii, în timp ce Berbecul poate cheltui impulsiv. Este important să comunice deschis pentru a evita neînțelegerile financiare." },
      "Rac-Taur": { scor: 90, dragoste: "Această combinație este extrem de compatibilă! Ambele zodii caută stabilitate și securitate emoțională. Racul aduce emoții profunde, iar Taurul oferă sprijin practic.", finante: "Ambele zodii sunt prudente cu banii, ceea ce le permite să construiască o bază financiară solidă. Colaborarea în gestionarea resurselor este cheia succesului." },
      "Rac-Gemeni": { scor: 55, dragoste: "Această relație poate fi complicată, deoarece Racul este mai emoțional, iar Gemenii sunt mai raționali și indeciși. Racul poate simți că Gemenii nu sunt suficient de dedicați, iar Gemenii pot considera că Racul este prea sensibil.", finante: "Racul preferă economiile, iar Gemenii pot cheltui impulsiv. O discuție deschisă despre situația financiară este esențială." },
      "Rac-Rac": { scor: 80, dragoste: "Două persoane Rac formează o relație profund emoțională și plină de afecțiune. Ambele părți sunt loiale și caută conexiuni profunde, ceea ce le face să se înțeleagă bine.", finante: "Ambele zodii sunt prudente cu banii și preferă economiile. Colaborarea în gestionarea finanțelor ajută la menținerea stabilității.", prietenie: "Relație profund emoțională și plină de afecțiune; loiale.", spiritualitate: "Caută conexiuni profunde; se înțeleg bine emoțional.", activitati: "Se bucură de timp împreună; activități casnice și intime." },
      "Rac-Leu": { scor: 60, dragoste: "Această combinație poate aduce tensiuni, deoarece Leul este mai extrovertit, iar Racul este mai rezervat. Racul poate simți că Leul este prea concentrat pe sine, iar Leul poate crede că Racul este prea dependent.", finante: "Leul este mai generos, în timp ce Racul preferă stabilitatea. Este important să găsească un echilibru în gestionarea banilor împreună.", prietenie: "Pot apărea tensiuni: Leu extrovertit, Rac rezervat.", spiritualitate: "Abordări spirituale diferite pot duce la neînțelegeri.", activitati: "Racul preferă liniștea; Leul caută distracție." },
      "Rac-Fecioară": { scor: 85, dragoste: "Ambele zodii sunt sensibile și apreciază stabilitatea. Fecioara este practică, iar Racul este emoțional, ceea ce le face să se completeze reciproc.", finante: "Fecioara tinde să fie analitică, iar Racul va aduce o abordare emoțională. Împreună, pot lua decizii financiare înțelepte.", prietenie: "Sensibili și complementari – se completează reciproc.", spiritualitate: "Racul aduce emoție unei abordări mai practice a Fecioarei.", activitati: "Se bucură de activități ce aduc confort și securitate." },
      "Rac-Balanță": { scor: 70, dragoste: "Balanța aduce un aer de rafinament și sociabilitate în viața Racului. Această combinație poate să se dezvolte într-o relație echilibrată, dar trebuie să comunice deschis despre nevoile lor.", finante: "Balanța are o abordare mai artistică, iar Racul mai practică. Este important să colaboreze în privința banilor și să ajungă la un consens.", prietenie: "Balanța aduce rafinament; comunicarea e esențială.", spiritualitate: "Necesită dialog deschis despre nevoile spirituale.", activitati: "Apreciază împreună activitățile sociale." },
      "Rac-Scorpion": { scor: 90, dragoste: "Această relație este profundă și intensă, ambele zodii având o legătură emoțională puternică. Se înțeleg bine și își oferă sprijin reciproc.", finante: "Ambele zodii sunt prudente, ceea ce le ajută să își gestioneze finanțele cu succes. Comunicarea deschisă le va aduce stabilitate." },
      "Rac-Săgetător": { scor: 50, dragoste: "Aceasta poate fi o combinație complicată, deoarece Săgetătorul este aventuros, iar Racul caută securitate. Săgetătorul poate simți că Racul este prea restrictiv, iar Racul se poate simți copleșit de natura liberă a Săgetătorului.", finante: "Săgetătorul este mai predispus să cheltuie impulsiv, în timp ce Racul preferă stabilitatea. Comunicarea este esențială pentru a evita conflictele." },
      "Rac-Capricorn": { scor: 80, dragoste: "Această combinație poate fi foarte puternică, deoarece Capricornul aduce stabilitate, în timp ce Racul oferă emoție. Împreună, pot construi o relație solidă bazată pe respect reciproc.", finante: "Capricornul este foarte prudent, iar Racul tinde să economisească. Colaborarea și strategia comună în gestionarea banilor sunt esențiale." },
      "Rac-Vărsător": { scor: 55, dragoste: "Această relație poate aduce diferențe, deoarece Vărsătorul este mai independent, iar Racul caută intimitate. Este esențial să vorbească deschis pentru a se înțelege reciproc.", finante: "Vărsătorul este mai riscant în gestionarea banilor, în timp ce Racul preferă abordarea practică. Trebuie să găsească o modalitate comună de a lua decizii financiare." },
      "Rac-Pești": { scor: 90, dragoste: "Această combinație este extrem de armonioasă. Ambele zodii sunt emoționale și empatice, ceea ce le ajută să se înțeleagă profund. Își sprijină reciproc visele și aspirațiile.", finante: "Ambele zodii sunt sensibile la bani; Racul este mai practic, iar Peștii pot fi mai visători. Este important să colaboreze și să își împărtășească viziunea asupra gestionării banilor." }
      ,
      // Leu x 12 – actualizat
      "Leu-Berbec": { scor: 90, dragoste: "Această combinație este extrem de dinamică! Ambele zodii sunt pasionate, energice și iubesc aventurile. Au o chimie fantastică și se susțin reciproc în aspirațiile lor.", finante: "Ambele pot fi impulsive în cheltuieli; stabiliți un buget comun pentru a evita problemele financiare.", prietenie: "Dinamică și plină de energie.", spiritualitate: "Caută să își îmbogățească împreună parcursul spiritual.", activitati: "Aventuri și activități sociale." },
      "Leu-Taur": { scor: 60, dragoste: "Relație cu provocări: Taurul caută stabilitate, iar Leul dorește să strălucească. Diferențele pot crea tensiuni dacă nu există adaptare.", finante: "Leul este predispus la cheltuieli, Taurul este conservator. Este esențial un compromis și discuții clare despre bani." },
      "Leu-Gemeni": { scor: 75, dragoste: "Plină de energie și distracție. Ambele zodii iubesc comunicarea și aventura, completându-se reciproc.", finante: "Gemenii pot fi indeciși, Leul vrea să cheltuie pentru a străluci. Un buget clar previne derapajele." },
      "Leu-Rac": { scor: 60, dragoste: "Poate fi tensionată: Leul e extrovertit, Racul e sensibil și rezervat. Comunicarea deschisă ajută la înțelegerea nevoilor.", finante: "Leul este generos, Racul prudent. Căutați echilibru în gestionarea banilor." },
      "Leu-Leu": { scor: 80, dragoste: "Pasiune și energie la cote înalte. Se admiră reciproc, dar poate apărea competiție – respectul reciproc este necesar.", finante: "Ambele pot fi generoase; atenție la cheltuieli excesive." },
      "Leu-Fecioară": { scor: 50, dragoste: "Relație mai complicată: Fecioara e practică și analitică, Leul e impulsiv. Fecioara poate percepe Leul ca prea dramatic.", finante: "Leul vrea să cheltuie, Fecioara preferă economiile. E vitală comunicarea pentru a evita conflictele.", prietenie: "Necesită adaptare – Fecioara practică vs. Leu expresiv.", spiritualitate: "Leul aduce pasiune, Fecioara structură.", activitati: "Găsesc echilibru între plăceri și activități." },
      "Leu-Balanță": { scor: 85, dragoste: "Foarte compatibili! Balanța aduce echilibru și rafinament, Leul oferă energie și pasiune. Formează o echipă puternică și distractivă.", finante: "Ambele apreciază estetica și pot cheltui impulsiv; gestionați banii împreună cu reguli clare." },
      "Leu-Scorpion": { scor: 65, dragoste: "Intensă și provocatoare. Leul oferă energie, Scorpionul aduce profunzime; respectați emoțiile și nevoile.", finante: "Leul poate cheltui impulsiv, Scorpionul e mai controlat. E nevoie de compromis financiar." },
      "Leu-Săgetător": { scor: 95, dragoste: "Combinație minunată! Ambele zodii iubesc aventura și libertatea; se înțeleg excelent. Pasiune și distracție evidente.", finante: "Optimiști și creativi financiar; totuși, setați un buget pentru a evita impulsivitatea." },
      "Leu-Capricorn": { scor: 50, dragoste: "Necesită efort de adaptare: Capricornul e serios și disciplinat, Leul mai jucăuș. Fiți deschiși la nevoile celuilalt.", finante: "Capricornul e prudent, Leul tinde să cheltuie. Colaborați pentru o strategie financiară comună." },
      "Leu-Vărsător": { scor: 80, dragoste: "Aduce inovație și energie. Ambele sunt independente și își sprijină ideile creative. Relație plină de aventură.", finante: "Vărsătorul propune soluții inovatoare, Leul apreciază lucrurile frumoase – comunicați deschis despre cheltuieli." },
      "Leu-Pești": { scor: 70, dragoste: "Combinație interesantă: Leul oferă energie și putere, Peștii aduc creativitate și visare. Pot apărea neînțelegeri, dar pot crea ceva frumos.", finante: "Leul e impulsiv la cheltuieli, Peștii pot fi mai puțin practici. Discuțiile deschise despre bani sunt esențiale." },

      // Fecioară x 12 – actualizat
      "Fecioară-Berbec": { scor: 50, dragoste: "Combinație provocatoare: Berbecul este impulsiv și pasional, Fecioara practică și analitică. Pot apărea neînțelegeri din cauza stilurilor diferite.", finante: "Fecioara vrea o abordare organizată, Berbecul cheltuie impulsiv. Comunicați pentru a ajunge la un compromis." },
      "Fecioară-Taur": { scor: 85, dragoste: "Foarte compatibile: ambele caută stabilitate și securitate. Fecioara este meticuloasă, Taurul constant – împlinire emoțională.", finante: "Prudenți și orientați spre economii; pot construi un viitor financiar stabil împreună." },
      "Fecioară-Gemeni": { scor: 60, dragoste: "Diferențe de personalitate: Gemenii sociabili și indeciși, Fecioara serioasă și atentă la detalii. Necesită adaptare.", finante: "Gemenii pot fi impulsivi, Fecioara analitică. Colaborați pentru o gestionare eficientă a banilor." },
      "Fecioară-Rac": { scor: 85, dragoste: "Armonioasă: Fecioara oferă stabilitate, Racul aduce emoție. Sensibili și loiali, creează o legătură puternică.", finante: "Racul preferă economiile, Fecioara are o abordare practică. Colaborați la finanțe." },
      "Fecioară-Leu": { scor: 50, dragoste: "Necesită adaptare: Leul e mai dramatic și dornic de atenție, Fecioara e practică. Respectați nevoile fiecăruia.", finante: "Leul impulsiv la cheltuieli, Fecioara disciplinată – pot apărea tensiuni." },
      "Fecioară-Fecioară": { scor: 90, dragoste: "Relație foarte stabilă și înțelegătoare. Loialitate și sprijin emoțional.", finante: "Foarte organizate și prudente cu banii; economisesc eficient și stabilesc obiective pe termen lung." },
      "Fecioară-Balanță": { scor: 70, dragoste: "Balanța aduce echilibru și frumusețe, Fecioara stabilitate. Funcționează bine cu exprimare deschisă a sentimentelor.", finante: "Fecioara practică, Balanța impulsivă – combinarea abordărilor poate duce la o gestionare sănătoasă." },
      "Fecioară-Scorpion": { scor: 75, dragoste: "Profundă și intensă: Scorpionul aduce pasiune, Fecioara bază practică. Comunicare deschisă necesară.", finante: "Fecioara prudentă, Scorpionul mai riscant – colaborarea și comunicarea sunt cheile succesului." },
      "Fecioară-Săgetător": { scor: 50, dragoste: "Complicată: Săgetătorul dorește libertate și aventură, Fecioara preferă stabilitatea. Respectul reciproc e esențial.", finante: "Săgetătorul cheltuie impulsiv, Fecioara vrea economii. Comunicare deschisă pentru a evita conflictele." },
      "Fecioară-Capricorn": { scor: 90, dragoste: "Excelentă: ambele sunt dedicate și muncitoare; construiesc relații puternice și durabile.", finante: "Capricornul caută stabilitate, Fecioara aduce analiză. Decizii inteligente și strategice împreună." },
      "Fecioară-Vărsător": { scor: 60, dragoste: "Necesită compromisuri: Vărsătorul e mai excentric și iubește libertatea, Fecioara caută structură. Respectați diferențele.", finante: "Vărsătorul aduce idei inovatoare, Fecioara detalii și execuție. Colaborarea e esențială." },
      "Fecioară-Pești": { scor: 75, dragoste: "Emoțională și profundă: Fecioara oferă stabilitate, Peștii creativitate și visare. Comunicați deschis.", finante: "Peștii mai idealiști, Fecioara mai practică. Sincronizați administrarea resurselor." },

      // Balanță x 12 – actualizat
      "Balanță-Berbec": { scor: 60, dragoste: "Poate fi provocatoare: Berbecul este energic și impulsiv, Balanța caută armonie. Comunicarea deschisă ajută la satisfacerea nevoilor ambilor.", finante: "Balanța poate fi mai cheltuitoare, Berbecul impulsiv; discutați bugetul comun pentru a evita conflictele." },
      "Balanță-Taur": { scor: 80, dragoste: "Foarte compatibile! Taurul aduce stabilitate, Balanța oferă apreciere și sprijin. Ambele caută echilibru și afecțiune.", finante: "Ambele sunt prudente și pot construi împreună un viitor financiar stabil." },
      "Balanță-Gemeni": { scor: 90, dragoste: "Excelentă! Ambele iubesc comunicarea și distracția, formând o legătură puternică și complementară.", finante: "Pot fi impulsivi, dar împreună dezvoltă idei creative pentru gestionarea banilor." },
      "Balanță-Rac": { scor: 70, dragoste: "Balanța aduce echilibru, Racul emoție. Funcționează bine când își înțeleg nevoile și comunică deschis.", finante: "Racul preferă economiile, Balanța poate cheltui impulsiv. Discuțiile despre finanțe previn conflicte." },
      "Balanță-Leu": { scor: 80, dragoste: "Relație plină de energie și vitalitate. Leul aduce pasiune, Balanța eleganță și sprijin. Se admiră reciproc.", finante: "Leul cheltuie pentru a străluci, Balanța caută echilibru. Colaborați la gestionarea banilor." },
      "Balanță-Fecioară": { scor: 60, dragoste: "Fecioara practică vs. Balanța idealistă. Pot apărea neînțelegeri, dar se pot învăța reciproc dacă sunt deschiși.", finante: "Fecioara este prudentă, Balanța mai cheltuitoare. Colaborați în administrarea banilor." },
      "Balanță-Balanță": { scor: 85, dragoste: "Armonie și înțelegere reciprocă. Ambele au nevoie de echilibru și apreciere.", finante: "Pot fi impulsive la cheltuieli, dar pot gestiona bugetul și economiile împreună." },
      "Balanță-Scorpion": { scor: 55, dragoste: "Relație complexă: Scorpionul aduce profunzime, Balanța caută armonie. Respectați emoțiile și stilurile de viață.", finante: "Scorpionul poate fi mai riscant, Balanța caută stabilitate. Ajungeți la compromis financiar." },
      "Balanță-Săgetător": { scor: 75, dragoste: "Vibrantă! Săgetătorul aduce aventură, Balanța echilibru – relație distractivă și interesantă.", finante: "Săgetătorul cheltuie impulsiv, Balanța dorește stabilitate. Comunicare pentru a evita conflictele." },
      "Balanță-Capricorn": { scor: 60, dragoste: "Necesită efort: Capricornul pragmatic, Balanța idealistă. Exprimați-vă nevoile clar.", finante: "Capricornul disciplinat, Balanța cheltuitoare. Colaborarea îmbunătățește gestionarea banilor." },
      "Balanță-Vărsător": { scor: 85, dragoste: "Dinamică și inovatoare. Ambele apreciază libertatea și creativitatea, cu înțelegere profundă.", finante: "Vărsătorul aduce idei originale, Balanța păstrează limite financiare. Lucrați împreună." },
      "Balanță-Pești": { scor: 70, dragoste: "Emoțională și profundă. Balanța oferă echilibru, Peștii visare și creativitate. Sprijin reciproc.", finante: "Peștii mai idealiști, Balanța mai practică. Comunicare deschisă pentru a evita confuzii." },

      // Scorpion x 12
      "Scorpion-Berbec": { scor: 70, dragoste: "Combinație intensă și pasională. Berbecul aduce energie și entuziasm, Scorpionul oferă profunzime emoțională. Posibile conflicte din cauza stilurilor diferite.", finante: "Berbecul e impulsiv cu banii, Scorpionul mai calculat. Colaborați pentru echilibru bugetar." },
      "Scorpion-Taur": { scor: 80, dragoste: "Relație solidă: Taurul aduce stabilitate, Scorpionul intensitate emoțională. Ambele zodii sunt loiale și dedicate.", finante: "Taurul e constant și econom, Scorpionul prudent și calculat. Împreună pot avea prosperitate financiară." },
      "Scorpion-Gemeni": { scor: 55, dragoste: "Poate fi dificil: Gemenii sunt extrovertiți și dinamici, Scorpionul profund și orientat pe emoții. Diferențele pot genera tensiuni.", finante: "Gemenii tind să cheltuie impulsiv, Scorpionul e mai rezervat. Dialog deschis pentru a evita conflictele." },
      "Scorpion-Rac": { scor: 90, dragoste: "Legătură emoțională profundă și empatică. Sensibili și loiali, creează armonie.", finante: "Racul econom, Scorpionul calculat – colaborare excelentă în gestionarea banilor." },
      "Scorpion-Leu": { scor: 65, dragoste: "Relație tumultoasă, dar pasională. Leul caută atenție, Scorpionul intensitate. Respectul reciproc o întărește.", finante: "Leul e extravagant, Scorpionul disciplinat. Căutați echilibru în cheltuieli." },
      "Scorpion-Fecioară": { scor: 80, dragoste: "Combinație promițătoare: Fecioara aduce logică și organizare, Scorpionul emoție și pasiune. Cuplu echilibrat.", finante: "Fecioara atentă la detalii, Scorpionul tactic – gestionare eficientă a resurselor." },
      "Scorpion-Balanță": { scor: 60, dragoste: "Provocări: Scorpion intens și emoțional, Balanța caută armonie. Învață-ți diferențele pentru a funcționa.", finante: "Balanța poate fi impulsivă la cheltuieli, Scorpionul preferă rezervele. Colaborați pentru a evita neînțelegerile." },
      "Scorpion-Scorpion": { scor: 90, dragoste: "Foarte intensă și profundă. Conexiune puternică, dar atenție la posesivitate și gelozie.", finante: "Amândoi prudenți și calculați – decizii inteligente și economisire eficientă." },
      "Scorpion-Săgetător": { scor: 50, dragoste: "Provocator: Săgetătorul iubește libertatea, Scorpionul caută intensitate și angajament. Diferențele pot crea neînțelegeri.", finante: "Săgetătorul e impulsiv și riscă, Scorpionul protejează finanțele. Comunicați pentru a evita tensiuni." },
      "Scorpion-Capricorn": { scor: 75, dragoste: "Relație solidă, bazată pe respect. Capricornul oferă stabilitate, Scorpionul pasiune – bun potențial pe termen lung.", finante: "Capricornul foarte organizat, Scorpionul tactic și prudent. Gestionare inteligentă a banilor." },
      "Scorpion-Vărsător": { scor: 55, dragoste: "Necesită efort: Vărsătorul independent și rebel vs. Scorpionul axat pe conexiune emoțională. Respectul e crucial.", finante: "Vărsătorul aduce idei inovatoare, Scorpionul e precaut. Colaborați pentru a gestiona resursele." },
      "Scorpion-Pești": { scor: 90, dragoste: "Combinatie ideală: intuitivi și emoționali, formează o legătură profundă, cu sprijin reciproc.", finante: "Scorpionul precaut, Peștii visători – echilibru prin comunicare deschisă." }
      ,
      // Săgetător x 12
      "Săgetător-Berbec": { scor: 90, dragoste: "Energică și pasională; aventură.", finante: "Impulsivitate comună – plan comun." },
      "Săgetător-Taur": { scor: 55, dragoste: "Libertate vs. stabilitate; tensiuni.", finante: "Taur conservator, Săgetător impulsiv – dialog." },
      "Săgetător-Gemeni": { scor: 85, dragoste: "Comunicare și distracție; legătură strânsă.", finante: "Buget comun ajută controlul." },
      "Săgetător-Rac": { scor: 60, dragoste: "Independență vs. confort; provocări.", finante: "Rac econom, Săgetător impulsiv – colaborare." },
      "Săgetător-Leu": { scor: 95, dragoste: "Pasiune, libertate, susținere.", finante: "Creativitate + optimism; buget preventiv." },
      "Săgetător-Fecioară": { scor: 55, dragoste: "Spontaneitate vs. ordine; compromis.", finante: "Fecioară conservatoare, Săgetător riscant." },
      "Săgetător-Balanță": { scor: 80, dragoste: "Chimie socială, vibrantă.", finante: "Impulsivitate gestionată prin reguli." },
      "Săgetător-Scorpion": { scor: 50, dragoste: "Libertate vs. angajament; dificil.", finante: "Risc vs. conservare – comunicare." },
      "Săgetător-Săgetător": { scor: 95, dragoste: "Energie și optimism; experiențe comune.", finante: "Buget care susține aventurile." },
      "Săgetător-Capricorn": { scor: 60, dragoste: "Jovial vs. serios; respect.", finante: "Capricorn disciplinat, Săgetător impulsiv – compromis." },
      "Săgetător-Vărsător": { scor: 90, dragoste: "Ideal: libertate și creativitate.", finante: "Idei originale; atenție la excese." },
      "Săgetător-Pești": { scor: 75, dragoste: "Emoție + aventură; legătură frumoasă.", finante: "Visare + impuls – discuții deschise." },

      // Capricorn x 12
      "Capricorn-Berbec": { scor: 60, dragoste: "Această combinație poate necesita muncă, deoarece Berbecul este spontan și energic, în timp ce Capricornul preferă stabilitatea. Trebuie să se respecte reciproc nevoile.", finante: "Berbecul este impulsiv în cheltuieli, iar Capricornul este prudent. Colaborarea este esențială pentru gestionarea banilor." },
      "Capricorn-Taur": { scor: 90, dragoste: "Această combinație este una dintre cele mai solide. Ambele zodii caută stabilitate și loialitate, construind o relație bazată pe respect și încredere.", finante: "Ambele zodii sunt foarte organizate, având scopuri financiare comune și un plan bine pus la punct pentru economisire și investiții." },
      "Capricorn-Gemeni": { scor: 55, dragoste: "Această combinație poate fi provocatoare. Gemenii sunt sociabili și energici, în timp ce Capricornul tinde să fie mai rezervat și practic. Aceste diferențe pot genera neînțelegeri.", finante: "Gemenii pot avea tendința de a cheltui impulsiv, iar Capricornul este mai conservator, ceea ce necesită o bună comunicare." },
      "Capricorn-Rac": { scor: 80, dragoste: "Această relație este adesea echilibrată. Racul aduce emoție și intimitate, în timp ce Capricornul oferă stabilitate. Ambele zodii sunt loiale și protejează relația.", finante: "Racul preferă să economisească, iar Capricornul este disciplinat în planificarea financiară, ceea ce le permite să construiască împreună o bază solidă." },
      "Capricorn-Leu": { scor: 65, dragoste: "Această relație poate fi puternică, dar nu fără provocări. Leul caută atenție, în timp ce Capricornul este mai concentrat pe muncă și obiective. Trebuie să își respecte nevoile.", finante: "Leul poate fi extravagant, în timp ce Capricornul este mai prudent. Este necesar să colaboreze pentru a găsi un echilibru." },
      "Capricorn-Fecioară": { scor: 95, dragoste: "Această combinație este extrem de compatibilă. Fecioara este practică și analitică, iar Capricornul este disciplinat. Împreună formează o echipă puternică.", finante: "Ambele zodii sunt foarte organizate și disciplinate în gestionarea banilor, ceea ce le permite să își construiască o situație financiară stabilă." },
      "Capricorn-Balanță": { scor: 60, dragoste: "Această relație poate fi provocatoare, deoarece Balanța caută echilibru și armonie, pe când Capricornul este mai serios în abordări. Este important să își exprime des nevoile.", finante: "Balanța poate cheltui impulsiv, iar Capricornul preferă să fie prudent. Comunicarea este cheia." },
      "Capricorn-Scorpion": { scor: 75, dragoste: "Această combinație poate fi intensă și pasională. Scorpionul aduce adâncime emoțională, iar Capricornul oferă stabilitate. Trebuie să își respecte nevoile reciproce.", finante: "Scorpionul este prudent, iar Capricornul este disciplinat, ceea ce ajută la gestionarea eficientă a banilor." },
      "Capricorn-Săgetător": { scor: 60, dragoste: "Această combinație necesită echilibru. Săgetătorul caută aventura și spontaneitatea, în timp ce Capricornul preferă un plan bine definit. Trebuie să își respecte diferențele.", finante: "Săgetătorul este mai impulsiv, iar Capricornul preferă un control strict asupra bugetului. O bună comunicare ajută la găsirea unui compromis." },
      "Capricorn-Capricorn": { scor: 90, dragoste: "Două persoane Capricorn formează o legătură extrem de stabilă și dedicată. Ambele zodii sunt muncitoare și ambițioase, valorificându-se reciproc.", finante: "Ambele zodii sunt foarte organizate și prudente în gestionarea banilor, având grijă de securitatea financiară a relației." },
      "Capricorn-Vărsător": { scor: 70, dragoste: "Această relație are potențial, dar trebuie să se bazeze pe respect. Vărsătorul este independent, în timp ce Capricornul caută stabilitate. Este important să se respecte reciproc libertatea.", finante: "Vărsătorul poate aduce idei inovatoare în gestionarea banilor, în timp ce Capricornul este mai conservator. Colaborarea este esențială." },
      "Capricorn-Pești": { scor: 75, dragoste: "Această combinație poate fi emoțională și profundă. Peștii aduc visare și empatie, în timp ce Capricornul oferă stabilitate. Împreună pot crea o legătură frumoasă.", finante: "Peștii pot fi mai visători, în timp ce Capricornul este prudent, ceea ce le permite să își gestioneze banii eficient prin colaborare." },

      // Vărsător x 12
      "Vărsător-Berbec": { scor: 85, dragoste: "Această combinație este plină de energie și aventură. Ambele zodii apreciază libertatea și spontaneitatea, formând o legătură dinamică.", finante: "Multe idei financiare noi pot apărea, dar ambele zodii ar trebui să fie temperate în cheltuieli." },
      "Vărsător-Taur": { scor: 55, dragoste: "Această relație poate fi complicată. Taurul caută stabilitate, în timp ce Vărsătorul preferă libertatea și inovația. Diferențele pot aduce provocări în comunicare.", finante: "Taurul este mai conservator cu banii, în timp ce Vărsătorul poate fi impulsiv, ceea ce necesită discuții deschise despre cheltuieli." },
      "Vărsător-Gemeni": { scor: 90, dragoste: "Această combinație este o potrivire excelentă! Ambele zodii sunt sociabile și iubesc comunicarea, formând o legătură armonioasă.", finante: "Vărsătorul și Gemenii pot avea idei inovatoare despre bani și pot explora diverse oportunități financiare împreună." },
      "Vărsător-Rac": { scor: 60, dragoste: "Această relație poate necesita compromisuri, deoarece Racul caută conexiuni emoționale profunde, iar Vărsătorul preferă independența. Este crucial să se comunice deschis.", finante: "Racul este mai conservator, în timp ce Vărsătorul poate cheltui impulsiv – pot apărea neînțelegeri fără dialog." },
      "Vărsător-Leu": { scor: 70, dragoste: "Această combinație aduce multă distracție și energie. Ambele zodii iubesc să fie în centrul atenției – relație colorată.", finante: "Leul poate fi extravagant, iar Vărsătorul poate fi ingenios în gestionarea banilor. O bună comunicare este necesară." },
      "Vărsător-Fecioară": { scor: 55, dragoste: "Această relație poate fi provocatoare. Fecioara este practică și orientată spre detalii, în timp ce Vărsătorul este mai puțin atent la gestionarea detaliilor.", finante: "Fecioara este mai prudentă, iar Vărsătorul poate cheltui impulsiv. Colaborarea e importantă pentru a menține un echilibru." },
      "Vărsător-Balanță": { scor: 80, dragoste: "Aceasta este o combinație armonioasă, plină de chimie. Ambele zodii sunt sociabile și apreciază frumusețea – relație plăcută.", finante: "Balanța e mai puțin impulsivă decât Vărsătorul, dar împreună pot gestiona eficient resursele financiare." },
      "Vărsător-Scorpion": { scor: 50, dragoste: "Această relație poate fi intensă, dar și provocatoare. Scorpionul caută profunzime emoțională, Vărsătorul preferă libertatea – pot apărea tensiuni.", finante: "Scorpionul poate fi mai rezervat, Vărsătorul impulsiv – comunicarea e esențială." },
      "Vărsător-Săgetător": { scor: 90, dragoste: "Această combinație e adesea considerată ideală. Ambele zodii sunt aventuroase și iubesc libertatea – relație plină de energie și idei originale.", finante: "Ambele pot fi impulsive, dar pot colabora eficient pentru idei inovatoare și soluții financiare." },
      "Vărsător-Capricorn": { scor: 60, dragoste: "Această relație poate necesita muncă. Capricornul e disciplinat și orientat spre carieră, Vărsătorul caută libertate și diversitate. Respectul reciproc este crucial.", finante: "Capricornul e prudent, Vărsătorul aduce idei originale, uneori impulsive – e esențială comunicarea pe tema banilor." },
      "Vărsător-Vărsător": { scor: 95, dragoste: "Două persoane Vărsător creează o legătură puternică bazată pe înțelegere reciprocă și originalitate. Ambele iubesc libertatea și diversitatea în relații.", finante: "Pot colabora ușor în gestionarea finanțelor și pot crea strategii inovatoare pentru a-și sprijini visele comune." },
      "Vărsător-Pești": { scor: 75, dragoste: "Această combinație poate fi emoțională și creativă. Peștii aduc sensibilitate, iar Vărsătorul aduce inovație – legătură profundă.", finante: "Peștii pot fi visători, Vărsătorul mai puțin interesat de lucruri materiale – împreună pot învăța să gestioneze mai bine resursele." },

      // Pești x 12
      "Pești-Berbec": { scor: 55, dragoste: "Această relație poate fi tumultoasă: Berbecul este impulsiv și energic, iar Peștii sunt sensibili și contemplativi. Diferențele pot genera tensiuni.", finante: "Berbecul poate cheltui impulsiv, în timp ce Peștii pot fi mai visători – este necesară o bună comunicare în gestionarea banilor." },
      "Pești-Taur": { scor: 80, dragoste: "Armonioasă: Taurul oferă stabilitate, Peștii aduc emoție și intimitate.", finante: "Taurul e conservator în cheltuieli, Peștii aduc idei creative – pot găsi un echilibru sănătos." },
      "Pești-Gemeni": { scor: 70, dragoste: "Interesantă, dar complicată: Peștii caută profunzime emoțională, Gemenii sunt sociabili și mai superficiali. Comunicarea frecventă e importantă.", finante: "Gemenii pot cheltui impulsiv, Peștii pot fi indeciși – colaborarea e esențială." },
      "Pești-Rac": { scor: 90, dragoste: "Extrem de compatibilă: ambele zodii sunt emoționale și empatice; legătură profundă bazată pe înțelegere și susținere reciprocă.", finante: "Racul e prudent și atent, Peștii aduc creativitate – colaborează eficient." },
      "Pești-Leu": { scor: 65, dragoste: "Creativitate și provocări: Leul caută centrul atenției, Peștii sunt retrași. E nevoie de echilibru.", finante: "Leul poate fi extravagant, Peștii visători – discută deschis despre cheltuieli." },
      "Pești-Fecioară": { scor: 70, dragoste: "Necesită muncă: Fecioara practică vs. Peștii visători; se pot completa în dragoste.", finante: "Fecioara organizată și prudentă ajută Peștii să gestioneze eficient banii." },
      "Pești-Balanță": { scor: 75, dragoste: "Plăcută și armonioasă: Balanța aduce echilibru, Peștii adâncime emoțională.", finante: "Balanța mai puțin impulsivă; Peștii aduc creativitate – se ajută reciproc în finanțe." },
      "Pești-Scorpion": { scor: 85, dragoste: "Foarte puternică: ambele zodii emoționale și profunde; legătură intensă bazată pe încredere și intimitate.", finante: "Scorpionul e precaut, Peștii pot aduce idei originale – gestionare eficientă împreună." },
      "Pești-Săgetător": { scor: 75, dragoste: "Emoțională și aventuroasă: Săgetătorul aduce energie, Peștii emoție – legătură frumoasă.", finante: "Săgetătorul impulsiv, Peștii visători – dialog deschis pentru a evita confuzii financiare." },
      "Pești-Capricorn": { scor: 75, dragoste: "Poate funcționa bine: Capricornul aduce stabilitate, Peștii profunzime emoțională – respectați diferențele.", finante: "Capricornul calculat, Peștii aduc idei inovatoare – colaborare benefică în gestionarea resurselor." },
      "Pești-Vărsător": { scor: 70, dragoste: "Interesantă, dar cu provocări: Vărsătorul e independent, Peștii mai emoționali – respect reciproc necesar.", finante: "Vărsătorul mai puțin interesat de bani, Peștii creativi – comunicare esențială." },
      "Pești-Pești": { scor: 90, dragoste: "Legătură extrem de profundă și emoțională. Se înțeleg reciproc și își oferă suport în momentele dificile.", finante: "Ambele zodii pot fi visătoare, dar împreună pot găsi moduri eficiente de gestionare a banilor, încurajând creativitatea financiară." }
    }
  },
  numerologyGeneral: {
    "1": "Numărul de destin 1 reprezintă inițiativa, leadership-ul și dorința de a reuși. Persoanele cu 1 sunt independente, motivate și orientate spre rezultate, influențând direct modul în care iubesc și își administrează finanțele.",
    "2": "Numărul de destin 2 simbolizează echilibrul, parteneriatul și empatia. Persoanele cu 2 caută armonie în relații și aduc cooperare și sensibilitate și în deciziile financiare.",
    "3": "Numărul de destin 3 simbolizează creativitatea și bucuria. Cei cu acest număr sunt sociabili, comunicativi și aduc veselie în viața altora. Se bucură de spontaneitate și de plăcerea de a trăi, iar aceste trăsături influențează relațiile și modul de gestionare a finanțelor.",
    "4": "Numărul de destin 4 simbolizează stabilitatea, ordinea și dăruirea față de muncă. Cei cu acest număr sunt adesea fundamentali și responsabili, cu abilitatea de a construi și menține structuri în relații, carieră și viața de zi cu zi. Aceste trăsături influențează profund viața romantică și felul în care își gestionează finanțele.",
    "5": "Numărul de destin 5 este asociat cu libertatea, aventura și schimbarea. Persoanele cu 5 iubesc varietatea și experiențele noi, ceea ce se reflectă în dinamica relațiilor și în deciziile financiare.",
    "6": "Numărul de destin 6 reprezintă iubirea, responsabilitatea și grija pentru ceilalți. Persoanele cu 6 sunt orientate spre familie și stabilitate, căutând echilibru emoțional și siguranță financiară.",
    "7": "Numărul de destin 7 simbolizează introspecția, analiza și spiritualitatea. Cei cu 7 caută adevăruri profunde și sens, influențându-le alegerile în dragoste și modul atent, analitic de gestionare a resurselor.",
    "8": "Numărul de destin 8 este simbolul puterii, succesului și responsabilității. Persoanele cu 8 sunt ambițioase și pragmatice, orientate spre realizări și o administrare strategică a finanțelor.",
    "9": "Numărul de destin 9 reprezintă umanitatea, generozitatea și idealismul. Cei cu 9 sunt empatici și altruiști, lucru ce se reflectă în relații și într-o perspectivă mai puțin materialistă asupra banilor."
  },
  numerology: {
    // Chei în format "min-max" (simetric)
    "1-1": {
      scor: 90,
      dragoste: "Dinamică și energie; necesită compromis pentru armonie.",
      finante: "Ambiție mare; atenție la cheltuieli pentru statut."
    },
    "1-2": {
      scor: 70,
      dragoste: "Sensibilitate 2 echilibrează forța lui 1; evitați controlul.",
      finante: "1 inițiază, 2 structurează; bun management al cheltuielilor."
    },
    "1-3": {
      scor: 80,
      dragoste: "Vibrație creativă și entuziasm; preveniți neînțelegerile.",
      finante: "Vise mari + creativitate; plan financiar pentru impulsuri."
    },
    "1-4": { scor: 60, dragoste: "Inițiativă vs. stabilitate; comunicare deschisă.", finante: "1 riscă, 4 economisește – plan comun." },
    // Actualizat conform materialului: 2-4 = 70
    "2-4": { scor: 70, dragoste: "Numărul 4 aduce stabilitate în relație, ceea ce poate ajuta numărul 2 să se simtă în siguranță. Aceste trăsături combinate pot crea o bază solidă, dar 2 trebuie să evite să devină prea dependent de stabilitatea 4.", finante: "Finanțele vor fi gestionate cu responsabilitate, cu 4 care se concentrează pe economii și 2 care contribuie prin planificare. Aceștia pot forma o echipă eficientă în afaceri." },
    // Actualizat conform materialului: 3-4 = 70
    "3-4": { scor: 70, dragoste: "Numărul 4 oferă stabilitate, iar 3 aduce creativitate. Această combinație poate funcționa foarte bine dacă 4 permite lui 3 să fie liber, iar 3 respectă nevoia de ordine a lui 4.", finante: "4 va căuta să economisească și să planifice, în timp ce 3 poate fi predispus la cheltuieli spontane. O colaborare bună poate aduce succes financiar." },
    "4-4": { scor: 90, dragoste: "Foarte stabilă, valori comune și încredere.", finante: "Organizată și practică; economii și investiții inteligente." },
    "4-5": { scor: 60, dragoste: "Stabilitate vs. aventură; pot apărea tensiuni.", finante: "5 impulsiv; necesar plan clar." },
    "4-6": { scor: 80, dragoste: "Responsabilitate și grijă; dinamică pozitivă.", finante: "Abordare responsabilă; bază financiară solidă." },
    
    // Completări Numărul 2 (perechi simetrice min-max)
    "2-2": {
      scor: 90,
      dragoste: "Două persoane cu numărul 2 formează o legătură profundă, bazată pe înțelegere și suport reciproc. Amândoi pot crea un mediu iubitor și armonios, potrivit pentru dezvoltarea emoțională.",
      finante: "2 va fi atent la cheltuieli și va colabora cu partenerul pentru a face planuri financiare. Abordare conservatoare ce aduce stabilitate."
    },
    "2-3": {
      scor: 80,
      dragoste: "Numărul 3 aduce creativitate și energie, stimulând dorința de a explora și a se distra. 2 trebuie să își exprime sentimentele pentru a evita neînțelegerile.",
      finante: "3 vine cu idei inventive, 2 asigură decizii responsabile. Colaborare bună dacă evită cheltuieli impulsive."
    },
    "2-5": {
      scor: 65,
      dragoste: "5 aduce aventură și varietate; 2 poate deveni neliniștit de imprevizibilitate. Comunicarea deschisă este esențială.",
      finante: "5 poate fi impulsiv, 2 preferă economisirea. Compromisul previne conflictele."
    },
    "2-6": {
      scor: 85,
      dragoste: "Relație puternică, bazată pe dragoste și grijă reciprocă; ambele orientate spre familie.",
      finante: "6 aduce siguranță, 2 strategii de economisire. Gestionare foarte bună a resurselor."
    },
    "2-7": {
      scor: 60,
      dragoste: "7 poate fi retras și introspectiv; 2 caută apropiere emoțională. Au nevoie de timp pentru înțelegere mutuală.",
      finante: "7 analitic, 2 cooperant; metode diferite dar complementare."
    },
    "2-8": {
      scor: 75,
      dragoste: "2 susține emoțional ambițiile lui 8; echilibrul carieră-familie e important.",
      finante: "Ambii vizați pe succes; 2 menține stabilitatea, 8 inițiază proiecte profitabile."
    },
    "2-9": {
      scor: 70,
      dragoste: "9 aduce latură umanitară; relație plină de empatie, dar pot apărea conflicte din altruismul ambilor.",
      finante: "2 caută stabilitate, 9 e mai lax. Clarificarea nevoilor financiare aduce echilibru."
    },

    // Completări Numărul 3
    // Ajustat conform materialului pentru Numărul 3: 1-3 = 75
    "1-3": {
      scor: 75,
      dragoste: "Relația dintre 1 și 3 poate fi plină de energie și entuziasm. Numărul 1 este un lider natural, în timp ce 3 aduce creativitate și distracție. Această combinație permite ambelor părți să își exprime ideile liber, dar trebuie să existe un echilibru, deoarece 1 poate deveni uneori prea dominant.",
      finante: "Financiar, 1 aduce viziune și planificare, în timp ce 3 este bun la a găsi soluții inovatoare. Trebuie să își coordoneze viziunile pentru a evita cheltuielile impulsive."
    },
    "1-5": {
      scor: 75,
      dragoste: "Relația dintre 1 și 5 poate fi foarte dinamică: 1 aduce inițiativă și ambiții, iar 5 dorința de a explora. 5 trebuie să aibă grijă ca 1 să nu se simtă copleșit de nevoia de libertate.",
      finante: "1 este mai disciplinat, 5 tinde la cheltuieli impulsive; comunicați obiectivele financiare și găsiți echilibrul între risipă și economisire."
    },
    "1-6": {
      scor: 70,
      dragoste: "1 are tendința de a conduce, 6 aduce echilibru și sprijin. 1 inspiră ambiție, 6 are nevoie de respectarea nevoilor emoționale.",
      finante: "1 vrea investiții și riscuri, 6 caută stabilitate. Dialog deschis asupra obiectivelor financiare."
    },
    "1-7": {
      scor: 65,
      dragoste: "1 este orientat spre acțiune, 7 analizează înainte de a acționa. Tensiuni între impulsivitate și contemplare, dar și complementaritate posibilă.",
      finante: "1 își asumă riscuri, 7 este precaut; stabiliți o strategie comună pentru echilibru."
    },
    "1-8": {
      scor: 75,
      dragoste: "Ambii orientați spre succes: 1 aduce inițiativă și creativitate, 8 ambiție și determinare. Posibilă competiție – sprijin reciproc e cheia.",
      finante: "Amândoi caută investiții și progres; comunicarea previne conflictele."
    },
    "1-9": {
      scor: 65,
      dragoste: "Relația dintre 1 și 9 poate avea provocări, deoarece 1 este mai orientat spre succesul personal și ambiție, în timp ce 9 se concentrează pe bunăstarea celorlalți. Aceste diferențe pot crea tensiuni, dar pot și îmbogăți experiențele fiecăruia.",
      finante: "Financiar, 1 va căuta să investească și să acumuleze bunuri, în timp ce 9 poate fi mai puțin interesat de materiale, făcând comunicarea esențială pentru a evita conflictele în gestionarea banilor."
    },
    "3-3": {
      scor: 90,
      dragoste: "Creativitate și bucurie împărtășite; relație exuberantă, cu înțelegere reciprocă a nevoilor.",
      finante: "Tendință la impuls; e vitală o strategie de economisire."
    },
    "3-5": {
      scor: 85,
      dragoste: "Aventură și spontaneitate; libertate și distracție comune. Atenție la nevoile emoționale.",
      finante: "Idei inovative, dar evitați cheltuielile impulsive."
    },
    "3-6": {
      scor: 75,
      dragoste: "6 aduce stabilitate și grijă; echilibru între responsabilitate și bucurie.",
      finante: "6 planifică responsabil, 3 aduce creativitate; colaborare benefică."
    },
    "3-7": {
      scor: 60,
      dragoste: "3 sociabil vs. 7 introspectiv; pot apărea tensiuni dar și învățare reciprocă.",
      finante: "7 analitic ajută 3 să se organizeze; respectați nevoia de solitudine a lui 7."
    },
    "3-8": {
      scor: 70,
      dragoste: "8 orientat spre realizare, 3 aduce energie și optimism; potențial bun dacă 3 respectă ritmul lui 8.",
      finante: "8 inițiază strategii, 3 oferă idei; atenție la cheltuieli."
    },
    "3-9": {
      scor: 75,
      dragoste: "Această combinație poate aduce o dinamică plină de bucurie, cu 3 aducând creativitate și distractie, în timp ce 9 oferă o latură profundă și umanitară. Această interacțiune poate fi foarte pozitivă, dar 9 trebuie să nu se piardă în idealurile sale.",
      finante: "Financiar, 3 poate fi mai impulsiv, iar 9 mai puțin interesat de aspectele materiale. Este important ca 9 să ajute 3 să își gestioneze cheltuielile, stabilind un buget clar."
    },
    
    // Numărul 4 perechi
    "4-4": {
      scor: 90,
      dragoste: "Două persoane cu numărul 4: relație foarte stabilă, valori comune și încredere.",
      finante: "Abordare organizată și practică; economii și investiții inteligente."
    },
    "4-5": {
      scor: 60,
      dragoste: "5 aduce aventură, 4 caută stabilitate – pot apărea tensiuni, dar pot învăța reciproc.",
      finante: "5 impulsiv, 4 prudent – necesar plan clar."
    },
    "4-7": {
      scor: 65,
      dragoste: "4 practic, 7 contemplativ – posibile neînțelegeri, dar și profunzime emoțională.",
      finante: "7 analitic, 4 orientat pe stabilitate – colaborare pentru echilibru."
    },
    "4-8": {
      scor: 80,
      dragoste: "Stabilitate (4) + ambiție (8) – relație puternică; evitați rivalitatea.",
      finante: "8 caută succesul material, 4 organizează – obiective financiare atinse."
    },
    "4-9": {
      scor: 70,
      dragoste: "Relația dintre 4 și 9 poate fi puternică, dar și provocatoare. 4 aduce stabilitate, iar 9 oferă o latură idealistă. Este important ca 9 să înțeleagă nevoia de ordine a lui 4, iar 4 să aprecieze visurile lui 9.",
      finante: "Pe plan financiar, 4 va dori economii și o abordare practică, în timp ce 9 poate fi mai dezinteresat de binele său material. Colaborarea este cheia pentru a găsi un echilibru."
    },
    
    // Numărul 5 perechi
    "5-5": {
      scor: 90,
      dragoste: "Relație plină de aventură și spontaneitate; legătură profundă prin explorare.",
      finante: "Abordare relaxată a banilor – impuneți buget comun."
    },
    "5-6": {
      scor: 65,
      dragoste: "6 responsabil și orientat spre familie vs. 5 libertate; pot coexista prin comunicare.",
      finante: "6 planifică, 5 impulsiv – stabiliți reguli."
    },
    "5-7": {
      scor: 60,
      dragoste: "5 sociabil, 7 introspectiv – necesită ajustare; pot găsi profunzime.",
      finante: "7 analitic ajută 5 să-și clarifice cheltuielile."
    },
    "5-8": {
      scor: 65,
      dragoste: "5 entuziasm, 8 realizare – sprijiniți-vă ambițiile.",
      finante: "8 vizează succesul, 5 idei noi – atenție la impulsivitate."
    },
    "5-9": {
      scor: 60,
      dragoste: "Această combinație poate crea o dinamică interesantă datorită naturii aventuroase a lui 5 și idealismului lui 9. Este important ca ambii să comunice deschis despre nevoile lor respective pentru a evita neînțelegerile.",
      finante: "Financiar, 5 poate fi impulsiv, în vreme ce 9 poate fi mai generos. Este esențial să găsească o strategie comună pentru a nu se confrunta cu probleme financiare."
    },
    
    // Numărul 6 perechi
    "6-6": {
      scor: 90,
      dragoste: "Relație bazată pe dragoste, responsabilitate și familie.",
      finante: "Gestionare excelentă a banilor; economii și decizii înțelepte."
    },
    "6-7": {
      scor: 60,
      dragoste: "7 aduce introspecție; 6 trebuie să respecte nevoia de singurătate a lui 7.",
      finante: "7 analitic, 6 grijuliu – echilibru planificare/spontaneitate."
    },
    "6-8": {
      scor: 70,
      dragoste: "8 are ambiții puternice, 6 susține emoțional – atenție la neglijare.",
      finante: "8 inițiază, 6 gestionează cheltuieli – succes cu dialog."
    },
    "6-9": {
      scor: 80,
      dragoste: "Relația dintre 6 și 9 este puternică, ambele numere fiind orientate spre grijă și empatie. Această combinație poate aduce o legătură profundă și o înțelegere reciprocă.",
      finante: "În aspectul financiar, 6 va aduce o abordare responsabilă, iar 9 va contribui cu idealismul său. Împreună pot construi o situație financiară stabilă și sănătoasă."
    },
    
    // Numărul 7 perechi
    "7-7": {
      scor: 90,
      dragoste: "Legătură profundă bazată pe înțelegere și introspecție.",
      finante: "Viziune analitică și serioasă; resurse administrate eficient."
    },
    "7-8": {
      scor: 60,
      dragoste: "8 concentrat pe realizări vs. 7 contemplativ – respectați valorile reciproce.",
      finante: "8 acțiune, 7 analiză – găsiți punctele comune."
    },
    "7-9": {
      scor: 75,
      dragoste: "Relația dintre 7 și 9 poate fi profundă, axată pe compasiune și înțelegere. 9 va aduce o latură umanitară, iar 7 va contribui cu analiza spirituală, creând o dinamică completă.",
      finante: "Financiar, 9 poate fi mai indiferent față de bunurile materiale, în timp ce 7 va căuta siguranța. Este important să comunice despre așteptările financiare pentru a evita dezacordurile."
    },
    
    // Numărul 8 perechi
    "8-8": {
      scor: 90,
      dragoste: "Relație foarte puternică, bazată pe ambiție și succes comun.",
      finante: "Eficiență ridicată; oportunități bine valorificate."
    },
    "8-9": {
      scor: 60,
      dragoste: "Relația dintre 8 și 9 poate crea o dinamică intrigantă, cu 8 fiind mai concentrat pe putere și realizări materiale, iar 9 fiind mai altruist. Este important ca 8 să nu uite latura umanitară a lui 9.",
      finante: "Finanțele pot fi o sursă de conflict, 8 având tendința de a investi agresiv, în timp ce 9 poate prefera să ajute pe alții. Comunicarea este crucială pentru a menține armonia."
    },
    
    // Numărul 9 perechi
    "9-9": {
      scor: 90,
      dragoste: "Două persoane cu numărul 9 vor avea o legătură profundă, și își împărtășesc idealurile și aspirațiile. Ambele vor înțelege valoarea umanității și vor dori să facă o diferență în lume.",
      finante: "Financiar, această combinație poate crea o dinamică interesantă, cu 9 având o natură mai puțin materialistă. Este important ca ambii parteneri să își alinieze valorile și să discute despre gestionarea resurselor."
    }
  }
};

export default compatibilityDataRO;


