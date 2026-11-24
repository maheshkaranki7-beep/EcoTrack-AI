const r=require('express').Router(),db=require('../db'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),{auth}=require('../middleware');
r.post('/register',async(q,s,n)=>{try{const {name,email,password}=q.body;if(!name||!email||!password||password.length<8)return s.status(400).json({message:'Name, email and password (8+ chars) required'});
const hash=await bcrypt.hash(password,12);const [x]=await db.query('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)',[name.trim(),email.toLowerCase().trim(),hash,'citizen']);s.status(201).json({user_id:x.insertId,message:'Account created'});
}catch(e){if(e.code==='ER_DUP_ENTRY')return s.status(409).json({message:'Email already registered'});n(e);}});
r.post('/login',async(q,s,n)=>{try{const [a]=await db.query('SELECT * FROM users WHERE email=? AND is_active=1',[String(q.body.email||'').toLowerCase().trim()]);
if(!a.length||!await bcrypt.compare(q.body.password||'',a[0].password_hash))return s.status(401).json({message:'Incorrect email or password'});
const u=a[0],token=jwt.sign({user_id:u.user_id},process.env.JWT_SECRET,{expiresIn:'8h'});s.json({token,user:{user_id:u.user_id,name:u.name,email:u.email,role:u.role}});
}catch(e){n(e);}});
r.get('/me',auth,(q,s)=>s.json({user:q.user}));module.exports=r;
