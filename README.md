# NodeExpress_Redis


Before run this program:

1. open MongoDB, create a database named" TweetsForDB", create a collection under it named"Tweets"

2. import the "ieeevis2020Tweets.dump" file(in db directory of this git) to MongoDB



To run this program:

open two terminal windows and cd to this file

Terminal 1: 

redis-server

Terminal 2:

npm install

node db/query4.js

node db/query5.js

npm start


TO CREATE:

1. copy one of the user name to the user name input box (the user name must be the same as one of the 10 users' user name!)

2. finish the create part


3. click create button 


4. The tweet num of that user will increase by 1, its' position may a little lower than before, but it will be in the list!


TO UPDATE:

1. click the link at the top of each tweet, you can update its username, fav count and tweet content. 


TO DELETE:

1. click the delete button under every tweet 

2. this piece of tweet will be deleted, and it will show the last latest tweet of that user



