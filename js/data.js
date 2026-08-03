/* ============================================================
   data.js  –  Seed data & Mass Reading content
   ============================================================ */

const HOSTELS_SEED = [
  { id: 1, name: "Sunrise Hostel",   location: "Off-campus, Gate 2", type: "male",   price: 75000,  rooms: 30, vacant: 8,  amenities: ["WiFi","Water","Security","Generator"], contact: "08012345678", emoji: "🏠", gradient: "linear-gradient(135deg,#1e3a5f,#2563eb)" },
  { id: 2, name: "Grace Court",      location: "Off-campus, Gate 1", type: "female", price: 85000,  rooms: 25, vacant: 3,  amenities: ["WiFi","Water","CCTV","Kitchen"],       contact: "08023456789", emoji: "🏡", gradient: "linear-gradient(135deg,#4a0d67,#7c3aed)" },
  { id: 3, name: "Unity Hall",       location: "On-campus, Block C", type: "mixed",  price: 45000,  rooms: 60, vacant: 15, amenities: ["Water","Security"],                    contact: "08034567890", emoji: "🏢", gradient: "linear-gradient(135deg,#064e3b,#059669)" },
  { id: 4, name: "Royal Suites",     location: "Off-campus, Gate 3", type: "male",   price: 120000, rooms: 20, vacant: 2,  amenities: ["WiFi","Water","Security","Generator","AC","Kitchen"], contact: "08045678901", emoji: "🏰", gradient: "linear-gradient(135deg,#431407,#ea580c)" },
  { id: 5, name: "Peace Gardens",    location: "Off-campus, Gate 1", type: "female", price: 95000,  rooms: 18, vacant: 6,  amenities: ["WiFi","Water","CCTV","Generator"],     contact: "08056789012", emoji: "🌸", gradient: "linear-gradient(135deg,#831843,#ec4899)" },
  { id: 6, name: "Scholar's Inn",    location: "Off-campus, Gate 4", type: "mixed",  price: 60000,  rooms: 40, vacant: 12, amenities: ["WiFi","Water","Security"],              contact: "08067890123", emoji: "📚", gradient: "linear-gradient(135deg,#1e3a5f,#0891b2)" },
  { id: 7, name: "Emerald Lodge",    location: "On-campus, Block A", type: "male",   price: 50000,  rooms: 35, vacant: 0,  amenities: ["Water","Security","Generator"],         contact: "08078901234", emoji: "💎", gradient: "linear-gradient(135deg,#14532d,#16a34a)" },
  { id: 8, name: "Covenant Hostel",  location: "Off-campus, Gate 2", type: "female", price: 70000,  rooms: 22, vacant: 4,  amenities: ["WiFi","Water","CCTV","Kitchen"],        contact: "08089012345", emoji: "✨", gradient: "linear-gradient(135deg,#312e81,#6366f1)" },
];

const REFERRALS_SEED = [
  { id: 1, studentName: "Chukwuemeka Obi",  hostelId: 1, hostelName: "Sunrise Hostel",  date: "2026-07-28", status: "success",  contact: "08011110001", notes: "" },
  { id: 2, studentName: "Adaeze Nwosu",     hostelId: 2, hostelName: "Grace Court",      date: "2026-07-30", status: "pending",  contact: "08022220002", notes: "Awaiting confirmation" },
  { id: 3, studentName: "Tunde Adeyemi",    hostelId: 4, hostelName: "Royal Suites",     date: "2026-07-31", status: "success",  contact: "08033330003", notes: "" },
  { id: 4, studentName: "Fatima Ibrahim",   hostelId: 5, hostelName: "Peace Gardens",    date: "2026-08-01", status: "pending",  contact: "08044440004", notes: "" },
  { id: 5, studentName: "Emeka Eze",        hostelId: 3, hostelName: "Unity Hall",       date: "2026-08-02", status: "failed",   contact: "08055550005", notes: "No vacancy" },
  { id: 6, studentName: "Ngozi Uchenna",    hostelId: 6, hostelName: "Scholar's Inn",    date: "2026-08-02", status: "success",  contact: "08066660006", notes: "" },
  { id: 7, studentName: "Bello Muhammad",   hostelId: 1, hostelName: "Sunrise Hostel",   date: "2026-08-03", status: "pending",  contact: "08077770007", notes: "Needs male room" },
];

const STUDENTS_SEED = [
  { id: 1, firstName: "Chukwuemeka", lastName: "Obi",      email: "c.obi@uni.edu",       phone: "08011110001", matric: "CST/2024/001", department: "Computer Science",  level: "300", hostelId: 1, hostelName: "Sunrise Hostel",  address: "10 Aba Road, Port Harcourt" },
  { id: 2, firstName: "Adaeze",      lastName: "Nwosu",    email: "a.nwosu@uni.edu",     phone: "08022220002", matric: "ENG/2024/045", department: "Civil Engineering", level: "200", hostelId: 2, hostelName: "Grace Court",      address: "5 Enugu Street, Nsukka" },
  { id: 3, firstName: "Tunde",       lastName: "Adeyemi",  email: "t.adeyemi@uni.edu",   phone: "08033330003", matric: "MED/2023/012", department: "Medicine",          level: "400", hostelId: 4, hostelName: "Royal Suites",     address: "22 Ibadan Road, Oyo" },
  { id: 4, firstName: "Fatima",      lastName: "Ibrahim",  email: "f.ibrahim@uni.edu",   phone: "08044440004", matric: "LAW/2025/008", department: "Law",               level: "100", hostelId: 5, hostelName: "Peace Gardens",    address: "8 Kano Street, Kaduna" },
  { id: 5, firstName: "Ngozi",       lastName: "Uchenna",  email: "n.uchenna@uni.edu",   phone: "08066660006", matric: "ACC/2023/030", department: "Accountancy",       level: "300", hostelId: 6, hostelName: "Scholar's Inn",    address: "3 Onitsha Road, Anambra" },
];

/* ------- Daily Mass Readings (sample for 14 days from Aug 1 2026) ------- */
const MASS_READINGS = {
  "2026-08-01": {
    liturgicalDay: "Saturday of the 17th Week in Ordinary Time",
    firstReading: { ref: "Jeremiah 26:11-16, 24", text: "Thus says the LORD: 'I am in your hands; do with me whatever you consider right and just. But make no mistake: if you put me to death, it is innocent blood you bring on yourselves...' " },
    psalm: { ref: "Psalm 69:15-16,30-31,33-34", text: "R/ Lord, in your great love, answer me. I will praise the name of God in song, and I will glorify him with thanksgiving..." },
    gospel: { ref: "Matthew 14:1-12", text: "At that time Herod the tetrarch heard of the reputation of Jesus and said to his servants, 'This man is John the Baptist. He has been raised from the dead...' " }
  },
  "2026-08-02": {
    liturgicalDay: "18th Sunday in Ordinary Time",
    firstReading: { ref: "Exodus 16:2-4, 12-15", text: "The whole Israelite community grumbled against Moses and Aaron. The LORD said to Moses, 'I will now rain down bread from heaven for you...' " },
    psalm: { ref: "Psalm 78:3-4,23-25,54", text: "R/ The Lord gave them bread from heaven. The things we have heard and know, the things our ancestors have told us, we shall tell to the next generation..." },
    gospel: { ref: "John 6:24-35", text: "When the crowd saw that neither Jesus nor his disciples were there, they themselves got into boats and came to Capernaum looking for Jesus... Jesus said to them, 'I am the bread of life; whoever comes to me will never hunger...' " }
  },
  "2026-08-03": {
    liturgicalDay: "Monday of the 18th Week in Ordinary Time",
    firstReading: { ref: "Numbers 11:4-15", text: "The children of Israel lamented, 'Would that we had meat for food! We remember the fish we used to eat...' Moses heard the people weeping throughout their clans... He said to the LORD, 'Why do you treat your servant so badly?' " },
    psalm: { ref: "Psalm 81:12-17", text: "R/ Do not forget the works of the Lord! If only my people would listen to me, Israel walk in my ways, I would feed them with the finest wheat..." },
    gospel: { ref: "Matthew 14:13-21", text: "When Jesus heard of the death of John the Baptist, he withdrew in a boat to a deserted place by himself... When it was evening, the disciples approached him and said, 'Dismiss the crowds.' Jesus replied, 'There is no need for them to go away; give them some food yourselves.' He took the five loaves and the two fish, looked up to heaven, blessed, broke, and gave the loaves to the disciples, who in turn gave them to the crowds." }
  },
  "2026-08-04": {
    liturgicalDay: "Feast of Saint John Vianney, Patron of Parish Priests",
    firstReading: { ref: "Ezekiel 3:17-21", text: "Thus says the Lord GOD: You, son of man, I have appointed watchman for the house of Israel; when you hear me say anything, you shall warn them for me..." },
    psalm: { ref: "Psalm 117:1-2", text: "R/ Go out to all the world and tell the Good News. Praise the LORD, all you nations; glorify him, all you peoples! For steadfast is his kindness toward us..." },
    gospel: { ref: "Matthew 16:13-19", text: "When Jesus went into the region of Caesarea Philippi he asked his disciples, 'Who do people say that the Son of Man is?' Simon Peter said in reply, 'You are the Christ, the Son of the living God.' Jesus said to him, 'Blessed are you, Simon son of Jonah. For flesh and blood has not revealed this to you, but my heavenly Father.' " }
  },
  "2026-08-05": {
    liturgicalDay: "Wednesday of the 18th Week in Ordinary Time",
    firstReading: { ref: "Numbers 13:1-2, 25-14:1, 26-29, 34-35", text: "The LORD said to Moses, 'Send men to reconnoiter the land of Canaan...' After forty days they returned from scouting the land... Moses and Aaron fell prostrate before the whole assembled community of the Israelites." },
    psalm: { ref: "Psalm 106:6-7, 13-14, 21-22, 23", text: "R/ Remember us, O Lord, as you favor your people. We have sinned, we and our fathers; we have committed crimes, we have done wrong..." },
    gospel: { ref: "Matthew 15:21-28", text: "At that time Jesus withdrew to the region of Tyre and Sidon. And behold, a Canaanite woman of that district came and called out, 'Have pity on me, Lord, Son of David! My daughter is tormented by a demon.' Jesus said to her, 'O woman, great is your faith! Let it be done for you as you wish.' " }
  },
  "2026-08-06": {
    liturgicalDay: "Feast of the Transfiguration of the Lord",
    firstReading: { ref: "Daniel 7:9-10, 13-14", text: "As I watched, thrones were set up and the Ancient of Days took his throne. His clothing was snow bright, and the hair on his head as white as wool; his throne was flames of fire... One like a son of man coming on the clouds of heaven... He received dominion, glory, and kingship..." },
    psalm: { ref: "Psalm 97:1-2, 5-6, 9", text: "R/ The Lord is king, the most high over all the earth. The LORD is king; let the earth rejoice; let the many islands be glad. Justice and judgment are the foundation of his throne..." },
    gospel: { ref: "Luke 9:28b-36", text: "Jesus took Peter, John, and James and went up the mountain to pray. While he was praying his face changed in appearance and his clothing became dazzling white. And behold, two men were conversing with him, Moses and Elijah... A voice came from the cloud saying, 'This is my chosen Son; listen to him.' " }
  },
  "2026-08-07": {
    liturgicalDay: "Friday of the 18th Week in Ordinary Time",
    firstReading: { ref: "Deuteronomy 4:32-40", text: "Moses said to the people: 'Ask now of the days of old, before your time, ever since God created man upon the earth; ask from one end of the sky to the other: Did anything so great ever happen before? Was it ever heard of? Did a people ever hear the voice of God speaking from the midst of fire, as you did, and live?' " },
    psalm: { ref: "Psalm 77:12-16, 21", text: "R/ Your way, O God, is holy. I shall remember the deeds of the LORD; yes, your wonders of old I shall remember. I shall meditate on all your works and muse on your exploits..." },
    gospel: { ref: "Matthew 16:24-28", text: "Jesus said to his disciples, 'Whoever wishes to come after me must deny himself, take up his cross, and follow me. For whoever wishes to save his life will lose it, but whoever loses his life for my sake will find it.' " }
  },
  "2026-08-08": {
    liturgicalDay: "Feast of Saint Dominic",
    firstReading: { ref: "Hosea 2:16-17, 21-22", text: "Thus says the LORD: I will lead her into the desert and speak to her heart... I will espouse you to me forever: I will espouse you in right and in justice, in love and in mercy; I will espouse you in fidelity, and you shall know the LORD." },
    psalm: { ref: "Psalm 45:11-12, 16-17", text: "R/ Listen to me, daughter; see and bend your ear. The king shall desire your beauty; for he is your lord. They are borne in with gladness and joy..." },
    gospel: { ref: "Matthew 9:35-10:1", text: "Jesus went around to all the towns and villages, teaching in their synagogues, proclaiming the Gospel of the Kingdom, and curing every disease and illness. At the sight of the crowds, his heart was moved with pity for them because they were troubled and abandoned, like sheep without a shepherd." }
  },
};

const NOTIFICATIONS_SEED = [
  { id: 1, icon: "🏨", title: "New Hostel Added", msg: "Royal Suites has been listed with 2 vacant rooms.", time: "5 mins ago", read: false },
  { id: 2, icon: "🔗", title: "Referral Accepted", msg: "Your referral for Tunde Adeyemi to Royal Suites was confirmed.", time: "2 hrs ago", read: false },
  { id: 3, icon: "📖", title: "Daily Reading Available", msg: "Today's Mass reading for Aug 3 is now available.", time: "6 hrs ago", read: false },
  { id: 4, icon: "👤", title: "New Student Registered", msg: "Ngozi Uchenna has been successfully registered.", time: "Yesterday", read: true },
  { id: 5, icon: "⚠️", title: "Low Vacancy Alert", msg: "Royal Suites has only 2 rooms left.", time: "Yesterday", read: true },
  { id: 6, icon: "✅", title: "Referral Confirmed", msg: "Chukwuemeka Obi's referral to Sunrise Hostel was successful.", time: "2 days ago", read: true },
];

/* Utility: generate today's date string */
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

/* Get reading for a date, fallback to Aug 3 */
function getReading(dateStr) {
  return MASS_READINGS[dateStr] || MASS_READINGS["2026-08-03"];
}
