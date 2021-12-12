const { createClient } = require("redis");

async function createTweet(tweet) {
  let redisClient;

  try {

    // connect with Redis
    redisClient = createClient();

    redisClient.on("error", (err) => 
      console.log("Redis Client Error, ", err));

    await redisClient.connect();
    console.log("Connnected to Redis");


    await redisClient.sendCommand(["HSET", `tweet:${tweet._id}`, 
      "userName", `${tweet.userName}`,
      "userScreenName", `${tweet.userScreenName}`,
      "favoriteCount", `${tweet.favoriteCount}`,
      "text", `${tweet.text}`,
      "creaeteAt", `${tweet.created_at}`,
    ]);  

    await redisClient.sendCommand(["ZINCRBY", "leaderboard", "1", `${tweet.userName}`]);

    await redisClient.sendCommand(["RPUSH", `tweets:${tweet.userName}`, `${tweet._id}`]);

  } finally {
    await redisClient.quit();

  }

  
}

    


async function getTweetByID(tweetID) {
  let redisClient;

  try {

    // connect with Redis
    redisClient = createClient();

    redisClient.on("error", (err) => 
      console.log("Redis Client Error, ", err));

    await redisClient.connect();
    console.log("Connnected to Redis");


    const userName = await redisClient.sendCommand(["HGET", `tweet:${tweetID}`, 
      "userScreenName"]);

    const text = await redisClient.sendCommand(["HGET", `tweet:${tweetID}`, 
      "text"]);

    const favoriteCount = await redisClient.sendCommand(["HGET", `tweet:${tweetID}`, 
      "favoriteCount"]);

    const singleItem = {"_id": tweetID[0], 
      "userName": userName, 
      "text": text, 
      "favoriteCount":favoriteCount }; 

    return singleItem; 

  } finally {
    await redisClient.quit();

  }

  
}



async function deleteTweet(tweetID) {
  let redisClient;

  try {

    // connect with Redis
    redisClient = createClient();

    redisClient.on("error", (err) => 
      console.log("Redis Client Error, ", err));

    await redisClient.connect();
    console.log("Connnected to Redis");


    return await redisClient.sendCommand(["HDEL", `tweet:${tweetID}`]);  

  } finally {
    await redisClient.quit();

  }

  
}








async function updateTweet(tweetID, newTweet) {
  let redisClient;

  try {

    // connect with Redis
    redisClient = createClient();

    redisClient.on("error", (err) => 
      console.log("Redis Client Error, ", err));

    await redisClient.connect();
    console.log("Connnected to Redis");


    await redisClient.sendCommand(["HSET", `tweet:${tweetID}`, 
      "userName", `${newTweet.userName}`,
      "favoriteCount", `${newTweet.favoriteCount}`,
      "text", `${newTweet.text}`
    ]);  

  } finally {
    await redisClient.quit();

  }

  
}

async function getTweet() {
  let redisClient;

  try {

    // connect with Redis
    redisClient = createClient();

    redisClient.on("error", (err) => 
      console.log("Redis Client Error, ", err));

    await redisClient.connect();
    console.log("Connnected to Redis");

    const result = await redisClient.zRangeWithScores("leaderboard", 0, -1);
    console.log("top 10 user", result);

    let res = [];
    let singleItem = {};


    for (const item of result) {
      const user = item.value;

      const tweetID = await redisClient.sendCommand(["LRANGE", `tweets:${user}`, "-1", "-1"]);

      // console.log("the latest tweet id is: ", tweetID);


      const userName = await redisClient.sendCommand(["HGET", `tweet:${tweetID[0]}`, 
        "userName"]);

      // console.log("user name is", userName);

      const text = await redisClient.sendCommand(["HGET", `tweet:${tweetID[0]}`, 
        "text"]);

      const favoriteCount = await redisClient.sendCommand(["HGET", `tweet:${tweetID[0]}`, 
        "favoriteCount"]);

      singleItem = {"_id": tweetID[0], 
        "userName": userName, 
        "text": text, 
        "favoriteCount":favoriteCount };

      // console.log("get latest tweets in HASH", singleItem);
      res.push(singleItem);
      singleItem= {};


    }


    return res;


    
  

  } finally {
    await redisClient.quit();

  }

  
}





module.exports.getTweet = getTweet;
module.exports.getTweetByID = getTweetByID;
module.exports.deleteTweet = deleteTweet;
module.exports.updateTweet = updateTweet;
module.exports.createTweet = createTweet;

getTweet();







