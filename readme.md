<p align="center">
    <img src="https://cdn2.iconfinder.com/data/icons/interface-icons-line/63/Image-512.png" width="240px" />
</p>

> Generate thumbnails in lambda

## Unit Testing Status
staging | production
--- | ---
![Test](https://github.com/acidjazz/fn-thumb/workflows/Test/badge.svg) | ![Test](https://github.com/acidjazz/fn-thumb/workflows/Test/badge.svg)

## Deployment Status
staging | production
--- | ---
![Deploy](https://github.com/acidjazz/fn-thumb/workflows/Deploy/badge.svg?branch=staging) | ![Deploy](https://github.com/acidjazz/fn-thumb/workflows/Deploy/badge.svg?branch=production)

## Example Usage

```php
$result = Curl::to('https://url-to-function.execute-api.us-east-1.amazonaws.com/fn-thumb')
    ->withData(['bucket' => $bucket, 'key' => $key, 'width' => 1024])
    ->asJson()
    ->get();
dump($result->key); // URL the newly created thumbnail
```

## Parameters
 - __bucket__ *(required)* Bucket name the image is stored in
 - __key__ *(required)* full path filename of the image (bob-31337.jpg)
 - __width__ *(optional, default: 1024)* width of the thumbnail (height will follow the original aspect ratio)
 
## Results
 - __key__ the full path filename of the thumbnail created (bob-31337-thumbnail.jpg)

