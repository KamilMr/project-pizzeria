/* global flatpickr */
import { select, settings } from '../settings.js';
import utils from '../utils.js';
import BaseWidget from './BaseWidget.js';



class DatePicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date())); //object to string
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();

  }

  initPlugin(){
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = new Date(utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture));

    /* start plugin */
    flatpickr(thisWidget.dom.input, {
      enableTime: false,
      minTime: '12:00',
      maxTime: '23:59',
      dateFormat: 'Y-m-d',
      minDate: thisWidget.minDate,
      defaultDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      time_24hr: true,
      locale: {
        'firstDayOfWeek': 1 // start week on Monday
      },
      'disable': [
        function(date) {
          // return true to disable
          return (date.getDay() === 1);

        }
      ],
      onChange: function(selectedDates, dateStr){
        thisWidget.value = dateStr;
      },
    });


  }

  parseValue(value){
    return value;
  }

  isValid(){
    return true;
  }

  renderValue(){

  }

}

export default DatePicker;
