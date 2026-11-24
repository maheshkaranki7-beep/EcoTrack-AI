const jwt=require('jsonwebtoken'),db=require('./db');
async function auth(req,res,next){try{
 const h=req.headers.authorization||'',token=h.startsWith('Bearer ')?h.slice(7):null;
 if(!token)return res.status(401).json({message:'Login required'});
 const p=jwt.verify(token,process.env.JWT_SECRET);
 const [r]=await db.query('SELECT user_id,name,email,role,is_active FROM users WHERE user_id=?',[p.user_id]);
 if(!r.length||!r[0].is_active)return res.status(401).json({message:'Account unavailable'});
 req.user=r[0];next();
}catch(e){res.status(401).json({message:'Invalid or expired token'});}}
const allow=(...roles)=>(req,res,next)=>roles.includes(req.user.role)?next():res.status(403).json({message:'Permission denied'});
module.exports={auth,allow};
