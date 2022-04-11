
function convertTZ(date, tzString) {
  return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: tzString }));
}

function getTimeZoneOffset(timeZone) {

  const now = new Date()
  // Abuse the Intl API to get a local ISO 8601 string for a given time zone.
  const options = { timeZone, calendar: 'iso8601', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
  const dateTimeFormat = new Intl.DateTimeFormat(undefined, options);
  const parts = dateTimeFormat.formatToParts(now);
  const map = new Map(parts.map(x => [x.type, x.value]));
  const year = map.get('year');
  const month = map.get('month');
  const day = map.get('day');
  const hour = map.get('hour');
  const minute = map.get('minute');
  const second = map.get('second');
  const ms = now.getMilliseconds().toString().padStart(3, '0');
  const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}`;
  console.log('iso',iso)
  // Lie to the Date object constructor that it's a UTC time.
  const lie = new Date(iso + 'Z')
  console.log('lie',lie)
  // Return the difference in timestamps, as minutes
  // Positive values are West of GMT, opposite of ISO 8601
  // this matches the output of `Date.getTimeZoneOffset`
  return -(lie - now) / 60 / 1000;
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}


function getTimezoneDiffernence(iana_timezone) {

  const current_timezone_offseet = new Date().getTimezoneOffset()
  const shop_timezone_offset = getTimeZoneOffset(iana_timezone)
  console.log('shop_timezone_offset',shop_timezone_offset)
  let timezone_difference = current_timezone_offseet - shop_timezone_offset;
  console.log('timezone_difference',timezone_difference)
  timezone_difference = timezone_difference * Math.sign(timezone_difference);

  return timezone_difference;
}

function getMonthStartForTimezoneDiffenrce(year, month_number, timezone_difference) {

  const month_index = month_number - 1

  const result = new Date(new Date(year, month_index, 1).setMinutes(timezone_difference)).toISOString()
  return result

}

function getMonthEndForTimezoneDiffenrce(year, month_number, timezone_difference) {

  const month_index = month_number - 1

  const result = new Date(new Date(year, month_index + 1, 1).setMinutes(timezone_difference)).toISOString()
  return result

}

function getMonthRangeForTimezoneISOString(year, month_number, iana_timezone) {

  const timezone_difference = getTimezoneDiffernence(iana_timezone)

  const from = getMonthStartForTimezoneDiffenrce(year, month_number, timezone_difference)
  const to = getMonthEndForTimezoneDiffenrce(year, month_number, timezone_difference)
  return { from, to }

}

module.exports = { convertTZ, getTimeZoneOffset, addDays, getTimezoneDiffernence, getMonthRangeForTimezoneISOString }