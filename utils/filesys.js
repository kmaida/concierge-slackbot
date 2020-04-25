const fs = require('fs');
const storeFilepath = './concierge.json';

const store = {
  initStore: () => {
    // If store file doesn't exist, create it
    if (fs.existsSync(storeFilepath)) {
      console.log('Local store exists');
    } else {
      fs.writeFile(storeFilepath, '{}', (error) => {
        if (error) {
          console.error('ERROR: Failed to create local store file:', error);
        } else {
          console.log('Local store created successfully');
        }
      });
    }
  },
  getStoreList: () => {
    return JSON.parse(fs.readFileSync(storeFilepath));
  },
  saveAssignment: (channel, assigned) => {
    // Save concierge assignment for channel
    const list = JSON.parse(fs.readFileSync(storeFilepath));
    list[channel] = assigned;
    fs.writeFileSync(storeFilepath, JSON.stringify(list, null, 2));
  },
  getAssignment: (channel) => {
    // Get currently assigned concierge for channel
    const list = JSON.parse(fs.readFileSync(storeFilepath));
    return list[channel];
  },
  clearAssignment: (channel) => {
    const list = JSON.parse(fs.readFileSync(storeFilepath));
    delete list[channel];
    fs.writeFileSync(storeFilepath, JSON.stringify(list, null, 2));
  }
};

module.exports = store;