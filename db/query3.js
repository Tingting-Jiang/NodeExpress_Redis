const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

async function countUsers() {
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

    // Query3: Compute how many distinct users are there in the dataset. 
    // For this use a set by the screen_name, e.g. screen_names

    const allTweets = await tweetCollection.find().toArray();
    
    let total = 0;

    for (const item of allTweets) {
      let name = await item.user.name;
      let num = await redisClient.SADD("screen_names", name);
      if (num === 1){
        total += 1;
      }
    }


    // const result = await redisClient.sLen("screen_names");

    console.log(`There were ${total} distinct users.`);


  } finally {

    await mongoClient.close();
    await redisClient.quit();

  }

  
}

countUsers();

