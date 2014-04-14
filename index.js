var util = require('core-util-is');

module.exports = function(stream) {
  // This is just the standard stream.end function
  // with the uncork-on-end code commented out
  stream.end = function(chunk, encoding, cb) {
    var state = this._writableState;

    if (util.isFunction(chunk)) {
      cb = chunk;
      chunk = null;
      encoding = null;
    } else if (util.isFunction(encoding)) {
      cb = encoding;
      encoding = null;
    }

    if (!util.isNullOrUndefined(chunk))
      this.write(chunk, encoding);

    // .end() fully uncorks
    // if (state.corked) {
    //   state.corked = 1;
    //   this.uncork();
    // }

    // ignore unnecessary end() calls.
    if (!state.ending && !state.finished)
      endWritable(this, state, cb);
  };

  return stream;
};

// Have to include all these as well, because they're simply global
// inside the file
function needFinish(stream, state) {
  return (state.ending &&
          state.length === 0 &&
          !state.finished &&
          !state.writing);
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(stream, state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else
      prefinish(stream, state);
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished)
      process.nextTick(cb);
    else
      stream.once('finish', cb);
  }
  state.ended = true;
}