const AWS = require('aws-sdk')
const sharp = require('sharp')

const chai = require('chai')
const expect = chai.expect
const crypto = require('crypto')

const fs = require('fs')

const index = require('./index')

const bucket = '256-files-testing'
const fixture = 'fixtures/image.jpg'
const key = crypto.createHash('md5').update(Math.random().toString()).digest('hex') + '.jpg'

var event = {}, context, result, thumbnail, s3 = new AWS.S3(), width = Math.round(Math.random() * 1000)

describe('Test other methods', () =>

  it('Only allow GET', async () => {
    event.httpMethod = 'POST'
    expect((await index.handler(event, context)).statusCode).to.equal(400)
  })

)

describe('Test missing GET parameters', () => {

  it('No params', async () => {
    event.httpMethod = 'GET'
    expect((await index.handler(event, context)).statusCode).to.equal(400)
  })

  it('No Bucket', async () => {
    event.httpMethod = 'GET'
    event.queryStringParameters = {key: 'no bucket'}
    expect((await index.handler(event, context)).statusCode).to.equal(400)
  })

  it('No key', async () => {
    event.httpMethod = 'GET'
    event.queryStringParameters = {bucket: 'no key'}
    expect((await index.handler(event, context)).statusCode).to.equal(400)
  })

})

describe('Test invalid GET parameters', () => {

  it('Invalid Bucket', async () => {
    event.httpMethod = 'GET'
    event.queryStringParameters = {
      bucket: 'kittyhawk-invalid-bucket',
      key: 'DJI_0929.JPG',
    }
    expect((await index.handler(event, context)).statusCode).to.equal(400)
  })

  it('Invalid key', async () => {
    event.httpMethod = 'GET'
    event.queryStringParameters = {
      bucket: 'kittyhawk-invalid-bucket',
      key: 'DJI_0929.JPG',
    }
    expect((await index.handler(event, context))).to.eql({statusCode: 400, body: 'Invalid Bucket'})
  })

  it('Invalid width', async () => {
    event.httpMethod = 'GET'
    event.queryStringParameters = {
      bucket: 'kittyhawk-invalid-bucket',
      key: 'DJI_0929.JPG',
      width: 'oregon',
    }
    expect((await index.handler(event, context))).to.eql({statusCode: 400, body: 'Invalid Width'})
  })

})

describe('Test thumbnail generation and default width', () => {

  it('Test thumbnail Generation', async () => {

    await s3.putObject({Bucket: bucket, Key: key, Body: fs.readFileSync(fixture) }).promise()

    event.httpMethod = 'GET'
    event.queryStringParameters = {
      bucket: bucket,
      key: key,
    }

    result = (await index.handler(event, context))
    thumbnail = result.key
    expect(result).to.eql({statusCode: 200, message: 'Thumbnail Generated', key: thumbnail})

  }).timeout(20000)

  it('Test Thumbnail Size', async () => {

    image = await s3.getObject({Bucket: bucket, Key: thumbnail}).promise()
    expect((await sharp(image.Body).metadata()).width).to.equal(1024)

  }).timeout(20000)

  it('Cleanup', async () => {
    await s3.deleteObject({Bucket: bucket, Key: key})
    await s3.deleteObject({Bucket: bucket, Key: thumbnail})
  }).timeout(20000)

})

describe(`Test thumbnail generation and dynamic width of ${width}px`, () => {

  it('Test thumbnail Generation', async () => {

    await s3.putObject({Bucket: bucket, Key: key, Body: fs.readFileSync(fixture) }).promise()

    event.httpMethod = 'GET'
    event.queryStringParameters = {
      bucket: bucket,
      key: key,
      width: width,
    }

    result = (await index.handler(event, context))
    thumbnail = result.key
    expect(result).to.eql({statusCode: 200, message: 'Thumbnail Generated', key: thumbnail})

  }).timeout(20000)

  it('Test Thumbnail Size', async () => {

    image = await s3.getObject({Bucket: bucket, Key: thumbnail}).promise()
    expect((await sharp(image.Body).metadata()).width).to.equal(width)

  }).timeout(20000)

  it('Cleanup', async () => {
    await s3.deleteObject({Bucket: bucket, Key: key})
    await s3.deleteObject({Bucket: bucket, Key: thumbnail})
  }).timeout(20000)

})
