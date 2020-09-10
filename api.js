const { google } = require('googleapis')

class GoogleApi {
  auth = null;
  email = ''
  privateKey = ''
  logger = console
  drive = null;

  constructor(email, privateKey) {
    this.email = email;
    this.privateKey = privateKey
  }

  setAuth() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: this.email,
        private_key: this.privateKey
      },
      scopes: ['https://www.googleapis.com/auth/drive'] // get full access to drive
    });

    this.drive = google.drive({ version: 'v3', auth: this.auth })
  }

  async getFolderFiles(id, pageToken) {
    try {
      const res = await this.drive.files.list({
        q: `'${id}' in parents`,
        pageSize: 1000, // the max
        pageToken: pageToken // undefined for first page
      });

      if (res.data.incompleteSearch) {
        return [...res.data.files, ...getFolderFiles(id, res.data.nextPageToken)]
      }
      return res.data.files;
    } catch(e) {
      this.logger.error('Cannot perform files list: ', e);
      return [];
    }
  }

  async getFile(id) {
    try {
      const res = await this.drive.files.get({ fileId: id, alt: 'media' });
      
      return res.data;
    } catch(e) {
      this.logger.error('Cannot get file: ', e);
      return {};
    }
  }

  async exportDoc(id, mimeType) {
    try {
      const res = await this.drive.files.export({
        fileId: id,
        fields: '*',
        mimeType,
      }, { responseType: 'arraybuffer' });
  
      return Buffer.from(res.data);
    } catch(e) {
      this.logger.error('Cannot export Google Doc: ', e)
    }
  }
}

module.exports = GoogleApi