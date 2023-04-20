//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
var workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-robin:Robin8437@cluster0.l2rg4kk.mongodb.net/todolistDB");

const itemsSchema = mongoose.Schema({name : String });
const Item = mongoose.model("item", itemsSchema);
const item1 = new Item({name : "Welcome to your ToDoList"});
const item2 = new Item({name : "Hit the + button to add a new item"});
const item3 = new Item({name : "<-- Hit this button to delete an item"});
const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({name: String, items: [itemsSchema]});
const List = mongoose.model("lists", listSchema);


app.get("/", function(req, res) {

  Item.find({}).then((foundItems) => {    
    if(foundItems.length === 0){
      Item.insertMany(defaultItems);
      res.redirect("/");
    }
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else {
    // Alternate method
    // list.findOne({name: listName}).then((result) => {
    //   result.items.push(item);
    //   result.save();
    // })
    List.findOneAndUpdate({name: listName},{$addToSet: {items: {name: itemName}}}).then();
    res.redirect("/" + listName);
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  Item.findByIdAndRemove(checkedItemId).then((del) => {
    if(del){
      res.redirect("/");
    }
    else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then();
      res.redirect("/" + listName);
    }
  });
});

app.get("/:customListname", function(req, res){
  const customListname = _.capitalize(_.lowerCase(req.params.customListname));
  List.findOne({name: customListname}).then((result) => {
    if(result){
      res.render("list", {listTitle: result.name, newListItems: result.items});
    }
    else {
      const list = new List({name: customListname, items: defaultItems});
      list.save();
      res.redirect("/" + customListname);
    }
  })
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: ""});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
