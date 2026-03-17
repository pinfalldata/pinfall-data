'use client'

import { useState } from 'react'

/**
 * Bulletproof country flag component.
 * Primary: SVG flag from jsDelivr (lipis/flag-icons - extremely reliable CDN)
 * Fallback: Colored badge with 2-letter country code (works EVERYWHERE)
 */

const COUNTRY_CODES: Record<string, string> = {
  'Afghanistan':'af','Albania':'al','Algeria':'dz','Andorra':'ad','Angola':'ao',
  'Argentina':'ar','Armenia':'am','Australia':'au','Austria':'at','Azerbaijan':'az',
  'Bahamas':'bs','Bahrain':'bh','Bangladesh':'bd','Barbados':'bb','Belarus':'by',
  'Belgium':'be','Belize':'bz','Bermuda':'bm','Bolivia':'bo',
  'Bosnia and Herzegovina':'ba','Botswana':'bw','Brazil':'br','Brunei':'bn',
  'Bulgaria':'bg','Cambodia':'kh','Cameroon':'cm','Canada':'ca','Chile':'cl',
  'China':'cn','Colombia':'co','Costa Rica':'cr','Croatia':'hr','Cuba':'cu',
  'Cyprus':'cy','Czech Republic':'cz','Czechia':'cz','Denmark':'dk',
  'Dominican Republic':'do','Ecuador':'ec','Egypt':'eg','El Salvador':'sv',
  'England':'gb-eng','Estonia':'ee','Eswatini':'sz','Ethiopia':'et',
  'Fiji':'fj','Finland':'fi','France':'fr','Georgia':'ge','Germany':'de',
  'Ghana':'gh','Greece':'gr','Guatemala':'gt','Guinea':'gn','Guyana':'gy',
  'Haiti':'ht','Honduras':'hn','Hungary':'hu','Iceland':'is','India':'in',
  'Indonesia':'id','Iran':'ir','Iraq':'iq','Ireland':'ie','Israel':'il',
  'Italy':'it','Jamaica':'jm','Japan':'jp','Jordan':'jo','Kazakhstan':'kz',
  'Kenya':'ke','Kosovo':'xk','Kuwait':'kw','Laos':'la','Latvia':'lv',
  'Lebanon':'lb','Liechtenstein':'li','Lithuania':'lt','Luxembourg':'lu',
  'Malaysia':'my','Mali':'ml','Malta':'mt','Mexico':'mx','Moldova':'md',
  'Monaco':'mc','Mongolia':'mn','Montenegro':'me','Morocco':'ma',
  'Mozambique':'mz','Myanmar':'mm','Namibia':'na','Nepal':'np',
  'Netherlands':'nl','New Zealand':'nz','Nicaragua':'ni','Nigeria':'ng',
  'North Korea':'kp','Northern Ireland':'gb-nir','Norway':'no','Oman':'om',
  'Pakistan':'pk','Palestine':'ps','Panama':'pa','Paraguay':'py','Peru':'pe',
  'Philippines':'ph','Poland':'pl','Portugal':'pt','Puerto Rico':'pr',
  'Qatar':'qa','Romania':'ro','Russia':'ru','Rwanda':'rw',
  'Samoa':'ws','San Marino':'sm','Saudi Arabia':'sa','Scotland':'gb-sct',
  'Senegal':'sn','Serbia':'rs','Singapore':'sg','Slovakia':'sk','Slovenia':'si',
  'Somalia':'so','South Africa':'za','South Korea':'kr','Spain':'es',
  'Sri Lanka':'lk','Sudan':'sd','Sweden':'se','Switzerland':'ch','Syria':'sy',
  'Taiwan':'tw','Thailand':'th','Tonga':'to','Trinidad and Tobago':'tt',
  'Tunisia':'tn','Turkey':'tr','Ukraine':'ua',
  'United Arab Emirates':'ae','United Kingdom':'gb','United States':'us','USA':'us',
  'Uruguay':'uy','Vatican City':'va','Venezuela':'ve','Vietnam':'vn',
  'Wales':'gb-wls','Zimbabwe':'zw',
  'US':'us','UK':'gb','UAE':'ae',
}

// Short display codes for badges
const SHORT_CODES: Record<string, string> = {
  'United States': 'US', 'USA': 'US', 'United Kingdom': 'UK',
  'England': 'EN', 'Scotland': 'SC', 'Wales': 'WA', 'Northern Ireland': 'NI',
  'South Korea': 'KR', 'South Africa': 'ZA', 'New Zealand': 'NZ',
  'Saudi Arabia': 'SA', 'United Arab Emirates': 'AE', 'Puerto Rico': 'PR',
  'Dominican Republic': 'DO', 'Czech Republic': 'CZ', 'North Korea': 'KP',
  'Costa Rica': 'CR', 'El Salvador': 'SV', 'Sri Lanka': 'LK',
  'Trinidad and Tobago': 'TT', 'Bosnia and Herzegovina': 'BA',
}

function getShortCode(country: string): string {
  if (SHORT_CODES[country]) return SHORT_CODES[country]
  return (COUNTRY_CODES[country] || country.substring(0, 2)).toUpperCase()
}

function getFlagUrl(country: string): string | null {
  const code = COUNTRY_CODES[country]
  if (!code) return null
  return `https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.2.3/flags/4x3/${code}.svg`
}

export function CountryFlag({ country, size = 'md' }: { country: string; size?: 'sm' | 'md' | 'lg' }) {
  const [imgError, setImgError] = useState(false)
  const flagUrl = getFlagUrl(country)
  const shortCode = getShortCode(country)

  const dimensions = size === 'sm' ? { w: 18, h: 13 } : size === 'lg' ? { w: 28, h: 20 } : { w: 22, h: 16 }

  // If no URL or image failed, show badge
  if (!flagUrl || imgError) {
    const badgeSize = size === 'sm' ? 'w-5 h-4 text-[7px]' : size === 'lg' ? 'w-7 h-5 text-[9px]' : 'w-6 h-[17px] text-[8px]'
    return (
      <span className={`inline-flex items-center justify-center ${badgeSize} rounded-sm bg-bg-tertiary border border-border-subtle/30 text-text-secondary font-mono font-bold shrink-0`}>
        {shortCode}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagUrl}
      alt={country}
      width={dimensions.w}
      height={dimensions.h}
      className="rounded-[2px] inline-block shrink-0 object-cover"
      style={{ width: dimensions.w, height: dimensions.h }}
      loading="lazy"
      onError={() => setImgError(true)}
    />
  )
}
