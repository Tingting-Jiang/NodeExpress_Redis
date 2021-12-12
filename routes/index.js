var express = require("express");
var router = express.Router();

const myDB = require("../db/myRedis.js");


/* GET home page. */
router.get("/", async function(req, res) {
  
  const allTweet = await myDB.getTweet();

  // console.log("all tweets", allTweet);
  res.render("index", { allTweet});


});



/* GET tweet details. */
router.get("/tweet/:_id", async function (req, res) {
  console.log("Got tweet details");

  const tweetID = req.params._id;

  console.log("got tweetID ", tweetID);

  const allTweet = await myDB.getTweetByID(tweetID);

  console.log("got tweet by id", allTweet);

  res.render("tweetDetails", {tweet: allTweet});
});


/* POST create tweet. */
router.post("/tweet/create", async function (req, res) {

  console.log("Got post create/tweet");

  const tweet = {
    "_id": Date.now(),
    "userName": req.body.userName, 
    "userScreenName": req.body.userName,
    "text": req.body.text,
    "creaeteAt": new Date().toLocaleString(),
    "favoriteCount": req.body.favoriteCount,
  };

  console.log("got create tweet", tweet);

  await myDB.createTweet(tweet);

  console.log("Tweet created");

  res.redirect("/");
});









/* POST delete tweets. */
router.post("/tweet/delete", async function (req, res) {
  console.log("Got post delete tweet");

  const id = req.body._id;

  console.log("got delete tweet", id);

  await myDB.deleteTweet(id);

  console.log("tweet deleted");

  res.redirect("/");
});


/* POST update tweets. */
router.post("/tweet/:_id", async function (req, res) {
  console.log("Got post update tweet");
  const id = req.body._id;

  const tweet = {
    "userName": req.body.userName,
    "text": req.body.text,
    "favoriteCount": req.body.favoriteCount,
  };

  console.log("got update tweet", tweet);
  console.log("got update id", id);

  await myDB.updateTweet(id, tweet);

  console.log("tweet updated");

  res.redirect("/");
});









module.exports = router;
