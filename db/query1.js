const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

async function addTweet() {
  let mongoClient, redisClient;

  try {

    // connect with MongoDB 
    const uri = "mongodb://localhost:27017";

    mongoClient = new MongoClient(uri);

    await mongoClient.connect();
    console.log("Connnected to MongoDB");

    const db = mongoClient.db("TweetsForDB");

    const tweetCollection = db.collection("Tweets");


    // connect with Redis
    redisClient = createClient();

    redisClient.on("error", (err) => 
      console.log("Redis Client Error, ", err));

    await redisClient.connect();
    console.log("Connnected to Redis");

    /*
    Query1: How many tweets are there? 
    Create a tweetCount key that contains the total number of tweets in the database. 
    For this, initialize tweetCount in 0 (SET), then query the tweets collection in 
    Mongo and increase (INCR) tweetCount. Once the query is done, get the last value of 
    tweetCount (GET) and print it in the console with a message that says "There were ### 
    tweets", with ### being the actual number
    */

    //fetch total tweets number from MongoDB

    const number = await tweetCollection.find().count();  

    console.log("The total tweets number in MongoDB is: ", number);


    // set new key in Redis
    await redisClient.set("tweetCount", "0");

    let nextNum;

    for (let i = 0; i < number; i++) {
      nextNum = await redisClient.incr("tweetCount", i);
    }

    console.log(`The nextNum is: ${nextNum}`);

    const result = await redisClient.get("tweetCount");

    console.log(`There were ${result} tweets.`);


  } finally {

    await mongoClient.close();
    await redisClient.quit();

  }

  
}

addTweet();








