const moment=require('moment');

exports.formatmessages = (username,text)=>{
    return {
        username,
        text,
        time: moment().format('h:mm a'),
    };
}