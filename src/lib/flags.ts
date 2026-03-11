/**
 * Maps country names to ISO 3166-1 alpha-2 codes for flag images
 * Usage: getFlagUrl(countryName) => 'https://flagcdn.com/w40/us.png'
 * For sub-national: gb-eng, gb-sct, gb-wls, gb-nir
 */

const COUNTRY_TO_FLAG: Record<string, string> = {
  'Afghanistan':'af','South Africa':'za','England':'gb-eng','Albania':'al','Algeria':'dz','Germany':'de',
  'Andorra':'ad','Angola':'ao','Antigua and Barbuda':'ag','Saudi Arabia':'sa','Argentina':'ar','Armenia':'am',
  'Australia':'au','Austria':'at','Azerbaijan':'az','Bahamas':'bs','Bahrain':'bh','Bangladesh':'bd',
  'Barbados':'bb','Belgium':'be','Belize':'bz','Benin':'bj','Bhutan':'bt','Belarus':'by','Myanmar':'mm',
  'Bolivia':'bo','Bosnia and Herzegovina':'ba','Botswana':'bw','Brazil':'br','Brunei':'bn','Bulgaria':'bg',
  'Burkina Faso':'bf','Burundi':'bi','Cambodia':'kh','Cameroon':'cm','Canada':'ca','Cape Verde':'cv',
  'Chile':'cl','China':'cn','Cyprus':'cy','Colombia':'co','Comoros':'km','Congo':'cg',
  'DR Congo':'cd','North Korea':'kp','South Korea':'kr','Costa Rica':'cr','Ivory Coast':'ci',
  'Croatia':'hr','Cuba':'cu','Denmark':'dk','Djibouti':'dj','Dominica':'dm','Egypt':'eg',
  'United Arab Emirates':'ae','Ecuador':'ec','Eritrea':'er','Spain':'es','Estonia':'ee',
  'United States':'us','USA':'us','US':'us','Ethiopia':'et','Fiji':'fj','Finland':'fi','France':'fr',
  'Gabon':'ga','Gambia':'gm','Georgia':'ge','Ghana':'gh','Greece':'gr','Grenada':'gd','Guatemala':'gt',
  'Guinea':'gn','Guinea-Bissau':'gw','Equatorial Guinea':'gq','Guyana':'gy','Haiti':'ht','Honduras':'hn',
  'Hungary':'hu','India':'in','Indonesia':'id','Iraq':'iq','Iran':'ir','Ireland':'ie','Iceland':'is',
  'Israel':'il','Italy':'it','Jamaica':'jm','Japan':'jp','Jordan':'jo','Kazakhstan':'kz','Kenya':'ke',
  'Kyrgyzstan':'kg','Kiribati':'ki','Kuwait':'kw','Kosovo':'xk','Laos':'la','Lesotho':'ls','Latvia':'lv',
  'Lebanon':'lb','Liberia':'lr','Libya':'ly','Liechtenstein':'li','Lithuania':'lt','Luxembourg':'lu',
  'North Macedonia':'mk','Madagascar':'mg','Malaysia':'my','Malawi':'mw','Maldives':'mv','Mali':'ml',
  'Malta':'mt','Morocco':'ma','Mauritius':'mu','Mauritania':'mr','Mexico':'mx','Micronesia':'fm',
  'Moldova':'md','Monaco':'mc','Mongolia':'mn','Montenegro':'me','Mozambique':'mz','Namibia':'na',
  'Nauru':'nr','Nepal':'np','Nicaragua':'ni','Niger':'ne','Nigeria':'ng','Norway':'no',
  'New Zealand':'nz','Oman':'om','Uganda':'ug','Uzbekistan':'uz','Pakistan':'pk','Palau':'pw',
  'Panama':'pa','Papua New Guinea':'pg','Paraguay':'py','Netherlands':'nl','Peru':'pe',
  'Philippines':'ph','Poland':'pl','Portugal':'pt','Puerto Rico':'pr','Qatar':'qa',
  'Central African Republic':'cf','Dominican Republic':'do','Czech Republic':'cz','Romania':'ro',
  'United Kingdom':'gb','Russia':'ru','Rwanda':'rw','Saint Kitts and Nevis':'kn','San Marino':'sm',
  'Saint Vincent and the Grenadines':'vc','Saint Lucia':'lc','Solomon Islands':'sb','El Salvador':'sv',
  'Samoa':'ws','Sao Tome and Principe':'st','Senegal':'sn','Serbia':'rs','Seychelles':'sc',
  'Sierra Leone':'sl','Singapore':'sg','Slovakia':'sk','Slovenia':'si','Somalia':'so','Sudan':'sd',
  'South Sudan':'ss','Sri Lanka':'lk','Sweden':'se','Switzerland':'ch','Suriname':'sr','Syria':'sy',
  'Tajikistan':'tj','Tanzania':'tz','Chad':'td','Thailand':'th','East Timor':'tl','Togo':'tg',
  'Tonga':'to','Trinidad and Tobago':'tt','Tunisia':'tn','Turkmenistan':'tm','Turkey':'tr',
  'Ukraine':'ua','Uruguay':'uy','Vanuatu':'vu','Vatican':'va','Venezuela':'ve','Vietnam':'vn',
  'Yemen':'ye','Zambia':'zm','Zimbabwe':'zw','Eswatini':'sz','Marshall Islands':'mh','Tuvalu':'tv',
  'Palestine':'ps','Taiwan':'tw','Scotland':'gb-sct','Wales':'gb-wls','Northern Ireland':'gb-nir',
}

/**
 * Get flag image URL from flagcdn.com
 * @param country - Country name from database
 * @param width - Image width (default 40)
 * @returns URL string or null if not found
 */
export function getFlagUrl(country: string, width: number = 40): string | null {
  const code = COUNTRY_TO_FLAG[country]
  if (!code) return null
  return `https://flagcdn.com/w${width}/${code}.png`
}

/**
 * Get the 2-letter flag code for a country name
 */
export function getFlagCode(country: string): string | null {
  return COUNTRY_TO_FLAG[country] || null
}

/**
 * Get flag emoji from country name (fallback)
 */
export function getFlagEmoji(country: string): string {
  const code = COUNTRY_TO_FLAG[country]
  if (!code || code.includes('-')) return '🌍' // sub-national flags don't have emoji
  return String.fromCodePoint(...code.toUpperCase().split('').map(c => c.charCodeAt(0) + 127397))
}

export { COUNTRY_TO_FLAG }
