const express=require("express");
const app=express();
const mongoose = require('mongoose');
const port=process.env.PORT || 3000;
var _ = require('lodash');

const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
mongoose.connect('mongodb+srv://admin-adi:yolo@cluster0.2pnwv.mongodb.net/toDoListDB', {useNewUrlParser: true, useUnifiedTopology: true});

const date=require(__dirname+"/date.js");

app.set('view engine', 'ejs');

app.use(express.static("public"));

//let items=[];
let workItems=[];


//DATABASE

const toDoListSchema=new mongoose.Schema({
  "Item" : String
});

const toDo=mongoose.model("toDo",toDoListSchema);//'toDo' is the name of the collection

const item1 =new toDo({
  Item  : "Welcome to Today"
});

const item2 =new toDo({
  Item  : "Hit the + button to add activities to your day"
});

const item3 =new toDo({
  Item  : "<--Hit this to delete"
});

const defaultItems=[item1,item2,item3];

const listSchema={
  "Name":String,
  "items":[toDoListSchema]
};

const List=mongoose.model("List",listSchema);//'List' is the name of the collection


//home route
app.get("/",function(req,res){

  toDo.find({},function(err,foundItems){
    if(err)
    {
      console.log(err);
    }
    else
    {
      if(foundItems.length===0){
        toDo.insertMany(defaultItems,function(err){
          if(err)
          {
            console.log(err);
          }
          else
          {
            console.log("Successful!");
          }
        });
        res.redirect("/");
      }
      else
      {res.render('list', {listTitle: "Today",itemList: foundItems});}
    }
  });


});

//dynamic route
app.get('/:pageId', function (req, res) {
  let customListName=_.capitalize(req.params.pageId);


  List.findOne({ Name: customListName }, function (err, foundList) {
    if(!err){

      if(!foundList){
        const list =new List({
          Name: customListName,
          items:defaultItems
        });

        list.save();
        res.redirect('/'+customListName);
      }else{

        res.render('list', {listTitle: foundList.Name,itemList: foundList.items});

      }

    }

  });

});



//

app.post("/",function(req,res){

  let itemName=req.body.newTask;
  let listName=req.body.list;
console.log(listName);
  const item =new toDo({
    Item  : itemName
  });

 if(listName==="Today"){
     item.save();
     res.redirect("/");
 }else{
   List.findOne({Name:listName},function(err,foundList){
     foundList.items.push(item);
     console.log(foundList.items);
     foundList.save();
     res.redirect("/"+listName);
   });
 }

});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.cBox;
  const listName=req.body.listName;

  if(listName==="Today"){

    toDo.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
          console.log("Checked item removed");
          res.redirect('/');
        }
    });

  }else{
     List.findOneAndUpdate({Name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
       if(!err){
         res.redirect("/"+listName);
       }
     });
  }




});

// //work route
// app.get("/work",function(req,res){
//     res.render('list',{listTitle:"WORK LIST ",itemList:workItems });
// });

app.listen(port,function(){
  console.log(`App listening at http://localhost:${port}`)
});
