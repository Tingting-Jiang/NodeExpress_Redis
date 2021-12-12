const { MongoClient } = require("mongodb");
const { createClient } = require("redis");

async function countFav() {
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


    // Query2: Compute and print the total number of favorites in the dataset. 
    // For this apply the same process as before, query all the tweets, start a 
    // favoritesSum key (SET), increment it by the number of favorites on each tweet 
    // (INCRBY), and then get the value (GET) and print it on the screen.


    // set new key in Redis
    await redisClient.set("favoritesSum", "0");

    const allTweets = await tweetCollection.find().toArray();
    let nextNum;

    for (const item of allTweets){
      let favNum = await item.favorite_count;
      nextNum = await redisClient.incrBy("favoritesSum",favNum);
    }

    console.log(`The nextNum is: ${nextNum}`);

    const result = await redisClient.get("favoritesSum");

    console.log(`There were ${result} favorites.`);


  } finally {

    await mongoClient.close();
    await redisClient.quit();

  }

  
}

countFav();






