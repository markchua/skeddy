$(document).ready(function() {
  $('#freeform_task').keydown(function() {
    setTimeout(function() {
      var parseObj = parseFreeformTask($('#freeform_task').val());
      $("#task_name").text(parseObj.taskName);
      $("#task_location").text(parseObj.taskLocation);
      $("#task_time").text(parseObj.taskTime);
      $("#task_time_estimate").text(parseObj.taskTimeEstimate);
      $("#task_notes").text(parseObj.taskNotes);
    }, 50);
  });
});

function parseFreeformTask(freeform) {
  var parseObj = {
    'langTokens':       new Array(freeform),
    'remainingTokens':  new Array(freeform),
    'taskName':         '',
    'taskLocation':     '',
    'taskTime':         '',
    'taskTimeEstimate': 0,
    'taskNotes':        ''
  };

  parseObj = extractTimeEstimate(parseObj);
  parseObj = extractTime(parseObj);
  parseObj = extractLocation(parseObj);
  parseObj = extractTask(parseObj);
  parseObj = extractNotes(parseObj);

  return parseObj;
}

function extractTimeEstimate(parseObj) {
  var TIME_EST_REGEX = /((?:\d+(?:\.\d+)?\s?(?:minute|hour)s?\s?){1,2})(.*)/g;

  var langTokens = parseObj.langTokens;
  for (var i = 0; i < langTokens.length; i++) {
    var token = langTokens[i];

    var match = TIME_EST_REGEX.exec(token);
    if (match != null) {
      parseObj.taskTimeEstimate = convertTimeEstimateStringToMinutesValue(match[1]);
      var leadStrLength = token.length - match[1].length - match[2].length;
      var newTokens = new Array(token.substring(0, leadStrLength), match[2]);
      parseObj.remainingTokens = splitTokens(langTokens, i, newTokens);
      return parseObj;
    } else {
      parseObj.taskTimeEstimate = 0;
    }
    return parseObj;
  }
}

function convertTimeEstimateStringToMinutesValue(timeStr) {
  var HOURS_MINUTES_REGEX = /(?:(\d+(?:\.\d+)?)\s?hours?\s?)?(?:(\d+)\s?minutes?)?/g;
  var match = HOURS_MINUTES_REGEX.exec(timeStr);
  var minutes = 0;
  if (match != null) {
    if (match[1] != null) {
      minutes += Math.round(parseFloat(match[1]) * 60);
    }
    if (match[2] != null) {
      minutes += parseInt(match[2]);
    }
  }
  return minutes;
}

function extractTime(parseObj) {
  var TIME_REGEX = /(\d{1,2}(?::\d{2})?\s?(?:a\.?m\.?|p\.?m\.?)?)/g;
  var AT_TIME_REGEX = new RegExp("(at\\s)" + TIME_REGEX.source);
  var FULL_TIME_REGEX = new RegExp("()" + TIME_REGEX.source);  // The extra () group ensures our group counts are consistent.
  var FULL_AT_TIME_REGEX = new RegExp(AT_TIME_REGEX.source);

  var remainingTokens = parseObj.remainingTokens;
  for (var i = 0; i < remainingTokens.length; i++) {
    var token = remainingTokens[i];

    // If time is specified, discard any "at" preceding the time string if it exists.
    var match = FULL_AT_TIME_REGEX.exec(token);
    if (match == null) {
      match = FULL_TIME_REGEX.exec(token);
    }

    if (match != null) {
      parseObj.taskTime = match[2];
      var tailStrIndex = token.indexOf(match[2]) + match[2].length;
      var tailStrLength = token.length - tailStrIndex;
      var leadStrLength = token.length - match[1].length - match[2].length - tailStrLength;
      var newTokens = new Array(token.substring(0, leadStrLength), token.substring(tailStrIndex));
      parseObj.remainingTokens = splitTokens(remainingTokens, i, newTokens);
      return parseObj;
    } else {
      parseObj.taskTime = "";
    }
  }
  return parseObj;
}

function extractLocation(parseObj) {
  var LOCATION_REGEX = /(.*)(at\s)([^,;\.]+)/;

  var remainingTokens = parseObj.remainingTokens;
  for (var i = 0; i < remainingTokens.length; i++) {
    var token = remainingTokens[i];

    var match = LOCATION_REGEX.exec(token);
    if (match != null) {
      parseObj.taskLocation = match[3];
      var newTokens = new Array(match[1], token.substring(match[1].length + match[2].length + match[3].length));
      parseObj.remainingTokens = splitTokens(remainingTokens, i, newTokens);
      return parseObj;
    } else {
      parseObj.taskLocation = "";
    }
  }
  return parseObj;
}

function extractTask(parseObj) {
  var remainingTokens = parseObj.remainingTokens;
  if (remainingTokens.length > 0) {
    parseObj.taskName = remainingTokens[0];
    parseObj.remainingTokens = remainingTokens.slice(1, remainingTokens.length);
    return parseObj;
  } else {
    parseObj.taskName = "";
    return parseObj;
  }
}

function extractNotes(parseObj) {
  var remainingTokens = parseObj.remainingTokens;
  if (remainingTokens.length > 0) {
    var endIndex = remainingTokens.length - 1;
    var endToken = remainingTokens[endIndex];
    parseObj.taskNotes = endToken;
    parseObj.remainingTokens = remainingTokens.slice(0, endIndex);
    return parseObj;
  } else {
    parseObj.taskNotes = "";
    return parseObj;
  }
}

function splitTokens(oldTokens, at, newTokens) {
  var result = new Array();

  // Add all old tokens BEFORE the split point to the result array.
  for (var i = 0; i < at; i++) {
    result.push(oldTokens[i]);
  }

  // Add replacement tokens to the result array.
  if (newTokens != null) {
    for (var i = 0; i < newTokens.length; i++) {
      var token = trim(newTokens[i]);
      if (token.length > 0) {
        result.push(token);
      }
    }
  }

  // Add all old tokens AFTER the split point to the result array.
  for (var i = at + 1; i < oldTokens.length; i++) {
    result.push(oldTokens[i]);
  }

  return result;
}

function trim(strText) {
  var result = trimWhitespace(strText);
  result = trimPunctuation(result);
  return trimWhitespace(result);
}

function trimPunctuation(strText) {
  return strText.replace(/^[,;\.]|[,;\.]$/g, "");
}

function trimWhitespace(strText) {
  return strText.replace(/^\s+|\s+$/g, "");
}
