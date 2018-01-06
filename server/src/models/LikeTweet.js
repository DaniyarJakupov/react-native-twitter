/* @flow */
import mongoose, { Schema } from 'mongoose';
import Tweet from './Tweet';

const LikeTweetSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  tweets: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Tweet',
    },
  ],
});

LikeTweetSchema.index({ userId: 1 }, { unique: true });

LikeTweetSchema.methods = {
  async userLikedTweet(tweetId) {
    if (this.tweets.some(tweet => tweet.equals(tweetId))) {
      this.tweets.pull(tweetId); // remove tweet from LikeTweet collection
      await this.save();

      const tweet = await Tweet.decrementLikeCount(tweetId);
      const t = tweet.toJSON();

      return {
        isLiked: false,
        ...t,
      };
    }

    const tweet = await Tweet.incrementLikeCount(tweetId);
    const t = tweet.toJSON();

    this.tweets.push(tweetId); // add tweet to LikeTweet collection
    await this.save();

    return {
      isLiked: true,
      ...t,
    };
  },
};

export default mongoose.model('LikeTweet', LikeTweetSchema);
