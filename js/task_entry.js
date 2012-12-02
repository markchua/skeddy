$(document).ready(function() {
  $('#freeform_task').keydown(function() {
    setTimeout(function() {
      parseFreeformTask($('#freeform_task').val());
    }, 50);
  });
});

function parseFreeformTask(freeform) {
  var langTokens = new Array(freeform);
  $("#test1").text(langTokens);
  var remainingTokens = extractTime(langTokens);
  remainingTokens = extractTask(remainingTokens);
  $("#test2").text(remainingTokens);
}

function extractTime(langTokens) {
  var TIME_REGEX = /(\d+\s?(a\.?m\.?|p\.?m\.?))/g;
  var AT_TIME_REGEX = new RegExp("(at\\s)" + TIME_REGEX.source);
  var FULL_TIME_REGEX = new RegExp("(.*)()" + TIME_REGEX.source);  // The extra () group ensures our group counts are consistent.
  var FULL_AT_TIME_REGEX = new RegExp("(.*)" + AT_TIME_REGEX.source);

  for (var i = 0; i < langTokens.length; i++) {
    var token = langTokens[i];

    // If time is specified, discard any "at" preceding the time string if it exists.
    var match = FULL_AT_TIME_REGEX.exec(token);
    if (match == null) {
      match = FULL_TIME_REGEX.exec(token);
    }

    if (match != null) {
      $("#task_time").val(match[3]);
      var newTokens = new Array(match[1], token.substring(match[1].length + match[2].length + match[3].length));
      return splitTokens(langTokens, i, newTokens);
    } else {
      $("#task_time").val("");
    }
  }
  return langTokens;
}

function extractTask(remainingTokens) {
  $("#task_name").val(remainingTokens[0]);
  return remainingTokens.slice(1, remainingTokens.length);
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
  return strText.replace(/^\s+|\s+$/g,'')
}
