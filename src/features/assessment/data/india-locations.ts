/**
 * Curated India city → state/UT dataset that powers the City autocomplete and
 * the auto-fill of the State field. Common alternate / older spellings are kept
 * as their own entries (e.g. "Bangalore" and "Bengaluru") so either spelling
 * resolves. The State field stays editable, so any city outside this list still
 * works via free text — this list optimises the common case, it is not a
 * registry of every settlement in India.
 *
 * Where a city name exists in more than one state, the entry maps to the larger
 * / better-known city to keep look-ups deterministic.
 */
export interface IndiaLocation {
  city: string;
  state: string;
}

export const INDIA_LOCATIONS: IndiaLocation[] = [
  // ── Andhra Pradesh ──
  { city: "Visakhapatnam", state: "Andhra Pradesh" },
  { city: "Vijayawada", state: "Andhra Pradesh" },
  { city: "Guntur", state: "Andhra Pradesh" },
  { city: "Nellore", state: "Andhra Pradesh" },
  { city: "Kurnool", state: "Andhra Pradesh" },
  { city: "Rajahmundry", state: "Andhra Pradesh" },
  { city: "Tirupati", state: "Andhra Pradesh" },
  { city: "Kakinada", state: "Andhra Pradesh" },
  { city: "Anantapur", state: "Andhra Pradesh" },
  { city: "Kadapa", state: "Andhra Pradesh" },
  { city: "Eluru", state: "Andhra Pradesh" },
  { city: "Ongole", state: "Andhra Pradesh" },
  { city: "Vizianagaram", state: "Andhra Pradesh" },
  { city: "Chittoor", state: "Andhra Pradesh" },
  { city: "Srikakulam", state: "Andhra Pradesh" },

  // ── Arunachal Pradesh ──
  { city: "Itanagar", state: "Arunachal Pradesh" },
  { city: "Naharlagun", state: "Arunachal Pradesh" },

  // ── Assam ──
  { city: "Guwahati", state: "Assam" },
  { city: "Silchar", state: "Assam" },
  { city: "Dibrugarh", state: "Assam" },
  { city: "Jorhat", state: "Assam" },
  { city: "Nagaon", state: "Assam" },
  { city: "Tinsukia", state: "Assam" },
  { city: "Tezpur", state: "Assam" },
  { city: "Bongaigaon", state: "Assam" },

  // ── Bihar ──
  { city: "Patna", state: "Bihar" },
  { city: "Gaya", state: "Bihar" },
  { city: "Bhagalpur", state: "Bihar" },
  { city: "Muzaffarpur", state: "Bihar" },
  { city: "Darbhanga", state: "Bihar" },
  { city: "Purnia", state: "Bihar" },
  { city: "Bihar Sharif", state: "Bihar" },
  { city: "Arrah", state: "Bihar" },
  { city: "Begusarai", state: "Bihar" },
  { city: "Katihar", state: "Bihar" },
  { city: "Chapra", state: "Bihar" },
  { city: "Munger", state: "Bihar" },

  // ── Chhattisgarh ──
  { city: "Raipur", state: "Chhattisgarh" },
  { city: "Bhilai", state: "Chhattisgarh" },
  { city: "Bilaspur", state: "Chhattisgarh" },
  { city: "Korba", state: "Chhattisgarh" },
  { city: "Durg", state: "Chhattisgarh" },
  { city: "Rajnandgaon", state: "Chhattisgarh" },
  { city: "Raigarh", state: "Chhattisgarh" },
  { city: "Jagdalpur", state: "Chhattisgarh" },
  { city: "Ambikapur", state: "Chhattisgarh" },

  // ── Goa ──
  { city: "Panaji", state: "Goa" },
  { city: "Margao", state: "Goa" },
  { city: "Vasco da Gama", state: "Goa" },
  { city: "Mapusa", state: "Goa" },
  { city: "Ponda", state: "Goa" },

  // ── Gujarat ──
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Surat", state: "Gujarat" },
  { city: "Vadodara", state: "Gujarat" },
  { city: "Baroda", state: "Gujarat" },
  { city: "Rajkot", state: "Gujarat" },
  { city: "Bhavnagar", state: "Gujarat" },
  { city: "Jamnagar", state: "Gujarat" },
  { city: "Gandhinagar", state: "Gujarat" },
  { city: "Junagadh", state: "Gujarat" },
  { city: "Anand", state: "Gujarat" },
  { city: "Nadiad", state: "Gujarat" },
  { city: "Navsari", state: "Gujarat" },
  { city: "Morbi", state: "Gujarat" },
  { city: "Mehsana", state: "Gujarat" },
  { city: "Bharuch", state: "Gujarat" },
  { city: "Vapi", state: "Gujarat" },
  { city: "Gandhidham", state: "Gujarat" },
  { city: "Porbandar", state: "Gujarat" },
  { city: "Surendranagar", state: "Gujarat" },
  { city: "Valsad", state: "Gujarat" },

  // ── Haryana ──
  { city: "Faridabad", state: "Haryana" },
  { city: "Gurugram", state: "Haryana" },
  { city: "Gurgaon", state: "Haryana" },
  { city: "Panipat", state: "Haryana" },
  { city: "Ambala", state: "Haryana" },
  { city: "Yamunanagar", state: "Haryana" },
  { city: "Rohtak", state: "Haryana" },
  { city: "Hisar", state: "Haryana" },
  { city: "Karnal", state: "Haryana" },
  { city: "Sonipat", state: "Haryana" },
  { city: "Panchkula", state: "Haryana" },
  { city: "Bhiwani", state: "Haryana" },
  { city: "Sirsa", state: "Haryana" },
  { city: "Bahadurgarh", state: "Haryana" },
  { city: "Kurukshetra", state: "Haryana" },

  // ── Himachal Pradesh ──
  { city: "Shimla", state: "Himachal Pradesh" },
  { city: "Solan", state: "Himachal Pradesh" },
  { city: "Dharamshala", state: "Himachal Pradesh" },
  { city: "Mandi", state: "Himachal Pradesh" },
  { city: "Kullu", state: "Himachal Pradesh" },
  { city: "Manali", state: "Himachal Pradesh" },
  { city: "Palampur", state: "Himachal Pradesh" },

  // ── Jharkhand ──
  { city: "Ranchi", state: "Jharkhand" },
  { city: "Jamshedpur", state: "Jharkhand" },
  { city: "Dhanbad", state: "Jharkhand" },
  { city: "Bokaro Steel City", state: "Jharkhand" },
  { city: "Bokaro", state: "Jharkhand" },
  { city: "Deoghar", state: "Jharkhand" },
  { city: "Hazaribagh", state: "Jharkhand" },
  { city: "Giridih", state: "Jharkhand" },
  { city: "Ramgarh", state: "Jharkhand" },

  // ── Karnataka ──
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Bangalore", state: "Karnataka" },
  { city: "Mysuru", state: "Karnataka" },
  { city: "Mysore", state: "Karnataka" },
  { city: "Hubballi", state: "Karnataka" },
  { city: "Hubli", state: "Karnataka" },
  { city: "Mangaluru", state: "Karnataka" },
  { city: "Mangalore", state: "Karnataka" },
  { city: "Belagavi", state: "Karnataka" },
  { city: "Belgaum", state: "Karnataka" },
  { city: "Kalaburagi", state: "Karnataka" },
  { city: "Gulbarga", state: "Karnataka" },
  { city: "Davanagere", state: "Karnataka" },
  { city: "Ballari", state: "Karnataka" },
  { city: "Bellary", state: "Karnataka" },
  { city: "Vijayapura", state: "Karnataka" },
  { city: "Shivamogga", state: "Karnataka" },
  { city: "Shimoga", state: "Karnataka" },
  { city: "Tumakuru", state: "Karnataka" },
  { city: "Tumkur", state: "Karnataka" },
  { city: "Udupi", state: "Karnataka" },
  { city: "Hassan", state: "Karnataka" },
  { city: "Bidar", state: "Karnataka" },
  { city: "Raichur", state: "Karnataka" },

  // ── Kerala ──
  { city: "Thiruvananthapuram", state: "Kerala" },
  { city: "Trivandrum", state: "Kerala" },
  { city: "Kochi", state: "Kerala" },
  { city: "Cochin", state: "Kerala" },
  { city: "Kozhikode", state: "Kerala" },
  { city: "Calicut", state: "Kerala" },
  { city: "Thrissur", state: "Kerala" },
  { city: "Kollam", state: "Kerala" },
  { city: "Kannur", state: "Kerala" },
  { city: "Kottayam", state: "Kerala" },
  { city: "Palakkad", state: "Kerala" },
  { city: "Alappuzha", state: "Kerala" },
  { city: "Malappuram", state: "Kerala" },
  { city: "Manjeri", state: "Kerala" },

  // ── Madhya Pradesh ──
  { city: "Indore", state: "Madhya Pradesh" },
  { city: "Bhopal", state: "Madhya Pradesh" },
  { city: "Jabalpur", state: "Madhya Pradesh" },
  { city: "Gwalior", state: "Madhya Pradesh" },
  { city: "Ujjain", state: "Madhya Pradesh" },
  { city: "Sagar", state: "Madhya Pradesh" },
  { city: "Dewas", state: "Madhya Pradesh" },
  { city: "Satna", state: "Madhya Pradesh" },
  { city: "Ratlam", state: "Madhya Pradesh" },
  { city: "Rewa", state: "Madhya Pradesh" },
  { city: "Katni", state: "Madhya Pradesh" },
  { city: "Singrauli", state: "Madhya Pradesh" },
  { city: "Khandwa", state: "Madhya Pradesh" },

  // ── Maharashtra ──
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Nagpur", state: "Maharashtra" },
  { city: "Nashik", state: "Maharashtra" },
  { city: "Thane", state: "Maharashtra" },
  { city: "Aurangabad", state: "Maharashtra" },
  { city: "Chhatrapati Sambhajinagar", state: "Maharashtra" },
  { city: "Solapur", state: "Maharashtra" },
  { city: "Amravati", state: "Maharashtra" },
  { city: "Kolhapur", state: "Maharashtra" },
  { city: "Navi Mumbai", state: "Maharashtra" },
  { city: "Sangli", state: "Maharashtra" },
  { city: "Jalgaon", state: "Maharashtra" },
  { city: "Akola", state: "Maharashtra" },
  { city: "Latur", state: "Maharashtra" },
  { city: "Ahmednagar", state: "Maharashtra" },
  { city: "Nanded", state: "Maharashtra" },
  { city: "Chandrapur", state: "Maharashtra" },
  { city: "Dhule", state: "Maharashtra" },
  { city: "Satara", state: "Maharashtra" },
  { city: "Pimpri-Chinchwad", state: "Maharashtra" },

  // ── Manipur ──
  { city: "Imphal", state: "Manipur" },

  // ── Meghalaya ──
  { city: "Shillong", state: "Meghalaya" },
  { city: "Tura", state: "Meghalaya" },

  // ── Mizoram ──
  { city: "Aizawl", state: "Mizoram" },
  { city: "Lunglei", state: "Mizoram" },

  // ── Nagaland ──
  { city: "Kohima", state: "Nagaland" },
  { city: "Dimapur", state: "Nagaland" },

  // ── Odisha ──
  { city: "Bhubaneswar", state: "Odisha" },
  { city: "Cuttack", state: "Odisha" },
  { city: "Rourkela", state: "Odisha" },
  { city: "Berhampur", state: "Odisha" },
  { city: "Sambalpur", state: "Odisha" },
  { city: "Puri", state: "Odisha" },
  { city: "Balasore", state: "Odisha" },
  { city: "Baripada", state: "Odisha" },

  // ── Punjab ──
  { city: "Ludhiana", state: "Punjab" },
  { city: "Amritsar", state: "Punjab" },
  { city: "Jalandhar", state: "Punjab" },
  { city: "Patiala", state: "Punjab" },
  { city: "Bathinda", state: "Punjab" },
  { city: "Mohali", state: "Punjab" },
  { city: "Hoshiarpur", state: "Punjab" },
  { city: "Pathankot", state: "Punjab" },
  { city: "Moga", state: "Punjab" },
  { city: "Firozpur", state: "Punjab" },

  // ── Rajasthan ──
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Jodhpur", state: "Rajasthan" },
  { city: "Udaipur", state: "Rajasthan" },
  { city: "Kota", state: "Rajasthan" },
  { city: "Bikaner", state: "Rajasthan" },
  { city: "Ajmer", state: "Rajasthan" },
  { city: "Bhilwara", state: "Rajasthan" },
  { city: "Alwar", state: "Rajasthan" },
  { city: "Sikar", state: "Rajasthan" },
  { city: "Sri Ganganagar", state: "Rajasthan" },
  { city: "Pali", state: "Rajasthan" },
  { city: "Bharatpur", state: "Rajasthan" },
  { city: "Tonk", state: "Rajasthan" },
  { city: "Beawar", state: "Rajasthan" },

  // ── Sikkim ──
  { city: "Gangtok", state: "Sikkim" },

  // ── Tamil Nadu ──
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Coimbatore", state: "Tamil Nadu" },
  { city: "Madurai", state: "Tamil Nadu" },
  { city: "Tiruchirappalli", state: "Tamil Nadu" },
  { city: "Trichy", state: "Tamil Nadu" },
  { city: "Salem", state: "Tamil Nadu" },
  { city: "Tirunelveli", state: "Tamil Nadu" },
  { city: "Tiruppur", state: "Tamil Nadu" },
  { city: "Erode", state: "Tamil Nadu" },
  { city: "Vellore", state: "Tamil Nadu" },
  { city: "Thoothukudi", state: "Tamil Nadu" },
  { city: "Tuticorin", state: "Tamil Nadu" },
  { city: "Dindigul", state: "Tamil Nadu" },
  { city: "Thanjavur", state: "Tamil Nadu" },
  { city: "Nagercoil", state: "Tamil Nadu" },
  { city: "Karur", state: "Tamil Nadu" },
  { city: "Hosur", state: "Tamil Nadu" },
  { city: "Kanchipuram", state: "Tamil Nadu" },
  { city: "Cuddalore", state: "Tamil Nadu" },

  // ── Telangana ──
  { city: "Hyderabad", state: "Telangana" },
  { city: "Secunderabad", state: "Telangana" },
  { city: "Warangal", state: "Telangana" },
  { city: "Nizamabad", state: "Telangana" },
  { city: "Karimnagar", state: "Telangana" },
  { city: "Khammam", state: "Telangana" },
  { city: "Ramagundam", state: "Telangana" },
  { city: "Mahbubnagar", state: "Telangana" },
  { city: "Nalgonda", state: "Telangana" },
  { city: "Siddipet", state: "Telangana" },

  // ── Tripura ──
  { city: "Agartala", state: "Tripura" },

  // ── Uttar Pradesh ──
  { city: "Lucknow", state: "Uttar Pradesh" },
  { city: "Kanpur", state: "Uttar Pradesh" },
  { city: "Ghaziabad", state: "Uttar Pradesh" },
  { city: "Agra", state: "Uttar Pradesh" },
  { city: "Varanasi", state: "Uttar Pradesh" },
  { city: "Meerut", state: "Uttar Pradesh" },
  { city: "Prayagraj", state: "Uttar Pradesh" },
  { city: "Allahabad", state: "Uttar Pradesh" },
  { city: "Bareilly", state: "Uttar Pradesh" },
  { city: "Aligarh", state: "Uttar Pradesh" },
  { city: "Moradabad", state: "Uttar Pradesh" },
  { city: "Saharanpur", state: "Uttar Pradesh" },
  { city: "Gorakhpur", state: "Uttar Pradesh" },
  { city: "Noida", state: "Uttar Pradesh" },
  { city: "Greater Noida", state: "Uttar Pradesh" },
  { city: "Firozabad", state: "Uttar Pradesh" },
  { city: "Jhansi", state: "Uttar Pradesh" },
  { city: "Muzaffarnagar", state: "Uttar Pradesh" },
  { city: "Mathura", state: "Uttar Pradesh" },
  { city: "Ayodhya", state: "Uttar Pradesh" },
  { city: "Rampur", state: "Uttar Pradesh" },
  { city: "Shahjahanpur", state: "Uttar Pradesh" },

  // ── Uttarakhand ──
  { city: "Dehradun", state: "Uttarakhand" },
  { city: "Haridwar", state: "Uttarakhand" },
  { city: "Roorkee", state: "Uttarakhand" },
  { city: "Haldwani", state: "Uttarakhand" },
  { city: "Rudrapur", state: "Uttarakhand" },
  { city: "Kashipur", state: "Uttarakhand" },
  { city: "Rishikesh", state: "Uttarakhand" },
  { city: "Nainital", state: "Uttarakhand" },

  // ── West Bengal ──
  { city: "Kolkata", state: "West Bengal" },
  { city: "Howrah", state: "West Bengal" },
  { city: "Durgapur", state: "West Bengal" },
  { city: "Asansol", state: "West Bengal" },
  { city: "Siliguri", state: "West Bengal" },
  { city: "Bardhaman", state: "West Bengal" },
  { city: "Malda", state: "West Bengal" },
  { city: "Kharagpur", state: "West Bengal" },
  { city: "Haldia", state: "West Bengal" },
  { city: "Darjeeling", state: "West Bengal" },

  // ── Delhi (NCT) ──
  { city: "Delhi", state: "Delhi" },
  { city: "New Delhi", state: "Delhi" },

  // ── Jammu & Kashmir ──
  { city: "Srinagar", state: "Jammu and Kashmir" },
  { city: "Jammu", state: "Jammu and Kashmir" },
  { city: "Anantnag", state: "Jammu and Kashmir" },
  { city: "Baramulla", state: "Jammu and Kashmir" },

  // ── Ladakh ──
  { city: "Leh", state: "Ladakh" },
  { city: "Kargil", state: "Ladakh" },

  // ── Chandigarh ──
  { city: "Chandigarh", state: "Chandigarh" },

  // ── Puducherry ──
  { city: "Puducherry", state: "Puducherry" },
  { city: "Pondicherry", state: "Puducherry" },
  { city: "Karaikal", state: "Puducherry" },

  // ── Andaman & Nicobar Islands ──
  { city: "Port Blair", state: "Andaman and Nicobar Islands" },

  // ── Dadra & Nagar Haveli and Daman & Diu ──
  { city: "Daman", state: "Dadra and Nagar Haveli and Daman and Diu" },
  { city: "Silvassa", state: "Dadra and Nagar Haveli and Daman and Diu" },
  { city: "Diu", state: "Dadra and Nagar Haveli and Daman and Diu" },

  // ── Lakshadweep ──
  { city: "Kavaratti", state: "Lakshadweep" },
];

/** Normalise for case-, spacing- and punctuation-insensitive matching. */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.]/g, "");

const STATE_BY_CITY = new Map<string, string>(
  INDIA_LOCATIONS.map((loc) => [normalize(loc.city), loc.state]),
);

/** Returns the state for an exact (normalised) city match, else undefined. */
export function lookupState(city: string): string | undefined {
  return STATE_BY_CITY.get(normalize(city));
}

/**
 * Type-ahead search. Prefix matches rank above substring matches; results are
 * capped so the dropdown stays light without virtualisation.
 */
export function searchCities(query: string, limit = 8): IndiaLocation[] {
  const q = normalize(query);
  if (!q) return [];

  const prefix: IndiaLocation[] = [];
  const substring: IndiaLocation[] = [];

  for (const loc of INDIA_LOCATIONS) {
    const name = normalize(loc.city);
    if (name.startsWith(q)) prefix.push(loc);
    else if (name.includes(q)) substring.push(loc);
  }

  return [...prefix, ...substring].slice(0, limit);
}
