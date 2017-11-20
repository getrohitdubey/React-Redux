//1 

.populate({ path: 'comments', select: '_id fname lname photo wing_count city' })


 user.findOne({ userName: req.body.userName, password: req.body.password })
        .select('_id fullName contactNo userName password roles')
        .populate('roles')
        .exec(function (err, user) {}



  roles: [{ type: mongoose.Schema.ObjectId, ref: 'roles' }],