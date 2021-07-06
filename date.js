module.exports.getDay=getDay;


function getDay()
{

  let today = new Date();
  options ={
    weekday: 'long',
    day:"numeric",
    month:  'long'
  };
  day=today.toLocaleDateString("en-UK",options);
  return day;
}
