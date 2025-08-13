const compatibilityDataEN = {
  astrology: {
    general: {
      "Aries": "Aries is a fire sign at the start of the zodiac. People born under this sign tend to be energetic, passionate, and eager for adventure. In love, Aries is direct and open, which makes relationships exciting. However, they can be impulsive with spending, which may create challenges in money management.",
      "Taurus": "Taurus is an earth sign, stable and practical. People born under this sign are determined, loyal and seek comfort in life. In love, Taurus prefers to build solid, long-lasting relationships, and in money matters is prudent and careful. These traits deeply influence how they handle romantic relationships and finances.",
      "Gemini": "Gemini is an air sign characterized by communication, versatility and curiosity. People born under this sign are sociable and eager to explore new ideas and perspectives. In love, Geminis seek stimulating, varied connections but can be indecisive. In money management, they tend to spend impulsively yet can be ingenious at finding creative financial solutions.",
      "Cancer": "Cancer is a water sign characterized by emotion, sensitivity, and intuition. People born under this sign are empathetic and seek deep connections in their personal lives. In love, Cancer tends to be protective and loyal, but also vulnerable. Financially, Cancer is usually prudent and prefers stability."
      ,
      "Leo": "Leo is a fire sign known for charisma, generosity, and a desire to be center stage. People born under this sign are passionate, confident, and often take the lead in relationships. In love, Leo seeks attention and affection; in finances Leo can be impulsive, which may sometimes cause disagreements."
      ,
      "Virgo": "Virgo is an earth sign known for pragmatism, attention to detail and an analytical nature. People born under this sign are organized, hardworking and seek stability in relationships. In love, Virgo is loyal and dedicated, though self- and partner-critical. Financially, Virgo is prudent and prefers planning before decisions."
      ,
      "Libra": "Libra is an air sign characterized by the desire to create balance, harmony and healthy relationships. People born under this sign are sociable, romantic and appreciate beauty. In love, Libra seeks deep connections and balance, often very dedicated to partners. Financially, Libra can be impulsive but aims for equilibrium."
      ,
      "Scorpio": "Scorpio is a water sign known for intensity, passion, and emotional depth. Mysterious, loyal and highly intuitive, Scorpios seek deep, authentic and passionate connections, yet can be possessive or jealous. Financially, Scorpio is practical and prudent, controlling resources well, even when taking occasional calculated risks."
      ,
      "Sagittarius": "Sagittarius is a fire sign recognized for a love of adventure, optimism and exploration. Courageous, spontaneous and open, Sagittarians seek relationships that allow freedom and variety, though long-term commitment can be challenging. Financially, they can be impulsive, yet creative in finding opportunities.",
      "Aquarius": "Aquarius is an air sign known for innovation and originality. People born under this sign are visionary, sociable and independent. In love, Aquarius seeks stimulating connections that allow creative expression, though they may avoid deep commitments. Financially, Aquarius is less materialistic but ingenious at finding original ways to make money."
    },
    elements: {
      "Fire-Fire": {
        love: "A relationship full of energy and passion.",
        finance: "Competition can drive success but also impulsive spending.",
        score: 85
      },
      "Fire-Air": {
        love: "Air feeds fire, creating a passionate and creative bond.",
        finance: "Ambitious ideas; watch consistency in execution.",
        score: 90
      },
      "Earth-Water": {
        love: "Harmonious bond nurtured by deep emotions and support.",
        finance: "Practical + intuitive = effective resource management.",
        score: 75
      }
    },
    signs: {
      // Aries x 12
      "Aries-Aries": { score: 80, love: "A relationship full of passion and energy. Both partners enjoy spontaneity and adventure, but rivalry can arise. Support each other and communicate openly to avoid conflicts.", finance: "Both can be impulsive with spending; set a joint budget to avoid financial issues." },
      "Aries-Taurus": { score: 60, love: "Aries brings energy while Taurus brings stability; differences may cause friction. Aries wants freedom, Taurus values stability. Respect and adapt to each other’s lifestyle.", finance: "Taurus is more prudent, Aries more impulsive. Collaborate on spending and saving together.", friendship: "Aries brings energy and enthusiasm; Taurus prefers stability – interesting, sometimes challenging friendship.", spirituality: "Aries can be more impulsive in spiritual pursuits, while Taurus seeks roots and stability in beliefs.", activities: "Aries prefers adventurous activities; Taurus enjoys simple pleasures like shared meals." },
      "Aries-Gemini": { score: 85, love: "Fun and enthusiastic pairing! Gemini offers variety and stimulating talks, while Aries encourages Gemini’s courage. Both appreciate adventure and get along very well.", finance: "Aries tends to be impulsive and Gemini indecisive; discuss finances and set a budget to prevent overspending.", friendship: "Playful and spontaneous, with excellent chemistry.", spirituality: "Both can explore new spiritual concepts; Aries direct, Gemini analytical.", activities: "Shared love for social activities and adventures: travel, sports." },
      "Aries-Cancer": { score: 55, love: "Can be complex: Aries is energetic, Cancer more sensitive. Cancer may feel overwhelmed; Aries should be attentive to Cancer’s emotional needs.", finance: "Cancer prefers saving, Aries tends to spend; open communication and balance are essential.", friendship: "Challenging: energetic Aries, sensitive Cancer.", spirituality: "Cancer seeks deep emotional connection; Aries may be less spiritually inclined.", activities: "Cancer prefers quiet nights in; Aries seeks adventures." },
      "Aries-Leo": { score: 90, love: "Extremely powerful combo! Both are lively and love adventures. Mutual admiration and support in aspirations; evident passion and a desire to shine.", finance: "Both can be generous and sometimes overspend; collaborate on money management to avoid issues.", friendship: "Strong, energetic friendship with mutual support.", spirituality: "Both can be passionate in their pursuits; similar outlooks.", activities: "Love for fun and adventures." },
      "Aries-Virgo": { score: 50, love: "Challenging mix: Aries is energetic and impulsive, Virgo analytical and practical. Misunderstandings can arise; if Aries appreciates Virgo’s approach, balance is possible.", finance: "Virgo prefers saving, Aries is adventurous; discuss spending and reach a compromise.", friendship: "Can be challenging: impulsive Aries, analytical Virgo.", spirituality: "Virgo seeks order; Aries prefers free exploration.", activities: "Aries prefers energetic activities; Virgo enjoys calmer ones." },
      "Aries-Libra": { score: 60, love: "Needs balance: Aries brings spontaneity, Libra seeks harmony. Find common ground between impulsivity and stability.", finance: "Libra may prefer saving while Aries tends to spend; align on financial expectations." },
      "Aries-Scorpio": { score: 70, love: "Intense bond: both bring depth and passion. Build strong trust to handle challenges.", finance: "Aries can be impulsive; Scorpio is more cautious. Communicate and support each other in financial management." },
      "Aries-Sagittarius": { score: 95, love: "Excellent match! Both love adventure and freedom, quickly understanding each other and sharing desires.", finance: "Sagittarius is optimistic about money; Aries decides fast. They work well together toward financial goals." },
      "Aries-Capricorn": { score: 55, love: "Requires adaptation: Aries is impulsive, Capricorn seeks stability. Aries should respect Capricorn’s limits; Capricorn should stay open to spontaneity.", finance: "Capricorn is very prudent, which can cause tensions with Aries. Communication is key to avoid conflicts." },
      "Aries-Aquarius": { score: 80, love: "Similar in their desire to explore and live creatively. Both love discussing ideas and understand each other.", finance: "Aquarius brings innovative investment ideas; Aries adds drive. Collaborate on financial planning." },
      "Aries-Pisces": { score: 65, love: "An interesting mix: Aries is energetic, Pisces dreamy. Aries should be mindful of Pisces’ sensitivity.", finance: "Pisces are less focused on finances while Aries spends impulsively. Open talks help organize spending." },

      // Taurus x 12 – updated per provided material
      "Taurus-Aries": { 
        score: 60, 
        love: "This relationship can be challenging because Taurus is more stable while Aries is impulsive. Aries brings energy, Taurus prefers routine. Mutual understanding is crucial.", 
        finance: "Taurus is more conservative with money while Aries can spend impulsively. Discuss finances openly to avoid conflicts." 
      },
      "Taurus-Taurus": { 
        score: 85, 
        love: "Two Taurus individuals form a very stable and comfortable relationship. Both value loyalty and protecting the bond, making them highly compatible.", 
        finance: "Both are prudent with money and prefer saving. This brings financial stability, but avoid becoming too rigid or conservative." 
      },
      "Taurus-Gemini": { 
        score: 65, 
        love: "An interesting relationship due to differences. Taurus prefers stability while Gemini seeks variety. Taurus can open to new experiences; Gemini can appreciate comfort.", 
        finance: "Taurus will want to save while Gemini can be impulsive. Communicating about spending is essential to avoid conflicts." 
      },
      "Taurus-Cancer": { 
        score: 90, 
        love: "A highly compatible match. Cancer brings emotion and care; Taurus offers safety and stability. One of the most harmonious pairings.", 
        finance: "Both are prudent with money, helping build a solid financial future together. They make wise financial decisions." 
      },
      "Taurus-Leo": { 
        score: 55, 
        love: "Leo brings energy and wants center stage, while Taurus is more reserved. Tensions can arise, but respecting needs helps them work together.", 
        finance: "Leo tends to spend more while Taurus prefers saving. Find a balance and communicate financial goals." 
      },
      "Taurus-Virgo": { 
        score: 80, 
        love: "Based on stability and respect. Both are realistic and supportive, building a solid bond.", 
        finance: "Virgo is attentive and analytical; Taurus is practical. Together they make wise financial decisions and manage money well." 
      },
      "Taurus-Libra": { 
        score: 70, 
        love: "Libra brings an artistic and social side to Taurus’s sometimes reserved nature. This dynamic can bring a beautiful balance.", 
        finance: "Libra seeks harmony and prefers saving while Taurus is more traditional. Communication is essential to blend money styles." 
      },
      "Taurus-Scorpio": { 
        score: 75, 
        love: "An intense pairing. Scorpio is passionate; Taurus provides stability. Both must balance emotional and practical needs.", 
        finance: "Taurus is prudent while Scorpio can be more risky with spending. Find a shared money approach." 
      },
      "Taurus-Sagittarius": { 
        score: 60, 
        love: "Challenging because Sagittarius is adventurous and free while Taurus prefers stability. Respect each other’s needs and lifestyle.", 
        finance: "Sagittarius is prone to impulsive spending; Taurus prefers saving. Communication is key to avoid money conflicts." 
      },
      "Taurus-Capricorn": { 
        score: 90, 
        love: "Excellent combination! Both are driven and success-oriented. They support each other and build a strong, responsible bond.", 
        finance: "Both are practical and careful with money, allowing them to build a solid financial base and save together." 
      },
      "Taurus-Aquarius": { 
        score: 60, 
        love: "An unusual relationship: Aquarius brings new, eccentric ideas while Taurus is more traditional. This brings both challenges and growth opportunities.", 
        finance: "Aquarius may be more experimental with spending while Taurus is prudent. Open communication is needed to align on money." 
      },
      "Taurus-Pisces": { 
        score: 75, 
        love: "Can bring a deep emotional connection. Taurus offers stability while Pisces dream and bring creativity.", 
        finance: "Pisces may be less interested in money management while Taurus tends to be more prudent. Open discussions are essential to align financial approaches." 
      },
      // Gemini x 12 – updated per provided material
      "Gemini-Aries": { score: 85, love: "Full of energy and enthusiasm. Aries brings passion; Gemini brings open communication and fun. Great understanding and shared adventures.", finance: "Aries tends to be impulsive; Gemini indecisive. Collaborate and set a budget to avoid unnecessary spending." },
      "Gemini-Taurus": { score: 65, love: "Interesting but challenging. Taurus seeks stability; Gemini prefers variety. Differences can cause misunderstandings.", finance: "Taurus is prudent and saves; Gemini may spend impulsively. Open money talks are essential to find balance." },
      "Gemini-Gemini": { score: 80, love: "Fun relationship with engaging conversations; both complement each other and love exploring new ideas.", finance: "Both can be impulsive; set a budget and decide together how to manage money." },
      "Gemini-Cancer": { score: 55, love: "Can be complicated: Cancer is more emotional, Gemini more rational. Cancer may feel Gemini is not dedicated enough; Gemini may see Cancer as too emotive.", finance: "Cancer prefers saving; Gemini can be impulsive. Open money communication avoids conflicts." },
      "Gemini-Leo": { score: 75, love: "Vibrant and lively! Gemini brings variety while Leo brings charisma; a fun, engaging pairing.", finance: "Leo tends to be generous; Gemini can spend impulsively. Set a budget to keep balance." },
      "Gemini-Virgo": { score: 60, love: "Virgo is practical while Gemini is easily distracted. Differences can cause friction, but collaboration teaches both.", finance: "Virgo is prudent; Gemini more impulsive. Find a shared money management approach." },
      "Gemini-Libra": { score: 90, love: "Extremely compatible! Both are sociable and love to socialize. Mutual support and understanding.", finance: "Creative and innovative with finances; communication keeps balance." },
      "Gemini-Scorpio": { score: 55, love: "Intense: Scorpio brings depth, Gemini brings fun. Personality differences can trigger conflicts.", finance: "Scorpio may take more risks; Gemini can be indecisive. Reach alignment on finances." },
      "Gemini-Sagittarius": { score: 95, love: "Excellent match! Both love adventure and freedom, supporting each other’s exploration.", finance: "Both are creative with money, but should avoid excessive impulsive spending." },
      "Gemini-Capricorn": { score: 50, love: "Requires adaptation: Capricorn is serious and disciplined; Gemini is lighter. Mutual respect is essential.", finance: "Capricorn is prudent; Gemini may be impulsive. Communication is important to align on money." },
      "Gemini-Aquarius": { score: 90, love: "Fantastic pairing! Both love freedom, innovation and new ideas; deep, stimulating conversations.", finance: "Together they find creative money strategies and support each other's initiatives." },
      "Gemini-Pisces": { score: 75, love: "Interesting mix: Gemini is more rational while Pisces is dreamy. Both can learn from each other.", finance: "Pisces may be less practical; Gemini more impulsive. Open money talks help organize spending." },
      // Cancer x 12
      "Cancer-Aries": { score: 55, love: "Challenging: Cancer is more sensitive while Aries is impulsive. Cancer may feel Aries overlooks emotional needs; Aries may see Cancer as too emotional.", finance: "Cancer is prudent while Aries can spend impulsively. Open communication helps avoid financial misunderstandings." },
      "Cancer-Taurus": { score: 90, love: "Extremely compatible! Both seek stability and emotional security. Cancer brings depth; Taurus provides practical support.", finance: "Both are prudent, enabling a strong financial base. Collaboration in managing resources is key." },
      "Cancer-Gemini": { score: 55, love: "Can be complicated: Cancer is more emotional while Gemini is more rational and indecisive. Cancer may feel Gemini isn’t dedicated enough; Gemini may see Cancer as too sensitive.", finance: "Cancer prefers saving; Gemini may spend impulsively. Open financial discussion is essential." },
      "Cancer-Cancer": { score: 80, love: "Two Cancers form a deeply emotional, affectionate relationship. Loyal and connection-seeking, they understand each other well.", finance: "Both are prudent and prefer saving. Joint money management maintains stability.", friendship: "Deep, affectionate, loyal friendship.", spirituality: "Seek deep connections; strong emotional understanding.", activities: "Enjoy time together; homey and intimate activities." },
      "Cancer-Leo": { score: 60, love: "Differences can cause tension: Leo is more extroverted, Cancer more reserved. Cancer may see Leo as self-focused; Leo may see Cancer as overly dependent.", finance: "Leo tends to be generous while Cancer prefers stability. Balance is needed in money management.", friendship: "Tensions likely: extroverted Leo vs reserved Cancer.", spirituality: "Different spiritual approaches may cause misunderstandings.", activities: "Cancer prefers calmer moments; Leo seeks fun." },
      "Cancer-Virgo": { score: 85, love: "Both are sensitive and appreciate stability. Virgo is practical; Cancer is emotional; they complement each other.", finance: "Virgo is analytical; Cancer brings emotional prudence. Together they make wise financial decisions.", friendship: "Sensitive and complementary – they complete each other.", spirituality: "Cancer adds emotion to Virgo’s practical approach.", activities: "Enjoy activities bringing comfort and security." },
      "Cancer-Libra": { score: 70, love: "Libra brings refinement and sociability to Cancer’s life. Can develop into a balanced relationship with open communication.", finance: "Libra’s artistic approach meets Cancer’s practical one; collaborate and reach consensus.", friendship: "Refinement added by Libra; communication is essential.", spirituality: "Open dialogue needed about spiritual needs.", activities: "Together appreciate social activities." },
      "Cancer-Scorpio": { score: 90, love: "Deep and intense with strong emotional bonding and mutual support.", finance: "Both are prudent; open communication brings stability in finances." },
      "Cancer-Sagittarius": { score: 50, love: "Challenging: Sagittarius is adventurous while Cancer seeks security. Sagittarius may feel restricted; Cancer may feel overwhelmed by Sagittarius’ freedom.", finance: "Sagittarius is prone to impulsive spending; Cancer prefers stability. Communication avoids conflict." },
      "Cancer-Capricorn": { score: 80, love: "Strong pairing: Capricorn brings stability; Cancer brings emotion. A solid, respectful relationship.", finance: "Capricorn is very prudent; Cancer tends to save. Collaboration and shared strategy are essential." },
      "Cancer-Aquarius": { score: 55, love: "Differences: Aquarius is more independent while Cancer seeks intimacy. Open dialogue is essential.", finance: "Aquarius is more risk-taking; Cancer more practical. Find a common way to decide financially." },
      "Cancer-Pisces": { score: 90, love: "Extremely harmonious: both are emotional and empathic, fostering deep understanding and mutual support.", finance: "Both are sensitive with money; Cancer is more practical, Pisces more dreamy. Collaborate and share a financial vision." }
      ,
      // Leo x 12 – updated per provided material
      "Leo-Aries": { score: 90, love: "Extremely dynamic! Both are passionate, energetic and love adventures. Fantastic chemistry and mutual support.", finance: "Both can be impulsive spenders; set a shared budget to avoid issues.", friendship: "Dynamic and energetic.", spirituality: "Seek to enrich their spiritual path together.", activities: "Adventures and social activities." },
      "Leo-Taurus": { score: 60, love: "Differences create challenges: Taurus seeks stability while Leo wants to shine. Requires adaptation.", finance: "Leo is prone to spending; Taurus is conservative. Discuss openly and find compromise." },
      "Leo-Gemini": { score: 75, love: "High energy and fun. Both love communication and adventures, complementing each other.", finance: "Gemini can be indecisive, Leo likes to spend to shine. A clear budget prevents excess." },
      "Leo-Cancer": { score: 60, love: "Can be tense: Leo is extroverted, Cancer sensitive and reserved. Open communication helps needs alignment.", finance: "Leo is generous; Cancer prudent. Seek balance in money management." },
      "Leo-Leo": { score: 80, love: "Strong passion and energy. Mutual admiration with potential competition – respect is necessary.", finance: "Both can be generous; beware overspending." },
      "Leo-Virgo": { score: 50, love: "More complicated: Virgo is practical and analytical; Leo is impulsive. Virgo may see Leo as too dramatic.", finance: "Leo wants to spend; Virgo prefers saving. Communication avoids conflicts.", friendship: "Needs adaptation – practical Virgo vs expressive Leo.", spirituality: "Leo brings passion; Virgo brings structure.", activities: "Find balance between pleasures and activities." },
      "Leo-Libra": { score: 85, love: "Highly compatible! Libra brings balance and refinement; Leo offers energy and passion. Strong, fun team.", finance: "Both value aesthetics and may spend impulsively; manage together with clear rules." },
      "Leo-Scorpio": { score: 65, love: "Intense and challenging. Leo brings energy; Scorpio brings depth. Respect emotions and needs.", finance: "Leo can spend impulsively; Scorpio is more controlled. Reach a financial compromise." },
      "Leo-Sagittarius": { score: 95, love: "Wonderful combo! Both love adventure and freedom. Obvious passion and fun.", finance: "Optimistic and creative with money; still set a budget to avoid impulsivity." },
      "Leo-Capricorn": { score: 50, love: "Requires adaptation: Capricorn is serious and disciplined; Leo more playful. Be open to each other's needs.", finance: "Capricorn is prudent; Leo tends to spend. Collaborate on a shared financial strategy." },
      "Leo-Aquarius": { score: 80, love: "Brings innovation and energy. Both are independent and support creative ideas. Adventurous relationship.", finance: "Aquarius proposes innovative solutions; Leo enjoys beautiful things – keep open talks about spending." },
      "Leo-Pisces": { score: 70, love: "Interesting pairing: Leo brings energy and power; Pisces bring creativity and dreaminess. Misunderstandings possible, but can create beauty.", finance: "Leo spends impulsively; Pisces may be less practical. Open discussions about money are essential." },

      // Virgo x 12 – updated per provided material
      "Virgo-Aries": { score: 50, love: "Challenging: Aries is impulsive and passionate, Virgo practical and analytical. Different styles can cause misunderstandings.", finance: "Virgo prefers organized money handling; Aries can spend impulsively. Communicate to reach compromise." },
      "Virgo-Taurus": { score: 85, love: "Highly compatible: both seek stability and security. Virgo is meticulous; Taurus steady – emotionally fulfilling.", finance: "Both are prudent and prefer saving; can build a stable financial future together." },
      "Virgo-Gemini": { score: 60, love: "Personality differences: Gemini sociable and indecisive; Virgo serious and detail-focused. Needs adaptation.", finance: "Gemini may be impulsive; Virgo analytical. Collaborate for efficient money management." },
      "Virgo-Cancer": { score: 85, love: "Harmonious: Virgo brings stability; Cancer brings emotion. Sensitive and loyal; strong bond.", finance: "Cancer prefers saving; Virgo is practical. Collaborate on finances." },
      "Virgo-Leo": { score: 50, love: "Requires adaptation: Leo is dramatic and attention-seeking; Virgo practical. Respect each other's needs.", finance: "Leo impulsive with spending; Virgo disciplined – tensions possible." },
      "Virgo-Virgo": { score: 90, love: "Very stable and understanding relationship. Loyalty and emotional support.", finance: "Highly organized and prudent with money; save efficiently and set long-term goals." },
      "Virgo-Libra": { score: 70, love: "Libra brings balance and beauty; Virgo brings stability. Works well with open emotional expression.", finance: "Virgo practical; Libra may be impulsive – blending approaches can lead to healthy finances." },
      "Virgo-Scorpio": { score: 75, love: "Deep and intense: Scorpio brings passion; Virgo practical foundation. Open communication needed.", finance: "Virgo is prudent; Scorpio more risk-taking – collaboration and communication are key." },
      "Virgo-Sagittarius": { score: 50, love: "Complicated: Sagittarius wants freedom and adventure; Virgo prefers stability. Mutual respect is essential.", finance: "Sagittarius spends impulsively; Virgo prefers saving. Open communication avoids conflicts." },
      "Virgo-Capricorn": { score: 90, love: "Excellent: both dedicated and hardworking; build strong, lasting relationships.", finance: "Capricorn seeks stability; Virgo provides analysis. Smart, strategic financial decisions together." },
      "Virgo-Aquarius": { score: 60, love: "Needs compromise: Aquarius is more eccentric and freedom-loving; Virgo seeks structure. Respect differences.", finance: "Aquarius brings innovative ideas; Virgo focuses on detail and execution. Collaboration is essential." },
      "Virgo-Pisces": { score: 75, love: "Emotional and deep: Virgo offers stability; Pisces bring creativity and dreaminess. Communicate openly.", finance: "Pisces more idealistic, Virgo more practical. Sync on resource management." },

      // Libra x 12 – updated per provided material
      "Libra-Aries": { score: 60, love: "Challenging: Aries is energetic and impulsive while Libra seeks harmony. Open communication helps meet needs.", finance: "Libra may spend on beauty, Aries is impulsive – agree on a shared budget to avoid conflicts." },
      "Libra-Taurus": { score: 80, love: "Highly compatible! Taurus brings stability, Libra brings appreciation and support. Both seek a balanced, affectionate relationship.", finance: "Both are prudent and can work together to build a stable financial future." },
      "Libra-Gemini": { score: 90, love: "Excellent! Both love communication and fun, forming a strong, complementary bond.", finance: "Both can be impulsive but together can develop creative ways to manage money." },
      "Libra-Cancer": { score: 70, love: "Libra brings balance, Cancer brings emotion. Works well when needs are understood and communication is open.", finance: "Cancer prefers saving while Libra may spend impulsively. Discuss finances to prevent conflicts." },
      "Libra-Leo": { score: 80, love: "Full of energy and vitality. Leo brings passion; Libra elegance and support. Mutual admiration.", finance: "Leo may spend to shine; Libra seeks balance. Collaborate on money management." },
      "Libra-Virgo": { score: 60, love: "Virgo practical vs. Libra idealist. Differences can cause friction, but they can learn from each other.", finance: "Virgo is prudent; Libra more spendy. Collaborate on managing money." },
      "Libra-Libra": { score: 85, love: "Harmonious and understanding. Both need balance and appreciation.", finance: "Both may be impulsive, but can co-manage budget and savings effectively." },
      "Libra-Scorpio": { score: 55, love: "Complex: Scorpio brings depth; Libra seeks harmony. Respect emotions and lifestyles.", finance: "Scorpio may be more risk-taking; Libra seeks stability. Reach financial compromise." },
      "Libra-Sagittarius": { score: 75, love: "Vibrant! Sagittarius brings adventure; Libra brings balance – fun and interesting relationship.", finance: "Sagittarius spends impulsively; Libra prefers stability. Communication avoids financial conflicts." },
      "Libra-Capricorn": { score: 60, love: "Requires effort: Capricorn pragmatic; Libra idealist. Express needs clearly.", finance: "Capricorn disciplined; Libra spends more. Collaboration improves money management." },
      "Libra-Aquarius": { score: 85, love: "Dynamic and innovative. Both value freedom and creativity; deep mutual understanding.", finance: "Aquarius brings original ideas; Libra maintains financial boundaries. Work together." },
      "Libra-Pisces": { score: 70, love: "Emotional and deep. Libra offers balance; Pisces bring dreams and creativity. Mutual support.", finance: "Pisces more idealistic; Libra more practical. Open talks avoid confusion." },

      // Scorpio x 12
      "Scorpio-Aries": { score: 70, love: "Intense and passionate. Aries brings energy and enthusiasm; Scorpio offers emotional depth. Conflicts possible due to differing styles.", finance: "Aries is impulsive; Scorpio calculated. Collaborate to balance the budget." },
      "Scorpio-Taurus": { score: 80, love: "Solid relationship: Taurus brings stability, Scorpio emotional intensity. Loyal and dedicated pair.", finance: "Taurus steady and saving; Scorpio prudent and calculated. Together can prosper financially." },
      "Scorpio-Gemini": { score: 55, love: "Challenging: Gemini is extroverted and dynamic; Scorpio deep and emotion-focused. Differences create tension.", finance: "Gemini spends impulsively; Scorpio is more reserved. Open talks prevent financial conflict." },
      "Scorpio-Cancer": { score: 90, love: "Deep, empathic bond. Sensitive and loyal; strong harmony.", finance: "Cancer saves; Scorpio calculates – excellent collaboration in money management." },
      "Scorpio-Leo": { score: 65, love: "Tumultuous yet passionate. Leo seeks attention; Scorpio seeks emotional intensity. Mutual respect strengthens the bond.", finance: "Leo is extravagant; Scorpio disciplined. Find spending balance." },
      "Scorpio-Virgo": { score: 80, love: "Promising: Virgo brings logic and order; Scorpio brings emotion and passion. Balanced couple.", finance: "Virgo detail-oriented; Scorpio tactical – efficient resource management." },
      "Scorpio-Libra": { score: 60, love: "Challenging: Scorpio intense and emotional; Libra seeks harmony. Learn each other's differences.", finance: "Libra may spend impulsively; Scorpio prefers reserves. Collaborate to avoid disputes." },
      "Scorpio-Scorpio": { score: 90, love: "Very intense and deep. Strong connection, but watch possessiveness and jealousy.", finance: "Both prudent and calculated – smart decisions and effective saving." },
      "Scorpio-Sagittarius": { score: 50, love: "Challenging: Sagittarius loves freedom; Scorpio seeks intensity and commitment. Differences can cause misunderstandings.", finance: "Sagittarius impulsive and risk-taking; Scorpio protective of finances. Communicate to avoid tension." },
      "Scorpio-Capricorn": { score: 75, love: "Solid, respectful relationship. Capricorn brings stability; Scorpio brings passion. Good long-term potential.", finance: "Capricorn highly organized; Scorpio tactical and prudent. Intelligent money management." },
      "Scorpio-Aquarius": { score: 55, love: "Requires effort: Aquarius independent and rebellious; Scorpio seeks emotional connection. Respect is crucial.", finance: "Aquarius innovative; Scorpio cautious. Collaborate to manage resources well." },
      "Scorpio-Pisces": { score: 90, love: "Ideal pairing: intuitive and emotional; deep bond and mutual support.", finance: "Scorpio cautious; Pisces dreamy – balance through open communication." },
      // Sagittarius x 12 – updated
      "Sagittarius-Aries": { score: 90, love: "Extremely energetic and passionate. Both are adventurous and love challenges – vibrant, dynamic relationship.", finance: "Both can be impulsive; need a joint plan to avoid excess." },
      "Sagittarius-Taurus": { score: 55, love: "Can be complicated: Sagittarius seeks freedom; Taurus prefers stability. Differences can create tension.", finance: "Sagittarius spends impulsively; Taurus is conservative – collaborate on expenses." },
      "Sagittarius-Gemini": { score: 85, love: "High energy: both love communication and fun, forming a tight bond.", finance: "Both impulsive; a shared budget helps keep control." },
      "Sagittarius-Cancer": { score: 60, love: "Challenging: Cancer seeks comfort and stability; Sagittarius independence – misunderstandings may arise.", finance: "Cancer saves and is cautious; Sagittarius is impulsive – collaborate and communicate well." },
      "Sagittarius-Leo": { score: 90, love: "Lots of passion and enthusiasm. Both love adventure and support each other’s ambitions.", finance: "Can be impulsive yet help each other find creative financial solutions." },
      "Sagittarius-Virgo": { score: 55, love: "Requires compromise: Virgo seeks order and stability; Sagittarius freedom and spontaneity.", finance: "Virgo conservative; Sagittarius impulsive – communication is essential." },
      "Sagittarius-Libra": { score: 80, love: "Great chemistry: sociable and fun – harmonious bond.", finance: "Both may be impulsive; collaboration enables efficient budgeting." },
      "Sagittarius-Scorpio": { score: 50, love: "Challenging: Scorpio seeks deep commitment; Sagittarius prefers freedom – tensions likely.", finance: "Sagittarius impulsive; Scorpio cautious – communicate openly." },
      "Sagittarius-Sagittarius": { score: 95, love: "Connection full of energy and optimism. Freedom and adventure – rich shared experiences.", finance: "Both can be impulsive; a joint budget supports shared adventures." },
      "Sagittarius-Capricorn": { score: 60, love: "Needs effort: Capricorn serious; Sagittarius jovial. Respect each other’s needs.", finance: "Capricorn disciplined; Sagittarius impulsive – collaboration finds efficient approaches." },
      "Sagittarius-Aquarius": { score: 90, love: "Excellent! Appreciate freedom and creativity; innovative, dynamic relationship.", finance: "Aquarius brings original ideas; Sagittarius is open – collaborate efficiently on money." },
      "Sagittarius-Pisces": { score: 75, love: "Emotional and deep: Sagittarius brings optimism and adventure; Pisces bring sensitivity and empathy.", finance: "Pisces more dreamy; Sagittarius impulsive – open communication prevents confusion." },
      // Capricorn x 12
      "Capricorn-Aries": { score: 60, love: "Stability vs. spontaneity; work.", finance: "Aries impulsive, Capricorn prudent – plan." },
      "Capricorn-Taurus": { score: 90, love: "Very solid: stability and loyalty.", finance: "Shared goals; saving and investing." },
      "Capricorn-Gemini": { score: 55, love: "Serious vs. social; misunderstandings.", finance: "Capricorn conservative, Gemini impulsive – talk." },
      "Capricorn-Cancer": { score: 80, love: "Emotion + stability; balance.", finance: "Cancer saving, Capricorn disciplined – strong base." },
      "Capricorn-Leo": { score: 65, love: "Serious vs. playful; adapt.", finance: "Leo spends, Capricorn prudent – coordination." },
      "Capricorn-Virgo": { score: 95, love: "Excellent: discipline and dedication.", finance: "Strong organization; financial stability." },
      "Capricorn-Libra": { score: 60, love: "Pragmatic vs. idealist; effort.", finance: "Discipline vs. spending – collaboration." },
      "Capricorn-Scorpio": { score: 75, love: "Mutual respect; stable and deep.", finance: "Tactical + organized; good management." },
      "Capricorn-Sagittarius": { score: 60, love: "Plan vs. freedom; balance.", finance: "Budget control vs. impulse – compromise." },
      "Capricorn-Capricorn": { score: 90, love: "Stability and dedication; long-lasting.", finance: "Organized and prudent; security." },
      "Capricorn-Aquarius": { score: 70, love: "Stability vs. independence; can work.", finance: "Innovative ideas with prudence – collaborate." },
      "Capricorn-Pisces": { score: 75, love: "Stability + emotional depth.", finance: "Calculated + creative; beneficial management." },
      // Aquarius x 12
      "Aquarius-Aries": { score: 85, love: "Energy and adventure; freedom.", finance: "New ideas; temper spending." },
      "Aquarius-Taurus": { score: 55, love: "Freedom vs. stability; differences.", finance: "Taurus conservative, Aquarius impulsive – talk." },
      "Aquarius-Gemini": { score: 90, love: "Sociable, communicative; harmony.", finance: "Financial innovation; control needed." },
      "Aquarius-Cancer": { score: 60, love: "Independence vs. emotional connection; compromise.", finance: "Cancer prudent, Aquarius impulsive – accord." },
      "Aquarius-Leo": { score: 70, love: "Fun and energetic; independence.", finance: "Extravagance vs. ingenuity – communication." },
      "Aquarius-Virgo": { score: 55, love: "Eccentric vs. detail-oriented; challenges.", finance: "Prudence vs. impulse – balance." },
      "Aquarius-Libra": { score: 80, love: "Harmony, chemistry, ideas.", finance: "Originality with limits; efficient collaboration." },
      "Aquarius-Scorpio": { score: 50, love: "Independent vs. intense; effort.", finance: "Reserve vs. risk – financial accord." },
      "Aquarius-Sagittarius": { score: 90, love: "Freedom and creativity; dynamic.", finance: "Shared impulse – budget rules." },
      "Aquarius-Capricorn": { score: 60, love: "Freedom vs. strict plan; work.", finance: "Innovation vs. prudence – joint plan." },
      "Aquarius-Aquarius": { score: 95, love: "Originality and mutual understanding.", finance: "Innovative strategies; mutual support." },
      "Aquarius-Pisces": { score: 75, love: "Creative and emotional; deep link.", finance: "Dreamy + non-materialist – communication." },
      // Pisces x 12 – updated
      "Pisces-Aries": { score: 55, love: "Can be tumultuous: Aries is impulsive and energetic, while Pisces are sensitive and contemplative. Differences can cause tension.", finance: "Aries may spend impulsively, while Pisces are more dreamy – good communication is required to manage money." },
      "Pisces-Taurus": { score: 80, love: "Quite harmonious: Taurus offers stability; Pisces bring deep emotion and intimacy.", finance: "Taurus is conservative with expenses; Pisces add creative ideas – they can find a healthy balance." },
      "Pisces-Gemini": { score: 70, love: "Interesting but complicated: Pisces seek emotional depth; Gemini are sociable and more superficial. Frequent communication is important.", finance: "Gemini may spend impulsively; Pisces can be indecisive – collaboration is essential." },
      "Pisces-Cancer": { score: 90, love: "Extremely compatible: both are emotional and empathic; deep bond based on mutual understanding and support.", finance: "Cancer is prudent and attentive; Pisces bring creativity – efficient collaboration." },
      "Pisces-Leo": { score: 65, love: "Creative yet challenging: Leo seeks the spotlight; Pisces are more withdrawn. Balance is needed.", finance: "Leo can be extravagant; Pisces more dreamy – open talks about spending are needed." },
      "Pisces-Virgo": { score: 70, love: "Requires work: practical Virgo vs. dreamy Pisces; can complement each other in love.", finance: "Organized, prudent Virgo helps Pisces manage money more efficiently." },
      "Pisces-Libra": { score: 75, love: "Pleasant and harmonious: Libra brings balance; Pisces bring emotional depth.", finance: "Libra is less impulsive; Pisces add creativity – they help each other with finances." },
      "Pisces-Scorpio": { score: 85, love: "Very strong: both emotional and deep; intense bond based on trust and intimacy.", finance: "Scorpio is cautious; Pisces add original ideas – efficient money management together." },
      "Pisces-Sagittarius": { score: 75, love: "Emotional and adventurous: Sagittarius brings energy; Pisces bring emotion – beautiful connection.", finance: "Sagittarius impulsive, Pisces dreamy – open dialogue to avoid financial confusion." },
      "Pisces-Capricorn": { score: 75, love: "Can work well: Capricorn brings stability; Pisces bring emotional depth – respect differences.", finance: "Capricorn calculated; Pisces bring innovative ideas – beneficial collaboration in resource management." },
      "Pisces-Aquarius": { score: 70, love: "Interesting but with challenges: Aquarius is independent; Pisces more emotional – mutual respect required.", finance: "Aquarius less focused on money; Pisces creative – communication is essential." },
      "Pisces-Pisces": { score: 90, love: "Extremely deep, emotional bond. They understand each other and offer support in difficult moments.", finance: "Both may be dreamy, but together can find effective ways to manage money, encouraging financial creativity." }
    }
  },
  numerologyGeneral: {
    "1": "Life Path 1 represents initiative, leadership and a strong drive to succeed. People with 1 are independent, motivated and result-oriented, shaping how they love and manage finances.",
    "2": "Life Path 2 symbolizes balance, partnership and empathy. People with 2 seek harmony in relationships and bring cooperation and sensitivity to financial decisions.",
    "3": "Life Path 3 symbolizes creativity and joy. People with this number are sociable, communicative, and bring cheer to others. They enjoy spontaneity and the pleasure of living, which strongly influences their relationships and financial approach.",
    "4": "Life Path 4 symbolizes stability, order, and dedication to work. People with this number are often grounded and responsible, with a natural ability to build and maintain structures in relationships, career, and everyday life. These traits deeply influence their love life and financial management.",
    "5": "Life Path 5 is associated with freedom, adventure and change. People with 5 love variety and new experiences, which reflects in relationship dynamics and financial choices.",
    "6": "Life Path 6 represents love, responsibility and care for others. People with 6 are family-oriented and seek stability, aiming for emotional balance and financial security.",
    "7": "Life Path 7 symbolizes introspection, analysis and spirituality. People with 7 search for deeper truths and meaning, influencing their choices in love and their careful, analytical handling of resources.",
    "8": "Life Path 8 stands for power, success and responsibility. People with 8 are ambitious and pragmatic, oriented toward achievement and strategic financial management.",
    "9": "Life Path 9 represents humanity, generosity and idealism. People with 9 are empathetic and altruistic, reflected in relationships and a less materialistic view of money."
  },
  numerology: {
    // Number 1 pairs
    "1-1": { score: 90, love: "Dynamic and energetic; strong leadership on both sides. Learn to yield to keep harmony.", finance: "Great ambition; invest smart and avoid status-driven overspending." },
    "1-2": { score: 70, love: "2's empathy balances 1's force; can build a stable bond. 1 should avoid controlling behavior.", finance: "1 initiates, 2 organizes; solid expense control together." },
    // Adjusted per provided material for Number 3: 1-3 = 75
    "1-3": { score: 75, love: "The relationship between 1 and 3 can be full of energy and enthusiasm. 1 is a natural leader, while 3 brings creativity and fun. Balance is needed so 1 does not become too dominant.", finance: "Financially, 1 brings vision and planning, while 3 finds innovative solutions. Coordinate to avoid impulsive spending." },
    "1-4": { score: 60, love: "Initiative vs. stability; open communication needed.", finance: "1 takes risks, 4 saves – agree on a common plan." },
    "1-5": { score: 75, love: "Very dynamic: 1 brings initiative, 5 brings exploration; ensure 1 doesn’t feel overwhelmed.", finance: "1 is more disciplined, 5 more impulsive – align financial goals." },
    "1-6": { score: 70, love: "Leadership (1) meets care and balance (6); respect emotional needs.", finance: "1 invests and risks, 6 seeks stability – discuss goals openly." },
    "1-7": { score: 65, love: "Action (1) vs. analysis (7); tension possible but also complementarity.", finance: "1 takes risks, 7 is cautious – build a joint strategy." },
    "1-8": { score: 75, love: "Both success-oriented; support each other to avoid competition.", finance: "Seek opportunities and progress; communication prevents conflicts." },
    "1-9": { score: 65, love: "1 focuses on achievement, 9 on altruism; differences can enrich or clash.", finance: "1 accumulates, 9 is less material – align expectations to avoid friction." },

    // Number 2 pairs
    "2-2": { score: 90, love: "Deep bond based on understanding and support; loving, harmonious environment.", finance: "Conservative and careful; joint planning brings stability." },
    "2-3": { score: 80, love: "3 adds creativity and energy; 2 should express feelings to avoid misunderstandings.", finance: "3 brings inventive ideas, 2 ensures responsible decisions." },
    "2-4": { score: 70, love: "4 brings stability that helps 2 feel safe; avoid over-dependence on stability.", finance: "4 focuses on savings, 2 plans – effective and responsible management." },
    "2-5": { score: 65, love: "5 brings adventure; 2 may feel uneasy with unpredictability. Communicate openly.", finance: "5 spends on experiences, 2 saves – compromise to prevent conflict." },
    "2-6": { score: 85, love: "Strong and caring relationship; both family-oriented.", finance: "6 provides safety, 2 contributes saving strategies – very good resource management." },
    "2-7": { score: 60, love: "7 is introspective, 2 seeks emotional closeness; allow time to understand each other.", finance: "7 analytical, 2 cooperative – complementary methods." },
    "2-8": { score: 75, love: "2 supports 8’s ambitions; balance career and home.", finance: "Both aim for success; 2 maintains stability, 8 initiates profitable projects." },
    "2-9": { score: 80, love: "Number 2 brings empathy and support, balancing 9's idealism. Both seek a relationship based on affection and understanding, forming a deep bond.", finance: "Financially, 2 adds a caring approach while 9 contributes a broader vision, helping both manage resources responsibly." },

    // Number 3 pairs
    "3-3": { score: 90, love: "Shared creativity and joy; exuberant relationship with mutual understanding.", finance: "Prone to impulse; set a saving strategy." },
    "3-4": { score: 70, love: "4 offers stability, 3 brings creativity; respect 4’s need for order.", finance: "4 plans and saves, 3 tends to spontaneous expenses; coordinate." },
    "3-5": { score: 85, love: "Adventure and spontaneity; freedom and fun together.", finance: "Innovative ideas; watch impulsive spending." },
    "3-6": { score: 75, love: "6 adds stability and care; good balance between duty and joy.", finance: "6 plans responsibly, 3 adds creativity; beneficial teamwork." },
    "3-7": { score: 60, love: "3 sociable, 7 introspective; tensions possible and learning too.", finance: "7’s analysis helps 3 organize; respect 7’s solitude needs." },
    "3-8": { score: 70, love: "8 is achievement-focused, 3 brings energy and optimism.", finance: "8 crafts strategies, 3 ideates; mind overspending." },
    "3-9": { score: 75, love: "This pairing can bring a joyful dynamic: 3 contributes creativity and fun while 9 brings depth and humanitarian spirit. Positive overall, but 9 should not get lost in ideals.", finance: "Financially, 3 may be impulsive while 9 is less materialistic. 9 should help 3 manage expenses with a clear budget." },

    // Number 4 pairs
    "4-4": { score: 90, love: "Very stable, shared values and trust.", finance: "Organized and practical; smart savings and investments." },
    "4-5": { score: 60, love: "Adventure (5) vs. stability (4); tensions but growth possible.", finance: "5 impulsive, 4 cautious – clear plan needed." },
    "4-6": { score: 80, love: "Responsibility and care; positive dynamic.", finance: "Responsible approach; solid financial base." },
    "4-7": { score: 65, love: "Practical (4) vs. contemplative (7); possible misunderstandings and depth.", finance: "7 analytic + 4 stability – collaborate for balance." },
    "4-8": { score: 80, love: "Stability (4) + ambition (8); strong bond; avoid rivalry.", finance: "8 seeks material success, 4 organizes – reach goals." },
    "4-9": { score: 70, love: "A strong yet challenging bond: 4 brings stability while 9 brings idealism. 9 should honor 4’s need for order and 4 should appreciate 9’s vision.", finance: "Financially, 4 favors savings and practicality while 9 cares less about material goods. Collaboration is key to balance." },

    // Number 5 pairs
    "5-5": { score: 90, love: "Adventure and spontaneity; strong bond through exploration.", finance: "Relaxed about money – set a joint budget." },
    "5-6": { score: 65, love: "6 family-oriented vs. 5 freedom; communicate to coexist.", finance: "6 plans, 5 impulsive – define rules." },
    "5-7": { score: 60, love: "5 social, 7 introspective; adjustment needed.", finance: "7’s analysis helps 5 clarify spending." },
    "5-8": { score: 65, love: "5 enthusiasm, 8 achievement – support ambitions.", finance: "8 targets success, 5 brings ideas – curb impulsivity." },
    "5-9": { score: 60, love: "An adventurous (5) and idealistic (9) mix that needs open communication to avoid misunderstandings.", finance: "5 can be impulsive while 9 is generous. Agree on a shared strategy to prevent financial issues." },

    // Number 6 pairs
    "6-6": { score: 90, love: "Deep love, responsibility and family focus.", finance: "Excellent money management; savings and wise decisions." },
    "6-7": { score: 60, love: "7’s introspection requires 6 to respect solitude needs.", finance: "7 analytic, 6 caring – balance planning/spontaneity." },
    "6-8": { score: 70, love: "8 ambitious, 6 supportive; avoid neglect.", finance: "8 invests, 6 manages expenses – success with dialogue." },
    "6-9": { score: 80, love: "A strong bond: both 6 and 9 value care and empathy, leading to deep understanding.", finance: "Financially, 6 brings responsibility while 9 brings idealism. Together they can build a stable, healthy situation." },

    // Number 7 pairs
    "7-7": { score: 90, love: "Deep bond based on understanding and introspection.", finance: "Analytical, serious outlook; efficient resources management." },
    "7-8": { score: 60, love: "8 achievement vs. 7 contemplation; respect values.", finance: "8 action, 7 analysis – find common ground." },
    "7-9": { score: 75, love: "A deep relationship centered on compassion and understanding: 9 adds humanitarian vision and 7 brings spiritual analysis.", finance: "Financially, 9 is less material while 7 seeks safety. Communicate expectations to avoid disagreements." },

    // Number 8 pairs
    "8-8": { score: 90, love: "Very strong, ambition and shared success.", finance: "Highly efficient; seize opportunities well." },
    "8-9": { score: 60, love: "A fascinating dynamic: 8 is focused on power and achievements while 9 is altruistic. 8 should keep 9’s humanitarian side in mind.", finance: "Finances can be a source of conflict: 8 tends to invest boldly while 9 prefers giving. Communication is crucial for harmony." },

    // Number 9 pairs
    "9-9": { score: 90, love: "Two people with Life Path 9 form a very deep bond, sharing ideals and aspirations and a desire to make a difference.", finance: "Financially, this pairing is less materialistic. Align values and discuss resource management together." }
  }
};

export default compatibilityDataEN;


