import express from "express";
import bcrypt from "bcrypt";
import ejs from "ejs";
import pg from "pg";
const app=express();
// const user=[]
/*
create table register(
    id serial primary key,
    name varchar(100),
    email varchar(100) not null unique,
    password varchar(50)
) */
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "secrets",
    password: "jkl;'",
    port: 5432,
  });
db.connect();
app.use(express.static("public/css"));
app.use(express.urlencoded({extended:false}))
app.post("/index",async(req,res)=>{
    const name=req.body.name
    const email=req.body.email
    const hash_pass= await bcrypt.hash(req.body.password,10)
    const password=req.body.password
    try  {
        
        /*user.push({
            id:Date.now().toString(),
            name:req.body.name,
            email:req.body.email,
            password:hash_pass
        })*/
        const checkResult = await db.query("SELECT * FROM register WHERE email = $1", [
            email,
          ]);
      
        if (checkResult.rows.length > 0) {
            res.send("Email already exists. Try logging in.");
          } else {
            const result = await db.query(
              "INSERT INTO register (name ,email, password) VALUES ($1, $2, $3)",
              [name,email, password]
            );
             console.log(result);
             res.redirect("/sign_in")}

    } catch (e) {
        console.log(e)
        res.redirect("/index")
        
    }
});
app.post("/sign_in", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
  
    try {
      const result = await db.query("SELECT * FROM register WHERE email = $1", [
        email,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedPassword = user.password;
  
        if (password === storedPassword) {
          res.redirect("/welcome");
        } else {
          res.send("Incorrect Password");
        }
      } else {
        res.send("User not found");
      }
    } catch (err) {
      console.log(err);
      res.redirect("/sign_in")
    }
});

app.get("/index",(req,res)=>{
    res.render("index.ejs")
})
app.get("/sign_in",(req,res)=>{
    res.render("sign_in.ejs")
})
app.get("/welcome",(req,res)=>{
    res.render("welcome.ejs")
})

app.listen(3000,()=>{
    console.log("server on 3000")
})