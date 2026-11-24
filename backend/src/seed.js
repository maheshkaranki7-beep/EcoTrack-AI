require('dotenv').config();const db=require('./db'),bcrypt=require('bcryptjs');
(async()=>{try{const h=await bcrypt.hash('EcoTrack@123',12);for(const [name,email,role] of [
['Demo Administrator','admin@ecotrack.local','admin'],['Demo Worker','worker@ecotrack.local','worker'],['Demo Citizen','citizen@ecotrack.local','citizen']])
await db.query('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),role=VALUES(role)',[name,email,h,role]);
console.log('Seeded demo users. Password: EcoTrack@123');}catch(e){console.error(e);process.exitCode=1;}finally{await db.end();}})();
