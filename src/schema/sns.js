import AWS from 'aws-sdk';
import Promise from 'bluebird';
import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString
} from 'graphql';

const sns = new Promise.promisifyAll(new AWS.SNS());

const type = new GraphQLObjectType({
  name: 'Topic',
  description: 'Represents an Amazon SNS topic.',
  fields: () => ({
    arn: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The topic arn.',
      resolve: (root) => { return root.TopicArn; }
    }
  })
});

exports.queries = {
  topics: {
    type: new GraphQLList(type),
    args: {
      nextToken: {
        name: 'Next token',
        type: GraphQLString
      }
    },
    resolve: (root, {nextToken}) => {
      return sns.listTopicsAsync({ NextToken: nextToken }).then((result) => {
        return result.Topics;
      });
    }
  }
};

exports.mutations = {
  createTopic: {
    type: type,
    args: {
      name: {
        name: 'name',
        type: new GraphQLNonNull(GraphQLString)
      }
    },
    resolve: (obj, {name}) => {
      return sns.createTopicAsync({ Name: name });
    }
  },
  deleteTopic: {
    type: GraphQLString,
    args: {
      arn: {
        name: 'arn',
        type: new GraphQLNonNull(GraphQLString)
      }
    },
    resolve: (obj, {arn}) => {
      return sns.deleteTopicAsync({ TopicArn: arn }).then((result) => {
        return result.ResponseMetadata.RequestId;
      });
    }
  }
};