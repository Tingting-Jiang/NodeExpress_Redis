const { MongoClient, ObjectId } = require("mongodb");
const { createClient } = require("redis");

async function query5() {
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
    Create a structure that lets you get all the tweets for an specific user. 
    Use lists for each screen_name e.g. a list with key tweets:duto_guerra that 
    points to a list of all the tweet ids for duto_guerra, e.g. [123, 143, 173, 213]. 
    and then a hash that links from tweetid to the tweet information e.g. tweet:123 
    which points to all the tweet attributes (i.e. user_name, text, created_at, etc)
    */

    // extract the unique user object from Tweets collection and 
    // save the result to Users collection

    const queryUser = [
      {
        '$group': {
          '_id': '$user.name', 
          'count': {
            '$sum': 1
          }
        }
      }
    ];

    

    const users = await tweetCollection.aggregate(queryUser).toArray();

    const queryID = [
      {
        '$group': {
          '_id': '$user.name', 
          'originID': {
            '$push': '$$ROOT._id'
          }
        }
      }
    ];


    const userTweets = await tweetCollection.aggregate(queryID).toArray();    

    for (const user of users) {
      let userName = user._id;

      
      for (const single of userTweets) {
        if (single._id === userName) {
          for (let i = 0; i < single.originID.length; i++) {
            redisClient.sendCommand(["RPUSH", `tweets:${userName}`, `${single.originID[i]}`]);
          }
        }

      }

    }


    // add Hash Part

    const queryIDs = [
      {
        '$project': {
          '_id': 1
        }
      }
    ];



    
    const allIDs = await tweetCollection.aggregate(queryIDs).toArray();

    for (const id of allIDs) {
      const tweet = await tweetCollection.find({"_id": ObjectId(id._id)}, {"_id": 0}).toArray();

      await redisClient.sendCommand(["HSET", `tweet:${id._id}`, 
        "userName", `${tweet[0].user.name}`,
        "userScreenName", `${tweet[0].user.screen_name}`,
        "favoriteCount", `${tweet[0].favorite_count}`,
        "text", `${tweet[0].text}`,
        "creaeteAt", `${tweet[0].created_at}`,
      ]);

    }
    console.log("Done!");






  } finally {

    await mongoClient.close();
    await redisClient.quit();

  }

  
}

query5();






