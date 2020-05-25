
const sharp = require('sharp')
const querystring = require('querystring')
const AWS = require('aws-sdk')
const path = require('path')

var query, s3, image, thumbnail, width = 1024

module.exports.handler = async (event, context) => {

  if (!event.httpMethod || event.httpMethod !== 'GET')
    return this.bad('Method not allowed')

  query = event.queryStringParameters

  if (!query) return this.bad('No parameters found')

  if (!query.bucket) return this.bad('No bucket specified')

  if (!query.key) return this.bad('No key specified')

  if (query.width && !Number.isInteger(query.width)) return this.bad('Invalid Width')

  if (query.width && Number.isInteger(query.width)) width = query.width

  s3 = new AWS.S3()

  if (!(await s3.listBuckets().promise()).Buckets.find((b) => b.Name === query.bucket))
    return this.bad('Invalid Bucket')

  try {
    image = await s3.getObject({Bucket: query.bucket, Key: query.key}).promise()
  } catch (error) {
    if (error.message === 'The specified key does not exist.') {
      return this.bad('Invalid Key')
    }
    return this.bad(error.message)
  }

  thumbnail = `${path.basename(query.key, path.extname(query.key))}-thumbnail${path.extname(query.key)}`

  await s3.putObject({
    Bucket: query.bucket,
    Key: thumbnail,
    Body: await sharp(image.Body).resize(width).toBuffer()
  }).promise()

  return {
    statusCode: 200,
    message: 'Thumbnail Generated',
    key: thumbnail,
  }

}

module.exports.bad = (string) => {
  return {
    statusCode: 400,
    body: string,
  }
}
