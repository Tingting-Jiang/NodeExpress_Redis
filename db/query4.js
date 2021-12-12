const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

async function createLeaderBoard() {
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
    Query4: Create a leaderboard with the top 10 users with more tweets. 
    Use a sorted set called leaderboard 
    */

    const query = [
      {
        '$group': {
          '_id': '$user.name', 
          'count': {
            '$sum': 1
          }
        }
      }, {
        '$sort': {
          'count': -1
        }
      }, {
        '$limit': 10
      }
    ];
    
    const topUsers = await tweetCollection.aggregate(query).toArray();

    for (const item of topUsers) {
      let name = await item._id;
      let tweetNum = await item.count;

      // await redisClient.sendCommand(["ZADD", "leaderboard", `${tweetNum}`, `${name}`]);
      await redisClient.zAdd("leaderboard", {score: `${tweetNum}`, value: `${name}`});
     
    }

    const result = await redisClient.zRangeWithScores("leaderboard", 0, -1);

    console.log(`The top 10 users are: `);
    console.log(result);



  } finally {

    await mongoClient.close();
    await redisClient.quit();

  }

  
}

createLeaderBoard();

