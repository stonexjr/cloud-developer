'use strict'

const AWS = require('aws-sdk')

//const docClient = new AWS.DynamoDB.DocumentClient() //for aws-sdk version < 2.365
const docClient = new AWS.DynamoDB(); //new API

const groupsTable = process.env.GROUPS_TABLE

exports.handler = async (event) => {
  console.log('Processing event: ', event)

  const result = await docClient.scan({
    TableName: groupsTable
  }).promise()

  const items = result.Items

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}
