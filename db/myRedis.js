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
      "userName"]);

    const text = await redisClient.sendCommand(["HGET", `tweet:${tweetID}`, 
      "text"]);

    const favoriteCount = await redisClient.sendCommand(["HGET", `tweet:${tweetID}`, 
      "favoriteCount"]);

    const singleItem = {"_id": tweetID, 
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

    const userName = await redisClient.sendCommand(["HGET", `tweet:${tweetID}`, 
      "userName"]);

    console.log("get user name to delete", userName);

    await redisClient.del(`tweet:${tweetID}`);


    await redisClient.sendCommand(["ZINCRBY", "leaderboard", "-1", `${userName}`]);

    await redisClient.sendCommand(["RPOP", `tweets:${userName}`]);


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

    const oldName = await redisClient.sendCommand(["HGET", `tweet:${tweetID}`, 
      "userName"]);

    const newName = newTweet.userName;


    await redisClient.sendCommand(["HSET", `tweet:${tweetID}`, 
      "userName", `${newName}`,
      "favoriteCount", `${newTweet.favoriteCount}`,
      "text", `${newTweet.text}`
    ]);  


    if (oldName !== newName){

      const oldScore = await redisClient.sendCommand(["ZSCORE", `leaderboard`, `${oldName}`]);


      await redisClient.zAdd("leaderboard", {score: `${oldScore}`, value: `${newName}`});

      await redisClient.sendCommand(["ZREM", "leaderboard",`${oldName}`]);


      await redisClient.sendCommand(["RENAME", `tweets:${oldName}`, `tweets:${newName}`]);

      await redisClient.del(`tweets:${oldName}`);
    }
  



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

      console.log("the latest tweet id is: ", tweetID);


      const userName = await redisClient.sendCommand(["HGET", `tweet:${tweetID[0]}`, 
        "userName"]);

      console.log("user name is", userName);

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







