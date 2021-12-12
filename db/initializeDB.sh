#!/bin/bash

mongoimport -h localhost:27017 -d TweetsForDB -c Tweets --file ieeevis2020Tweets.dump