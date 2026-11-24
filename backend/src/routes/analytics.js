const r=require('express').Router(),db=require('../db'),{auth,allow}=require('../middleware');
r.get('/summary',auth,allow('admin'),async(q,s,n)=>{try{
const [[u]]=await db.query('SELECT COUNT(*) active_users FROM users WHERE is_active=1');
const [[c]]=await db.query(`SELECT COUNT(*) total_reports,SUM(status IN ('Submitted','Under Review','Assigned')) pending,SUM(status='In Progress') in_progress,SUM(status='Resolved') resolved FROM complaints`);
const [categories]=await db.query('SELECT category,COUNT(*) total FROM complaints GROUP BY category');
const [[w]]=await db.query('SELECT COALESCE(SUM(collected_weight_kg),0) collected_kg FROM collections');
s.json({active_users:u.active_users,total_reports:c.total_reports||0,pending:c.pending||0,in_progress:c.in_progress||0,resolved:c.resolved||0,collected_kg:w.collected_kg,categories});
}catch(e){n(e);}});module.exports=r;
