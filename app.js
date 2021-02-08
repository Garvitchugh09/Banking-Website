const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));

const User = require('./models/user');
const Transaction = require('./models/transaction');


mongoose.connect("mongodb://localhost:27017/sparkDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set('useFindAndModify', false);
app.get("/", (req, res)=>{
    res.render("index");
});

app.get("/view", function(req, res){
    User.find({},function(err,users){
      if(err){
      console.log(err);
    }
    else{
      res.render("view",{users:users});
    }
    })

});

app.get("/view/:id", async(req, res) =>{
    const { id } = req.params;
    const user = await User.findById(id);
    const users = await User.find({})
    res.render("transfer", {user, users});
});

app.get("/view/:id1/:id2", async(req, res) =>{
    const {id1, id2} = req.params;
    const fromUser = await User.findById(id1);
    const toUser = await User.findById(id2);
    res.render("form", {fromUser, toUser});
});

app.post("/view/:id1/:id2", async(req, res) =>{
    const {id1, id2} = req.params;
    const credit = parseInt(req.body.credit);
    const fromUser = await User.findById(id1);
    const toUser = await User.findById(id2);

    if(credit <= fromUser.credits && credit>0){

        let fromCreditsNew = fromUser.credits - credit;
        let toCreditsNew = parseInt(toUser.credits + credit);
        await User.findByIdAndUpdate(id1, {credits : fromCreditsNew}, { runValidators: true, new: true });
        await User.findByIdAndUpdate(id2, {credits : toCreditsNew}, { runValidators: true, new: true });

        let newTransaction = new Transaction();
        newTransaction.fromName = fromUser.name;
        newTransaction.toName = toUser.name;
        newTransaction.transfer = credit;
        await newTransaction.save();

        res.redirect("/view");
    }
    else{
        res.render('error');
    }
});

app.get("/history", async(req, res)=>{
    const transactions = await Transaction.find({});
    res.render("history", {transactions});
});

app.listen(3000 || process.env.PORT, process.env.IP, ()=>{
    console.log("SERVER STARTED !");
});
