const Concierge = require('./Concierge');

/*------------------
  DATABASE / STORE
------------------*/
const store = {
  /*----
    Get concierge list
  ----*/
  async getStoreList() {
    return Concierge.find({}, (err, concierges) => {
      const arr = [];
      if (err) console.error(err.message);
      concierges.forEach(concierge => {
        arr.push(concierge);
      });
      return arr;
    });
  },
  /*----
    Save user assignment to store
    @Params: channel, usermention to assign
  ----*/
  async saveAssignment(channel, usermention) {
    return Concierge.findOne({ channel: channel }, (err, concierge) => {
      if (err) console.error(err.message);
      if (!concierge) {
        const newConcierge = new Concierge({
          channel: channel,
          assigned: usermention
        });
        newConcierge.save((err) => {
          if (err) console.error(err.message);
          return newConcierge;
        });
      } else {
        concierge.assigned = usermention;
        concierge.save((err) => {
          if (err) console.error(err.message);
          return concierge;
        });
      }
    });
  },
  /*----
    Get concierge object for a specific channel
    @Params: channel
    @Returns: concierge object
  ----*/
  async getConcierge(channel) {
    return Concierge.findOne({ channel: channel }, (err, concierge) => {
      if (err) console.error(err.message);
      return concierge;
    });
  },
  /*----
    Deletes a concierge entirely
    @Params: channel
  ----*/
  async clearAssignment(channel) {
    return Concierge.findOne({ channel: channel }, (err, concierge) => {
      if (err) console.error(err.message);
      concierge.remove(err => {
        if (err) console.error(err.message);
      });
    });
  }
};

module.exports = store;