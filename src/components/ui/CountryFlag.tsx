/**
 * Country flag component using emoji flags.
 * Works everywhere — no external image dependency.
 */

const COUNTRY_TO_EMOJI: Record<string, string> = {
  'Afghanistan': '🇦🇫', 'Albania': '🇦🇱', 'Algeria': '🇩🇿', 'Andorra': '🇦🇩', 'Angola': '🇦🇴',
  'Argentina': '🇦🇷', 'Armenia': '🇦🇲', 'Australia': '🇦🇺', 'Austria': '🇦🇹', 'Azerbaijan': '🇦🇿',
  'Bahamas': '🇧🇸', 'Bahrain': '🇧🇭', 'Bangladesh': '🇧🇩', 'Barbados': '🇧🇧', 'Belarus': '🇧🇾',
  'Belgium': '🇧🇪', 'Belize': '🇧🇿', 'Bermuda': '🇧🇲', 'Bolivia': '🇧🇴',
  'Bosnia and Herzegovina': '🇧🇦', 'Botswana': '🇧🇼', 'Brazil': '🇧🇷', 'Brunei': '🇧🇳',
  'Bulgaria': '🇧🇬', 'Cambodia': '🇰🇭', 'Cameroon': '🇨🇲', 'Canada': '🇨🇦', 'Chile': '🇨🇱',
  'China': '🇨🇳', 'Colombia': '🇨🇴', 'Costa Rica': '🇨🇷', 'Croatia': '🇭🇷', 'Cuba': '🇨🇺',
  'Cyprus': '🇨🇾', 'Czech Republic': '🇨🇿', 'Czechia': '🇨🇿', 'Denmark': '🇩🇰',
  'Dominican Republic': '🇩🇴', 'Ecuador': '🇪🇨', 'Egypt': '🇪🇬', 'El Salvador': '🇸🇻',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Estonia': '🇪🇪', 'Eswatini': '🇸🇿', 'Ethiopia': '🇪🇹',
  'Fiji': '🇫🇯', 'Finland': '🇫🇮', 'France': '🇫🇷', 'Georgia': '🇬🇪', 'Germany': '🇩🇪',
  'Ghana': '🇬🇭', 'Greece': '🇬🇷', 'Guatemala': '🇬🇹', 'Guinea': '🇬🇳', 'Guyana': '🇬🇾',
  'Haiti': '🇭🇹', 'Honduras': '🇭🇳', 'Hungary': '🇭🇺', 'Iceland': '🇮🇸', 'India': '🇮🇳',
  'Indonesia': '🇮🇩', 'Iran': '🇮🇷', 'Iraq': '🇮🇶', 'Ireland': '🇮🇪', 'Israel': '🇮🇱',
  'Italy': '🇮🇹', 'Jamaica': '🇯🇲', 'Japan': '🇯🇵', 'Jordan': '🇯🇴', 'Kazakhstan': '🇰🇿',
  'Kenya': '🇰🇪', 'Kosovo': '🇽🇰', 'Kuwait': '🇰🇼', 'Laos': '🇱🇦', 'Latvia': '🇱🇻',
  'Lebanon': '🇱🇧', 'Liechtenstein': '🇱🇮', 'Lithuania': '🇱🇹', 'Luxembourg': '🇱🇺',
  'Malaysia': '🇲🇾', 'Mali': '🇲🇱', 'Malta': '🇲🇹', 'Mexico': '🇲🇽', 'Moldova': '🇲🇩',
  'Monaco': '🇲🇨', 'Mongolia': '🇲🇳', 'Montenegro': '🇲🇪', 'Morocco': '🇲🇦',
  'Mozambique': '🇲🇿', 'Myanmar': '🇲🇲', 'Namibia': '🇳🇦', 'Nepal': '🇳🇵',
  'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿', 'Nicaragua': '🇳🇮', 'Nigeria': '🇳🇬',
  'North Korea': '🇰🇵', 'Northern Ireland': '🇬🇧', 'Norway': '🇳🇴', 'Oman': '🇴🇲',
  'Pakistan': '🇵🇰', 'Palestine': '🇵🇸', 'Panama': '🇵🇦', 'Paraguay': '🇵🇾', 'Peru': '🇵🇪',
  'Philippines': '🇵🇭', 'Poland': '🇵🇱', 'Portugal': '🇵🇹', 'Puerto Rico': '🇵🇷',
  'Qatar': '🇶🇦', 'Romania': '🇷🇴', 'Russia': '🇷🇺', 'Rwanda': '🇷🇼',
  'Samoa': '🇼🇸', 'San Marino': '🇸🇲', 'Saudi Arabia': '🇸🇦', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Senegal': '🇸🇳', 'Serbia': '🇷🇸', 'Singapore': '🇸🇬', 'Slovakia': '🇸🇰', 'Slovenia': '🇸🇮',
  'Somalia': '🇸🇴', 'South Africa': '🇿🇦', 'South Korea': '🇰🇷', 'Spain': '🇪🇸',
  'Sri Lanka': '🇱🇰', 'Sudan': '🇸🇩', 'Sweden': '🇸🇪', 'Switzerland': '🇨🇭', 'Syria': '🇸🇾',
  'Taiwan': '🇹🇼', 'Thailand': '🇹🇭', 'Tonga': '🇹🇴', 'Trinidad and Tobago': '🇹🇹',
  'Tunisia': '🇹🇳', 'Turkey': '🇹🇷', 'Ukraine': '🇺🇦',
  'United Arab Emirates': '🇦🇪', 'United Kingdom': '🇬🇧', 'United States': '🇺🇸', 'USA': '🇺🇸',
  'Uruguay': '🇺🇾', 'Vatican City': '🇻🇦', 'Venezuela': '🇻🇪', 'Vietnam': '🇻🇳',
  'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Zimbabwe': '🇿🇼',
  // Common aliases
  'US': '🇺🇸', 'UK': '🇬🇧', 'UAE': '🇦🇪',
}

export function CountryFlag({ country, size = 'md' }: { country: string; size?: 'sm' | 'md' | 'lg' }) {
  const emoji = COUNTRY_TO_EMOJI[country]
  const sizeClass = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg'

  if (!emoji) return <span className={`${sizeClass} leading-none`}>🌍</span>

  return <span className={`${sizeClass} leading-none`} role="img" aria-label={country}>{emoji}</span>
}

export function getCountryEmoji(country: string): string {
  return COUNTRY_TO_EMOJI[country] || '🌍'
}
