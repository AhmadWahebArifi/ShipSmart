// Provincial road connections data for Afghanistan
// Generated from Provinces.txt file
// Key: Province name (English), Value: Array of directly connected provinces (English)

const PROVINCIAL_CONNECTIONS = {
  Badakhshan: ["Takhar"],
  Badghis: ["Faryab", "Herat"],
  Baghlan: ["Kunduz", "Samangan", "Parwan"],
  Balkh: ["Samangan", "Jowzjan"],
  Farah: ["Herat", "Helmand"],
  Faryab: ["Jowzjan", "Badghis"],
  Ghazni: ["Maidan Wardak", "Zabul"],
  Helmand: ["Kandahar", "Farah"],
  Herat: ["Badghis", "Farah"],
  Jowzjan: ["Balkh", "Faryab"],
  Kabul: ["Parwan", "Maidan Wardak", "Laghman"],
  Kandahar: ["Zabul", "Helmand"],
  Kunduz: ["Takhar", "Baghlan"],
  Laghman: ["Kabul", "Nangarhar"],
  "Maidan Wardak": ["Kabul", "Ghazni"],
  Nangarhar: ["Laghman"],
  Parwan: ["Baghlan", "Kabul"],
  Samangan: ["Baghlan", "Balkh"],
  Takhar: ["Badakhshan", "Kunduz"],
  Zabul: ["Ghazni", "Kandahar"],
  // Additional provinces with no routes in Provinces.txt - added for completeness
  Bamyan: [],
  Daykundi: [],
  Ghor: [],
  Kapisa: [],
  Khost: [],
  Kunar: [],
  Logar: [],
  Nimruz: [],
  Nuristan: [],
  Paktia: [],
  Paktika: [],
  Panjshir: [],
  "Sar-e Pol": [],
  Uruzgan: [],
  Wardak: [],
};

// Full routes between provinces
const PROVINCIAL_ROUTES = {
  "Badakhshan-Badghis":
    "Badakhshan → Takhar → Kunduz → Baghlan → Samangan → Balkh → Jowzjan → Faryab → Badghis",
  "Badakhshan-Baghlan": "Badakhshan → Takhar → Kunduz → Baghlan",
  "Badakhshan-Balkh":
    "Badakhshan → Takhar → Kunduz → Baghlan → Samangan → Balkh",
  "Badakhshan-Farah":
    "Badakhshan → Takhar → Kunduz → Baghlan → Samangan → Balkh → Jowzjan → Faryab → Badghis → Herat → Farah",
  "Badakhshan-Faryab":
    "Badakhshan → Takhar → Kunduz → Baghlan → Samangan → Balkh → Jowzjan → Faryab",
  "Badakhshan-Ghazni":
    "Badakhshan → Takhar → Kunduz → Baghlan → Parwan → Kabul → Maidan Wardak → Ghazni",
  "Badakhshan-Helmand":
    "Badakhshan → Takhar → Kunduz → Baghlan → Parwan → Kabul → Maidan Wardak → Ghazni → Zabul → Kandahar → Helmand",
  "Badakhshan-Herat":
    "Badakhshan → Takhar → Kunduz → Baghlan → Samangan → Balkh → Jowzjan → Faryab → Badghis → Herat",
  "Badakhshan-Jowzjan":
    "Badakhshan → Takhar → Kunduz → Baghlan → Samangan → Balkh → Jowzjan",
  "Badakhshan-Kabul": "Badakhshan → Takhar → Kunduz → Baghlan → Parwan → Kabul",
  "Badakhshan-Kandahar":
    "Badakhshan → Takhar → Kunduz → Baghlan → Parwan → Kabul → Maidan Wardak → Ghazni → Zabul → Kandahar",
  "Badakhshan-Kunduz": "Badakhshan → Takhar → Kunduz",
  "Badakhshan-Laghman":
    "Badakhshan → Takhar → Kunduz → Baghlan → Parwan → Kabul → Laghman",
  "Badakhshan-Maidan Wardak":
    "Badakhshan → Takhar → Kunduz → Baghlan → Parwan → Kabul → Maidan Wardak",
  "Badakhshan-Nangarhar":
    "Badakhshan → Takhar → Kunduz → Baghlan → Parwan → Kabul → Laghman → Nangarhar",
  "Badakhshan-Parwan": "Badakhshan → Takhar → Kunduz → Baghlan → Parwan",
  "Badakhshan-Samangan": "Badakhshan → Takhar → Kunduz → Baghlan → Samangan",
  "Badakhshan-Takhar": "Badakhshan → Takhar",
  "Badakhshan-Zabul":
    "Badakhshan → Takhar → Kunduz → Baghlan → Parwan → Kabul → Maidan Wardak → Ghazni → Zabul",
  "Badghis-Baghlan": "Badghis →",
  "Badghis-Balkh": "Badghis →",
  "Badghis-Farah": "Badghis → Herat → Farah",
  "Badghis-Faryab": "Badghis → Faryab",
  "Badghis-Ghazni":
    "Badghis → Herat → Farah → Helmand → Kandahar → Zabul → Ghazni",
  "Badghis-Helmand": "Badghis → Herat → Farah → Helmand",
  "Badghis-Herat": "Badghis → Herat",
  "Badghis-Jowzjan": "Badghis → Faryab → Jowzjan",
  "Badghis-Kabul":
    "Badghis → Faryab → Jowzjan → Balkh → Samangan → Baghlan → Parwan → Kabul",
  "Badghis-Kandahar": "Badghis → Herat → Farah → Helmand → Kandahar",
  "Badghis-Kunduz":
    "Badghis → Faryab → Jowzjan → Balkh → Samangan → Baghlan → Kunduz",
  "Badghis-Laghman":
    "Badghis → Faryab → Jowzjan → Balkh → Samangan → Baghlan → Parwan → Kabul → Laghman",
  "Badghis-Maidan Wardak":
    "Badghis → Herat → Farah → Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak",
  "Badghis-Nangarhar":
    "Badghis → Faryab → Jowzjan → Balkh → Samangan → Baghlan → Parwan → Kabul → Laghman → Nangarhar",
  "Badghis-Parwan":
    "Badghis → Faryab → Jowzjan → Balkh → Samangan → Baghlan → Parwan",
  "Badghis-Samangan": "Badghis → Faryab → Jowzjan → Balkh → Samangan",
  "Badghis-Takhar":
    "Badghis → Faryab → Jowzjan → Balkh → Samangan → Baghlan → Kunduz → Takhar",
  "Badghis-Zabul": "Badghis → Herat → Farah → Helmand → Kandahar → Zabul",
  "Baghlan-Balkh": "Baghlan → Samangan → Balkh",
  "Baghlan-Farah":
    "Baghlan → Samangan → Balkh → Jowzjan → Faryab → Badghis → Herat → Farah",
  "Baghlan-Faryab": "Baghlan → Samangan → Balkh → Jowzjan → Faryab",
  "Baghlan-Ghazni": "Baghlan → Parwan → Kabul → Maidan Wardak → Ghazni",
  "Baghlan-Helmand":
    "Baghlan → Parwan → Kabul → Maidan Wardak → Ghazni → Zabul → Kandahar → Helmand",
  "Baghlan-Herat":
    "Baghlan → Samangan → Balkh → Jowzjan → Faryab → Badghis → Herat",
  "Baghlan-Jowzjan": "Baghlan → Samangan → Balkh → Jowzjan",
  "Baghlan-Kabul": "Baghlan → Parwan → Kabul",
  "Baghlan-Kandahar":
    "Baghlan → Parwan → Kabul → Maidan Wardak → Ghazni → Zabul → Kandahar",
  "Baghlan-Kunduz": "Baghlan → Kunduz",
  "Baghlan-Laghman": "Baghlan → Parwan → Kabul → Laghman",
  "Baghlan-Maidan Wardak": "Baghlan → Parwan → Kabul → Maidan Wardak",
  "Baghlan-Nangarhar": "Baghlan → Parwan → Kabul → Laghman → Nangarhar",
  "Baghlan-Parwan": "Baghlan → Parwan",
  "Baghlan-Samangan": "Baghlan → Samangan",
  "Baghlan-Takhar": "Baghlan → Kunduz → Takhar",
  "Baghlan-Zabul": "Baghlan → Parwan → Kabul → Maidan Wardak → Ghazni → Zabul",
  "Balkh-Farah": "Balkh → Jowzjan → Faryab → Badghis → Herat → Farah",
  "Balkh-Faryab": "Balkh → Jowzjan → Faryab",
  "Balkh-Ghazni":
    "Balkh → Samangan → Baghlan → Parwan → Kabul → Maidan Wardak → Ghazni",
  "Balkh-Helmand":
    "Balkh → Jowzjan → Faryab → Badghis → Herat → Farah → Helmand",
  "Balkh-Herat": "Balkh → Jowzjan → Faryab → Badghis → Herat",
  "Balkh-Jowzjan": "Balkh → Jowzjan",
  "Balkh-Kabul": "Balkh → Samangan → Baghlan → Parwan → Kabul",
  "Balkh-Kandahar":
    "Balkh → Jowzjan → Faryab → Badghis → Herat → Farah → Helmand → Kandahar",
  "Balkh-Kunduz": "Balkh → Samangan → Baghlan → Kunduz",
  "Balkh-Laghman": "Balkh → Samangan → Baghlan → Parwan → Kabul → Laghman",
  "Balkh-Maidan Wardak":
    "Balkh → Samangan → Baghlan → Parwan → Kabul → Maidan Wardak",
  "Balkh-Nangarhar":
    "Balkh → Samangan → Baghlan → Parwan → Kabul → Laghman → Nangarhar",
  "Balkh-Parwan": "Balkh → Samangan → Baghlan → Parwan",
  "Balkh-Samangan": "Balkh → Samangan",
  "Balkh-Takhar": "Balkh → Samangan → Baghlan → Kunduz → Takhar",
  "Balkh-Zabul":
    "Balkh → Samangan → Baghlan → Parwan → Kabul → Maidan Wardak → Ghazni → Zabul",
  "Farah-Faryab": "Farah → Herat → Badghis → Faryab",
  "Farah-Ghazni": "Farah → Helmand → Kandahar → Zabul → Ghazni",
  "Farah-Helmand": "Farah → Helmand",
  "Farah-Herat": "Farah → Herat",
  "Farah-Jowzjan": "Farah → Herat → Badghis → Faryab → Jowzjan",
  "Farah-Kabul":
    "Farah → Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul",
  "Farah-Kandahar": "Farah → Helmand → Kandahar",
  "Farah-Kunduz":
    "Farah → Herat → Badghis → Faryab → Jowzjan → Balkh → Samangan → Baghlan → Kunduz",
  "Farah-Laghman":
    "Farah → Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Laghman",
  "Farah-Maidan Wardak":
    "Farah → Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak",
  "Farah-Nangarhar":
    "Farah → Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Laghman → Nangarhar",
  "Farah-Parwan":
    "Farah → Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Parwan",
  "Farah-Samangan":
    "Farah → Herat → Badghis → Faryab → Jowzjan → Balkh → Samangan",
  "Farah-Takhar":
    "Farah → Herat → Badghis → Faryab → Jowzjan → Balkh → Samangan → Baghlan → Kunduz → Takhar",
  "Farah-Zabul": "Farah → Helmand → Kandahar → Zabul",
  "Faryab-Ghazni":
    "Faryab → Badghis → Herat → Farah → Helmand → Kandahar → Zabul → Ghazni",
  "Faryab-Helmand": "Faryab → Badghis → Herat → Farah → Helmand",
  "Faryab-Herat": "Faryab → Badghis → Herat",
  "Faryab-Jowzjan": "Faryab → Jowzjan",
  "Faryab-Kabul":
    "Faryab → Jowzjan → Balkh → Samangan → Baghlan → Parwan → Kabul",
  "Faryab-Kandahar": "Faryab → Badghis → Herat → Farah → Helmand → Kandahar",
  "Faryab-Kunduz": "Faryab → Jowzjan → Balkh → Samangan → Baghlan → Kunduz",
  "Faryab-Laghman":
    "Faryab → Jowzjan → Balkh → Samangan → Baghlan → Parwan → Kabul → Laghman",
  "Faryab-Maidan Wardak":
    "Faryab → Jowzjan → Balkh → Samangan → Baghlan → Parwan → Kabul → Maidan Wardak",
  "Faryab-Nangarhar":
    "Faryab → Jowzjan → Balkh → Samangan → Baghlan → Parwan → Kabul → Laghman → Nangarhar",
  "Faryab-Parwan": "Faryab → Jowzjan → Balkh → Samangan → Baghlan → Parwan",
  "Faryab-Samangan": "Faryab → Jowzjan → Balkh → Samangan",
  "Faryab-Takhar":
    "Faryab → Jowzjan → Balkh → Samangan → Baghlan → Kunduz → Takhar",
  "Faryab-Zabul":
    "Faryab → Badghis → Herat → Farah → Helmand → Kandahar → Zabul",
  "Ghazni-Helmand": "Ghazni → Zabul → Kandahar → Helmand",
  "Ghazni-Herat": "Ghazni → Zabul → Kandahar → Helmand → Farah → Herat",
  "Ghazni-Jowzjan":
    "Ghazni → Maidan Wardak → Kabul → Parwan → Baghlan → Samangan → Balkh → Jowzjan",
  "Ghazni-Kabul": "Ghazni → Maidan Wardak → Kabul",
  "Ghazni-Kandahar": "Ghazni → Zabul → Kandahar",
  "Ghazni-Kunduz": "Ghazni → Maidan Wardak → Kabul → Parwan → Baghlan → Kunduz",
  "Ghazni-Laghman": "Ghazni → Maidan Wardak → Kabul → Laghman",
  "Ghazni-Maidan Wardak": "Ghazni → Maidan Wardak",
  "Ghazni-Nangarhar": "Ghazni → Maidan Wardak → Kabul → Laghman → Nangarhar",
  "Ghazni-Parwan": "Ghazni → Maidan Wardak → Kabul → Parwan",
  "Ghazni-Samangan":
    "Ghazni → Maidan Wardak → Kabul → Parwan → Baghlan → Samangan",
  "Ghazni-Takhar":
    "Ghazni → Maidan Wardak → Kabul → Parwan → Baghlan → Kunduz → Takhar",
  "Ghazni-Zabul": "Ghazni → Zabul",
  "Helmand-Herat": "Helmand → Farah → Herat",
  "Helmand-Jowzjan": "Helmand → Farah → Herat → Badghis → Faryab → Jowzjan",
  "Helmand-Kabul":
    "Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul",
  "Helmand-Kandahar": "Helmand → Kandahar",
  "Helmand-Kunduz":
    "Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Parwan → Baghlan → Kunduz",
  "Helmand-Laghman":
    "Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Laghman",
  "Helmand-Maidan Wardak":
    "Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak",
  "Helmand-Nangarhar":
    "Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Laghman → Nangarhar",
  "Helmand-Parwan":
    "Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Parwan",
  "Helmand-Samangan":
    "Helmand → Farah → Herat → Badghis → Faryab → Jowzjan → Balkh → Samangan",
  "Helmand-Takhar":
    "Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Parwan → Baghlan → Kunduz → Takhar",
  "Helmand-Zabul": "Helmand → Kandahar → Zabul",
  "Herat-Jowzjan": "Herat → Badghis → Faryab → Jowzjan",
  "Herat-Kabul":
    "Herat → Farah → Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul",
  "Herat-Kandahar": "Herat → Farah → Helmand → Kandahar",
  "Herat-Kunduz":
    "Herat → Badghis → Faryab → Jowzjan → Balkh → Samangan → Baghlan → Kunduz",
  "Herat-Laghman":
    "Herat → Farah → Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Laghman",
  "Herat-Maidan Wardak":
    "Herat → Farah → Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak",
  "Herat-Nangarhar":
    "Herat → Farah → Helmand → Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Laghman → Nangarhar",
  "Herat-Parwan":
    "Herat → Badghis → Faryab → Jowzjan → Balkh → Samangan → Baghlan → Parwan",
  "Herat-Samangan": "Herat → Badghis → Faryab → Jowzjan → Balkh → Samangan",
  "Herat-Takhar":
    "Herat → Badghis → Faryab → Jowzjan → Balkh → Samangan → Baghlan → Kunduz → Takhar",
  "Herat-Zabul": "Herat → Farah → Helmand → Kandahar → Zabul",
  "Jowzjan-Kabul": "Jowzjan → Balkh → Samangan → Baghlan → Parwan → Kabul",
  "Jowzjan-Kandahar":
    "Jowzjan → Faryab → Badghis → Herat → Farah → Helmand → Kandahar",
  "Jowzjan-Kunduz": "Jowzjan → Balkh → Samangan → Baghlan → Kunduz",
  "Jowzjan-Laghman":
    "Jowzjan → Balkh → Samangan → Baghlan → Parwan → Kabul → Laghman",
  "Jowzjan-Maidan Wardak":
    "Jowzjan → Balkh → Samangan → Baghlan → Parwan → Kabul → Maidan Wardak",
  "Jowzjan-Nangarhar":
    "Jowzjan → Balkh → Samangan → Baghlan → Parwan → Kabul → Laghman → Nangarhar",
  "Jowzjan-Parwan": "Jowzjan → Balkh → Samangan → Baghlan → Parwan",
  "Jowzjan-Samangan": "Jowzjan → Balkh → Samangan",
  "Jowzjan-Takhar": "Jowzjan → Balkh → Samangan → Baghlan → Kunduz → Takhar",
  "Jowzjan-Zabul":
    "Jowzjan → Faryab → Badghis → Herat → Farah → Helmand → Kandahar → Zabul",
  "Kabul-Kandahar": "Kabul → Maidan Wardak → Ghazni → Zabul → Kandahar",
  "Kabul-Kunduz": "Kabul → Parwan → Baghlan → Kunduz",
  "Kabul-Laghman": "Kabul → Laghman",
  "Kabul-Maidan Wardak": "Kabul → Maidan Wardak",
  "Kabul-Nangarhar": "Kabul → Laghman → Nangarhar",
  "Kabul-Parwan": "Kabul → Parwan",
  "Kabul-Samangan": "Kabul → Parwan → Baghlan → Samangan",
  "Kabul-Takhar": "Kabul → Parwan → Baghlan → Kunduz → Takhar",
  "Kabul-Zabul": "Kabul → Maidan Wardak → Ghazni → Zabul",
  "Kandahar-Kunduz":
    "Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Parwan → Baghlan → Kunduz",
  "Kandahar-Laghman":
    "Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Laghman",
  "Kandahar-Maidan Wardak": "Kandahar → Zabul → Ghazni → Maidan Wardak",
  "Kandahar-Nangarhar":
    "Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Laghman → Nangarhar",
  "Kandahar-Parwan":
    "Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Parwan",
  "Kandahar-Samangan":
    "Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Parwan → Baghlan → Samangan",
  "Kandahar-Takhar":
    "Kandahar → Zabul → Ghazni → Maidan Wardak → Kabul → Parwan → Baghlan → Kunduz → Takhar",
  "Kandahar-Zabul": "Kandahar → Zabul",
  "Kunduz-Laghman": "Kunduz → Baghlan → Parwan → Kabul → Laghman",
  "Kunduz-Maidan Wardak": "Kunduz → Baghlan → Parwan → Kabul → Maidan Wardak",
  "Kunduz-Nangarhar": "Kunduz → Baghlan → Parwan → Kabul → Laghman → Nangarhar",
  "Kunduz-Parwan": "Kunduz → Baghlan → Parwan",
  "Kunduz-Samangan": "Kunduz → Baghlan → Samangan",
  "Kunduz-Takhar": "Kunduz → Takhar",
  "Kunduz-Zabul":
    "Kunduz → Baghlan → Parwan → Kabul → Maidan Wardak → Ghazni → Zabul",
  "Laghman-Maidan Wardak": "Laghman → Kabul → Maidan Wardak",
  "Laghman-Nangarhar": "Laghman → Nangarhar",
  "Laghman-Parwan": "Laghman → Kabul → Parwan",
  "Laghman-Samangan": "Laghman → Kabul → Parwan → Baghlan → Samangan",
  "Laghman-Takhar": "Laghman → Kabul → Parwan → Baghlan → Kunduz → Takhar",
  "Laghman-Zabul": "Laghman → Kabul → Maidan Wardak → Ghazni → Zabul",
  "Maidan Wardak-Nangarhar": "Maidan Wardak → Kabul → Laghman → Nangarhar",
  "Maidan Wardak-Parwan": "Maidan Wardak → Kabul → Parwan",
  "Maidan Wardak-Samangan":
    "Maidan Wardak → Kabul → Parwan → Baghlan → Samangan",
  "Maidan Wardak-Takhar":
    "Maidan Wardak → Kabul → Parwan → Baghlan → Kunduz → Takhar",
  "Maidan Wardak-Zabul": "Maidan Wardak → Ghazni → Zabul",
  "Nangarhar-Parwan": "Nangarhar → Laghman → Kabul → Parwan",
  "Nangarhar-Samangan":
    "Nangarhar → Laghman → Kabul → Parwan → Baghlan → Samangan",
  "Nangarhar-Takhar":
    "Nangarhar → Laghman → Kabul → Parwan → Baghlan → Kunduz → Takhar",
  "Nangarhar-Zabul":
    "Nangarhar → Laghman → Kabul → Maidan Wardak → Ghazni → Zabul",
  "Parwan-Samangan": "Parwan → Baghlan → Samangan",
  "Parwan-Takhar": "Parwan → Baghlan → Kunduz → Takhar",
  "Parwan-Zabul": "Parwan → Kabul → Maidan Wardak → Ghazni → Zabul",
  "Samangan-Takhar": "Samangan → Baghlan → Kunduz → Takhar",
  "Samangan-Zabul":
    "Samangan → Baghlan → Parwan → Kabul → Maidan Wardak → Ghazni → Zabul",
  "Takhar-Zabul":
    "Takhar → Kunduz → Baghlan → Parwan → Kabul → Maidan Wardak → Ghazni → Zabul",
};

module.exports = {
  PROVINCIAL_CONNECTIONS,
  PROVINCIAL_ROUTES,
};
