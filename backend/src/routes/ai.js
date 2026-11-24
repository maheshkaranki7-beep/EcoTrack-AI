const r=require('express').Router(),{auth}=require('../middleware');r.post('/classify',auth,(q,s)=>s.json({
predicted_class:q.body.category||'Needs review',confidence:null,model_status:'placeholder_not_trained',
message:'No trained model is connected. Confirm the category manually.'}));module.exports=r;
