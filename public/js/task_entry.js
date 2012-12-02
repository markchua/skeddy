$(document).ready(function() {
  $('#freeform_task').keydown(function() {
    setTimeout(function() {
      parseFreeformTask($('#freeform_task').val());
    }, 50);
  });
});

function parseFreeformTask(freeform) {
  var langTokens = new Array(freeform);
  var remainingTokens = extractTimeEstimate(langTokens);
  remainingTokens = extractTime(remainingTokens);
  remainingTokens = extractLocation(remainingTokens);
  remainingTokens = extractTask(remainingTokens);
  remainingTokens = extractNotes(remainingTokens);
}

function extractTimeEstimate(langTokens) {
  var TIME_EST_REGEX = /((?:\d+(?:\.\d+)?\s?(?:minute|hour)s?\s?){1,2})(.*)/g;

  for (var i = 0; i < langTokens.length; i++) {
    var token = langTokens[i];

    var match = TIME_EST_REGEX.exec(token);
    if (match != null) {
      $("#task_time_estimate").text(convertTimeEstimateStringToMinutesValue(match[1]));
      var leadStrLength = token.length - match[1].length - match[2].length;
      var newTokens = new Array(token.substring(0, leadStrLength), match[2]);
      return splitTokens(langTokens, i, newTokens);
    } else {
      $("#task_time_estimate").text("0");
    }
    return langTokens;
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

function extractTime(remainingTokens) {
  var TIME_REGEX = /(\d{1,2}(?::\d{2})?\s?(?:a\.?m\.?|p\.?m\.?)?)/g;
  var AT_TIME_REGEX = new RegExp("(at\\s)" + TIME_REGEX.source);
  var FULL_TIME_REGEX = new RegExp("()" + TIME_REGEX.source);  // The extra () group ensures our group counts are consistent.
  var FULL_AT_TIME_REGEX = new RegExp(AT_TIME_REGEX.source);

  for (var i = 0; i < remainingTokens.length; i++) {
    var token = remainingTokens[i];

    // If time is specified, discard any "at" preceding the time string if it exists.
    var match = FULL_AT_TIME_REGEX.exec(token);
    if (match == null) {
      match = FULL_TIME_REGEX.exec(token);
    }

    if (match != null) {
      $("#task_time").text(match[2]);
      var tailStrIndex = token.indexOf(match[2]) + match[2].length;
      var tailStrLength = token.length - tailStrIndex;
      var leadStrLength = token.length - match[1].length - match[2].length - tailStrLength;
      var newTokens = new Array(token.substring(0, leadStrLength), token.substring(tailStrIndex));
      return splitTokens(remainingTokens, i, newTokens);
    } else {
      $("#task_time").text("");
    }
  }
  return remainingTokens;
}

function extractLocation(remainingTokens) {
  var LOCATION_REGEX = /(.*)(at\s)([^,;\.]+)/;

  for (var i = 0; i < remainingTokens.length; i++) {
    var token = remainingTokens[i];

    var match = LOCATION_REGEX.exec(token);
    if (match != null) {
      $("#task_location").text(match[3]);
      var newTokens = new Array(match[1], token.substring(match[1].length + match[2].length + match[3].length));
      return splitTokens(remainingTokens, i, newTokens);
    } else {
      $("#task_location").text("");
    }
  }
  return remainingTokens;
}

function extractTask(remainingTokens) {
  if (remainingTokens.length > 0) {
    $("#task_name").text(remainingTokens[0]);
    return remainingTokens.slice(1, remainingTokens.length);
  } else {
    $("#task_name").text("");
    return remainingTokens;
  }
}

function extractNotes(remainingTokens) {
  if (remainingTokens.length > 0) {
    var endIndex = remainingTokens.length - 1;
    var endToken = remainingTokens[endIndex];
    $("#task_notes").text(endToken);
    return remainingTokens.slice(0, endIndex);
  } else {
    $("#task_notes").text("");
    return remainingTokens;
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
