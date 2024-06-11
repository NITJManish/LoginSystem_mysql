const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const session = require("express-session")
// const DB = require("./config/connection");
const encoder = bodyParser.urlencoded();

let connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "cointab_database"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Database connected!");
});

const app = express();
app.set('view engine','ejs');
app.set('views','views');
app.use("/assets",express.static("assets"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());

app.use(session({
    secret: 'manish',
    resave: false, // We wont resave the session variable if nothing is changed
    saveUninitialized: false
}))

app.get("/",function(req,res){
    res.render("login",{error:''});
    //res.sendFile(__dirname + "/index.html");
})

app.get("/admin",(req,res)=>{
    res.render("admin");
})

app.get("/register",function(req,res){
    res.render("register");
    //res.sendFile(__dirname + "/index.html");
})


app.get('/data',(req, res) => {
    // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
    let sql = "SELECT username,email FROM usersdata";
    connection.query(sql, (err,rows) => {
        if(err) throw err;
       return res.render('admin', {
            users : rows
        });
    });
});


app.get("/add",(req,res)=>{
    res.render("add");
})

app.post("/save",(req,res)=>{
    const User ={
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      };
// console.log(User);
    //   const newUser = await newUsers.save();
      //var sql="update loginuser set Email_id='"+Email_id+"',Password='"+user.Password+"',AttemptCount='"+user.AttemptCount+"',lastLoginAttemp='"+user.lastLoginAttemp+"',userBlocked='"+user.userBlocked+"' where Email_id='"+ user.Email_id +"'";
      var sql = "insert into usersdata (username, email, password,AttemptCount,lastLoginAttemp,userBlocked) values ('"+User.username+"', '"+User.email+"','"+User.password+"','0','000000','0')";
     // var sql = "insert into userdata (username, email, password) values ('"+User.username+"', '"+User.email+"','"+User.password+"')";
      connection.query(sql,
        function(err, rows) {
            if (err)  throw err;
            res.redirect("/data");
        }
    );
})



app.post("/register",encoder,async (req,res)=>{
    
try{
    const User ={
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      };
// console.log(User);
    //   const newUser = await newUsers.save();
      //var sql="update loginuser set Email_id='"+Email_id+"',Password='"+user.Password+"',AttemptCount='"+user.AttemptCount+"',lastLoginAttemp='"+user.lastLoginAttemp+"',userBlocked='"+user.userBlocked+"' where Email_id='"+ user.Email_id +"'";
      var sql = "insert into usersdata (username, email, password,AttemptCount,lastLoginAttemp,userBlocked) values ('"+User.username+"', '"+User.email+"','"+User.password+"','0','000000','0')";
     // var sql = "insert into userdata (username, email, password) values ('"+User.username+"', '"+User.email+"','"+User.password+"')";
      connection.query(sql,
        function(err, rows) {
            if (err)  throw err;
            console.log("Create a new user successful");
        }
    );
  
      return res.redirect("/");
    } catch (err) {
      console.log(err);
     res.send(err);
    }

})

app.post("/",encoder, function(req,res){
    var email = req.body.email;
    var password = req.body.password;
    
    connection.query("select * from usersdata where email = ?",[email],function(error,results,fields){
        if (results.length > 0) {
            const user = results[0];
            console.log(user);
            if(user.userBlocked == 1){
                const lastLoginAttemp = new Date(user.lastLoginAttemp);
                //console.log(lastLoginAttemp);
                const lastLoginAttempPlus24 = new Date(lastLoginAttemp);
                lastLoginAttempPlus24.setHours(lastLoginAttemp.getHours() + 24);
                if(new Date() <= lastLoginAttempPlus24){
                    console.log("you are blocked for 24 hours");
                    return res.render("login",{error:"Your account is blocked. Please try again after 24 hr"});;
                }
                else{
                    user.AttemptCount = 1;
                user.lastLoginAttemp = new Date().toISOString().slice(0, 19).replace('T',' ');
                user.userBlocked = 0;
                var sql="update usersdata set email='"+email+"',password='"+user.password+"',AttemptCount='"+user.AttemptCount+"',lastLoginAttemp='"+user.lastLoginAttemp+"',userBlocked='"+user.userBlocked+"' where email='"+ user.email +"'";
                
               connection.query(sql,function(err){
                if(err) throw err;
                console.log("login successfully");
               });
                }
               
            }
            
              
            if(user.password === password){
                user.AttemptCount = 1;
                user.lastLoginAttemp = new Date().toISOString().slice(0, 19).replace('T',' ');
                user.userBlocked = 0;
                var sql="update usersdata set email='"+email+"',password='"+user.password+"',AttemptCount='"+user.AttemptCount+"',lastLoginAttemp='"+user.lastLoginAttemp+"',userBlocked='"+user.userBlocked+"' where email='"+ user.email +"'";
                
               connection.query(sql,function(err){
                if(err) throw err;
                console.log("login successfully");
               });

                res.redirect("/Home");

            }else{
                user.AttemptCount = user.AttemptCount + 1;
                user.lastLoginAttemp = new Date().toISOString().slice(0, 19).replace('T',' ');
                user.userBlocked = 0;
                if(user.AttemptCount >= 5){
                    user.userBlocked = 1;
                    var sql="update usersdata set email='"+email+"',password='"+user.password+"',AttemptCount='"+user.AttemptCount+"',lastLoginAttemp='"+user.lastLoginAttemp+"',userBlocked='"+user.userBlocked+"' where email='"+ user.email +"'";
               
                connection.query(sql,function(err){
                    if(err) throw err;
                    console.log(user.email + " cross max limit, blocked for 24 hrs ");
                    
                   });
                   return res.render("login",{error:"cross max limit, blocked for 24 hrs"});
                }
               else{
                 var sql="update usersdata set email='"+email+"',password='"+user.password+"',AttemptCount='"+user.AttemptCount+"',lastLoginAttemp='"+user.lastLoginAttemp+"',userBlocked='"+user.userBlocked+"' where email='"+ user.email +"'";
              
                 connection.query(sql,function(err){
                    if(err) throw err;
                    console.log("user enter " + user.AttemptCount + " Attempt wrong Password");
                    
                   });
                //    res.send("incorrect password");
                   res.render("login",{error:"Incorrect password count : "+user.AttemptCount});
                }

            }
        } else {
            res.redirect("/");
        }
        res.end();
    })
})

// when login is success
app.get("/Home",function(req,res){
    res.render("home");
    //res.sendFile(__dirname + "/Home.html")
})

app.get("/edit/:username",(req,res)=>{
    const userId=req.params.username;
    var sql="select * from usersdata where username='"+userId+"'";
    connection.query(sql,(err,results)=>{
        if(err) throw err;
        res.render('edit',{user:results[0]});
    });
});

app.post("/update/:username",encoder,(req,res)=>{
    let data={username:req.body.username,email:req.body.email,password:req.body.password}
    const userId=req.params.username;
    var sql="update usersdata set username='"+req.body.username+"', email='"+req.body.email+"',password='"+req.body.password+"' where username='"+ userId +"'";
    connection.query(sql,data,(err,results)=>{
        if(err) throw err;
        res.redirect('/data');
    })
})

app.get('/delete/:username',(req,res)=>{
    const user=req.params.username;
    console.log(user);
    var sql="DELETE  from usersdata where username='"+user+"'";
    connection.query(sql,(err,results)=>{
        if(err) throw err;
        res.redirect("/data");
    })
})

app.get('/logout', function(req, res, next) {
    // remove the req.user property and clear the login session
  
    // destroy session data
    req.session = null;
   console.log("logOut Successfully");
    // redirect to homepage
    res.redirect('/');
  });

//   function checkAuthenticated(req, res, next){
//     if(req.body.email){
//         return next()
//     }
//     res.redirect("/login")
// }

// function checkNotAuthenticated(req, res, next){
//     if(req.body.email){
//         return res.redirect("/")
//     }
//     next()
// }


// set app port 
app.listen(4000,function(){
    console.log("server run on port 4000");
});