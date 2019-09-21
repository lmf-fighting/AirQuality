const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const getDate =date =>{
  //在这里处理传进来的date，然后将处理完的结果返回去 
  //date = this.formatTime(date);
 date =new Date(date.substring(0,date.length-2));
  //在这里把.0去掉


  return date;
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
 

  return [year, month, day].map(formatNumber).join('-')
}

const formatDateHour = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour].map(formatNumber).join('')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  formatDateHour: formatDateHour,
  getDate:getDate
}


