# Gatsby Plugin Google Drive

## Inspired in
[Gatsby-plugin-drive](https://github.com/fabe/gatsby-plugin-drive)

## How it works?
Given a `folderId` and a set of `credentials`, the plugin will download GoogleDrive contents to your local machine using your own Google Service Account.
The project uses the [GoogleApi for NodeJS](https://github.com/googleapis/google-api-nodejs-client)

For example, if we have an structure like this:
```
-> Folder
  |-> My nested Folder
      |-> My File.pptx
  |-> Another file.docx
```

It will create recursively the same tree structure in your desired `destination`! Just like magic.

## How to use it?
In Gatsby, add to your `gatsby-config.js` file the following:
```js
{
  'resolve': 'gatsby-plugin-googledrive',
  'options': {
    'keyInfo': {
      'email': 'Your service account email',
      'private_key': 'Your service account private key. Often in a `credentials.json` file',
    },
    'exportMime': 'The mime type the exported items should have. Default `application/pdf`',
    'folderId': 'The ID of the Google Drive folder',
    'destination': 'The place in your project where we will create the folder structure'
  }
}
```

> Recommendation: `email` and `private_key` should be environment variables!

## Contributions
The repo is public, so feel free to come up with any MR!
Or, if you have the ideas but not the time, write up an issue! :) 