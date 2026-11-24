const r=require('express').Router(),db=require('../db'),path=require('path'),multer=require('multer'),{auth,allow}=require('../middleware');
const up=multer({storage:multer.diskStorage({destination:path.join(__dirname,'../../uploads'),filename:(q,f,cb)=>cb(null,Date.now()+'-'+Math.round(Math.random()*1e9)+path.extname(f.originalname).toLowerCase())}),
limits:{fileSize:5*1024*1024},fileFilter:(q,f,cb)=>cb(null,['image/jpeg','image/png','image/webp'].includes(f.mimetype))});
r.use(auth);
r.post('/',allow('citizen','admin'),up.single('image'),async(q,s,n)=>{try{const {category,description,location_text,latitude,longitude}=q.body;
if(!category||!description||!location_text)return s.status(400).json({message:'Category, description and location required'});
const [x]=await db.query('INSERT INTO complaints(user_id,category,description,location_text,latitude,longitude,image_path) VALUES(?,?,?,?,?,?,?)',
[q.user.user_id,category,description,location_text,latitude||null,longitude||null,q.file?'/uploads/'+q.file.filename:null]);
await db.query('INSERT INTO status_history(complaint_id,changed_by,new_status,note) VALUES(?,?,?,?)',[x.insertId,q.user.user_id,'Submitted','Report created']);
s.status(201).json({complaint_id:x.insertId,message:'Report submitted'});}catch(e){n(e);}});
r.get('/',async(q,s,n)=>{try{let sql='SELECT c.*,u.name reporter_name,(SELECT worker_id FROM assignments a WHERE a.complaint_id=c.complaint_id ORDER BY assignment_id DESC LIMIT 1) worker_id FROM complaints c JOIN users u ON u.user_id=c.user_id',args=[];
if(q.user.role==='citizen'){sql+=' WHERE c.user_id=?';args.push(q.user.user_id);}
if(q.user.role==='worker'){sql+=' JOIN assignments mine ON mine.complaint_id=c.complaint_id WHERE mine.worker_id=? AND mine.assignment_id=(SELECT MAX(a2.assignment_id) FROM assignments a2 WHERE a2.complaint_id=c.complaint_id)';args.push(q.user.user_id);}
sql+=' ORDER BY c.created_at DESC';const [rows]=await db.query(sql,args);s.json({complaints:rows});}catch(e){n(e);}});
r.post('/:id/assign',allow('admin'),async(q,s,n)=>{const c=await db.getConnection();try{await c.beginTransaction();
const [a]=await c.query('SELECT * FROM complaints WHERE complaint_id=? FOR UPDATE',[q.params.id]);
const [w]=await c.query('SELECT user_id FROM users WHERE user_id=? AND role="worker" AND is_active=1',[q.body.worker_id]);
if(!a.length||!w.length){await c.rollback();return s.status(400).json({message:'Report or active worker not found'});}
await c.query('INSERT INTO assignments(complaint_id,worker_id,assigned_by) VALUES(?,?,?)',[q.params.id,q.body.worker_id,q.user.user_id]);
await c.query('UPDATE complaints SET status="Assigned" WHERE complaint_id=?',[q.params.id]);
await c.query('INSERT INTO status_history(complaint_id,changed_by,old_status,new_status,note) VALUES(?,?,?,?,?)',[q.params.id,q.user.user_id,a[0].status,'Assigned','Worker assigned']);
await c.commit();s.json({message:'Worker assigned'});}catch(e){await c.rollback();n(e);}finally{c.release();}});
r.patch('/:id/status',allow('worker','admin'),async(q,s,n)=>{const c=await db.getConnection();try{const {status,note,collected_weight_kg}=q.body;
if(!['In Progress','Resolved','Under Review'].includes(status))return s.status(400).json({message:'Invalid status'});
await c.beginTransaction();const [a]=await c.query('SELECT * FROM complaints WHERE complaint_id=? FOR UPDATE',[q.params.id]);
if(!a.length){await c.rollback();return s.status(404).json({message:'Report not found'});}
if(q.user.role==='worker'){const [ok]=await c.query('SELECT assignment_id FROM assignments WHERE complaint_id=? AND worker_id=? ORDER BY assignment_id DESC LIMIT 1',[q.params.id,q.user.user_id]);if(!ok.length){await c.rollback();return s.status(403).json({message:'Not assigned to you'});}}
await c.query('UPDATE complaints SET status=? WHERE complaint_id=?',[status,q.params.id]);
await c.query('INSERT INTO status_history(complaint_id,changed_by,old_status,new_status,note) VALUES(?,?,?,?,?)',[q.params.id,q.user.user_id,a[0].status,status,note||null]);
if(status==='Resolved'){const [as]=await c.query('SELECT assignment_id FROM assignments WHERE complaint_id=? ORDER BY assignment_id DESC LIMIT 1',[q.params.id]);if(as.length)await c.query('INSERT INTO collections(assignment_id,collected_weight_kg) VALUES(?,?)',[as[0].assignment_id,Number(collected_weight_kg)||0]);}
await c.commit();s.json({message:'Status updated'});}catch(e){await c.rollback();n(e);}finally{c.release();}});
module.exports=r;
