const TimeSpan = function (milliseconds) {
    milliseconds = Math.abs(milliseconds);
    var days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    milliseconds -= days * (1000 * 60 * 60 * 24);

    var hours = Math.floor(milliseconds / (1000 * 60 * 60));
    milliseconds -= hours * (1000 * 60 * 60);

    var mins = Math.floor(milliseconds / (1000 * 60));
    milliseconds -= mins * (1000 * 60);

    var seconds = Math.floor(milliseconds / (1000));
    milliseconds -= seconds * (1000);
    return {
        getDays: function () {
            return days;
        },
        getHours: function () {
            return hours;
        },
        getMinuts: function () {
            return mins;
        },
        getSeconds: function () {
            return seconds;
        },
        toString: function () {
            var str = "";
            if (days > 0 ) {
                str += days + " days ";
            }
            if (hours > 0) {
                str += hours + " hours ";
            }
            if (mins > 0 ) {
                str += mins + " mins ";
            }
            if (seconds > 0) {
                str += seconds + " seconds ";
            }
            if (milliseconds > 0) {
                str += milliseconds + " ms";
            }
            return str;
        }
    }
}
module.exports = TimeSpan